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

全文搜索由 [Algolia DocSearch](https://docsearch.algolia.com/) 提供支持，搜索即用，无需加载本地索引。

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
4. Algolia DocSearch 爬虫每天自动爬取一次，更新搜索索引

> 本地预览：`npm install && npm run docs:dev`（Node.js >= 20）

## 自动化机制

| 环节 | 方式 | 说明 |
|:-----|:-----|:-----|
| 侧边栏 | 自动生成 | `scripts/update-sidebar.py` 扫描目录，自动更新 `config.ts` |
| 文章统计 | 构建时自动计算 | `posts.data.ts` 构建时扫描 MD 文件，首页实时显示分类文章数 |
| 构建部署 | CI/CD 自动触发 | GitHub Actions + Netlify 双平台自动部署 |
| 全文搜索 | Algolia DocSearch | 云端搜索，无需加载本地索引，支持模糊搜索与中文分词 |

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

## 配置 Algolia DocSearch（参考）

本站使用 [Algolia DocSearch](https://docsearch.algolia.com/) 提供全文搜索。如果你也想为自己的 VitePress 站点配置，可参考以下步骤。

### 1. 注册 Algolia 账号

访问 [algolia.com](https://www.algolia.com/)，使用 GitHub 账号登录，创建一个 Application。

### 2. 配置 DocSearch Crawler

在 Algolia 控制台左侧菜单点击 **DocSearch** → **Crawler**，进入爬虫配置界面：

```javascript
new Crawler({
  appId: "YOUR_APP_ID",
  indexPrefix: "your-prefix",
  rateLimit: 8,
  maxDepth: 10,
  schedule: "every 1 day",            // 每天自动爬取一次
  startUrls: ["https://your-site.com"],
  renderJavaScript: false,             // VitePress 是静态站点，无需 JS 渲染
  sitemaps: [],                        // 可选：配置 sitemap 加速爬取
  discoveryPatterns: ["https://your-site.com/**"],
  actions: [
    {
      indexName: "your-index",         // 实际索引名 = indexPrefix + indexName
      pathsToMatch: ["https://your-site.com/**"],
      recordExtractor: ({ helpers }) => {
        return helpers.docsearch({
          recordProps: {
            lvl0: { selectors: "", defaultValue: "文档" },
            lvl1: ".vp-doc h1",
            lvl2: ".vp-doc h2",
            lvl3: ".vp-doc h3",
            lvl4: ".vp-doc h4",
            lvl5: ".vp-doc h5",
            content: ".vp-doc p, .vp-doc li, .vp-doc td, .vp-doc code",
          },
          aggregateContent: true,
          recordVersion: "v3",
        });
      },
    },
  ],
  initialIndexSettings: {
    "your-index": {
      searchableAttributes: [
        "unordered(hierarchy.lvl0)",
        "unordered(hierarchy.lvl1)",
        "unordered(hierarchy.lvl2)",
        "unordered(hierarchy.lvl3)",
        "unordered(hierarchy.lvl4)",
        "unordered(hierarchy.lvl5)",
        "content",
      ],
      attributesToHighlight: ["hierarchy", "content"],
      attributesToSnippet: ["content:10"],
    },
  },
});
```

> **注意**：VitePress 站点的内容选择器应使用 `.vp-doc` 前缀（如 `.vp-doc h1`），而非 `.content`。上面示例已修正为 VitePress 标准选择器。如果你的爬虫已使用 `.content` 运行且正常，也可保留。

### 3. 获取 API Key

在 Algolia 控制台 → **Settings** → **API Keys** 获取以下 Key：

| Key | 用途 | 说明 |
|:----|:-----|:-----|
| Application ID | 应用标识 | 用于前端和后端识别应用 |
| Search API Key | 前端搜索 | **公开的**，放在 `config.ts` 中 |
| Admin API Key | 爬虫认证 | **私有的**，放在 Crawler 配置的 `apiKey` 字段 |

### 4. 修改 VitePress 配置

在 `docs/.vitepress/config.ts` 中将搜索 provider 从 `local` 切换为 `algolia`：

```ts
search: {
  provider: 'algolia',
  options: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_API_KEY',
    indexName: 'YOUR_INDEX_NAME',   // 实际索引名 = indexPrefix + indexName
  },
},
```

### 5. 运行爬虫

在 Crawler 配置页面点击 **Start Crawling**，等待爬取完成（通常需要 1-5 分钟，取决于站点大小）。爬虫会按 `schedule` 配置的频率自动运行，无需手动触发。

## 许可证

[MIT License](LICENSE) — Copyright © 2026 小弥渡

- 运维笔记部分为个人原创，遵循 MIT 许可证
- 速查手册部分内容整理自 [jaywcjlove/reference](https://github.com/jaywcjlove/reference)（MIT 许可证），版权归原作者所有

## 联系

- **GitHub**：[@SuLingYun](https://github.com/SuLingYun)
- **邮箱**：suzhiming.cn@gmail.com
- **问题反馈**：[提交 Issue](https://github.com/SuLingYun/suzm-notes/issues)