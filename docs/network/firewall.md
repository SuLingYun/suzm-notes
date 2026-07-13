---
title: 防火墙配置指南
description: 涵盖 iptables 与 firewalld 两种主流防火墙工具的配置方法、常用规则示例、NAT 转发配置以及最佳实践。
date: 2026-07-08
tags:
  - 防火墙
  - iptables
  - firewalld
  - NAT
  - 网络安全
---

# 防火墙配置指南

## 1. iptables 配置

### 1.1 基础概念

iptables 是 Linux 内核 netfilter 框架的用户态管理工具，通过表（table）和链（chain）组织规则。

**四表五链结构：**

| 表名 | 包含的链 | 用途 |
|------|---------|------|
| `filter` | INPUT, FORWARD, OUTPUT | 包过滤（默认表） |
| `nat` | PREROUTING, POSTROUTING, INPUT, OUTPUT | 网络地址转换 |
| `mangle` | PREROUTING, INPUT, FORWARD, OUTPUT, POSTROUTING | 包修改（TOS、TTL 等） |
| `raw` | PREROUTING, OUTPUT | 连接跟踪豁免 |

### 1.2 常用规则示例

#### 基础策略配置

```bash
# 查看当前规则
iptables -L -n -v
iptables -t nat -L -n -v

# 设置默认策略（DROP 更安全，但需确保远程连接不会被阻断）
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 允许已建立的连接回包
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
```

#### 开放服务端口

```bash
# 开放 SSH（务必先放行，避免自己被锁在外面）
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 开放 HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 开放 DNS
iptables -A INPUT -p udp --dport 53 -j ACCEPT
iptables -A INPUT -p tcp --dport 53 -j ACCEPT
```

#### 源 IP 限制

```bash
# 仅允许特定 IP 访问 SSH
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j DROP

# 屏蔽恶意 IP
iptables -A INPUT -s 10.0.0.100 -j DROP

# 限制单个 IP 并发连接数（防 CC 攻击）
iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 50 -j REJECT
```

#### 防止常见攻击

```bash
# 防 SYN Flood（限制 SYN 包速率）
iptables -A INPUT -p tcp --syn -m limit --limit 10/s --limit-burst 20 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# 防 Ping Flood（限制 ICMP 速率）
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP

# 防止 Null 扫描
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP

# 防止 Xmas 扫描
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP
```

### 1.3 规则持久化

```bash
# CentOS/RHEL 7
yum install iptables-services
iptables-save > /etc/sysconfig/iptables

# Ubuntu/Debian
apt install iptables-persistent
iptables-save > /etc/iptables/rules.v4

# 恢复规则
iptables-restore < /etc/sysconfig/iptables
```

---

## 2. firewalld 配置

### 2.1 基础概念

firewalld 是动态防火墙管理工具，支持区域（zone）和服务（service）概念，规则变更即时生效，无需重启服务。

**预定义区域说明：**

| 区域名 | 信任级别 | 默认允许 |
|--------|---------|---------|
| `drop` | 最低 | 仅允许出站，丢弃所有入站 |
| `block` | 低 | 拒绝所有入站（返回 icmp-host-prohibited） |
| `public` | 中 | 默认区域，仅允许选中的服务 |
| `internal` | 中高 | 内网区域，信任较多服务 |
| `trusted` | 最高 | 接受所有连接 |

### 2.2 常用操作

#### 服务管理

```bash
# 查看状态
firewall-cmd --state
firewall-cmd --list-all

# 开放服务（立即生效并持久化）
firewall-cmd --add-service=http --permanent
firewall-cmd --add-service=https --permanent
firewall-cmd --reload

# 开放端口
firewall-cmd --add-port=8080/tcp --permanent
firewall-cmd --add-port=3000-4000/tcp --permanent
firewall-cmd --reload
```

#### 高级规则

```bash
# 允许特定源 IP 访问
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port port="22" protocol="tcp" accept'

# 限制连接速率
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" port port="80" protocol="tcp" accept limit value="100/m"'

# 屏蔽 IP
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.0.0.100" drop'

# 使用 ipset 批量屏蔽
firewall-cmd --permanent --new-ipset=blacklist --type=hash:ip
firewall-cmd --permanent --ipset=blacklist --add-entry=10.0.0.100
firewall-cmd --permanent --add-rich-rule='rule source ipset=blacklist drop'
```

