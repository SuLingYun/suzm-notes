---
title: CentOS 7 中安装中文字体
date: 2026-07-20
description: CentOS 7 系统下安装中文字体的完整步骤，包括 fontconfig 安装、字体上传、缓存刷新等
tags: [centos, linux, 字体]
---

# CentOS 7 中安装中文字体

## 1. 安装 fontconfig 字体配置库

```bash
yum -y install fontconfig
```

## 2. 创建中文字体目录

```bash
cd /usr/share/fonts
mkdir chinese
```

## 3. 上传字体文件到指定目录

将 `simhei.ttf`（黑体）和 `simsun.ttc`（宋体）从 Windows 系统的 `C:\Windows\fonts` 目录中复制到 `/usr/share/fonts/chinese/`

```bash
cp /tmp/simhei.ttf /usr/share/fonts/chinese/
cp /tmp/simsun.ttc /usr/share/fonts/chinese/
```

## 4. 修改字体目录权限

```bash
chmod -R 755 /usr/share/fonts/chinese
```

## 5. 安装 ttmkfdir 工具

```bash
yum -y install ttmkfdir
```

## 6. 更新字体目录

```bash
ttmkfdir -e /usr/share/X11/fonts/encodings/encodings.dir
```

## 7. 修改字体配置文件

打开 `/etc/fonts/fonts.conf` 文件，在 `<dir>~/.fonts</dir>` 上方添加新的字体目录

```bash
echo '<dir>/usr/share/fonts/chinese</dir>' >> /etc/fonts/fonts.conf
```

## 8. 刷新字体缓存

```bash
fc-cache
```

## 9. 验证字体是否安装成功

```bash
fc-list
```