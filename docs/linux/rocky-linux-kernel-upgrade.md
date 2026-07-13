---
title: Rocky Linux 9.7 使用清华大学 ELRepo 源升级内核完整流程
date: 2026-07-13
description: Rocky Linux 9.7 使用 ELRepo + 清华大学镜像源升级内核的完整操作笔记，涵盖备份、安装、配置、验证及常见问题处理
tags: [linux, rocky-linux, kernel, elrepo, 内核升级]
---

# Rocky Linux 9.7 使用清华大学 ELRepo 源升级内核完整流程

---

## 一、文档说明

### 1.1 系统环境

- **操作系统**：Rocky Linux 9.7
- **系统架构**：x86_64
- **当前内核版本**：5.14.0-x.x.el9.x86_64（Rocky Linux 9默认内核）
- **安装方式**：DNF 包管理器安装

### 1.2 升级方案

使用 **清华大学 ELRepo 镜像源** 升级内核，这是最快、最稳定的方式。

### 1.3 内核版本选择

|版本类型|说明|适用场景|
|--|--|--|
|**kernel-lt**|Long Term（长期支持版本），更稳定，bug少|✅ **生产环境推荐**|
|**kernel-ml**|Main Line（主线最新版本），包含最新功能|测试环境、尝鲜|

**生产环境建议使用 kernel-lt（长期支持版）**

---

## 二、升级前准备工作

### 2.1 准备工作检查清单

```sh
echo "=== 升级前检查清单 ==="

echo "1. 检查系统版本："
cat /etc/rocky-release

echo "2. 检查当前内核版本："
uname -r

echo "3. 检查系统架构："
uname -m

echo "4. 检查磁盘空间："
df -h

echo "5. 检查当前已安装的内核："
rpm -qa | grep kernel | sort
```

### 2.2 必须备份的内容

**升级内核是高风险操作！必须做好完整备份！**

```sh
# 1. 创建备份目录
mkdir -p /root/kernel-upgrade-backup-$(date +%Y%m%d)

# 2. 备份 /etc 目录（系统配置）
tar -czvf /root/kernel-upgrade-backup-$(date +%Y%m%d)/etc-backup.tar.gz /etc

# 3. 备份 /boot 目录（启动文件）
tar -czvf /root/kernel-upgrade-backup-$(date +%Y%m%d)/boot-backup.tar.gz /boot

# 4. 备份 grub 配置文件
cp /boot/grub2/grub.cfg /root/kernel-upgrade-backup-$(date +%Y%m%d)/grub.cfg
cp -r /boot/grub2/grub.cfg.d/ /root/kernel-upgrade-backup-$(date +%Y%m%d)/ 2>/dev/null || true

# 5. 备份内核版本信息
uname -r > /root/kernel-upgrade-backup-$(date +%Y%m%d)/current-kernel-version.txt
rpm -qa | grep kernel | sort > /root/kernel-upgrade-backup-$(date +%Y%m%d)/installed-kernels.txt

# 6. 如果是虚拟机，创建快照！
# 在 VMware/Hyper-V/KVM 等虚拟化平台中创建系统快照
```

#### 备份验证

```sh
# 确认备份文件已创建
ls -lh /root/kernel-upgrade-backup-$(date +%Y%m%d)/

# 验证备份完整性
tar -tzf /root/kernel-upgrade-backup-$(date +%Y%m%d)/etc-backup.tar.gz | head -10

# 计算备份文件总大小
du -sh /root/kernel-upgrade-backup-$(date +%Y%m%d)/
```

### 2.3 记录关键信息

```sh
# 1. 记录当前内核版本
echo "当前内核版本：$(uname -r)" | tee /root/kernel-upgrade-backup-$(date +%Y%m%d)/upgrade-log.txt
date | tee -a /root/kernel-upgrade-backup-$(date +%Y%m%d)/upgrade-log.txt

# 2. 记录已安装的内核
rpm -qa | grep kernel | tee -a /root/kernel-upgrade-backup-$(date +%Y%m%d)/upgrade-log.txt

# 3. 记录系统引导方式
if [ -d /sys/firmware/efi ]; then
    echo "引导方式：UEFI" | tee -a /root/kernel-upgrade-backup-$(date +%Y%m%d)/upgrade-log.txt
    echo "GRUB配置：/boot/efi/EFI/rocky/grub.cfg" | tee -a /root/kernel-upgrade-backup-$(date +%Y%m%d)/upgrade-log.txt
else
    echo "引导方式：BIOS (Legacy)" | tee -a /root/kernel-upgrade-backup-$(date +%Y%m%d)/upgrade-log.txt
    echo "GRUB配置：/boot/grub2/grub.cfg" | tee -a /root/kernel-upgrade-backup-$(date +%Y%m%d)/upgrade-log.txt
fi

# 4. 查看备份日志
cat /root/kernel-upgrade-backup-$(date +%Y%m%d)/upgrade-log.txt
```

