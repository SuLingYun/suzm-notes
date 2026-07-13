# 小弥渡的运维笔记

> 一个运维老兵的杂货铺 — 记不住的就查这里，用过的都整理好了

[![VitePress](https://img.shields.io/badge/VitePress-1.6.4-646cff.svg)](https://vitepress.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-在线访问-success.svg)](https://sulingyun.github.io/suzm-notes/)
[![Netlify](https://img.shields.io/badge/Netlify-自动部署-00C7B7.svg)](https://app.netlify.com/sites/suzm-notes/deploys)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

---

## 在线访问

| 平台 | 地址 | 说明 |
|:-----|:-----|:-----|
| GitHub Pages | [https://sulingyun.github.io/suzm-notes/](https://sulingyun.github.io/suzm-notes/) | 自动部署，base 路径为 `/suzm-notes/` |
| Netlify | [https://suzm.cn](https://suzm.cn) | 自定义域名，自动 HTTPS |

---

## 项目简介

**小弥渡的运维笔记** 是一个基于 [VitePress](https://vitepress.dev/) 构建的个人技术知识库与速查手册集合。内容涵盖 Linux 运维、网络与安全、数据库、中间件、云原生、自动化运维等领域的实践笔记，以及基于开源项目整理的 **210+ 篇技术速查手册**。

### 双核心内容体系

| 模块 | 内容 | 规模 |
|:-----|:-----|:-----|
| **运维笔记** | Linux 运维、网络与安全、数据库、中间件、云平台、自动化运维等领域的实战经验与踩坑记录 | 7 个分类，持续更新 |
| **速查手册** | 基于 [jaywcjlove/reference](https://github.com/jaywcjlove/reference)（MIT 许可证）整理的中文技术速查手册 | 210+ 篇，15 个分类 |

### 站点功能

- **全文搜索** — 基于 VitePress 内置的 MiniSearch 本地模糊搜索，无需后端服务
- **响应式布局** — 桌面端与移动端自适应，支持明暗主题切换
- **最近更新** — 首页展示最近更新的文章，按时间倒序排列
- **分类导航** — 侧边栏按技术领域分类，支持折叠展开
- **赞赏支持** — 页面底部集成微信赞赏功能
- **双平台部署** — 同时支持 GitHub Pages 和 Netlify 部署，自动适配 base 路径
- **CI/CD 自动化** — GitHub Actions 自动构建与部署，推送即发布

---

## 速查手册

速查手册章节共收录 **210+ 篇**技术文档，按 **15 个分类**组织：

| 分类 | 包含内容 |
|:-----|:----------|
| AI | ai-tools, chatgpt, claude, codex-cli, cursor-cli, gemini-cli, gemma4, grok, grok-cli |
| 编程语言与框架 | bash, c, cpp, cs, dart, elixir, erlang, flutter, golang, graphql, hook, java, javascript, julia, kotlin, laravel, latex, lua, matlab, nix, php, powershell, python, r, ruby, rust, scala, springboot, swift, swiftui, typescript |
| Docker 与容器 | docker, docker-compose, dockerfile, kubernetes |
| 配置格式 | ini, json, toml, yaml |
| 前端开发 | canvas, css, electron, emmet, es6, feds, html, htmx, jquery, leaf, lessjs, nextjs, pinia, react, react-native, reactrouter, rxjs, sass, styled-components, stylex, stylus, tailwindcss, tauri, vue, vue2, wails |
| Node.js 生态 | bun, ejs, expressjs, jest, koajs, lerna, nestjs, npm, nvm, package.json, pm2, pnpm, yarn |
| Python 生态 | conda, django, fastapi, flask, jupyter, pip, pytorch, uv |
| Linux 与命令行 | 7zip, adb, ansible, awk, chmod, chown, cmd, cron, curl, dotnet-cli, find, grep, iptables, jq, netstat, screen, sed, ssh, systemd, tar, taskset, tmux, zip |
| 工具与编辑器 | cmake, emacs, ffmpeg, ftp, gdb, glances, htop, justfile, linux-command, lsof, make, markdown, minio, mitmproxy, netcat, nginx, openssl, pandoc, ps, regex, sysdig, vim, vscode, xpath, yazi |
| 软件包管理器 | apt, cargo, cocoapods, conan, homebrew, pacman, sdkman, yum |
| Git 与协作 | git, github, github-actions, github-cli, github-copilot, gitlab, gitlab-ci, subversion |
| 数据库与搜索 | elasticsearch, mongodb, mysql, neo4j, oracle, postgres, redis, sqlite |
| 网络设备 | cisco-devices, huawei-devices |
| 快捷键 | adobe-ae, adobe-illustrator, adobe-lightroom, adobe-photoshop, adobe-pr, adobe-xd, android-studio, blender, coreldraw, figma, finder, firefox, gitlab-shortcuts, gmail, google-chrome, intelli-j-idea, phpstorm, pycharm, sketch, sublime-text, twitter, vimium, vscode-shortcuts, webstorm, xcode, zed |
| 常用对照表 | ascii-code, aspect-ratio, colors-named, emoji, excel-fn, google-search, html-char, http-status-code, iso-3166-1, iso-639-1, mime, ports, quickreference, resolutions, semver, symbol-code, time-zones |

> 内容来源：本速查手册整理自 [jaywcjlove/reference](https://github.com/jaywcjlove/reference) 开源项目（MIT 许可证），已对内容进行格式适配与整理，版权归原作者所有。

---

## 技术栈

| 层级 | 技术选型 | 说明 |
|:-----|:----------|:-----|
| **框架** | [VitePress](https://vitepress.dev/) 1.6.x | 基于 Vite + Vue 的静态站点生成器 |
| **前端** | Vue 3.5 + TypeScript | 自定义组件与主题开发 |
| **构建工具** | Vite 6.x | 极速开发体验与优化构建 |
| **搜索** | VitePress Local Search | 基于 MiniSearch 的本地全文搜索 |
| **部署** | GitHub Pages + Netlify | 双平台 CI/CD 自动部署 |
| **运行时** | Node.js >= 20 | 现代 JavaScript 运行时 |

---

## 快速开始

### 前置要求

- Node.js >= 20
- npm >= 9

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/SuLingYun/suzm-notes.git
cd suzm-notes

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run docs:dev

# 构建静态文件
npm run docs:build

# 预览构建结果
npm run docs:preview
```

### 可用脚本

| 命令 | 说明 |
|:-----|:-----|
| `npm run docs:dev` | 启动开发服务器，支持热更新 |
| `npm run docs:build` | 自动更新侧边栏配置 + 构建生产版本静态文件 |
| `npm run docs:preview` | 本地预览构建结果 |
| `npm run sidebar:update` | 手动更新侧边栏配置（新增文章后运行） |
| `npm run sidebar:check` | 查看当前所有文章清单 |

---

## 发布文章

> 侧边栏配置已改为手动维护，但提供了自动化脚本简化操作。

### 第一步：创建文章文件

在对应分类目录下创建 `.md` 文件，必须包含 frontmatter：

```markdown
---
title: 文章标题
date: 2026-07-13
description: 文章简短描述
---

# 文章标题

正文内容...
```

| 分类 | 目录 |
|:-----|:-----|
| **Linux 运维** | `docs/linux/` |
| **网络** | `docs/network/` |
| **数据库** | `docs/database/` |
| **中间件** | `docs/middleware/` |
| **云平台** | `docs/cloud/` |
| **安全** | `docs/security/` |
| **自动化运维** | `docs/automation/` |

### 第二步：一键更新侧边栏

```bash
npm run sidebar:update
```

该命令会自动扫描所有分类目录，读取每篇文章的 `title`，更新侧边栏配置。

### 第三步：推送到 GitHub

```bash
# 本地预览（可选）
npm run docs:dev

# 或直接构建验证
npm run docs:build

# 推送到 GitHub 自动部署
git add -A
git commit -m "新增文章：xxx"
git push
```

推送后，GitHub Actions 会自动执行构建和部署，几分钟后即可看到更新。

> **提示**：`npm run docs:build` 会自动先执行 `sidebar:update` 再构建，所以如果你只构建不预览，可以跳过第二步直接运行 `npm run docs:build`。

---

## 双平台部署说明

项目通过 `config.ts` 中的环境变量自动适配不同部署环境的 base 路径：

| 环境 | 检测方式 | base 路径 | 访问地址 |
|:-----|:----------|:-----------|:----------|
| 本地开发 | `!process.env.BASE_PATH` | `/` | `http://localhost:5173/` |
| Netlify | `process.env.NETLIFY` | `/` | `https://suzm.cn/` |
| GitHub Pages | `process.env.BASE_PATH` | `/suzm-notes/` | `https://sulingyun.github.io/suzm-notes/` |

GitHub Actions 部署时通过 `actions/configure-pages@v4` 自动注入 `BASE_PATH` 环境变量，无需手动配置。

---

## 项目结构

```
suzm-notes/
├── docs/
│   ├── .vitepress/
│   │   ├── config.ts                 # VitePress 核心配置
│   │   └── theme/
│   │       ├── index.ts              # 主题入口
│   │       ├── Donation.vue          # 微信赞赏组件
│   │       ├── FloatingTools.vue     # 浮动工具（主题切换 + 返回顶部）
│   │       ├── RecentPosts.vue       # 首页最近更新组件
│   │       ├── posts.data.ts         # 文章数据加载器
│   │       └── custom.css           # 自定义主题样式
│   ├── index.md                      # 首页
│   ├── about.md                      # 关于页面
│   ├── public/
│   │   ├── logo.svg                  # 站点图标
│   │   └── wechat-qr.png             # 微信赞赏二维码
│   ├── quickref/                     # 速查手册（210+ 篇，15 个分类）
│   ├── linux/                        # Linux 运维笔记
│   ├── network/                      # 网络笔记
│   ├── database/                     # 数据库笔记
│   ├── middleware/                   # 中间件笔记
│   ├── cloud/                        # 云平台笔记
│   ├── security/                     # 安全笔记
│   └── automation/                   # 自动化运维笔记
├── scripts/
│   └── update-sidebar.py            # 侧边栏自动生成脚本
├── .github/workflows/
│   └── deploy-pages.yml             # GitHub Actions 部署工作流
├── netlify.toml                      # Netlify 部署配置
├── package.json
├── README.md
└── LICENSE
```

---

## 赞助支持

如果这个项目对你有帮助，欢迎请作者喝杯咖啡 ☕

<table>
  <tr>
    <td align="center">
      <img src="docs/public/wechat-qr.png" width="200" alt="微信赞赏码">
      <br>
      <b>微信赞赏</b>
    </td>
  </tr>
</table>

---

## 许可证

[MIT License](LICENSE) — Copyright © 2026 小弥渡

- 运维笔记部分内容为个人原创，遵循 MIT 许可证
- 速查手册部分内容整理自 [jaywcjlove/reference](https://github.com/jaywcjlove/reference)（MIT 许可证），版权归原作者所有

---

## 联系方式

- **GitHub**：[@SuLingYun](https://github.com/SuLingYun)
- **项目仓库**：[SuLingYun/suzm-notes](https://github.com/SuLingYun/suzm-notes)
- **邮箱**：suzhiming.cn@gmail.com
- **问题反馈**：[提交 Issue](https://github.com/SuLingYun/suzm-notes/issues)
