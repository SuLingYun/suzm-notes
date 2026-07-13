---
title: Kubernetes 容器编排实战
description: 涵盖集群部署（kubeadm）、Pod/Deployment/Service/Ingress 核心概念、常用 kubectl 命令、排障技巧、资源监控（Metrics Server、Prometheus）
date: 2026-07-08
tags:
  - Kubernetes
  - kubeadm
  - 容器
  - 编排
  - 监控
  - Prometheus
---

# Kubernetes 容器编排实战

## 一、集群部署（kubeadm）

### 1.1 环境准备

| 角色 | 配置要求 | 数量 |
|------|---------|------|
| Control Plane | 4C/8G, 50GB 磁盘 | 1 (测试) / 3 (生产) |
| Worker Node | 4C/8G, 100GB 磁盘 | 2+ |
| 操作系统 | Ubuntu 22.04 / CentOS 7.9+ | - |

### 1.2 基础环境初始化

在所有节点上执行：

```bash
# 关闭 swap（必须）
swapoff -a
sed -i '/ swap / s/^/#/' /etc/fstab

# 加载内核模块
cat <<EOF | tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

# 配置内核参数
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system
```

### 1.3 安装 Container Runtime（containerd）

```bash
# 安装 containerd
apt-get update && apt-get install -y containerd
# 或 yum install -y containerd

# 生成默认配置
mkdir -p /etc/containerd
containerd config default | tee /etc/containerd/config.toml

# 启用 SystemdCgroup（关键配置）
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# 重启 containerd
systemctl restart containerd
systemctl enable containerd
```

### 1.4 安装 kubeadm / kubelet / kubectl

```bash
# 添加 Kubernetes 仓库
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list

# 安装组件
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
```

### 1.5 初始化 Control Plane

```bash
# 在控制平面节点执行
kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --apiserver-advertise-address=192.168.1.10 \
  --kubernetes-version=v1.28.0

# 配置 kubectl 访问
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# 记录加入集群的命令（Worker 节点使用）
kubeadm token create --print-join-command
```

### 1.6 安装 CNI 网络插件（Flannel）

```bash
# 安装 Flannel
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# 验证所有 Pod 状态
kubectl get pods -n kube-flannel
kubectl get nodes
```

### 1.7 加入 Worker 节点

```bash
# 在 Worker 节点执行刚才生成的 join 命令
kubeadm join 192.168.1.10:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

---

## 二、核心概念

### 2.1 Pod

Pod 是 Kubernetes 中最小的调度单元，包含一个或多个容器。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "500m"
        memory: "256Mi"
```

### 2.2 Deployment

Deployment 管理 Pod 的声明式更新和扩缩容。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
```

### 2.3 Service

Service 提供稳定的网络访问入口，屏蔽后端 Pod 的 IP 变化。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

| Service 类型 | 访问范围 | 适用场景 |
|-------------|---------|---------|
| ClusterIP | 集群内部 | 内部服务通信 |
| NodePort | 节点 IP + 端口 | 外部调试访问 |
| LoadBalancer | 外部负载均衡器 | 云环境外部访问 |
| ExternalName | DNS CNAME | 外部服务映射 |

### 2.4 Ingress

Ingress 提供 HTTP/HTTPS 路由和负载均衡。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls-secret
```

---

## 三、常用 kubectl 命令

### 3.1 资源管理

```bash
# 创建资源
kubectl apply -f deployment.yaml

# 删除资源
kubectl delete -f deployment.yaml

# 查看资源列表
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get nodes
kubectl get ingress

# 查看资源详细信息
kubectl describe pod <pod-name>
kubectl describe deployment <deployment-name>

# 查看资源 YAML 输出
kubectl get pod <pod-name> -o yaml
```

### 3.2 日志与调试

```bash
# 查看 Pod 日志
kubectl logs <pod-name>

# 实时跟踪日志
kubectl logs -f <pod-name>

# 查看多容器 Pod 中指定容器的日志
kubectl logs <pod-name> -c <container-name>

# 进入 Pod 容器
kubectl exec -it <pod-name> -- /bin/bash

# 端口转发（本地调试）
kubectl port-forward pod/<pod-name> 8080:80
```

### 3.3 扩缩容与更新

```bash
# 手动扩缩容
kubectl scale deployment <deployment-name> --replicas=5

# 滚动更新镜像
kubectl set image deployment/<deployment-name> <container-name>=nginx:1.26

# 查看更新状态
kubectl rollout status deployment/<deployment-name>

# 回滚到上一个版本
kubectl rollout undo deployment/<deployment-name>

# 查看历史版本
kubectl rollout history deployment/<deployment-name>
```

### 3.4 命名空间管理

```bash
# 创建命名空间
kubectl create namespace production

# 切换命名空间
kubectl config set-context --current --namespace=production

# 查看所有命名空间的资源
kubectl get pods --all-namespaces
```

---

## 四、排障技巧

