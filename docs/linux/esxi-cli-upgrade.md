---
title: ESXi 主机通过 ESXCLI 命令行升级操作流程
date: 2026-07-20
description: 使用 ESXCLI 命令行工具对 VMware ESXi 主机进行离线升级的完整操作步骤，包含升级前准备、执行升级、验证等
tags: [vmware, esxi, 升级, 运维]
---

# ESXi 主机通过 ESXCLI 命令行升级操作流程

## 一、升级前准备

1. **【重要】备份**：确保已备份 ESXi 主机配置和所有重要虚拟机。
2. **【重要】兼容性检查**：访问 VMware 兼容性指南，确认服务器硬件（CPU、网卡、RAID 卡）与目标 ESXi 版本兼容。
3. 从 VMware 官网下载正确的离线 ZIP 包（如：`VMware-ESXi-7.0U3w-24784741-depot.zip`）。
4. 使用 vSphere Client 或 SCP 工具将 ZIP 包上传到 ESXi 主机的数据存储中。

## 二、升级操作步骤

### 1. 开启 ESXi SSH
在 ESXi Web 管理界面，进入 **主机 → 操作 → 服务 → 启用 SSH**。

### 2. 迁移虚拟机并进入维护模式
在 vSphere Client 中，右键点击主机 → **进入维护模式**。确认所有虚拟机已迁移或关闭。

### 3. （可选）查看当前版本
```bash
vmware -vl
```

### 4. 确认升级包路径
```bash
ls -l /vmfs/volumes/
```

### 5. 列出 Depot 包中的 Profile
```bash
esxcli software sources profile list -d /vmfs/volumes/.../VMware-ESXi-7.0U3w-24784741-depot.zip
```

### 6. 执行升级命令
```bash
esxcli software profile update -p ESXi-7.0U3w-24784741-standard -d /vmfs/volumes/.../VMware-ESXi-7.0U3w-24784741-depot.zip --no-hardware-warning
```

参数说明：
- `--no-hardware-warning`：忽略硬件兼容性警告
- `--no-sig-check`：跳过签名验证（用于含第三方驱动的升级包）

### 7. 重启并验证
```bash
reboot
# 重启后
vmware -vl
```

在 vSphere Client 中，右键点击主机 → **退出维护模式**，启动虚拟机。

## 三、注意事项

- **路径与名称**：命令中的文件路径和 Profile 名称必须与实际完全一致，区分大小写。
- **文件完整性**：若报错 "File is not a zip file"，通常文件未完整上传。
- **许可证**：确保拥有有效的目标版本许可证。
- **驱动兼容性**：升级后检查第三方驱动是否正常工作。