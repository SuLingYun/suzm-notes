---
title: MySQL 运维指南
description: 涵盖 MySQL 主从复制、性能优化、备份恢复及常见故障处理的完整运维手册
date: 2026-07-08
tags:
  - MySQL
  - 数据库
  - 主从复制
  - 性能优化
  - 备份恢复
---

# MySQL 运维指南

## 目录

1. [主从复制配置](#主从复制配置)
2. [性能优化](#性能优化)
3. [备份恢复](#备份恢复)
4. [常见故障处理](#常见故障处理)

---

## 主从复制配置

### 复制原理概述

MySQL 主从复制基于二进制日志（Binary Log）机制，主库将数据变更写入 Binlog，从库通过 I/O 线程拉取 Binlog 并写入中继日志（Relay Log），再由 SQL 线程重放 Relay Log 实现数据同步。

```
主库 → Binlog → I/O 线程 → Relay Log → SQL 线程 → 从库
```

### 主库配置

编辑 `/etc/my.cnf` 或 `/etc/mysql/mysql.conf.d/mysqld.cnf`：

```ini
[mysqld]
server_id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
expire_logs_days = 7
max_binlog_size = 100M
binlog_do_db = your_database       # 可选：指定需要复制的数据库
# binlog_ignore_db = mysql          # 可选：忽略不需要复制的数据库
```

创建复制用户：

```bash
mysql -u root -p -e "
CREATE USER 'repl'@'%' IDENTIFIED BY 'Repl_Password_123';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
"
```

查看主库状态：

```bash
mysql -u root -p -e "SHOW MASTER STATUS\G"
```

记录 `File` 和 `Position` 字段值，后续从库配置需要用到。

### 从库配置

编辑从库的 `my.cnf`：

```ini
[mysqld]
server_id = 2
relay_log = /var/log/mysql/mysql-relay-bin.log
log_bin = /var/log/mysql/mysql-bin.log
read_only = 1
# super_read_only = 1              # 8.0+ 可选，限制 super 用户写入
skip_slave_start = 1               # 避免启动时自动复制
```

配置从库连接主库并启动复制：

```bash
mysql -u root -p -e "
CHANGE MASTER TO
  MASTER_HOST='192.168.1.100',
  MASTER_USER='repl',
  MASTER_PASSWORD='Repl_Password_123',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;
START SLAVE;
"
```

验证从库状态：

```bash
mysql -u root -p -e "SHOW SLAVE STATUS\G"
```

关键检查项：

| 状态字段 | 期望值 | 说明 |
|----------|--------|------|
| `Slave_IO_Running` | `Yes` | I/O 线程连接主库正常 |
| `Slave_SQL_Running` | `Yes` | SQL 线程重放日志正常 |
| `Seconds_Behind_Master` | `0` | 主从延迟时间（秒） |
| `Last_IO_Errno` | `0` | I/O 线程错误码 |
| `Last_SQL_Errno` | `0` | SQL 线程错误码 |

### GTID 复制（推荐）

MySQL 5.7+ 支持 GTID（全局事务标识）复制，配置更简洁，故障切换更方便。

主库配置追加：

```ini
gtid_mode = ON
enforce_gtid_consistency = ON
```

从库配置追加：

```ini
gtid_mode = ON
enforce_gtid_consistency = ON
```

从库连接命令更简洁（无需指定日志文件和位置）：

```bash
CHANGE MASTER TO
  MASTER_HOST='192.168.1.100',
  MASTER_USER='repl',
  MASTER_PASSWORD='Repl_Password_123',
  MASTER_AUTO_POSITION=1;
START SLAVE;
```

### 半同步复制

在传统异步复制基础上，确保至少一个从库收到 Binlog 后才提交事务。

```bash
# 主库安装插件
INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';
SET GLOBAL rpl_semi_sync_master_enabled = 1;
SET GLOBAL rpl_semi_sync_master_timeout = 1000;  # 1秒超时回退至异步

# 从库安装插件
INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';
SET GLOBAL rpl_semi_sync_slave_enabled = 1;
STOP SLAVE IO_THREAD;
START SLAVE IO_THREAD;
```

---

## 性能优化

### 慢查询日志

启用慢查询日志以定位性能瓶颈：

```ini
[mysqld]
slow_query_log = ON
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2                # 超过 2 秒的查询记录
log_queries_not_using_indexes = ON # 记录未使用索引的查询
min_examined_row_limit = 1000      # 扫描行数超过此值的查询才记录
```

分析慢查询日志：

```bash
# 使用 mysqldumpslow 工具汇总
mysqldumpslow -s t -t 10 /var/log/mysql/mysql-slow.log

# 使用 pt-query-digest（Percona Toolkit）
pt-query-digest /var/log/mysql/mysql-slow.log > slow_query_report.txt
```

### 索引优化

**索引设计原则：**

1. 为 `WHERE`、`JOIN`、`ORDER BY`、`GROUP BY` 涉及的列创建索引
2. 选择性高的列优先作为索引前缀列
3. 避免在索引列上使用函数或运算
4. 使用联合索引时遵循最左前缀原则
5. 控制单表索引数量，建议不超过 5-6 个

**常用索引分析命令：**

```sql
-- 查看表的索引
SHOW INDEX FROM table_name;

-- 分析查询是否使用索引
EXPLAIN SELECT * FROM orders WHERE order_status = 'pending';

-- 查看索引使用情况
SHOW GLOBAL STATUS LIKE 'Handler_read%';

-- 查看未使用索引的查询
SELECT * FROM sys.schema_unused_indexes;
```

**EXPLAIN 输出关键字段解读：**

| 字段 | 说明 | 优化方向 |
|------|------|----------|
| `type` | 访问类型 | `const` > `eq_ref` > `ref` > `range` > `index` > `ALL` |
| `key` | 实际使用的索引 | 为 `NULL` 则需要添加索引 |
| `rows` | 预估扫描行数 | 越小越好 |
| `Extra` | 额外信息 | `Using filesort` / `Using temporary` 需要优化 |
| `possible_keys` | 可能使用的索引 | 为空说明无可用索引 |

### 配置参数优化

```ini
[mysqld]
# InnoDB 缓冲池大小（建议设置为物理内存的 60%-70%）
innodb_buffer_pool_size = 4G
# 缓冲池实例数量（减少锁争用）
innodb_buffer_pool_instances = 8
# 日志文件大小
innodb_log_file_size = 512M
# 日志缓冲区大小
innodb_log_buffer_size = 16M
# 脏页刷新比例（IO 密集场景调低）
innodb_io_capacity = 2000
innodb_io_capacity_max = 3000
# 事务隔离级别（默认即可）
transaction_isolation = READ-COMMITTED
# 连接相关
max_connections = 500
max_allowed_packet = 64M
wait_timeout = 600
interactive_timeout = 1800
# 查询缓存（MySQL 8.0 已废弃，此处为 5.7 参考）
# query_cache_type = 0
# 临时表大小
tmp_table_size = 64M
max_heap_table_size = 64M
# 排序缓冲区
sort_buffer_size = 2M
# 连接缓冲区
join_buffer_size = 2M
```

### 常见性能监控 SQL

```sql
-- 查看当前活跃连接
SELECT ID, USER, HOST, DB, COMMAND, TIME, STATE, INFO
FROM information_schema.PROCESSLIST
WHERE COMMAND != 'Sleep' AND TIME > 10;

-- 查看全表扫描的查询
SELECT * FROM sys.statements_with_full_table_scans;

-- 查看排序导致的临时表
SELECT * FROM sys.statements_with_temp_tables;

-- 查看冗余索引
SELECT * FROM sys.schema_redundant_indexes;

-- 查看 InnoDB 行锁等待
SELECT * FROM sys.innodb_lock_waits;

-- 查看表大小
SELECT TABLE_SCHEMA, TABLE_NAME,
       ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)',
       TABLE_ROWS
FROM information_schema.TABLES
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
LIMIT 20;

-- 查看 Buffer Pool 使用情况
SHOW ENGINE INNODB STATUS\G
SELECT
  (SELECT COUNT(*) FROM information_schema.INNODB_BUFFER_PAGE) AS total_pages,
  (SELECT COUNT(*) FROM information_schema.INNODB_BUFFER_PAGE WHERE STATE = 'FILE_PAGE') AS data_pages,
  (SELECT ROUND(SUM(DATA_SIZE) / 1024 / 1024) FROM information_schema.INNODB_BUFFER_PAGE) AS buffer_mb;
```

---

## 备份恢复

### mysqldump 逻辑备份

**全量备份：**

```bash
# 备份单个数据库
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --set-gtid-purged=OFF \
  your_database > /backup/mysql/your_database_$(date +%F).sql

# 备份所有数据库
mysqldump -u root -p \
  --single-transaction \
  --all-databases \
  --routines \
  --triggers \
  --events \
  --master-data=2 \
  > /backup/mysql/full_backup_$(date +%F).sql

# 仅备份表结构
mysqldump -u root -p --no-data your_database > schema_only.sql

# 仅备份数据
mysqldump -u root -p --no-create-info your_database > data_only.sql
```

**数据恢复：**

```bash
# 恢复单个数据库
mysql -u root -p your_database < /backup/mysql/your_database_2026-07-08.sql

# 恢复所有数据库
mysql -u root -p < /backup/mysql/full_backup_2026-07-08.sql

# 压缩备份与恢复
mysqldump -u root -p your_database | gzip > backup_$(date +%F).sql.gz
gunzip < backup_2026-07-08.sql.gz | mysql -u root -p your_database
```

### XtraBackup 物理备份（推荐）

Percona XtraBackup 支持在线热备，不锁表，适合大数据库。

**安装：**

```bash
# Ubuntu / Debian
wget https://repo.percona.com/apt/percona-release_latest.$(lsb_release -sc)_all.deb
dpkg -i percona-release_latest.$(lsb_release -sc)_all.deb
percona-release setup ps80
apt-get install percona-xtrabackup-80

# CentOS / RHEL
yum install https://repo.percona.com/yum/percona-release-latest.noarch.rpm
percona-release setup ps80
yum install percona-xtrabackup-80
```

**全量备份：**

```bash
# 创建备份
xtrabackup --backup \
  --user=root \
  --password=your_password \
  --target-dir=/backup/mysql/full_$(date +%F)

# 准备备份（回滚未提交事务，前滚已提交事务）
xtrabackup --prepare \
  --target-dir=/backup/mysql/full_2026-07-08
```

**增量备份：**

```bash
# 基于全量备份做第一次增量
xtrabackup --backup \
  --user=root \
  --password=your_password \
  --target-dir=/backup/mysql/inc1_$(date +%F) \
  --incremental-basedir=/backup/mysql/full_2026-07-08

# 基于上一次增量备份再做增量
xtrabackup --backup \
  --user=root \
  --password=your_password \
  --target-dir=/backup/mysql/inc2_$(date +%F) \
  --incremental-basedir=/backup/mysql/inc1_2026-07-08
```

**增量备份恢复：**

```bash
# 准备基础全量备份
xtrabackup --prepare --apply-log-only \
  --target-dir=/backup/mysql/full_2026-07-08

# 合并第一次增量
xtrabackup --prepare --apply-log-only \
  --target-dir=/backup/mysql/full_2026-07-08 \
  --incremental-dir=/backup/mysql/inc1_2026-07-08

# 合并第二次增量（最后一次不加 --apply-log-only）
xtrabackup --prepare \
  --target-dir=/backup/mysql/full_2026-07-08 \
  --incremental-dir=/backup/mysql/inc2_2026-07-08

# 恢复（需停 MySQL 服务）
systemctl stop mysql
rm -rf /var/lib/mysql/*
xtrabackup --copy-back \
  --target-dir=/backup/mysql/full_2026-07-08
chown -R mysql:mysql /var/lib/mysql
systemctl start mysql
```

### Binlog 闪回恢复

```bash
# 将 Binlog 转为可读的 SQL
mysqlbinlog /var/log/mysql/mysql-bin.000023 > binlog_023.sql

# 基于时间点恢复
mysqlbinlog \
  --start-datetime="2026-07-08 10:00:00" \
  --stop-datetime="2026-07-08 11:00:00" \
  /var/log/mysql/mysql-bin.000023 | mysql -u root -p

# 基于位置点恢复
mysqlbinlog \
  --start-position=1200 \
  --stop-position=4500 \
  /var/log/mysql/mysql-bin.000023 | mysql -u root -p
```

### 备份策略脚本示例

```bash
#!/bin/bash
# /usr/local/bin/mysql_backup.sh - MySQL 全量备份脚本
set -e

BACKUP_DIR="/backup/mysql"
DATE=$(date +%F)
BACKUP_USER="backup_user"
BACKUP_PASS="Backup_Pass_123"
RETENTION_DAYS=7

mkdir -p "${BACKUP_DIR}/full"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting MySQL full backup..."

xtrabackup --backup \
  --user=${BACKUP_USER} \
  --password=${BACKUP_PASS} \
  --target-dir=${BACKUP_DIR}/full/${DATE} \
  --compress

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Preparing backup..."

xtrabackup --prepare \
  --target-dir=${BACKUP_DIR}/full/${DATE}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed."

# 清理过期备份
find ${BACKUP_DIR}/full -mtime +${RETENTION_DAYS} -exec rm -rf {} \;
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleaned backups older than ${RETENTION_DAYS} days."
```

---

## 常见故障处理

### 1. 主从同步中断

**现象：** `Slave_IO_Running: No` 或 `Slave_SQL_Running: No`

**排查步骤：**

```bash
# 步骤 1：查看详细错误信息
mysql -u root -p -e "SHOW SLAVE STATUS\G" | grep -E "Last_IO_Errno|Last_IO_Error|Last_SQL_Errno|Last_SQL_Error"

# 步骤 2：检查主库连接是否正常
mysql -u repl -p -h 192.168.1.100 -e "SELECT 1;"

# 步骤 3：检查主库 Binlog 是否被清理
mysql -u root -p -e "SHOW MASTER STATUS;"

# 步骤 4：检查网络连通性
ping -c 3 192.168.1.100
telnet 192.168.1.100 3306
```

**恢复方法：**

```bash
# 方法 A：跳过指定数量的错误（谨慎使用）
STOP SLAVE;
SET GLOBAL SQL_SLAVE_SKIP_COUNTER = 1;
START SLAVE;

# 方法 B：重建主从关系（推荐）
STOP SLAVE;
RESET SLAVE ALL;
CHANGE MASTER TO MASTER_HOST='192.168.1.100',
  MASTER_USER='repl',
  MASTER_PASSWORD='Repl_Password_123',
  MASTER_AUTO_POSITION=1;
START SLAVE;

# 方法 C：重新同步数据后重建（数据差异大时）
# 1. 主库加锁并记录位置
mysql -u root -p -e "FLUSH TABLES WITH READ LOCK; SHOW MASTER STATUS;"
# 2. 主库导出数据
mysqldump -u root -p --all-databases --master-data=2 > /tmp/full_dump.sql
# 3. 主库解锁
mysql -u root -p -e "UNLOCK TABLES;"
# 4. 从库导入数据
mysql -u root -p < /tmp/full_dump.sql
# 5. 从库重新配置主从
CHANGE MASTER TO ... ;
START SLAVE;
```

### 2. MySQL 无法启动

**排查流程：**

```bash
# 查看错误日志
tail -100 /var/log/mysql/error.log

# 检查配置文件语法
mysqld --validate-config

# 检查数据目录权限
ls -la /var/lib/mysql/
chown -R mysql:mysql /var/lib/mysql

# 检查磁盘空间
df -h /var/lib/mysql

# 尝试手动启动查看详细输出
mysqld --user=mysql --console
```

**常见原因及解决：**

| 原因 | 解决方法 |
|------|----------|
| 磁盘空间满 | 清理日志或扩容 `df -h` / `du -sh /var/lib/mysql` |
| `ibdata1` 损坏 | 从备份恢复或使用 `innodb_force_recovery` |
| 配置文件错误 | 使用 `mysqld --validate-config` 检查 |
| PID 文件冲突 | `rm -f /var/run/mysqld/mysqld.pid` 后重启 |
| 端口被占用 | `ss -tlnp \| grep 3306` 查看占用进程 |
| 内存不足 | 调整 `innodb_buffer_pool_size` 参数 |

**InnoDB 强制恢复模式：**

```ini
[mysqld]
# 从 1 开始尝试，逐步递增，恢复后尽快导出数据重建
innodb_force_recovery = 1
# 1 - 跳过坏页检查
# 2 - 不执行回滚操作
# 3 - 不执行事务回滚
# 4 - 不计算统计数据
# 5 - 不检查回滚日志
# 6 - 不执行前滚操作（恢复后需立即导出并重建）
```

### 3. 连接数打满

**现象：** `ERROR 1040 (HY000): Too many connections`

**紧急处理：**

```bash
# 以管理员身份登录（绕过连接数限制）
mysql -u root -p --max_allowed_packet=64M

# 查看当前连接情况
SELECT COUNT(*) AS total_connections FROM information_schema.PROCESSLIST;

# 按用户统计连接数
SELECT USER, HOST, COUNT(*) AS conn_count
FROM information_schema.PROCESSLIST
GROUP BY USER, HOST
ORDER BY conn_count DESC;

# 终止空闲连接（谨慎操作）
-- 杀掉空闲超过 300 秒的连接
SELECT CONCAT('KILL ', ID, ';') AS kill_query
FROM information_schema.PROCESSLIST
WHERE COMMAND = 'Sleep' AND TIME > 300;

# 临时调整最大连接数
SET GLOBAL max_connections = 1000;
```

**根本解决方案：**

1. 优化应用程序连接池配置（如 HikariCP、Druid）
2. 增加 `max_connections` 参数并重启 MySQL
3. 检查是否有连接泄漏，排查长时间未释放的连接
4. 考虑使用连接中间件（如 ProxySQL、HAProxy）

### 4. 死锁检测与处理

```sql
-- 查看最近死锁信息
SHOW ENGINE INNODB STATUS\G

-- 查看当前锁等待
SELECT * FROM information_schema.INNODB_LOCK_WAITS;

-- 查看事务列表
SELECT * FROM information_schema.INNODB_TRX\G

-- 杀掉阻塞事务
KILL <trx_mysql_thread_id>;
```

**预防死锁建议：**

- 事务中按固定顺序访问表/行
- 保持事务简短，减少锁持有时间
- 为高频查询的字段建立索引，减少锁范围
- 合理使用 `READ COMMITTED` 隔离级别
- 避免在事务中执行耗时操作（如外部 API 调用）

### 5. 磁盘空间告急

```bash
# 查看各目录占用
du -sh /var/lib/mysql/*

# 查看 Binlog 占用
du -sh /var/log/mysql/mysql-bin.*

# 清理过期 Binlog
mysql -u root -p -e "PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 3 DAY);"

# 查看慢查询日志大小
ls -lh /var/log/mysql/mysql-slow.log

# 清理慢查询日志（拷备后清空）
cp /var/log/mysql/mysql-slow.log /backup/mysql/mysql-slow_$(date +%F).log
truncate -s 0 /var/log/mysql/mysql-slow.log
```

---

> **参考文档**：[数据库运维笔记索引](./index.md) | [Redis 运维指南](./redis.md)

---


---


---


---
