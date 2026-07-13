---
title: Redis 运维指南
description: 涵盖 Redis 数据结构使用场景、持久化策略、高可用架构及缓存问题解决方案的运维手册
date: 2026-07-08
tags:
  - Redis
  - 缓存
  - 高可用
  - 持久化
  - Sentinel
  - Cluster
---

# Redis 运维指南

## 目录

1. [数据结构使用场景](#数据结构使用场景)
2. [持久化策略](#持久化策略)
3. [高可用架构](#高可用架构)
4. [缓存穿透/击穿/雪崩解决方案](#缓存穿透击穿雪崩解决方案)
5. [Key 管理命令](#key-管理命令)

---

## 数据结构使用场景

### 1. String（字符串）

**底层实现：** SDS（Simple Dynamic String）

**适用场景：**
- 缓存对象（JSON 序列化）
- 计数器（如 PV/UV、限流计数）
- 分布式锁
- 共享 Session

```bash
# 缓存对象
SET user:1001 '{"name":"张三","age":30}'
GET user:1001

# 计数器
INCR page:view:homepage
INCRBY article:1001:likes 5
DECR article:1001:likes

# 分布式锁（Nx 模式）
SET lock:order:1001 EX 30 NX
DEL lock:order:1001

# 分布式锁（推荐 Lua 脚本）
EVAL "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end" 1 lock:order:1001 my-uuid
```

### 2. Hash（哈希）

**底层实现：** ziplist（小数据量） / hashtable（大数据量）

**适用场景：**
- 对象/实体存储（如用户信息、商品详情）
- 购物车场景

```bash
# 存储用户信息
HSET user:1001 name "张三" age 30 email "zhangsan@example.com"
HGET user:1001 name
HGETALL user:1001

# 自增字段
HINCRBY user:1001 login_count 1

# 获取所有字段
HKEYS user:1001
HVALS user:1001

# 购物车 - 商品数量
HSET cart:user:1001 item:2001 2
HSET cart:user:1001 item:2002 1
HLEN cart:user:1001
```

### 3. List（列表）

**底层实现：** quicklist

**适用场景：**
- 消息队列（LPUSH + BRPOP）
- 最新消息列表（如朋友圈动态、新闻列表）
- 时间线（Timeline）

```bash
# 左侧推入（最新消息）
LPUSH news:latest "新闻标题1"
LPUSH news:latest "新闻标题2"

# 限制列表长度
LTRIM news:latest 0 99

# 右侧弹出消费
BRPOP queue:task 0

# 分页查询
LRANGE news:latest 0 9
```

### 4. Set（集合）

**底层实现：** intset（整数集合） / hashtable

**适用场景：**
- 标签/标签系统
- 去重操作（如 UV 统计）
- 社交关系（共同好友）

```bash
# 添加标签
SADD article:1001:tags "Redis" "缓存" "NoSQL"

# 判断是否存在
SISMEMBER article:1001:tags "Redis"

# 集合运算
SINTER user:1001:friends user:1002:friends  # 共同好友
SUNION user:1001:friends user:1002:friends  # 所有好友
SDIFF user:1001:friends user:1002:friends   # 差集

# UV 统计
SADD page:20260708:uv "ip:192.168.1.1"
SCARD page:20260708:uv
```

### 5. ZSet（有序集合）

**底层实现：** ziplist + skiplist

**适用场景：**
- 排行榜（如积分排名、热度排名）
- 延迟队列（按时间戳排序）
- 范围查询（如按价格筛选）

```bash
# 排行榜 - 添加分数
ZADD leaderboard:game 1000 "player_001"
ZADD leaderboard:game 2000 "player_002"
ZADD leaderboard:game 1500 "player_003"

# 按排名获取（从高到低）
ZREVRANGE leaderboard:game 0 9 WITHSCORES

# 获取排名
ZREVRANK leaderboard:game "player_001"

# 延迟队列 - 使用时间戳作为分数
ZADD delay:queue 1893456000 "task:email:1001"
ZADD delay:queue 1893459600 "task:sms:1002"

# 获取到期待执行的延迟任务
ZRANGEBYSCORE delay:queue 0 1893458000 WITHSCORES
```

### 6. HyperLogLog（基数统计）

**适用场景：**
- 独立 UV 统计（百万级数据仅需 12KB 内存）
- 去重计数场景（允许一定误差）

```bash
PFADD page:20260708:uv "user:1001" "user:1002" "user:1001"
PFCOUNT page:20260708:uv
```

### 7. Bitmap（位图）

**适用场景：**
- 用户签到记录
- 布隆过滤器的底层实现
- 在线状态统计

```bash
# 用户签到（第 100 天签到）
SETBIT user:sign:1001 100 1
GETBIT user:sign:1001 100

# 统计本月签到天数
BITCOUNT user:sign:1001 0 30

# 连续签到判断（位运算）
BITOP AND dest:key key1 key2
```

### 8. Stream（流，Redis 5.0+）

**适用场景：**
- 消息队列（支持消费者组、消息确认、持久化）
- 事件溯源
- 日志收集

```bash
# 添加消息
XADD mystream * sensor_id 1234 temperature 19.5

# 创建消费者组
XGROUP CREATE mystream mygroup 0

# 读取消息
XREADGROUP GROUP mygroup consumer1 COUNT 10 BLOCK 5000 STREAMS mystream >

# 确认消息
XACK mystream mygroup 1600000000000-0
```

---

## 数据结构选择总结

| 数据结构 | 时间复杂度 | 内存效率 | 推荐场景 |
|----------|------------|----------|----------|
| String | O(1) | 高 | 缓存、计数器、锁 |
| Hash | O(1) | 中 | 对象存储 |
| List | O(N) | 高 | 队列、最新列表 |
| Set | O(1) | 中 | 去重、标签 |
| ZSet | O(log N) | 低 | 排行榜、延迟队列 |
| HyperLogLog | O(1) | 极高 | UV 统计 |
| Bitmap | O(1) | 极高 | 签到、状态 |
| Stream | O(1) | 中 | 消息队列 |

---

## 持久化策略

### RDB（快照持久化）

**原理：** 在指定时间间隔内将内存中的数据快照写入磁盘，生成 `dump.rdb` 文件。

**优缺点：**

| 优点 | 缺点 |
|------|------|
| 文件紧凑，适合备份和灾难恢复 | 可能丢失最后一次快照之后的数据 |
| 恢复速度快（直接加载到内存） | 数据量大时 fork 子进程可能阻塞 |
| 对性能影响较小（子进程处理） | 不适用于数据安全性要求极高的场景 |

**配置：**

```ini
# /etc/redis/redis.conf

# 自动触发条件（以下为默认，满足任一即触发）
save 900 1        # 900 秒（15分钟）内至少有 1 个 key 变化
save 300 10       # 300 秒（5分钟）内至少有 10 个 key 变化
save 60 10000     # 60 秒内至少有 10000 个 key 变化

# RDB 文件配置
dbfilename dump.rdb
dir /var/lib/redis

# 持久化出错时停止写入
stop-writes-on-bgsave-error yes

# 压缩 RDB 文件
rdbcompression yes

# 校验 RDB 文件
rdbchecksum yes
```

**手动触发：**

```bash
# 同步阻塞（通常不推荐在生产环境使用）
SAVE

# 异步（推荐，fork 子进程处理）
BGSAVE
```

### AOF（追加文件持久化）

**原理：** 将每条写命令以 Redis 协议格式追加到 `appendonly.aof` 文件中，重启时重放所有命令恢复数据。

**优缺点：**

| 优点 | 缺点 |
|------|------|
| 数据安全性高（最多丢失 1 秒数据） | 文件体积通常比 RDB 大 |
| 支持增量追加，写入性能稳定 | 恢复速度比 RDB 慢 |
| AOF 文件可读，便于误操作恢复 | 需要定期重写（Rewrite） |

**配置：**

```ini
# 开启 AOF
appendonly yes
appendfilename "appendonly.aof"

# 刷盘策略
# always  - 每次写入都刷盘（最安全，性能最差）
# everysec - 每秒刷盘（推荐，折中方案）
# no      - 由操作系统决定刷盘时机（性能最好，安全最差）
appendfsync everysec

# AOF 重写触发条件
auto-aof-rewrite-percentage 100   # 文件增长超过 100% 时触发
auto-aof-rewrite-min-size 64mb    # 最小重写文件大小

# 重写期间不进行刷盘（避免磁盘 IO 冲突）
no-appendfsync-on-rewrite no
```

**AOF 重写：**

```bash
# 手动触发 AOF 重写（压缩文件）
BGREWRITEAOF

# 查看 AOF 文件信息
INFO Persistence
```

### RDB + AOF 混合持久化（Redis 4.0+）

**推荐方案：** 同时开启 RDB 和 AOF，并使用混合持久化模式。

```ini
# 开启混合持久化（Redis 4.0+）
aof-use-rdb-preamble yes
```

**工作原理：** AOF 重写时，先将当前数据以 RDB 格式写入 AOF 文件头部，后续增量命令以 AOF 格式追加。重启时优先加载 RDB 部分（快速），再增量重放 AOF 部分（完整）。

### 持久化方案选择建议

| 场景 | 推荐方案 | 说明 |
|------|----------|------|
| 缓存为主，可接受少量数据丢失 | RDB 或关闭持久化 | 性能优先 |
| 数据安全性要求高 | AOF（everysec） | 最多丢 1 秒数据 |
| 生产环境，兼顾性能与安全 | RDB + AOF + 混合持久化 | 推荐方案 |
| 消息队列（Stream） | AOF（everysec） | 保证消息不丢失 |

---

## 高可用架构

### Redis Sentinel（哨兵模式）

**架构说明：** Sentinel 提供主从切换、监控、通知功能，实现自动故障转移。

**部署架构要求：**
- 至少 3 个 Sentinel 节点（奇数个，保证 quorum）
- 1 个 Master + N 个 Replica

**Sentinel 配置：**

```ini
# /etc/redis/sentinel.conf
port 26379
daemonize no
pidfile /var/run/redis-sentinel.pid
logfile /var/log/redis/sentinel.log
dir /tmp

# 监控主节点
sentinel monitor mymaster 192.168.1.10 6379 2
# 2 表示至少 2 个 Sentinel 同意才能判定主节点失效

# 主观下线时间（30 秒无响应判定为下线）
sentinel down-after-milliseconds mymaster 30000

# 故障转移超时
sentinel failover-timeout mymaster 180000

# 同时同步的从库数量
sentinel parallel-syncs mymaster 1

# 保护模式（生产环境建议关闭或配置密码）
# protected-mode no
# sentinel auth-pass mymaster your_password
```

**启动 Sentinel：**

```bash
# 方式一：直接启动
redis-sentinel /etc/redis/sentinel.conf

# 方式二：使用 redis-server 启动
redis-server /etc/redis/sentinel.conf --sentinel

# 验证 Sentinel 状态
redis-cli -p 26379 SENTINEL masters
redis-cli -p 26379 SENTINEL slaves mymaster
redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster
```

**故障转移流程：**
1. Sentinel 检测到主节点主观下线（SDOWN）
2. 达到 quorum 后标记为主观下线（ODOWN）
3. Sentinel Leader 选举
4. 从从库中选举新主库（根据优先级、复制偏移量、Run ID）
5. 其他从库切换为新主库的从库
6. 原主库恢复后降级为从库

### Redis Cluster（集群模式）

**架构说明：** Redis Cluster 提供数据分片和高可用，支持自动水平扩展，数据分布在 16384 个槽中。

**部署要求：**
- 至少 3 个主节点（建议 6 个节点：3 主 3 从）
- 每个节点启用集群模式

**节点配置：**

```ini
# /etc/redis/redis.conf
port 6379
cluster-enabled yes
cluster-config-file nodes-6379.conf
cluster-node-timeout 5000
appendonly yes
appendfsync everysec
# 节点间认证密码需一致
# masterauth your_password
# requirepass your_password
```

**创建集群：**

```bash
# 假设有 6 个节点（3 主 3 从）
# 192.168.1.10:6379, 192.168.1.11:6379, 192.168.1.12:6379 (主)
# 192.168.1.13:6379, 192.168.1.14:6379, 192.168.1.15:6379 (从)

# 创建集群（Redis 5.0+ 使用 redis-cli）
redis-cli --cluster create \
  192.168.1.10:6379 \
  192.168.1.11:6379 \
  192.168.1.12:6379 \
  192.168.1.13:6379 \
  192.168.1.14:6379 \
  192.168.1.15:6379 \
  --cluster-replicas 1

# 验证集群
redis-cli -h 192.168.1.10 -p 6379 CLUSTER INFO
redis-cli -h 192.168.1.10 -p 6379 CLUSTER NODES
```

**集群管理命令：**

```bash
# 查看槽位分布
redis-cli --cluster check 192.168.1.10:6379

# 重新分片
redis-cli --cluster reshard 192.168.1.10:6379

# 添加节点
redis-cli --cluster add-node 192.168.1.16:6379 192.168.1.10:6379
redis-cli --cluster add-node 192.168.1.17:6379 192.168.1.10:6379 --cluster-slave --cluster-master-id <master-node-id>

# 删除节点
redis-cli --cluster del-node 192.168.1.10:6379 <node-id>
```

**Sentinel vs Cluster 对比：**

| 特性 | Sentinel | Cluster |
|------|----------|---------|
| 数据分片 | 不支持 | 支持（16384 个槽） |
| 自动故障转移 | 支持 | 支持 |
| 最大节点数 | 有限（主从复制） | 理论 1000+ |
| 客户端复杂度 | 低 | 较高（需支持 Cluster 协议） |
| 适用场景 | 中小规模、高可用需求 | 大规模、需要水平扩展 |
| 数据一致性 | 异步复制，可能丢数据 | 异步复制，可能丢数据 |

---

## 缓存穿透/击穿/雪崩解决方案

### 缓存穿透

**定义：** 查询一个不存在的数据，缓存和数据库中都没有，每次请求都直接打到数据库。

**解决方案：**

**方案一：缓存空对象**

```java
// 伪代码示例
public Object getData(String key) {
    Object data = redis.get(key);
    if (data != null) {
        return data;
    }
    
    // 查询数据库
    data = database.query(key);
    
    if (data == null) {
        // 缓存空对象，设置较短的过期时间（如 60 秒）
        redis.set(key, "NULL", 60);
    } else {
        redis.set(key, data, 3600);
    }
    return data;
}
```

**方案二：布隆过滤器（Bloom Filter）**

```bash
# Redis 4.0+ 支持布隆过滤器插件（redisbloom）
BF.ADD bloom:users user:1001
BF.EXISTS bloom:users user:9999  # 返回 0，不存在

# 参数：key, error_rate, capacity
BF.RESERVE bloom:users 0.01 1000000
```

**方案三：参数校验**

```bash
# 前端和后端双重校验，过滤非法参数
# 如 ID 必须为正整数，时间范围必须合理等
```

### 缓存击穿

**定义：** 一个热点 key 在过期瞬间，大量并发请求同时打到数据库。

**解决方案：**

**方案一：互斥锁（Mutex Lock）**

```bash
# 使用 SETNX 实现分布式锁
SET lock:hotkey EX 10 NX
# 获取到锁的线程查询数据库并回写缓存
# 未获取到锁的线程等待后重试
```

```java
// 伪代码
public Object getHotData(String key) {
    Object data = redis.get(key);
    if (data != null) {
        return data;
    }
    
    String lockKey = "lock:" + key;
    // 尝试获取锁，超时时间 3 秒
    if (redis.setnx(lockKey, "1", 10)) {
        try {
            // 双重检查
            data = redis.get(key);
            if (data != null) {
                return data;
            }
            data = database.query(key);
            redis.set(key, data, 3600);
            return data;
        } finally {
            redis.del(lockKey);
        }
    } else {
        // 等待 50ms 后重试
        Thread.sleep(50);
        return getHotData(key);  // 递归重试
    }
}
```

**方案二：逻辑过期（不设置物理过期时间）**

```java
// 缓存中存储数据 + 逻辑过期时间
// 数据：{"data": {...}, "expireTime": 1893456000}
public Object getDataByLogicExpire(String key) {
    String cacheData = redis.get(key);
    if (cacheData == null) {
        return null;  // 缓存不存在，走数据库
    }
    
    JSONObject wrapper = JSON.parse(cacheData);
    long expireTime = wrapper.getLong("expireTime");
    
    if (System.currentTimeMillis() < expireTime) {
        return wrapper.get("data");  // 未过期，直接返回
    }
    
    // 已过期，尝试获取锁异步更新缓存
    String lockKey = "lock:" + key;
    if (redis.setnx(lockKey, "1", 10)) {
        // 异步线程更新缓存
        threadPool.execute(() -> {
            Object newData = database.query(key);
            redis.set(key, buildWrapper(newData, 3600), 7200);
            redis.del(lockKey);
        });
    }
    
    // 返回旧数据（保证服务可用性）
    return wrapper.get("data");
}
```

### 缓存雪崩

**定义：** 大量缓存 key 在同一时间过期，或 Redis 服务宕机，导致大量请求打到数据库。

**解决方案：**

**方案一：过期时间随机化**

```java
// 设置过期时间时添加随机值，避免批量过期
int baseExpire = 3600;
int randomExpire = baseExpire + new Random().nextInt(600);  // 随机 0-600 秒
redis.set(key, data, randomExpire);
```

**方案二：多级缓存**

```java
// 一级：本地缓存（Caffeine/Guava Cache）
// 二级：Redis 集群
// 三级：数据库
// 本地缓存失效后查 Redis，Redis 失效后查数据库
```

**方案三：Redis 高可用**

```bash
# 使用 Sentinel 或 Cluster 保证 Redis 高可用
# 部署哨兵集群，自动故障转移
# 配置合理的持久化策略，快速恢复
```

**方案四：服务降级与限流**

```java
// 使用 Hystrix/Sentinel 等熔断器
// 数据库不可用时返回降级数据（如缓存中的旧数据或默认值）
// 限制单位时间内的数据库访问量
```

**方案五：缓存预热**

```bash
# 系统上线或大促前，提前加载热点数据到缓存
# 分析历史访问日志，识别热点 key
# 分批异步加载，避免一次性加载过多数据
```

---

## Key 管理命令

### 通用 Key 命令

```bash
# 查看所有 key（生产环境慎用，会阻塞）
KEYS *

# 扫描 key（推荐，支持游标分页）
SCAN 0 MATCH user:* COUNT 100
SCAN 0 MATCH session:* COUNT 1000

# 判断 key 是否存在
EXISTS key_name
EXISTS key1 key2 key3  # 返回存在的数量

# 设置过期时间
EXPIRE key_name 3600        # 秒级
PEXPIRE key_name 3600000    # 毫秒级
EXPIREAT key_name 1893456000  # 指定时间戳过期

# 查看剩余存活时间
TTL key_name     # 秒（-1 永不过期，-2 已过期或不存在）
PTTL key_name    # 毫秒

# 移除过期时间
PERSIST key_name

# 重命名
RENAME old_key new_key
RENAMENX old_key new_key  # 仅当新 key 不存在时重命名

# 删除 key
DEL key1 key2 key3
UNLINK key1 key2 key3  # 异步删除（大 key 推荐）

# 查看 key 类型
TYPE key_name

# 查看 key 编码
OBJECT ENCODING key_name

# 查看 key 空闲时间
OBJECT IDLETIME key_name

# 查看 key 引用计数
OBJECT REFCOUNT key_name
```

### 批量删除 Key

```bash
# 方式一：使用 SCAN + DEL（推荐）
redis-cli -h 127.0.0.1 -p 6379 --scan --pattern "session:*" | xargs redis-cli -h 127.0.0.1 -p 6379 DEL

# 方式二：使用 Lua 脚本
redis-cli -h 127.0.0.1 -p 6379 EVAL "return redis.call('DEL', unpack(redis.call('KEYS', ARGV[1])))" 0 "session:*"

# 方式三：UNLINK 异步删除（大 key 推荐）
redis-cli -h 127.0.0.1 -p 6379 --scan --pattern "temp:*" | xargs redis-cli -h 127.0.0.1 -p 6379 UNLINK
```

### 大 Key 发现与处理

```bash
# 使用 redis-cli --bigkeys 扫描（自动分析大 key）
redis-cli -h 127.0.0.1 -p 6379 --bigkeys

# 手动分析大 key（使用 MEMORY USAGE）
MEMORY USAGE key_name

# 使用 DEBUG OBJECT 查看 key 信息
DEBUG OBJECT key_name

# 大 Key 处理建议
# 1. String 大 key：拆分存储，按业务维度分 key
# 2. Hash 大 key：使用 HSCAN 分批处理，或拆分为多个小 hash
# 3. List 大 key：使用 LTRIM 裁剪，或拆分为多个 list
# 4. Set 大 key：使用 SSCAN 分批处理
# 5. ZSet 大 key：使用 ZREMRANGEBYRANK 分批删除
```

### 监控与诊断命令

```bash
# 查看 Redis 服务器信息
INFO

# 查看内存使用情况
INFO memory

# 查看命令统计
INFO commandstats

# 查看慢查询日志
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET

# 慢查询阈值配置
CONFIG SET slowlog-log-slower-than 10000  # 微秒，默认 10000（10ms）
CONFIG SET slowlog-max-len 128

# 实时监控命令
MONITOR  # 生产环境谨慎使用，会显著增加负载

# 查看客户端连接
CLIENT LIST
CLIENT INFO

# 杀掉客户端连接
CLIENT KILL <ip:port>
CLIENT KILL TYPE master

# 延迟测试
redis-cli --latency -h 127.0.0.1 -p 6379
redis-cli --latency-history -h 127.0.0.1 -p 6379  # 连续延迟统计
redis-cli --latency-dist -h 127.0.0.1 -p 6379     # 延迟分布图
```

### 内存管理

```bash
# 设置最大内存
CONFIG SET maxmemory 4gb

# 配置内存淘汰策略
# noeviction       - 不淘汰，内存满时写操作返回错误
# allkeys-lru      - 淘汰最近最少使用的 key（推荐）
# allkeys-lfu      - 淘汰最不经常使用的 key
# volatile-lru     - 淘汰设置了过期时间的 key 中最近最少使用的
# volatile-ttl     - 淘汰即将过期的 key
# allkeys-random   - 随机淘汰
CONFIG SET maxmemory-policy allkeys-lru

# 查看内存碎片率
# 正常值：1.0 - 1.5
# > 1.5：内存碎片较多，需要整理
# < 1.0：可能使用了 Swap
INFO memory | grep mem_fragmentation_ratio

# 内存碎片整理（Redis 4.0+ 自动整理）
CONFIG SET activedefrag yes
CONFIG SET active-defrag-threshold-lower 10   # 碎片率超过 10% 开始整理
CONFIG SET active-defrag-threshold-upper 100  # 碎片率超过 100% 全力整理
```

---

> **参考文档**：[数据库运维笔记索引](./index.md) | [MySQL 运维指南](./mysql.md)

---


---


---


---