---

## 三、安装 ELRepo 仓库

### 3.1 导入 ELRepo GPG 密钥

```sh
# 1. 导入 ELRepo 官方 GPG 密钥
sudo rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org

# 2. 验证密钥是否导入成功
rpm -qa | grep gpgkey | grep elrepo

# 3. 如果没有输出，手动检查
ls -la /etc/pki/rpm-gpg/ | grep -i elrepo
```

### 3.2 安装 ELRepo 仓库

Rocky Linux 9 对应的是 ELRepo 9：

```sh
# 1. 安装 ELRepo 9 仓库
sudo dnf install -y https://www.elrepo.org/elrepo-release-9.el9.elrepo.noarch.rpm

# 2. 验证仓库是否安装成功
rpm -qa | grep elrepo-release

# 3. 查看仓库信息
dnf repolist | grep elrepo

# 4. 应该看到类似输出：
# elrepo                         ELRepo.org Community Enterprise Linux Kernel Repository
```

### 3.3 常见错误处理

#### 错误1：GPG 密钥导入失败

```sh
# 如果提示 GPG 密钥导入失败，使用备用方法
sudo rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org

# 或者使用 curl 下载密钥
curl -fsSL https://www.elrepo.org/RPM-GPG-KEY-elrepo.org | sudo tee /etc/pki/rpm-gpg/RPM-GPG-KEY-elrepo.org > /dev/null

# 重新导入
sudo rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-elrepo.org
```

#### 错误2：仓库安装失败

```sh
# 如果直接安装 rpm 包失败，使用 dnf 本地安装
sudo dnf install -y ./elrepo-release-9.el9.elrepo.noarch.rpm

# 或者手动创建仓库文件
sudo cat > /etc/yum.repos.d/elrepo.repo << 'EOF'
[elrepo]
name=ELRepo.org Community Enterprise Linux Repository - el9
baseurl=https://mirrors.tuna.tsinghua.edu.cn/elrepo/el9/elrepo/x86_64/
enabled=1
gpgcheck=1
gpgkey=https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
EOF
```

---

## 四、配置清华大学 ELRepo 镜像源

### 4.1 为什么需要换源

ELRepo 官方源服务器在国外，下载速度可能较慢。清华大学镜像站提供了同步镜像，可以大幅提升下载速度。

### 4.2 备份原始配置文件

```sh
# 1. 创建备份
sudo cp /etc/yum.repos.d/elrepo.repo /etc/yum.repos.d/elrepo.repo.backup-$(date +%Y%m%d)

# 2. 验证备份
ls -la /etc/yum.repos.d/elrepo.repo*
```

### 4.3 编辑配置文件

#### 方法一：使用 sed 命令一键替换（推荐）

```sh
# 1. 注释掉 mirrorlist 行
sudo sed -i 's/mirrorlist=/#mirrorlist=/g' /etc/yum.repos.d/elrepo.repo

# 2. 取消注释 baseurl 行（如果有注释）
sudo sed -i 's/#baseurl=/baseurl=/g' /etc/yum.repos.d/elrepo.repo

# 3. 替换官方源为清华大学镜像源
sudo sed -i 's|http://elrepo.org/linux|https://mirrors.tuna.tsinghua.edu.cn/elrepo|g' /etc/yum.repos.d/elrepo.repo

# 4. 验证修改
cat /etc/yum.repos.d/elrepo.repo
```

#### 方法二：手动编辑（更精确）

```sh
# 1. 打开配置文件
sudo vi /etc/yum.repos.d/elrepo.repo

# 2. 修改所有仓库段，示例（elrepo-kernel 为例）：
[elrepo-kernel]
name=ELRepo.org Community Enterprise Linux Kernel Repository - el9
baseurl=https://mirrors.tuna.tsinghua.edu.cn/elrepo/kernel/el9/$basearch/
#mirrorlist=http://mirrors.elrepo.org/mirrors-elrepo-kernel.el9
enabled=1
gpgcheck=1
gpgkey=https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
protect=0

# 3. 保存并退出
# 按 Esc，输入 :wq，回车
```

