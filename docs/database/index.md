# 数据库运维笔记

> 本索引页汇总了数据库相关的运维笔记，涵盖 MySQL、Redis 等主流数据库的安装部署、配置优化、监控告警、备份恢复及故障处理等实践内容。

---

## 文章列表

<CategoryList category="数据库" />

---

## 常用运维命令速查表

### MySQL 常用命令

| 操作 | 命令 |
|------|------|
| 登录数据库 | `mysql -u root -p` |
| 查看数据库列表 | `SHOW DATABASES;` |
| 查看慢查询日志状态 | `SHOW VARIABLES LIKE 'slow_query_log%';` |
| 查看正在执行的线程 | `SHOW FULL PROCESSLIST;` |
| 查看主库状态 | `SHOW MASTER STATUS\G` |
| 查看从库状态 | `SHOW SLAVE STATUS\G` |
| 查看 Innodb 状态 | `SHOW ENGINE INNODB STATUS\G` |
| 分析表索引 | `ANALYZE TABLE table_name;` |
| 优化表 | `OPTIMIZE TABLE table_name;` |
| 导出数据库 | `mysqldump -u root -p db_name > backup.sql` |
| 导入数据库 | `mysql -u root -p db_name < backup.sql` |

### Redis 常用命令

| 操作 | 命令 |
|------|------|
| 连接 Redis | `redis-cli -h host -p 6379` |
| 查看所有键 | `KEYS *` |
| 查看键类型 | `TYPE key` |
| 查看键存活时间 | `TTL key` |
| 查看服务器信息 | `INFO` |
| 查看内存使用 | `INFO memory` |
| 慢查询日志列表 | `SLOWLOG GET 10` |
| 监控实时命令 | `MONITOR` |
| 查看集群节点 | `CLUSTER NODES` |
| 查看集群信息 | `CLUSTER INFO` |
| 数据持久化触发 | `BGSAVE` |
| 刷新所有数据 | `FLUSHALL` |

### 通用运维命令

| 操作 | 命令 |
|------|------|
| 查看端口占用 | `ss -tlnp \| grep <port>` |
| 查看磁盘使用 | `df -h` |
| 查看内存使用 | `free -h` |
| 查看进程 | `ps aux \| grep <process_name>` |
| 实时日志跟踪 | `tail -f /var/log/<logfile>` |
| 查看系统负载 | `uptime` |
| 查看磁盘 IO | `iostat -x 1` |
| 查看网络连接数 | `netstat -an \| wc -l` |

---

## 监控与告警要点

- **连接数监控**：数据库连接池使用率超过 80% 时触发告警
- **慢查询监控**：慢查询日志中超过 `long_query_time` 阈值的 SQL 需要及时优化
- **主从延迟监控**：`Seconds_Behind_Master` 持续大于阈值时需排查
- **磁盘空间监控**：数据目录磁盘使用率超过 85% 时需扩容或清理
- **内存使用监控**：内存使用率超过 90% 或 Swap 使用率异常增长时需关注
- **QPS/TPS 监控**：每秒查询数和事务数出现异常波动时需排查原因

---

## 备份策略建议

| 数据库 | 备份方式 | 频率 | 保留周期 |
|--------|----------|------|----------|
| MySQL | 全量备份（XtraBackup） | 每日 | 7 天 |
| MySQL | 增量备份 | 每 2 小时 | 3 天 |
| MySQL | Binlog 归档 | 实时 | 30 天 |
| Redis | RDB 快照 | 每 30 分钟 | 3 天 |
| Redis | AOF 日志 | 实时 | 7 天 |

---

> **参考文档**：[MySQL 运维指南](./mysql.md) | [Redis 运维指南](./redis.md)