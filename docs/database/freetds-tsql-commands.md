---
title: FreeTDS tsql 连接 SQL Server 常用命令手册
date: 2026-07-20
description: 使用 FreeTDS tsql 命令行工具连接和操作 SQL Server 的常用命令，包含查询、切换数据库、DML操作等
tags: [sqlserver, freetds, tsql, 数据库]
---

# FreeTDS tsql 连接 SQL Server 常用命令手册

## 一、连接数据库

```bash
tsql -S 192.168.1.96:49165 -U sa -P
```

若 `-P` 后无密码，回车后会提示输入密码（不显示），输入后回车。

## 二、常用操作

每条 SQL 后必须单独一行输入 `go` 并回车执行。

### 1. 查看 SQL Server 版本
```sql
SELECT @@VERSION;
go
```

### 2. 查看所有数据库
```sql
SELECT name FROM sys.databases;
go
```

### 3. 切换数据库
```sql
-- 普通名称
USE master;
go

-- 名称以数字开头或包含特殊符号
USE [123];
go
```

### 4. 查看当前数据库
```sql
SELECT DB_NAME();
go
```

### 5. 查看当前登录用户
```sql
SELECT SYSTEM_USER;
go
```

### 6. 查看所有用户表
```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';
go
```

### 7. 查看表结构
```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Users';
go
```

### 8. 查询数据
```sql
-- 前N行
SELECT TOP 10 * FROM Users;
go

-- 条件查询
SELECT * FROM Users WHERE id = 123;
go
```

### 9. 更新数据
```sql
UPDATE Users SET name = '新名字' WHERE id = 1;
go
```

### 10. 插入数据
```sql
INSERT INTO Users (name, age) VALUES ('李四', 25);
go
```

### 11. 删除数据
```sql
DELETE FROM Users WHERE id = 999;
go
```

### 12. 执行存储过程
```sql
EXEC 存储过程名 @参数 = 值;
go
```

### 13. 查看会话信息
```sql
SELECT session_id, login_name, status FROM sys.dm_exec_sessions;
go
```

### 14. 退出 tsql
```sql
quit
```