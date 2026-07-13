---
title: CentOS 7 完整安装与配置手册
date: 2026-07-13
description: CentOS 7 从安装到生产环境配置的全流程笔记，涵盖安装准备、磁盘分区、网络配置、NTP、安全加固、磁盘管理等
tags: [linux, centos, 系统安装, 运维配置]
---

以下是一个更完善的CentOS 7安装与配置手册，涵盖磁盘管理、NTP配置、网络设置等完整流程：

---

### **CentOS 7 完整安装与配置手册**

---

#### **一、安装准备**

1. **镜像下载**  
   - 官方源：https://www.centos.org/download/
   - 国内镜像（阿里云）：https://mirrors.aliyun.com/centos/7.9.2009/isos/x86_64/
2. **启动盘制作**  
   ```sh
   # Linux
   dd if=CentOS-7-x86_64-DVD-2009.iso of=/dev/sdX bs=4M status=progress conv=fsync
   
   # Windows
   - 使用Rufus（选择DD模式）
   ```

---

#### **二、安装过程**

##### 1. **基础设置**

- 语言：English
- 时区：Asia/Shanghai（取消UTC）

##### 2. **磁盘分区方案**

   **场景1：系统盘（250GB SSD）**

|挂载点|大小|文件系统|类型|
|--|--|--|--|
|/boot|1GB|xfs|标准|
|/boot/efi|200MB|vfat|EFI（仅UEFI）|
|swap|内存×1.5|swap|标准|
|/|100GB|xfs|LVM|
|/home|剩余空间|xfs|LVM|

   **场景2：数据盘（2TB HDD）**

```sh
# 安装后操作（见第四部分）
```

##### 3. **网络配置**

```ini
IPv4设置：Manual
IP地址：192.168.1.100
子网掩码：255.255.255.0
网关：192.168.1.1
DNS：223.5.5.5 223.6.6.6
```

##### 4. **软件选择**

- 最小安装 + 附加选项：
  - 兼容性库
  - 开发工具
  - 系统管理工具

##### 5. **安全策略**

- SELinux：Permissive（安装后禁用）
- 防火墙：暂不配置

---

#### **三、首次启动配置**

##### 1. **系统更新**

```sh
yum update -y && reboot
```

##### 2. **网络固化**

```sh
nmcli con mod "ens192" \
ipv4.addresses 192.168.1.100/24 \
ipv4.gateway 192.168.1.1 \
ipv4.dns "223.5.5.5,223.6.6.6" \
ipv4.method manual
nmcli con up ens192
```

##### 3. **时间同步（NTP）**

```sh
yum install -y chrony

# 配置NTP源
cat > /etc/chrony.conf <<EOF
server ntp.aliyun.com iburst
server ntp1.tencent.com iburst
server cn.pool.ntp.org iburst

driftfile /var/lib/chrony/drift
makestep 1.0 3
rtcsync
keyfile /etc/chrony.keys
leapsectz right/UTC
logdir /var/log/chrony
EOF

systemctl enable --now chronyd
timedatectl set-timezone Asia/Shanghai
chronyc tracking  # 验证同步状态
```

##### 4. **SELinux与防火墙**

```sh
# 禁用SELinux
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
setenforce 0

# 防火墙基础配置
systemctl enable --now firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --reload
```

---

#### **四、磁盘管理（新硬盘配置）**

> 假设新硬盘为 `/dev/sdb`

##### **场景1：整盘作为单个分区**

```sh
# 格式化
mkfs.xfs /dev/sdb

# 挂载
mkdir /data
echo "/dev/sdb /data xfs defaults,noatime 0 0" >> /etc/fstab
mount -a
```

##### **场景2：分区使用（MBR/GPT）**

```sh
# 分区（GPT支持>2TB）
parted /dev/sdb mklabel gpt
parted /dev/sdb mkpart primary xfs 1MiB 100%

# 格式化
mkfs.xfs /dev/sdb1

# 挂载
mkdir /data
echo "/dev/sdb1 /data xfs defaults,noatime 0 0" >> /etc/fstab
mount -a
```

##### **场景3：LVM配置**

