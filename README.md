# 小弥渡的运维笔记

> 一个运维老兵的杂货铺 — 记不住的就查这里，用过的都整理好了

[![VitePress](https://img.shields.io/badge/VitePress-1.6.4-646cff.svg)](https://vitepress.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/SuLingYun/suzm-notes/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/SuLingYun/suzm-notes/actions/workflows/deploy-pages.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/3685ef08-47b1-4543-89ec-a87016aaeed7/deploy-status)](https://app.netlify.com/projects/suzm-notes/deploys)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

---

## 在线访问

| 平台 | 地址 | 说明 |
|:-----|:-----|:-----|
| GitHub Pages | [https://sulingyun.github.io/suzm-notes/](https://sulingyun.github.io/suzm-notes/) | 自动部署 |
| Netlify | [https://suzm.cn](https://suzm.cn) | 自定义域名，自动 HTTPS |

---

## 项目简介

基于 [VitePress](https://vitepress.dev/) 构建的个人技术知识库，涵盖 **Linux 运维、网络与安全、数据库、中间件、云原生、自动化运维** 等领域的实践笔记，以及 **210+ 篇技术速查手册**。

- **运维笔记** — 实战经验与踩坑记录，7 个分类持续更新
- **速查手册** — 整理自 [jaywcjlove/reference](https://github.com/jaywcjlove/reference)（MIT 许可证），15 个分类 210+ 篇
- **全文搜索** — 本地模糊搜索，无需后端
- **响应式布局** — 桌面端与移动端自适应，支持明暗主题
- **双平台部署** — GitHub Pages + Netlify CI/CD 自动部署

---

## 快速开始

```bash
# 前置要求：Node.js >= 20

git clone https://github.com/SuLingYun/suzm-notes.git
cd suzm-notes
npm install
npm run docs:dev      # 本地开发（http://localhost:5173）
npm run docs:build    # 构建生产版本
npm run docs:preview  # 预览构建结果
```

| 命令 | 说明 |
|:-----|:-----|
| `npm run docs:dev` | 启动开发服务器，支持热更新 |
| `npm run docs:build` | 自动更新侧边栏 + 构建生产版本 |
| `npm run docs:preview` | 本地预览构建结果 |
| `npm run sidebar:update` | 手动更新侧边栏配置 |
| `npm run sidebar:check` | 查看当前所有文章清单 |

---

## 发布文章

1. 在对应分类目录（`docs/linux/`、`docs/network/` 等）创建 `.md` 文件，包含 frontmatter
2. 运行 `npm run sidebar:update` 自动更新侧边栏
3. 推送到 GitHub，Actions 自动构建部署

> `npm run docs:build` 会自动执行 `sidebar:update`，可跳过第二步。

---

## 项目结构

```
suzm-notes/
├── docs/
│   ├── .vitepress/          # 主题配置与自定义组件
│   ├── quickref/            # 速查手册（210+ 篇）
│   ├── linux/               # Linux 运维笔记
│   ├── network/             # 网络笔记
│   ├── database/            # 数据库笔记
│   ├── middleware/          # 中间件笔记
│   ├── cloud/               # 云平台笔记
│   ├── security/            # 安全笔记
│   ├── automation/          # 自动化运维笔记
│   ├── index.md             # 首页
│   └── about.md             # 关于页面
├── scripts/                 # 辅助脚本
├── .github/workflows/       # CI/CD 配置
├── package.json
└── README.md
```

---

## 许可证

[MIT License](LICENSE) — Copyright © 2026 小弥渡

- 运维笔记部分为个人原创，遵循 MIT 许可证
- 速查手册部分内容整理自 [jaywcjlove/reference](https://github.com/jaywcjlove/reference)（MIT 许可证），版权归原作者所有

---

## 联系方式

- **GitHub**：[@SuLingYun](https://github.com/SuLingYun)
- **邮箱**：suzhiming.cn@gmail.com
- **问题反馈**：[提交 Issue](https://github.com/SuLingYun/suzm-notes/issues)