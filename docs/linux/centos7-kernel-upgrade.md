---
title: CentOS 7.9 升级内核三种方法
date: 2026-07-13
description: CentOS 7.9 升级 Linux 内核的三种方法：YUM 在线升级、离线 RPM 包安装、源码编译并打包为 RPM（优化版）
tags: [linux, centos, kernel, 内核升级, elrepo]
---

# CentOS 7.9 升级内核版本【三种方法优化版】

本文档提供了 CentOS 7.9 系统下升级 Linux 内核的三种方法：YUM 在线升级、离线 RPM 包安装、源码编译并打包为 RPM。其中第三种方法已优化，避免重复编译，显著缩短时间。

---

## 方法一、YUM在线升级

### 1. 查看当前内核版本
```bash
uname -r
```

### 2. 导入 ELRepo 软件仓库的公共密钥

```sh
rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
```

### 3. 安装 ELRepo 软件仓库的 yum 源

```sh
yum -y install https://www.elrepo.org/elrepo-release-7.el7.elrepo.noarch.rpm
```

### 4. 查看可用内核版本

```sh
yum --disablerepo="*" --enablerepo="elrepo-kernel" list available
```

### 5. 安装指定内核

```sh
# 主线版本（功能新，较激进）
yum --enablerepo=elrepo-kernel install kernel-ml -y

# 长期稳定版本（推荐生产环境）
yum --enablerepo=elrepo-kernel install kernel-lt -y
```

### 6. 设置 GRUB 默认内核并重启

#### 判断系统启动方式

```sh
[ -d /sys/firmware/efi ] && echo UEFI || echo BIOS
```

#### BIOS 方式

```sh
awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
grub2-set-default 0                     # 0 为第一个内核
grub2-mkconfig -o /boot/grub2/grub.cfg
```

#### UEFI 方式

```sh
cat /boot/efi/EFI/centos/grub.cfg | grep "menuentry 'CentOS Linux"
grub2-mkconfig -o /boot/efi/EFI/centos/grub.cfg
grub2-set-default 'CentOS Linux (完整内核名称) 7 (Core)'
```

#### 重启验证

```sh
reboot
uname -r
```

### 7. 删除旧内核（可选）

```sh
rpm -qa | grep kernel
yum -y remove <旧内核包名>
```

---

## 方法二、离线下载内核 RPM 包升级

### 1. 下载 RPM 包

