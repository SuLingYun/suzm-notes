---
title: WAF 防护实践
description: 涵盖 ModSecurity 配置、OWASP 核心规则集部署、CC 攻击防护策略、IP 黑白名单管理以及 WAF 性能调优实践。
date: 2026-07-08
tags:
  - WAF
  - ModSecurity
  - OWASP
  - CC 攻击防护
  - Web 安全
---

# WAF 防护实践

## 1. ModSecurity 配置

### 1.1 安装 ModSecurity

#### Nginx + ModSecurity（编译安装）

```bash
# 安装依赖
yum install -y pcre-devel libxml2-devel curl-devel openssl-devel yajl-devel

# 克隆 ModSecurity 源码
git clone --depth 1 -b v3/master https://github.com/SpiderLabs/ModSecurity
cd ModSecurity
git submodule init
git submodule update
./build.sh
./configure
make && make install
```

#### Nginx ModSecurity 连接器

```bash
# 克隆 nginx-connector
git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# 编译 Nginx 时添加 ModSecurity 模块
./configure --add-dynamic-module=/path/to/ModSecurity-nginx
make modules
cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/
```

### 1.2 基础配置

```nginx
# /etc/nginx/nginx.conf
load_module modules/ngx_http_modsecurity_module.so;

http {
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity/main.conf;
    # ...
}
```

```ini
# /etc/nginx/modsecurity/main.conf
# ModSecurity 主配置文件
SecRuleEngine On

# 请求体大小限制（防止大包攻击）
SecRequestBodyLimit 52428800
SecRequestBodyNoFilesLimit 5242880

# 响应体大小限制
SecResponseBodyLimit 10485760

# 上传文件临时目录
SecUploadDir /tmp/
SecUploadKeepRequests Off

# 调试日志（生产环境建议关闭或设为级别 0）
SecDebugLog /var/log/modsec_debug.log
SecDebugLogLevel 0

# 审计日志
SecAuditEngine RelevantOnly
SecAuditLogRelevantStatus "^(?:5|4(?!04))"
SecAuditLog /var/log/modsec_audit.log
SecAuditLogType Serial
SecAuditLogParts ABIJDEFHZ

# 状态码
SecTmpSaveUploadedFiles Off
SecDataDir /tmp/
```

---

## 2. OWASP 核心规则集 (CRS)

### 2.1 部署 CRS

```bash
# 下载 OWASP CRS
wget https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.0.0.tar.gz
tar -xzf v4.0.0.tar.gz -C /etc/nginx/modsecurity/
mv /etc/nginx/modsecurity/coreruleset-4.0.0 /etc/nginx/modsecurity/crs

# 复制配置文件
cp /etc/nginx/modsecurity/crs/crs-setup.conf.example \
   /etc/nginx/modsecurity/crs/crs-setup.conf
```

### 2.2 在主配置中加载 CRS

```ini
# /etc/nginx/modsecurity/main.conf
# 加载 CRS 配置前先加载默认规则
Include /etc/nginx/modsecurity/crs/crs-setup.conf

# 加载规则文件（按顺序加载）
Include /etc/nginx/modsecurity/crs/rules/REQUEST-901-INITIALIZATION.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-905-COMMON-EXCEPTIONS.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-910-IP-REPUTATION.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-911-METHOD-ENFORCEMENT.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-912-DOS-PROTECTION.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-913-SCANNER-DETECTION.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-920-PROTOCOL-ENFORCEMENT.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-921-PROTOCOL-ATTACK.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-930-APPLICATION-ATTACK-LFI.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-931-APPLICATION-ATTACK-RFI.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-932-APPLICATION-ATTACK-RCE.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-933-APPLICATION-ATTACK-PHP.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-934-APPLICATION-ATTACK-GENERIC.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-941-APPLICATION-ATTACK-XSS.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-943-APPLICATION-ATTACK-SESSION-FIXATION.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-944-APPLICATION-ATTACK-JAVA.conf
Include /etc/nginx/modsecurity/crs/rules/REQUEST-949-BLOCKING-EVALUATION.conf
Include /etc/nginx/modsecurity/crs/rules/RESPONSE-950-DATA-LEAKAGES.conf
Include /etc/nginx/modsecurity/crs/rules/RESPONSE-951-DATA-LEAKAGES-SQL.conf
Include /etc/nginx/modsecurity/crs/rules/RESPONSE-952-DATA-LEAKAGES-JAVA.conf
Include /etc/nginx/modsecurity/crs/rules/RESPONSE-953-DATA-LEAKAGES-PHP.conf
Include /etc/nginx/modsecurity/crs/rules/RESPONSE-954-DATA-LEAKAGES-IIS.conf
Include /etc/nginx/modsecurity/crs/rules/RESPONSE-959-BLOCKING-EVALUATION.conf
Include /etc/nginx/modsecurity/crs/rules/RESPONSE-980-CORRELATION.conf
```

### 2.3 CRS 配置调优

