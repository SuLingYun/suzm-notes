---
title: Oracle 数据库运维命令大全（完整版）
date: 2026-07-20
description: Oracle 单实例和 RAC 集群的完整运维命令手册，包含登录、启动、关闭、状态检查、维护操作等
tags: [oracle, 数据库, 运维, RAC]
---

# Oracle 数据库运维命令大全（完整版）

## 一、单实例数据库操作命令

### 1. 登录数据库
```bash
su - oracle
sqlplus / as sysdba                 # 本地系统认证登录
sqlplus sys/密码 as sysdba          # 密码方式登录
sqlplus 用户名/密码                 # 普通用户登录
sqlplus 用户名/密码@主机名:端口/服务名 # 远程连接
```

### 2. 启动流程
```bash
# 步骤1：启动监听
lsnrctl start

# 步骤2：启动数据库
startup;                     # 正常启动
startup nomount;             # 仅启动实例
startup mount;               # 挂载控制文件
alter database open;         # 从MOUNT到OPEN
startup force;               # 强制启动
```

### 3. 关闭流程
```bash
# 步骤1：关闭数据库
shutdown immediate;          # 安全关闭（推荐）
shutdown transactional;      # 事务完成后关闭
shutdown abort;              # 强制关闭（仅紧急情况）

# 步骤2：关闭监听
lsnrctl stop
```

### 4. 状态检查
```sql
-- 数据库状态
select status from v$instance;
select open_mode from v$database;

-- 监听状态
lsnrctl status
ps -ef | grep pmon

-- 会话检查
select sid, serial#, username, status from v$session;
```

### 5. 常用维护命令
```sql
-- 查看版本
select * from v$version;

-- 参数管理
show parameter sga;
alter system set sga_target=2G scope=both;

-- 表空间管理
select tablespace_name, status from dba_tablespaces;
alter tablespace USERS add datafile '/path/file.dbf' size 100M;
```

## 二、RAC 集群数据库操作命令

### 1. 登录数据库
```bash
su - oracle
sqlplus / as sysdba
sqlplus sys/密码@服务名 as sysdba
```

### 2. 启动流程
```bash
# 步骤1：启动集群服务（root用户）
sudo crsctl start crs
crsctl check crs

# 步骤2：启动ASM实例
srvctl start asm

# 步骤3：启动数据库
srvctl start database -d 数据库名
srvctl start instance -d 数据库名 -i 实例名

# 步骤4：启动服务
srvctl start listener
srvctl start scan_listener
```

### 3. 关闭流程
```bash
# 步骤1：停止数据库
srvctl stop database -d 数据库名 -o immediate
srvctl stop instance -d 数据库名 -i 实例名

# 步骤2：停止ASM
srvctl stop asm

# 步骤3：停止集群（root用户）
sudo crsctl stop crs
```

### 4. 状态检查
```bash
# 集群状态
crsctl check cluster
crsctl stat res -t

# 数据库状态
srvctl status database -d 数据库名
srvctl status instance -d 数据库名 -i 实例名

# 节点状态
olsnodes -n
olsnodes -i

# 服务状态
srvctl status service -d 数据库名
srvctl status listener
```

### 5. 常用维护命令
```bash
# SCAN配置
srvctl config scan
srvctl status scan

# 资源管理
crsctl relocate service -d 数据库名 -s 服务名 -i 原节点 -t 目标节点

# ASM管理
asmcmd lsdg
asmcmd ls +DATA
```

## 三、关键区别对比表

| 操作 | 单实例命令 | RAC 命令 | 执行用户 |
|------|-----------|----------|----------|
| 启动数据库 | startup | srvctl start database | oracle |
| 关闭数据库 | shutdown immediate | srvctl stop database | oracle |
| 检查状态 | select from v$instance | crsctl stat res -t | oracle/root |
| 监听管理 | lsnrctl start/stop | srvctl start/stop listener | oracle |
| 集群控制 | 无 | crsctl start/stop crs | root |
| 节点管理 | 无 | olsnodes -n | oracle |

## 四、注意事项

1. **操作顺序**：
   - 启动顺序：集群服务 → ASM → 数据库 → 监听
   - 关闭顺序：监听 → 数据库 → ASM → 集群服务

2. **危险操作**：
   - `shutdown abort` 可能导致数据损坏
   - `crsctl stop crs -f` 会强制终止所有服务
   - 修改参数前必须备份 spfile

3. **日志位置**：
   - 单实例告警日志：`$ORACLE_BASE/diag/rdbms/$ORACLE_SID/trace/alert_$ORACLE_SID.log`
   - RAC 集群日志：`$GRID_HOME/log/[hostname]/alert[hostname].log`

4. **备份建议**：
   - 重要操作前执行：`rman backup database plus archivelog`
   - 定期备份：`$ORACLE_HOME/dbs/spfile[ORACLE_SID].ora`