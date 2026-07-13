---
title: Shell 脚本自动化实战
description: 实用 Shell 脚本集合，包括日志分析、服务巡检、备份脚本、定时任务等运维场景
date: 2026-07-09
tags:
  - Shell
  - 脚本
  - 自动化运维
---

# Shell 脚本自动化实战

## 一、日志分析脚本

### 1.1 Nginx 日志分析

```bash
#!/bin/bash

LOG_FILE="/var/log/nginx/access.log"

# 统计访问量 Top 10 IP
echo "=== 访问量 Top 10 IP ==="
awk '{print $1}' $LOG_FILE | sort | uniq -c | sort -rn | head -10

# 统计访问量 Top 10 URL
echo ""
echo "=== 访问量 Top 10 URL ==="
awk '{print $7}' $LOG_FILE | sort | uniq -c | sort -rn | head -10

# 统计状态码分布
echo ""
echo "=== 状态码分布 ==="
awk '{print $9}' $LOG_FILE | sort | uniq -c | sort -rn

# 统计响应时间超过 2s 的请求
echo ""
echo "=== 响应时间超过 2s 的请求 ==="
awk '$NF > 2.0 {print $7, $NF}' $LOG_FILE | sort -k2 -rn | head -20
```

### 1.2 错误日志监控

```bash
#!/bin/bash

ERROR_LOG="/var/log/nginx/error.log"
ALERT_EMAIL="admin@example.com"

# 检测最近 5 分钟的错误
ERRORS=$(tail -n 1000 $ERROR_LOG | grep -E "(error|warn|crit)" | tail -n 50)

if [ -n "$ERRORS" ]; then
    echo "Nginx 错误日志告警:"
    echo "$ERRORS" | mail -s "Nginx Error Alert" $ALERT_EMAIL
fi
```

## 二、服务巡检脚本

### 2.1 系统资源巡检

```bash
#!/bin/bash

echo "======================================"
echo "        系统资源巡检报告"
echo "======================================"
echo ""
echo "【主机信息】"
echo "主机名: $(hostname)"
echo "IP 地址: $(hostname -I)"
echo "系统版本: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "内核版本: $(uname -r)"
echo ""
echo "【CPU 使用率】"
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
echo "CPU 使用率: ${CPU_USAGE}%"
echo ""
echo "【内存使用】"
FREE_MEM=$(free -h | grep Mem)
echo "$FREE_MEM"
echo ""
echo "【磁盘使用】"
df -h | grep -E "^/dev/"
echo ""
echo "【网络连接】"
echo "TCP 连接数: $(netstat -anp | grep tcp | wc -l)"
echo "ESTABLISHED: $(netstat -anp | grep ESTABLISHED | wc -l)"
echo ""
echo "【服务状态】"
for service in nginx mysql redis; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service: running"
    else
        echo "❌ $service: stopped"
    fi
done
echo ""
echo "======================================"
echo "报告生成时间: $(date "+%Y-%m-%d %H:%M:%S")"
echo "======================================"
```

### 2.2 端口扫描

```bash
#!/bin/bash

HOST="localhost"
PORTS="22 80 443 3306 6379 8080"

echo "=== 端口扫描结果 ==="
for port in $PORTS; do
    if timeout 1 bash -c "echo > /dev/tcp/$HOST/$port" 2>/dev/null; then
        echo "✅ $HOST:$port - OPEN"
    else
        echo "❌ $HOST:$port - CLOSED"
    fi
done
```

## 三、备份脚本

### 3.1 MySQL 全量备份

```bash
#!/bin/bash

BACKUP_DIR="/backup/mysql"
DATE=$(date "+%Y%m%d")
RETENTION_DAYS=7
MYSQL_USER="backup"
MYSQL_PASSWORD="password"

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 备份所有数据库
databases=$(mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -e "SHOW DATABASES;" | grep -Ev "(Database|information_schema|performance_schema|sys)")

for db in $databases; do
    echo "备份数据库: $db"
    mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD --single-transaction --routines --triggers $db \
        | gzip > $BACKUP_DIR/$DATE/$db.sql.gz
done

# 清理旧备份
find $BACKUP_DIR -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;

echo "备份完成！备份目录: $BACKUP_DIR/$DATE"
```

### 3.2 文件增量备份

```bash
#!/bin/bash

SOURCE_DIR="/var/www/html"
BACKUP_DIR="/backup/web"
DATE=$(date "+%Y%m%d")

# 使用 rsync 增量备份
rsync -av --delete --link-dest=$BACKUP_DIR/latest \
    $SOURCE_DIR $BACKUP_DIR/$DATE

# 更新 latest 链接
rm -f $BACKUP_DIR/latest
ln -s $BACKUP_DIR/$DATE $BACKUP_DIR/latest

echo "增量备份完成！"
```

## 四、定时任务配置

### 4.1 常用 Cron 示例

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点执行 MySQL 备份
0 2 * * * /usr/bin/bash /scripts/mysql_backup.sh >> /var/log/backup.log 2>&1

# 每小时执行系统巡检
0 * * * * /usr/bin/bash /scripts/health_check.sh >> /var/log/health.log 2>&1

# 每天凌晨 3 点清理日志
0 3 * * * find /var/log -name "*.log" -type f -mtime +30 -exec rm -f {} \;

# 每周日凌晨 1 点执行全量备份
0 1 * * 0 /usr/bin/bash /scripts/full_backup.sh >> /var/log/full_backup.log 2>&1
```

## 五、自动化运维脚本

### 5.1 批量执行命令

```bash
#!/bin/bash

HOSTS_FILE="/tmp/hosts.txt"
COMMAND="$1"

echo "=== 批量执行命令 ==="
echo "命令: $COMMAND"
echo ""

while read host; do
    echo "--- $host ---"
    ssh -o StrictHostKeyChecking=no $host "$COMMAND"
    echo ""
done < $HOSTS_FILE
```

### 5.2 服务自动重启

```bash
#!/bin/bash

SERVICE_NAME="nginx"
MAX_RETRY=3

for ((i=1; i<=$MAX_RETRY; i++)); do
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo "$SERVICE_NAME 运行正常"
        exit 0
    fi
    
    echo "第 $i 次尝试重启 $SERVICE_NAME..."
    systemctl restart $SERVICE_NAME
    sleep 3
done

echo "警告: $SERVICE_NAME 重启失败，请手动检查！"
exit 1
```

## 六、脚本最佳实践

```bash
#!/bin/bash

# 1. 设置脚本选项
set -euo pipefail

# 2. 定义变量
SCRIPT_NAME=$(basename "$0")
LOG_FILE="/var/log/${SCRIPT_NAME%.sh}.log"

# 3. 日志函数
log() {
    echo "[$(date "+%Y-%m-%d %H:%M:%S")] $1" >> $LOG_FILE
}

# 4. 错误处理
error_exit() {
    log "ERROR: $1"
    echo "ERROR: $1" >&2
    exit 1
}

# 5. 参数检查
if [ $# -ne 2 ]; then
    error_exit "用法: $SCRIPT_NAME <参数1> <参数2>"
fi

# 6. 主逻辑
log "脚本开始执行"
# ...
log "脚本执行完成"
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
