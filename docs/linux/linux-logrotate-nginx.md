---
title: Linux 日志自动切割配置（Nginx 示例）
date: 2026-07-20
description: 使用 logrotate 对 Nginx 日志进行自动切割的完整配置指南，包含 systemd timer 和 cron 两种调度方式
tags: [linux, nginx, logrotate, 日志]
---

# Linux 日志自动切割配置（Nginx 示例）

## 通用模板

```bash
sudo tee /etc/logrotate.d/your-app > /dev/null << 'EOF'
/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 youruser yourgroup
    sharedscripts
    postrotate
        # 在这里添加通知应用重新打开日志的命令
        # 例如：systemctl reload your-app
        # 或：kill -USR1 $(cat /var/run/your-app.pid)
    endscript
}
EOF
```

## logrotate 参数说明

| 参数 | 说明 |
|------|------|
| `daily` | 每天切割一次 |
| `missingok` | 日志文件不存在时不报错 |
| `rotate 14` | 保留14天的日志文件 |
| `compress` | 压缩旧日志为 .gz 格式 |
| `delaycompress` | 延迟1天再压缩 |
| `notifempty` | 空文件不切割 |
| `create 644 nginx nginx` | 创建新日志文件 |
| `sharedscripts` | 所有日志文件共享 postrotate 脚本 |
| `postrotate` | 切割后执行的命令 |

## 判断系统使用的调度方式

方法1：检查 systemd timer（新版本 Linux，推荐）
```bash
systemctl status logrotate.timer
systemctl list-timers | grep logrotate
```

方法2：检查 cron.daily（传统方式）
```bash
ls -l /etc/cron.daily/ | grep logrotate
```

## Nginx 日志切割部署

### 1. 创建日志目录
```bash
sudo mkdir -p /etc/nginx/logs
sudo chown -R nginx:nginx /etc/nginx/logs
```

### 2. 创建 logrotate 配置文件
```bash
sudo tee /etc/logrotate.d/nginx-dlsxxh > /dev/null << 'EOF'
/etc/nginx/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOF
```

### 3. 验证配置
```bash
# 测试配置语法
sudo logrotate -d /etc/logrotate.d/nginx-dlsxxh

# 强制执行一次切割
sudo logrotate -f /etc/logrotate.d/nginx-dlsxxh

# 查看日志目录
ls -lh /etc/nginx/logs/
```

## 常见问题排查

**问题1：日志没有自动切割**
- 检查调度方式：`systemctl status logrotate.timer`
- 测试配置语法：`sudo logrotate -d /etc/logrotate.d/nginx-dlsxxh`
- 手动执行测试：`sudo logrotate -f /etc/logrotate.d/nginx-dlsxxh`

**问题2：日志权限错误**
- 检查日志目录权限：`ls -ld /etc/nginx/logs/`
- 修正权限：`sudo chown -R nginx:nginx /etc/nginx/logs`

**问题3：Nginx 无法写入新日志**
- 检查 Nginx 运行用户：`ps aux | grep nginx`
- 重启 Nginx：`sudo systemctl restart nginx`

## 注意事项

1. logrotate 不支持行内注释（`#` 不能跟在同一行）
2. 确保日志目录存在且有正确的权限
3. 新版本 Linux（CentOS 7+、Ubuntu 16.04+）优先使用 systemd timer
4. 旧版本 Linux 使用 cron.daily