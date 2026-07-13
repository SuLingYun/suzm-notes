---
title: Nginx 配置指南
description: 涵盖 Nginx 反向代理、负载均衡、HTTPS 配置、缓存策略、动静分离与限流配置的完整运维手册
date: 2026-07-08
tags:
  - Nginx
  - 反向代理
  - 负载均衡
  - HTTPS
  - 缓存
  - 限流
---

# Nginx 配置指南

## 目录

1. [反向代理配置](#反向代理配置)
2. [负载均衡配置](#负载均衡配置)
3. [HTTPS 配置](#https-配置)
4. [缓存策略](#缓存策略)
5. [动静分离配置](#动静分离配置)
6. [限流配置](#限流配置)

---

## 反向代理配置

### 基本反向代理

```nginx
# /etc/nginx/conf.d/proxy.conf

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

### 通用代理参数封装

```nginx
# /etc/nginx/conf.d/proxy_params.conf
# 通用代理参数，通过 include 引入

proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# 缓冲配置
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;

# 超时配置
proxy_connect_timeout 30s;
proxy_read_timeout 60s;
proxy_send_timeout 60s;

# 文件大小限制
client_max_body_size 10m;
```

### WebSocket 反向代理

```nginx
server {
    listen 80;
    server_name ws.example.com;

    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # WebSocket 超时（长连接场景）
        proxy_read_timeout 3600s;
    }
}
```

### 路径重写与路由

```nginx
server {
    listen 80;
    server_name app.example.com;

    # 将 /api 前缀转发到后端服务
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://backend_service:8080;
    }

    # 将前端路由指向静态文件
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 负载均衡配置

### upstream 模块基本用法

```nginx
# 定义上游服务器组
upstream backend_servers {
    # 默认轮询（round-robin）
    server 192.168.1.10:8080 weight=5;
    server 192.168.1.11:8080 weight=3;
    server 192.168.1.12:8080 backup;  # 备用节点
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://backend_servers;
        include /etc/nginx/conf.d/proxy_params.conf;
    }
}
```

### 负载均衡算法

| 算法 | 指令 | 说明 | 适用场景 |
|------|------|------|----------|
| 轮询 | 默认 | 按顺序轮流分配 | 各节点配置均等 |
| 加权轮询 | `weight=N` | 按权重比例分配 | 节点性能不均等 |
| IP Hash | `ip_hash` | 按客户端 IP 哈希分配，保证会话保持 | 需要 Session 粘滞 |
| 最少连接 | `least_conn` | 分配给活跃连接数最少的节点 | 请求处理时间不均 |
| 随机 | `random` | 随机选择节点 | 简单负载均衡 |
| 一致性哈希 | `hash $request_uri` | 按指定 key 哈希分配 | 缓存场景 |

```nginx
# IP Hash 负载均衡（Session 保持）
upstream backend_ip_hash {
    ip_hash;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

# 最少连接负载均衡
upstream backend_least_conn {
    least_conn;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

# 一致性哈希负载均衡
upstream backend_hash {
    hash $request_uri consistent;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}
```

### 健康检查

```nginx
upstream backend_servers {
    # 被动健康检查
    server 192.168.1.10:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 max_fails=3 fail_timeout=30s;

    # 慢启动（新加入节点逐步增加流量）
    server 192.168.1.12:8080 slow_start=30s;
}
```

### 多区域负载均衡

```nginx
upstream global_backend {
    # 就近访问（区域优先）
    server asia-backend.example.com:8080;
    server eu-backend.example.com:8080 backup;
    server us-backend.example.com:8080 backup;
}
```

---

## HTTPS 配置

### SSL 证书配置

```nginx
server {
    listen 443 ssl http2;
    server_name www.example.com;

    # 证书路径
    ssl_certificate     /etc/nginx/ssl/example.com.pem;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    # 协议与加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;

    # DH 参数（提高安全性）
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;

    # 会话缓存（提高性能）
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS（强制 HTTPS）
    add_header Strict-Transport-Security "max-age=63072000" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    location / {
        proxy_pass http://backend_servers;
        include /etc/nginx/conf.d/proxy_params.conf;
    }
}
```

### HTTP 自动跳转 HTTPS

```nginx
server {
    listen 80;
    server_name www.example.com example.com;
    # 永久重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}
```

### 生成 DH 参数

```bash
# 生成 DH 参数文件（用于提高 DHE 密钥交换安全性）
openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048
```

### 证书自动续期（Let's Encrypt）

```bash
# 安装 certbot
apt-get install certbot python3-certbot-nginx

# 获取证书并自动配置 Nginx
certbot --nginx -d example.com -d www.example.com

# 测试自动续期
certbot renew --dry-run

# 设置 crontab 自动续期（每天检查两次）
echo "0 0,12 * * * root /usr/bin/certbot renew --quiet" >> /etc/crontab
```

### HTTPS 配置安全检查

```bash
# 使用 curl 测试 TLS 连接
curl -I https://www.example.com

# 使用 openssl 测试
openssl s_client -connect www.example.com:443 -tls1_2

# 在线检测（推荐）
# 访问 https://www.ssllabs.com/ssltest/ 进行检测
```

---

## 缓存策略

### 静态文件缓存

```nginx
server {
    listen 80;
    server_name static.example.com;
    root /var/www/static;

    # 图片缓存（30 天）
    location ~* \.(jpg|jpeg|png|gif|webp|svg|ico)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # CSS/JS 缓存（7 天）
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 字体文件缓存（30 天）
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML 不缓存或短时间缓存
    location ~* \.html$ {
        expires 5m;
        add_header Cache-Control "public, must-revalidate";
    }
}
```

### 代理缓存（反向代理缓存）

```nginx
# 定义缓存路径与参数
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m
                 max_size=1g inactive=60m use_temp_path=off;

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_cache my_cache;
        proxy_cache_key "$scheme$request_method$host$request_uri";

        # 缓存有效期
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_valid any 1m;

        # 跳过缓存的条件
        proxy_no_cache $cookie_session;
        proxy_cache_bypass $cookie_session;

        # 缓存锁（防止缓存穿透）
        proxy_cache_lock on;
        proxy_cache_lock_timeout 5s;

        # 使用过期缓存（后端不可用时）
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503;

        # 添加缓存状态头
        add_header X-Cache-Status $upstream_cache_status;

        proxy_pass http://backend_servers;
        include /etc/nginx/conf.d/proxy_params.conf;
    }

    # 清除缓存（需限制访问）
    location ~ /purge(/.*) {
        allow 127.0.0.1;
        allow 192.168.0.0/16;
        deny all;
        proxy_cache_purge my_cache "$scheme$request_method$host$1";
    }
}
```

### 缓存状态说明

`$upstream_cache_status` 可能的值：

| 状态 | 说明 |
|------|------|
| `MISS` | 未命中，请求已转发到后端 |
| `HIT` | 命中缓存，直接返回 |
| `EXPIRED` | 缓存已过期，请求转发到后端 |
| `STALE` | 使用过期缓存（后端不可用时） |
| `UPDATING` | 缓存正在更新，返回旧内容 |
| `BYPASS` | 请求跳过缓存 |
| `REVALIDATED` | 缓存通过条件请求重新验证 |

---

## 动静分离配置

### 基本动静分离

```nginx
server {
    listen 80;
    server_name www.example.com;

    # 静态资源（直接由 Nginx 处理）
    location /static/ {
        root /var/www/html;
        expires 7d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 上传文件（直接由 Nginx 处理）
    location /uploads/ {
        root /var/www/html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 动态请求（转发到后端应用）
    location / {
        proxy_pass http://backend_servers;
        include /etc/nginx/conf.d/proxy_params.conf;
    }
}
```

### 动静分离 + CDN 集成

```nginx
server {
    listen 80;
    server_name www.example.com;

    # 静态资源（使用 CDN 域名）
    location /static/ {
        root /var/www/html;
        expires 30d;
        add_header Cache-Control "public, immutable";
        # 允许跨域（字体文件等）
        add_header Access-Control-Allow-Origin "*";
    }

    # 动态 API
    location /api/ {
        proxy_pass http://backend_api;
        include /etc/nginx/conf.d/proxy_params.conf;
    }

    # 前端页面（SPA 路由支持）
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }
}
```

### 合并多个静态资源目录

```nginx
server {
    listen 80;
    server_name static.example.com;

    # 多静态目录合并
    location /assets/ {
        alias /var/www/project-a/assets/;
    }

    location /vendor/ {
        alias /var/www/common/vendor/;
    }

    location /themes/ {
        alias /var/www/themes/;
    }
}
```

---

## 限流配置

### ngx_http_limit_req_module（请求限流）

```nginx
# 定义限流区域
# rate=10r/s 表示每秒 10 个请求
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 针对不同 URL 设置不同限流
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=1r/s;

server {
    listen 80;
    server_name api.example.com;

    # 全局 API 限流
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        # burst=20 允许突发 20 个请求排队
        # nodelay 排队请求不延迟处理

        limit_req_status 429;  # 自定义状态码
        proxy_pass http://backend_servers;
        include /etc/nginx/conf.d/proxy_params.conf;
    }

    # 登录接口限流（更严格）
    location /api/login {
        limit_req zone=login_limit burst=3 nodelay;
        proxy_pass http://backend_servers;
        include /etc/nginx/conf.d/proxy_params.conf;
    }
}
```

### ngx_http_limit_conn_module（连接数限流）

```nginx
# 定义连接数限制区域
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

# 针对单个 IP 的并发连接数
limit_conn_zone $server_name zone=server_limit:10m;

server {
    listen 80;
    server_name www.example.com;

    # 单 IP 最大 10 个并发连接
    limit_conn conn_limit 10;

    # 单个虚拟主机最大 100 个并发连接
    limit_conn server_limit 100;

    # 限制状态码
    limit_conn_status 503;

    location / {
        proxy_pass http://backend_servers;
        include /etc/nginx/conf.d/proxy_params.conf;
    }

    # 静态资源不受限
    location /static/ {
        limit_conn conn_limit 50;
        root /var/www/html;
    }
}
```

### 带宽限制

```nginx
server {
    listen 80;
    server_name downloads.example.com;

    # 限制单连接下载速度（500KB/s）
    limit_rate 500k;

    # 在特定时间段后限速
    location /large-file.zip {
        limit_rate_after 10m;  # 前 10MB 不限速
        limit_rate 200k;       # 之后限速 200KB/s
    }
}
```

### 综合限流示例

```nginx
# 定义多个限流区域
# 按 IP 限制请求频率
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=strict:10m rate=5r/s;

# 按 IP 限制并发连接
limit_conn_zone $binary_remote_addr zone=addr_conn:10m;

# 按 URI 限制请求频率（防爬虫）
limit_req_zone $request_uri zone=uri_limit:10m rate=10r/s;

server {
    listen 80;
    server_name www.example.com;

    # 全局连接数限制
    limit_conn addr_conn 20;

    # 访客请求限流
    location / {
        limit_req zone=general burst=10 nodelay;
        proxy_pass http://backend_servers;
    }

    # 搜索接口限流
    location /search {
        limit_req zone=strict burst=5 nodelay;
        limit_req_status 429;
        proxy_pass http://backend_servers;
    }

    # 黑名单配置（结合 geo 模块）
    location /admin {
        # 限制特定路径访问
        allow 192.168.0.0/16;
        allow 10.0.0.0/8;
        deny all;
        proxy_pass http://backend_servers;
    }
}
```

### Geo 模块区域限制

```nginx
# /etc/nginx/conf.d/geo_whitelist.conf

geo $whitelist {
    default 0;
    # 公司内网
    10.0.0.0/8 1;
    172.16.0.0/12 1;
    192.168.0.0/16 1;
    # 可信第三方
    114.114.114.114/32 1;
}

server {
    listen 80;
    server_name admin.example.com;

    # 白名单不限流，非白名单限流
    location / {
        if ($whitelist = 0) {
            limit_req zone=strict burst=3 nodelay;
        }
        proxy_pass http://backend_servers;
    }
}
```

### 日志格式优化

```nginx
# 自定义日志格式（包含缓存状态、响应时间等）
log_format main_ext '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time '
                    '$upstream_cache_status';

access_log /var/log/nginx/access.log main_ext;
error_log /var/log/nginx/error.log warn;
```

### 常用运维命令

```bash
# 检查配置文件语法
nginx -t

# 优雅重载配置
nginx -s reload

# 优雅停止
nginx -s quit

# 强制停止
nginx -s stop

# 重新打开日志文件（日志切割后使用）
nginx -s reopen

# 查看 Nginx 版本与编译参数
nginx -V

# 查看活跃连接数
curl http://127.0.0.1/nginx_status

# 测试代理是否正常
curl -I http://127.0.0.1

# 查看访问日志
tail -f /var/log/nginx/access.log

# 查看错误日志
tail -f /var/log/nginx/error.log
```

---

> **参考文档**：[中间件运维笔记索引](./index.md) | [Tomcat 部署与优化](./tomcat.md)

---


---


---


---
