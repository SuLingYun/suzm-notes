---
title: GmSSL v2 CSR 生成完整流程
date: 2026-07-20
description: 使用 GmSSL v2 国密算法生成 SM2 密钥对和证书签名请求（CSR）的完整流程，用于腾讯云 E 证通
tags: [安全, 国密, SM2, SSL, 证书]
---

# GmSSL v2 CSR 生成完整流程

用途：为腾讯云 E 证通生成证书签名请求（CSR）

## 1. 编译安装 GmSSL

```bash
# 克隆 GmSSL v2 源码
git clone -b GmSSL-v2 https://github.com/guanzhi/GmSSL.git
cd GmSSL

# 编译安装
./config
make
make install
```

## 2. 设置环境变量

```bash
export LD_LIBRARY_PATH="/root/GmSSL:$LD_LIBRARY_PATH"
```

## 3. 验证安装

```bash
gmssl version -a
```

## 4. 生成 SM2 密钥对

```bash
# 生成私钥文件
gmssl ecparam -genkey -name sm2p256v1 -out CAkey.pem

# 查看私钥内容（务必保存！）
gmssl pkey -in CAkey.pem -noout -text
```

## 5. 生成 CSR

```bash
# 执行后会提示输入公司信息，按需填写
gmssl req -utf8 -new -sm3 -key CAkey.pem -out CAcsr.pem

# 查看 CSR 内容
gmssl req -in CAcsr.pem -noout -text -subject
```

## 生成的关键文件

| 文件 | 说明 | 用途 |
|------|------|------|
| `CAkey.pem` | 私钥文件 | 自己保存，用于解密（绝对保密！） |
| `CAcsr.pem` | CSR 文件 | 上传到腾讯云控制台 |

## 上传地址

腾讯云 E 证通控制台：https://console.cloud.tencent.com/faceid/eid

操作步骤：**自助接入 → E 证通服务 → 申请返回身份信息**