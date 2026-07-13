---
title: Docker & Docker Compose 全场景命令手册
date: 2026-07-13
description: 涵盖 Docker 基础命令（镜像管理、容器管理、网络、数据卷、系统维护）和 Docker Compose 命令（服务生命周期、多环境配置、伸缩更新等）的完整命令手册
tags:
  - docker
  - docker-compose
  - container
  - middleware
  - 运维笔记
---

# Docker & Docker Compose 全场景命令手册

## 一、Docker 基础命令

### 1. 容器仓库交互

#### 登录仓库

**命令**: `docker login [仓库地址]`

**核心参数**:

- `--username <用户名>` / `-u`: 指定登录用户名
- `--password <密码>`: 指定登录密码（不推荐）
- `--password-stdin`: 从标准输入读取密码（推荐）

**场景示例**:

```sh
# 登录Docker Hub
docker login

# 登录私有仓库
cat ~/.docker/private-registry-pass | docker login -u admin --password-stdin registry.example.com

# 交互式登录
docker login registry.example.com
```

**注意事项**:

- 默认登录Docker Hub，私有仓库需指定地址
- 避免在命令行直接使用`--password`，防止密码泄露
- 生产环境建议使用凭证管理工具

#### 退出仓库

**命令**: `docker logout [仓库地址]`

**核心参数**:

- 仓库地址：默认退出Docker Hub，私有仓库需指定

**场景示例**:

```sh
# 退出Docker Hub
docker logout

# 退出私有仓库
docker logout registry.example.com
```

**注意事项**:

- 退出后删除本地保存的该仓库凭据
- 切换用户或环境时建议先退出再登录
- 凭据通常存储在`~/.docker/config.json`

### 2. 镜像管理

#### 搜索镜像

**命令**: `docker search <镜像关键词>`

**核心参数**:

- `--filter <条件>`: 筛选结果
  - `is-official=true`: 只显示官方镜像
  - `stars=100`: 只显示星数>=100的镜像
  - `is-automated=true`: 只显示自动构建镜像
- `--limit <数量>`: 限制返回结果数量

**场景示例**:

```sh
# 搜索官方Nginx镜像
docker search nginx --filter is-official=true --limit 5

# 搜索高星MySQL镜像
docker search mysql --filter stars=500
```

**注意事项**:

- 官方镜像标识为`[OK]`，安全性更高
- 非官方镜像需确认来源，避免恶意镜像
- 生产环境建议使用官方或可信来源镜像

#### 查看镜像详情

**命令**: `docker inspect <镜像名:标签/镜像ID>`

**核心参数**:

- 输出JSON格式完整信息

**场景示例**:

```sh
# 查看Nginx镜像环境变量
docker inspect nginx:1.25.3 | grep -A 10 "Config.Env"

# 查看MySQL镜像暴露端口
docker inspect mysql:8.0 | grep -A 5 "ExposedPorts"
```

**注意事项**:

- 关键字段：`Config.Env`、`Config.ExposedPorts`、`RootFS.Layers`
- 可结合`jq`工具解析JSON输出
- 用于验证镜像配置和依赖关系

#### 拉取镜像

**命令**: `docker pull <镜像名:标签>`

**核心参数**:

- `--platform <架构>`: 跨平台拉取
- 标签：生产环境务必指定固定版本

**场景示例**:

```sh
# 为ARM架构服务器拉取MySQL
docker pull --platform linux/arm64 mysql:8.0

# 拉取指定版本Nginx
docker pull nginx:1.25.3
```

**注意事项**:

- 私有仓库镜像需带仓库前缀
- 拉取慢可配置加速器
- 避免使用`latest`标签，防止兼容性问题

#### 构建镜像

**命令**: `docker build -t <镜像名:标签> <上下文路径>`

**核心参数**:

- `-f <Dockerfile路径>`: 指定自定义Dockerfile
- `--no-cache`: 不使用构建缓存
- `--build-arg <KEY=VALUE>`: 传递构建参数
- `--target <阶段名>`: 构建多阶段Dockerfile的指定阶段

**场景示例**:

```sh
# 无缓存构建生产环境镜像
docker build -t my-app:v2.1 -f ./docker/Dockerfile --no-cache --build-arg ENV=prod --target prod .
```

**注意事项**:

- 上下文路径需包含Dockerfile依赖的所有文件
- 使用`.dockerignore`排除无关文件
- 多阶段构建可减小最终镜像体积

#### 列出镜像

**命令**: `docker images` / `docker image ls`

**核心参数**:

- `-a`: 显示所有镜像（含中间层镜像）
- `-q`: 仅输出镜像ID
- `-f <条件>`: 筛选镜像
- `--format <格式>`: 自定义输出格式

**场景示例**:

```sh
# 显示my-app所有版本的标签和大小
docker images -f reference=my-app:* --format "table {{.Tag}}\t{{.Size}}"

# 仅显示镜像ID用于批量操作
docker images -q -f dangling=true
```

**注意事项**:

- 中间层镜像不建议手动删除
- 虚悬镜像（`<none>:<none>`）可安全删除
- 定期清理无用镜像释放磁盘空间

