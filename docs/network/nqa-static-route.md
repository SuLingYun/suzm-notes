---
title: NQA 与静态路由联动配置
date: 2026-07-20
description: 华为交换机上 NQA 与静态路由联动配置，实现路由自动切换，包含 ICMP 和 DNS 两种探测方式
tags: [华为, NQA, 静态路由, 网络]
---

# NQA 与静态路由联动配置

## 删除静态路由

```bash
undo ip route-static 10.11.0.0 255.255.0.0
undo ip route-static 10.12.0.0 255.255.0.0
```

## NQA 配置

### 通过 ICMP Ping 探测

```bash
nqa test-instance admin yb1
test-type icmp
destination-address ipv4 10.116.130.21
frequency 15
interval seconds 5
timeout 4
probe-count 2
start now
```

### 配置静态路由绑定 NQA

```bash
ip route-static 10.11.0.0 255.255.0.0 192.168.19.2 track nqa admin yb1
ip route-static 10.12.0.0 255.255.0.0 192.168.19.2 track nqa admin yb1
```

### 通过 DNS 探测

```bash
dns resolve
dns server 10.116.130.21

nqa test-instance admin yibaodns
test-type dns
destination-address url ld.yn.hsip.gov.cn
dns-server ipv4 10.116.130.21
frequency 11
timeout 4
start now
```

## 验证命令

```bash
display nqa history test-instance admin yb1
display nqa results test-instance admin yb1
display ip routing-table 10.116.0.0
```

## 控制命令

```bash
# 启动 NQA
start now
# 停止 NQA
stop
```