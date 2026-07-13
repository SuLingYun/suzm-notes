---
title: Nginx 安全升级完整指南
date: 2026-07-13
description: 涵盖 Rocky Linux 9.7 和 CentOS 7.9 两套服务器的 Nginx 安全升级操作指南，包含仓库升级、源码编译和平滑升级三种方式
tags:
  - nginx
  - security
  - upgrade
  - middleware
  - 运维笔记
---

# Nginx 安全升级完整指南

## 一、文档说明

### 1.1 服务器信息

本文档涵盖两台服务器的 Nginx 升级：

|服务器|操作系统|Nginx安装方式|Nginx版本|
|--|--|--|--|
|**服务器A**|Rocky Linux 9.7|DNF 包管理器安装|nginx 1.20.x|
|**服务器B**|CentOS 7.9|源码编译安装|nginx 1.26.x|

### 1.2 Nginx 最新版本信息

截至 2026年5月：

|版本类型|版本号|说明|适用场景|
|--|--|--|--|
|**稳定版（Stable）**|**nginx-1.30.1**|经过充分测试，稳定可靠|生产环境推荐|
|**开发版（Mainline）**|**nginx-1.31.0**|包含最新功能，但可能不稳定|测试环境|

### 1.3 升级方案选择

|服务器|推荐方案|说明|
|--|--|--|
|**服务器A（Rocky Linux 9.7）**|使用 Nginx 官方仓库升级|简单、稳定，自动处理依赖|
|**服务器B（CentOS 7.9）**|平滑升级（热升级）|服务不中断，用户无感知|

### 1.4 升级风险评估

|风险项|风险等级|应对措施|
|--|--|--|
|配置文件兼容性|低|升级前完整备份|
|SSL 证书丢失|高|单独备份证书文件|
|服务中断|低|使用平滑升级|
|模块加载失败|中|记录完整编译参数|
|权限问题|低|使用 root 权限操作|

---

## 二、升级前准备工作（两台服务器都要执行）

### 2.1 准备工作检查清单

```sh
# 执行以下命令，确认每一步都完成
echo "=== 升级前检查清单 ==="

echo "1. 检查当前 Nginx 版本："
nginx -v

echo "2. 检查系统版本："
cat /etc/centos-release  # CentOS 7
# cat /etc/rocky-release  # Rocky Linux 9

echo "3. 检查 Nginx 进程："
ps aux | grep nginx | grep -v grep

echo "4. 检查监听端口："
ss -tulnp | grep -E ':80|:443' || netstat -tulnp | grep -E ':80|:443'

echo "5. 检查服务状态："
systemctl status nginx --no-pager || echo "Not using systemd"
```

### 2.2 备份 Nginx 配置目录

```sh
# 1. 备份整个 Nginx 配置目录
mkdir -p /root/nginx-backup-$(date +%Y%m%d)
cp -r /etc/nginx /root/nginx-backup-$(date +%Y%m%d)/

# 2. 验证备份
ls -la /root/nginx-backup-$(date +%Y%m%d)/
du -sh /root/nginx-backup-$(date +%Y%m%d)/nginx/
```

### 2.3 备份 SSL 证书（重要！）

```sh
# 1. 创建 SSL 证书备份目录
mkdir -p /root/nginx-backup-$(date +%Y%m%d)/ssl

# 2. 查找 SSL 证书位置
find /etc/nginx -name "*.pem" -o -name "*.crt" -o -name "*.key" -o -name "*.pem" 2>/dev/null

# 3. 备份 SSL 证书（根据实际路径修改）
cp -r /etc/nginx/ssl/* /root/nginx-backup-$(date +%Y%m%d)/ssl/ 2>/dev/null || echo "No SSL directory found"

# 4. 备份证书后检查
ls -la /root/nginx-backup-$(date +%Y%m%d)/ssl/
```

### 2.4 备份 Nginx 二进制文件

**服务器A（Rocky Linux 9.7，DNF安装）：**

```sh
# 备份二进制文件
cp /usr/sbin/nginx /root/nginx-backup-$(date +%Y%m%d)/nginx.backup
cp /usr/sbin/nginx-debug /root/nginx-backup-$(date +%Y%m%d)/ 2>/dev/null || true

# 备份模块文件
mkdir -p /root/nginx-backup-$(date +%Y%m%d)/modules
cp /usr/lib64/nginx/modules/*.so /root/nginx-backup-$(date +%Y%m%d)/modules/
```

