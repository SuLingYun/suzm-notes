---
title: 数据库审计与合规
description: 数据库审计日志配置、敏感数据保护、合规检查等实战经验
date: 2026-07-09
tags:
  - 数据库审计
  - 安全
  - 合规
---

# 数据库审计与合规

## 一、MySQL 审计配置

### 1.1 启用通用日志

```bash
# 编辑 my.cnf
cat >> /etc/my.cnf <<EOF
[mysqld]
general_log = 1
general_log_file = /var/log/mysql/general.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
log_queries_not_using_indexes = 1
EOF

systemctl restart mysqld

# 查看审计日志
tail -f /var/log/mysql/general.log
```

### 1.2 使用审计插件

```bash
# 安装 Percona Audit Log Plugin
INSTALL PLUGIN audit_log SONAME 'audit_log.so';

# 配置审计规则
SET GLOBAL audit_log_policy = 'ALL';
SET GLOBAL audit_log_rotate_on_size = 100M;
SET GLOBAL audit_log_rotations = 10;
```

## 二、敏感数据保护

### 2.1 数据脱敏

```sql
-- 手机号脱敏
SELECT CONCAT(LEFT(phone, 3), '****', RIGHT(phone, 4)) AS masked_phone FROM users;

-- 身份证脱敏
SELECT CONCAT(LEFT(id_card, 6), '***********', RIGHT(id_card, 4)) AS masked_id FROM users;

-- 邮箱脱敏
SELECT CONCAT(LEFT(email, 2), '****@', SUBSTRING_INDEX(email, '@', -1)) AS masked_email FROM users;
```

### 2.2 加密存储

```sql
-- 创建加密函数
SELECT AES_ENCRYPT('sensitive_data', 'encryption_key');
SELECT AES_DECRYPT(encrypted_data, 'encryption_key');

-- 使用 SSL 连接
mysql -u root -p --ssl-mode=REQUIRED
```

## 三、访问控制

```sql
-- 创建只读用户
CREATE USER 'readonly'@'%' IDENTIFIED BY 'password';
GRANT SELECT ON database.* TO 'readonly'@'%';

-- 创建审计用户
CREATE USER 'audit'@'%' IDENTIFIED BY 'password';
GRANT SELECT ON mysql.general_log TO 'audit'@'%';

-- 限制 IP 访问
CREATE USER 'app'@'192.168.1.%' IDENTIFIED BY 'password';

-- 定期轮换密码
ALTER USER 'app'@'%' IDENTIFIED BY 'new_password';
```

## 四、合规检查清单

```bash
# 检查弱密码
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE authentication_string LIKE '%123456%'"

# 检查空密码用户
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE authentication_string = ''"

# 检查权限过大用户
mysql -u root -p -e "SHOW GRANTS FOR 'app'@'%'"

# 检查远程 root 访问
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user = 'root' AND host != 'localhost'"
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
