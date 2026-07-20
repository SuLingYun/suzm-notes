---
title: 配置手工模式链路聚合示例（交换机之间直连）
date: 2026-07-20
description: 华为交换机手工模式链路聚合配置示例，包含 Eth-Trunk 创建、端口加入、负载分担模式配置
tags: [华为, 交换机, 链路聚合, 手工模式, 网络]
---

# 配置手工模式链路聚合示例（交换机之间直连）

## SwitchA 配置

```bash
#
interface Eth-Trunk1
 port link-type trunk
 port trunk allow-pass vlan 10 20
 load-balance src-dst-mac
#
interface GigabitEthernet1/0/1
 eth-trunk 1
#
interface GigabitEthernet1/0/2
 eth-trunk 1
#
interface GigabitEthernet1/0/3
 eth-trunk 1
#
```

## SwitchB 配置

```bash
#
interface Eth-Trunk1
 port link-type trunk
 port trunk allow-pass vlan 10 20
 load-balance src-dst-mac
#
interface GigabitEthernet1/0/1
 eth-trunk 1
#
interface GigabitEthernet1/0/2
 eth-trunk 1
#
interface GigabitEthernet1/0/3
 eth-trunk 1
#
```

## 配置说明

- 手工模式无需 LACP 协议协商，两端配置一致即可
- `load-balance src-dst-mac` 指定基于源目 MAC 地址进行负载分担
- 两端交换机配置需对称，包括允许通过的 VLAN 和负载分担模式