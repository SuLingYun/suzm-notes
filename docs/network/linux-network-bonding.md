---
title: Linux 网卡 Bonding 配置指南（华为交换机版）
date: 2026-07-13
description: 超详细的 Linux 网卡 Bonding 配置指南，包含 7 种模式对比表、服务器配置（CentOS/Ubuntu）、华为交换机 Eth-Trunk 配置、故障排查及最终检查清单
tags: [linux, network, bonding, lacp, eth-trunk, huawei, centos, ubuntu, troubleshooting]
---

# Linux 网卡 Bonding 超详细配置指南（华为交换机版）

## 一、基础概念

### 1. 什么是 Bonding？

- **作用**：将多个物理网卡绑定成一个逻辑网卡
- **好处**：提高带宽 / 实现冗余 / 负载均衡
- **类比**：就像把多条公路合并成一条高速公路

### 2. 常用模式对比

| 模式 | 模式名称 | 需要交换机配置 | 负载均衡 | 冗余性 | 带宽叠加 | 适用场景 | 优缺点 |
|-----|---------|--------------|---------|-------|---------|---------|-------|
| **0** | balance-rr (轮询) | 是 | 轮询 | 是 | 是 | 需要最大带宽 | 优: 高带宽；缺: 数据包可能乱序，需交换机支持 |
| **1** | active-backup (主备) | 否 | 否 | 是 | 否 | 高可靠性要求 | 优: 配置简单；缺: 带宽不叠加 |
| **2** | balance-xor | 是 | 哈希均衡 | 是 | 是 | 特定哈希策略需求 | 优: 避免乱序；缺: 配置较复杂 |
| **3** | broadcast (广播) | 是 | 广播 | 是 | 否 | 极高容错要求 | 优: 任何链路故障不影响通信；缺: 带宽利用率低 |
| **4** | 802.3ad (LACP) | 是 | 动态均衡 | 是 | 是 | **生产环境推荐** | 优: 标准协议，智能负载均衡；缺: 需交换机支持 |
| **5** | balance-tlb | 否 | 发送均衡 | 是 | 是 | 发送流量大的场景 | 优: 无需交换机支持；缺: 接收流量不均衡 |
| **6** | balance-alb | 否 | 收发均衡 | 是 | 是 | 交换机不支持聚合时 | 优: 完全无交换机依赖；缺: MAC 浮动可能被安全策略拦截 |

### 3. 关键总结

- **推荐模式**：
  - **Mode 4 (LACP)**：生产环境最佳选择（需交换机配 `mode lacp-static`）
  - **Mode 1 (active-backup)**：只需冗余，不需带宽叠加
  - **Mode 6 (balance-alb)**：交换机不支持聚合时的替代方案
- **交换机配置要点**：
  - Mode 0/2/3/4：必须配置华为 Eth-Trunk（静态或动态 LACP）
  - Mode 1/5/6：普通端口即可，无需聚合
- **避坑指南**：
  - 确保两端**模式匹配**（如服务器 Mode 4 对应交换机 LACP）
  - 检查 **VLAN、MTU、速率/双工** 一致性
  - Mode 6 需关闭交换机的**端口安全**功能（避免 MAC 浮动被拦截）

---

## 二、服务器配置（分步详解）

### 1. 准备工作

```bash
# 1.1 查看现有网卡（确认网卡名称）
ip link show
# 输出示例：
# 2: ens33: <BROADCAST,MULTICAST> ...
# 3: ens36: <BROADCAST,MULTICAST> ...

# 1.2 关闭 NetworkManager（会干扰 bonding）
systemctl stop NetworkManager
systemctl disable NetworkManager

# 1.3 加载 bonding 内核模块
modprobe bonding
echo "bonding" > /etc/modules-load.d/bonding.conf  # 开机自动加载
```

### 2. 配置文件详解

#### 2.1 创建 bond 主配置（以 bond0 为例）

```sh
vi /etc/sysconfig/network-scripts/ifcfg-bond0
```

```ini
# 基本参数
DEVICE=bond0          # 设备名称
NAME=bond0            # 连接名称
TYPE=Bond             # 类型必须为 Bond
IPADDR=192.168.1.100  # 改成你的 IP
PREFIX=24             # 子网掩码简写（24=255.255.255.0）
GATEWAY=192.168.1.1   # 网关地址
ONBOOT=yes            # 开机启动
BOOTPROTO=static      # 静态 IP

# Bonding 核心参数
BONDING_MASTER=yes
BONDING_OPTS="mode=4 miimon=100 lacp_rate=fast xmit_hash_policy=layer3+4"
# 参数解释：
# mode=4           -> 使用 LACP 模式
# miimon=100       -> 每 100ms 检测一次链路状态
# lacp_rate=fast   -> 快速 LACP 检测（1 秒）
# xmit_hash_policy -> 智能流量分配算法
```

#### 2.2 配置成员网卡（以 ens33 为例）

```sh
vi /etc/sysconfig/network-scripts/ifcfg-ens33
```

```ini
TYPE=Ethernet
BOOTPROTO=none      # 不单独配置 IP
DEVICE=ens33        # 必须与物理网卡名一致
NAME=ens33
ONBOOT=yes          # 开机启动
MASTER=bond0        # 指定主 bond 设备
SLAVE=yes           # 作为 slave 设备
```

