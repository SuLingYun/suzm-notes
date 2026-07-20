---
title: SFTP 自动部署脚本（CentOS 7.9）
date: 2026-07-20
description: CentOS 7.9 系统下 SFTP 自动部署脚本，创建 SFTP 用户、配置 Chroot 目录权限、限制 SFTP 访问
tags: [sftp, 自动化, centos, 脚本]
---

# SFTP 自动部署脚本（CentOS 7.9）

功能：创建 SFTP 用户、配置目录权限、限制 Chroot 访问

## 部署脚本

```bash
#!/bin/bash

# SFTP 自动部署脚本（CentOS 7.9）
set -e

# 配置参数（按需修改）
SFTP_USER="sftpuser"
SFTP_GROUP="sftpgroup"
CHROOT_DIR="/var/sftp"
UPLOAD_DIR="uploads"
SSHD_CONFIG="/etc/ssh/sshd_config"

# 1. 创建 SFTP 用户组和用户
if ! getent group $SFTP_GROUP > /dev/null 2>&1; then
    groupadd $SFTP_GROUP
fi

if ! id $SFTP_USER > /dev/null 2>&1; then
    useradd -G $SFTP_GROUP -s /sbin/nologin -M $SFTP_USER
fi

# 设置密码
passwd $SFTP_USER

# 2. 创建目录并设置权限
mkdir -p $CHROOT_DIR/$SFTP_USER/$UPLOAD_DIR

chown root:root $CHROOT_DIR
chmod 755 $CHROOT_DIR

chown root:root $CHROOT_DIR/$SFTP_USER
chmod 755 $CHROOT_DIR/$SFTP_USER

chown $SFTP_USER:$SFTP_GROUP $CHROOT_DIR/$SFTP_USER/$UPLOAD_DIR
chmod 755 $CHROOT_DIR/$SFTP_USER/$UPLOAD_DIR

# 3. 配置 SSH 服务
# 备份并追加配置
cp $SSHD_CONFIG $SSHD_CONFIG.bak.$(date +%Y%m%d%H%M%S)

# 追加到 sshd_config
cat >> $SSHD_CONFIG << EOF

# SFTP 配置
Subsystem sftp internal-sftp

Match Group $SFTP_GROUP
   ChrootDirectory $CHROOT_DIR/%u
   ForceCommand internal-sftp
   PermitTunnel no
   X11Forwarding no
   AllowTcpForwarding no
   PasswordAuthentication yes
EOF

# 4. 重启服务
if sshd -t; then
    systemctl restart sshd
fi
```

## 验证信息

部署完成后，使用以下命令连接：

```bash
sftp -P 22 sftpuser@服务器IP
```