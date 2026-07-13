---
title: elssh 构建指南 - 基于 Docker 的 RPM 打包
description: 详细介绍如何使用 Docker 为各种 Enterprise Linux 版本构建 elssh RPM 包，涵盖多平台编译、版本更新策略、常见问题排查等
date: 2026-07-13
tags:
  - elssh
  - Docker
  - RPM
  - CentOS
  - RHEL
  - 打包
  - Enterprise Linux
---

# elssh 构建指南 – 基于 Docker 的 RPM 打包

本文档介绍如何使用 Docker 为各种 Enterprise Linux 版本构建 **elssh** RPM 包。

您只需构建实际需要的版本，无需运行所有命令。

所有构建的 RPM 包将自动放置在宿主机的 `./output/` 目录中。

## 前提条件

- Docker（建议版本 20+）
- Git
- 足够的磁盘空间（建议约 10 GB+）
- 互联网连接

## 快速开始

### 1. 克隆项目

```sh
git clone https://git.221022.xyz/https://github.com/boypt/openssh-rpms.git
cd openssh-rpms/
```

### 2. 修改配置（根据需要）

```sh
vim version.env
```

可以修改以下配置项：

- 版本号
- 代理地址等

```sh
GH_PROXY="https://git.221022.xyz/"
```

### 3. 下载源码（只需执行一次）

```sh
env ALL=1 ./pullsrc.sh
```

### 4. 本机执行（只能构建本机架构镜像）

```sh
./compile.sh
```

## 步骤 1：下载源码（详细说明）

构建前必须先下载源代码和 tarball：

```sh
# 下载所有必需的源码
env ALL=1 ./pullsrc.sh
```

> **注意**：只需在开始任何构建前运行一次此命令。它会为每个支持的平台准备所有必要的文件。

### `ALL=1` 参数说明

`ALL=1` 是一个环境变量参数，用于告诉 `pullsrc.sh` 脚本下载**所有**支持平台的源码和依赖文件，包括：

- EL5、EL6、EL7、EL8、EL9 的 x86_64 架构
- EL8、EL9 的 aarch64（ARM64）架构

如果不设置 `ALL=1`，脚本可能只会下载默认平台或指定平台的源码。使用 `ALL=1` 可以一次性准备好所有平台的构建环境，避免后续构建时再次下载。

## 步骤 2：为特定平台构建 RPM

选择您需要的平台并运行相应的命令。

### x86_64 构建

#### 适用于 EL5（CentOS 5）

```sh
# 构建 Docker 镜像
docker build -t elssh_el5 -f ./docker/Dockerfile.centos5 --build-arg CHINA_MIRROR=1 .

# 构建 64 位包（推荐）
docker run --rm -v .:/data -e "M32=0" elssh_el5

# 构建 32 位包（可选）
docker run --rm -v .:/data -e "M32=1" elssh_el5
```

##### EL5 构建命令说明

`docker run --rm -v .:/data -e "M32=0" elssh_el5` 命令各参数含义：

|参数|说明|
|--|--|
|`docker run`|运行一个 Docker 容器|
|`--rm`|容器退出后自动删除，避免残留无用容器|
|`-v .:/data`|将当前目录（`./`）挂载到容器内的 `/data` 目录，实现宿主机与容器的文件共享|
|`-e "M32=0"`|设置环境变量 `M32=0`，表示构建 64 位（x86_64）包；`M32=1` 表示构建 32 位（i686）包|
|`elssh_el5`|使用的 Docker 镜像名称|

> **注意**：`M32` 参数仅适用于 EL5（CentOS 5）平台，用于区分构建 32 位还是 64 位 RPM 包。其他平台（EL6+）默认只支持 64 位。

#### 适用于 EL6（CentOS 6）

```sh
docker build -t elssh_el6 -f ./docker/Dockerfile.centos --build-arg VERSION_NUM=6 --build-arg CHINA_MIRROR=1 .
docker run --rm -v .:/data elssh_el6
```

#### 适用于 EL7（CentOS 7）

```sh
docker build -t elssh_el7 -f ./docker/Dockerfile.centos --build-arg VERSION_NUM=7 --build-arg CHINA_MIRROR=1 .
docker run --rm -v .:/data elssh_el7
```

#### 适用于 EL8（CentOS 8 / RHEL 8 / Rocky 8 / AlmaLinux 8）

```sh
docker build -t elssh_el8 -f ./docker/Dockerfile.centos --build-arg VERSION_NUM=8 --build-arg CHINA_MIRROR=1 .
docker run --rm -v .:/data elssh_el8
```

#### 适用于 EL9（CentOS Stream 9 / RHEL 9 / Rocky 9 / AlmaLinux 9）

```sh
docker build -t elssh_el9 -f ./docker/Dockerfile.centos-stream --build-arg VERSION_NUM=9 --build-arg CHINA_MIRROR=1 .
docker run --rm -v .:/data elssh_el9
```

### aarch64（ARM64）构建

#### 适用于 EL8 aarch64

```sh
docker build -t elssh_aarch64_el8 \
  --platform linux/arm64 \
  -f ./docker/Dockerfile.centos-stream \
  --build-arg VERSION_NUM=8 \
  --build-arg CHINA_MIRROR=1 .

docker run --rm -v .:/data --platform linux/arm64 elssh_aarch64_el8
```

