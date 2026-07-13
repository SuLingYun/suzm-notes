---
title: Linux 防火墙管理指南
date: 2026-07-13
description: 涵盖 firewalld、UFW、iptables 三大工具的 Linux 防火墙完整管理手册，包含 SSH、ICMP 配置及高级运维技巧
tags: [linux, firewall, firewalld, ufw, iptables, ssh, icmp, network]
---

# Linux 防火墙管理指南

记录 Linux 环境下三大主流防火墙工具（firewalld、UFW、iptables）的日常运维操作，重点涵盖 SSH 服务开放、ICMP(ping) 配置以及安全加固技巧。

---

## 一、firewalld (CentOS/RHEL 7+ / Alibaba Linux)

### 1.1 服务状态管理

```sh
# 检查防火墙服务状态
systemctl status firewalld

# 查看是否开机自启
systemctl is-enabled firewalld

# 查看服务日志（实时监控）
journalctl -u firewalld -f
```

### 1.2 服务启停控制

```sh
# 启动防火墙
systemctl start firewalld

# 设置开机自启
systemctl enable firewalld

# 停止防火墙
systemctl stop firewalld

# 禁用开机自启
systemctl disable firewalld
```

### 1.3 规则管理

```sh
# 查看所有规则
firewall-cmd --list-all

# 查看开放端口
firewall-cmd --list-ports

# 开放端口（永久生效）
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload

# 开放服务
firewall-cmd --permanent --add-service=http
firewall-cmd --reload

# 平滑重载（不中断连接）
firewall-cmd --reload
```

### 1.4 开放 SSH 服务

```sh
# 查看预定义 SSH 服务
firewall-cmd --get-services | grep ssh

# 永久开放 SSH 服务
firewall-cmd --permanent --add-service=ssh

# 重载配置
firewall-cmd --reload

# 验证
firewall-cmd --list-services | grep ssh
```

### 1.5 开放 ICMP (ping)

```sh
# 永久允许 ping
firewall-cmd --permanent --add-icmp-block-inversion
firewall-cmd --permanent --add-icmp-block=echo-request

# 重载配置
firewall-cmd --reload

# 验证
ping -c 4 127.0.0.1
```

### 1.6 区域管理

```sh
# 设置默认区域
firewall-cmd --set-default-zone=public

# 将信任网段加入 trusted 区域
firewall-cmd --zone=trusted --add-source=192.168.1.0/24
```

### 1.7 应急操作

```sh
# 阻断所有流量（紧急模式）
firewall-cmd --panic-on

# 恢复网络
firewall-cmd --panic-off
```

---

## 二、UFW (Ubuntu/Debian)

### 2.1 服务状态管理

```sh
# 检查防火墙状态
ufw status

# 查看是否开机自启
systemctl is-enabled ufw

# 查看服务日志
journalctl -u ufw -f
```

### 2.2 服务启停控制

```sh
# 启动防火墙
ufw enable

# 停止防火墙
ufw disable

# 设置开机自启
systemctl enable ufw

# 禁用开机自启
systemctl disable ufw
```

### 2.3 规则管理

```sh
# 查看所有规则（带序号）
ufw status numbered

# 查看开放端口
ufw status | grep ALLOW

# 开放端口
ufw allow 8080/tcp

# 开放服务
ufw allow 'Nginx Full'
```

### 2.4 开放 SSH 服务

```sh
# 查看预定义 SSH 服务
ufw app list | grep OpenSSH

# 开放 SSH 服务
ufw allow OpenSSH

# 验证
ufw status | grep OpenSSH
```

### 2.5 开放 ICMP (ping)

```sh
# 允许 ping 入站
ufw allow in proto icmp type echo-request

# 验证
ping -c 4 127.0.0.1
```

---

## 三、iptables (通用 Linux)

### 3.1 服务状态管理

```sh
# 检查 iptables 服务状态
systemctl status iptables

# 查看规则是否加载
iptables -L -n

# 检查开机启动
systemctl is-enabled iptables
```

### 3.2 服务启停控制

```sh
# 启动服务
systemctl start iptables

# 停止服务
systemctl stop iptables

# 清空规则
iptables -F
```

### 3.3 规则管理

```sh
# 查看所有规则（带行号）
iptables -L -n --line-numbers

# 查看开放端口
iptables -L -n | grep ACCEPT | grep dpt

# 开放端口
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT

# 开放服务（多端口）
iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT

# 保存规则
service iptables save
```

### 3.4 开放 SSH 服务

```sh
# 开放 22 端口 SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 保存规则
service iptables save

# 验证
iptables -L -n | grep ":22"
```

### 3.5 开放 ICMP (ping)

```sh
# 允许 ICMP 回显请求
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT
iptables -A OUTPUT -p icmp --icmp-type echo-reply -j ACCEPT

# 保存规则
service iptables save

# 验证
ping -c 4 127.0.0.1
```

### 3.6 连接状态管理

```sh
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED -j ACCEPT
```

### 3.7 安全策略配置

```sh
# 设置默认策略
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 允许回环接口
iptables -A INPUT -i lo -j ACCEPT

# 允许已建立连接
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

### 3.8 规则持久化

```sh
# Debian/Ubuntu
iptables-save > /etc/iptables/rules.v4

