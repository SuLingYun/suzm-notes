---
title: Alibaba Cloud Linux 3 导入VMware vSphere虚拟化平台
description: 记录将 Alibaba Cloud Linux 3 镜像导入 VMware vSphere 虚拟化平台的完整流程，包括 qcow2 转 vmdk 转换、虚拟机创建、seed.img 挂载引导、网络配置等步骤
date: 2026-07-13
tags:
  - Alibaba Cloud
  - Linux
  - VMware
  - vSphere
  - 虚拟化
  - 运维
---

## Alibaba Cloud Linux 3 导入VMware vSphere虚拟化平台

### 步骤一：本地下载Alibaba Cloud Linux 3 镜像

```sh
https://mirrors.aliyun.com/alinux/3/image/?spm=a2c4g.11186623.0.0.36534cfcF8pVIg

系统镜像：KVM x86_64 (qcow2)
引导镜像：Seed Image
```

### 步骤二：利用qemu软件转换.qcow2文件格式为.vmdk

```sh
# 使用 qemu-img 工具将阿里云提供的 qcow2 格式镜像转换为 VMware 使用的 vmdk 格式
qemu-img convert -p -f qcow2 -O vmdk aliyun_3_x64_20G_nocloud_alibase_20250117.qcow2 Caliyun3.vmdk  

# 参数说明：
# -p            显示转换进度
# -f qcow2      指定源镜像格式为 qcow2（阿里云镜像格式）
# -O vmdk       指定目标镜像格式为 vmdk（VMware 支持的格式）
# aliyun_3_x64_20G_nocloud_alibase_20250117.qcow2  原始镜像文件名
# Caliyun3.vmdk                                   转换后生成的 vmdk 文件

```

### 步骤三：VMware vSphere虚拟化平台直接新建虚拟机，硬盘直接使用转换好的vmdk文件

### 步骤四：光驱挂载引导镜像seed.img

### 步骤五：启动虚拟机，如果报错注意修改硬盘IDE SATA

### 步骤六：进入系统

```sh
默认用户名：alinux
默认密码:aliyun
```

### 步骤七：开放root密码

```sh
# 以 alinux 用户登录系统后，执行以下命令切换到 root 用户
sudo -i        # 输入当前用户（alinux）的密码后切换为 root

passwd root   # 设置或修改 root 密码
```

### 步骤八：配置网络

```sh
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=none
IPADDR=1.10.10.248
PREFIX=24
GATEWAY=1.10.10.1
DNS1=222.172.200.68
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=default
NAME=eth0
UUID=a93cf88e-d819-300e-a156-6ffdea068ecc
DEVICE=eth0
ONBOOT=yes
AUTOCONNECT_PRIORITY=-999

```

```sh
nmcli con show
nmtui
systemctl restart NetworkManager
```

### 也可以手动生成seed.img文件：

```sh
https://help.aliyun.com/zh/alinux/getting-started/use-alibaba-cloud-linux-3-images-in-an-on-premises-environment
```