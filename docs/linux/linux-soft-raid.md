---
title: Linux 软 RAID 运维命令
date: 2026-07-13
description: Linux 软 RAID 日常运维笔记，涵盖磁盘故障检测、替换、数据同步监控及验证恢复
tags: [linux, raid, mdadm, 磁盘管理]
---

## 检测磁盘故障

首先需要确认哪块磁盘出现了问题：

```sh
# 查看RAID状态
cat /proc/mdstat

# 查看详细的RAID信息
mdadm --detail /dev/md127
mdadm --detail /dev/md124
# 查看所有RAID设备
mdadm --detail /dev/md[0-9]*

# 查看磁盘SMART信息
smartctl -a /dev/nvme0n1
smartctl -a /dev/nvmeln1
```

## 替换磁盘步骤

### 1. **标记磁盘为故障**（如果系统未自动检测到）

```sh
# 将故障磁盘从RAID中移除
mdadm --manage /dev/md127 --fail /dev/nvme0n1p1
mdadm --manage /dev/md124 --fail /dev/nvme0n1p5
# 对每个RAID阵列执行相同操作...

# 然后移除故障磁盘
mdadm --manage /dev/md127 --remove /dev/nvme0n1p1
```

### 2. **物理更换磁盘**

- 如果支持热插拔，可以直接拔掉故障NVMe磁盘，插入新磁盘
- 如果不支持热插拔，需要关机更换

### 3. **对新磁盘分区**

新磁盘需要创建与原来相同的分区结构：

```sh
# 使用sfdisk复制分区表（从正常磁盘复制到新磁盘）
sfdisk -d /dev/nvmeln1 | sfdisk /dev/nvme0n1

# 或者手动创建分区（如果需要）
parted /dev/nvme0n1
```

### 4. **将新分区加入RAID阵列**

```sh
# 将新磁盘的各个分区添加到对应的RAID阵列
mdadm --manage /dev/md127 --add /dev/nvme0n1p1
mdadm --manage /dev/md124 --add /dev/nvme0n1p5
mdadm --manage /dev/md126 --add /dev/nvme0n1p4
mdadm --manage /dev/md125 --add /dev/nvme0n1p3
mdadm --manage /dev/md123 --add /dev/nvme0n1p2
```

## 数据同步过程

### **自动同步**

- 一旦添加新磁盘，RAID会自动开始重新同步数据
- 同步过程在后台进行，系统可以正常使用
- 数据会从正常的磁盘复制到新磁盘的对应分区

### **监控同步进度**

```sh
# 查看同步进度
cat /proc/mdstat

# 查看详细同步状态
mdadm --detail /dev/md127

# 持续监控
watch cat /proc/mdstat
```

### **同步时间**

- 取决于数据量和磁盘速度
- 对于您的3.5TB数据，可能需要几小时到十几小时
- 同步期间系统性能可能会受到轻微影响

## 验证恢复结果

```sh
# 检查所有RAID阵列状态
mdadm --detail /dev/md[0-9]*

# 确认所有阵列都恢复正常状态
cat /proc/mdstat

# 检查文件系统完整性
fsck /dev/md127
```

## 重要注意事项

1. **及时更换**：在磁盘故障后应尽快更换，因为此时系统运行在"降级"模式，没有冗余保护
2. **备份重要数据**：虽然RAID提供冗余，但在重大操作前仍建议备份关键数据
3. **检查引导加载器**：更换磁盘后可能需要重新安装GRUB：
   ```sh
   grub2-install /dev/nvme0n1
   grub2-install /dev/nvmeln1
   update-grub2
   ```
4. **更新RAID配置**：确保 `/etc/mdadm/mdadm.conf` 包含新磁盘信息：
   ```sh
   mdadm --detail --scan >> /etc/mdadm/mdadm.conf
   update-initramfs -u
   ```