```ini
# /etc/nginx/modsecurity/crs/crs-setup.conf

# 设置防护模式
# 默认使用 Anomaly 评分模式
SecDefaultAction "phase:1,log,auditlog,pass,t:none"

# 调整异常阈值（越小越严格）
# 入站请求阈值
SecAction \
  "id:900000,\
   phase:1,\
   pass,\
   nolog,\
   setvar:tx.inbound_anomaly_score_threshold=5"

# 出站响应阈值
SecAction \
  "id:900001,\
   phase:1,\
   pass,\
   nolog,\
   setvar:tx.outbound_anomaly_score_threshold=4"

# 排除不需要的规则（减少误报）
# 排除静态文件相关规则
SecRule REQUEST_URI "@beginsWith /static/" \
  "id:100001,\
   phase:1,\
   pass,\
   nolog,\
   ctl:ruleEngine=Off"

# 排除指定 IP 的检测
SecRule REMOTE_ADDR "@ipMatch 192.168.1.0/24" \
  "id:100002,\
   phase:1,\
   pass,\
   nolog,\
   ctl:ruleEngine=Off"
```

---

## 3. CC 攻击防护

### 3.1 基于 ModSecurity 的 CC 防护

```ini
# 限制单 IP 请求速率
SecRule IP:REQUEST_COUNT "@gt 100" \
  "id:200001,\
   phase:2,\
   deny,\
   status:429,\
   msg:'CC Attack Detected - IP Rate Limit Exceeded',\
   logdata:'%{IP.REQUEST_COUNT} requests in 60 seconds',\
   t:none"

# 初始化计数器（每 60 秒重置）
SecAction \
  "id:200002,\
   phase:1,\
   pass,\
   nolog,\
   setvar:IP.REQUEST_COUNT=0,\
   expirevar:IP.REQUEST_COUNT=60"

# 递增计数器
SecRule REQUEST_HEADERS:Host "." \
  "id:200003,\
   phase:1,\
   pass,\
   nolog,\
   setvar:'+IP.REQUEST_COUNT'"
```

### 3.2 Nginx 限流配置

```nginx
# /etc/nginx/nginx.conf
http {
    # 定义限流区域
    # $binary_remote_addr 以 IP 为 key
    # zone=addr:10m 分配 10MB 共享内存
    # rate=30r/m 每分钟最多 30 个请求
    limit_req_zone $binary_remote_addr zone=addr:10m rate=30r/m;

    # 限制并发连接数
    limit_conn_zone $binary_remote_addr zone=conn:10m;

    server {
        listen 80;
        server_name example.com;

        # 应用限流
        location / {
            # 限速：30r/m，允许突发 10 个请求
            limit_req zone=addr burst=10 nodelay;
            # 限制并发连接数
            limit_conn conn 10;
            # 限制超过后返回 429
            limit_req_status 429;
            limit_conn_status 429;

            proxy_pass http://backend;
        }

        # API 接口更严格的限流
        location /api/ {
            limit_req zone=addr burst=5 nodelay;
            limit_conn conn 5;
            limit_req_status 429;

            proxy_pass http://api_backend;
        }
    }
}
```

### 3.3 基于 IP 的并发连接限制

```nginx
# 限制单个 IP 到后端的连接数
http {
    upstream backend {
        server 10.0.1.10:80;
        server 10.0.1.11:80;
    }

    server {
        location / {
            limit_conn addr 10;
            proxy_pass http://backend;
        }
    }
}
```

### 3.4 前端挑战机制（验证码/JS 挑战）

```bash
# 使用 Nginx ngx_http_auth_request_module 集成验证码
# 或使用第三方 WAF 如 Cloudflare 的 JS 挑战

# 示例：Nginx 配置验证码校验入口
location /challenge {
    # 代理到验证码服务
    proxy_pass http://captcha-service:8080/verify;
    internal;
}
```

---

## 4. IP 黑白名单

### 4.1 ModSecurity 级别

```ini
# 白名单（完全放行）
SecRule REMOTE_ADDR "@ipMatch 192.168.1.0/24" \
  "id:300001,\
   phase:1,\
   pass,\
   t:none,\
   nolog,\
   ctl:ruleEngine=Off,\
   chain"

# 黑名单（直接拒绝）
SecRule REMOTE_ADDR "@ipMatch 10.0.0.100" \
  "id:300002,\
   phase:1,\
   deny,\
   status:403,\
   msg:'Blocked IP'"

# 从文件加载 IP 黑名单
SecRule REMOTE_ADDR "@ipMatchFromFile /etc/nginx/modsecurity/blacklist.txt" \
  "id:300003,\
   phase:1,\
   deny,\
   status:403,\
   msg:'Blocked by IP blacklist'"
```

```bash
# /etc/nginx/modsecurity/blacklist.txt 格式
# 每行一个 IP 或 CIDR
10.0.0.100
192.168.2.0/24
203.0.113.50
```

### 4.2 Nginx 级别

