---
title: Zabbix 企业级监控实战
description: Zabbix 监控系统从安装到高级配置，包括自动发现、触发器配置、邮件/钉钉告警、性能调优
date: 2026-07-09
tags:
  - Zabbix
  - 监控告警
  - 自动化运维
---

# Zabbix 企业级监控实战

## 一、环境搭建

### 1.1 安装 Zabbix Server

```bash
# 配置 Zabbix 源
rpm -ivh https://repo.zabbix.com/zabbix/6.4/rhel/7/x86_64/zabbix-release-6.4-1.el7.noarch.rpm
yum clean all

# 安装服务端
yum install zabbix-server-mysql zabbix-web-mysql zabbix-agent -y

# 创建数据库
mysql -u root -p
CREATE DATABASE zabbix CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE USER 'zabbix'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON zabbix.* TO 'zabbix'@'localhost';

# 导入初始数据
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql -u zabbix -p zabbix
```

### 1.2 配置 Zabbix

```bash
# 修改数据库密码
sed -i 's/# DBPassword=/DBPassword=password/' /etc/zabbix/zabbix_server.conf

# 修改时区
sed -i 's/# php_value\[date.timezone\]/php_value\[date.timezone\] = Asia\/Shanghai/' /etc/php-fpm.d/zabbix.conf

# 启动服务
systemctl restart zabbix-server zabbix-agent httpd php-fpm
systemctl enable zabbix-server zabbix-agent httpd php-fpm
```

## 二、Agent 配置

### 2.1 安装 Agent

```bash
# 在被监控主机上安装
rpm -ivh https://repo.zabbix.com/zabbix/6.4/rhel/7/x86_64/zabbix-release-6.4-1.el7.noarch.rpm
yum install zabbix-agent -y
```

### 2.2 配置 Agent

```bash
cat > /etc/zabbix/zabbix_agentd.conf <<EOF
PidFile=/var/run/zabbix/zabbix_agentd.pid
LogFile=/var/log/zabbix/zabbix_agentd.log
LogFileSize=0
Server=192.168.1.100
ServerActive=192.168.1.100
Hostname=web01
Include=/etc/zabbix/zabbix_agentd.d/*.conf
EOF

systemctl restart zabbix-agent && systemctl enable zabbix-agent
```

## 三、自动发现

### 3.1 网络发现规则

```bash
# 添加自动发现规则（Web 界面操作）
# Configuration → Discovery → Create discovery rule

# 发现规则示例
# Name: Network Discovery
# IP range: 192.168.1.1-254
# Update interval: 1h
# Checks: ICMP ping, SSH, HTTP
```

### 3.2 动作配置

```bash
# 配置自动注册动作
# Configuration → Actions → Discovery actions

# 条件: Discovery status = Up
# 操作: Add host, Link to template, Enable host
```

## 四、触发器配置

### 4.1 常用触发器

```bash
# CPU 使用率 > 80%
{Template OS Linux:system.cpu.util[,idle].last(0)} < 20

# 内存使用率 > 85%
{Template OS Linux:vm.memory.util.last(0)} > 85

# 磁盘空间 < 20%
{Template OS Linux:vfs.fs.size[/,pfree].last(0)} < 20

# 服务停止
{Template OS Linux:service.httpd.status.last(0)} = 0
```

### 4.2 自定义触发器

```bash
# MySQL 连接数 > 100
{Template App MySQL:mysql.ping.last(0)} = 1 and {Template App MySQL:mysql.threads_connected.last(0)} > 100

# Nginx 5xx 错误率 > 1%
{Template App Nginx:nginx.stats.code.5xx.percent.last(0)} > 1
```

## 五、告警通知

### 5.1 邮件告警

```bash
# 配置 SMTP
# Administration → Media types → Email

# SMTP settings
# SMTP server: smtp.example.com
# SMTP port: 587
# SMTP email: zabbix@example.com
# Authentication: Yes
# Username: zabbix
# Password: password
```

### 5.2 钉钉告警

```bash
# 创建钉钉机器人
# 在钉钉群设置中添加自定义机器人，获取 Webhook URL

# 创建告警脚本
cat > /usr/lib/zabbix/alertscripts/dingtalk.sh <<EOF
#!/bin/bash
WEBHOOK_URL="https://oapi.dingtalk.com/robot/send?access_token=your-token"
MESSAGE=\$1

curl -s -X POST \$WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"$MESSAGE\"}}"
EOF

chmod +x /usr/lib/zabbix/alertscripts/dingtalk.sh

# 在 Zabbix 中添加告警媒介
# Administration → Media types → Create media type
# Type: Script
# Script name: dingtalk.sh
```

## 六、性能调优

### 6.1 数据库优化

```bash
# MySQL 配置优化
cat >> /etc/my.cnf.d/zabbix.cnf <<EOF
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
innodb_log_buffer_size = 64M
innodb_flush_log_at_trx_commit = 2
query_cache_type = 0
query_cache_size = 0
max_connections = 1000
EOF

systemctl restart mysqld
```

### 6.2 Zabbix Server 调优

```bash
# 调整进程数
sed -i 's/StartPollers=5/StartPollers=30/' /etc/zabbix/zabbix_server.conf
sed -i 's/StartTrappers=5/StartTrappers=20/' /etc/zabbix/zabbix_server.conf
sed -i 's/StartPingers=1/StartPingers=10/' /etc/zabbix/zabbix_server.conf
sed -i 's/StartDiscoverers=1/StartDiscoverers=5/' /etc/zabbix/zabbix_server.conf

systemctl restart zabbix-server
```

### 6.3 前端调优

```bash
# PHP 配置优化
sed -i 's/max_execution_time = 30/max_execution_time = 300/' /etc/php.ini
sed -i 's/memory_limit = 128M/memory_limit = 512M/' /etc/php.ini

systemctl restart php-fpm
```

## 七、常用模板

| 模板名称 | 监控内容 |
|----------|----------|
| **Template OS Linux** | 基础 Linux 监控 |
| **Template OS Windows** | 基础 Windows 监控 |
| **Template App MySQL** | MySQL 数据库监控 |
| **Template App Nginx** | Nginx 监控 |
| **Template App Redis** | Redis 监控 |
| **Template ICMP Ping** | 网络连通性监控 |

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
