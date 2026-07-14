---
title: Kali Linux 安装后需要做的事情
date: 2026-07-13
description: Kali Linux 安装后初始化配置指南，包括启用 root 用户、修改系统语言为中文、开启 SSH、修改软件源、更新系统等
tags: [kali, linux, security, 系统配置]
---

# Kali Linux 安装后需要做的事情

### 一、启用 root 用户

```sh
┌──(kali㉿kali)-[~]
└─$ sudo passwd root
新的 密码：
重新输入新的 密码：
passwd：已成功更新密码
```

### 二、修改系统语言为中文

```sh
dpkg-reconfigure locales

修改 [*] en_US.UTF-8 UTF-8  至  [ ] en_US.UTF-8 UTF-8

修改 [ ] zh_CN.UTF-8 UTF-8  至 [*] zh_CN.UTF-8 UTF-8
```

### 三、开启 SSH

```sh
vim /etc/ssh/sshd_config
将#PasswordAuthentication yes的注释去掉
将PermitRootLogin without-password修改为PermitRootLogin yes，允许root账号登录
启动ssh服务：systemctl start ssh
开机自启：   systemctl enable ssh
```

### 四、修改软件源

```sh
┌──(root㉿kali)-[~]
└─# vim /etc/apt/sources.list
```

### 五、更新系统

```sh
apt-get update
apt-get upgrade
apt-get dist-upgrade
apt-get clean
```

apt-get update：是更新源列表的命令，如果您修改源列表或者想要进行同步刷新或添加新的源，那么您应该执行上面的命令。
apt-get upgrade：命令将尝试下载在 apt 服务器上具有更新的所有软件包，然后尝试按下"y"时安装它们，这就像系统升级到新包。
apt-get dist-upgrade：此命令也算更新所有软件包，但是当 upgrade 更新时，如果依赖关系无法解决时可能会报错或者停止，但是 dist-upgrade 命令可以自动解决依赖关系，因此 dist-update 有一定的危险性，因为可能会更新很大您不希望更新的软件，导致原理的一些需要依赖旧包的软件无法运行。所以，我们在用 apt-get dist-upgrade 时，请慎重使用，一般是 **apt-get update && apt-get upgrade** 可以保证系统的完整性。

### 六、查看系统版本

```sh
lsb_release -a
```

### 七、安装所有软件

```sh
apt-get install kali-linux-everything
```