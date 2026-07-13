---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "小弥渡的运维笔记"
  tagline: 一个运维老兵的杂货铺 — 记不住的就查这里，用过的都整理好了
  actions:
    - theme: brand
      text: 开始阅读
      link: /linux/
    - theme: alt
      text: GitHub仓库
      link: https://github.com/SuLingYun/suzm-notes

features:
  - icon: 🐧
    title: Linux 运维
    details: 系统调优、故障排查、Shell 脚本 — 从 CentOS 到 Ubuntu，踩过坑的都记下了
  - icon: 🌐
    title: 网络与安全
    details: 防火墙策略、WAF 防护、堡垒机 — 网络设备玩了一圈，配置命令还是得翻笔记
  - icon: 🗄️
    title: 数据库
    details: MySQL 主从、Redis 缓存、MongoDB 查询 — 每种数据库都折腾过，但都不是专家
  - icon: 🔧
    title: 中间件
    details: Nginx 反向代理、Tomcat 调优、Kafka 消息队列 — 配置参数太多，记不住就查
  - icon: ☁️
    title: 云原生
    details: VMware 虚拟化、K8s 容器编排、混合云架构 — 技术一直在变，笔记永远跟得上
  - icon: 📖
    title: 速查手册
    details: 210+ 篇技术速查手册，覆盖 AI、编程、Docker、Git、数据库等 15 个分类 — 随手翻，随时查

---

<script setup>
import RecentPosts from './.vitepress/theme/RecentPosts.vue'
</script>



## 速查手册

十多年接触了太多技术，从 Linux 命令到 Kubernetes，从 Python 到 JavaScript，从 MySQL 到 Redis... 什么都用过，但细节总是记不住。这份速查手册就是我的"第二大脑"。

[进入速查手册](/quickref/)


<RecentPosts />