**服务器B（CentOS 7.9，源码编译）：**

```sh
# 备份二进制文件（替换为你的实际安装路径）
cp /usr/local/nginx/sbin/nginx /root/nginx-backup-$(date +%Y%m%d)/nginx.backup

# 备份模块文件（如果有）
mkdir -p /root/nginx-backup-$(date +%Y%m%d)/modules
find /usr/local/nginx/modules -name "*.so" -exec cp {} /root/nginx-backup-$(date +%Y%m%d)/modules/ \;
```

### 2.5 记录关键配置信息

```sh
# 1. 记录 Nginx 版本和编译参数
nginx -V > /root/nginx-backup-$(date +%Y%m%d)/nginx-version-info.txt 2>&1

# 2. 记录 PID 文件位置
cat /var/run/nginx.pid > /root/nginx-backup-$(date +%Y%m%d)/nginx-pid.txt

# 3. 查看加载的模块
nginx -V 2>&1 | grep -oP '(?<=--with-)[^\s]+' > /root/nginx-backup-$(date +%Y%m%d)/nginx-modules.txt

# 4. 查看配置文件结构
tree /etc/nginx -L 2 > /root/nginx-backup-$(date +%Y%m%d)/nginx-tree.txt 2>/dev/null || find /etc/nginx -type f > /root/nginx-backup-$(date +%Y%m%d)/nginx-files.txt
```

### 2.6 测试当前配置

```sh
# 1. 测试配置文件语法
nginx -t

# 2. 查看测试结果
# 如果看到 "syntax is ok" 和 "test is successful" 表示配置正常

# 3. 查看所有配置的文件
find /etc/nginx -name "*.conf" | xargs wc -l
```

### 2.7 创建完整备份打包文件

```sh
# 1. 创建完整备份
cd /root
tar -czvf nginx-full-backup-$(date +%Y%m%d).tar.gz nginx-backup-$(date +%Y%m%d)/

# 2. 验证备份文件
ls -lh nginx-full-backup-$(date +%Y%m%d).tar.gz

# 3. 将备份文件复制到安全位置（其他服务器或存储）
cp nginx-full-backup-$(date +%Y%m%d).tar.gz /backup/  # 替换为实际路径
```

---

## 三、服务器A：Rocky Linux 9.7 Nginx 升级

### 3.1 方案选择

Rocky Linux 9.7 官方仓库中的 Nginx 版本较旧，有两种升级方式：

|方式|优点|缺点|推荐场景|
|--|--|--|--|
|**方式一：官方仓库**|简单、自动处理依赖|版本可能不是最新版|生产环境推荐|
|**方式二：源码编译**|可以获得最新版本、自定义模块|操作复杂|需要特定版本或模块|

### 3.2 方式一：使用 Nginx 官方仓库升级（推荐）

#### 步骤1：安装 yum-utils（如果尚未安装）

```sh
# 检查是否已安装
rpm -qa | grep yum-utils

# 如果没有，安装
dnf install -y yum-utils
```

#### 步骤2：创建 Nginx 官方仓库配置文件

```sh
# 创建新的 repo 文件
cat > /etc/yum.repos.d/nginx.repo << 'EOF'
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
EOF
```

#### 步骤3：查看可用版本

```sh
# 1. 查看当前安装的版本
echo "当前安装的 Nginx 版本："
dnf list installed | grep nginx

# 2. 查看仓库中可用的版本
echo "仓库中可用的 Nginx 版本："
dnf module list nginx

# 3. 清除缓存并重建
dnf clean all
dnf makecache
```

#### 步骤4：执行升级

**升级到稳定版（推荐）：**

```sh
# 1. 确保使用稳定版仓库
dnf config-manager --enable nginx-stable
dnf config-manager --disable nginx-mainline

# 2. 查看设置
dnf config-manager | grep nginx

# 3. 执行升级
dnf upgrade nginx -y

# 4. 安装所有 nginx 相关包（包括依赖）
dnf upgrade nginx-* -y
```

**升级到最新主线版本（如果需要最新功能）：**

```sh
# 1. 启用主线版仓库
dnf config-manager --enable nginx-mainline
dnf config-manager --disable nginx-stable

# 2. 执行升级
dnf upgrade nginx -y
```

#### 步骤5：验证升级

