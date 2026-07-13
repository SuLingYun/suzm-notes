---
title: MySQL 主从复制配置
description: MySQL 主从复制从入门到精通，包括异步复制、半同步复制、GTID、故障切换等
date: 2026-07-09
tags:
  - MySQL
  - 主从复制
  - 数据库
---

# MySQL 主从复制配置

## 一、环境准备

### 1.1 主库配置

```bash
# 编辑 my.cnf
cat >> /etc/my.cnf <<EOF
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = row
sync-binlog = 1
innodb_flush_log_at_trx_commit = 1
EOF

systemctl restart mysqld

# 创建复制用户
mysql -u root -p
CREATE USER 'repl'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;

# 查看主库状态
SHOW MASTER STATUS;
```

### 1.2 从库配置

```bash
# 编辑 my.cnf
cat >> /etc/my.cnf <<EOF
[mysqld]
server-id = 2
relay-log = relay-bin
read_only = 1
log_slave_updates = 1
EOF

systemctl restart mysqld
```

## 二、全量备份与恢复

```bash
# 在主库执行全量备份
mysqldump -u root -p --all-databases --master-data=2 --single-transaction > backup.sql

# 复制到从库
scp backup.sql slave:/tmp/

# 在从库恢复
mysql -u root -p < /tmp/backup.sql
```

## 三、配置从库复制

```bash
# 在从库执行
CHANGE MASTER TO
    MASTER_HOST='192.168.1.100',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=107;

# 启动复制
START SLAVE;

# 查看状态
SHOW SLAVE STATUS\G
```

## 四、半同步复制

```bash
# 在主库安装插件
INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';
SET GLOBAL rpl_semi_sync_master_enabled = 1;
SET GLOBAL rpl_semi_sync_master_timeout = 10000;

# 在从库安装插件
INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';
SET GLOBAL rpl_semi_sync_slave_enabled = 1;

# 重启复制线程
STOP SLAVE IO_THREAD;
START SLAVE IO_THREAD;
```

## 五、GTID 复制

```bash
# 主库配置
cat >> /etc/my.cnf <<EOF
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = row
gtid_mode = ON
enforce_gtid_consistency = ON
EOF

# 从库配置
cat >> /etc/my.cnf <<EOF
[mysqld]
server-id = 2
gtid_mode = ON
enforce_gtid_consistency = ON
EOF

# 配置 GTID 复制
CHANGE MASTER TO
    MASTER_HOST='192.168.1.100',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_AUTO_POSITION = 1;

START SLAVE;
```

## 六、故障切换

```bash
# 查看从库延迟
SHOW SLAVE STATUS\G

# 停止复制
STOP SLAVE;

# 提升从库为主库
RESET MASTER;

# 其他从库指向新主库
CHANGE MASTER TO
    MASTER_HOST='192.168.1.101',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_AUTO_POSITION = 1;

START SLAVE;
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
