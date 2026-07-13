---
title: journalctl 常用组合命令大全
date: 2026-07-13
description: journalctl 常用命令组合速查表，覆盖基础查看、服务过滤、优先级过滤、日志导出等日常运维场景
tags: [linux, journalctl, systemd, 日志管理]
---

### **journalctl 常用组合命令大全**

#### **1. 基础查看**

```sh
journalctl -xe               # 查看最新日志（带解释+跳转到末尾）
journalctl -n 20            # 查看最新20条日志
journalctl -f               # 实时跟踪日志（类似 tail -f）
journalctl --since "2023-10-01" --until "2023-10-02"  # 查看指定时间范围日志
journalctl --since "1 hour ago"       # 查看最近1小时日志
journalctl -b              # 查看本次启动后的日志
journalctl -b -1           # 查看上一次启动的日志（-2 为上上次，以此类推）
```

#### **2. 按服务/单元过滤**

```sh
journalctl -u nginx.service          # 查看 nginx 服务日志
journalctl -u docker --since today   # 查看今天 docker 的日志
journalctl -u sshd -p err            # 查看 sshd 服务的错误日志
journalctl -u kubelet --no-pager     # 禁止分页输出（适合脚本处理）
```

#### **3. 按优先级过滤**

```sh
journalctl -p err -xe                # 只看错误日志
journalctl -p warning..err           # 查看警告到错误级别的日志
journalctl -p emerg                  # 只看紧急错误（最高优先级）
journalctl -p debug                  # 查看调试信息（最低优先级）
```

#### **4. 按用户/进程**

```sh
journalctl _UID=1000                 # 查看用户ID 1000 的日志
journalctl _PID=1234                 # 查看特定进程ID的日志
journalctl /usr/sbin/sshd            # 查看 sshd 二进制文件的日志
```

#### **5. 高级过滤**

```sh
journalctl -k                       # 只看内核日志（等同 dmesg）
journalctl -o json                  # JSON 格式输出（适合编程解析）
journalctl -o verbose               # 显示完整字段（包括元数据）
journalctl --grep="failed"          # 搜索包含 "failed" 的日志
journalctl --disk-usage             # 查看日志占用的磁盘空间
journalctl --vacuum-size=200M       # 清理日志，保留200MB
```

#### **6. 组合使用**

```sh
journalctl -u nginx -p err --since "2 hours ago"  # 查看 nginx 最近2小时的错误
journalctl -b -0 -p crit..alert    # 本次启动的严重错误
journalctl -u kubelet -o json | jq  # 用 jq 解析 JSON 日志
```

#### **7. 日志导出**

```sh
journalctl -u mysql > mysql.log     # 导出 mysql 日志到文件
journalctl --since yesterday --until today > today.log  # 导出当天日志
```

#### **8. 系统维护**

```sh
journalctl --rotate                 # 立即轮转日志
journalctl --flush                  # 立即写入日志到磁盘
journalctl --verify                 # 检查日志完整性
```

### **使用技巧**

- **快速定位错误**：`journalctl -xe -p err | grep -i "fail|error"`
- **查看某次启动的完整日志**：`journalctl -b -1 | less`
- **跟踪某个服务的实时日志**：`journalctl -u apache -f`

这些命令覆盖了日常运维的绝大部分场景，建议收藏备用！