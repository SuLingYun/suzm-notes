---
title: Linux 系统故障排查指南
description: 涵盖 CPU 飙高、内存泄漏、磁盘 IO 满载、网络丢包等常见 Linux 系统故障的排查思路、命令示例与最佳实践。
date: 2026-07-08
tags:
  - Linux
  - 故障排查
  - 性能调优
  - 运维
---

# Linux 系统故障排查指南

## 1. CPU 飙高

### 1.1 症状

系统响应缓慢，用户请求延迟增大，监控告警触发 CPU 使用率超过阈值（如 90%）。

### 1.2 排查步骤

1.  **定位高 CPU 进程**

    ```bash
    # 查看系统整体 CPU 使用率
    top

    # 按 CPU 使用率排序显示进程
    top -o %CPU

    # 查看 CPU 占用最高的前 10 个进程
    ps aux --sort=-%cpu | head -10
    ```

2.  **定位高 CPU 线程**

    ```bash
    # 查看指定进程的线程级 CPU 消耗
    top -H -p <PID>

    # 使用 ps 查看线程
    ps -mp <PID> -o THREAD,tid,time
    ```

3.  **分析线程堆栈**

    ```bash
    # 将线程 ID 转换为十六进制
    printf "%x\n" <TID>

    # 打印 Java 进程堆栈（Java 应用）
    jstack <PID> | grep -A 30 <TID_HEX>

    # 使用 perf 采样分析热点
    perf top -p <PID>
    ```

4.  **常用诊断命令汇总**

| 命令 | 用途 | 示例 |
|------|------|------|
| `top` | 实时查看进程 CPU 占用 | `top -o %CPU` |
| `htop` | 增强版 top，支持树形视图 | `htop` |
| `pidstat` | 查看进程级 CPU 使用统计 | `pidstat -p <PID> 1` |
| `perf` | 性能事件采样与分析 | `perf record -a -g -- sleep 10` |
| `mpstat` | 查看每个 CPU 核的使用率 | `mpstat -P ALL 1` |

### 1.3 常见原因与处理

| 原因 | 排查方向 | 处理方式 |
|------|---------|---------|
| 业务代码死循环 | 检查代码逻辑，查看线程堆栈 | 修复代码并发布 |
| GC 频繁（Java） | `jstat -gcutil <PID>` 查看 GC 情况 | 调整堆大小或优化代码 |
| 频繁上下文切换 | `vmstat 1` 查看 `cs` 列 | 减少线程数或锁竞争 |
| 定时任务集中执行 | 检查 crontab 配置 | 错峰执行 |

---

## 2. 内存泄漏

### 2.1 症状

系统可用内存持续下降，`OOM Killer` 频繁杀进程，Swap 使用量不断增长。

### 2.2 排查步骤

1.  **查看系统内存概览**

    ```bash
    # 查看内存总体使用情况
    free -h

    # 查看详细内存信息
    cat /proc/meminfo

    # 查看进程内存占用排名
    ps aux --sort=-%mem | head -15
    ```

2.  **检查进程内存详情**

    ```bash
    # 查看进程内存映射
    pmap -x <PID>

    # 查看进程各段内存使用
    cat /proc/<PID>/smaps | grep -E "(Pss|Size)"

    # 使用 smem 查看更准确的内存统计
    smem -p -k -s rss | head -20
    ```

3.  **堆内存分析（Java 应用）**

    ```bash
    # 查看堆内存使用
    jmap -heap <PID>

    # 生成堆转储文件
    jmap -dump:live,format=b,file=heap.hprof <PID>

    # 使用 jcmd 替代（推荐）
    jcmd <PID> GC.heap_dump /tmp/heap.hprof
    ```

4.  **内存泄漏检测工具**

    ```bash
    # valgrind 检测 C/C++ 内存泄漏
    valgrind --leak-check=full ./your_program

    # 使用 /proc 监控进程内存增长趋势
    while true; do
        cat /proc/<PID>/status | grep VmRSS >> mem.log
        sleep 5
    done
    ```

### 2.3 快速诊断表

| 指标 | 查看方式 | 正常范围 |
|------|---------|---------|
| RSS 内存 | `ps -o rss <PID>` | 不持续增长 |
| Swap 使用 | `swapon --show` | 应接近 0 |
| 页错误 | `ps -o majflt,minflt <PID>` | majflt 应很低 |
| OOM 日志 | `dmesg \| grep oom-killer` | 不应出现 |

---

## 3. 磁盘 IO 满载

### 3.1 症状

应用读写缓慢、`iowait` 飙高、数据库查询超时、日志写入阻塞。

### 3.2 排查步骤

1.  **查看磁盘 IO 总体状况**

    ```bash
    # 使用 iostat 查看磁盘 IO 统计
    iostat -x 1 5

    # 使用 sar 查看历史 IO 数据
    sar -d -f /var/log/sa/saXX
    ```

2.  **定位 IO 密集型进程**

    ```bash
    # 使用 iotop 查看进程 IO
    iotop -oP

    # 使用 pidstat 查看进程 IO
    pidstat -d 1
    ```

