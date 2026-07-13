---
title: 华为交换机运维手册
date: 2026-07-13
description: 华为交换机运维完整手册，包含日志排查操作指引、全功能诊断命令表（系统/接口/路由/安全/交换/组播/QoS）及典型故障排查流程
tags: [huawei, switch, network, troubleshooting, log, diagnostics, ops]
---

# 华为交换机运维手册

---

## 一、日志排查操作指引

### 1.1 初步日志查看

#### 查看系统日志缓冲区内容

```powershell
display logbuffer
```

可加关键字过滤：

```powershell
display logbuffer | include GigabitEthernet
display logbuffer | include ERR
```

#### 查看 Trap 缓冲区内容（主动告警）

```powershell
display trapbuffer
```

#### 查看告警信息（实时和历史）

```powershell
display alarm all
display alarm active
display alarm history
```

---

### 1.2 日志配置与输出检查

#### 查看 Info-Center 配置（输出方向、过滤等级）

```powershell
display info-center
display current-configuration | include info-center
```

#### 查看远程日志服务器配置（如 Syslog）

```powershell
display logging host
```

---

### 1.3 一键诊断导出日志

```powershell
display diagnostic-information
```

- 会在 flash 中生成 `.txt` 文件，例如：`diagnoseinfo_2025-05-20.txt`
- 适合打包提供给技术支持分析

---

### 1.4 高级排查命令

#### 查看日志是否因 CPU 丢弃

```powershell
display cpu-defend statistics drop
```

#### 查看是否配置了调试输出（需谨慎使用）

```powershell
display debugging
```

> 调试日志可能影响性能，开启时需谨慎，一般用于短时问题分析。

---

### 1.5 临时调整建议（排查日志不输出情况时用）

#### 设置日志缓冲区大小（例如 32KB）

```powershell
info-center logbuffer size 32768
```

#### 临时增加日志等级

```powershell
info-center source SHELL channel logbuffer log level debugging
```

> 使用后可改回默认等级（如 `informational`）

---

### 1.6 常见日志级别

| 日志级别 | 数值 | 说明 |
|---------|------|------|
| emergency | 0 | 紧急（系统不可用） |
| alert | 1 | 警报 |
| critical | 2 | 严重错误 |
| error | 3 | 一般错误 |
| warning | 4 | 警告 |
| notice | 5 | 正常但需要注意 |
| informational | 6 | 信息级别 |
| debugging | 7 | 调试 |

---

## 二、全功能诊断命令表

### 2.1 系统基础信息

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display version` | 显示设备硬件/软件版本 | 确认设备型号和软件版本 |
| `display device` | 查看单板/槽位状态 | 检查硬件是否正常 |
| `display elabel` | 显示电子标签（序列号） | 设备维保信息查询 |
| `display clock` | 查看系统时间 | 检查时间同步问题 |
| `display startup` | 查看下次启动配置 | 确认启动文件是否正确 |
| `display reboot-info` | 查看重启记录 | 排查异常重启问题 |
| `display system stable state` | 检查系统稳定性 | 确认是否发生过崩溃 |
| `display cpu-usage` | 查看 CPU 利用率 | 排查性能瓶颈 |
| `display memory-usage` | 查看内存使用率 | 检查内存泄漏 |
| `display logbuffer` | 查看系统日志 | 快速定位告警事件 |
| `display trapbuffer` | 查看 SNMP Trap 日志 | 监控关键事件 |
| `display environment` | 检查温度/风扇/电源 | 硬件健康状态监控 |
| `display alarm urgent` | 查看紧急告警 | 快速定位严重故障 |

---

### 2.2 接口与链路状态

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display interface brief` | 查看接口简要状态 | 快速确认接口 UP/DOWN |
| `display interface` | 查看接口详细信息 | 检查速率、双工、错误包 |
| `display interface counters errors` | 查看接口错误统计 | 排查 CRC/冲突等物理层问题 |
| `display interface description` | 查看接口描述 | 确认接口用途 |
| `display eth-trunk` | 查看链路聚合组 | 检查 LACP/静态聚合状态 |
| `display lacp statistics eth-trunk` | 查看 LACP 统计 | 排查聚合成员口异常 |
| `display stp` | 查看生成树状态 | 检查环路或阻塞端口 |
| `display lldp neighbor` | 查看 LLDP 邻居 | 发现拓扑连接关系 |
| `display transceiver verbose` | 查看光模块信息 | 检查光功率/温度 |

---

