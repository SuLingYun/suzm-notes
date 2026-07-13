---
title: Kubernetes 入门与实战
description: Kubernetes 从入门到实战，包括 Pod、Service、Deployment、Ingress、ConfigMap 等核心概念
date: 2026-07-09
tags:
  - Kubernetes
  - K8s
  - 云原生
---

# Kubernetes 入门与实战

## 一、核心概念

### 1.1 Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers:
    - name: myapp
      image: nginx:latest
      ports:
        - containerPort: 80
      resources:
        requests:
          memory: "128Mi"
          cpu: "250m"
        limits:
          memory: "256Mi"
          cpu: "500m"
```

### 1.2 Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30007
  type: NodePort
```

### 1.3 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: nginx:latest
          ports:
            - containerPort: 80
```

## 二、高级配置

### 2.1 ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  DEBUG: "false"
```

### 2.2 Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQ=
  API_KEY: YXBpa2V5MTIzNA==
```

### 2.3 Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /app
            pathType: Prefix
            backend:
              service:
                name: myapp-service
                port:
                  number: 80
```

## 三、运维命令

```bash
# 查看资源
kubectl get pods
kubectl get services
kubectl get deployments
kubectl get nodes

# 查看详情
kubectl describe pod myapp-pod
kubectl describe service myapp-service

# 日志
kubectl logs myapp-pod
kubectl logs -f myapp-pod

# 进入容器
kubectl exec -it myapp-pod -- bash

# 端口转发
kubectl port-forward myapp-pod 8080:80

# 扩展副本
kubectl scale deployment myapp-deployment --replicas=5

# 滚动更新
kubectl set image deployment/myapp-deployment myapp=nginx:1.24

# 回滚
kubectl rollout undo deployment/myapp-deployment
```

## 四、常用配置

### 4.1 资源限制

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: resource-limit
spec:
  limits:
    - default:
        memory: 256Mi
        cpu: 500m
      defaultRequest:
        memory: 128Mi
        cpu: 250m
      type: Container
```

### 4.2 节点选择

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  nodeSelector:
    disk: ssd
    zone: us-east-1a
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
