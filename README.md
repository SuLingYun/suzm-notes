# 小弥渡的运维笔记

> 一个运维老兵的杂货铺 — 记不住的就查这里，用过的都整理好了

[![VitePress](https://img.shields.io/badge/VitePress-1.6.4-646cff.svg)](https://vitepress.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/SuLingYun/suzm-notes/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/SuLingYun/suzm-notes/actions/workflows/deploy-pages.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/ae4d9388-236e-4de9-9f62-1ce36ae46173/deploy-status)](https://app.netlify.com/projects/xiaomidu/deploys)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

## 在线访问

| 平台 | 地址 | 说明 |
|:-----|:-----|:-----|
| GitHub Pages | [sulingyun.github.io/suzm-notes](https://sulingyun.github.io/suzm-notes/) | 自动部署 |
| Netlify | [suzm.cn](https://suzm.cn) | 自定义域名，自动 HTTPS |

## 项目简介

基于 [VitePress](https://vitepress.dev/) 构建的个人技术知识库，涵盖 **Linux 运维、网络与安全、数据库、中间件、云原生、自动化运维** 等领域的实践笔记，以及 **210+ 篇技术速查手册**。

## 如何发布文章

只需在对应分类目录创建 `.md` 文件（需包含 `title` 和 `date` 的 frontmatter），然后推送到 GitHub 即可：

```bash
# 1. 创建文章
echo '---
title: 我的新文章
date: 2026-07-17
---

# 文章内容' > docs/linux/my-new-post.md

# 2. 推送到 GitHub（自动触发构建部署）
git add docs/linux/my-new-post.md
git commit -m "docs: 新增 Linux 文章"
git push
```

推送后，GitHub Actions 会自动执行：
1. 运行 `update-sidebar.py` 脚本 → 自动更新侧边栏配置
2. 构建 VitePress 静态站点
3. 部署到 GitHub Pages（Netlify 同步部署）

> 本地预览：`npm install && npm run docs:dev`（Node.js >= 20）

## 自动化机制

| 环节 | 方式 | 说明 |
|:-----|:-----|:-----|
| 侧边栏 | 自动生成 | `scripts/update-sidebar.py` 扫描目录，自动更新 `config.ts` |
| 文章统计 | 构建时自动计算 | `posts.data.ts` 构建时扫描 MD 文件，首页实时显示分类文章数 |
| 构建部署 | CI/CD 自动触发 | GitHub Actions + Netlify 双平台自动部署 |
| 全文搜索 | 本地模糊搜索 | 基于 MiniSearch，无需后端服务 |

## 项目结构

```
suzm-notes/
├── docs/
│   ├── .vitepress/          # 主题配置与自定义组件
│   ├── quickref/            # 速查手册（210+ 篇，15 个分类）
│   ├── linux/               # Linux 运维笔记
│   ├── network/             # 网络笔记
│   ├── database/            # 数据库笔记
│   ├── middleware/          # 中间件笔记
│   ├── cloud/               # 云平台笔记
│   ├── security/            # 安全笔记
│   ├── automation/          # 自动化运维笔记
│   ├── notes/               # 笔记概览页
│   ├── index.md             # 首页
│   └── about.md             # 关于页面
├── scripts/                 # 辅助脚本
├── .github/workflows/       # CI/CD 配置
└── package.json
```

## 许可证

[MIT License](LICENSE) — Copyright © 2026 小弥渡

- 运维笔记部分为个人原创，遵循 MIT 许可证
- 速查手册部分内容整理自 [jaywcjlove/reference](https://github.com/jaywcjlove/reference)（MIT 许可证），版权归原作者所有

## 联系

- **GitHub**：[@SuLingYun](https://github.com/SuLingYun)
- **邮箱**：suzhiming.cn@gmail.com
- **问题反馈**：[提交 Issue](https://github.com/SuLingYun/suzm-notes/issues)