#### 区域管理

```bash
# 查看默认区域
firewall-cmd --get-default-zone

# 修改默认区域
firewall-cmd --set-default-zone=drop

# 将网卡绑定到指定区域
firewall-cmd --permanent --zone=internal --change-interface=eth1

# 查看网卡所在区域
firewall-cmd --get-zone-of-interface=eth0
```

---

## 3. NAT 转发配置

### 3.1 源 NAT（SNAT / MASQUERADE）

用于内网机器通过共享公网 IP 访问互联网。

```bash
# 开启 IP 转发（必须）
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf

# 固定公网 IP 的 SNAT
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o eth0 -j SNAT --to-source 203.0.113.10

# 动态公网 IP 的 MASQUERADE（推荐）
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o eth0 -j MASQUERADE

# firewalld 方式
firewall-cmd --permanent --add-masquerade
firewall-cmd --reload
```

### 3.2 目标 NAT（DNAT / 端口转发）

用于将公网流量转发到内网服务器。

```bash
# 外部访问 203.0.113.10:80 转发到内网 192.168.1.100:80
iptables -t nat -A PREROUTING -d 203.0.113.10 -p tcp --dport 80 -j DNAT --to-destination 192.168.1.100:80

# 转发到不同端口
iptables -t nat -A PREROUTING -d 203.0.113.10 -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.100:80

# 同时允许 FORWARD 流量
iptables -A FORWARD -d 192.168.1.100 -p tcp --dport 80 -j ACCEPT
iptables -A FORWARD -s 192.168.1.100 -m state --state ESTABLISHED,RELATED -j ACCEPT
```

### 3.3 完整 NAT 网关配置示例

```ini
# /etc/sysctl.conf
net.ipv4.ip_forward = 1
net.ipv4.conf.all.rp_filter = 1

# 内网出网 NAT
iptables -t nat -A POSTROUTING -s 10.0.0.0/8 -o eth0 -j MASQUERADE

# 公网到内网 Web 服务映射
iptables -t nat -A PREROUTING -d 203.0.113.10 -p tcp --dport 443 -j DNAT --to-destination 10.0.1.10:443

# 内网到公网流量放行
iptables -A FORWARD -s 10.0.0.0/8 -j ACCEPT
iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT
```

---

## 4. 最佳实践与安全建议

### 4.1 防火墙配置 Checklist

1.  **最小权限原则**：默认拒绝所有入站流量，仅放行必要端口。
2.  **规则顺序**：最常用和匹配范围最小的规则放在前面，减少匹配开销。
3.  **连接跟踪**：启用 `ESTABLISHED,RELATED` 放行回包，避免手动配置回程规则。
4.  **远程访问安全**：配置 SSH 白名单、更换端口、禁用密码登录。
5.  **规则备份**：`iptables-save` 定期备份，变更前先备份当前规则。
6.  **变更验证**：使用 `iptables-apply` 或 cron 定时恢复兜底，防止规则错误导致失联。

### 4.2 性能优化

```ini
# 连接跟踪表大小调整（高并发场景）
net.netfilter.nf_conntrack_max = 655360
net.netfilter.nf_conntrack_tcp_timeout_established = 3600

# 减少连接跟踪压力（直连场景可关闭）
iptables -t raw -A PREROUTING -p tcp --dport 80 -j NOTRACK
iptables -t raw -A OUTPUT -p tcp --sport 80 -j NOTRACK
```

### 4.3 故障排查

```bash
# 查看规则计数（判断规则是否命中）
iptables -L -n -v

# 清空所有规则（谨慎操作）
iptables -F && iptables -t nat -F && iptables -t mangle -F

# 跟踪数据包路径
iptables -t raw -A PREROUTING -p tcp --dport 80 -j TRACE
iptables -t raw -A OUTPUT -p tcp --sport 80 -j TRACE

# 日志记录被丢弃的包
iptables -A INPUT -j LOG --log-prefix "IPTABLES-DROP: " --log-level 7
```

---

> **参考命令**：本文所有命令均基于 CentOS 7+/RHEL 8+ 环境，Ubuntu/Debian 系统命令基本一致，部分路径和包名可能略有差异。生产环境配置前请务必在测试环境验证。

---


---


---


---