```sh
# 1. 检查新版本
echo "升级后的 Nginx 版本："
nginx -v

# 2. 测试配置
nginx -t

# 3. 检查服务状态
systemctl status nginx

# 4. 如果服务已在运行，重启以应用新版本
systemctl restart nginx

# 5. 再次检查状态
systemctl status nginx

# 6. 检查监听端口
ss -tulnp | grep nginx
```

#### 步骤6：测试访问

```sh
# 1. 测试本地访问
curl -I http://localhost

# 2. 测试所有配置的站点
curl -I http://your-domain1.com
curl -I http://your-domain2.com

# 3. 测试 HTTPS（如果有）
curl -I https://your-domain.com

# 4. 查看错误日志
tail -20 /var/log/nginx/error.log
```

### 3.3 方式二：源码编译升级

如果需要特定版本或自定义模块，使用源码编译升级。

#### 步骤1：安装编译依赖

```sh
# 1. 安装开发工具组
dnf groupinstall "Development Tools" -y

# 2. 安装编译依赖
dnf install -y \
    pcre pcre-devel \
    zlib zlib-devel \
    openssl openssl-devel \
    gd gd-devel \
    perl-ExtUtils-Embed \
    libxml2 libxml2-devel \
    libxslt libxslt-devel \
    perl-CPAN \
    gcc gcc-c++ make
```

#### 步骤2：查看当前编译参数（必须记录！）

```sh
# 查看完整编译参数
nginx -V 2>&1

# 示例输出：
# nginx version: nginx/1.20.1
# built by gcc 11.4.1 20231218 (Red Hat 11.4.1-3) (GCC)
# built with OpenSSL 3.0.7 1 Nov 2022 (running with OpenSSL 3.2.2 4 Jun 2024)
# TLS SNI support enabled
# configure arguments:
# --prefix=/etc/nginx
# --sbin-path=/usr/sbin/nginx
# --modules-path=/usr/lib64/nginx/modules
# --conf-path=/etc/nginx/nginx.conf
# --error-log-path=/var/log/nginx/error.log
# --http-log-path=/var/log/nginx/access.log
# --pid-path=/var/run/nginx.pid
# --lock-path=/var/run/nginx.lock
# --http-client-body-temp-path=/var/cache/nginx/client_temp
# --http-proxy-temp-path=/var/cache/nginx/proxy_temp
# --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp
# --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp
# --http-scgi-temp-path=/var/cache/nginx/scgi_temp
# --user=nginx
# --group=nginx
# --with-compat
# --with-file-aio
# --with-threads
# --with-http_addition_module
# --with-http_auth_request_module
# --with-http_dav_module
# --with-http_flv_module
# --with-http_gunzip_module
# --with-http_gzip_static_module
# --with-http_mp4_module
# --with-http_random_index_module
# --with-http_realip_module
# --with-http_secure_link_module
# --with-http_slice_module
# --with-http_ssl_module
# --with-http_stub_status_module
# --with-http_sub_module
# --with-http_v2_module
# --with-http_v3_module
# --with-mail
# --with-mail_ssl_module
# --with-stream
# --with-stream_realip_module
# --with-stream_ssl_module
# --with-stream_ssl_preread_module

# 保存到文件（重要！）
nginx -V > /root/nginx-compile-params.txt 2>&1
```

#### 步骤3：下载最新稳定版源码

```sh
# 1. 进入工作目录
mkdir -p /usr/local/src
cd /usr/local/src

# 2. 下载稳定版 1.30.1
wget https://nginx.org/download/nginx-1.30.1.tar.gz

# 3. 如果 wget 失败，使用 curl
# curl -O https://nginx.org/download/nginx-1.30.1.tar.gz

# 4. 解压
tar -zxvf nginx-1.30.1.tar.gz
cd nginx-1.30.1
```

#### 步骤4：配置编译参数

```sh
# 使用刚才记录的参数（替换为你的实际参数）
./configure \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
    --modules-path=/usr/lib64/nginx/modules \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --http-client-body-temp-path=/var/cache/nginx/client_temp \
    --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
    --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
    --user=nginx \
    --group=nginx \
    --with-compat \
    --with-file-aio \
    --with-threads \
    --with-http_addition_module \
    --with-http_auth_request_module \
    --with-http_dav_module \
    --with-http_flv_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_mp4_module \
    --with-http_random_index_module \
    --with-http_realip_module \
    --with-http_secure_link_module \
    --with-http_slice_module \
    --with-http_ssl_module \
    --with-http_stub_status_module \
    --with-http_sub_module \
    --with-http_v2_module \
    --with-http_v3_module \
    --with-mail \
    --with-mail_ssl_module \
    --with-stream \
    --with-stream_realip_module \
    --with-stream_ssl_module \
    --with-stream_ssl_preread_module
```

