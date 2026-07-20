---
title: VMware 平台 Linux 系统 LVM 完全操作手册
date: 2026-07-20
description: 涵盖 VMware 虚拟化平台下 Linux LVM 的完整操作指南，包括新增磁盘创建 LVM、扩容逻辑卷、缩小分区、故障处理等场景
tags: [vmware, linux, lvm, 磁盘]
---

# VMware 平台 Linux 系统 LVM 完全操作手册

## 一、LVM 核心概念与关系图解

### 层级关系

```
物理硬盘 → 物理卷(PV) → 卷组(VG) → 逻辑卷(LV) → 文件系统
```

### 组件说明

| 组件 | 作用 | 类比 | 查看命令 |
|------|------|------|----------|
| PV | 物理磁盘空间单元 | 砖块 | `pvs` 或 `pvdisplay` |
| VG | 合并多个PV的存储池 | 砖墙 | `vgs` 或 `vgdisplay` |
| LV | 分配给系统的可用分区 | 房间 | `lvs` 或 `lvdisplay` |

## 二、基础环境准备

### VMware 磁盘操作
所有操作前必须：关闭虚拟机 → 编辑设置 → 硬盘操作，扩容/添加新硬盘后开机。

### 查看磁盘信息
```bash
partprobe                                  # 刷新分区表
ls /sys/class/scsi_host/                   # 查看主机总线号
echo "- - -" > /sys/class/scsi_host/host0/scan  # 重新扫描SCSI总线
lsblk                                      # 查看所有块设备
fdisk -l | grep LVM                        # 识别LVM管理的磁盘
```

## 三、核心场景操作指南

### 场景1：新增磁盘创建新的 LVM 并使用

```bash
# VMware操作：添加新硬盘（如20GB）

# Linux操作：
pvcreate /dev/sdb                          # 初始化新磁盘为物理卷
vgcreate vgdata /dev/sdb                   # 创建卷组
lvcreate -l +100%FREE -n data vgdata       # 创建逻辑卷使用所有空间
mkfs.xfs /dev/vgdata/data                  # 创建XFS文件系统
mkdir /data                                # 创建挂载点
mount /dev/vgdata/data /data/              # 挂载
blkid                                      # 查看UUID
vim /etc/fstab                             # 添加自动挂载
mount -a                                   # 验证
```

### 场景2：对逻辑卷扩容

**方式A：添加新磁盘扩容**
```bash
pvcreate /dev/sdc                          # 初始化新硬盘
vgextend vgdata /dev/sdc                   # 扩展到卷组
lvextend -l +100%FREE /dev/mapper/vgdata-data  # 分配空间
xfs_growfs /dev/mapper/vgdata-data         # 扩展文件系统
```

**方式B：扩展现有磁盘**
```bash
# 1. VMware 增加硬盘空间
# 2. 安装工具
yum -y install cloud-utils-growpart

# 3. 扩容分区
growpart /dev/sda 2

# 4. 扩容物理卷
pvresize /dev/sda2

# 5. 扩容逻辑卷
lvextend -l +100%FREE /dev/mapper/centos-root

# 6. 扩展文件系统
xfs_growfs /dev/mapper/centos-root

# 7. 验证
df -h
```

### 场景3：缩小 /home 分区

```bash
# 1. 备份 /home 目录
tar cvf /tmp/home.tar /home

# 2. 卸载
umount /home

# 3. 删除原逻辑卷
lvremove -f /dev/ol/home

# 4. 创建新逻辑卷（4GB）
lvcreate -L +4G -n home ol

# 5. 格式化
mkfs.xfs /dev/ol/home

# 6. 创建 backup 卷使用剩余空间
lvcreate -l +100%free -n backup ol
mkfs.xfs /dev/ol/backup

# 7. 更新 fstab
cp /etc/fstab /etc/fstab.bak
# 添加新挂载信息到 /etc/fstab

# 8. 挂载并还原
mount -a
tar xvf /tmp/home.tar -C /home
```

### 场景4：磁盘损坏处理

```bash
# VMware操作：添加新硬盘（容量≥旧盘）

# Linux操作：
pvcreate /dev/sdc                          # 初始化新磁盘
vgextend vg00 /dev/sdc                     # 加入卷组
pvmove /dev/sdb1 /dev/sdc                  # 迁移数据
vgreduce vg00 /dev/sdb1                    # 移除旧PV
pvremove /dev/sdb1                         # 删除元数据

# 验证
pvs | grep vg00
```

## 四、避坑指南

### 操作顺序
```
扩容物理空间 → 扩展PV → 扩展VG → 扩展LV → 扩展文件系统
```

### 高危操作
| 危险操作 | 安全措施 |
|----------|----------|
| 缩小分区 | 必须先卸载并备份数据 |
| 移除PV | 必须先用 pvmove 清空数据 |
| 修改 fstab | 测试用 `mount -a` 验证语法 |

### 应急命令
```bash
vgreduce --removemissing vg00              # 强制移除丢失的PV
lvconvert --repair vg00/lv_data            # 修复镜像卷
dmsetup remove_all                         # 重置设备映射（极端情况）
```