#### 删除镜像

**命令**: `docker rmi <镜像ID/镜像名:标签>`

**核心参数**:

- `-f`: 强制删除

**场景示例**:

```sh
# 删除虚悬镜像
docker rmi -f $(docker images -q -f dangling=true)

# 删除指定标签镜像
docker rmi my-app:old-version
```

**注意事项**:

- 删除前需确认无容器使用该镜像
- 生产环境删除后无法恢复，需确保有备份
- 使用`docker ps -a --filter ancestor=<镜像名>`检查关联容器

#### 镜像打标签

**命令**: `docker tag <原镜像名:标签> <新镜像名:标签>`

**核心参数**: 无

**场景示例**:

```sh
# 版本管理
docker tag my-app:v2.1 my-app:latest

# 适配私有仓库地址
docker tag my-app:v2.1 registry.example.com/my-app:v2.1
```

**注意事项**:

- 标签是镜像的"别名"，不复制文件
- 同一镜像可多个标签
- 推送私有仓库前必须打对应标签

#### 推送镜像

**命令**: `docker push <镜像名:标签>`

**核心参数**: 无

**场景示例**:

```sh
# 推送到私有仓库
docker push registry.example.com/my-app:v2.1

# 推送多个标签
docker push registry.example.com/my-app:v2.1
docker push registry.example.com/my-app:latest
```

**注意事项**:

- 前提：已登录目标仓库，且镜像名带仓库前缀
- 多标签镜像需分别推送
- 推送后建议在仓库后台验证

#### 导出镜像

**命令**: `docker save -o <输出文件.tar> <镜像名:标签>`

**核心参数**:

- `-o`: 指定输出文件

**场景示例**:

```sh
# 批量导出镜像
docker save -o nginx-mysql.tar nginx:1.25.3 mysql:8.0

# 导出单个镜像
docker save -o my-app.tar my-app:v2.1
```

**注意事项**:

- 导出文件体积大，适合离线环境迁移
- 对应导入命令`docker load -i <文件.tar>`
- 确保磁盘空间充足

#### 导入镜像

**命令**: `docker load -i <镜像文件.tar>`

**核心参数**:

- `-i`: 指定导入文件

**场景示例**:

```sh
# 导入镜像
docker load -i nginx-mysql.tar

# 从压缩文件导入
docker load -i my-app.tar.gz
```

**注意事项**:

- 导入前确保文件未损坏
- 导入后保留原镜像的所有标签和元数据
- 避免导入未知来源镜像

### 3. 容器管理

#### 创建并启动容器

**命令**: `docker run [参数] <镜像名:标签>`

**核心参数**:
**基础参数**:

- `-d`: 后台运行
- `-p <宿主机IP:宿主机端口:容器端口/协议>`: 端口映射
- `-v <宿主机路径/数据卷:容器路径:权限>`: 挂载
- `-e <KEY=VALUE>`: 环境变量
- `--name <容器名>`: 指定名称
- `--network <网络名>`: 加入自定义网络
- `--restart <策略>`: 重启策略

**资源限制参数**:

- `--memory <大小>`: 限制内存
- `--cpus <数量>`: 限制CPU核心
- `--user <UID:GID>`: 指定运行用户

**场景示例**:

```sh
# 后台启动Nginx容器
docker run -d -p 8080:80 --name nginx-web \
  -v nginx-data:/usr/share/nginx/html:rw \
  -e TZ=Asia/Shanghai \
  --restart unless-stopped \
  --memory 1g --cpus 1 \
  --user 1000:1000 \
  nginx:1.25.3
```

**注意事项**:

- 端口映射需确保宿主机端口未被占用
- 生产环境务必设置资源限制
- 使用非root用户运行提高安全性

#### 列出容器

**命令**: `docker ps` / `docker container ls`

**核心参数**:

- `-a`: 显示所有容器（含已停止）
- `-q`: 仅输出容器ID
- `-f <条件>`: 筛选容器
- `--format <格式>`: 自定义输出格式

**场景示例**:

```sh
# 查看所有已停止容器
docker ps -a -f status=exited

# 自定义格式显示
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}"

# 查看基于指定镜像的容器
docker ps -a -f ancestor=nginx:1.25.3
```

**注意事项**:

- 定期清理已停止容器，避免占用磁盘
- 使用筛选条件快速定位问题容器
- `--format`可定制化输出信息

#### 启动/停止/重启容器

**命令**: 

- `docker start <容器名/ID>`
- `docker stop <容器名/ID>`
- `docker restart <容器名/ID>`

**核心参数**:

- `-t <秒数>`: 自定义停止等待时间

**场景示例**:

```sh
# 优雅停止MySQL
docker stop -t 30 mysql-db

# 重启服务
docker restart -t 20 backend

# 批量启动容器
docker start nginx-web mysql-db redis-cache
```

**注意事项**:

- 停止/重启会中断服务，生产环境低峰期操作
- 数据库类容器需要更长的停止等待时间
- `docker start`仅能启动已停止容器

#### 强制终止容器