#### 步骤5：编译（只编译，不安装！）

```sh
# 1. 编译
make

# 2. 编译完成后，确认二进制文件已生成
ls -la objs/nginx
```

#### 步骤6：停止 Nginx 服务并备份

```sh
# 1. 停止 Nginx 服务
systemctl stop nginx

# 2. 确认已停止
ps aux | grep nginx | grep -v grep

# 3. 备份旧的二进制文件和模块
cp /usr/sbin/nginx /usr/sbin/nginx.old.$(date +%Y%m%d)
mkdir -p /usr/lib64/nginx/modules/backup
cp /usr/lib64/nginx/modules/*.so /usr/lib64/nginx/modules/backup/
```

#### 步骤7：替换二进制文件和模块

```sh
# 1. 替换主二进制文件
cp objs/nginx /usr/sbin/nginx

# 2. 替换模块文件
cp objs/*.so /usr/lib64/nginx/modules/

# 3. 设置权限
chmod 755 /usr/sbin/nginx
chmod 755 /usr/lib64/nginx/modules/*.so
```

#### 步骤8：测试并启动

```sh
# 1. 测试新二进制文件
/usr/sbin/nginx -t

# 2. 启动服务
systemctl start nginx

# 3. 检查状态
systemctl status nginx

# 4. 查看版本
nginx -v

# 5. 检查监听端口
ss -tulnp | grep nginx
```

#### 步骤9：验证功能

```sh
# 1. 测试本地访问
curl -I http://localhost

# 2. 测试所有站点
curl -I http://your-domain1.com

# 3. 查看错误日志
tail -50 /var/log/nginx/error.log
```

---

## 四、服务器B：CentOS 7.9 Nginx 升级

### 4.1 方案说明

CentOS 7.9 通过源码编译安装的 Nginx，有两种升级方式：

|方式|优点|缺点|推荐场景|
|--|--|--|--|
|**普通升级**|操作简单|会中断服务|非核心业务|
|**平滑升级**|服务不中断，用户无感知|操作稍复杂|生产核心业务推荐|

**强烈推荐使用平滑升级！**

### 4.2 普通升级（会中断服务）

#### 步骤1：安装编译依赖

```sh
# 1. 安装开发工具组
yum groupinstall "Development Tools" -y

# 2. 安装编译依赖
yum install -y \
    pcre pcre-devel \
    zlib zlib-devel \
    openssl openssl-devel \
    gd gd-devel \
    perl-ExtUtils-Embed \
    perl-CPAN \
    gcc gcc-c++ make
```

#### 步骤2：备份当前 Nginx

```sh
# 1. 备份二进制文件（替换为你的实际安装路径）
cp /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginx.backup.$(date +%Y%m%d)

# 2. 备份配置目录
cp -r /usr/local/nginx/conf /usr/local/nginx/conf.backup.$(date +%Y%m%d)

# 3. 备份日志目录
cp -r /usr/local/nginx/logs /usr/local/nginx/logs.backup.$(date +%Y%m%d)
```

#### 步骤3：下载最新稳定版

```sh
# 1. 进入工作目录
cd /usr/local/src

# 2. 下载稳定版 1.30.1
wget https://nginx.org/download/nginx-1.30.1.tar.gz

# 3. 解压
tar -zxvf nginx-1.30.1.tar.gz
cd nginx-1.30.1
```

#### 步骤4：配置编译（使用原来的参数）

```sh
# 使用你原来的编译参数（替换为实际参数）
./configure \
    --prefix=/usr/local/nginx \
    --user=nginx \
    --group=nginx \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_realip_module \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-pcre \
    --with-stream \
    --with-stream_ssl_module \
    --with-stream_realip_module
```

#### 步骤5：编译（不要 make install！）

```sh
make
```

#### 步骤6：停止旧 Nginx 服务

```sh
# 1. 查找并停止 nginx
/usr/local/nginx/sbin/nginx -s stop

# 或者
kill $(cat /usr/local/nginx/logs/nginx.pid)

# 或者（强制停止）
killall nginx

# 2. 确认已停止
ps aux | grep nginx | grep -v grep
```

#### 步骤7：替换二进制文件