```sh
# 创建物理卷
pvcreate /dev/sdb

# 创建卷组
vgcreate vg_data /dev/sdb

# 创建逻辑卷
lvcreate -n lv_data -l 100%FREE vg_data

# 格式化
mkfs.xfs /dev/vg_data/lv_data

# 挂载
mkdir /data
echo "/dev/vg_data/lv_data /data xfs defaults,noatime 0 0" >> /etc/fstab
mount -a
```

##### **场景4：多分区混合使用**

```sh
# 分区方案
parted /dev/sdb mklabel gpt
parted /dev/sdb mkpart primary 1MiB 500GiB
parted /dev/sdb mkpart primary 500GiB 100%

# 格式化
mkfs.xfs /dev/sdb1  # /data1
mkfs.ext4 /dev/sdb2 # /data2

# 挂载
mkdir /data1 /data2
echo "/dev/sdb1 /data1 xfs defaults 0 0" >> /etc/fstab
echo "/dev/sdb2 /data2 ext4 defaults 0 0" >> /etc/fstab
mount -a
```

---

#### **五、YUM仓库优化**

```sh
# 备份原配置
mv /etc/yum.repos.d/CentOS-Base.repo{,.bak}

# 阿里云源
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo

# EPEL源
yum install -y epel-release
sed -i 's|^#baseurl|baseurl|; s|^metalink|#metalink|' /etc/yum.repos.d/epel*

# 刷新缓存
yum clean all && yum makecache
```

---

#### **六、必备工具安装**

```sh
# 基础工具
yum install -y vim-enhanced net-tools wget curl git htop tree lsof sysstat ncdu

# 开发工具
yum groupinstall -y "Development Tools"

# 诊断工具
yum install -y iotop iftop nmon dstat

# 文件传输
yum install -y rsync lrzsz

# 压缩工具
yum install -y unzip p7zip
```

---

#### **七、安全加固**

##### 1. **SSH加固**

```sh
sed -i '
s/#Port 22/Port 2222/;
s/#PermitRootLogin yes/PermitRootLogin no/;
s/#PasswordAuthentication yes/PasswordAuthentication no/;
s/#ClientAliveInterval 0/ClientAliveInterval 300/;
' /etc/ssh/sshd_config

systemctl restart sshd
```

##### 2. **防火墙进阶配置**

```sh
# 限制SSH访问源
firewall-cmd --permanent --remove-service=ssh
firewall-cmd --permanent --add-rich-rule='
rule family="ipv4"
source address="192.168.1.0/24"
port protocol="tcp" port="2222" accept'

# 日志记录拒绝连接
firewall-cmd --set-log-denied=all
firewall-cmd --reload
```

##### 3. **内核安全参数**

```sh
cat >> /etc/sysctl.d/99-security.conf <<EOF
# 禁止ICMP重定向
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0

# 开启SYN洪水保护
net.ipv4.tcp_syncookies = 1

# 禁用IP源路由
net.ipv4.conf.all.accept_source_route = 0
EOF
sysctl -p
```

---

#### **八、验证与监控**

##### 1. **系统状态检查**

```sh
# 磁盘
lsblk -f
df -hT

# 网络
ip a
ss -tulnp

# 时间
timedatectl
chronyc sources -v

# 安全
sestatus
firewall-cmd --list-all
```

##### 2. **监控配置**

```sh
# 安装监控代理
yum install -y sysstat

# 启用磁盘监控
sed -i 's|^SADC_OPTIONS=.*|SADC_OPTIONS="-d"|' /etc/sysconfig/sysstat

# 日志审计
yum install -y audit
auditctl -e 1
```

---

### **附录：常用命令速查**

|功能|命令|
|--|--|
|磁盘检查|`lsblk -f`, `parted -l`, `fdisk -l`|
|LVM管理|`pvdisplay`, `vgdisplay`, `lvdisplay`|
|网络诊断|`ip route`, `nslookup`, `traceroute`|
|防火墙|`firewall-cmd --list-services`, `firewall-cmd --add-port=8080/tcp`|
|服务管理|`systemctl status chronyd`, `journalctl -u sshd`|
|性能监控|`top`, `vmstat 1`, `iostat -dx 2`|

---

本手册覆盖了CentOS 7从安装到生产环境配置的全流程，特别针对磁盘管理提供了多种场景方案。实际部署时请根据硬件规格和业务需求调整参数。