### 4.4 修改后的完整配置示例

```sh
# 查看修改后的配置
cat /etc/yum.repos.d/elrepo.repo

# 应该看到类似以下内容（所有 mirrorlist 被注释，所有 baseurl 指向清华镜像）：
[elrepo]
name=ELRepo.org Community Enterprise Linux Repository - el9
baseurl=https://mirrors.tuna.tsinghua.edu.cn/elrepo/el9/elrepo/x86_64/
#mirrorlist=http://mirrors.elrepo.org/mirrors-elrepo
enabled=1
gpgcheck=1
gpgkey=https://www.elrepo.org/RPM-GPG-KEY-elrepo.org

[elrepo-kernel]
name=ELRepo.org Community Enterprise Linux Kernel Repository - el9
baseurl=https://mirrors.tuna.tsinghua.edu.cn/elrepo/kernel/el9/$basearch/
#mirrorlist=http://mirrors.elrepo.org/mirrors-elrepo-kernel.el9
enabled=1
gpgcheck=1
gpgkey=https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
protect=0

[elrepo-extras]
name=ELRepo.org Community Enterprise Linux Extras Repository - el9
baseurl=https://mirrors.tuna.tsinghua.edu.cn/elrepo/extras/el9/$basearch/
#mirrorlist=http://mirrors.elrepo.org/mirrors-elrepo-extras.el9
enabled=1
gpgcheck=1
gpgkey=https://www.elrepo.org/RPM-GPG-KEY-elrepo.org

[elrepo-testing]
name=ELRepo.org Community Enterprise Linux Testing Repository - el9
baseurl=https://mirrors.tuna.tsinghua.edu.cn/elrepo/testing/el9/$basearch/
#mirrorlist=http://mirrors.elrepo.org/mirrors-elrepo-testing.el9
enabled=0
gpgcheck=1
gpgkey=https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
```

### 4.5 清理并更新缓存

```sh
# 1. 清理所有缓存
sudo dnf clean all

# 2. 重建缓存
sudo dnf makecache

# 3. 验证仓库配置
sudo dnf repolist | grep elrepo

# 4. 应该看到清华镜像源
# elrepo              ELRepo.org Community Enterprise Linux Repository - el9
```

---

## 五、查看可用内核版本

### 5.1 列出所有可用的内核

```sh
# 1. 查看 ELRepo-kernel 仓库中所有可用的内核
sudo dnf --disablerepo="*" --enablerepo="elrepo-kernel" list available

# 2. 或者使用完整仓库列表
sudo dnf list available --disablerepo="*" --enablerepo="elrepo","elrepo-kernel"

# 3. 只查看内核包
sudo dnf list available | grep -E "kernel-lt|kernel-ml"
```

### 5.2 内核版本说明

|版本类型|包名格式|说明|推荐场景|
|--|--|--|--|
|**kernel-lt**|`kernel-lt-x.x.xxx-x.el9.elrepo.x86_64`|Long Term（长期支持版本）|✅ **生产环境推荐**|
|**kernel-ml**|`kernel-ml-x.x.xxx-x.el9.elrepo.x86_64`|Main Line（主线最新版本）|测试环境、尝鲜|

### 5.3 选择推荐版本

#### 长期支持版（推荐生产环境）

- **kernel-lt-5.4.x**：非常稳定，周期长，适合生产环境
- **kernel-lt-5.10.x**：功能较新，稳定可靠

#### 主线最新版（适合测试）

- **kernel-ml-6.x**：包含最新功能，但可能不稳定

**本指南使用 kernel-lt 长期支持版作为示例**

---

## 六、安装新内核

### 6.1 安装长期支持版本（推荐）

```sh
# 1. 安装 kernel-lt 内核主包
sudo dnf --enablerepo=elrepo-kernel install -y kernel-lt

# 2. 安装 kernel-lt 开发包（必需，用于编译驱动）
sudo dnf --enablerepo=elrepo-kernel install -y kernel-lt-devel

# 3. 安装 kernel-lt 头文件（可选，但推荐安装）
sudo dnf --enablerepo=elrepo-kernel install -y kernel-lt-headers
```

