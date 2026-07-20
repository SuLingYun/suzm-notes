---
title: 达梦数据库常用命令
date: 2026-07-20
description: 达梦数据库（DM8）日常运维常用 SQL 命令，涵盖实例信息、表空间、会话监控、用户权限、备份恢复等
tags: [达梦, 数据库, dmdb, 运维]
---

# 达梦数据库常用命令

## 实例与基础信息

```sql
SELECT INSTANCE_NAME FROM V$INSTANCE;          -- 查看当前数据库实例名
SELECT NAME FROM V$DATABASE;                   -- 查询数据库名
SELECT * FROM V$VERSION;                       -- 查看版本（DM7）
SELECT ID_CODE();                              -- 查看版本（DM8）
SELECT * FROM V$LICENSE;                       -- 查看授权信息
SELECT STATUS$ FROM V$INSTANCE;                -- 查看数据库状态
SELECT * FROM V$DM_INI;                        -- 查看所有配置参数
SELECT SF_GET_CASE_SENSITIVE_FLAG();           -- 判断大小写敏感
```

## 表空间与数据文件

```sql
-- 查看所有表空间
SELECT * FROM V$TABLESPACE;

-- 查看数据文件列表
SELECT * FROM V$DATAFILE;

-- 查看表空间使用率
SELECT a.tablespace_name, total "总大小(MB)", free "剩余大小(MB)",
       (total - free) "已使用(MB)",
       ROUND((total - free) / total * 100, 2) "使用率(%)"
FROM (SELECT tablespace_name, SUM(bytes)/1024/1024 total FROM dba_data_files GROUP BY tablespace_name) a,
     (SELECT tablespace_name, SUM(bytes)/1024/1024 free FROM dba_free_space GROUP BY tablespace_name) b
WHERE a.tablespace_name = b.tablespace_name;
```

## 会话与 SQL 监控

```sql
-- 查看所有会话
SELECT * FROM V$SESSIONS;

-- 按状态统计会话数
SELECT COUNT(*), STATE FROM V$SESSIONS GROUP BY STATE;

-- 按客户端IP统计会话数
SELECT COUNT(*), CLNT_IP FROM V$SESSIONS GROUP BY CLNT_IP;

-- 查询慢SQL
SELECT * FROM V$LONG_EXEC_SQLS;

-- 查看锁等待情况
SELECT * FROM V$LOCK WHERE BLOCKED=1;
```

## 用户与权限管理

```sql
-- 查看所有用户
SELECT * FROM DBA_USERS;

-- 查看当前登录用户
SELECT * FROM USER_USERS;

-- 创建用户
CREATE USER test_user IDENTIFIED BY test123;

-- 修改密码
ALTER USER test_user IDENTIFIED BY new_password;

-- 锁定/解锁用户
ALTER USER test_user ACCOUNT LOCK;
ALTER USER test_user ACCOUNT UNLOCK;
```

## 备份恢复

```sql
-- 开启归档模式（需在MOUNT状态下执行）
ALTER DATABASE MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE ADD ARCHIVELOG 'DEST=/dmarch, TYPE=LOCAL';
ALTER DATABASE OPEN;

-- 执行全量热备
BACKUP DATABASE FULL BACKUPSET '/dm8/backup';
```

## 集群与日志

```sql
-- 查看主备同步状态
SELECT * FROM V$DATAGUARD_STATS;

-- 查看集群节点信息（MPP/DSC）
SELECT * FROM V$CLUSTER_NODES;

-- 开启SQL日志
SP_SET_PARA_VALUE(1, 'SVR_LOG', 1);
```

## 操作系统命令

```bash
# 查看实例服务名称
ll Dm*

# 实时查看告警日志
tail -f $DM_HOME/log/dm_alert_实例名.log

# 逻辑导出
dexp 用户名/密码 DIRECTORY=/dm8/backup FILE=full.dmp FULL=Y LOG=full.log

# 物理还原恢复
dmrman restore database '/dm/data/dm.ini' from backupset '/dm/backup'

# 物理恢复归档
dmrman recover database '/dm/data/dm.ini' with archivedir '/dm/arch'
```