#### 适用于 EL9 aarch64

```sh
docker build -t elssh_aarch64_el9 \
  --platform linux/arm64 \
  -f ./docker/Dockerfile.centos-stream \
  --build-arg VERSION_NUM=9 \
  --build-arg CHINA_MIRROR=1 .

docker run --rm -v .:/data --platform linux/arm64 elssh_aarch64_el9
```

## 构建参数

|参数|值|描述|
|--|--|--|
|`CHINA_MIRROR`|0 或 1|如果您在中国并希望使用更快的国内镜像，请设置为 `1`|
|`VERSION_NUM`|6,7,8,9|指定目标 EL 版本（在大多数 Dockerfile 中使用）|
|`M32`（仅 EL5）|0 或 1|`0` = 64 位，`1` = 32 位|

**中国用户示例：**

在 `docker build` 命令中添加 `--build-arg CHINA_MIRROR=1`。

## 输出位置

每次成功构建后，RPM 包将被复制到：

```
./output/
```

典型的输出结构：

```
output/
├── el5/
│   ├── x86_64/
│   └── i686/          # 仅当 M32=1 时存在
├── el6/
├── el7/
├── el8/
├── el9/
├── el8-aarch64/
└── el9-aarch64/
```

每个子目录包含生成的 `.rpm` 文件（如果可用，包括 debuginfo）。

## 快速入门示例

### 仅为现代系统构建（EL8 + EL9）

```sh
env ALL=1 ./pullsrc.sh

docker build -t elssh_el8 -f ./docker/Dockerfile.centos --build-arg VERSION_NUM=8 --build-arg CHINA_MIRROR=1 .
docker run --rm -v .:/data elssh_el8

docker build -t elssh_el9 -f ./docker/Dockerfile.centos-stream --build-arg VERSION_NUM=9 --build-arg CHINA_MIRROR=1 .
docker run --rm -v .:/data elssh_el9
```

### 仅为 ARM64 构建

```sh
env ALL=1 ./pullsrc.sh

docker build -t elssh_aarch64_el9 --platform linux/arm64 -f ./docker/Dockerfile.centos-stream --build-arg VERSION_NUM=9 --build-arg CHINA_MIRROR=1 .
docker run --rm -v .:/data --platform linux/arm64 elssh_aarch64_el9
```

## 版本更新与镜像重建

### 如果更换了 OpenSSH 版本，是否需要重新构建镜像？

**不一定需要重新构建镜像**！具体取决于您的更新内容：

#### 情况一：仅更新源码（不需要重建镜像）

如果只是更换 OpenSSH 版本、重新下载源码，**不需要重新构建镜像**。因为：

- `-v .:/data` 参数已经将宿主机当前目录挂载到容器内的 `/data` 目录
- 源码文件存储在宿主机上，容器运行时会自动读取最新的源码
- 只需重新下载源码并运行容器即可：

```sh
# 修改版本配置
vim version.env

# 重新下载新版本源码
env ALL=1 ./pullsrc.sh

# 直接运行容器，无需重新构建镜像
docker run --rm -v .:/data elssh_el7
```

#### 情况二：需要更新构建环境（必须重建镜像）

以下情况需要重新构建镜像：

1. **修改了 Dockerfile**：如添加新的依赖包、修改编译参数
2. **更新了基础镜像**：如 CentOS 基础镜像有安全更新
3. **修改了构建脚本**：如 `compile.sh`、`pullsrc.sh` 等脚本发生变化
4. **需要更新 `CHINA_MIRROR` 设置**：切换国内/国际镜像源

### 为什么有时需要重新构建？

- Docker 镜像包含**构建环境**（编译器、依赖库、系统工具等），这些在 `docker build` 时被固化到镜像中
- 如果只更新宿主机上的源码文件，通过挂载共享机制，容器会自动使用最新源码
- 但如果需要更新构建环境本身，就必须重新构建镜像

### 总结

|更新内容|是否需要重建镜像？|
|--|--|
|更换 OpenSSH 版本|❌ 不需要|
|重新下载源码|❌ 不需要|
|修改 `version.env`|❌ 不需要|
|修改 Dockerfile|✅ 需要|
|修改构建脚本|✅ 需要|
|切换镜像源（`CHINA_MIRROR`）|✅ 需要|
|更新基础系统包|✅ 需要|

### 推荐的版本更新流程

```sh
# 1. 修改版本配置
vim version.env

# 2. 重新下载新版本源码
env ALL=1 ./pullsrc.sh

# 3. 使用 compile.sh 脚本自动重建（推荐）
./compile.sh
```

> **提示**：使用 `./compile.sh` 脚本可以自动处理镜像重建和打包过程，无需手动执行 `docker build` 和 `docker run` 命令。

## 故障排除

- **下载缓慢**：使用 `CHINA_MIRROR=1`
- **权限问题**：构建后运行 `chown -R $USER output/`
- **首次运行时 Docker 构建失败**：这是正常现象 — 需要下载基础镜像和依赖项
- **ARM64 构建**：需要支持 ARM64 的机器或启用 Docker Buildx 多平台功能