# CentOS/RHEL
service iptables save
```

---

## 四、高级配置示例

### 4.1 限制 SSH 访问源 IP

```sh
# firewalld
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" service name="ssh" accept'

# UFW
ufw allow from 192.168.1.0/24 to any port 22 proto tcp

# iptables
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT
```

### 4.2 限制 Ping 频率（防洪水攻击）

```sh
# firewalld
firewall-cmd --permanent --add-rich-rule='rule protocol value="icmp" limit value="1/s" accept'

# iptables
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
```

### 4.3 修改 SSH 默认端口后开放

```sh
# 修改 SSH 端口为 2222 后
# firewalld
firewall-cmd --permanent --add-port=2222/tcp

# UFW
ufw allow 2222/tcp

# iptables
iptables -A INPUT -p tcp --dport 2222 -j ACCEPT
```

### 4.4 ICMP 精细控制

```sh
# 允许特定 ICMP 类型 (iptables)
iptables -A INPUT -p icmp --icmp-type 8 -j ACCEPT    # Echo request (ping)
iptables -A INPUT -p icmp --icmp-type 0 -j ACCEPT    # Echo reply
iptables -A INPUT -p icmp --icmp-type 3 -j ACCEPT    # Destination unreachable

# Firewalld ICMP 管理
firewall-cmd --add-icmp-block=redirect --permanent            # 禁用重定向
firewall-cmd --remove-icmp-block=echo-request --permanent     # 允许 ping
```

### 4.5 iptables 安全配置完整示例

```sh
# 重置规则
iptables -F
iptables -X

# 设置默认策略
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 允许本地通信
iptables -A INPUT -i lo -j ACCEPT

# 允许已建立连接
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 开放基础服务
iptables -A INPUT -p tcp --dport 22 -j ACCEPT                    # SSH
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT     # Ping
iptables -A INPUT -p tcp --dport 80 -j ACCEPT                    # HTTP
iptables -A INPUT -p tcp --dport 443 -j ACCEPT                   # HTTPS

# 保存规则
iptables-save > /etc/iptables/rules.v4
```

---

## 五、服务对照表

| 服务名称 | 协议/端口 | Firewalld 命令 | UFW 命令 | Iptables 命令 |
|---------|----------|---------------|----------|--------------|
| SSH | TCP/22 | `--add-service=ssh` | `allow OpenSSH` | `-p tcp --dport 22 -j ACCEPT` |
| HTTP | TCP/80 | `--add-service=http` | `allow 'Nginx Full'` | `-p tcp --dport 80 -j ACCEPT` |
| HTTPS | TCP/443 | `--add-service=https` | `allow 'Nginx Full'` | `-p tcp --dport 443 -j ACCEPT` |
| Ping | ICMP | `--add-icmp-block-inversion` | `allow in proto icmp type echo-request` | `-p icmp --icmp-type echo-request -j ACCEPT` |
| DNS | UDP/53 | `--add-service=dns` | `allow 53/udp` | `-p udp --dport 53 -j ACCEPT` |
| MySQL | TCP/3306 | `--add-port=3306/tcp` | `allow 3306/tcp` | `-p tcp --dport 3306 -j ACCEPT` |
| NTP | UDP/123 | `--add-service=ntp` | `allow 123/udp` | `-p udp --dport 123 -j ACCEPT` |

---

## 六、服务验证方法

### 6.1 SSH 连接测试

```sh
ssh -v -p 22 username@server_ip
```

### 6.2 Ping 测试

```sh
ping -c 4 server_ip
```

### 6.3 端口扫描验证

```sh
nmap -p 22 server_ip
```

### 6.4 综合验证命令

```sh
# 检查 IP 分配
ip addr show eth0

# 测试外网连通性
ping -c 4 8.8.8.8

# 查看网络服务日志
journalctl -xe -u NetworkManager
```

---

## 七、注意事项与最佳实践

### 操作顺序

1. **Firewalld**：修改后需执行 `--reload` 使永久规则生效
2. **Iptables**：修改后必须保存规则，防止重启丢失
3. **UFW**：修改后立即生效，无需额外操作

### 安全警告

- 禁用 SSH 前确保有其他访问方式（如带外管理或 IPMI）
- 设置默认 DROP 策略前，先允许已建立连接
- 测试规则前保持当前 SSH 连接不中断
- 生产环境建议禁用密码登录：`/etc/ssh/sshd_config` 中设置 `PasswordAuthentication no`
- 定期审计防火墙规则：`firewall-cmd --list-all` 或 `ufw status numbered`

### 服务兼容性

```sh
# 检查 firewalld 和 iptables 冲突
systemctl status firewalld iptables

# 禁用冲突服务（二选一）
systemctl stop iptables
systemctl mask iptables
```

### 日志记录

```sh
# Iptables 日志记录
iptables -A INPUT -p tcp --dport 22 -j LOG --log-prefix "SSH Attempt: "

# Firewalld 日志位置
/var/log/firewalld
```

### 权限要求

所有命令需在 `root` 用户下执行，或通过 `sudo` 提权操作。