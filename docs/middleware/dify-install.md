---
title: Dify 1.9.2 安装指南
date: 2026-07-20
description: 使用 Docker Compose 快速部署 Dify 1.9.2 版本的完整步骤，包含代码克隆、环境配置、服务启动
tags: [dify, docker, 部署, AI]
---

# Dify 1.9.2 安装指南

## 部署步骤

### 1. 克隆代码

```bash
git clone https://gitee.com/dify_ai/dify.git --branch 1.9.2
```

### 2. 进入 docker 目录

```bash
cd dify/docker
```

### 3. 复制环境配置文件

```bash
cp .env.example .env
```

### 4. 检查 Docker Compose 版本

```bash
docker compose version
```

### 5. 启动服务

```bash
# 后台运行
docker compose up -d
# 或
docker-compose up -d
```

### 6. 检查服务状态

```bash
docker compose ps
```

### 7. 访问地址

在浏览器中打开：`http://localhost/install`