### 6.2 安装主线最新版本（可选）

如果需要最新功能，可以使用主线版本：

```sh
# 1. 安装 kernel-ml 内核主包
sudo dnf --enablerepo=elrepo-kernel install -y kernel-ml

# 2. 安装 kernel-ml 开发包
sudo dnf --enablerepo=elrepo-kernel install -y kernel-ml-devel

# 3. 安装 kernel-ml 头文件
sudo dnf --enablerepo=elrepo-kernel install -y kernel-ml-headers
```

### 6.3 查看安装过程

```sh
# 1. 查看正在安装的包
sudo dnf --enablerepo=elrepo-kernel install -y kernel-lt kernel-lt-devel kernel-lt-headers

# 2. 等待安装完成，应该看到：
# Installing:
#  kernel-lt           x.x.xxx-x.el9.elrepo    elrepo-kernel
#  kernel-lt-devel     x.x.xxx-x.el9.elrepo    elrepo-kernel
#  kernel-lt-headers  x.x.xxx-x.el9.elrepo    elrepo-kernel

# 3. 安装完成确认
# Transaction Summary:
# ======================================
# Install  3 Packages

# 4. 验证安装
rpm -qa | grep kernel-lt | sort
```

### 6.4 安装额外模块（可选）

如果需要额外的内核模块（如某些硬件驱动），可以安装：

```sh
# 对于 kernel-lt
sudo dnf --enablerepo=elrepo-kernel install -y kernel-lt-modules-extra

# 对于 kernel-ml
# sudo dnf --enablerepo=elrepo-kernel install -y kernel-ml-modules-extra
```

---

## 七、设置默认引导内核

### 7.1 查看所有可用内核

```sh
# 1. 使用 grubby 查看所有内核
sudo grubby --info=ALL

# 示例输出：
# index=0
# kernel="/boot/vmlinuz-5.4.290-1.el9.elrepo.x86_64"
# title="Rocky Linux (5.4.290-1.el9.elrepo.x86_64) 9 (Blue Onyx)"
# index=1
# kernel="/boot/vmlinuz-5.14.0-427.el9.x86_64"
# title="Rocky Linux (5.14.0-427.el9.x86_64) 9 (Blue Onyx)"
# index=2
# kernel="/boot/vmlinuz-5.14.0-427.el9.x86_64"
# title="Rocky Linux (5.14.0-427.el9.x86_64) 9 (Blue Onyx)"
```

### 7.2 查看当前默认内核

```sh
# 查看当前默认内核
sudo grubby --default-kernel

# 示例输出：
# /boot/vmlinuz-5.14.0-427.el9.x86_64
```

### 7.3 设置新内核为默认引导项

#### 方法一：使用内核路径（推荐）

```sh
# 1. 先列出 /boot 目录下的新内核文件
ls -l /boot/vmlinuz-* | grep elrepo

# 2. 设置新内核为默认（替换为实际的文件名）
sudo grubby --set-default /boot/vmlinuz-5.4.290-1.el9.elrepo.x86_64

# 3. 验证设置
sudo grubby --default-kernel
```

#### 方法二：使用索引

```sh
# 1. 查看所有内核及其索引
sudo grubby --info=ALL | grep -E "^index=|^kernel=|^title="

# 2. 设置新内核为默认（索引 0）
sudo grubby --set-default-index=0

# 3. 验证设置
sudo grubby --default-index
```

#### 方法三：使用完整内核标题

```sh
# 1. 查看完整内核标题
sudo grubby --info=ALL | grep -A1 "index=0"

# 2. 设置默认
sudo grubby --set-default="Rocky Linux (5.4.290-1.el9.elrepo.x86_64) 9 (Blue Onyx)"

# 3. 验证
sudo grubby --default-title
```

---

## 八、重启系统并验证

### 8.1 重启系统

```sh
# 1. 重启前再次确认
echo "即将升级到新内核，当前内核版本：$(uname -r)"
echo "新内核版本：5.4.290-1.el9.elrepo.x86_64"
read -p "按 Enter 键继续重启，或 Ctrl+C 取消："

# 2. 执行重启
sudo reboot
```

### 8.2 重启后验证

#### 基本验证

```sh
# 1. 查看当前内核版本
uname -r

# 应该显示：5.4.290-1.el9.elrepo.x86_64

# 2. 查看详细内核信息
uname -a

# 3. 查看系统信息
cat /etc/rocky-release
```

