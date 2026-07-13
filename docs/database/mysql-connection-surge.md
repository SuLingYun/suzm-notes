---
title: MySQL 连接数激增（2万连接）紧急排查与处理手册
date: 2026-07-13
description: 记录一次 MySQL 数据库连接数激增到 2 万的紧急排查与处理过程，包含紧急止血、根因排查、应用层分析及预防优化措施
tags:
  - mysql
  - database
  - troubleshooting
  - 运维笔记
---

# 数据库连接数激增（2万连接）紧急排查与处理手册

## 一、紧急处理（5分钟内必须完成）

### 1.1 快速评估连接状况
```sql
-- 立即执行，了解连接构成
SHOW STATUS LIKE 'Threads_%';
SHOW GLOBAL STATUS LIKE 'Max_used_connections';
SHOW VARIABLES LIKE 'max_connections';

-- 连接类型分布分析
SELECT 
    COMMAND,
    COUNT(*) as 连接数,
    ROUND(COUNT(*)/SUM(COUNT(*)) OVER()*100, 2) as 百分比,
    AVG(TIME) as 平均时间,
    MAX(TIME) as 最长连接
FROM information_schema.PROCESSLIST 
GROUP BY COMMAND 
ORDER BY COUNT(*) DESC;
```

### 1.2 紧急止血措施

```sql
-- 步骤1：临时降低最大连接数（防止继续增长）
SET GLOBAL max_connections = 5000;

-- 步骤2：缩短连接超时时间
SET GLOBAL wait_timeout = 30;      -- 非交互连接30秒超时
SET GLOBAL interactive_timeout = 30; -- 交互连接30秒超时

-- 步骤3：紧急清理批量空闲连接（执行前请确认）
-- 生成清理语句（先查看，确认无误再执行）
SELECT CONCAT('KILL ', ID, ';') as 清理语句
FROM information_schema.PROCESSLIST 
WHERE COMMAND = 'Sleep' 
  AND TIME > 60                    -- 空闲超过60秒
  AND USER NOT IN ('system user', 'event_scheduler', 'replication')
  AND ID != CONNECTION_ID()        -- 不清理当前连接
LIMIT 1000;                        -- 分批执行，每次1000
```

### 1.3 紧急清理脚本（Shell版）

```sh
#!/bin/bash
# emergency_clean.sh
MYSQL_USER="your_admin"
MYSQL_PASS="your_password"
MYSQL_HOST="localhost"
PORT="3306"

echo "当前连接数："
mysql -h$MYSQL_HOST -P$PORT -u$MYSQL_USER -p$MYSQL_PASS -e "SELECT COUNT(*) FROM information_schema.PROCESSLIST;"

echo "开始清理空闲连接（每次1000，共5轮）"
for i in {1..5}
do
    echo "第 $i 轮清理"
    mysql -h$MYSQL_HOST -P$PORT -u$MYSQL_USER -p$MYSQL_PASS -e "
        SELECT CONCAT('KILL ', ID, ';') 
        FROM information_schema.PROCESSLIST 
        WHERE COMMAND = 'Sleep' 
          AND TIME > 60 
          AND USER NOT IN ('system user', 'event_scheduler')
        LIMIT 1000" | grep 'KILL' > /tmp/kill_commands.sql
        
    if [ -s /tmp/kill_commands.sql ]; then
        mysql -h$MYSQL_HOST -P$PORT -u$MYSQL_USER -p$MYSQL_PASS < /tmp/kill_commands.sql
        echo "已清理一批连接"
        sleep 2  # 等待2秒，避免冲击
    else
        echo "没有需要清理的连接"
        break
    fi
done

echo "清理后连接数："
mysql -h$MYSQL_HOST -P$PORT -u$MYSQL_USER -p$MYSQL_PASS -e "SELECT COUNT(*) FROM information_schema.PROCESSLIST;"
```

## 二、根本原因排查（紧急处理后执行）

### 2.1 连接来源分析

