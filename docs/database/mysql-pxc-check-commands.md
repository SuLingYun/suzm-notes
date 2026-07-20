---
title: MySQL PXC 集群日常运维状态检查命令
date: 2026-07-20
description: Percona XtraDB Cluster（PXC）集群日常运维中常用的状态检查 SQL 命令，涵盖集群状态、节点同步、流控制等
tags: [mysql, pxc, 集群, 运维]
---

# MySQL PXC 集群日常运维中常用的状态检查命令

```sql
-- 1. 查看集群整体状态
SHOW STATUS LIKE 'wsrep%';

-- 2. 检查集群节点数量
SHOW STATUS LIKE 'wsrep_cluster_size';

-- 3. 查看节点同步状态
SHOW STATUS LIKE 'wsrep_local_state_comment';

-- 4. 检查节点是否就绪
SHOW STATUS LIKE 'wsrep_ready';

-- 5. 查看集群成员详情
SELECT * FROM performance_schema.replication_group_members;

-- 6. 检查流控制状态
SHOW STATUS LIKE 'wsrep_flow_control%';

-- 7. 查看复制延迟情况
SHOW STATUS LIKE 'wsrep_local_recv_queue_avg';

-- 8. 检查 SST 传输状态
SHOW STATUS LIKE 'wsrep_sst%';

-- 9. 查看最近事务状态
SHOW STATUS LIKE 'wsrep_last_committed';

-- 10. 检查节点连接状态
SHOW STATUS LIKE 'wsrep_connected';
```