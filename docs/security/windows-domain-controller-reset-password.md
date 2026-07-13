---
title: Windows Server 域控制器重置管理员密码
date: 2026-07-13
description: VMware 虚拟机环境下，通过挂载系统 ISO 镜像进入恢复环境，绕过 Windows 登录直接重置域控制器管理员密码的完整操作步骤
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Windows Server 域控制器重置管理员密码

### 1、VMware 虚拟机挂载系统 ISO 镜像

将 Windows Server 安装 ISO 镜像挂载到虚拟机的 CD/DVD 光驱中。

### 2、设置从镜像启动

进入虚拟机 BIOS 设置，将引导顺序调整为从 CD/DVD 光驱启动。

<img :src="withBase('/images/bf34b72ee99e448838435bc93fcc54f0.png')" alt="截图" />

### 3、安装如下进入镜像命令提示 CMD 符界面

在安装界面选择"修复计算机"→"疑难解答"→"命令提示符"，进入系统恢复环境的 CMD 界面。

<img :src="withBase('/images/ecb50cfcf8e8af823ea0e49eae66e021.png')" alt="截图" />

<img :src="withBase('/images/3b2b9a0f0bc45d50c1642179dca736ea.png')" alt="截图" />

<img :src="withBase('/images/577c9d0258d78296263e6f4215c34205.png')" alt="截图" />

<img :src="withBase('/images/7c731db0d335578a1ac86da8f4f0e8e5.png')" alt="截图" />

### 4、注意查看原有系统挂载到哪个盘符下

在 CMD 中执行 `dir` 命令查看各盘符，确认原系统的 Windows 目录所在盘符（通常为 D: 或 E: 等，而非当前恢复环境的 X:）。

### 5、进入原有系统的 cd D:\Windows\System32 目录

```batch
D:
cd Windows\System32
```

### 6、替换屏幕键盘程序为 CMD

将 `osk.exe`（屏幕键盘）重命名为 `osk1.exe`，再将 `cmd.exe` 复制/重命名为 `osk.exe`。重启后点击屏幕键盘图标即可弹出 CMD 窗口（以 SYSTEM 权限运行）。

```batch
ren osk.exe osk1.exe
ren cmd.exe osk.exe
```

<img :src="withBase('/images/4e459b0f620157ac99568effba43a1b6.png')" alt="截图" />

### 7、退出安装程序从硬盘重新引导系统

关闭 CMD 窗口，退出安装程序，取出 ISO 镜像，从硬盘重新启动。

<img :src="withBase('/images/2951939963402d201792bb2f9cd15d49.png')" alt="截图" />

### 8、执行 net user 命令重置密码

系统启动到登录界面时，点击右下角的"轻松使用"图标（屏幕键盘），此时弹出的是 CMD 窗口而非屏幕键盘。执行以下命令重置管理员密码：

```batch
net user administrator A1qazxsw2!@#$%^
```

<img :src="withBase('/images/b852fc24466367ebb19c346cb507c3e1.png')" alt="截图" />

### 9、恢复原程序名称

密码重置完成后，按照之前的步骤再次进入 CMD 恢复环境，将程序名称改回来：

```batch
ren osk.exe cmd.exe
ren osk1.exe osk.exe
```

重启后即可使用新密码登录系统。