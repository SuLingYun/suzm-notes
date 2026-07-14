---
title: MySQL 数据库 binlog 日志正确清理方法
date: 2026-07-12
description: MySQL 数据库 binlog 二进制日志的自动过期清理、手动安全删除方法，以及查看 binlog 状态、刷新日志等相关命令详解
tags: [mysql, database, binlog, 日志清理]
---

# MySQL 数据库 binlog 日志正确清理

## 1、自动删除

永久生效：修改 mysql 的配置文件 my.cnf，添加 binlog 过期时间的配置项：expire_logs_days=30，然后重启 mysql，这个有个致命的缺点就是需要重启 mysql。

```sh
expire_logs_days=30
```

临时生效：进入 mysql，用以下命令设置全局的参数：set global expire_logs_days=30;

```sh
mysql> show variables like 'expire_logs_days';
+------------------+-------+
| Variable_name    | Value |
+------------------+-------+
| expire_logs_days | 0     |
+------------------+-------+
1 row in set (0.00 sec)
```

```sh
mysql> set global expire_logs_days = 30;
Query OK, 0 rows affected (0.00 sec)
```

```sh
mysql> show variables like 'expire_logs_days';
+------------------+-------+
| Variable_name    | Value |
+------------------+-------+
| expire_logs_days | 30    |
+------------------+-------+
1 row in set (0.00 sec)
```

## 2、手动删除

可以直接删除 binlog 文件，但是通过 mysql 提供的工具来删除更安全，因为 purge 会更新 mysql-bin.index 中的条目，而直接删除的话，mysql-bin.index 文件不会更新。mysql-bin.index 的作用是加快查找 binlog 文件的速度。

- **Linux 找到 MySQL 的 binlog 目录直接 rm -rf 删除**

- **通过 mysql 提供的工具来删除**
  ```sh
  purge master logs before '2022-01-01 00:00:00';  //删除2022-01-01 00:00:00之前产生的所有日志
  purge master logs to 'mysql-bin.000002';   //删除mysql-bin.000002之前所有日志
  ```

## 3、其它命令

## 查看是否开启 binlog

```sh
mysql> show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | ON    |
+---------------+-------+
1 row in set (0.01 sec)
```

如果 binlog 没有开启，可以通过 set sql_log_bin=1 命令来启用；如果想停用 binlog，可以使用 set sql_log_bin=0。

## 获取 binlog 文件列表

```sh
mysql> show binary logs;
+------------------+-----------+
| Log_name         | File_size |
+------------------+-----------+
| mysql-bin.000009 | 584660236 |
+------------------+-----------+
1 row in set (0.00 sec)
```

## 查看 master 上的 binlog

```sh
mysql> show master logs;
+------------------+-----------+
| Log_name         | File_size |
+------------------+-----------+
| mysql-bin.000009 | 584660236 |
+------------------+-----------+
1 row in set (0.00 sec)
```

## 4、binlog 的扩展

当停止或重启服务器时，服务器会把日志文件记入下一个日志文件，Mysql 会在重启时生成一个新的日志文件，文件序号递增；此外，如果日志文件超过 max_binlog_size（默认值 1G）系统变量配置的上限时，也会生成新的日志文件（在这里需要注意的是，如果你正使用大的事务，二进制日志还会超过 max_binlog_size，不会生成新的日志文件，事务全写入一个二进制日志中，这种情况主要是为了保证事务的完整性）；日志被刷新时，新生成一个日志文件。

## 刷新 binlog 日志，重新生成一个日志文件

```sh
mysql> flush logs;
```
## 删除所有二进制日志，并重新 (Mysql-bin.000001) 开始记录，然后可以通过如下代码查看数据库所有日志文件：

```sh
mysql> reset master;
```