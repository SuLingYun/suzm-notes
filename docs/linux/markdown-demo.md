---
title: Markdown 排版演示
description: 演示图文结合、代码框、提示框、表格、折叠区块等 Markdown 高级排版效果
date: 2026-07-09
tags:
  - Markdown
  - 排版
  - 教程
---

# Markdown 排版演示

这篇文章演示了 VitePress 支持的所有常用排版元素，你可以参考它来写自己的文章。

## 一、文本样式

**加粗文本**、*斜体文本*、~~删除线~~、`行内代码`、==高亮文本==

> 这是引用块，常用于强调重要内容或引用他人观点。

### 不同级别的标题

依次是 H1 → H6，根据文章层级自动生成目录大纲。

## 二、代码框

### 2.1 普通代码块

```bash
# 这是一段 Shell 脚本
systemctl start nginx
systemctl enable nginx
nginx -t
```

### 2.2 带行高亮的代码

```bash{3,5-7}
#!/bin/bash
# Nginx 部署脚本
yum install nginx -y        # 这行会被高亮

# 下面这几行也会被高亮
systemctl start nginx
systemctl enable nginx
firewall-cmd --add-service=http --permanent
firewall-cmd --reload
```

### 2.3 不同语言代码

```python
# Python 代码
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print([fibonacci(i) for i in range(10)])
```

```yaml
# YAML 配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
```

```sql
-- SQL 查询
SELECT 
    user_id,
    username,
    COUNT(*) AS login_count
FROM user_login_log
WHERE login_time >= '2026-01-01'
GROUP BY user_id, username
HAVING login_count > 100
ORDER BY login_count DESC;
```

## 三、图片

### 3.1 本地图片（放在 public 目录）

![Nginx 架构图](/demo-architecture.svg)

### 3.2 带说明文字的图片

<figure>
  <img src="/demo-mysql-replication.svg" alt="MySQL 主从复制" style="max-width: 600px; margin: 0 auto; display: block;">
  <figcaption style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px;">图 1：MySQL 主从复制架构示意图</figcaption>
</figure>

### 3.3 外部图片

![VitePress Logo](https://vitepress.dev/logo.svg)

## 四、表格

### 4.1 普通表格

| 命令 | 用途 | 示例 |
|------|------|------|
| `ls` | 列出目录 | `ls -la` |
| `cd` | 切换目录 | `cd /etc` |
| `cp` | 复制文件 | `cp -r src dest` |
| `mv` | 移动/重命名 | `mv old new` |
| `rm` | 删除文件 | `rm -rf dir` |

### 4.2 对齐方式

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 左 | 中 | 右 |
| Left | Center | Right |

## 五、提示框（自定义容器）

::: info 信息
这是一个信息提示框，用于补充说明。
:::

::: tip 提示
这是一个提示框，用于给出小技巧。
:::

::: warning 警告
这是一个警告框，用于提醒注意事项。
:::

::: danger 危险
这是一个危险警告框，用于强调严重风险。
:::

::: details 点击展开详情
这是折叠的内容，默认收起，点击标题可以展开。

```bash
# 折叠区域里也可以放代码
echo "Hello, World!"
```

也可以放普通文本、列表等。
:::

## 六、列表

### 6.1 无序列表

- 第一项
- 第二项
  - 嵌套项 A
  - 嵌套项 B
    - 更深的嵌套
- 第三项

### 6.2 有序列表

1. 第一步：安装依赖
2. 第二步：编译项目
3. 第三步：启动服务
4. 第四步：验证测试

### 6.3 任务列表

- [x] 已完成的任务
- [x] 安装 Nginx
- [x] 配置 SSL
- [ ] 未完成的任务
- [ ] 配置负载均衡
- [ ] 添加监控告警

## 七、引用与链接

### 7.1 普通链接

访问 [VitePress 官网](https://vitepress.dev) 查看完整文档。

### 7.2 自动链接

https://github.com/SuLingYun/suzm-notes

### 7.3 引用风格链接

这是 [GitHub 仓库][1] 的链接，也可以用 [官网][2]。

[1]: https://github.com/SuLingYun/suzm-notes
[2]: https://vitepress.dev

## 八、Emoji 表情

:rocket: :fire: :tada: :100: :heavy_check_mark: :x: :warning: :bulb: :book: :gear:

## 九、数学公式（KaTeX）

行内公式：$E = mc^2$

块级公式：

$$
\frac{n!}{k!(n-k)!} = \binom{n}{k}
$$

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 十、分割线

---

以上是常用排版元素的演示。

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
