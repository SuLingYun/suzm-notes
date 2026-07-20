---
title: H3C 交换机端口聚合配置
date: 2026-07-20
description: H3C 交换机端口聚合（链路聚合）的完整配置命令，包括聚合组创建、端口加入、查看和排错操作
tags: [H3C, 交换机, 端口聚合, 网络]
---

# H3C 交换机端口聚合配置

## 一、基础配置命令

### 1. 创建聚合组并指定模式

```bash
system-view
interface Bridge-Aggregation 3
description TO-SWITCH-B
link-aggregation mode dynamic   # 动态模式
# link-aggregation mode static  # 静态模式（默认）
```

### 2. 配置聚合接口二层属性

**场景A：Access 接口（连接服务器/PC）**
```bash
port link-type access
port access vlan 100
```

**场景B：Trunk 接口（连接交换机）**
```bash
port link-type trunk
port trunk permit vlan 10 20 30
# port trunk pvid vlan 10      # (可选)设置缺省VLAN
```

### 3. 将物理端口加入聚合组

```bash
# 方法1：逐个端口加入
interface GigabitEthernet 1/0/1
port link-aggregation group 3
quit
interface GigabitEthernet 1/0/2
port link-aggregation group 3

# 方法2：批量加入（推荐）
interface range GigabitEthernet 1/0/1 to GigabitEthernet 1/0/2
port link-aggregation group 3
```

## 二、核心检查与排错命令

```bash
# 查看聚合组详细信息
display link-aggregation verbose interface Bridge-Aggregation 3
```

关键看三点：
- **端口状态**：S (Selected) 表示正常聚合转发；U (Unselected) 表示未聚合
- **聚合模式**：确认是 Dynamic 还是 Static
- **Partner 信息**：仅动态聚合显示，检查对端协商是否成功

```bash
# 查看聚合接口状态与配置
display interface Bridge-Aggregation 3
display current-configuration interface Bridge-Aggregation 3

# 查看负载分担模式
display link-aggregation load-sharing mode
```