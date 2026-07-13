---
title: Tomcat 部署与优化
description: 涵盖 Tomcat 安装部署、JVM 参数调优、连接器配置、性能监控及常见问题处理的运维手册
date: 2026-07-08
tags:
  - Tomcat
  - Java
  - JVM
  - 性能调优
  - 部署
---

# Tomcat 部署与优化

## 目录

1. [安装部署](#安装部署)
2. [JVM 参数调优](#jvm-参数调优)
3. [连接器配置](#连接器配置)
4. [性能监控](#性能监控)
5. [常见问题](#常见问题)

---

## 安装部署

### 环境要求

| 组件 | 版本要求 | 说明 |
|------|----------|------|
| JDK | 11+（推荐 17/21 LTS） | Tomcat 10+ 需要 Java 11+ |
| Tomcat | 9.x / 10.x | 生产环境建议使用 9.0.x 或 10.1.x |
| 操作系统 | Linux / Windows | 生产环境推荐 CentOS 7+/Ubuntu 20.04+ |

### 手动安装（推荐）

```bash
# 1. 安装 JDK
# Ubuntu / Debian
apt-get update
apt-get install -y openjdk-17-jdk

# CentOS / RHEL
yum install -y java-17-openjdk-devel

# 验证 Java 版本
java -version

# 2. 创建 tomcat 用户（安全考虑，不使用 root 运行）
groupadd tomcat
useradd -s /bin/false -g tomcat -d /opt/tomcat tomcat

# 3. 下载并解压 Tomcat
cd /tmp
wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.XX/bin/apache-tomcat-10.1.XX.tar.gz
tar -xzf apache-tomcat-10.1.XX.tar.gz -C /opt/tomcat
ln -s /opt/tomcat/apache-tomcat-10.1.XX /opt/tomcat/latest

# 4. 设置目录权限
chown -R tomcat:tomcat /opt/tomcat
chmod +x /opt/tomcat/latest/bin/*.sh

# 5. 配置环境变量
cat >> /etc/profile.d/tomcat.sh << 'EOF'
export CATALINA_HOME=/opt/tomcat/latest
export PATH=$PATH:$CATALINA_HOME/bin
EOF
source /etc/profile.d/tomcat.sh

# 6. 创建 systemd 服务
cat > /etc/systemd/system/tomcat.service << 'EOF'
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
Environment="CATALINA_HOME=/opt/tomcat/latest"
Environment="CATALINA_BASE=/opt/tomcat/latest"
Environment="CATALINA_PID=/opt/tomcat/latest/temp/tomcat.pid"

ExecStart=/opt/tomcat/latest/bin/startup.sh
ExecStop=/opt/tomcat/latest/bin/shutdown.sh
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
EOF

# 7. 启动并设置开机自启
systemctl daemon-reload
systemctl start tomcat
systemctl enable tomcat
systemctl status tomcat

# 8. 验证 Tomcat 是否正常运行
curl http://localhost:8080
```

### 目录结构说明

| 目录 | 说明 |
|------|------|
| `bin/` | 启动和关闭脚本 |
| `conf/` | 配置文件目录（server.xml, web.xml, context.xml 等） |
| `lib/` | Tomcat 和公共库文件（JAR） |
| `logs/` | 日志文件（catalina.out, localhost.log 等） |
| `webapps/` | Web 应用部署目录 |
| `work/` | JSP 编译后的临时文件 |
| `temp/` | 临时文件目录 |

### 部署 Web 应用

```bash
# 方式一：直接将 WAR 包复制到 webapps 目录
cp myapp.war /opt/tomcat/latest/webapps/
# Tomcat 会自动解压并部署

# 方式二：使用 Manager App（需要配置用户权限）
# 访问 http://localhost:8080/manager/html

# 方式三：通过 context.xml 配置外部应用
# 在 conf/Catalina/localhost/ 下创建 myapp.xml
```

**Manager App 用户配置：**

```xml
<!-- /opt/tomcat/latest/conf/tomcat-users.xml -->
<tomcat-users>
    <role rolename="manager-gui"/>
    <role rolename="manager-status"/>
    <role rolename="admin-gui"/>
    <user username="admin" password="Strong_Password_123" roles="manager-gui,manager-status,admin-gui"/>
</tomcat-users>
```

---

## JVM 参数调优

### 常用 JVM 参数说明

| 参数 | 说明 | 建议值 |
|------|------|--------|
| `-Xms` | 初始堆内存大小 | 物理内存的 50% |
| `-Xmx` | 最大堆内存大小 | 物理内存的 50%-80% |
| `-Xmn` | 年轻代大小 | 堆内存的 30%-40% |
| `-XX:MetaspaceSize` | 元空间初始大小 | 256m |
| `-XX:MaxMetaspaceSize` | 元空间最大大小 | 512m |
| `-XX:+UseG1GC` | 使用 G1 垃圾回收器 | JDK 11+ 默认 |
| `-XX:+UseZGC` | 使用 ZGC（JDK 17+） | 低延迟场景 |
| `-Xss` | 线程栈大小 | 512k-1024k |

### 配置方式

通过在 `bin/setenv.sh`（如不存在则创建）中设置 `CATALINA_OPTS` 环境变量：

```bash
#!/bin/bash
# /opt/tomcat/latest/bin/setenv.sh

# JVM 参数配置
CATALINA_OPTS="$CATALINA_OPTS -Xms4g"
CATALINA_OPTS="$CATALINA_OPTS -Xmx4g"
CATALINA_OPTS="$CATALINA_OPTS -Xmn1536m"
CATALINA_OPTS="$CATALINA_OPTS -XX:MetaspaceSize=256m"
CATALINA_OPTS="$CATALINA_OPTS -XX:MaxMetaspaceSize=512m"

# 垃圾回收配置（使用 G1GC）
CATALINA_OPTS="$CATALINA_OPTS -XX:+UseG1GC"
CATALINA_OPTS="$CATALINA_OPTS -XX:MaxGCPauseMillis=200"
CATALINA_OPTS="$CATALINA_OPTS -XX:ParallelGCThreads=4"
CATALINA_OPTS="$CATALINA_OPTS -XX:ConcGCThreads=2"
CATALINA_OPTS="$CATALINA_OPTS -XX:InitiatingHeapOccupancyPercent=45"

# GC 日志（方便排查问题）
CATALINA_OPTS="$CATALINA_OPTS -Xlog:gc*:file=/opt/tomcat/latest/logs/gc.log:time,uptime,pid,tags:filecount=10,filesize=10M"

# 内存溢出时自动 dump
CATALINA_OPTS="$CATALINA_OPTS -XX:+HeapDumpOnOutOfMemoryError"
CATALINA_OPTS="$CATALINA_OPTS -XX:HeapDumpPath=/opt/tomcat/latest/logs/heapdump.hprof"

# 远程 JMX 监控（生产环境注意安全）
# CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote"
# CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.port=1099"
# CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.ssl=false"
# CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.authenticate=false"

# 编码设置
CATALINA_OPTS="$CATALINA_OPTS -Dfile.encoding=UTF-8"
CATALINA_OPTS="$CATALINA_OPTS -Djava.net.preferIPv4Stack=true"

export CATALINA_OPTS
```

创建完成后赋予执行权限：

```bash
chmod +x /opt/tomcat/latest/bin/setenv.sh
```

### JVM 参数参考配置

**低内存环境（2GB 内存）：**

```bash
CATALINA_OPTS="$CATALINA_OPTS -Xms1g -Xmx1g -Xmn384m"
CATALINA_OPTS="$CATALINA_OPTS -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m"
CATALINA_OPTS="$CATALINA_OPTS -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

**中等内存环境（8GB 内存）：**

```bash
CATALINA_OPTS="$CATALINA_OPTS -Xms4g -Xmx4g -Xmn1536m"
CATALINA_OPTS="$CATALINA_OPTS -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m"
CATALINA_OPTS="$CATALINA_OPTS -XX:+UseG1GC -XX:MaxGCPauseMillis=100"
CATALINA_OPTS="$CATALINA_OPTS -XX:ParallelGCThreads=8 -XX:ConcGCThreads=4"
```

**高内存环境（32GB 内存）：**

```bash
CATALINA_OPTS="$CATALINA_OPTS -Xms16g -Xmx16g -Xmn6g"
CATALINA_OPTS="$CATALINA_OPTS -XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=1g"
CATALINA_OPTS="$CATALINA_OPTS -XX:+UseG1GC -XX:MaxGCPauseMillis=50"
CATALINA_OPTS="$CATALINA_OPTS -XX:ParallelGCThreads=16 -XX:ConcGCThreads=8"
# JDK 17+ 可考虑 ZGC
# CATALINA_OPTS="$CATALINA_OPTS -XX:+UseZGC -XX:MaxGCPauseMillis=10"
```

---

## 连接器配置

### HTTP 连接器（核心配置）

编辑 `/opt/tomcat/latest/conf/server.xml` 中的 Connector 配置：

```xml
<!-- HTTP 连接器 -->
<Connector port="8080"
           protocol="org.apache.coyote.http11.Http11Nio2Protocol"
           connectionTimeout="20000"
           redirectPort="8443"
           maxThreads="200"
           minSpareThreads="10"
           acceptCount="100"
           maxConnections="10000"
           maxPostSize="10485760"
           compression="on"
           compressionMinSize="1024"
           noCompressionUserAgents="gozilla, traviata"
           compressableMimeType="text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json"
           URIEncoding="UTF-8"
           useBodyEncodingForURI="true"/>
```

**参数说明：**

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `maxThreads` | 200 | 最大工作线程数 |
| `minSpareThreads` | 10 | 最小空闲线程数 |
| `acceptCount` | 100 | 请求队列最大长度 |
| `maxConnections` | 8192（NIO） | 最大连接数 |
| `connectionTimeout` | 20000 | 连接超时（毫秒） |
| `compression` | off | 启用压缩（gzip） |
| `maxPostSize` | 2097152 | POST 请求最大大小（字节） |
| `URIEncoding` | ISO-8859-1 | URI 编码格式 |

### HTTPS 连接器

```xml
<!-- 生成密钥库 -->
<!-- keytool -genkey -alias tomcat -keyalg RSA -keystore /opt/tomcat/conf/keystore.p12 -storetype PKCS12 -validity 3650 -->

<Connector port="8443"
           protocol="org.apache.coyote.http11.Http11Nio2Protocol"
           maxThreads="200"
           SSLEnabled="true"
           scheme="https"
           secure="true">
    <SSLHostConfig>
        <Certificate certificateKeystoreFile="/opt/tomcat/latest/conf/keystore.p12"
                     certificateKeystorePassword="changeit"
                     certificateKeystoreType="PKCS12"
                     type="RSA"/>
    </SSLHostConfig>
</Connector>
```

### AJP 连接器（与 Nginx/Apache 配合）

```xml
<!-- AJP 连接器，通常通过 Nginx 反向代理使用 -->
<Connector port="8009"
           protocol="AJP/1.3"
           secretRequired="true"
           secret="AJP_Secret_Key"
           redirectPort="8443"
           maxThreads="200"
           acceptCount="100"/>
```

### 线程池优化

```xml
<!-- 定义共享线程池 -->
<Executor name="tomcatThreadPool"
          namePrefix="catalina-exec-"
          maxThreads="300"
          minSpareThreads="20"
          maxIdleTime="60000"
          prestartminSpareThreads="true"/>

<!-- 连接器引用共享线程池 -->
<Connector executor="tomcatThreadPool"
           port="8080"
           protocol="org.apache.coyote.http11.Http11Nio2Protocol"
           connectionTimeout="20000"
           redirectPort="8443"
           compression="on"
           URIEncoding="UTF-8"/>
```

---

## 性能监控

### 使用 Tomcat Manager 监控

```bash
# 访问 Manager App（需配置用户权限）
# http://localhost:8080/manager/status
# 提供 Server Status 页面，显示：
# - JVM 内存使用情况
# - 线程池状态（活跃线程、最大线程等）
# - 请求处理器统计
```

### 使用 JDK 自带工具

```bash
# 查看 JVM 进程
jps -l | grep Tomcat

# 查看 JVM 内存使用
jstat -gcutil <pid> 1000 10

# 堆转储分析
jmap -dump:live,format=b,file=/tmp/heap.hprof <pid>

# 查看线程栈（用于分析死锁、线程阻塞）
jstack <pid> > /tmp/thread_dump.txt

# JVM 配置参数查看
jinfo <pid>
```

### GC 日志分析

启用 GC 日志后（已在 setenv.sh 中配置），可分析 GC 频率和停顿时间：

```bash
# 查看 GC 日志
tail -f /opt/tomcat/latest/logs/gc.log

# 使用在线 GC 分析工具（推荐）
# - https://gceasy.io
# - GCViewer（开源）
```

### 使用 Prometheus + Grafana 监控

**配置 Tomcat JMX Exporter：**

```bash
# 1. 下载 JMX Exporter
wget https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/0.20.0/jmx_prometheus_javaagent-0.20.0.jar
mv jmx_prometheus_javaagent-0.20.0.jar /opt/tomcat/latest/lib/

# 2. 创建配置文件
cat > /opt/tomcat/latest/conf/prometheus-jmx-config.yaml << 'EOF'
---
rules:
  - pattern: ".*"
EOF

# 3. 在 setenv.sh 中添加 agent
CATALINA_OPTS="$CATALINA_OPTS -javaagent:/opt/tomcat/latest/lib/jmx_prometheus_javaagent-0.20.0.jar=9100:/opt/tomcat/latest/conf/prometheus-jmx-config.yaml"
```

### 监控指标详解

| 指标类别 | 关键指标 | 说明 |
|----------|----------|------|
| 堆内存 | `HeapMemoryUsage.used` | 当前已用堆内存 |
| 非堆内存 | `NonHeapMemoryUsage.used` | 元空间使用量 |
| 线程 | `ThreadCount` | 当前线程数 |
| 线程 | `PeakThreadCount` | 历史峰值线程数 |
| GC 次数 | `CollectionCount` (G1 Young/Mixed) | GC 发生次数 |
| GC 耗时 | `CollectionTime` (G1 Young/Mixed) | GC 累计耗时 |
| 请求处理 | `requestCount` | 累计请求数 |
| 请求处理 | `processingTime` | 累计处理时间 |
| 错误数 | `errorCount` | 累计错误数 |
| 活跃会话 | `activeSessions` | 当前活跃会话数 |

### 性能分析综合命令

```bash
#!/bin/bash
# Tomcat 性能诊断脚本
# 使用方式: bash tomcat_diag.sh <pid>

PID=$1
if [ -z "$PID" ]; then
    echo "Usage: $0 <tomcat_pid>"
    exit 1
fi

echo "========== Tomcat 性能诊断报告 =========="
echo "时间: $(date)"
echo "PID: $PID"
echo ""

echo "--- JVM 内存使用 ---"
jstat -gcutil $PID
echo ""

echo "--- 堆内存概要 ---"
jmap -heap $PID | head -30
echo ""

echo "--- 线程数统计 ---"
jstack $PID | grep "java.lang.Thread.State" | sort | uniq -c
echo ""

echo "--- 活跃线程数 ---"
jstack $PID | grep -c "RUNNABLE"
echo ""

echo "--- Top 10 最繁忙线程（按 CPU）---"
top -b -n 1 -H -p $PID | tail -20
echo ""

echo "--- 文件描述符使用 ---"
lsof -p $PID | wc -l
echo ""

echo "--- 网络连接 ---"
ss -tlnp | grep $PID
echo ""

echo "=========================================="
```

---

## 常见问题

### 1. PermGen / Metaspace 内存溢出

**现象：** `java.lang.OutOfMemoryError: Metaspace`

**原因：** 类加载过多或 JSP 编译产生大量类，Metaspace 空间不足。

**解决方法：**

```bash
# 增大 Metaspace 大小
# 在 setenv.sh 中添加
CATALINA_OPTS="$CATALINA_OPTS -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m"

# 检查是否有类加载泄漏
jstat -gc <pid>
# 检查 Metaspace 使用率持续增长
```

### 2. Heap 内存溢出

**现象：** `java.lang.OutOfMemoryError: Java heap space`

**排查步骤：**

```bash
# 1. 增加堆内存
# setenv.sh 中增大 -Xmx

# 2. 获取堆转储分析
jmap -dump:live,format=b,file=/tmp/heap.hprof <pid>

# 3. 使用 MAT (Eclipse Memory Analyzer) 或 VisualVM 分析
# 查找大对象、泄漏疑点

# 4. 常见原因
# - 缓存未设置上限
# - 连接池配置过大
# - Session 过多未清理
# - 内存泄漏（ThreadLocal、静态集合等）
```

### 3. 线程池耗尽

**现象：** 请求响应缓慢或返回 503，日志中出现 `Thread pool exhausted`

**排查与解决：**

```bash
# 1. 查看当前线程状态
jstack <pid> | grep -E "RUNNABLE|BLOCKED|WAITING" | sort | uniq -c

# 2. 检查是否有死锁
jstack <pid> | grep -A 20 "deadlock"

# 3. 增加线程池大小
# server.xml 中调整 maxThreads

# 4. 检查是否有慢请求占用线程
# 查看 access log 中响应时间较长的请求

# 5. 检查是否有数据库连接池耗尽
# 数据库连接池大小需要与 maxThreads 匹配
```

### 4. 连接超时

**现象：** `java.net.SocketTimeoutException: Read timed out`

**排查方法：**

```xml
<!-- 在 server.xml 中适当增加超时时间 -->
<Connector port="8080"
           connectionTimeout="30000"
           .../>
```

```bash
# 检查网络延迟
ping <backend_host>
# 检查后端服务是否正常
curl -I http://<backend_host>:<port>
```

### 5. 部署失败

**常见错误及解决方法：**

| 错误现象 | 原因 | 解决方法 |
|----------|------|----------|
| `FAIL - Application already exists` | 应用已存在 | 先 undeploy 再部署 |
| `FAIL - Error installing` | WAR 包损坏 | 重新打包或检查文件完整性 |
| `java.lang.IllegalArgumentException` | 配置错误 | 检查 web.xml 和 context.xml |
| `NoClassDefFoundError` | 缺少依赖 JAR | 将依赖包放入 `lib/` 目录 |
| `Port already in use` | 端口被占用 | `ss -tlnp \| grep 8080` 查看占用进程 |

### 6. 日志文件过大

**现象：** `catalina.out` 或 `localhost_access.log` 文件体积巨大，影响磁盘空间。

**解决方法：**

```bash
# 方案一：使用 logrotate 自动切割
cat > /etc/logrotate.d/tomcat << 'EOF'
/opt/tomcat/latest/logs/catalina.out {
    copytruncate
    daily
    rotate 30
    compress
    missingok
    dateext
}
/opt/tomcat/latest/logs/localhost_access_log.*.txt {
    daily
    rotate 30
    compress
    missingok
    dateext
}
EOF

# 方案二：限制 catalina.out 大小（通过 setenv.sh）
# 使用管道日志方案，限制日志输出
```

### 7. Tomcat 安全加固

```bash
# 1. 移除默认示例应用
rm -rf /opt/tomcat/latest/webapps/{docs,examples,host-manager,manager,ROOT}

# 2. 修改 Shutdown 端口密码
# server.xml 中 shutdown 端口建议关闭或随机密码
<Server port="-1" shutdown="SHUTDOWN">  <!-- port=-1 禁用 shutdown 端口 -->

# 3. 禁用不必要的连接器
# 如果不使用 AJP，注释或删除 AJP 连接器

# 4. 配置安全头
# 在 Catalina 的 valve 中添加安全头

# 5. 使用非 root 用户运行（已配置 tomcat 用户）

# 6. 限制文件访问权限
chmod 400 /opt/tomcat/latest/conf/server.xml
chmod 400 /opt/tomcat/latest/conf/tomcat-users.xml
chmod 400 /opt/tomcat/latest/conf/*.p12

# 7. 定期更新 Tomcat 版本
# 关注 Apache Tomcat 安全公告
```

---

> **参考文档**：[中间件运维笔记索引](./index.md) | [Nginx 配置指南](./nginx.md)

---


---


---


---