```sh
# 替换二进制文件
cp /usr/local/src/nginx-1.30.1/objs/nginx /usr/local/nginx/sbin/nginx

# 设置权限
chmod 755 /usr/local/nginx/sbin/nginx
```

#### 步骤8：启动新 Nginx 并验证

```sh
# 1. 启动
/usr/local/nginx/sbin/nginx

# 2. 检查版本
/usr/local/nginx/sbin/nginx -v

# 3. 测试配置
/usr/local/nginx/sbin/nginx -t

# 4. 检查运行状态
ps aux | grep nginx | grep -v grep

# 5. 测试访问
curl -I http://localhost
```

### 4.3 平滑升级详解（推荐）

平滑升级（热升级）是 Nginx 的高级特性，可以实现服务不中断，用户无感知。

#### 原理说明

平滑升级的核心是**新旧进程共存**：

1. **第一步**：旧 master 进程启动新 master 进程（新二进制）
2. **第二步**：新 master 启动新 worker 处理新请求
3. **第三步**：旧 worker 处理完现有连接后优雅退出
4. **第四步**：旧 master 完全退出

**信号机制**：

|信号|作用|说明|
|--|--|--|
|`USR2`|启动新版本|让旧 master 启动新 master|
|`WINCH`|优雅关闭 worker|让旧 worker 优雅退出|
|`QUIT`|优雅关闭|让进程优雅退出|

#### 完整步骤

##### 步骤1：记录当前状态（必须！）

```sh
# 1. 查看当前版本
/usr/local/nginx/sbin/nginx -v

# 2. 查看 PID 文件
cat /usr/local/nginx/logs/nginx.pid

# 3. 查看当前进程
ps aux | grep nginx

# 4. 记录 PID
cat /usr/local/nginx/logs/nginx.pid > /root/nginx-old-pid.txt
cat /root/nginx-old-pid.txt
```

##### 步骤2：备份（必须！）

```sh
# 1. 备份二进制文件（关键！）
cp /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginx.old

# 2. 备份配置目录
cp -r /usr/local/nginx/conf /usr/local/nginx/conf.backup

# 3. 备份日志
cp -r /usr/local/nginx/logs /usr/local/nginx/logs.backup
```

##### 步骤3：下载并编译新版本

```sh
# 1. 进入工作目录
cd /usr/local/src

# 2. 下载稳定版 1.30.1
wget https://nginx.org/download/nginx-1.30.1.tar.gz

# 3. 解压
tar -zxvf nginx-1.30.1.tar.gz
cd nginx-1.30.1

# 4. 配置（使用原来的参数，替换为实际参数）
./configure \
    --prefix=/usr/local/nginx \
    --user=nginx \
    --group=nginx \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_realip_module \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-pcre \
    --with-stream \
    --with-stream_ssl_module \
    --with-stream_realip_module

# 5. 编译（不要 make install！）
make
```

##### 步骤4：替换二进制文件

```sh
# 1. 替换二进制文件
cp /usr/local/src/nginx-1.30.1/objs/nginx /usr/local/nginx/sbin/nginx

# 2. 设置权限
chmod 755 /usr/local/nginx/sbin/nginx
```

##### 步骤5：发送 USR2 信号，启动新 master

```sh
# 1. 读取旧 master PID
OLD_PID=$(cat /usr/local/nginx/logs/nginx.pid)
echo "旧 master PID: $OLD_PID"

# 2. 发送 USR2 信号
kill -USR2 $OLD_PID

# 3. 查看结果
echo "等待 3 秒..."
sleep 3

# 4. 查看进程（应该看到新旧两个 master）
ps aux | grep nginx
```

##### 步骤6：验证新 master 已启动

```sh
# 1. 查看进程
ps aux | grep nginx | grep -v grep

# 应该看到：
# - 旧 master（nginx.pid.oldbin）
# - 新 master
# - 新 worker

# 2. 查看 PID 文件
ls -la /usr/local/nginx/logs/

# 应该看到两个 PID 文件：
# - nginx.pid（旧 master PID）
# - nginx.pid.oldbin（新 master PID）

# 3. 查看日志
tail -20 /usr/local/nginx/logs/error.log
```

##### 步骤7：优雅关闭旧 worker（WINCH 信号）

