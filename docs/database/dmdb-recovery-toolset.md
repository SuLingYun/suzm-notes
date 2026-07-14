---
title: 达梦数据库快速恢复工具集
date: 2026-07-14
description: 达梦数据库快速恢复工具集，支持同机/异机快速恢复、智能检测备份链、五种恢复模式、实例重新初始化及实时文件同步
tags: [达梦数据库, dm, database, 备份恢复, 运维工具]
---

# 达梦数据库快速恢复工具集

> 项目地址：[github.com/SuLingYun/dmdb](https://github.com/SuLingYun/dmdb)

## 项目简介

**DM-Database-Recovery** 是达梦数据库的专业恢复工具集，专为生产环境设计。通过智能检测备份链、自动选择最优恢复策略，实现快速、可靠的数据库恢复。

### 核心价值

- **快速恢复**：一键恢复到最新状态或指定时间点
- **智能策略**：自动检测增量备份链，选择最优恢复路径
- **可视化进度**：实时显示恢复进度、速度和剩余时间
- **完整日志**：详细记录所有操作，便于审计和故障排查

### 适用场景

- 数据库故障恢复
- 数据误删除恢复
- 数据库迁移（同机/异机）
- 灾备演练
- 测试环境 / 生产基线实例重建
- 数据库参数规范化配置
- 文件实时同步备份（rsync + inotify）

---

## 功能特性

### 核心功能

| 功能 | 说明 |
|------|------|
| **三种恢复模式** | 恢复到最新状态、时间点恢复、仅恢复备份（支持无归档场景） |
| **两种备份模式** | dmrman 脱机全量备份、disql 联机全量备份 |
| **增量备份支持** | 自动检测并应用增量备份链，支持手动选择部分增量 |
| **归档日志恢复** | 基于归档日志的精细化恢复，支持 UNTIL TIME 时间点恢复 |
| **WITH BACKUPDIR** | 一次性恢复全量+增量链，自动搜索增量备份 |
| **时间点恢复** | 精确恢复到指定时间点（YYYY-MM-DD HH:MI:SS） |
| **备份集校验** | 恢复前可选校验备份完整性（CHECK BACKUPSET） |

### 用户交互

- **可视化进度条**：实时显示恢复进度、速度、剩余时间
- **彩色终端输出**：清晰的日志分级和颜色标识（INFO/WARN/ERROR/STEP）
- **交互式恢复计划确认**：执行前显示完整恢复计划，包括基座全量、增量列表、归档范围
- **安全确认机制**：危险操作二次确认
- **可跳过数据备份**：恢复前可选择是否备份当前数据目录
- **手动选择全量基座**：支持在模式1/2中手动切换全量备份基座

### 智能检测

- 自动检测增量备份并选择最优恢复策略（使用 WITH BACKUPDIR 或降级手动应用）
- 自动检测全量备份是否有归档覆盖
- 自动识别最新归档时间（按文件名时间戳排序）
- 自动选择适合目标时间点的全量基座
- 自动检测 dmserver 和 dmap 进程状态
- 自动检测数据目录权限并修复

---

## 五种恢复模式

### 模式1：恢复到最新状态（推荐）

自动应用所有增量备份和归档日志，将数据库恢复到最新可用状态。

```
适用于：常规故障恢复、生产环境紧急恢复
```

**特点：**
- 使用 `RESTORE WITH BACKUPDIR` 一次性恢复全量+增量链
- 自动应用所有归档日志
- 全程自动化，用户只需确认

### 模式2：恢复到指定时间点

精确恢复到用户指定的时间点，适用于数据误删除等场景。

```
适用于：数据误删除恢复、误操作恢复
```

**特点：**
- 自动选择最合适的全量备份基座
- 由归档日志精确推进到目标时间
- 跳过增量备份（由归档替代）

**时间格式：** `YYYY-MM-DD HH:MI:SS`

### 模式3：仅恢复备份

仅恢复数据文件，不应用归档日志，适用于归档损坏或不需要归档的场景。

```
适用于：归档日志损坏、仅需恢复数据文件
```

**特点：**
- 可选择是否应用增量备份
- 不应用归档日志
- 可手动选择部分增量

### 模式4：dmrman 脱机全量备份

在数据库关闭状态下，使用 dmrman 执行全量备份，适用于需要一致性备份的场景。

```
适用于：计划性全量备份、备份前确保数据一致
```

**特点：**
- 需要先停止数据库
- dmrman 脱机备份，数据一致性有保障
- 备份完成后自动启动数据库

### 模式5：disql 联机全量备份

在数据库运行状态下，使用 disql 执行联机全量备份，不需要停机。

```
适用于：生产环境不停机备份、每日例行备份
```

**特点：**
- 数据库保持运行，不影响业务
- 联机备份，自动包含备份期间产生的归档日志
- 备份过程中业务可正常访问

---

## 快速开始

### 前置条件

- 达梦数据库 V8 及以上
- dmrman 工具可用
- Bash 4.0+
- 有效的备份集和归档日志

### 执行恢复

```bash
# 1. 克隆或下载脚本
git clone https://github.com/SuLingYun/dmdb.git
cd dmdb

# 2. 添加执行权限
chmod +x dm_recover.sh

# 3. 编辑配置（必须）
vim dm_recover.sh
# 修改 DB_USER, DB_PASS, DM_HOME, DM_DATA, DM_BAK, DM_ARCH 等参数

# 4. 执行恢复脚本
./dm_recover.sh
```

### 恢复流程

```
1. 环境检查
   ├── 验证 DM_HOME、备份目录、归档目录是否存在
   └── 检查 dm.ini 配置文件

2. 显示可恢复范围
   ├── 列出所有全量备份
   ├── 列出所有增量备份
   ├── 列出所有归档日志
   └── 计算可恢复时间范围

3. 选择恢复模式
   ├── 模式1: 恢复到最新状态
   ├── 模式2: 恢复到指定时间点
   ├── 模式3: 仅恢复备份，不应用归档
   ├── 模式4: 完整备份数据库（dmrman 脱机）
   └── 模式5: 完整备份数据库（disql 联机）

4. 执行恢复
   ├── 停止数据库
   ├── 启动 DMAP 服务
   ├── 选择是否备份当前数据
   ├── 恢复全量备份
   ├── 应用增量备份
   ├── 应用归档日志或 UPDATE DB_MAGIC
   └── 更新 DB_MAGIC

5. 验证恢复
   ├── 启动数据库
   ├── 验证数据库状态
   └── 显示恢复摘要
```

---

## 配置说明

### 基础配置

```bash
# 数据库连接信息
DB_USER="SYSDBA"              # 数据库用户名
DB_PASS="your_password"        # 数据库密码

# 达梦数据库路径
DM_HOME="/data/dm"             # 达梦安装目录
DM_DATA="/data/dmdata/DAMENG" # 数据文件目录（包含 dm.ini）
DM_BAK="/data/dmbak/DAMENG/bak"  # 备份文件目录
DM_ARCH="/data/dmarch/DAMENG"  # 归档日志目录

# 数据库服务配置
DB_SERVICE="DmServiceDAMENG"   # systemd 服务名
DB_PORT="5236"                 # 数据库监听端口

# 备份/归档文件名模式
FULL_BAK_PATTERN="DB_DAMENG_FULL_*"        # 全量备份目录名模式
INC_BAK_PATTERN="DB_DAMENG_INCREMENT_*"     # 增量备份目录名模式
ARCH_PATTERN="ARCHIVE_LOCAL*"              # 归档日志文件名模式
```

### 高级配置

```bash
# 恢复后自动备份 (yes/no)
AUTO_BACKUP="no"

# dmrman 超时时间（秒），默认 7200 秒（2小时）
DMRMAN_TIMEOUT=7200
```

---

## 数据库重新初始化（reset_dm.sh）

当现有数据库实例需要从零重建时，使用 `reset_dm.sh` 完成以下工作：

- 停止并卸载旧的 `DmService<DMSERVER>` 服务
- 将旧数据目录/归档目录备份为 `.bak.YYYYMMDD_HHMMSS` 后缀
- 调用 `dminit` 初始化全新的数据库实例（32K PAGE、1024M REDO LOG）
- 注册新的 systemd 服务
- 修改 `dm.ini` 参数（`COMPATIBLE_MODE=2`、`ARCH_INI=1` 等）
- 创建 `dmarch.ini` 归档配置（LOCAL1 线程，200GB 归档上限）
- 启动数据库服务并验证归档生效
- 自动创建全量备份（每周六）和增量备份（周日至周五）作业

### 执行要求

- **必须以 root 执行**
- 目标目录 `/data/dm`、`/data/dmdata`、`/data/dmarch`、`/data/dmbak` 存在或可被脚本创建
- 磁盘预留至少 5GB 可用空间

---

## rsync + inotify 实时文件同步（rsync-inotify-sync.sh）

轻量级实时文件同步工具，通过 rsync + inotify 实现文件变更的实时同步。

### 两种工作模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| **本地服务器（模式1）** | 监控本地目录变化，实时同步到远程备份服务器 | 数据源服务器 |
| **备份服务器（模式2）** | 接收多个本地服务器的同步数据 | 备份中心服务器 |

### 核心特性

- 实时同步：inotify 监控文件变化，rsync 实时推送变更
- 增量同步：仅传输变更的文件内容，带宽占用低
- 断点续传：rsync 支持断点续传，网络中断不影响
- systemd 管理：支持 systemctl 管理服务，开机自启
- 多平台支持：麒麟V10、CentOS/RHEL 7-9、Ubuntu、Debian 等
- 安全特性：密码文件权限 600、rsyncd 认证、IP 白名单、chroot 隔离

---

## 安全建议

### 密码安全

```bash
# 方案1：环境变量
export DM_DB_PASS="your_secure_password"

# 方案2：密码文件（600权限）
echo "your_password" > ~/.dm_pass
chmod 600 ~/.dm_pass

# 方案3：交互式输入
read -s -p "请输入数据库密码: " DB_PASS
```

### 文件权限

```bash
# 数据/备份/归档目录：仅 dmdba 用户可访问
chmod 700 /data/dmdata/DAMENG
chmod 700 /data/dmbak/DAMENG/bak
chmod 700 /data/dmarch/DAMENG

# 脚本权限：755
chmod 755 *.sh
```

---

## 备份与归档命名规范

### 命名格式

| 类型 | 格式要求 | 示例 |
|------|----------|------|
| 全量备份目录 | `DB_<库名>_FULL_YYYY_MM_DD[_HH_MI_SS]` | `DB_DAMENG_FULL_2026_06_10` |
| 增量备份目录 | `DB_<库名>_INCREMENT_YYYY_MM_DD[_HH_MI_SS]` | `DB_DAMENG_INCREMENT_2026_06_11` |
| 归档日志文件 | `ARCHIVE_LOCAL<N>_YYYY-MM-DD_HH-MI-SS.log` | `ARCHIVE_LOCAL1_2026-06-10_14-30-00.log` |

### 目录结构示例

```
/data/dmbak/DAMENG/bak/
├── DB_DAMENG_FULL_2026_06_01/        # 全量备份
├── DB_DAMENG_FULL_2026_06_10/        # 全量备份
├── DB_DAMENG_INCREMENT_2026_06_11/   # 增量备份
└── DB_DAMENG_INCREMENT_2026_06_12/   # 增量备份

/data/dmarch/DAMENG/
├── ARCHIVE_LOCAL1_2026-06-10_00-00-00.log
└── ARCHIVE_LOCAL1_2026-06-10_01-00-00.log
```

---

## 相关资源

- **GitHub 仓库**：[github.com/SuLingYun/dmdb](https://github.com/SuLingYun/dmdb) — 包含所有脚本源码和详细文档
- **手动恢复指南**：[MANUAL_RECOVERY.md](https://github.com/SuLingYun/dmdb/blob/main/MANUAL_RECOVERY.md) — 手动执行恢复操作的详细步骤
- **重置指南**：[RESET_GUIDE.md](https://github.com/SuLingYun/dmdb/blob/main/RESET_GUIDE.md) — 数据库重新初始化详细说明
- **同步工具指南**：[RSYNC_SYNC.md](https://github.com/SuLingYun/dmdb/blob/main/RSYNC_SYNC.md) — rsync+inotify 实时同步配置说明
- **达梦数据库官方文档**：[dameng.com](https://www.dameng.com/document)