---
title: MySQL 一键安装脚本（通用版）
date: 2026-07-20
description: 适用于任何版本的 MySQL 二进制安装脚本，自动完成目录创建、用户创建、初始化、配置和启动
tags: [mysql, 安装, 脚本, 自动化]
---

# MySQL 一键安装脚本（通用版）

## 功能说明

该脚本支持安装任何版本的 MySQL（指定版本号即可），自动完成以下步骤：

- 创建 mysql 用户和组
- 解压二进制包并移动到安装目录
- 生成 my.cnf 配置文件
- 初始化数据库
- 设置环境变量
- 启动 MySQL 服务
- 修改 root 密码并允许远程访问

## 使用方式

```bash
# 1. 将 MySQL 二进制包放在脚本同级目录
# 2. 执行脚本，输入版本号
bash mysql_install.sh
```

## 脚本内容

```bash
#!/bin/bash
echo "-----------------------------开始MYSQL安装--------------------------------------"
start_time=$(date +%s)
echo -e "\e[31m***************一键安装mysql任何版本数据库******************\e[0m"
echo -e "输入安装版本，如\e[31m8.0.27\e[0m"
read version
find / -name mysql | xargs rm -rf
port=$(netstat -antup|grep mysql|wc -l)
if [ $port != 0 ]
then echo "mysql进程存在,请先杀掉进程"
ps -ef |grep mysqld
exit 1
fi
echo "-----------------创建所需目录及用户并上传安装包----------------------------"
current_dir=$(pwd)
echo "当前所在目录位置: $current_dir"
target_dir="/opt"
if [ ! -d "$target_dir" ]; then
    mkdir -p "$target_dir"
    echo "已创建目录: $target_dir"
fi
mv $current_dir/* $target_dir
echo "已将当前目录下所有文件移动至 $target_dir"
mkdir -p  /data/mysql
groupadd mysql
useradd -r -g mysql mysql
cd /opt/
tar -xvf mysql-$version-linux-glibc2.12-x86_64.tar.xz
mv mysql-$version-linux-glibc2.12-x86_64/  /usr/local/
cd /usr/local/
mv mysql-$version-linux-glibc2.12-x86_64/ mysql
chown -R mysql.mysql /usr/local/mysql/
echo "-----------------------------卸载原有的mysql组件--------------------------"
yum list installed | grep mariadb
yum -y remove mariadb*
yum remove mariadb*
chown mysql:mysql -R /data/mysql
touch /etc/my.cnf
chmod 644 /etc/my.cnf
MYSQL_ROOT_PASSWORD=123456
cat <<EOF >/etc/my.cnf
[mysqld]
user=mysql
basedir=/usr/local/mysql
datadir=/data/mysql
socket=/tmp/mysql.sock
log-error=/data/mysql/mysql.err
pid-file=/data/mysql/mysql.pid
server_id=1
port=3306
character-set-server=utf8
innodb_rollback_on_timeout = ON
collation-server=utf8_general_ci
sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
lower_case_table_names=1
max_connections=10000
sync_binlog=1
binlog_format=row
log-bin=mysql-bin
expire_logs_days=30
[mysql]
socket=/tmp/mysql.sock
default-character-set=utf8
[client]
EOF
echo "-----------------------------------初始化数据库-----------------------------------"
cd /usr/local/mysql/bin
./mysqld --defaults-file=/etc/my.cnf --basedir=/usr/local/mysql/ --datadir=/data/mysql/ --user=mysql --initialize
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysql
path=$(grep 'MYSQL_HOME' /etc/profile|wc -l)
if [ $path !=  0 ]
  then
    echo -e "\e[31m MYSQL_HOME路径存在\e[0m"
  else
    echo "export MYSQL_HOME=/usr/local/mysql/bin" >> /etc/profile
    echo "export PATH=\$PATH:\$MYSQL_HOME"        >> /etc/profile
    source /etc/profile
fi
echo "---------------------------------启动MYSQL服务---------------------------------------"
service mysql start
echo 'export PATH=$PATH:/usr/local/mysql/bin:/usr/local/mysql/lib'>>/etc/profile
sleep 3
source /etc/profile
cat /data/mysql/mysql.err|grep password
chkconfig --add mysql
chkconfig mysql on
chkconfig --list mysql
echo "-----------------------------恭喜！MYSQL安装成功--------------------------------------"
end_time=$(date +%s)
execution_time=$((end_time - start_time))
echo "脚本执行时间：${execution_time} 秒"
MYSQL_OLDPASSWORD=`awk '/A temporary password/{print $NF}' /data/mysql/mysql.err`
mysqladmin  -uroot -p${MYSQL_OLDPASSWORD} password ${MYSQL_ROOT_PASSWORD}
mysql -uroot -p123456 -e "update mysql.user set host ='%' where user ='root';"
mysql -uroot -p123456 -e "flush privileges;"
mysql -uroot -p123456
```

## 注意事项

1. 将 MySQL 二进制包（如 `mysql-8.0.27-linux-glibc2.12-x86_64.tar.xz`）放在脚本同级目录
2. 默认 root 密码为 `123456`，可在脚本中修改 `MYSQL_ROOT_PASSWORD` 变量
3. 脚本会自动检测并卸载已安装的 MariaDB 组件
4. 支持 MySQL 5.7 及以上版本