### 2.3 路由协议

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display ip routing-table` | 查看 IPv4 路由表 | 确认路由学习情况 |
| `display ipv6 routing-table` | 查看 IPv6 路由表 | IPv6 网络排查 |
| `display fib` | 查看转发信息库 | 确认实际转发路径 |
| `display bgp peer verbose` | 查看 BGP 邻居详情 | 排查 BGP 会话问题 |
| `display bgp routing-table` | 查看 BGP 路由表 | 检查路由收发情况 |
| `display ospf peer` | 查看 OSPF 邻居 | 检查 OSPF 邻接关系 |
| `display ospf lsdb brief` | 查看 OSPF 链路状态库 | 确认 LSA 泛洪情况 |
| `display isis peer verbose` | 查看 ISIS 邻居详情 | ISIS 网络故障排查 |
| `display rip` | 查看 RIP 路由信息 | 传统 RIP 网络维护 |

---

### 2.4 安全与 AAA 管理

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display aaa online-fail-record` | 查看认证失败记录 | 排查用户登录失败 |
| `display aaa abnormal-offline-record` | 查看异常下线记录 | 检查用户被踢原因 |
| `display aaa session` | 查看当前认证会话 | 监控在线用户 |
| `display local-user` | 查看本地用户配置 | 检查账号权限 |
| `display ssh server status` | 查看 SSH 服务状态 | 确认 SSH 端口/协议 |
| `display ssh user-information` | 查看 SSH 登录用户 | 监控远程访问 |
| `display telnet server status` | 查看 Telnet 服务状态 | 传统管理方式检查 |
| `display acl all` | 查看所有 ACL 规则 | 检查访问控制策略 |
| `display acl counter` | 查看 ACL 命中计数 | 确认策略是否生效 |
| `display cpu-defend policy` | 查看 CPU 防护策略 | 防攻击配置检查 |
| `display arp anti-attack` | 查看 ARP 防攻击配置 | 防止 ARP 欺骗 |

---

### 2.5 交换与 MAC 地址

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display mac-address` | 查看 MAC 地址表 | 确认终端接入位置 |
| `display mac-address multicast` | 查看组播 MAC 表 | 组播流量排查 |
| `display arp` | 查看 ARP 表 | 检查 IP-MAC 绑定 |
| `display port-security` | 查看端口安全绑定 | 防止 MAC 泛洪攻击 |
| `display vrrp` | 查看 VRRP 状态 | 检查网关冗余协议 |

---

### 2.6 组播协议

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display igmp group` | 查看 IGMP 组播组 | 检查接收者加入情况 |
| `display pim neighbor` | 查看 PIM 邻居 | 组播路由协议检查 |
| `display pim rp-info` | 查看 RP 信息 | 组播汇聚点确认 |
| `display multicast routing-table` | 查看组播路由表 | 组播流量路径检查 |

---

### 2.7 QoS 与流量管理

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display qos policy interface` | 查看接口 QoS 策略 | 检查流量整形/限速 |
| `display qos queue-statistics` | 查看队列统计 | 检查拥塞丢包 |
| `display traffic policy interface` | 查看流量策略应用 | 确认策略绑定位置 |

---

### 2.8 网络服务

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display dhcp snooping user-bind all` | 查看 DHCP 绑定表 | 防止私接 DHCP 服务器 |
| `display dns server` | 查看 DNS 服务器配置 | 排查域名解析问题 |
| `display ntp status` | 查看 NTP 同步状态 | 检查时间同步问题 |
| `display snmp-agent community` | 查看 SNMP 团体名 | 监控配置检查 |

---

### 2.9 排障与调试

| 命令 | 作用说明 | 使用场景 |
|------|---------|---------|
| `display debugging` | 查看当前调试开关 | 确认调试功能状态 |
| `display info-center` | 查看日志配置 | 检查日志服务器设置 |
| `display nqa results` | 查看 NQA 探测结果 | 网络质量测试 |
| `display ping/tracert` | 执行连通性测试 | 基础网络故障排查 |

---

## 三、典型故障排查流程

### 3.1 用户无法登录

```sh
display aaa online-fail-record      # 查看认证失败原因
display ssh server status           # 检查 SSH 服务是否开启
display local-user                  # 确认账号是否存在
```

### 3.2 接口不通

```sh
display interface brief             # 确认物理状态
display interface counters errors   # 检查错误包
display lldp neighbor               # 确认对端设备连接
```

### 3.3 路由丢失

```sh
display ip routing-table            # 检查路由表
display bgp peer verbose            # 确认 BGP 邻居状态
display ospf error                  # 查看 OSPF 错误日志
```

### 3.4 组播流量异常

```sh
display igmp group                  # 检查接收者
display pim neighbor                # 确认 PIM 邻居
display multicast routing-table     # 查看组播路由
```

---

## 四、常见日志级别参考

| 日志级别 | 数值 | 说明 |
|---------|------|------|
| emergency | 0 | 紧急（系统不可用） |
| alert | 1 | 警报 |
| critical | 2 | 严重错误 |
| error | 3 | 一般错误 |
| warning | 4 | 警告 |
| notice | 5 | 正常但需要注意 |
| informational | 6 | 信息级别 |
| debugging | 7 | 调试 |