---
title: Linux 网络配置文档
date: 2026-07-13
description: Linux 网络配置完整指南，涵盖基础配置、Bond 聚合、UUID 修改及验证方法，支持 CentOS/RHEL、Ubuntu、OpenSUSE 等主流发行版
tags: [linux, network, bond, uuid, nmcli, netplan, centos, ubuntu, opensuse]
---

# Linux 网络配置文档

---

## 一、网络配置方法

### 1. 临时配置（重启失效）

**适用场景**：快速调试或临时变更

```sh
# 所有发行版通用命令（需 root 权限）
ip addr add 192.168.1.100/24 dev eth0    # 添加 IP 和子网掩码到 eth0 网卡
ip link set eth0 up                       # 启用 eth0 网卡
ip route add default via 192.168.1.1      # 添加默认网关
echo "nameserver 8.8.8.8" > /etc/resolv.conf  # 临时修改 DNS（重启后失效）
```

**注**：

- `ip` 命令替代已废弃的 `ifconfig`
- 文件修改需 root 权限（如 `/etc/resolv.conf`）

---

### 2. 永久配置（配置文件）

#### Red Hat/CentOS/RHEL (7/8/9)

```sh
# 编辑网卡配置文件
vi /etc/sysconfig/network-scripts/ifcfg-eth0

# 静态 IP 配置示例内容：
DEVICE=eth0                               # 物理网卡名称
BOOTPROTO=static                          # 静态 IP（dhcp 表示动态获取）
ONBOOT=yes                                # 开机自启
IPADDR=192.168.1.100                      # IP 地址
NETMASK=255.255.255.0                     # 子网掩码（或 PREFIX=24）
GATEWAY=192.168.1.1                       # 默认网关
DNS1=8.8.8.8                              # 主 DNS
DNS2=8.8.4.4                              # 备 DNS

# 重启网络服务
systemctl restart network                 # CentOS 7/8/9
```

#### Ubuntu/Debian (18.04+)

```sh
# 使用 Netplan 配置（YAML 格式）
vi /etc/netplan/00-installer-config.yaml

# 示例配置：
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no                           # 禁用 DHCP
      addresses: [192.168.1.100/24]       # IP/掩码
      routes:
        - to: default
          via: 192.168.1.1                # 网关
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]     # DNS

# 应用配置
netplan apply                             # 立即生效
```

#### OpenSUSE/SLES

```sh
# 配置文件路径
vi /etc/sysconfig/network/ifcfg-eth0

# 关键参数：
BOOTPROTO='static'                        # 静态 IP
IPADDR='192.168.1.100'
NETMASK='255.255.255.0'
GATEWAY='192.168.1.1'
DNS_SERVERS='8.8.8.8 8.8.4.4'

# 重启服务
systemctl restart network
```

---

### 3. 交互式工具（nmtui）

**适用发行版**：所有支持 NetworkManager 的系统（CentOS/RHEL/Ubuntu/Fedora）

```sh
nmtui  # 启动文本界面（需 root 权限）
```

**操作流程**：

1. 选择 **Edit a connection** -> 选择网卡 -> **Edit**
2. 手动设置：
   - `IPv4 CONFIGURATION` -> `Manual`
   - 填写 IP/网关/DNS
3. 勾选 **Automatically connect**（开机自启）
4. 退回主菜单 -> **Activate a connection** -> 重新激活网卡

---

### 4. 命令行工具（nmcli）

**适用发行版**：NetworkManager 支持的发行版

```sh
# 查看所有连接（显示名称、UUID、设备类型）
nmcli connection show

# 创建新连接（静态 IP）
nmcli con add type ethernet con-name "OfficeLAN" ifname eth0 \
  ipv4.addresses "192.168.1.100/24" \
  ipv4.gateway "192.168.1.1" \
  ipv4.dns "8.8.8.8" \
  ipv4.method manual                     # 手动配置 IP

# 修改现有连接（启用 DHCP）
nmcli con mod "OfficeLAN" ipv4.method auto

# 激活配置
nmcli con down "OfficeLAN" && nmcli con up "OfficeLAN"
```

---

## 二、Bond 聚合配置（多网卡绑定）

### 1. 通用前置步骤

```sh
# 加载 bonding 内核模块（所有发行版）
modprobe bonding

# 永久加载（编辑模块配置文件）
echo "bonding" >> /etc/modules-load.d/bonding.conf
```

