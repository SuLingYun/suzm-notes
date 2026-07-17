---
title: 中间件运维笔记
description: 中间件运维相关技术笔记
---

<script setup>
import CategoryNav from '../.vitepress/theme/CategoryNav.vue'
</script>

<CategoryNav current="middleware" />

# 中间件运维笔记

本目录汇总了中间件相关的运维笔记，涵盖 Nginx、Tomcat 等常用中间件的安装部署、配置优化、性能调优及故障处理等实践内容。

## 涵盖内容

- **Nginx**：反向代理、负载均衡、安全升级、高可用
- **Tomcat**：部署优化、性能调优、JVM 配置
- **Docker**：容器管理、Docker Compose 编排、全场景命令手册

## 中间件运维要点

### Nginx

- 修改配置后务必使用 `nginx -t` 检查语法
- 使用 `nginx -s reload` 实现配置热加载
- 关注 `active connections` 和 `waiting` 状态

### Tomcat

- 根据应用需求合理配置 JVM 堆内存和 GC 策略
- 根据并发量调整 maxThreads、acceptCount 等参数
- 配置 catalina.out 日志轮转，避免单文件过大

## 端口速查表

| 中间件 | 默认端口 | 说明 |
|--------|----------|------|
| Nginx HTTP | 80 | HTTP 默认端口 |
| Nginx HTTPS | 443 | HTTPS 默认端口 |
| Tomcat HTTP | 8080 | 默认 HTTP 连接器 |
| Tomcat AJP | 8009 | AJP 连接器 |
| Tomcat Shutdown | 8005 | 关闭端口 |

> 持续更新中。