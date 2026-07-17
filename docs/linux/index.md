---
title: Linux 运维笔记
description: Linux 系统运维相关文章索引
---

<script setup>
import CategoryNav from '../.vitepress/theme/CategoryNav.vue'
</script>

<CategoryNav current="linux" />

# Linux 运维笔记

Linux 系统运维是日常工作中最基础也最重要的部分。这里整理了系统调优、故障排查、Shell 脚本等方面的实战经验。

## 涵盖内容

- **系统调优**：内核参数优化、资源限制配置、性能调优
- **故障排查**：系统故障诊断、日志分析、问题定位
- **Shell 编程**：脚本编写、自动化任务、工具开发
- **服务管理**：systemd 服务管理、进程监控
- **安全加固**：SSH 安全配置、防火墙规则、权限管理
- **存储管理**：软 RAID 配置、磁盘管理、文件系统

## 常用命令速查

| 命令 | 用途 |
|------|------|
| `top` / `htop` | 实时查看系统进程与资源占用 |
| `iostat -x 1` | 监控磁盘 IO 性能 |
| `vmstat 1` | 查看内存、进程、CPU 活动 |
| `sar -n DEV 1` | 网络流量监控 |
| `strace -p PID` | 跟踪系统调用 |
| `lsof -i :PORT` | 查看端口占用 |

> 持续更新中，欢迎收藏关注。