```nginx
# 使用 geo 模块定义黑白名单
http {
    # 黑名单
    geo $blocked_ip {
        default 0;
        10.0.0.100 1;
        10.0.0.200/32 1;
        203.0.113.0/24 1;
        # 从文件加载
        include /etc/nginx/blacklist.conf;
    }

    # 白名单
    geo $whitelist_ip {
        default 0;
        192.168.1.0/24 1;
        10.0.0.0/8 1;
    }

    server {
        # 黑名单拦截
        if ($blocked_ip) {
            return 403;
        }

        # 白名单跳过限流
        location / {
            if ($whitelist_ip = 0) {
                limit_req zone=addr burst=10 nodelay;
            }
            proxy_pass http://backend;
        }
    }
}
```

### 4.3 使用 ipset 批量管理

```bash
# 创建 ipset 集合
ipset create blacklist hash:ip
ipset create whitelist hash:net

# 添加条目
ipset add blacklist 10.0.0.100
ipset add whitelist 192.168.1.0/24

# iptables 引用 ipset
iptables -A INPUT -m set --match-set whitelist src -j ACCEPT
iptables -A INPUT -m set --match-set blacklist src -j DROP

# 持久化
ipset save > /etc/ipset.conf
```

---

## 5. 运维与监控

### 5.1 日志分析

```bash
# 实时查看 WAF 拦截日志
tail -f /var/log/modsec_audit.log | grep -E "^(H|M|B)"

# 统计拦截最多的 IP
awk '/^[0-9]/ {print $1}' /var/log/modsec_audit.log | sort | uniq -c | sort -rn | head -10

# 统计被拦截的 URL 排行
grep "id:" /var/log/modsec_audit.log | awk -F '"' '{print $2}' | sort | uniq -c | sort -rn | head -10

# 查看规则触发频次
awk '/Unique_ID/ {print $NF}' /var/log/modsec_debug.log | sort | uniq -c | sort -rn
```

### 5.2 性能监控指标

| 指标 | 说明 | 告警阈值 |
|------|------|---------|
| WAF 处理延迟 | 单次请求 WAF 处理耗时 | > 50ms |
| 规则匹配数/秒 | 每秒匹配的规则数 | 视硬件而定 |
| 拦截率 | 被拦截请求 / 总请求 | 异常突增 |
| 误报率 | 误拦截 / 总拦截 | > 5% 需排查 |
| 内存占用 | ModSecurity 进程内存 | > 512MB |

### 5.3 性能调优

```ini
# 减少不必要的规则检测
SecRuleRemoveById 920120  # 排除已知的误报规则
SecRuleRemoveByTag "attack-sqli"  # 排除特定标签规则

# 增大连接池
SecConnEngine On
SecConnReadStateLimit 100
SecConnWriteStateLimit 100

# 优化正则匹配
SecPcreMatchLimit 1000000
SecPcreMatchLimitRecursion 1000000

# 关闭响应体检测（提性能）
SecResponseBodyAccess Off
# 或仅对特定内容类型检测
SecResponseBodyMimeType text/plain text/html
```

### 5.4 健康检查与监控

```bash
# 检查 ModSecurity 状态
curl -I http://localhost/health
curl -X POST http://localhost/health -d "test=<script>alert(1)</script>"

# Prometheus 指标集成（需要 nginx-module-vts 或自定义 exporter）
# 查看 Nginx 状态
curl http://localhost/nginx_status

# 日志轮转
cat > /etc/logrotate.d/modsecurity << EOF
/var/log/modsec_audit.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        /usr/sbin/nginx -s reopen
    endscript
}
EOF
```

---

## 6. 最佳实践总结

### 6.1 部署建议

1. **分层防护**：WAF 应作为多层防护体系中的一层，配合主机防火墙、DDoS 清洗、应用层安全共同构成纵深防御。
2. **先审计后阻断**：新部署 WAF 时，先设置为 `SecRuleEngine DetectionOnly` 模式，观察一段时间，确认无大量误报后再切换为 `On` 模式。
3. **规则精简**：只启用业务相关的规则集，减少不必要的规则检测，降低性能开销。
4. **白名单优先**：对可信 IP 段（内网、CDN 回源 IP）配置白名单，避免不必要的规则匹配。
5. **定期更新**：OWASP CRS 持续更新，建议每月检查并更新规则集版本。

### 6.2 应急响应流程

```bash
1. 发现攻击 => 确认 WAF 告警
2. 临时封禁攻击源 IP => `iptables -A INPUT -s <IP> -j DROP`
3. 分析攻击日志 => 查看 modsec_audit.log
4. 调整规则（如误报则排除，如漏报则新增规则）
5. 验证效果 => 模拟攻击请求测试
6. 复盘总结 => 更新防护策略文档
```

> **参考资源**：ModSecurity 官网 [https://modsecurity.org/](https://modsecurity.org/) | OWASP CRS 项目 [https://coreruleset.org/](https://coreruleset.org/) | ModSecurity 参考手册 [https://github.com/SpiderLabs/ModSecurity/wiki](https://github.com/SpiderLabs/ModSecurity/wiki)

---


---


---


---
