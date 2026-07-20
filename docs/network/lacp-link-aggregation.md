---
title: 配置 LACP 模式的链路聚合示例（交换机之间直连）
date: 2026-07-20
description: 华为交换机 LACP 模式链路聚合配置示例，包含主动端优先级设置、活动接口数上限配置等
tags: [华为, 交换机, LACP, 链路聚合, 网络]
---

# 配置 LACP 模式的链路聚合示例（交换机之间直连）

## SwitchA 配置

```bash
#
lacp priority 100
#
interface Eth-Trunk1
 port link-type trunk
 port trunk allow-pass vlan 10 20
 mode lacp
 max active-linknumber 2
#
interface GigabitEthernet1/0/1
 eth-trunk 1
 lacp priority 100
#
interface GigabitEthernet1/0/2
 eth-trunk 1
 lacp priority 100
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
 mode lacp
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

- **系统 LACP 优先级**：缺省为 32768，修改 SwitchA 优先级为 100，使其作为主动端
- **接口 LACP 优先级**：修改 GE1/0/1、GE1/0/2 的优先级为 100，作为活动接口
- **活动接口数上限**：`max active-linknumber 2`，限制活动链路数量为 2 条