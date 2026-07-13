---
title: SSH 安全加固
description: SSH 服务安全配置最佳实践，包括密钥认证、端口更改、防火墙策略、登录限制等
date: 2026-07-09
tags:
  - SSH
  - 安全
  - Linux
---

# SSH 安全加固

## 一、基础安全配置

### 1.1 修改默认端口

```bash
# 编辑配置文件
vim /etc/ssh/sshd_config

# 修改端口（建议 1024-65535 之间）
Port 2222

# 禁止 root 登录
PermitRootLogin no

# 禁止密码登录（仅允许密钥）
PasswordAuthentication no

# 禁止空密码登录
PermitEmptyPasswords no

# 修改登录超时时间
ClientAliveInterval 60
ClientAliveCountMax 3

# 重启服务
systemctl restart sshd
```

### 1.2 限制用户登录

```bash
# 仅允许指定用户登录
AllowUsers suzm admin

# 禁止指定用户登录
DenyUsers attacker

# 仅允许指定组登录
AllowGroups sshusers

# 禁止指定组登录
DenyGroups badgroup
```

## 二、密钥认证

### 2.1 生成密钥对

```bash
# 生成安全的密钥对
ssh-keygen -t ed25519 -C "suzm@example.com" -f ~/.ssh/id_ed25519

# 或者使用 RSA（兼容性更好）
ssh-keygen -t rsa -b 4096 -C "suzm@example.com"

# 查看公钥内容
cat ~/.ssh/id_ed25519.pub
```

### 2.2 部署公钥

```bash
# 方法一：手动复制
ssh-copy-id -p 2222 suzm@192.168.1.100

# 方法二：手动配置
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2.3 配置密钥代理

```bash
# 启动密钥代理
eval $(ssh-agent -s)

# 添加密钥
ssh-add ~/.ssh/id_ed25519

# 配置免密码（需要密钥密码）
ssh-add -K ~/.ssh/id_ed25519
```

## 三、防火墙配置

```bash
# iptables 规则
iptables -A INPUT -p tcp --dport 2222 -s 192.168.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 2222 -j DROP

# firewalld 规则
firewall-cmd --permanent --add-port=2222/tcp
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port port="2222" protocol="tcp" accept'
firewall-cmd --reload
```

## 四、登录日志监控

```bash
# 查看登录日志
tail -f /var/log/auth.log
tail -f /var/log/secure

# 失败登录尝试
grep "Failed password" /var/log/auth.log | head -20

# 成功登录记录
grep "Accepted" /var/log/auth.log | head -20

# 统计登录次数
last | head -20
```

## 五、Fail2Ban 防暴力破解

```bash
# 安装 Fail2Ban
yum install fail2ban -y

# 配置 SSH 规则
cat > /etc/fail2ban/jail.d/ssh.conf <<EOF
[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

# 启动服务
systemctl start fail2ban && systemctl enable fail2ban

# 查看状态
fail2ban-client status sshd

# 手动解封 IP
fail2ban-client set sshd unbanip 192.168.1.100
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
