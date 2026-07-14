---
title: Linux systemd 服务管理添加
date: 2026-07-13
description: Linux 系统下使用 systemd 管理自定义服务，以 frps 为例演示 service 文件编写、启动停止、开机自启配置等完整操作
tags: [linux, systemd, 服务管理, frp]
---

# systemd 管理添加

在 Linux 系统下，使用 `systemd` 可以方便地控制 frp 服务端 `frps` 的启动和停止、配置后台运行和开启自启。

要使用 `systemd` 来控制 `frps`，需要先安装 `systemd`，然后在 `/etc/systemd/system` 目录下创建一个 frps.service 文件。

1. 如 Linux 服务端上没有安装 `systemd`，可以使用 `yum` 或 `apt` 等命令安装 `systemd`。
   ```sh
   # yum
   yum install systemd
   # apt
   apt install systemd
   ```
2. 使用文本编辑器，如 `vim` 创建并编辑 `frps.service` 文件。
   ```sh
   $ vim /etc/systemd/system/frps.service
   ```
   
    写入内容
   ```ini
   [Unit]
   # 服务名称，可自定义
   Description = frp server
   After = network.target syslog.target
   Wants = network.target
   
   [Service]
   Type = simple
   # 启动frps的命令，需修改为您的frps的安装路径
   ExecStart = /path/to/frps -c /path/to/frps.ini
   
   [Install]
   WantedBy = multi-user.target
   ```
3. 使用 `systemd` 命令，管理 frps。
   ```sh
   # 启动frp
   systemctl start frps
   # 停止frp
   systemctl stop frps
   # 重启frp
   systemctl restart frps
   # 查看frp状态
   systemctl status frps
   ```
4. 配置 frps 开机自启。
   ```sh
   systemctl enable frps
   ```