```sh
# 1. 读取旧 master PID（.oldbin）
cat /usr/local/nginx/logs/nginx.pid.oldbin

# 2. 发送 WINCH 信号给旧 master
kill -WINCH $(cat /usr/local/nginx/logs/nginx.pid.oldbin)

# 3. 等待旧 worker 处理完现有连接
echo "等待 5 秒..."
sleep 5

# 4. 查看进程（应该只有新 master 和新 worker）
ps aux | grep nginx | grep -v grep
```

##### 步骤8：确认新版本正常工作

```sh
# 1. 测试配置
/usr/local/nginx/sbin/nginx -t

# 2. 检查版本
/usr/local/nginx/sbin/nginx -v

# 3. 测试访问
curl -I http://localhost

# 4. 测试所有站点
curl -I http://your-domain1.com

# 5. 查看日志无错误
tail -50 /usr/local/nginx/logs/error.log
```

##### 步骤9：优雅关闭旧 master（QUIT 信号）

```sh
# 1. 确认新版本工作正常后，发送 QUIT 信号关闭旧 master
kill -QUIT $(cat /usr/local/nginx/logs/nginx.pid.oldbin)

# 2. 等待
echo "等待 2 秒..."
sleep 2

# 3. 验证只有新 master 在运行
ps aux | grep nginx | grep -v grep

# 4. 查看日志
tail -10 /usr/local/nginx/logs/error.log
```

##### 步骤10：最终验证

```sh
# 1. 查看当前版本
/usr/local/nginx/sbin/nginx -v

# 2. 查看版本
echo "升级后的 Nginx 版本："
/usr/local/nginx/sbin/nginx -v

# 3. 查看运行状态
ps aux | grep "nginx: master" | grep -v grep

# 4. 查看 worker 数量
ps aux | grep "nginx: worker" | grep -v grep | wc -l

# 5. 测试所有站点
curl -I http://localhost
curl -I https://your-domain1.com  # 如果有 HTTPS

# 6. 检查日志无错误
tail -20 /usr/local/nginx/logs/error.log

# 7. 查看访问日志（确认有访问记录）
tail -10 /usr/local/nginx/logs/access.log
```

---

## 五、升级后验证（两台服务器都要执行）

### 5.1 必须执行的验证清单

```sh
echo "=== Nginx 升级后验证清单 ==="

echo "1. 检查版本："
nginx -v

echo "2. 测试配置："
nginx -t

echo "3. 检查服务状态："
systemctl status nginx --no-pager || ps aux | grep nginx | grep -v grep

echo "4. 检查监听端口："
ss -tulnp | grep nginx || netstat -tulnp | grep nginx

echo "5. 测试本地访问："
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost

echo "6. 检查错误日志："
tail -20 /var/log/nginx/error.log 2>/dev/null || tail -20 /usr/local/nginx/logs/error.log

echo "7. 检查访问日志："
tail -10 /var/log/nginx/access.log 2>/dev/null || tail -10 /usr/local/nginx/logs/access.log

echo "8. 检查模块加载："
nginx -V 2>&1 | grep modules
```

### 5.2 功能验证

```sh
# 1. 测试 HTTP/2（如果有配置）
curl -I --http2 https://your-domain.com

# 2. 测试 HTTPS（如果有配置）
curl -I https://your-domain.com

# 3. 检查 SSL 证书
openssl s_client -connect your-domain.com:443 -servername your-domain.com </dev/null 2>/dev/null | openssl x509 -noout -dates

# 4. 测试反向代理（如果有配置）
curl -I http://backend-server/

# 5. 模拟真实用户访问
wget --spider -S http://your-domain.com
```

### 5.3 性能验证（可选）

```sh
# 1. 检查 worker 进程数
ps aux | grep "nginx: worker" | grep -v grep | wc -l

# 2. 检查 worker 连接数
ss -s | grep streams

# 3. 测试响应时间
time curl -o /dev/null -s http://localhost/

# 4. 查看系统负载
uptime

# 5. 查看资源使用
ps aux | grep nginx | grep -v grep
```

---

## 六、回滚方案

### 6.1 普通升级回滚

如果升级后出现问题，立即回滚：

```sh
# 1. 停止当前版本
systemctl stop nginx
# 或者
/usr/local/nginx/sbin/nginx -s stop
# 或者
killall nginx

# 2. 恢复备份的二进制文件
cp /usr/local/nginx/sbin/nginx.old /usr/local/nginx/sbin/nginx

# 3. 设置权限
chmod 755 /usr/local/nginx/sbin/nginx

# 4. 重新启动
systemctl start nginx
# 或者
/usr/local/nginx/sbin/nginx

# 5. 验证版本
nginx -v
```

