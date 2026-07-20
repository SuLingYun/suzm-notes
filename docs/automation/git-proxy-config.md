---
title: Git 代理配置完整流程
date: 2026-07-20
description: 通过 Git 全局配置设置镜像代理，解决 GitHub 访问慢、克隆失败等网络问题的完整方案
tags: [git, 代理, 镜像, 网络]
---

# Git 代理配置完整流程

## 一、配置代理

在 PowerShell 或 CMD 中执行以下命令：

```bash
git config --global url."https://git.221022.xyz/https://github.com/".insteadOf "https://github.com/"
```

## 二、验证配置

```bash
# 查看配置是否写入
git config --global url."https://git.221022.xyz/https://github.com/".insteadOf

# 查看完整配置文件
type "%USERPROFILE%\.gitconfig"
```

## 三、测试代理是否生效

```bash
git clone --depth 1 https://github.com/vercel-labs/skills.git test-proxy
```

如果克隆成功（显示进度条），说明代理配置生效。

## 四、清理测试文件

```bash
rmdir /s /q test-proxy
```

## 五、代理工作原理

```
你输入:  git clone https://github.com/xxx/yyy.git
               ↓
Git 自动重写为: https://git.221022.xyz/https://github.com/xxx/yyy.git
               ↓
通过镜像代理访问 GitHub，解决网络问题
```

配置一次永久生效，以后所有 git clone/fetch/pull 等操作都会自动走代理。

## 六、注意事项

1. 所有 URL 直接写纯文本，不要加反引号
2. 测试克隆时目录名不能重复
3. 如果配置错了，可以用以下命令删除：

```bash
git config --global --unset url."https://git.221022.xyz/https://github.com/".insteadOf
```

4. 或者直接编辑配置文件：`notepad "%USERPROFILE%\.gitconfig"`