**命令**: `docker kill <容器名/ID>`

**核心参数**: 无

**场景示例**:

```sh
# 强制终止无响应容器
docker kill unresponsive-backend

# 发送特定信号
docker kill --signal SIGTERM graceful-app
```

**注意事项**:

- 发送SIGKILL信号，立即终止
- 仅用于`docker stop`无法停止的卡死容器
- 慎用！可能导致数据损坏

#### 删除容器

**命令**: `docker rm <容器名/ID>`

**核心参数**:

- `-f`: 强制删除运行中容器
- `-v`: 删除容器关联的匿名数据卷

**场景示例**:

```sh
# 强制删除容器并清理数据卷
docker rm -f -v exited-mysql

# 批量删除旧版本容器
docker rm -f $(docker ps -a -q -f name=old-*)
```

**注意事项**:

- 生产环境删除前需确认容器无业务依赖
- 命名数据卷不会被`-v`删除
- 定期清理无用容器释放资源

#### 进入容器

**命令**: `docker exec -it <容器名/ID> <shell>`

**核心参数**:

- `-it`: 保持交互终端
- `-u <用户>`: 指定用户
- `-w <路径>`: 指定工作目录

**场景示例**:

```sh
# root权限进入容器
docker exec -it -u root -w /app backend bash

# 进入alpine容器
docker exec -it alpine-container sh

# 执行单条命令
docker exec backend ls -la /app
```

**注意事项**:

- 仅能进入运行中容器
- 避免在容器内修改系统文件
- 退出用`exit`，不影响容器运行

#### 查看容器详情

**命令**: `docker inspect <容器名/ID>`

**核心参数**: 无

**场景示例**:

```sh
# 查看容器IP地址
docker inspect nginx-web | grep -A 5 "IPAddress"

# 查看挂载信息
docker inspect mysql-db | grep -A 10 "Mounts"

# 查看资源限制
docker inspect backend | grep -A 5 "Memory"
```

**注意事项**:

- 输出JSON格式完整信息
- 可结合`grep`或`jq`过滤关键信息
- 用于故障排查和配置验证

#### 复制文件

**命令**: `docker cp <源路径> <目标路径>`

**核心参数**:

- `-r`: 递归复制目录

**场景示例**:

```sh
# 本地文件复制到容器
docker cp ./index.html nginx-web:/usr/share/nginx/html/

# 容器文件复制到本地
docker cp backend:/app/logs/app.log ./

# 复制目录
docker cp -r ./dist nginx-web:/usr/share/nginx/html/
```

**注意事项**:

- 容器内路径需绝对路径
- 大文件建议压缩后传输
- 复制时若目标文件已存在，会直接覆盖

### 4. 日志管理

#### 查看容器日志

**命令**: `docker logs <容器名/ID>`

**核心参数**:

- `-f`: 实时跟踪日志
- `--tail=<行数>`: 查看最近N行
- `--since=<时间>`: 查看指定时间后日志
- `--until=<时间>`: 查看指定时间前日志
- `--timestamps`: 显示日志时间戳

**场景示例**:

```sh
# 实时跟踪日志
docker logs -f nginx-web

# 查看最近200行带时间戳
docker logs --tail=200 --timestamps backend

# 查看时间范围日志
docker logs --since=1h --until=30m ago mysql-db

# 导出日志到文件
docker logs --since=2024-05-01T00:00:00 mysql-db > mysql-20240501.log
```

**注意事项**:

- 日志默认不轮转，需配置日志驱动限制大小
- 生产环境建议配置日志收集系统
- 使用时间范围筛选提高排查效率

### 5. 网络管理

#### 列出网络

**命令**: `docker network ls`

**核心参数**:

- `-q`: 仅输出网络ID
- `-f <条件>`: 筛选网络

**场景示例**:

```sh
# 查看所有桥接网络
docker network ls -f driver=bridge

# 显示网络ID用于批量操作
docker network ls -q -f name=my-net*
```

**注意事项**:

- Docker默认网络：`bridge`、`host`、`none`
- 自定义网络建议用`bridge`类型（单机）
- 无法删除容器正在使用的网络

#### 创建网络

**命令**: `docker network create [参数] <网络名>`

**核心参数**:

- `--driver <驱动>`: 网络类型
- `--subnet <子网>`: 指定子网
- `--gateway <网关>`: 指定网关

**场景示例**:

```sh
# 创建自定义桥接网络
docker network create --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  my-app-net
```

**注意事项**:

- 同一网络内的容器可通过容器名互访
- 跨网络容器需连接到同一网络通信
- 生产环境建议使用自定义网络

#### 连接容器到网络

**命令**: `docker network connect <网络名> <容器名/ID>`

**核心参数**:

- `--ip <IP地址>`: 为容器指定固定IP

**场景示例**:

```sh
# 连接容器到网络并指定IP
docker network connect --ip 172.20.0.10 my-app-net mysql-db

# 连接多个容器
docker network connect my-app-net backend frontend
```

**注意事项**:

- 一个容器可连接多个网络
- 连接后需重启容器内的网络服务使IP生效
- 固定IP便于服务发现和配置