#### 高级验证

```sh
# 4. 查看已安装的内核列表
rpm -qa | grep kernel | sort

# 5. 查看内核启动时间
systemd-analyze

# 6. 查看内核日志
dmesg | grep "Linux version"

# 7. 查看系统负载
uptime

# 8. 检查关键服务状态
systemctl status nginx
systemctl status sshd
systemctl status firewalld
```

---

## 九、清理旧内核（可选）

### 9.1 确认新内核稳定运行

```sh
# 1. 运行至少 1-2 小时确认稳定
# 2. 检查系统日志无错误
journalctl --since "1 hour ago" | grep -i error

# 3. 检查所有服务正常运行
systemctl list-units --type=service --state=running | head -20
```

### 9.2 查看已安装的内核

```sh
# 查看所有已安装的内核
rpm -qa | grep kernel | sort

# 示例输出：
# kernel-5.14.0-427.el9.x86_64
# kernel-core-5.14.0-427.el9.x86_64
# kernel-devel-5.14.0-427.el9.x86_64
# kernel-headers-5.14.0-427.el9.x86_64
# kernel-modules-5.14.0-427.el9.x86_64
# kernel-modules-extra-5.14.0-427.el9.x86_64
# kernel-lt-5.4.290-1.el9.elrepo.x86_64
# kernel-lt-core-5.4.290-1.el9.elrepo.x86_64
# kernel-lt-devel-5.4.290-1.el9.elrepo.x86_64
# kernel-lt-headers-5.4.290-1.el9.elrepo.x86_64
# kernel-lt-modules-5.4.290-1.el9.elrepo.x86_64
# kernel-lt-modules-extra-5.4.290-1.el9.elrepo.x86_64
```

### 9.3 删除旧内核

**警告：至少保留一个旧内核作为备用！**

#### 方法一：使用 DNF 自动清理

```sh
# 只保留最新的 2 个内核（包括当前使用和备用）
sudo dnf remove -y $(dnf repoquery --installonly --latest-limit=-1 -q)

# 或者只保留最新的 1 个内核
# sudo dnf remove -y $(dnf repoquery --installonly --latest-limit=-1 -q)
```

#### 方法二：手动删除指定版本

```sh
# 删除旧版本内核的所有包（替换为实际的版本号）
sudo dnf remove -y \
    kernel-5.14.0-427.el9.x86_64 \
    kernel-core-5.14.0-427.el9.x86_64 \
    kernel-devel-5.14.0-427.el9.x86_64 \
    kernel-headers-5.14.0-427.el9.x86_64 \
    kernel-modules-5.14.0-427.el9.x86_64 \
    kernel-modules-extra-5.14.0-427.el9.x86_64

# 注意：不要删除正在使用的内核！
# 使用 uname -r 确认当前内核版本后再删除
```

#### 方法三：使用 package-cleanup（需要 yum-utils）

```sh
# 1. 安装 yum-utils
sudo dnf install -y dnf-utils

# 2. 只保留最新的 2 个内核
sudo package-cleanup --oldkernels --count=2 -y

# 3. 或者只保留最新的 1 个内核
# sudo package-cleanup --oldkernels --count=1 -y
```

### 9.4 清理后验证

```sh
# 1. 查看剩余的内核
rpm -qa | grep kernel | sort

# 2. 确认 GRUB 配置已更新
sudo grubby --info=ALL | grep -E "^index=|^kernel=|^title="

# 3. 确认新内核仍然可以正常启动
sudo reboot
# 重启后检查
uname -r
```

---

## 十、常见问题处理

### 10.1 新内核无法启动

**症状**：系统启动时卡在 GRUB 界面，或者启动后黑屏。

**解决方案**：

```sh
# 1. 重启系统，在 GRUB 菜单选择旧内核启动
# 启动时按 Esc 或 Shift 键进入 GRUB 菜单
# 选择 "Rocky Linux (5.14.0-427.el9.x86_64)" 启动

# 2. 进入系统后，查看启动日志
dmesg | grep -i error
journalctl -xe | grep -i error

# 3. 检查新内核是否安装正确
rpm -qa | grep kernel-lt
ls -la /boot/vmlinuz-5.4.290*
ls -la /boot/initramfs-5.4.290*.img

# 4. 重新生成 initramfs
sudo dracut -f /boot/initramfs-5.4.290.img 5.4.290-1.el9.elrepo.x86_64

# 5. 重新配置 GRUB
if [ -d /sys/firmware/efi ]; then
    sudo grub2-mkconfig -o /boot/efi/EFI/rocky/grub.cfg
else
    sudo grub2-mkconfig -o /boot/grub2/grub.cfg
fi

# 6. 再次尝试启动新内核
```