```sql
-- 查看连接数TOP 10的客户端
SELECT 
    USER,
    SUBSTRING_INDEX(HOST, ':', 1) as 客户端IP,
    COUNT(*) as 连接数,
    SUM(CASE WHEN COMMAND = 'Sleep' THEN 1 ELSE 0 END) as 空闲连接,
    SUM(CASE WHEN TIME > 60 THEN 1 ELSE 0 END) as 长连接,
    MIN(CONNECT_TIME) as 最早连接时间
FROM information_schema.PROCESSLIST 
LEFT JOIN performance_schema.threads ON PROCESSLIST.ID = threads.PROCESSLIST_ID
WHERE USER NOT IN ('system user')
GROUP BY USER, SUBSTRING_INDEX(HOST, ':', 1)
ORDER BY 连接数 DESC
LIMIT 10;

-- 查看应用连接池配置问题
SELECT 
    USER,
    HOST,
    DB,
    COUNT(*) as 连接数,
    GROUP_CONCAT(DISTINCT LEFT(INFO, 50)) as 查询样例
FROM information_schema.PROCESSLIST 
WHERE COMMAND = 'Sleep'
GROUP BY USER, HOST, DB
HAVING COUNT(*) > 10
ORDER BY COUNT(*) DESC;
```

### 2.2 异常连接检测

```sql
-- 检查是否有异常IP大量连接
SELECT 
    SUBSTRING_INDEX(HOST, ':', 1) as 客户端IP,
    COUNT(*) as 连接数,
    GROUP_CONCAT(DISTINCT USER) as 使用用户
FROM information_schema.PROCESSLIST 
GROUP BY SUBSTRING_INDEX(HOST, ':', 1)
HAVING COUNT(*) > 100  -- 单个IP连接数超过100
ORDER BY COUNT(*) DESC;

-- 检查长时间运行的事务/查询
SELECT 
    p.ID,
    p.USER,
    p.HOST,
    p.DB,
    p.TIME,
    p.COMMAND,
    p.STATE,
    LEFT(p.INFO, 100) as 查询语句,
    t.trx_started as 事务开始时间,
    TIMESTAMPDIFF(SECOND, t.trx_started, NOW()) as 事务持续时间
FROM information_schema.PROCESSLIST p
LEFT JOIN information_schema.INNODB_TRX t ON p.ID = t.trx_mysql_thread_id
WHERE p.TIME > 60 
  AND p.COMMAND != 'Sleep'
ORDER BY p.TIME DESC
LIMIT 20;
```

### 2.3 系统资源检查

```sql
-- 检查系统资源使用情况
SHOW ENGINE INNODB STATUS;  -- 查看InnoDB状态

-- 检查表锁和行锁
SELECT 
    r.trx_id as 等待事务,
    r.trx_mysql_thread_id as 等待线程,
    r.trx_query as 等待查询,
    b.trx_id as 阻塞事务,
    b.trx_mysql_thread_id as 阻塞线程,
    b.trx_query as 阻塞查询,
    TIMESTAMPDIFF(SECOND, r.trx_wait_started, NOW()) as 等待秒数
FROM information_schema.INNODB_LOCK_WAITS w
INNER JOIN information_schema.INNODB_TRX b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.INNODB_TRX r ON r.trx_id = w.requesting_trx_id;
```

## 三、应用层排查

### 3.1 连接池配置检查点

```
1. HikariCP配置检查：
   - maximumPoolSize：是否设置过大（建议50-200）
   - minimumIdle：是否设置过高
   - connectionTimeout：是否合理（建议30秒）
   - idleTimeout：是否设置（建议10分钟）
   - maxLifetime：是否设置（建议30分钟）

2. Druid配置检查：
   - maxActive：最大连接数
   - initialSize：初始连接数
   - minIdle：最小空闲连接
   - removeAbandoned：是否开启连接泄露检测
   - removeAbandonedTimeout：泄露连接超时时间

3. 常见问题：
   - 连接未正确关闭（try-with-resources或finally块缺失）
   - 连接池配置在多个地方重复设置
   - 应用重启但旧连接未清理
```

### 3.2 连接泄露检测脚本

```java
// Java连接泄露检测示例
public class ConnectionLeakDetector {
    public static void checkConnectionLeaks(DataSource dataSource) {
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hds = (HikariDataSource) dataSource;
            System.out.println("活跃连接: " + hds.getHikariPoolMXBean().getActiveConnections());
            System.out.println("空闲连接: " + hds.getHikariPoolMXBean().getIdleConnections());
            System.out.println("总连接: " + hds.getHikariPoolMXBean().getTotalConnections());
            System.out.println("等待连接: " + hds.getHikariPoolMXBean().getThreadsAwaitingConnection());
        }
    }
}
```

## 四、预防与优化措施

### 4.1 MySQL配置优化（my.cnf）