### 6.2 平滑升级回滚

如果平滑升级后新版本有问题：

```sh
# 1. 恢复旧二进制文件
cp /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginx.new
cp /usr/local/nginx/sbin/nginx.old /usr/local/nginx/sbin/nginx

# 2. 向旧 master（.oldbin）发送 HUP 信号（重载配置并重启 worker）
kill -HUP $(cat /usr/local/nginx/logs/nginx.pid.oldbin)

# 3. 或者发送 QUIT 信号关闭新 master
kill -QUIT $(cat /usr/local/nginx/logs/nginx.pid)

# 4. 验证版本
/usr/local/nginx/sbin/nginx -v
```

---

## 七、常见问题处理

### 7.1 配置文件语法错误

```sh
# 1. 检查具体错误
nginx -t

# 2. 查看详细错误信息
nginx -t 2>&1

# 3. 恢复备份配置
cp -r /usr/local/nginx/conf.backup/nginx.conf /usr/local/nginx/conf/nginx.conf

# 4. 测试并重启
nginx -t
systemctl restart nginx
```

### 7.2 端口被占用

```sh
# 1. 检查哪个进程占用了 80/443 端口
ss -tulnp | grep -E ":80|:443"

# 2. 如果是其他 nginx 进程
killall nginx

# 3. 如果是其他服务（如 httpd）
systemctl stop httpd
systemctl disable httpd

# 4. 重启 nginx
systemctl restart nginx
```

### 7.3 模块加载失败

```sh
# 1. 检查模块文件
ls -la /usr/lib64/nginx/modules/
ls -la /usr/local/nginx/modules/

# 2. 检查错误日志
tail -50 /var/log/nginx/error.log

# 3. 检查模块依赖
ldd /usr/sbin/nginx | grep "not found"

# 4. 如果是编译的模块，重新编译
# 参考编译步骤重新编译并加载模块
```

### 7.4 SSL/TLS 证书问题

```sh
# 1. 检查证书是否存在
ls -la /etc/nginx/ssl/

# 2. 检查证书有效期
openssl x509 -in /etc/nginx/ssl/your-cert.crt -noout -dates

# 3. 检查私钥匹配
openssl x509 -in /etc/nginx/ssl/your-cert.crt -noout -modulus | md5sum
openssl rsa -in /etc/nginx/ssl/your-private.key -noout -modulus | md5sum

# 4. 如果不匹配，重新配置证书
```

### 7.5 SELinux 问题

```sh
# 1. 检查 SELinux 状态
getenforce

# 2. 如果是 Enforcing 模式
setenforce 0

# 3. 或者配置 SELinux 允许 nginx 操作
setsebool -P httpd_can_network_connect 1

# 4. 重启 nginx
systemctl restart nginx
```

### 7.6 防火墙问题

```sh
# 1. 检查防火墙状态
systemctl status firewalld

# 2. 开放端口
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# 3. 重新加载
firewall-cmd --reload

# 4. 或者直接开放端口
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
```

---

## 八、Nginx 信号说明

### 8.1 信号列表

|信号|作用|使用场景|
|--|--|--|
|`TERM` / `INT`|快速关闭|立即停止服务，不等待连接完成|
|`QUIT`|优雅关闭|等待连接完成后关闭|
|`HUP`|重载配置|平滑重新加载配置|
|`USR2`|平滑升级|启动新版本 master|
|`WINCH`|优雅关闭 worker|关闭旧版本 worker 进程|
|`USR1`|重新打开日志|日志切割时使用|

### 8.2 信号使用示例

```sh
# 优雅重启（重载配置）
nginx -s reload
# 或者
kill -HUP $(cat /var/run/nginx.pid)

# 优雅关闭
nginx -s quit
# 或者
kill -QUIT $(cat /var/run/nginx.pid)

# 快速关闭
kill -TERM $(cat /var/run/nginx.pid)
# 或者
nginx -s stop

# 重新打开日志
nginx -s reopen
# 或者
kill -USR1 $(cat /var/run/nginx.pid)

# 平滑升级
kill -USR2 $(cat /var/run/nginx.pid)
```

---

## 九、常用命令速查表

### Rocky Linux 9.7 (DNF)

