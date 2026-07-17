---
title: 数据库运维笔记
description: 数据库运维相关技术笔记
---

<script setup>
import CategoryNav from '../.vitepress/theme/CategoryNav.vue'
</script>

<CategoryNav current="database" />

# 数据库运维笔记

本目录汇总了数据库相关的运维笔记，涵盖 MySQL、Redis 等主流数据库的安装部署、配置优化、监控告警、备份恢复及故障处理等实践内容。

## 涵盖内容

- **MySQL**：主从复制、PXC 高可用集群、binlog 管理、连接数排查
- **Redis**：缓存策略、高可用配置、性能优化
- **达梦数据库**：快速恢复工具集、运维管理

## 常用运维命令速查

| 操作 | 命令 |
|------|------|
| 登录 MySQL | `mysql -u root -p` |
| 查看进程列表 | `SHOW FULL PROCESSLIST;` |
| 查看主库状态 | `SHOW MASTER STATUS\G` |
| 查看从库状态 | `SHOW SLAVE STATUS\G` |
| 导出数据库 | `mysqldump -u root -p db_name > backup.sql` |
| 连接 Redis | `redis-cli -h host -p 6379` |
| 查看所有键 | `KEYS *` |
| 查看服务器信息 | `INFO` |
| 查看慢查询 | `SLOWLOG GET 10` |

> 持续更新中。