```ini
[mysqld]
# 连接相关
max_connections = 1000                    # 根据实际需要调整
wait_timeout = 300                        # 5分钟
interactive_timeout = 300                 # 5分钟
max_connect_errors = 10000

# 性能相关
thread_cache_size = 32                    # 线程缓存
table_open_cache = 2000                   # 表缓存
table_definition_cache = 1400

# 监控相关
performance_schema = ON
performance_schema_consumer_events_statements_history = ON
```

### 4.2 监控与告警配置

```sql
-- 创建监控视图
CREATE VIEW connection_monitor AS
SELECT 
    NOW() as 监控时间,
    COUNT(*) as 总连接数,
    SUM(CASE WHEN COMMAND = 'Sleep' THEN 1 ELSE 0 END) as 空闲连接数,
    SUM(CASE WHEN TIME > 300 THEN 1 ELSE 0 END) as 长空闲连接,
    SUM(CASE WHEN COMMAND = 'Query' AND TIME > 30 THEN 1 ELSE 0 END) as 慢查询数,
    (SELECT VARIABLE_VALUE 
     FROM performance_schema.global_status 
     WHERE VARIABLE_NAME = 'Threads_connected') as 已连接线程数
FROM information_schema.PROCESSLIST;

-- 定期检查语句
SELECT * FROM connection_monitor;
```

### 4.3 自动化清理脚本（crontab定期执行）

```sh
#!/bin/bash
# daily_connection_clean.sh
# 每天凌晨3点执行：0 3 * * * /path/to/daily_connection_clean.sh

MYSQL_CMD="mysql -hlocalhost -uroot -p'password'"

# 清理空闲超过1小时的连接
$MYSQL_CMD -e "
    SELECT CONCAT('KILL ', ID, ';') 
    FROM information_schema.PROCESSLIST 
    WHERE COMMAND = 'Sleep' 
      AND TIME > 3600 
      AND USER NOT IN ('system user', 'event_scheduler')
" | grep 'KILL' | $MYSQL_CMD

# 记录日志
echo "$(date): 清理空闲连接完成" >> /var/log/mysql_clean.log
```

## 五、常见故障场景及处理

### 场景1：应用连接池泄露

```
现象：
  - 某个应用服务器的连接数持续增长
  - 重启应用后恢复正常，但几小时后再次出现
  
处理：
  1. 检查应用代码中的连接关闭逻辑
  2. 启用连接池的泄露检测功能
  3. 添加连接使用监控
```

### 场景2：慢查询阻塞

```
现象：
  - 大量连接状态为"Waiting for table lock"或"Sending data"
  - CPU或IO使用率异常高
  
处理：
  1. 使用SHOW PROCESSLIST找出慢查询
  2. 使用EXPLAIN分析查询执行计划
  3. 优化索引或查询语句
  4. 考虑读写分离
```

### 场景3：DDOS攻击或异常访问

```
现象：
  - 大量来自同一IP的连接
  - 连接用户名为空或异常
  
处理：
  1. 使用防火墙限制异常IP访问
  2. 设置max_connect_errors参数
  3. 启用数据库审计日志
```

## 六、工具推荐

### 6.1 监控工具

1. **Percona Monitoring and Management (PMM)** - 免费监控工具
2. **Prometheus + Grafana** - 自定义监控
3. **MySQL Enterprise Monitor** - 官方商业版

### 6.2 分析工具

1. **pt-query-digest** - 慢查询分析
2. **innotop** - 实时监控
3. **mytop** - 类似top的MySQL监控

### 6.3 连接中间件

1. **ProxySQL** - 连接池和查询路由
2. **MySQL Router** - 官方路由中间件
3. **MaxScale** - MariaDB官方代理

## 七、检查清单

### 紧急处理检查项

- [ ] 已临时降低max_connections
- [ ] 已清理大量空闲连接
- [ ] 已检查系统资源使用情况
- [ ] 已识别连接数最多的客户端IP

### 根本原因检查项

- [ ] 应用连接池配置检查完成
- [ ] 慢查询分析完成
- [ ] 锁等待分析完成
- [ ] 网络和防火墙检查完成

### 预防措施检查项

- [ ] 监控告警已设置
- [ ] 配置优化已实施
- [ ] 应用代码审查完成
- [ ] 备份和恢复方案已准备

---

**注意**：以上操作在生产环境执行前，请务必在测试环境验证！
**重要**：任何配置修改都要有回滚方案！
**安全**：确保操作有完整记录和审批流程！