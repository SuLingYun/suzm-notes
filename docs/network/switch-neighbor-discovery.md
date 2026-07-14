---
title: 各种交换机查看邻居交换机情况
date: 2026-07-13
description: 华为、H3C、锐捷等主流交换机查看邻居设备信息的 LLDP 命令汇总，快速定位网络拓扑和连接状态
tags: [switch, network, lldp, 华为, h3c, 锐捷]
---

# 各种交换机查看邻居交换机情况

### 华为交换机

```sh
display lldp neighbor brief
```

### H3C 交换机

```sh
display lldp neighbor-information list
```

### 锐捷交换机

```sh
show lldp neighbors
```