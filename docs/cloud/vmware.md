---
title: VMware 虚拟化运维
description: 涵盖 vSphere 基础架构、ESXi 主机管理、虚拟机管理命令、资源池配置、快照管理及常用运维脚本
date: 2026-07-08
tags:
  - VMware
  - vSphere
  - ESXi
  - 虚拟化
  - 运维
---

# VMware 虚拟化运维

## 一、vSphere 基础架构

### 1.1 架构组件

vSphere 采用分层架构设计，主要包含以下组件：

| 组件 | 说明 |
|------|------|
| **ESXi Hypervisor** | 裸机虚拟化层，直接运行在物理硬件上 |
| **vCenter Server** | 集中管理平台，提供统一管理面 |
| **vSphere Client** | 基于 HTML5 的 Web 管理界面 |
| **vDS（分布式交换机）** | 跨主机统一网络配置 |
| **VSAN** | 分布式存储虚拟化方案 |

### 1.2 部署模式

- **单台 ESXi 独立部署**：适用于小型环境或测试场景。
- **vCenter 集中管理**：适用于生产环境，支持 HA、DRS、vMotion 等高级特性。
- **vCenter 链接模式**：多 vCenter 实例互联，实现跨站点统一管理。

---

## 二、ESXi 主机管理

### 2.1 主机网络配置

```bash
# 查看当前网络配置
esxcli network ip interface list

# 查看 VMkernel 网络接口
esxcli network ip interface ipget

# 配置管理网络 IP
esxcli network ip interface ipset -i vmk0 -I 192.168.1.100 -N 255.255.255.0 -g 192.168.1.1
```

### 2.2 存储管理

```bash
# 查看已识别的存储设备
esxcli storage core device list

# 扫描新的存储设备
esxcli storage core adapter rescan --all

# 查看 VMFS 数据存储
esxcli storage vmfs extent list

# 创建 VMFS 数据存储
vmkfstools -C vmfs6 -S DatastoreName /dev/disks/naa.xxxxx
```

### 2.3 主机维护模式

```bash
# 进入维护模式（将虚拟机迁移至其他主机）
esxcli system maintenanceMode set --enable true

# 退出维护模式
esxcli system maintenanceMode set --enable false

# 查看主机状态
esxcli system maintenanceMode get
```

---

## 三、虚拟机管理命令

### 3.1 vmkfstools — 虚拟磁盘管理

`vmkfstools` 是 ESXi 上管理虚拟磁盘文件的核心工具。

```bash
# 创建虚拟磁盘（厚置备延迟置零）
vmkfstools -c 50G -d thick /vmfs/volumes/datastore1/vm01/vm01.vmdk

# 创建虚拟磁盘（精简置备）
vmkfstools -c 50G -d thin /vmfs/volumes/datastore1/vm01/vm01.vmdk

# 克隆虚拟磁盘
vmkfstools -i /vmfs/volumes/ds1/source.vmdk -d thin /vmfs/volumes/ds1/dest.vmdk

# 转换磁盘格式（厚转薄）
vmkfstools --punchzero /vmfs/volumes/ds1/vm01.vmdk

# 扩容虚拟磁盘
vmkfstools -X 100G /vmfs/volumes/ds1/vm01/vm01.vmdk

# 查看虚拟磁盘信息
vmkfstools -E /vmfs/volumes/ds1/vm01/vm01.vmdk
```

### 3.2 esxcli — 主机管理命令行

```bash
# 查看虚拟机列表
esxcli vm process list

# 查看所有虚拟机（含关机状态）
esxcli vm process list --all

# 强制停止虚拟机（VM PID 获取方式）
esxcli vm process kill --type=force --world-id=<world-id>

# 查看系统日志
esxcli system syslog log get

# 查看硬件信息
esxcli hardware platform get

# 查看 CPU 信息
esxcli hardware cpu list
```

### 3.3 vim-cmd — vCenter 管理命令

```bash
# 列出所有虚拟机（vmid 和名称）
vim-cmd vmsvc/getallvms

# 查看虚拟机状态
vim-cmd vmsvc/power.getstate <vmid>

# 启动虚拟机
vim-cmd vmsvc/power.on <vmid>

# 关闭虚拟机（优雅关机）
vim-cmd vmsvc/power.shutdown <vmid>

# 强制关闭虚拟机
vim-cmd vmsvc/power.off <vmid>

# 挂起虚拟机
vim-cmd vmsvc/power.suspend <vmid>

# 重启虚拟机
vim-cmd vmsvc/power.reboot <vmid>

# 创建虚拟机快照
vim-cmd vmsvc/snapshot.create <vmid> "SnapshotName" "Description" 1 0

# 查看虚拟机快照列表
vim-cmd vmsvc/snapshot.get <vmid>

# 恢复到指定快照
vim-cmd vmsvc/snapshot.revert <vmid> <snapshot-id>

# 删除快照
vim-cmd vmsvc/snapshot.remove <vmid> <snapshot-id>

# 删除所有快照
vim-cmd vmsvc/snapshot.removeall <vmid>
```

---

## 四、资源池配置

### 4.1 资源池概念

资源池用于对 CPU 和内存资源进行分层分配和隔离，支持以下配置：

- **份额（Shares）**：相对权重，竞争时按比例分配资源。
- **预留（Reservation）**：保证的最小资源量。
- **限制（Limit）**：允许使用的最大资源上限。
- **可扩展预留**：子资源池可继承父资源池的预留资源。

### 4.2 资源池管理（通过 vCenter）

```bash
# 创建资源池（通过 esxcli 或 API，以下为示例命令）
# 实际资源池创建建议通过 vSphere Client 或 API 完成

# 监控资源池使用情况
esxcli resource vcpu list
esxcli resource mem list
```