### 10.2 NVIDIA 驱动不工作

**症状**：升级内核后，NVIDIA 显卡驱动失败。

**解决方案**：

```sh
# 方案1：使用 ELRepo 提供的 NVIDIA 驱动（推荐）
# 安装 kmod-nvidia（自动适配新内核）
sudo dnf --enablerepo=elrepo-kernel install -y kmod-nvidia-latest-dkms

# 或者
sudo dnf install -y akmod-nvidia

# 方案2：如果上面的方法失败，手动重新安装
# 1. 切换到文字模式
sudo systemctl isolate multi-user.target

# 2. 卸载旧驱动
sudo nvidia-uninstall

# 3. 重新安装驱动
sudo ./NVIDIA-Linux-x86_64-*.run

# 方案3：使用 CUDA 官方驱动
# 从 NVIDIA 官网下载对应的驱动安装
```

### 10.3 无法连接到网络

**症状**：新内核启动后无法连接网络。

**解决方案**：

```sh
# 1. 检查网络接口状态
ip link show
ip addr show

# 2. 检查网络服务状态
systemctl status NetworkManager
systemctl status network

# 3. 重启网络服务
sudo systemctl restart NetworkManager

# 4. 如果是特定驱动问题，安装新内核的驱动
sudo dnf install -y kernel-modules-$(uname -r)

# 5. 检查 NIC 驱动是否加载
lsmod | grep -iE "e1000|igb|bnx2|mellanox"

# 6. 手动加载驱动
sudo modprobe e1000  # Intel
sudo modprobe igb    # Intel 82575
sudo modprobe bnx2   # Broadcom
```

### 10.4 虚拟化问题

**症状**：KVM/Xen 等虚拟化功能不正常。

**解决方案**：

```sh
# 1. 检查虚拟化模块是否加载
lsmod | grep -iE "kvm|xen|virtio"

# 2. 加载虚拟化模块
sudo modprobe kvm
sudo modprobe kvm-intel  # Intel VT-x
sudo modprobe kvm-amd    # AMD-V

# 3. 检查 libvirt 服务
systemctl status libvirtd

# 4. 如果需要，重新安装虚拟化工具
sudo dnf install -y qemu-kvm libvirt virt-install
```

### 10.5 软件包依赖问题

**症状**：某些软件包依赖旧内核，无法正常工作。

**解决方案**：

```sh
# 1. 更新所有软件包
sudo dnf update -y

# 2. 重新安装依赖新内核的包
sudo dnf reinstall -y $(rpm -qa | grep kernel)

# 3. 如果是特定软件包问题
sudo dnf reinstall -y <软件包名>

# 4. 检查依赖关系
rpm -q --requires <软件包名> | grep kernel
```

---

## 十一、验证内核源配置

### 11.1 检查仓库配置

```sh
# 1. 查看所有仓库
sudo dnf repolist -v | grep -A10 elrepo

# 2. 查看 elrepo.repo 文件内容
cat /etc/yum.repos.d/elrepo.repo

# 3. 确认镜像源地址正确
grep baseurl /etc/yum.repos.d/elrepo.repo
```

### 11.2 测试下载速度

```sh
# 1. 测试清华大学镜像源速度
time sudo dnf makecache

# 2. 测试下载内核包
sudo dnf --enablerepo=elrepo-kernel check-update kernel-lt

# 3. 如果速度慢，可以尝试其他镜像源
# 阿里云镜像
sudo sed -i 's|mirrors.tuna.tsinghua.edu.cn|mirrors.aliyun.com|g' /etc/yum.repos.d/elrepo.repo

# 重新缓存
sudo dnf clean all
sudo dnf makecache
```

---

## 十二、完整命令速查表

### 快速升级命令（完整流程）

