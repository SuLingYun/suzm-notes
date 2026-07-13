---
title: KunLun G5680 V2 单节点部署 DeepSeek-70B
description: 详细记录在华为昇腾910B NPU 环境上使用 KunLun G5680 V2 单节点部署 DeepSeek-70B 大语言模型的完整流程，涵盖 NPU 驱动安装、Docker 容器部署、MindIE 服务配置等步骤
date: 2026-07-13
tags:
  - DeepSeek
  - KunLun
  - Ascend
  - NPU
  - MindIE
  - 部署
  - LLM
---

# KunLun G5680 V2 单节点部署 DeepSeek-70B

## 文档概述

本文档详细描述了在华为昇腾910B NPU环境上部署DeepSeek-70B大语言模型的完整流程，涵盖环境准备、驱动安装、容器部署及服务配置。

## 系统要求

### 硬件环境

- **NPU设备**: 华为昇腾910B处理器（至少8个NPU设备）
- **内存**: 推荐500GB+共享内存
- **存储**: 充足的空间存放模型文件

### 软件环境

- **操作系统**: openEuler 24.03 LTS (aarch64)
- **容器平台**: Docker + Docker Compose

## 部署步骤

### 1. 基础环境准备

```sh
# 更新系统包
dnf update -y

# 安装基础依赖
dnf install -y wget curl git python3 python3-pip
```

### 2. NPU驱动安装

#### 2.1 安装NPU驱动

```sh
chmod +x Ascend-hdk-910b-npu-driver_25.2.0_linux-aarch64.run
./Ascend-hdk-910b-npu-driver_25.2.0_linux-aarch64.run --full
```

#### 2.2 安装NPU固件

```sh
chmod +x Ascend-hdk-910b-npu-firmware_7.7.0.6.236.run
./Ascend-hdk-910b-npu-firmware_7.7.0.6.236.run
```

#### 2.3 安装Docker运行时

```sh
chmod +x Ascend-docker-runtime_6.0.0_linux-aarch64.run
./Ascend-docker-runtime_6.0.0_linux-aarch64.run
```

### 3. Docker环境部署

#### 3.1 安装Docker & Docker Compose

```sh
# 安装Docker
dnf install -y docker docker-compose

# 启动Docker服务
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

#### 3.2 拉取MindIE镜像

```sh
docker pull --platform=arm64 swr.cn-south-1.myhuaweicloud.com/ascendhub/mindie:2.1.RC2-800I-A2-py311-openeuler24.03-lts
```

### 4. 模型准备

#### 4.1 创建模型目录

```sh
mkdir -p /model/DeepSeek
```

#### 4.2 上传模型文件

将下载的DeepSeek-70B模型文件上传至 `/model/DeepSeek` 目录

### 5. 容器部署

#### 5.1 启动MindIE容器

```sh
docker run -it -d --privileged \
  --name=deepseek70B \
  --net=host \
  --shm-size 500g \
  --restart=always \
  --device=/dev/davinci0 \
  --device=/dev/davinci1 \
  --device=/dev/davinci2 \
  --device=/dev/davinci3 \
  --device=/dev/davinci4 \
  --device=/dev/davinci5 \
  --device=/dev/davinci6 \
  --device=/dev/davinci7 \
  --device=/dev/davinci_manager \
  --device=/dev/hisi_hdc \
  --device=/dev/devmm_svm \
  -v /usr/local/Ascend/driver:/usr/local/Ascend/driver \
  -v /usr/local/Ascend/firmware:/usr/local/Ascend/firmware \
  -v /usr/local/sbin/npu-smi:/usr/local/sbin/npu-smi \
  -v /usr/local/sbin:/usr/local/sbin \
  -v /etc/hccn.conf:/etc/hccn.conf \
  -v /model/DeepSeek:/model \
  swr.cn-south-1.myhuaweicloud.com/ascendhub/mindie:2.1.RC2-800I-A2-py311-openeuler24.03-lts bash