#### 断开容器与网络

**命令**: `docker network disconnect <网络名> <容器名/ID>`

**核心参数**: 无

**场景示例**:

```sh
# 断开容器与网络连接
docker network disconnect my-app-net old-container

# 强制断开
docker network disconnect -f my-app-net problematic-container
```

**注意事项**:

- 断开后容器不再属于该网络
- 需保留至少一个网络，避免容器无法通信
- 生产环境操作前确认网络依赖关系

#### 删除网络

**命令**: `docker network rm <网络名>`

**核心参数**: 无

**场景示例**:

```sh
# 删除未使用网络
docker network rm unused-net

# 批量删除网络
docker network rm $(docker network ls -q -f name=test-*)
```

**注意事项**:

- 需先断开所有容器与该网络的连接
- 无法删除容器正在使用的网络
- 默认网络（`bridge`/`host`/`none`）无法删除

#### 查看网络详情

**命令**: `docker network inspect <网络名>`

**核心参数**: 无

**场景示例**:

```sh
# 查看网络内所有容器
docker network inspect my-app-net | jq .Containers

# 查看子网配置
docker network inspect my-app-net | jq .IPAM.Config
```

**注意事项**:

- 输出网络内所有容器、子网、网关等信息
- 关键字段：`Containers`、`IPAM.Config`
- 用于网络连通性排查

### 6. 数据卷管理

#### 列出数据卷

**命令**: `docker volume ls`

**核心参数**:

- `-q`: 仅输出卷ID
- `-f <条件>`: 筛选数据卷

**场景示例**:

```sh
# 查看所有mysql前缀的数据卷
docker volume ls -f name=mysql*

# 显示卷ID用于批量操作
docker volume ls -q -f name=temp-*
```

**注意事项**:

- 数据卷默认存储在`/var/lib/docker/volumes/`
- 命名卷比匿名卷更易管理
- 定期检查数据卷使用情况

#### 创建数据卷

**命令**: `docker volume create [参数] <卷名>`

**核心参数**:

- `--driver <驱动>`: 卷驱动类型
- `--opt <键=值>`: 驱动参数

**场景示例**:

```sh
# 创建本地数据卷
docker volume create mysql-data

# 创建NFS数据卷
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/data/nfs \
  mysql-nfs
```

**注意事项**:

- 本地数据卷适合单机
- 网络数据卷（NFS/Ceph）适合跨主机共享
- 创建后需通过`docker run -v`挂载到容器

#### 查看数据卷详情

**命令**: `docker volume inspect <卷名>`

**核心参数**: 无

**场景示例**:

```sh
# 查看数据卷存储路径
docker volume inspect mysql-data | grep Mountpoint

# 查看所有数据卷详情
docker volume inspect $(docker volume ls -q)
```

**注意事项**:

- 输出卷的存储路径、驱动、参数等信息
- 本地卷默认路径：`/var/lib/docker/volumes/<卷名>/_data`
- 用于数据备份和迁移

#### 删除数据卷

**命令**: `docker volume rm <卷名>`

**核心参数**: 无

**场景示例**:

```sh
# 删除未使用数据卷
docker volume rm unused-data

# 批量删除所有未使用数据卷
docker volume prune -f

# 强制删除使用中的数据卷
docker volume rm -f mysql-data
```

**注意事项**:

- 需先删除使用该卷的容器
- 数据卷删除后数据永久丢失
- 生产环境谨慎使用`prune`，避免误删

### 7. 系统维护

#### 查看磁盘占用

**命令**: `docker system df`

**核心参数**: 无

**场景示例**:

```sh
# 查看Docker磁盘使用情况
docker system df

# 详细显示
docker system df -v
```

**注意事项**:

- 输出镜像、容器、数据卷、构建缓存的磁盘占用
- 关键指标：`SIZE`（大小）、`RECLAIMABLE`（可回收大小）
- 定期执行，及时清理

#### 清理无用资源

**命令**: `docker system prune [参数]`

**核心参数**:

- `-a`: 删除所有未运行的镜像
- `--volumes`: 删除未使用数据卷
- `-f`: 跳过确认，直接清理

**场景示例**:

```sh
# 强制清理未运行容器、网络、镜像、构建缓存
docker system prune -a -f

# 清理包括未使用数据卷
docker system prune --volumes -f

# 仅清理构建缓存
docker builder prune -f
```

**注意事项**:

- 生产环境清理前需确认无有用资源
- `--volumes`会删除未使用数据卷，数据无法恢复
- 建议在低峰期执行清理操作

### 8. 容器监控与性能分析

#### 查看容器资源占用

**命令**: `docker stats [容器名/ID]`

**核心参数**:

- `--no-stream`: 只显示一次统计
- `--format`: 自定义输出格式
- `--all`: 显示所有容器

**场景示例**:

```sh
# 实时监控所有容器
docker stats

# 表格化显示关键指标
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# 监控指定容器
docker stats nginx-web mysql-db
```

**注意事项**:

- 实时监控会持续占用终端
- 生产环境建议结合Prometheus+Grafana监控
- 使用`--no-stream`获取瞬时状态

#### 查看容器进程树

**命令**: `docker top <容器名/ID>`

**核心参数**: 支持`ps`命令参数

**场景示例**:

```sh
# 查看容器进程
docker top mysql-db

# 查看详细进程信息
docker top backend -aux

# 查找特定进程
docker top nginx-web | grep nginx
```

**注意事项**:

- 显示容器内运行的进程信息
- 用于排查容器内进程异常
- 支持标准的`ps`命令参数

### 9. 安全与权限管理

#### 扫描镜像漏洞

**命令**: `docker scan <镜像名:标签>`

**核心参数**:

- `--file`: 指定Dockerfile路径
- `--json`: JSON格式输出

**场景示例**:

```sh
# 扫描镜像漏洞
docker scan nginx:1.25.3

# 扫描构建中的镜像
docker scan --file Dockerfile.myapp my-app:latest

# JSON格式输出
docker scan --json mysql:8.0
```

**注意事项**:

- 需先登录Docker Hub
- 免费版有扫描次数限制
- 企业级可用Trivy、Clair等专业工具

#### 检查容器安全

**命令**: `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock docker/docker-bench-security`

**核心参数**: 无

**场景示例**:

```sh
# Docker安全基准检查
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  docker/docker-bench-security
```

**注意事项**:

- 输出CIS安全合规报告
- 生产环境部署前必做
- 根据报告修复安全问题

### 10. 备份与恢复

#### 备份容器数据

**命令**: `docker run --rm --volumes-from <源容器> -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz <容器数据路径>`

**核心参数**: 无

**场景示例**:

```sh
# 备份MySQL数据
docker run --rm --volumes-from mysql-db -v $(pwd):/backup alpine \
  tar czf /backup/mysql-backup-$(date +%Y%m%d).tar.gz /var/lib/mysql

# 备份多个目录
docker run --rm --volumes-from app-container -v $(pwd):/backup alpine \
  tar czf /backup/app-backup.tar.gz /app/data /app/logs
```

**注意事项**:

- 备份期间建议暂停应用写入
- 定期验证备份文件完整性
- 使用日期标签便于版本管理

#### 恢复容器数据

**命令**: `docker run --rm --volumes-from <目标容器> -v $(pwd):/backup alpine sh -c "cd / && tar xzf /backup/backup.tar.gz"`

**核心参数**: 无

**场景示例**:

```sh
# 恢复MySQL数据
docker run --rm --volumes-from new-mysql -v $(pwd):/backup alpine \
  sh -c "cd / && tar xzf /backup/mysql-backup-20240501.tar.gz"

# 恢复前停止容器
docker stop target-container
docker run --rm --volumes-from target-container -v $(pwd):/backup alpine \
  sh -c "cd / && tar xzf /backup/backup.tar.gz"
docker start target-container
```

**注意事项**:

- 恢复前确认目标容器已停止
- 恢复后检查数据完整性
- 重要数据恢复前先备份当前状态

## 二、Docker Compose 命令

### 1. 服务生命周期

#### 启动服务（前台）

**命令**: `docker-compose up`

**核心参数**:

- `-f <文件>`: 指定配置文件
- `--no-build`: 不构建镜像
- `--abort-on-container-exit`: 任何容器退出时停止所有容器

**场景示例**:

```sh
# 前台启动服务
docker-compose up

# 指定配置文件启动
docker-compose -f docker-compose.prod.yml up

# 启动特定服务
docker-compose up backend frontend
```

**注意事项**:

- 适合首次部署或调试
- 日志实时显示便于排查
- Ctrl+C停止服务，容器不删除

#### 启动服务（后台）

**命令**: `docker-compose up -d`

**核心参数**:

- `-d`: 后台运行
- `--build`: 启动前重新构建镜像
- `--force-recreate`: 强制重新创建容器

**场景示例**:

```sh
# 后台启动服务
docker-compose up -d

# 构建镜像后启动
docker-compose up -d --build

# 生产环境启动
docker-compose -f docker-compose.prod.yml up -d --build
```

**注意事项**:

- 生产环境推荐使用
- 启动后用`docker-compose ps`检查状态
- 代码更新后必加`--build`参数

#### 停止服务

**命令**: `docker-compose stop`

**核心参数**:

- `-t <秒数>`: 停止等待时间
- 可指定服务名停止单个服务

**场景示例**:

```sh
# 停止所有服务
docker-compose stop

# 停止单个服务
docker-compose stop backend

# 优雅停止MySQL
docker-compose stop -t 30 mysql
```

**注意事项**:

- 优雅停止所有服务容器
- 停止后容器仍存在，可恢复
- 生产环境如需彻底清理，用`down`

#### 重启服务

**命令**: `docker-compose restart`

**核心参数**:

- `-t <秒数>`: 停止等待时间
- 可指定服务名重启单个服务

**场景示例**:

```sh
# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart frontend

# 重启后端服务
docker-compose restart -t 20 backend
```

**注意事项**:

- 重启会中断服务
- 若配置文件修改，需用`down + up`使配置生效
- 生产环境低峰期操作

#### 停止并删除服务

**命令**: `docker-compose down`

**核心参数**:

- `-v`: 删除服务关联的数据卷
- `--rmi <类型>`: 删除镜像
- `--remove-orphans`: 删除未在配置文件中定义的容器

**场景示例**:

```sh
# 停止并删除服务
docker-compose down

# 删除包括数据卷
docker-compose down -v

# 删除本地构建的镜像
docker-compose down --rmi local

# 生产环境清理
docker-compose -f docker-compose.prod.yml down -v --rmi local
```

**注意事项**:

- `-v`会删除数据卷，数据无法恢复
- `--rmi all`会删除所有服务镜像
- 生产环境除非确认无需保留数据，否则不加`-v`

#### 启动已停止服务

**命令**: `docker-compose start`

**核心参数**: 可指定服务名启动单个服务

**场景示例**:

```sh
# 启动所有已停止服务
docker-compose start

# 启动特定服务
docker-compose start frontend backend

# 启动数据库服务
docker-compose start mysql redis
```

**注意事项**:

- 仅能启动已停止的服务
- 若服务未创建，需用`up -d`
- 启动后检查服务状态

### 2. 镜像与配置

#### 构建镜像

**命令**: `docker-compose build`

**核心参数**:

- `--no-cache`: 不使用构建缓存
- `--pull`: 强制拉取基础镜像的最新版本
- `--parallel`: 并行构建多个服务

**场景示例**:

```sh
# 构建所有服务镜像
docker-compose build

# 无缓存构建单个服务
docker-compose build --no-cache backend

# 生产环境构建
docker-compose -f docker-compose.prod.yml build --no-cache --pull
```

**注意事项**:

- 构建前确保`docker-compose.yml`中`build`字段配置正确
- 更新依赖时必加`--no-cache`
- 大型项目建议分服务构建

#### 拉取镜像

**命令**: `docker-compose pull`

**核心参数**: 可指定服务名仅拉取单个服务镜像

**场景示例**:

```sh
# 拉取所有服务镜像
docker-compose pull

# 拉取单个服务镜像
docker-compose pull mysql

# 生产环境拉取
docker-compose -f docker-compose.prod.yml pull
```

**注意事项**:

- 前提：镜像已推送到仓库
- 私有仓库需先`docker login`
- 拉取前确保`image`标签正确

#### 验证配置

**命令**: `docker-compose config`

**核心参数**:

- `--services`: 仅列出所有服务名
- `--volumes`: 仅列出所有数据卷名
- `--hash`: 显示配置哈希值

**场景示例**:

```sh
# 验证配置语法
docker-compose config

# 查看所有服务名
docker-compose config --services

# 生产环境配置验证
docker-compose -f docker-compose.prod.yml config
```

**注意事项**:

- 部署前必执行，避免语法错误
- 多文件合并时，后面的文件会覆盖前面配置
- 输出合并后的最终配置

### 3. 状态与日志

#### 查看服务状态

**命令**: `docker-compose ps`

**核心参数**:

- `-q`: 仅输出运行中容器的ID
- `-a`: 显示所有容器（包括已停止）

**场景示例**:

```sh
# 查看服务状态
docker-compose ps

# 查看所有容器
docker-compose ps -a

# 生产环境状态检查
docker-compose -f docker-compose.prod.yml ps
```

**注意事项**:

- 状态为`Up`表示正常运行
- `Exited (1)`表示异常退出，需排查
- 用于快速检查服务健康状态

#### 查看服务日志

**命令**: `docker-compose logs [参数] [服务名]`

**核心参数**:

- `-f`: 实时跟踪日志
- `--tail=<行数>`: 查看最近N行
- `--since=<时间>`: 查看指定时间后日志
- `--timestamps`: 显示时间戳

**场景示例**:

```sh
# 查看所有服务日志
docker-compose logs

# 实时跟踪后端日志
docker-compose logs -f --tail=200 backend

# 查看时间范围日志
docker-compose logs --since=1h --timestamps
```

**注意事项**:

- 不指定服务名则查看所有服务日志
- 日志默认不轮转，需配置日志驱动
- 使用筛选参数提高排查效率

#### 查看容器进程

**命令**: `docker-compose top [服务名]`

**核心参数**: 无

**场景示例**:

```sh
# 查看所有服务进程
docker-compose top

# 查看MySQL进程
docker-compose top mysql

# 生产环境进程检查
docker-compose -f docker-compose.prod.yml top backend
```

**注意事项**:

- 查看服务容器内运行的进程
- 用于排查容器内进程异常
- 不指定服务名则查看所有服务

### 4. 容器交互与数据

#### 进入服务容器

**命令**: `docker-compose exec [参数] <服务名> <shell>`

**核心参数**:

- `-it`: 保持交互终端
- `-u <用户>`: 指定用户
- `-w <路径>`: 指定工作目录

**场景示例**:

```sh
# 进入后端容器
docker-compose exec backend bash

# root权限进入容器
docker-compose exec -u root -w /app backend bash

# 进入alpine容器
docker-compose exec frontend sh
```

**注意事项**:

- 仅能进入运行中服务
- 退出用`exit`，不影响服务运行
- 避免在容器内修改系统文件

#### 查看端口映射

**命令**: `docker-compose port <服务名> <容器端口>`

**核心参数**: 无

**场景示例**:

```sh
# 查看后端服务端口映射
docker-compose port backend 8080

# 查看数据库端口
docker-compose port mysql 3306

# 生产环境端口检查
docker-compose -f docker-compose.prod.yml port nginx 80
```

**注意事项**:

- 查看服务容器端口在宿主机的映射端口
- 用于端口冲突排查
- 确认配置文件`ports`字段是否生效

#### 执行一次性命令

**命令**: `docker-compose run [参数] <服务名> <命令>`

**核心参数**:

- `--rm`: 执行后自动删除临时容器
- `-e <KEY=VALUE>`: 设置环境变量
- `--no-deps`: 不启动依赖服务

**场景示例**:

```sh
# 执行数据库迁移
docker-compose run --rm backend python manage.py migrate

# 执行测试
docker-compose run --rm backend python manage.py test

# 执行备份脚本
docker-compose run --rm backup /scripts/backup.sh
```

**注意事项**:

- 基于服务配置启动临时容器
- 执行后容器不删除，需手动`rm`或使用`--rm`
- 临时容器与原服务容器共享数据卷

#### 删除停止容器

**命令**: `docker-compose rm [服务名]`

**核心参数**:

- `-f`: 强制删除运行中容器
- `-v`: 删除容器关联的匿名数据卷

**场景示例**:

```sh
# 删除所有停止容器
docker-compose rm

# 强制删除特定服务
docker-compose rm -f -v old-service

# 交互式删除
docker-compose rm -i
```

**注意事项**:

- 删除用`stop`停止的服务容器
- 生产环境删除前需确认容器无业务依赖
- 命名数据卷不会被`-v`删除

### 5. 多环境配置管理

#### 环境变量覆盖

**命令**: `docker-compose --env-file .env.prod up -d`

**核心参数**:

- `--env-file`: 指定环境变量文件
- 支持多文件合并

**场景示例**:

```sh
# 使用生产环境变量
docker-compose --env-file .env.prod up -d

# 多文件配置
docker-compose -f docker-compose.yml -f docker-compose.override.yml --env-file .env.prod up -d

# 临时环境变量
docker-compose -e DEBUG=false -e LOG_LEVEL=info up -d
```

**注意事项**:

- 环境变量优先级：命令行 > .env文件 > docker-compose.yml
- 生产环境建议使用独立的env文件
- 敏感信息不应硬编码在配置文件中

#### 扩展配置

**命令**: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml config`

**核心参数**: 无

**场景示例**:

```sh
# 查看合并后的配置
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml config

# 输出到文件
docker-compose -f docker-compose.yml -f docker-compose.override.yml config > docker-compose.final.yml

# 验证多文件配置
docker-compose -f docker-compose.yml -f docker-compose.prod.yml config --services
```

**注意事项**:

- 多文件合并：后面的文件覆盖前面文件的配置
- 用`config`验证配置合并结果
- 避免配置冲突和重复定义

### 6. 服务伸缩与更新

#### 服务伸缩

**命令**: `docker-compose up -d --scale <服务名>=<数量>`

**核心参数**: 无

**场景示例**:

```sh
# 扩展后端实例
docker-compose up -d --scale backend=3

# 扩展worker实例
docker-compose up -d --scale worker=5

# 同时扩展多个服务
docker-compose up -d --scale backend=3 --scale worker=5
```

**注意事项**:

- 需要服务无状态设计
- 有状态服务（如数据库）不能伸缩
- 确保服务支持水平扩展

#### 服务更新

**命令**: `docker-compose up -d --no-deps <服务名>`

**核心参数**: 无

**场景示例**:

```sh
# 只更新前端服务
docker-compose up -d --no-deps --build frontend

# 更新后端不重启数据库
docker-compose up -d --no-deps backend

# 强制重建服务
docker-compose up -d --force-recreate backend
```

**注意事项**:

- `--no-deps`不更新依赖服务
- 微服务架构中常用，减少影响范围
- 结合`--build`重新构建镜像

## 三、附录：高频场景排查命令

### 1. 容器无法启动排查

```sh
# 前台启动查看报错
docker-compose up

# 查看容器启动日志
docker logs <容器名>

# 查看详细错误信息
docker inspect <容器名> | grep -A 10 "Error"

# 检查容器状态
docker ps -a --filter name=<容器名>
```

### 2. 容器间网络通信排查

```sh
# 确认容器在同一网络
docker network inspect <网络名> | jq '.[].Containers'

# 测试网络连通性
docker exec <容器A> ping <目标容器名>

# 检查DNS解析
docker exec <容器名> nslookup <目标服务>

# 查看端口监听
docker exec <容器名> netstat -tulpn
```

### 3. 日志过大处理

```sh
# 查看日志占用
docker system df