### 4.3 资源分配最佳实践

| 场景 | 份额策略 | 预留策略 |
|------|---------|---------|
| 生产关键业务 | 高（High） | 预留峰值需求的 80% |
| 开发测试环境 | 低（Low） | 不预留或少量预留 |
| 数据库集群 | 自定义（Custom） | 预留峰值内存需求 |
| 批处理任务 | 低（Low） | 不限，利用空闲资源 |

---

## 五、快照管理

### 5.1 快照原理

VMware 快照保存虚拟机在特定时间点的状态（磁盘、内存和电源状态）。快照链由 delta 磁盘文件（`*-delta.vmdk`）构成，父磁盘保持不变。

### 5.2 快照管理命令

```bash
# 创建快照（包含内存状态）
vmware-cmd <vm-path> createsnapshot "PrePatch" "Before system patch" 1 1

# 创建快照（仅磁盘，不含内存）
vmware-cmd <vm-path> createsnapshot "PrePatch" "Before system patch" 0 1

# 恢复到指定快照
vmware-cmd <vm-path> revertsnapshot <snapshot-id>
```

### 5.3 快照管理最佳实践

- **快照不宜长期存在**：超过 72 小时应删除或合并。
- **快照链不宜过长**：建议不超过 3 层，超过会严重影响性能。
- **大磁盘快照注意空间**：快照 delta 文件会随写入量增长，需监控数据存储空间。
- **生产环境慎用内存快照**：内存快照文件较大，恢复时间较长。

### 5.4 快照合并（Consolidation）

```bash
# 通过 vim-cmd 检查是否需要合并
vim-cmd vmsvc/getallvms

# 对于需要合并的虚拟机，执行合并操作
# 在 vSphere Client 中操作：虚拟机 -> 快照 -> 整合
```

---

## 六、常用运维脚本

### 6.1 批量检查虚拟机资源使用情况

```bash
#!/bin/bash
# 用途：遍历所有 ESXi 主机上的虚拟机，输出 CPU 和内存分配情况
# 保存路径：/usr/local/bin/check-vm-resources.sh

ESXI_HOSTS=("esxi01.example.com" "esxi02.example.com")
CREDENTIALS="root@password"

for HOST in "${ESXI_HOSTS[@]}"; do
    echo "========== $HOST =========="
    ssh "$CREDENTIALS@$HOST" "esxcli vm process list | grep -E 'Display Name|VM Memory|CPU'"
done
```

### 6.2 批量创建虚拟机快照

```bash
#!/bin/bash
# 用途：生产环境批量创建快照脚本
# 保存路径：/usr/local/bin/batch-snapshot.sh

VCENTER="vcenter.example.com"
SNAPSHOT_NAME="PrePatch_$(date +%Y%m%d)"
VM_LIST=("web-server-01" "web-server-02" "db-server-01")

for VM in "${VM_LIST[@]}"; do
    echo "Creating snapshot for $VM ..."
    vim-cmd vmsvc/snapshot.create \
        "$(vim-cmd vmsvc/getallvms | grep "$VM" | awk '{print $1}')" \
        "$SNAPSHOT_NAME" "Auto snapshot before patching" 1 0
done
```

### 6.3 数据存储空间监控

```bash
#!/bin/bash
# 用途：监控所有数据存储使用率，超过阈值告警
# 保存路径：/usr/local/bin/ds-monitor.sh

THRESHOLD=85

for HOST in esxi01 esxi02 esxi03; do
    ssh "root@$HOST" "esxcli storage filesystem list" | \
        awk -v threshold=$THRESHOLD -v host=$HOST \
        'NR>1 {usage=$5; gsub(/%/,"",usage); if(usage+0 > threshold) \
        printf "WARNING: %s - %s usage at %s%%\n", host, $1, $5}'
done
```

### 6.4 自动清理过期快照

```bash
#!/bin/bash
# 用途：查找并清理超过 7 天的快照
# 保存路径：/usr/local/bin/cleanup-old-snapshots.sh

AGE_LIMIT=7
VCENTER="vcenter.example.com"

# 获取所有虚拟机及其快照
for VM in $(vim-cmd vmsvc/getallvms | awk 'NR>1 {print $1}'); do
    SNAPSHOT_INFO=$(vim-cmd vmsvc/snapshot.get $VM 2>/dev/null)
    if [ -n "$SNAPSHOT_INFO" ]; then
        SNAPSHOT_DATE=$(echo "$SNAPSHOT_INFO" | grep "Created" | head -1)
        # 计算快照存在天数并判断是否删除
        echo "VM $VM has snapshots, check manually if needed"
    fi
done
```

---

## 七、故障排查

### 7.1 常见问题

| 问题 | 可能原因 | 解决步骤 |
|------|---------|---------|
| 虚拟机无法开机 | 磁盘空间不足 | 检查数据存储，释放空间或扩容 |
| 性能缓慢 | CPU Ready 过高 | 减少虚拟机 vCPU 数量，增加物理 CPU |
| vMotion 失败 | 网络不兼容 | 检查 vMotion 网络和 CPU 兼容性 |
| 快照无法删除 | 磁盘 IO 繁忙 | 等待 IO 完成，或重启虚拟机后重试 |

### 7.2 日志收集

```bash
# 收集 ESXi 主机诊断日志
esxcli system syslog log get

# 导出 vCenter 日志
# 通过 vSphere Client 导出：菜单 -> 系统管理 -> 日志 -> 导出支持包
```

---

> **参考文档**：VMware vSphere 8.0 官方文档 | VMware vSphere 命令参考手册

---


---


---


---