```sh
#!/bin/bash
# Rocky Linux 9.7 内核升级脚本

set -e  # 遇到错误立即退出

echo "=========================================="
echo "Rocky Linux 9.7 内核升级脚本"
echo "=========================================="

# 1. 导入 GPG 密钥
echo ">>> 1. 导入 GPG 密钥..."
sudo rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org

# 2. 安装 ELRepo 仓库
echo ">>> 2. 安装 ELRepo 仓库..."
sudo dnf install -y https://www.elrepo.org/elrepo-release-9.el9.elrepo.noarch.rpm

# 3. 配置清华大学镜像源
echo ">>> 3. 配置清华大学镜像源..."
sudo sed -i 's/mirrorlist=/#mirrorlist=/g' /etc/yum.repos.d/elrepo.repo
sudo sed -i 's/#baseurl=/baseurl=/g' /etc/yum.repos.d/elrepo.repo
sudo sed -i 's|http://elrepo.org/linux|https://mirrors.tuna.tsinghua.edu.cn/elrepo|g' /etc/yum.repos.d/elrepo.repo

# 4. 清理缓存
echo ">>> 4. 清理并重建缓存..."
sudo dnf clean all
sudo dnf makecache

# 5. 查看可用内核
echo ">>> 5. 查看可用的内核版本..."
sudo dnf --disablerepo="*" --enablerepo="elrepo-kernel" list available | grep kernel-lt

# 6. 安装新内核
echo ">>> 6. 安装新内核（kernel-lt）..."
sudo dnf --enablerepo=elrepo-kernel install -y kernel-lt kernel-lt-devel kernel-lt-headers

# 7. 设置默认内核
echo ">>> 7. 设置新内核为默认启动项..."
NEW_KERNEL=$(ls /boot/vmlinuz-* | grep elrepo | head -1)
echo "新内核文件：$NEW_KERNEL"
sudo grubby --set-default "$NEW_KERNEL"

# 8. 验证设置
echo ">>> 8. 验证设置..."
echo "默认内核：$(sudo grubby --default-kernel)"
echo "当前内核：$(uname -r)"

echo "=========================================="
echo "内核安装完成！"
echo "请执行 'sudo reboot' 重启系统"
echo "=========================================="
```

### 详细步骤命令

```sh
# ========== 1. 备份 ==========
mkdir -p /root/kernel-upgrade-backup-$(date +%Y%m%d)
tar -czvf /root/kernel-upgrade-backup-$(date +%Y%m%d)/etc-backup.tar.gz /etc
tar -czvf /root/kernel-upgrade-backup-$(date +%Y%m%d)/boot-backup.tar.gz /boot

# ========== 2. 安装 ELRepo ==========
sudo rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
sudo dnf install -y https://www.elrepo.org/elrepo-release-9.el9.elrepo.noarch.rpm

# ========== 3. 配置镜像源 ==========
sudo cp /etc/yum.repos.d/elrepo.repo /etc/yum.repos.d/elrepo.repo.backup
sudo sed -i 's/mirrorlist=/#mirrorlist=/g' /etc/yum.repos.d/elrepo.repo
sudo sed -i 's/#baseurl=/baseurl=/g' /etc/yum.repos.d/elrepo.repo
sudo sed -i 's|http://elrepo.org/linux|https://mirrors.tuna.tsinghua.edu.cn/elrepo|g' /etc/yum.repos.d/elrepo.repo
sudo dnf clean all
sudo dnf makecache

# ========== 4. 安装内核 ==========
sudo dnf --enablerepo=elrepo-kernel install -y kernel-lt kernel-lt-devel kernel-lt-headers

# ========== 5. 设置默认内核 ==========
NEW_KERNEL=$(ls /boot/vmlinuz-* | grep elrepo | head -1)
sudo grubby --set-default "$NEW_KERNEL"

# ========== 6. 重启 ==========
echo "当前内核：$(uname -r)"
echo "新内核文件：$NEW_KERNEL"
read -p "按 Enter 重启系统："
sudo reboot

# ========== 7. 验证 ==========
# 重启后执行
uname -r
rpm -qa | grep kernel-lt | sort
```

---

## 十三、技术总结

### 环境要求

|项目|要求|
|--|--|
|操作系统|Rocky Linux 9.7 x86_64|
|磁盘空间|至少 5GB 可用空间|
|网络|必须有网络连接|

### 版本信息

|项目|版本/信息|
|--|--|
|推荐内核版本|kernel-lt-5.4.290 LTS|
|内核仓库|ELRepo 9|
|镜像源|清华大学镜像|