### 4.1 Pod 状态排查

| 状态 | 含义 | 排查步骤 |
|------|------|---------|
| `Pending` | 等待调度 | `kubectl describe pod` 查看 Events，检查资源是否充足 |
| `CrashLoopBackOff` | 容器反复崩溃 | `kubectl logs <pod>` 查看错误日志 |
| `ImagePullBackOff` | 镜像拉取失败 | 检查镜像名称、仓库认证、网络连接 |
| `Running` 但未 Ready | 就绪检查失败 | 检查 ReadinessProbe 配置 |
| `Evicted` | 被驱逐 | 检查节点资源压力（磁盘/内存） |

### 4.2 节点故障排查

```bash
# 查看节点状态
kubectl get nodes -o wide

# 查看节点详细信息（含资源使用）
kubectl describe node <node-name>

# 检查节点条件
kubectl get node <node-name> -o json | jq '.status.conditions'

# 节点 cordon（标记为不可调度）
kubectl cordon <node-name>

# 驱逐节点上的 Pod
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# 恢复节点
kubectl uncordon <node-name>
```

### 4.3 网络故障排查

```bash
# 检查 CoreDNS 是否正常运行
kubectl get pods -n kube-system -l k8s-app=kube-dns

# 测试 DNS 解析
kubectl run test-dns --image=busybox:1.28 --rm -it -- nslookup kubernetes.default.svc.cluster.local

# 检查 Service 端点
kubectl get endpoints <service-name>

# 检查网络策略
kubectl get networkpolicies
```

### 4.4 存储故障排查

```bash
# 查看 PVC 状态
kubectl get pvc
kubectl describe pvc <pvc-name>

# 查看 PV 状态
kubectl get pv
kubectl describe pv <pv-name>

# 检查存储类
kubectl get storageclass
```

---

## 五、资源监控

### 5.1 Metrics Server（基础指标）

Metrics Server 提供集群资源的实时指标，支持 `kubectl top` 命令。

```bash
# 安装 Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 验证安装
kubectl get deployment metrics-server -n kube-system

# 查看节点资源使用
kubectl top nodes

# 查看 Pod 资源使用
kubectl top pods --all-namespaces
```

### 5.2 Prometheus + Grafana（全面监控）

#### Prometheus Stack 部署（kube-prometheus-stack）

```bash
# 添加 Helm 仓库
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 创建监控命名空间
kubectl create namespace monitoring

# 安装 kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.enabled=true \
  --set grafana.service.type=NodePort
```

#### 访问 Grafana

```bash
# 获取 Grafana 端口
kubectl get svc -n monitoring prometheus-grafana -o jsonpath='{.spec.ports[0].nodePort}'

# 获取默认管理员密码
kubectl get secret -n monitoring prometheus-grafana -o jsonpath='{.data.admin-password}' | base64 -d
```

#### 核心监控指标

| 指标类别 | 关键指标 | PromQL 示例 |
|---------|---------|-------------|
| CPU | `node_cpu_seconds_total` | `100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)` |
| 内存 | `node_memory_MemTotal_bytes` | `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100` |
| 磁盘 | `node_filesystem_avail_bytes` | `node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100` |
| 网络 | `node_network_receive_bytes_total` | `rate(node_network_receive_bytes_total[5m])` |
| Pod | `kube_pod_container_resource_requests` | `sum by(namespace, pod) (kube_pod_container_resource_requests{resource="cpu"})` |

### 5.3 自定义监控告警规则

```yaml
# PrometheusRule 示例
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: k8s-alert-rules
  namespace: monitoring
spec:
  groups:
  - name: node
    rules:
    - alert: NodeCPUUsageHigh
      expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Node {{ $labels.instance }} CPU usage > 80%"
        description: "CPU usage has been above 80% for more than 5 minutes."
    - alert: NodeMemoryUsageHigh
      expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Node {{ $labels.instance }} memory usage > 85%"
```

---

## 六、最佳实践

### 6.1 资源限制与请求

- 始终为容器设置 `requests` 和 `limits`，避免资源争抢。
- 建议 `limits` 不超过 `requests` 的 2 倍。
- 使用 `LimitRange` 设置命名空间级别的默认资源限制。

### 6.2 健康检查

```yaml
# 存活探针 + 就绪探针配置示例
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 6.3 配置管理

- 使用 ConfigMap 管理非敏感配置。
- 使用 Secret 管理敏感信息（密码、证书）。
- 避免将配置硬编码在镜像中。

### 6.4 集群安全

- 启用 RBAC，遵循最小权限原则。
- 使用 NetworkPolicy 限制 Pod 间网络访问。
- 定期更新 Kubernetes 版本，修复安全漏洞。
- 启用 PodSecurityPolicy（或 Pod Security Admission）控制 Pod 安全上下文。

---

> **参考文档**：Kubernetes 官方文档 | kubeadm 文档 | Prometheus 官方文档

---


---


---


---