### 2. 配置示例（Mode 4 - LACP）

#### Red Hat/CentOS

```sh
# 创建 bond0 主配置
vi /etc/sysconfig/network-scripts/ifcfg-bond0

# 内容示例：
DEVICE=bond0
TYPE=Bond
IPADDR=192.168.1.100
NETMASK=255.255.255.0
BONDING_OPTS="mode=4 miimon=100 lacp_rate=1"  # 模式4 + 100ms 检测
ONBOOT=yes

# 配置 Slave 网卡（以 eth1 为例）
vi /etc/sysconfig/network-scripts/ifcfg-eth1
DEVICE=eth1
MASTER=bond0
SLAVE=yes
ONBOOT=yes

# 重启网络
systemctl restart network
```

#### Ubuntu (Netplan)

```sh
vi /etc/netplan/01-bond.yaml

# 配置示例：
network:
  version: 2
  bonds:
    bond0:
      interfaces: [eth1, eth2]           # 绑定的物理网卡
      parameters:
        mode: 802.3ad                    # LACP 模式
        lacp-rate: fast                  # 快速协商
      addresses: [192.168.1.100/24]
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8]

# 应用配置
netplan apply
```

### 3. 验证 Bond 状态

```sh
# 查看聚合详情（所有发行版）
cat /proc/net/bonding/bond0

# 预期输出示例：
Bonding Mode: IEEE 802.3ad Dynamic link aggregation
Slave Interface: eth1
MII Status: up                           # 必须为 "up"
Slave Interface: eth2
MII Status: up
```

---

## 三、UUID 管理

### 1. 查看与生成 UUID

```sh
# 查看网卡 UUID（NetworkManager 相关发行版）
nmcli con show | grep -i uuid

# 生成新 UUID（通用命令）
uuidgen
# 输出示例：550e8400-e29b-41d4-a716-446655440000
```

### 2. 修改网卡 UUID（以 CentOS 为例）

```sh
# 编辑网卡配置文件
vi /etc/sysconfig/network-scripts/ifcfg-eth0

# 修改或添加行：
UUID=550e8400-e29b-41d4-a716-446655440000  # 替换为新 UUID

# 重启连接
nmcli con down eth0 && nmcli con up eth0
```

### 3. 修改文件系统 UUID

```sh
# 查看当前 UUID（ext4/xfs）
blkid /dev/sda1

# 修改 ext4 分区 UUID
tune2fs /dev/sda1 -U $(uuidgen)          # 使用新 UUID 替换

# 修改 XFS 分区 UUID（需卸载分区）
xfs_admin -U $(uuidgen) /dev/sda1        # 适用于 XFS 文件系统
```

---

## 四、配置验证命令

```sh
ip addr show eth0              # 检查 IP 分配
ping -c 4 8.8.8.8             # 测试外网连通性
journalctl -xe -u NetworkManager  # 查看网络服务日志（Ubuntu/CentOS 8+）
cat /etc/resolv.conf           # 检查当前 DNS 配置
```

---

## 五、发行版差异速查表

| 操作 | Red Hat/CentOS 7 | Ubuntu 20.04+ | OpenSUSE Leap |
|-----|-----------------|--------------|--------------|
| 配置文件路径 | `/etc/sysconfig/network-scripts/ifcfg-*` | `/etc/netplan/*.yaml` | `/etc/sysconfig/network/ifcfg-*` |
| 网络服务命令 | `systemctl restart network` | `netplan apply` | `systemctl restart network` |
| Bond 配置工具 | ifcfg 文件 | Netplan | ifcfg 文件 |

---

## 注意事项

1. **权限要求**：所有命令需在 `root` 用户下执行，或通过 `su -` 切换
2. **生产环境**：修改 UUID 可能影响依赖硬件标识的服务（如 License 系统）
3. **Bond 模式**：
   - Mode 4 (`802.3ad`) 需交换机启用 LACP
   - Mode 1 (`active-backup`) 无需交换机支持
4. **备份建议**：
   ```sh
   cp /etc/netplan/*.yaml ~/backup/                               # Ubuntu
   cp /etc/sysconfig/network-scripts/ifcfg-* ~/backup/            # CentOS
   ```

操作时请根据实际发行版选择对应配置段落，建议首次操作在测试环境验证。