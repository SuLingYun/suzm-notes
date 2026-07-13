---
title: LLaMA-Factory NPU 环境部署文档
description: 记录在昇腾 NPU 环境下部署 LLaMA-Factory 的完整流程，包括 Docker Compose 配置、容器管理、模型下载与操作、Web UI 启动等步骤
date: 2026-07-13
tags:
  - LLaMA
  - NPU
  - Ascend
  - Docker
  - AI
  - DeepSeek
  - 部署
---

## LLaMA-Factory NPU 环境部署文档

### 1. 项目克隆与目录准备

```sh
git clone https://ghfast.top/https://github.com/hiyouga/LLaMA-Factory.git
cd LLaMA-Factory/docker/docker-npu
```

### 2. Docker Compose 配置 (`docker-compose.yml`)

```yaml
services:
  llamafactory:
    build:
      dockerfile: ./docker/docker-npu/Dockerfile
      context: ../..
      args:
        PIP_INDEX: https://pypi.tuna.tsinghua.edu.cn/simple
        EXTRAS: torch-npu,metrics
    container_name: llamafactory
    volumes:
      - /usr/local/dcmi:/usr/local/dcmi
      - /usr/local/bin/npu-smi:/usr/local/bin/npu-smi
      - /usr/local/Ascend/driver:/usr/local/Ascend/driver
      - /etc/ascend_install.info:/etc/ascend_install.info
      - /root/LLaMA-Factory/data:/app/data
      - /root/DeepSeek-R1-Distill-Qwen-1___5B:/root/.cache/modelscope/hub/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
    environment:
      - ASCEND_RT_VISIBLE_DEVICES=0,1,2,3,4,5,6,7
    ports:
      - "7860:7860"
      - "8000:8000"
    ipc: host
    tty: true
    # shm_size: "16gb"  # ipc: host is set
    stdin_open: true
    command: bash
    devices:
      - /dev/davinci0
      - /dev/davinci1
      - /dev/davinci2
      - /dev/davinci3
      - /dev/davinci4
      - /dev/davinci5
      - /dev/davinci6
      - /dev/davinci7
      - /dev/davinci_manager
      - /dev/devmm_svm
      - /dev/hisi_hdc
    restart: unless-stopped

```

### 3. 容器管理命令

```sh
# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 重启服务
docker-compose restart

# 停止服务
docker-compose stop

# 停止并删除服务
docker-compose down

# 进入容器
docker exec -it llamafactory bash
```

### 4. 容器内操作

```sh
# 检查环境
llamafactory-cli env

# 降级transformers
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple transformers==4.49.0

# 安装魔搭社区
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple modelscope

# 启动Web UI
USE_MODELSCOPE_HUB=1 ASCEND_RT_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 llamafactory-cli webui

# 添加本地模型路径
/root/.cache/modelscope/hub/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B/

# 添加数据路径
/app/data

# 模型下载
魔搭社区
export USE_MODELSCOPE_HUB=1 # Windows 使用 `set USE_MODELSCOPE_HUB=1`
魔乐社区
export USE_OPENMIND_HUB=1 # Windows 使用 `set USE_OPENMIND_HUB=1`
```

### 5. 模型文件操作

```sh
# 从容器复制模型文件到宿主机
docker cp llamafactory:/root/.cache/modelscope/hub/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B /root/
```

### 6. 教程链接

```sh
https://gallery.pai-ml.com/#/preview/deepLearning/nlp/llama_factory_deepseek_r1_distill_7b

https://ascend.github.io/docs/index.html

https://llamafactory.readthedocs.io/zh-cn/latest/index.html
```