```

### 6. 容器内配置

#### 6.1 进入容器

```sh
docker exec -it deepseek70B bash
```

#### 6.2 配置MindIE服务

编辑配置文件 `/usr/local/Ascend/mindie/latest/mindie-service/conf/config.json`：

```json
{
    "Version": "1.0.0",
    "ServerConfig": {
        "ipAddress": "1.10.255.10",
        "managementIpAddress": "1.10.255.10",
        "port": 1025,
        "managementPort": 1026,
        "metricsPort": 1027,
        "allowAllZeroIpListening": false,
        "maxLinkNum": 1000,
        "httpsEnabled": false,
        "fullTextEnabled": false,
        "inferMode": "standard",
        "interCommTLSEnabled": true,
        "interCommPort": 1121,
        "openAiSupport": "vllm",
        "tokenTimeout": 600,
        "e2eTimeout": 600,
        "distDPServerEnabled": false
    },
    "BackendConfig": {
        "backendName": "mindieservice_llm_engine",
        "modelInstanceNumber": 1,
        "npuDeviceIds": [[0,1,2,3,4,5,6,7]],
        "tokenizerProcessNumber": 8,
        "multiNodesInferEnabled": false,
        "ModelDeployConfig": {
            "maxSeqLen": 32768,
            "maxInputTokenLen": 32768,
            "truncation": false,
            "ModelConfig": [
                {
                    "modelInstanceType": "Standard",
                    "modelName": "deepseek70B",
                    "modelWeightPath": "/model",
                    "worldSize": 8,
                    "cpuMemSize": 5,
                    "npuMemSize": -1,
                    "backendType": "atb",
                    "trustRemoteCode": false,
                    "async_scheduler_wait_time": 120,
                    "kv_trans_timeout": 10,
                    "kv_link_timeout": 1080
                }
            ]
        },
        "ScheduleConfig": {
            "templateType": "Standard",
            "templateName": "Standard_LLM",
            "cacheBlockSize": 128,
            "maxPrefillBatchSize": 50,
            "maxPrefillTokens": 32768,
            "prefillTimeMsPerReq": 150,
            "prefillPolicyType": 0,
            "decodeTimeMsPerReq": 50,
            "decodePolicyType": 0,
            "maxBatchSize": 200,
            "maxIterTimes": 32768,
            "maxPreemptCount": 0,
            "supportSelectBatch": false,
            "maxQueueDelayMicroseconds": 5000
        }
    }
}
```

#### 6.3 配置环境变量

在容器内创建环境变量配置脚本 `/root/setenv.sh`：

```sh
#!/bin/bash

# MindIE 服务环境变量配置

# 日志配置：将MindIE日志输出到标准输出，方便在Docker中查看
export MINDIE_LOG_TO_STDOUT=1

# 内存管理优化：启用PyTorch NPU内存的可扩展段分配，避免内存碎片
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True

# ATB工作空间内存分配优化：使用高效分配策略和全局内存分配
export ATB_WORKSPACE_MEM_ALLOC_ALG_TYPE=3
export ATB_WORKSPACE_MEM_ALLOC_GLOBAL=1

# 并行计算优化：限制OpenMP线程数为1，避免CPU核间竞争
export OMP_NUM_THREADS=1

# NPU内存配置：设置NPU内存使用上限为96%，预留4%给系统
export NPU_MEMORY_FRACTION=0.96

# 数值计算优化：禁用INF/NaN检查模式，提升计算性能
export INF_NAN_MODE_ENABLE=0

# 分布式通信优化：允许HCCL非确定性执行，提升通信性能
export HCCL_DETERMINISTIC=false

# 启用ATB与HCCL协同工作，优化多NPU间模型并行通信
export ATB_LLM_HCCL_ENABLE=1

echo "环境变量配置完成"
```

使环境变量生效：

```sh
chmod +x /root/setenv.sh
source /root/setenv.sh
```

### 7. 启动服务

#### 7.1 启动MindIE服务

```sh
cd /usr/local/Ascend/mindie/latest/mindie-service/bin
./mindieservice_daemon
```

#### 7.2 验证服务状态

```sh
# 检查服务进程
ps aux | grep mindieservice

# 检查NPU状态
npu-smi info
```

## 性能优化建议

### 内存优化

- 根据实际NPU内存大小调整 `NPU_MEMORY_FRACTION` 参数
- 监控内存使用情况，避免OOM错误

### 计算优化

- 根据模型大小和批次大小调整 `maxBatchSize` 和 `maxPrefillBatchSize`
- 适当调整 `cacheBlockSize` 以优化KV缓存

### 网络优化

- 确保容器网络配置正确，避免网络瓶颈
- 在多节点部署时优化HCCL通信

## 故障排查

### 常见问题

1. **NPU设备无法识别**
   ```sh
   # 检查NPU设备
   ls /dev/davinci*
   # 检查驱动状态
   npu-smi info
   ```
2. **内存不足**
   - 调整 `--shm-size` 参数
   - 优化 `NPU_MEMORY_FRACTION` 设置
3. **服务启动失败**
   - 检查配置文件语法
   - 查看日志文件 `/usr/local/Ascend/mindie/latest/mindie-service/logs`

### 日志查看

```sh
# 查看MindIE服务日志
tail -f /usr/local/Ascend/mindie/latest/mindie-service/logs/mindieservice.log
```

## 监控与维护

### 系统监控

```sh
# 监控NPU使用情况
npu-smi

# 监控容器资源使用
docker stats deepseek70B
```

### 服务维护

- 定期检查服务状态
- 监控系统日志和性能指标
- 根据负载情况调整资源配置

---

**注意**: 本配置针对8个NPU设备的场景，实际部署时请根据硬件配置调整相关参数。