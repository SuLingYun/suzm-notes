---
title: CentOS 系统调优完全指南
description: 本文详细介绍 CentOS 系统的性能调优方法，涵盖内核参数、资源限制、文件系统、网络协议栈等关键维度
date: 2026-06-15
tags:
  - CentOS
  - 系统调优
  - Linux
  - 性能优化
---

# CentOS 系统调优完全指南

## 前言

在生产环境中，CentOS 系统的默认配置往往无法满足高并发、高负载场景的需求。本文将系统性地介绍 CentOS 调优的核心要点，帮助你将服务器调整到最佳状态。

## 一、内核参数调优

### 1.1 sysctl 配置

通过修改 `/etc/sysctl.conf` 来调整内核参数，执行 `sysctl -p` 使配置生效。

```bash
# 编辑内核参数文件
vim /etc/sysctl.conf
```

**核心参数推荐：**

```ini
# 内核 Panic 后自动重启
kernel.panic = 10

# 文件句柄最大数
fs.file-max = 655350

# 网络连接追踪
net.netfilter.nf_conntrack_max = 655350
net.netfilter.nf_conntrack_tcp_timeout_established = 1200

# TIME_WAIT 优化
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1

# TCP 连接队列
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# 系统层面限制
net.core.rmem_default = 262144
net.core.wmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
```

### 1.2 应用配置

```bash
# 立即生效
sysctl -p

# 查看当前配置
sysctl -a | grep tcp_tw_reuse
```

## 二、资源限制调优

### 2.1 limits.conf 配置

修改 `/etc/security/limits.conf` 提高用户进程资源限制：

```ini
# /etc/security/limits.conf
*                soft    nofile          655350
*                hard    nofile          655350
*                soft    nproc           655350
*                hard    nproc           655350
*                soft    stack           unlimited
*                hard    stack           unlimited
```

> **注意：** CentOS 7/8 需要同时检查 systemd 的 `DefaultLimitNOFILE` 配置。

## 三、文件系统调优

### 3.1 挂载参数优化

对于数据库或高 IO 场景，建议调整文件系统挂载参数：

```bash
# 示例：使用 noatime 减少磁盘写入
mount -o remount,noatime,nodiratime /data

# 在 /etc/fstab 中持久化配置
# /dev/sdb1 /data xfs defaults,noatime,nodiratime 0 0
```

### 3.2 IO 调度器

```bash
# 查看当前 IO 调度器
cat /sys/block/sda/queue/scheduler

# 建议 SSD 使用 none（或 noop），机械盘使用 deadline
echo none > /sys/block/sda/queue/scheduler
```

## 四、内存与 Swap 优化

```bash
# 查看内存使用
free -h

# 降低 Swappiness 值，减少 Swap 使用
echo "vm.swappiness = 10" >> /etc/sysctl.conf
sysctl -p

# 查看当前值
cat /proc/sys/vm/swappiness
```

## 五、性能检测工具

以下是常用的性能检测命令：

| 指标 | 工具 | 用法 |
|------|------|------|
| CPU | `mpstat` | `mpstat -P ALL 1` |
| 内存 | `free -m` | 查看内存使用概况 |
| 磁盘 | `iostat -x 1` | 查看磁盘 IO 延迟 |
| 网络 | `sar -n DEV 1` | 网络流量统计 |
| 进程 | `pidstat` | 按进程查看资源占用 |

## 六、一键调优脚本

```bash
#!/bin/bash
# CentOS 快速调优脚本

echo "====== 开始系统调优 ======"

# 修改文件句柄限制
cat >> /etc/security/limits.conf <<EOF
* soft nofile 655350
* hard nofile 655350
EOF

# 内核参数优化
cat >> /etc/sysctl.conf <<EOF
fs.file-max = 655350
net.core.somaxconn = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1
vm.swappiness = 10
EOF

sysctl -p

echo "====== 调优完成 ======"
```

## 总结

CentOS 系统调优是一个持续的过程，需要根据实际业务场景不断调整。建议：

1. 每次只修改一个参数，观察效果
2. 做好变更记录，方便回滚
3. 结合监控数据（如 Prometheus + Grafana）进行量化评估
4. 大版本升级后重新评估调优参数

> **参考文档：** [Red Hat Enterprise Linux 性能调优指南](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/)

---


---


---


---
