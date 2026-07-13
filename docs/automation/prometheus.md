---
title: Prometheus 监控体系搭建
description: Prometheus 监控系统从入门到精通，包括 Exporter 配置、Alertmanager 告警规则、Grafana 仪表盘
date: 2026-07-09
tags:
  - Prometheus
  - 监控告警
  - 自动化运维
---

# Prometheus 监控体系搭建

## 一、环境搭建

### 1.1 安装 Prometheus

```bash
# 下载安装
wget https://github.com/prometheus/prometheus/releases/download/v2.47.0/prometheus-2.47.0.linux-amd64.tar.gz
tar -xzf prometheus-2.47.0.linux-amd64.tar.gz
cd prometheus-2.47.0.linux-amd64

# 创建用户和目录
useradd --no-create-home --shell /bin/false prometheus
mkdir -p /etc/prometheus /var/lib/prometheus
chown prometheus:prometheus /etc/prometheus /var/lib/prometheus
cp prometheus promtool /usr/local/bin/
cp -r consoles/ console_libraries/ /etc/prometheus/
```

### 1.2 配置 prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - localhost:9093

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100', '192.168.1.101:9100']
  
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
  
  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']
```

### 1.3 Systemd 服务

```ini
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus/ \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```

## 二、常用 Exporter

### 2.1 Node Exporter（主机监控）

```bash
# 安装
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz
tar -xzf node_exporter-1.6.0.linux-amd64.tar.gz
cp node_exporter-1.6.0.linux-amd64/node_exporter /usr/local/bin/

# 启动
node_exporter --web.listen-address=":9100"
```

### 2.2 MySQL Exporter

```bash
# 创建监控用户
mysql -u root -p
CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'password';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';

# 安装
wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.15.0/mysqld_exporter-0.15.0.linux-amd64.tar.gz
tar -xzf mysqld_exporter-0.15.0.linux-amd64.tar.gz

# 配置
cat > /etc/default/mysqld_exporter <<EOF
DATA_SOURCE_NAME="exporter:password@(localhost:3306)/"
EOF

./mysqld_exporter --web.listen-address=":9104"
```

## 三、告警规则配置

### 3.1 alert_rules.yml

```yaml
groups:
  - name: server_rules
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100) > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "高 CPU 使用率"
          description: "实例 {{ $labels.instance }} CPU 使用率超过 80% (当前: {{ $value }}%)"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "高内存使用率"
          description: "实例 {{ $labels.instance }} 内存使用率超过 85% (当前: {{ $value }}%)"

      - alert: DiskSpaceRunningOut
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 20
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "磁盘空间不足"
          description: "实例 {{ $labels.instance }} 根分区剩余空间不足 20% (当前: {{ $value }}%)"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务宕机"
          description: "服务 {{ $labels.instance }} 已宕机"
```

## 四、Alertmanager 配置

```yaml
global:
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'prometheus@example.com'
  smtp_auth_username: 'prometheus'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'email'

receivers:
  - name: 'email'
    email_configs:
      - to: 'admin@example.com'
        send_resolved: true
    webhook_configs:
      - url: 'https://oapi.dingtalk.com/robot/send?access_token=your-token'
        send_resolved: true
```

## 五、Grafana 仪表盘

### 5.1 常用仪表盘 ID

| ID | 名称 | 适用场景 |
|----|------|----------|
| **1860** | Node Exporter Full | 主机监控 |
| **7362** | MySQL Overview | MySQL 监控 |
| **12690** | Nginx Exporter | Nginx 监控 |
| **9664** | Redis Dashboard | Redis 监控 |
| **3662** | Jenkins | Jenkins 监控 |

### 5.2 导入仪表盘

```bash
# 通过 API 导入
curl -X POST -H "Content-Type: application/json" \
  -d '{"dashboard":{"id":1860},"inputs":[],"overwrite":false}' \
  http://admin:password@localhost:3000/api/dashboards/import
```

## 六、常用 PromQL 查询

```promql
# CPU 使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)

# 内存使用率
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# 磁盘使用率
100 - (node_filesystem_avail_bytes / node_filesystem_size_bytes * 100)

# TCP 连接数
sum(rate(node_netstat_Tcp_CurrEstab[5m])) by (instance)

# 请求 QPS
sum(rate(http_requests_total[5m])) by (method, status)
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