# 配置日志驱动轮转
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3",
    "compress": "true"
  }
}

# 清理旧日志
docker system prune -f

# 查看具体容器日志大小
docker ps -q | xargs docker inspect --format='{{.Name}}: {{.LogPath}}' | xargs ls -lh
```

### 4. 数据丢失排查

```sh
# 查看数据卷信息
docker volume inspect <卷名>

# 确认数据是否存在
ls -la $(docker volume inspect <卷名> | jq -r '.[0].Mountpoint')

# 检查容器挂载
docker inspect <容器名> | grep -A 10 "Mounts"

# 查看容器日志确认挂载状态
docker logs <容器名> | grep -i mount
```

### 5. 镜像拉取失败排查

```sh
# 确认登录状态
docker login <仓库地址>

# 测试网络连通性
ping <仓库地址>

# 检查镜像加速器配置
cat /etc/docker/daemon.json

# 查看详细错误信息
docker pull <镜像名> --debug

# 检查仓库权限
docker pull registry.example.com/private-image
```

### 6. 性能问题排查

```sh
# 实时监控资源使用
docker stats

# 查看容器进程
docker top <容器名>

# 检查系统资源
docker system df
docker system events

# 性能分析
docker run --rm -it --pid=container:<目标容器> --net=container:<目标容器> --cap-add sys_admin --cap-add sys_ptrace alpine sh
# apk add htop strace && htop
```

### 7. 安全排查

```sh
# 扫描镜像漏洞
docker scan <镜像名>

# 检查容器权限
docker inspect <容器名> | grep -A 5 "SecurityOpt"

# 查看运行用户
docker exec <容器名> whoami

# 检查挂载权限
docker inspect <容器名> | grep -A 10 "Mounts"
```

## 四、生产环境最佳实践

### 1. 安全加固配置

```sh
# 非root用户运行
docker run -d --user 1000:1000 --security-opt no-new-privileges:true nginx:1.25.3

# 只读根文件系统
docker run -d --read-only -v /tmp:/tmp nginx:1.25.3

# 限制系统调用
docker run -d --security-opt seccomp=seccomp-profile.json nginx:1.25.3

# 容器运行时保护
docker run -d --restart=unless-stopped --memory=1g --cpus=1.0 nginx:1.25.3
```

### 2. 资源限制配置

```yaml
# docker-compose.yml
services:
  backend:
    image: my-app:latest
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
    restart: unless-stopped
```

### 3. 健康检查配置

```yaml
services:
  web:
    image: nginx:1.25.3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 4. 日志管理配置

```yaml
services:
  backend:
    image: my-app:latest
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "3"
        compress: "true"
```

## 五、常用脚本示例

### 1. 容器健康检查脚本

```sh
#!/bin/bash
# container-health-check.sh

echo "=== Docker系统状态 ==="
docker system df
echo ""

echo "=== 运行中容器 ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "=== 服务状态 ==="
docker-compose ps
echo ""

echo "=== 最近错误日志 ==="
docker-compose logs --tail=20 | grep -i error
echo ""

echo "=== 资源使用Top5 ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | sort -k3 -hr | head -5
```

### 2. 全栈备份脚本

```sh
#!/bin/bash
# docker-backup.sh

BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

echo "开始备份Docker全栈..."

# 备份所有数据卷
echo "备份数据卷..."
docker volume ls -q | while read volume; do
  echo "备份卷: $volume"
  docker run --rm -v $volume:/data -v $BACKUP_DIR:/backup alpine \
    tar czf /backup/${volume}.tar.gz -C /data .
done

# 备份Compose配置
echo "备份配置文件..."
docker-compose config > $BACKUP_DIR/docker-compose.backup.yml

# 备份镜像列表
echo "备份镜像列表..."
docker images --format "{{.Repository}}:{{.Tag}}" > $BACKUP_DIR/images.list

# 导出关键镜像
echo "导出关键镜像..."
docker save -o $BACKUP_DIR/critical-images.tar nginx:1.25.3 mysql:8.0

echo "备份完成: $BACKUP_DIR"
```

### 3. 容器快速诊断脚本

```sh
#!/bin/bash
# docker-diagnose.sh

CONTAINER=$1

if [ -z "$CONTAINER" ]; then
  echo "用法: $0 <容器名>"
  exit 1
fi

echo "=== 容器 $CONTAINER 诊断报告 ==="
echo ""

echo "1. 基础信息:"
docker inspect $CONTAINER | jq '.[] | {Name: .Name, State: .State.Status, Running: .State.Running, RestartCount: .RestartCount}'
echo ""

echo "2. 网络信息:"
docker inspect $CONTAINER | jq '.[].NetworkSettings.Networks'
echo ""

echo "3. 挂载信息:"
docker inspect $CONTAINER | jq '.[].Mounts'
echo ""

echo "4. 资源使用:"
docker stats $CONTAINER --no-stream
echo ""

echo "5. 最近日志:"
docker logs --tail=50 $CONTAINER
echo ""

echo "6. 进程列表:"
docker top $CONTAINER
```