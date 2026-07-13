# 网络运维笔记

> 本目录汇集了网络运维相关的技术笔记，涵盖防火墙配置、WAF 防护实践、网络故障排查等内容。持续更新中。

---

## 文章列表

| 文章 | 描述 | 标签 |
|------|------|------|
| [防火墙配置指南](./firewall.md) | iptables / firewalld 配置、常用规则示例、NAT 转发配置 | `iptables` `firewalld` `NAT` `安全` |
| [WAF 防护实践](./waf.md) | ModSecurity 配置、OWASP 规则集、CC 攻击防护、IP 黑白名单 | `WAF` `ModSecurity` `OWASP` `安全` |
| [Linux 故障排查指南](../linux/troubleshooting.md) | CPU 飙高、内存泄漏、磁盘 IO、网络丢包排查 | `Linux` `故障排查` `性能调优` |

---

## 常用网络命令速查表

### 连通性测试

| 命令 | 用途 | 常用参数 |
|------|------|---------|
| `ping` | ICMP 连通性测试 | `-c <次数>` `-i <间隔>` `-s <包大小>` |
| `traceroute` | 路由路径追踪 | `-n`（不解析域名）`-T`（TCP 模式） |
| `mtr` | 综合路由与丢包检测 | `-r`（报告模式）`-c <次数>` |
| `tcptraceroute` | TCP 路由追踪（穿透防火墙） | 兼容 traceroute 参数 |

### 网络配置与查看

```bash
# IP 地址配置
ip addr show
ip addr add 192.168.1.100/24 dev eth0

# 路由表
ip route show
ip route add default via 192.168.1.1

# 网卡状态
ip link show
ip link set eth0 up/down

# ARP 表
ip neigh show
```

### 连接与端口排查

| 命令 | 用途 | 示例 |
|------|------|------|
| `ss` | 查看 socket 统计（推荐替代 netstat） | `ss -tuln` `ss -ant state established` |
| `netstat` | 传统网络连接查看 | `netstat -tulnp` `netstat -s` |
| `lsof -i` | 查看进程打开的端口 | `lsof -i :80` `lsof -iTCP -sTCP:LISTEN` |
| `nmap` | 端口扫描 | `nmap -sT -p 1-1000 <目标>` |

### 带宽与流量监控

```bash
# 实时带宽查看（按进程）
nethogs

# 实时带宽查看（按连接）
iftop -nP

# 接口流量统计
ip -s link show eth0

# 流量抓包
tcpdump -i eth0 -nn port 80
tshark -i eth0 -Y "http"
```

### DNS 排查

| 命令 | 用途 | 示例 |
|------|------|------|
| `dig` | DNS 查询（推荐） | `dig @8.8.8.8 example.com A` |
| `nslookup` | 传统 DNS 查询 | `nslookup example.com` |
| `host` | 简易 DNS 查询 | `host example.com` |
| `resolvectl` | systemd DNS 管理 | `resolvectl status` |

### 性能测试工具

| 工具 | 用途 | 安装方式 |
|------|------|---------|
| `iperf3` | TCP/UDP 带宽测试 | `yum install iperf3` / `apt install iperf3` |
| `netperf` | 网络性能基准测试 | EPEL 源或编译安装 |
| `httping` | HTTP 延迟测试 | `apt install httping` |
| `wrk` | HTTP 压力测试 | 编译安装 |
| `ab` | Apache HTTP 基准测试 | `yum install httpd-tools` |

---

## 网络性能基准参考

### 常见网络延迟

| 场景 | 典型延迟 | 备注 |
|------|---------|------|
| 同机房内网 | 0.1 - 0.5 ms | 万兆网络 |
| 同城跨机房 | 1 - 3 ms | 光纤直连 |
| 跨地域（国内） | 10 - 50 ms | 视物理距离而定 |
| 跨洲（中美） | 150 - 250 ms | 海底光缆 |

### 带宽换算参考

```ini
1 Gbps  = 125 MB/s
10 Gbps = 1250 MB/s
千兆网卡理论线速 = 1,488,095 pps (64 字节包)
万兆网卡理论线速 = 14,880,952 pps (64 字节包)
```

---

## 参考资源

- [iptables 官方文档](https://netfilter.org/documentation/)
- [firewalld 官方文档](https://firewalld.org/documentation/)
- [ModSecurity 手册](https://github.com/SpiderLabs/ModSecurity/wiki)
- [OWASP ModSecurity 核心规则集](https://coreruleset.org/)