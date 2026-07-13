---
title: Redis 缓存策略与高可用
description: Redis 缓存策略、哨兵模式、Cluster 集群、性能调优等实战经验
date: 2026-07-09
tags:
  - Redis
  - 缓存
  - 高可用
---

# Redis 缓存策略与高可用

## 一、缓存策略

### 1.1 缓存穿透

```bash
# 使用布隆过滤器
redis-cli BF.ADD bloom_filter "user_123"
redis-cli BF.EXISTS bloom_filter "user_123"

# 空值缓存
redis-cli SET user:9999 "" EX 60
```

### 1.2 缓存击穿

```bash
# 设置热点数据永不过期
redis-cli SET hot:article:1 "content"

# 互斥锁
redis-cli SET lock:article:1 "1" NX EX 10
```

### 1.3 缓存雪崩

```bash
# 随机过期时间
redis-cli SET cache:key "value" EX $((3600 + RANDOM % 3600))

# 多级缓存
# L1: 本地缓存（Caffeine）
# L2: Redis 缓存
# L3: 数据库
```

## 二、哨兵模式

```bash
# sentinel.conf 配置
cat > /etc/redis/sentinel.conf <<EOF
port 26379
sentinel monitor mymaster 192.168.1.100 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel failover-timeout mymaster 180000
sentinel parallel-syncs mymaster 1
EOF

# 启动哨兵
redis-server /etc/redis/sentinel.conf --sentinel

# 查看哨兵状态
redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster
```

## 三、Cluster 集群

```bash
# 创建集群
redis-cli --cluster create \
    192.168.1.100:6379 \
    192.168.1.101:6379 \
    192.168.1.102:6379 \
    192.168.1.103:6379 \
    192.168.1.104:6379 \
    192.168.1.105:6379 \
    --cluster-replicas 1

# 添加节点
redis-cli --cluster add-node 192.168.1.106:6379 192.168.1.100:6379

# 查看集群状态
redis-cli CLUSTER INFO
redis-cli CLUSTER NODES
```

## 四、性能调优

```bash
# redis.conf 优化
cat >> /etc/redis/redis.conf <<EOF
maxmemory 4gb
maxmemory-policy allkeys-lru

bind 127.0.0.1 192.168.1.100
protected-mode no

tcp-keepalive 300
tcp-backlog 511

save 60 10000
rdbcompression yes

appendonly yes
appendfsync everysec
EOF

# 查看性能指标
redis-cli INFO memory
redis-cli INFO stats
redis-cli INFO replication
```

## 五、常用命令

```bash
# 数据操作
redis-cli SET key value EX 3600
redis-cli GET key
redis-cli DEL key
redis-cli EXISTS key

# 哈希操作
redis-cli HSET user:1 name "suzm" age "30"
redis-cli HGETALL user:1

# 列表操作
redis-cli LPUSH queue task1
redis-cli RPOP queue

# 集合操作
redis-cli SADD set member
redis-cli SMEMBERS set

# 有序集合
redis-cli ZADD sorted 100 member1
redis-cli ZRANGE sorted 0 -1 WITHSCORES
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
