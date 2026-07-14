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
    details: 212 篇技术速查手册，15 个分类 — 编程语言、命令行、前端框架、AI 工具、快捷键… 随手翻，随时查

---

<script setup>
import RecentPosts from './.vitepress/theme/RecentPosts.vue'
</script>



## 速查手册

| 分类 | 篇数 | 内容 |
|:-----|:----:|:-----|
| **编程语言** | 31 | Python、Go、Rust、Java、TypeScript、Bash、C/C++ 等 |
| **前端框架** | 26 | Vue、React、CSS、Tailwind、HTML、jQuery 等 |
| **快捷键** | 26 | VSCode、IntelliJ IDEA、Chrome、Photoshop、Figma 等 |
| **工具** | 25 | Vim、OpenSSL、FFmpeg、Make、正则表达式 等 |
| **命令行** | 23 | curl、grep、sed、awk、tar、ssh、systemd、cron 等 |
| **参考** | 17 | HTTP 状态码、MIME 类型、Emoji、端口号、时区 等 |
| **Node.js** | 13 | npm、pnpm、yarn、NestJS、Express、PM2 等 |
| **AI 工具** | 9 | ChatGPT、Claude、Gemini、Grok、Cursor 等 |
| **数据库** | 8 | MySQL、Redis、MongoDB、PostgreSQL、SQLite 等 |
| **Git** | 8 | Git、GitHub、GitLab、GitHub CLI、Actions 等 |
| **Python** | 8 | Django、FastAPI、Flask、PyTorch、pip、conda 等 |
| **包管理器** | 8 | apt、yum、Homebrew、cargo、pacman、sdkman 等 |
| **Docker** | 4 | Docker、Dockerfile、Compose、Kubernetes |
| **配置格式** | 4 | JSON、YAML、TOML、INI |
| **网络设备** | 2 | 华为、Cisco 设备命令 |

[→ 进入速查手册](/quickref/)


<RecentPosts />