### 关键文件路径

|用途|路径|
|--|--|
|ELRepo 配置文件|/etc/yum.repos.d/elrepo.repo|
|GRUB 配置（BIOS）|/boot/grub2/grub.cfg|
|GRUB 配置（UEFI）|/boot/efi/EFI/rocky/grub.cfg|
|内核文件|/boot/vmlinuz-x.x.x|
|initramfs|/boot/initramfs-x.x.x.img|

### 安装的内核包

|包名|说明|是否必需|
|--|--|--|
|kernel-lt|内核主包|✅ 必须|
|kernel-lt-devel|内核开发包|✅ 必须（编译驱动用）|
|kernel-lt-headers|内核头文件|✅ 推荐|
|kernel-lt-modules-extra|额外内核模块|⭕ 可选|

---

## 十四、安全提示

### 升级前必须确认

- ✅ 备份所有重要数据
- ✅ 创建系统快照（如果是虚拟机）
- ✅ 在测试环境先验证
- ✅ 选择业务低峰时段升级
- ✅ 保留旧内核作为备用
- ✅ 记录完整的操作过程

### 版本选择建议

- **生产环境**：使用 kernel-lt 长期支持版
- **测试环境**：可以使用 kernel-ml 体验新功能
- **硬件兼容性**：如果需要支持新硬件，选择对应版本

### 紧急回滚

如果升级后系统无法正常启动：

1. 在 GRUB 菜单选择旧内核启动
2. 进入系统后使用 `sudo grubby --set-default` 设置回旧内核
3. 或者删除新内核包

---

## 十五、多台机器升级策略

### 15.1 单台升级

按照本文档步骤逐台升级，适用于少量机器。

### 15.2 批量升级

对于多台 Rocky Linux 9.7 机器，可以使用以下策略：

#### 方案1：Ansible 批量升级

```sh
# 创建 Ansible playbook
cat > upgrade-kernel.yml << 'EOF'
---
- hosts: rocky_linux_servers
  become: yes
  tasks:
    - name: Import ELRepo GPG key
      rpm_key:
        key: https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
        state: present

    - name: Install ELRepo repository
      dnf:
        name: https://www.elrepo.org/elrepo-release-9.el9.elrepo.noarch.rpm
        state: present

    - name: Configure Tsinghua mirror
      replace:
        path: /etc/yum.repos.d/elrepo.repo
        regexp: 'http://elrepo.org/linux'
        replace: 'https://mirrors.tuna.tsinghua.edu.cn/elrepo'

    - name: Install kernel-lt
      dnf:
        name:
          - kernel-lt
          - kernel-lt-devel
          - kernel-lt-headers
        enablerepo: elrepo-kernel
        state: present

    - name: Set new kernel as default
      command: grubby --set-default /boot/vmlinuz-5.4.290-1.el9.elrepo.x86_64
      ignore_errors: yes
EOF

# 执行批量升级
ansible-playbook upgrade-kernel.yml
```

#### 方案2：手动+脚本

```sh
# 在编译机器上创建安装脚本
cat > /root/kernel-upgrade.sh << 'EOF'
#!/bin/bash
# Rocky Linux 9.7 内核升级脚本

sudo rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
sudo dnf install -y https://www.elrepo.org/elrepo-release-9.el9.elrepo.noarch.rpm
sudo sed -i 's/mirrorlist=/#mirrorlist=/g' /etc/yum.repos.d/elrepo.repo
sudo sed -i 's/#baseurl=/baseurl=/g' /etc/yum.repos.d/elrepo.repo
sudo sed -i 's|http://elrepo.org/linux|https://mirrors.tuna.tsinghua.edu.cn/elrepo|g' /etc/yum.repos.d/elrepo.repo
sudo dnf clean all
sudo dnf makecache
sudo dnf --enablerepo=elrepo-kernel install -y kernel-lt kernel-lt-devel kernel-lt-headers
NEW_KERNEL=$(ls /boot/vmlinuz-* | grep elrepo | head -1)
sudo grubby --set-default "$NEW_KERNEL"
echo "完成！请执行 reboot 重启系统"
EOF

chmod +x /root/kernel-upgrade.sh

# 复制到其他机器并执行
scp /root/kernel-upgrade.sh root@目标机器IP:/root/
ssh root@目标机器IP 'bash /root/kernel-upgrade.sh'
```