```sh
# 查看版本
nginx -v

# 测试配置
nginx -t

# 查看状态
systemctl status nginx

# 重启服务
systemctl restart nginx

# 重新加载配置
systemctl reload nginx

# 查看日志
tail -f /var/log/nginx/error.log

# 查看访问日志
tail -f /var/log/nginx/access.log
```

### CentOS 7.9 (源码编译)

```sh
# 查看版本（替换为你的安装路径）
/usr/local/nginx/sbin/nginx -v

# 测试配置
/usr/local/nginx/sbin/nginx -t

# 重新加载配置
/usr/local/nginx/sbin/nginx -s reload

# 停止服务
/usr/local/nginx/sbin/nginx -s quit

# 查看日志
tail -f /usr/local/nginx/logs/error.log

# 查看访问日志
tail -f /usr/local/nginx/logs/access.log
```

---

## 十、版本选择建议

### 10.1 生产环境

- **推荐版本**：nginx-1.30.1（稳定版）
- **选择理由**：经过充分测试，稳定可靠
- **升级时机**：每月检查一次安全公告，及时修复

### 10.2 测试环境

- **可用版本**：nginx-1.31.0（开发版）
- **用途**：测试新特性，发现潜在问题
- **注意**：不要在生产环境使用开发版

### 10.3 安全建议

- **定期检查**：关注 Nginx 安全公告
- **及时修复**：发现安全漏洞后尽快升级
- **版本控制**：记录每个版本的变更和目的

---

## 十一、完整命令速查表

### 服务器A（Rocky Linux 9.7）

```sh
# 备份
mkdir -p /root/nginx-backup-$(date +%Y%m%d)
cp -r /etc/nginx /root/nginx-backup-$(date +%Y%m%d)/
nginx -V > /root/nginx-backup-$(date +%Y%m%d)/nginx-info.txt

# 升级
dnf install -y yum-utils
cat > /etc/yum.repos.d/nginx.repo << 'EOF'
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
EOF
dnf upgrade nginx -y

# 验证
nginx -v
nginx -t
systemctl restart nginx
curl -I http://localhost
```

### 服务器B（CentOS 7.9 - 平滑升级）

```sh
# 备份
cp /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginx.old
cp -r /usr/local/nginx/conf /usr/local/nginx/conf.backup

# 下载编译
cd /usr/local/src
wget https://nginx.org/download/nginx-1.30.1.tar.gz
tar -zxvf nginx-1.30.1.tar.gz
cd nginx-1.30.1
./configure --prefix=/usr/local/nginx --user=nginx --group=nginx --with-http_ssl_module --with-http_v2_module --with-http_realip_module --with-http_stub_status_module --with-http_gzip_static_module --with-pcre --with-stream --with-stream_ssl_module --with-stream_realip_module
make

# 平滑升级
cp objs/nginx /usr/local/nginx/sbin/nginx
kill -USR2 $(cat /usr/local/nginx/logs/nginx.pid)
sleep 3
kill -WINCH $(cat /usr/local/nginx/logs/nginx.pid.oldbin)
sleep 5
kill -QUIT $(cat /usr/local/nginx/logs/nginx.pid.oldbin)

# 验证
/usr/local/nginx/sbin/nginx -v
curl -I http://localhost
```

---

## 十二、技术总结

|项目|服务器A（Rocky Linux 9.7）|服务器B（CentOS 7.9）|
|--|--|--|
|Nginx 安装方式|DNF 包管理器|源码编译|
|推荐升级方式|官方仓库升级|平滑升级（热升级）|
|升级命令|`dnf upgrade nginx -y`|`kill -USR2/WINCH/QUIT`|
|配置文件路径|`/etc/nginx/`|`/usr/local/nginx/conf/`|
|日志路径|`/var/log/nginx/`|`/usr/local/nginx/logs/`|
|二进制路径|`/usr/sbin/nginx`|`/usr/local/nginx/sbin/nginx`|
|服务管理|systemd|手动/脚本|

---

## 十三、安全提示

### 升级前必须确认

- 备份所有配置文件
- 备份 SSL 证书
- 记录完整的编译参数
- 测试新版本在测试环境
- 选择业务低峰时段升级
- 保留旧二进制文件用于回滚
- 升级后立即验证所有功能

### 版本选择建议

- **生产环境**：使用稳定版（nginx-1.30.1）
- **测试环境**：可以使用开发版（nginx-1.31.0）体验新特性
- **安全优先**：及时关注 Nginx 安全公告，修复已知漏洞