3.  **分析 IO 性能指标**

    ```bash
    # 查看 IO 请求队列长度
    cat /sys/block/sdX/queue/nr_requests

    # 查看磁盘调度器
    cat /sys/block/sdX/queue/scheduler

    # 使用 blktrace 追踪 IO 事件
    blktrace -d /dev/sdX -o trace
    ```

4.  **文件系统层面排查**

    ```bash
    # 查看文件系统挂载参数
    mount | grep -E "(xfs|ext4)"

    # 检查 inode 使用率
    df -i

    # 查找大文件
    find / -type f -size +1G -exec ls -lh {} \; 2>/dev/null

    # 查找删除但仍被占用的文件
    lsof | grep deleted
    ```

### 3.3 IO 性能基准参考

| 磁盘类型 | 典型 IOPS (4K 随机) | 典型吞吐 (顺序) |
|---------|-------------------|----------------|
| HDD (SATA) | 80 - 200 | 150 - 200 MB/s |
| SSD (SATA) | 5000 - 10000 | 500 - 550 MB/s |
| NVMe SSD | 500000 - 1000000 | 3000 - 7000 MB/s |
| 云盘 (ESSD) | 单盘最高 100 万 | 单盘 4 GB/s |

---

## 4. 网络丢包

### 4.1 症状

应用超时、连接重置、TCP 重传率高、ping 丢包、视频/语音卡顿。

### 4.2 排查步骤

1.  **基础连通性检查**

    ```bash
    # ICMP 连通性测试
    ping -c 100 -i 0.1 <目标IP>

    # 路由跟踪
    traceroute -n <目标IP>

    # MTR 综合检测（推荐）
    mtr -r -c 100 <目标IP>
    ```

2.  **网卡与驱动层排查**

    ```bash
    # 查看网卡统计信息（重点关注 error/drop/overrun）
    ip -s link show dev eth0

    # 查看网卡队列
    ethtool -l eth0

    # 查看网卡硬件参数
    ethtool eth0

    # 调整网卡 Ring Buffer
    ethtool -G eth0 rx 4096 tx 4096
    ```

3.  **TCP/IP 协议栈排查**

    ```bash
    # 查看网络统计
    netstat -s

    # 查看 TCP 连接状态分布
    ss -ant | awk '{print $1}' | sort | uniq -c

    # 查看 TCP 重传统计
    nstat -az | grep -E "(Retrans|Loss|drop)"

    # 查看 socket 缓冲区
    ss -t -i
    ```

4.  **内核网络参数调优**

    ```bash
    # 查看当前 TCP 参数
    sysctl net.ipv4.tcp_rmem
    sysctl net.ipv4.tcp_wmem
    sysctl net.core.rmem_max
    sysctl net.core.wmem_max

    # 临时调整（例：高并发场景）
    sysctl -w net.core.rmem_max=16777216
    sysctl -w net.core.wmem_max=16777216
    sysctl -w net.ipv4.tcp_congestion_control=bbr
    ```

### 4.3 丢包原因速查

| 丢包特征 | 可能原因 | 排查命令 |
|---------|---------|---------|
| 网卡 `drop` 递增 | Ring Buffer 满 | `ethtool -S eth0 \| grep drop` |
| `overruns` 递增 | 驱动或硬件瓶颈 | `ethtool -S eth0 \| grep overrun` |
| TCP 重传率高 | 网络拥塞或对端处理慢 | `nstat -az RetransSegs` |
| `LISTEN` 队列溢出 | 应用 accept 慢 | `ss -lnt \| grep Recv-Q` |
| 多网卡哈希不均 | RSS 队列配置不合理 | `ethtool -x eth0` |

---

## 5. 综合诊断工具速查

### 5.1 性能监控黄金命令

```bash
# 系统整体性能概览
dstat -tcdngy 5

# 查看系统负载与资源瓶颈
vmstat 1 10

# 进程级资源使用详情
pidstat -urdh 1

# 网络连接与带宽
iftop -nP

# 实时 IO 监控
iostat -x 1
```

### 5.2 日志分析

```bash
# 系统日志
journalctl -xe --since "10 min ago"

# 内核日志
dmesg -T | tail -50

# 应用日志（示例：Nginx）
tail -f /var/log/nginx/access.log | awk '{print $9}' | sort | uniq -c | sort -rn
```

### 5.3 故障复盘 Checklist

1.  **发生了什么？** 查看告警与监控曲线，确认故障时间、影响范围。
2.  **根因是什么？** 通过 `top`、`iostat`、`netstat` 等工具定位瓶颈。
3.  **临时恢复措施？** 扩缩容、重启服务、限流降级、回滚发布。
4.  **长期修复方案？** 代码优化、配置调优、架构升级、容量规划。
5.  **如何防止再发生？** 补充监控告警、完善应急预案、建立巡检机制。

---

> **参考命令汇总**：本文涉及的所有命令均可通过 `man <command>` 或 `<command> --help` 查看完整参数说明。生产环境中执行高危操作（如重启服务、修改内核参数）前请务必评估影响。

---


---


---


---
