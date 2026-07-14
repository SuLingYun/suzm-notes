---
title: H3C 交换机 IRF 堆叠配置
date: 2026-07-12
description: H3C S5820V2 系列交换机 IRF 堆叠配置完整指南，包含 Master/Slave 配置、BFD 检测、端口聚合及堆叠分裂处理
tags: [h3c, switch, network, irf, 堆叠]
---

# H3C 交换机 IRF 堆叠配置

### 一、端口准备：堆叠口 x2，BFD 检测口 x1

本次采用两台 H3C S5820V2-54QS-GE 做 IRF，交换机自带 4 个 SFP+【10G】端口 49-52、2 个 QSFP+【40G】端口 53-54，有堆叠线缆的情况下用 QSFP+ 端口，没有堆叠线缆的情况下一般用 SFP+ 端口，从冗余的角度考虑，至少需要两根堆叠线。

配置 IRF BFD 检测可以用电口，一根网线就行。

<br/>

### 二、IRF 配置【设备开机、线缆连接完成后配置】

**Master 配置**

```sh
<H3C>system-view
[H3C]interface range FortyGigE 1/0/53 to FortyGigE 1/0/54  //组建临时端口组进行批量配置
[H3C-if-range]shutdown  //关闭端口，不然无法加入irf-port
[H3C-if-range]quit
[H3C]irf domain 10  //定义irf域
[H3C]irf member 1 priority 30  //配置irf的优先级，member 1 相当于1/0/1的第一个1,由于是Master设备此处无需修改
[H3C]irf-port 1/1
[H3C-irf-port1/1]port group interface FortyGigE 1/0/53
[H3C-irf-port1/1]port group interface FortyGigE 1/0/54
[H3C]irf-port-configuration active  //激活irf配置
[H3C]interface range FortyGigE 1/0/53 to FortyGigE 1/0/54
[H3C-if-range]undo shutdown
[H3C-if-range]quit
[H3C]save
```

**Slave 配置**

```sh
<H3C>system-view
[H3C]interface range FortyGigE 1/0/53 to FortyGigE 1/0/54
[H3C-if-range]shutdown
[H3C-if-range]quit
[H3C]irf domain 10
[H3C]irf member 1 renumber 2  //Slave设备重新定义堆叠后设备为2/0/1，优先级默认为1
[H3C]irf-port 1/2
[H3C-irf-port1/2]port group interface FortyGigE 1/0/53
[H3C-irf-port1/2]port group interface FortyGigE 1/0/54
[H3C]irf-port-configuration active
[H3C]interface range FortyGigE 1/0/53 to FortyGigE 1/0/54
[H3C-if-range]undo shutdown
[H3C-if-range]quit
[H3C]save
<H3C>reboot  //重启后堆叠生效，Master设备不需要重启
```

<br/>

### 三、配置 IRF BFD 检测

BFD：用于检测两台设备之间的链路状态，俗称"心跳线"当 irf 分裂，bfd 会让备机处于休眠状态。让链路聚合变成单链路。（若没有休眠，上联设备做的是链路聚合，但是 irf 分裂变成两台设备形成不了聚合口，导致网络中断）

```sh
堆叠完成后配置
[H3C]vlan 100
[H3C-vlan100]port Ten-GigabitEthernet 1/0/52 Ten-GigabitEthernet 2/0/52
[H3C-vlan100]quit
[H3C]interface Vlan-interface 100
[H3C-Vlan-interface100]mad bfd enable
[H3C-Vlan-interface100]mad ip address 10.0.0.13 255.255.255.252 member 1
[H3C-Vlan-interface100]mad ip address 10.0.0.14 255.255.255.252 member 2
```

### 四、H3C 端口聚合配置

```sh
[H3C]interface Bridge-Aggregation 10
[H3C-Bridge-Aggregation10]quit
[H3C]interface range GigabitEthernet 1/0/10 to GigabitEthernet 1/0/12
[H3C-if-range]port link-aggregation group 10
[H3C-if-range]quit
[H3C]interface Bridge-Aggregation 10
[H3C-Bridge-Aggregation10]port access vlan 100
```

### dis link-aggregation summary 查看端口组信息

### dis link-aggregation verbose 查看端口组具体成员

### display lldp neighbor-information list 查看邻居接口