---
title: Linux 运维笔记
description: Linux 系统运维相关文章索引
---

# Linux 运维笔记

Linux 系统运维是日常工作中最基础也最重要的部分。这里整理了系统调优、故障排查、Shell 脚本等方面的实战经验。

## 文章列表

- [CentOS 系统调优](/linux/centos-tuning) — 内核参数优化、资源限制调优、文件系统优化
- [故障排查指南](/linux/troubleshooting) — CPU 飙高、内存泄漏、磁盘 IO 等常见问题处理

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