访问 ELRepo 内核仓库：[https://elrepo.org/linux/kernel/el7/x86_64/RPMS/](https://elrepo.org/linux/kernel/el7/x86_64/RPMS/)  
下载所需版本，例如长期稳定版：

- `kernel-lt-5.4.95-1.el7.elrepo.x86_64.rpm`
- `kernel-lt-devel-5.4.95-1.el7.elrepo.x86_64.rpm`

### 2. 安装内核包

```sh
rpm -ivh kernel-lt-5.4.95-1.el7.elrepo.x86_64.rpm kernel-lt-devel-5.4.95-1.el7.elrepo.x86_64.rpm
```

### 3. 设置默认内核（同方法一第6步）

---

## 方法三、源码编译并制作 RPM 包（优化版：仅编译一次）

本方法使用 `make binrpm-pkg` 直接生成二进制 RPM 包，**无需先 `make` 再 `make rpm-pkg`**，避免重复编译，节省 40%~50% 时间。

### 1. 下载内核源码

推荐 kernel.org 长期稳定版（longterm）：

```sh
wget https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.15.35.tar.xz
tar -xf linux-5.15.35.tar.xz
cd linux-5.15.35/
```

### 2. 安装编译依赖

```sh
yum -y install elfutils-libelf-devel openssl-devel ncurses-devel
yum -y groupinstall "development tools"
```

### 3. 升级 GCC 版本（要求 ≥5.1）

CentOS 7 默认 GCC 4.8.5 不满足内核编译要求，需升级。

```sh
# 安装 SCL 及 devtoolset-8
yum install centos-release-scl -y
yum install devtoolset-8-gcc* -y

# 激活新版本（对当前会话生效）
scl enable devtoolset-8 bash

# 可选：永久替换系统 gcc/g++
mv /usr/bin/gcc /usr/bin/gcc-4.8.5
ln -s /opt/rh/devtoolset-8/root/bin/gcc /usr/bin/gcc
mv /usr/bin/g++ /usr/bin/g++-4.8.5
ln -s /opt/rh/devtoolset-8/root/bin/g++ /usr/bin/g++

# 验证版本
gcc --version
```

### 4. 使用当前系统内核配置作为基础

```sh
cp /boot/config-$(uname -r) .config
```

### 5. （可选）调整内核编译选项

```sh
make menuconfig
```

- 可修改内核名称：`General setup → Local version - append to kernel release`
- 可添加 NTFS 支持：`File systems → DOS/FAT/NT Filesystems → NTFS file system support`
- 保存并退出

### 6. 一次性编译并生成 RPM 包（关键步骤）

```sh
# 安装 RPM 打包工具
yum -y install rpmdevtools

# 构建二进制 RPM 包（推荐）
make binrpm-pkg -j $(nproc)

# 或者构建源码+二进制 RPM 包（体积更大）
# make rpm-pkg -j $(nproc)
```

**说明**：该命令会自动完成内核编译、模块编译、RPM 打包，**无需单独执行 `make`、`make modules_install`、`make install`**。  
生成的 RPM 包默认位于 `~/rpmbuild/RPMS/x86_64/`。

### 7. 安装生成的 RPM 包（可选，若需在本机使用新内核）

```sh
cd ~/rpmbuild/RPMS/x86_64/
rpm -ivh kernel-*.rpm kernel-devel-*.rpm kernel-headers-*.rpm
```

### 8. 设置默认内核并重启

```sh
# BIOS 方式
awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
grub2-set-default 0
grub2-mkconfig -o /boot/grub2/grub.cfg

# UEFI 方式（根据实际情况选择）
grub2-mkconfig -o /boot/efi/EFI/centos/grub.cfg
grub2-set-default 'CentOS Linux (新内核完整名称) 7 (Core)'

reboot
```

### 9. 将 RPM 包移植到其他服务器

将以下文件复制到目标服务器：

- `kernel-*.rpm`
- `kernel-devel-*.rpm`
- `kernel-headers-*.rpm`

按顺序安装：

```sh
rpm -ivh kernel-*.rpm
rpm -ivh kernel-devel-*.rpm
rpm -ivh kernel-headers-*.rpm
```

然后参考步骤 8 设置默认内核并重启。

---

## 优化对比

|原文档方法三|优化后方法三|
|--|--|
|先执行 `make` 编译一次|无|
|再执行 `make modules_install`|无|
|再执行 `make install`|无|
|最后执行 `make rpm-pkg` 重新编译打包|直接执行 `make binrpm-pkg` 一次性完成|
|**编译两次**，耗时翻倍|**只编译一次**，节省 40%~50% 时间|

---

## 常见问题

### Q1：`make binrpm-pkg` 报错 "No rule to make target"？

确保已安装 `rpmdevtools` 和 `rpm-build`：

```sh
yum install rpm-build rpmdevtools -y
```

### Q2：编译时提示 `gcc: error: unrecognized command line option '-mabi'`？

GCC 版本过低，请严格按照步骤 3 升级到 devtoolset-8 或更高版本。

### Q3：如何查看已安装的内核列表？

```sh
rpm -qa | grep kernel | sort
```

### Q4：如何彻底删除旧内核？

```sh
yum remove <旧内核包名>
# 然后重新生成 grub 配置
grub2-mkconfig -o /boot/grub2/grub.cfg
```

---

## 参考链接

- [ELRepo 官网](https://elrepo.org)
- [Linux Kernel 官网](https://www.kernel.org)
- [CentOS 7 文档](https://wiki.centos.org)