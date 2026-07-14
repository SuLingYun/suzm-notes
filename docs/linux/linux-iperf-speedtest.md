---
title: Linux 服务器之间网络测速（iperf3）
date: 2026-07-13
description: 使用 iperf3 工具在 Linux 服务器之间进行网络带宽测试，包含服务端和客户端配置、防火墙放行及测试方法
tags: [linux, network, iperf3, 网络测速]
---

# Linux 服务器之间网络测速

### 服务端配置：

```sh
yum -y install iperf3
firewall-cmd --zone=public --add-port=5201/tcp
firewall-cmd --zone=public --add-port=5201/udp
iperf3 -s  //启动服务
```

### 客户端配置：

```sh
yum -y install iperf3
iperf3 -c  <服务端ip>
```