#### 2.3 其他模式配置示例

```ini
# 模式 1（主备模式）：
BONDING_OPTS="mode=1 miimon=100 primary=ens33"
# primary=ens33 -> 指定主网卡

# 模式 6（智能负载均衡）：
BONDING_OPTS="mode=6 miimon=100"
```

### 3. 应用配置

```sh
# 重启网络服务
systemctl restart network

# 检查 bond 状态（关键！）
cat /proc/net/bonding/bond0
# 正常输出应包含：
# Bonding Mode: IEEE 802.3ad Dynamic link aggregation
# Slave Interface: ens33 (状态为 up)
# Slave Interface: ens36 (状态为 up)
```

### 4. Ubuntu (Netplan) 配置

```sh
vi /etc/netplan/01-bond.yaml

# 配置示例：
network:
  version: 2
  bonds:
    bond0:
      interfaces: [ens33, ens36]          # 绑定的物理网卡
      parameters:
        mode: 802.3ad                    # LACP 模式
        lacp-rate: fast                  # 快速协商
        mii-monitor-interval: 100        # 链路检测间隔（ms）
      addresses: [192.168.1.100/24]
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8]

# 应用配置
netplan apply
```

---

## 三、华为交换机配置（手把手版）

### 1. 物理连接准备

- 服务器的 ens33 接交换机 GigabitEthernet0/0/1
- 服务器的 ens36 接交换机 GigabitEthernet0/0/2

### 2. 配置流程（以 Mode 4 为例）

```sh
# 进入配置模式
system-view

# 创建 Eth-Trunk 聚合组
interface Eth-Trunk 1
 description Server-Bond0  # 添加描述
 mode lacp-static          # 模式选择（必须与服务器匹配）

# 可选高级参数
 lacp preempt enable       # 启用抢占功能
 lacp preempt delay 10     # 抢占延迟 10 秒
 max active-linknumber 2   # 最大活动链路数

# 将物理端口加入聚合组
 trunkport GigabitEthernet 0/0/1 to 0/0/2

# 配置负载均衡算法（推荐）
 load-balance dst-ip       # 基于目标 IP 的负载均衡

# 提交配置
 commit
quit
```

### 3. 验证命令

```sh
# 查看聚合组状态
display eth-trunk 1
# 正常输出应显示：
# LAG ID: 1
# WorkingMode: STATIC
# NumberOfPorts: 2
# Status: Up

# 查看具体成员端口
display interface Eth-Trunk 1
# 检查 "Last 300 seconds input rate" 是否有流量
```

### 4. 各模式交换机配置速查

#### Mode 0/2/3（静态聚合）

```sh
system-view
interface Eth-Trunk 1
  mode manual load-balance
  trunkport GigabitEthernet 0/0/1 to 0/0/2
  load-balance dst-ip
commit
```

#### Mode 4（动态 LACP - 生产推荐）

```sh
system-view
interface Eth-Trunk 1
  mode lacp-static
  lacp preempt enable
  trunkport GigabitEthernet 0/0/1 to 0/0/2
commit
```

#### Mode 1/5/6（无需聚合，普通端口即可）

```sh
system-view
interface GigabitEthernet 0/0/1
  port link-type access
  port default vlan 10
interface GigabitEthernet 0/0/2
  port link-type access
  port default vlan 10
commit
```

---

## 四、故障排查大全

### 1. 服务器端问题

#### 现象：bonding 状态显示部分接口 down

```sh
# 检查物理链路
ethtool ens33 | grep "Link detected"
# 应显示：Link detected: yes

# 检查驱动问题
dmesg | grep -i bond
```

#### 现象：无法 ping 通网关

```sh
# 检查 IP 配置
ip addr show bond0
# 检查路由表
route -n
```

### 2. 交换机端问题

#### 现象：Eth-Trunk 状态为 Down

```sh
# 检查物理端口状态
display interface GigabitEthernet 0/0/1
# 检查 "PortName" 和 "Line protocol" 状态

# 检查 LACP 协商
display lacp statistics eth-trunk 1
# 查看 "LACP packets" 是否收发正常
```

### 3. 常用诊断命令

```sh
# 查看所有 Eth-Trunk
display interface brief | include Eth-Trunk

# 清除端口统计
reset counters interface GigabitEthernet 0/0/1

# 保存配置
save
```

---

## 五、最终检查清单

1. 服务器 bonding 状态所有 Slave 均为 up
2. 交换机 Eth-Trunk 状态为 up
3. 两端模式配置一致（都是 Mode 4 或其他）
4. 能 ping 通网关和其他主机
5. 做过拔线测试（故障切换是否正常）
6. VLAN、MTU、速率/双工一致
7. 配置已保存（`service iptables save` / `save`）

---

## 六、华为交换机常用命令速查

```sh
# 查看所有 Eth-Trunk
display interface brief | include Eth-Trunk

# 清除端口统计
reset counters interface GigabitEthernet 0/0/1

# 保存配置
save
```

---

> **特别提醒**：
>
> 1. 配置变更建议在业务低峰期进行
> 2. 重要操作前先保存交换机配置
> 3. 首次配置后建议观察 24 小时稳定性
> 4. 操作时请根据实际发行版选择对应配置段落，建议先在测试环境验证