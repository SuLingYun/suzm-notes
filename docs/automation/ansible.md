---
title: Ansible 入门与实战
description: 从零开始学习 Ansible 配置管理，包括批量部署、配置同步、滚动更新等实战场景
date: 2026-07-09
tags:
  - Ansible
  - 配置管理
  - 自动化运维
---

# Ansible 入门与实战

## 一、环境准备

### 1.1 安装 Ansible

```bash
# CentOS/RHEL 7+
yum install ansible -y

# Ubuntu/Debian
apt update && apt install ansible -y

# 查看版本
ansible --version
```

### 1.2 配置主机清单

```ini
# /etc/ansible/hosts
[webservers]
web01 ansible_host=192.168.1.101 ansible_user=root
web02 ansible_host=192.168.1.102 ansible_user=root

[dbservers]
db01 ansible_host=192.168.1.201 ansible_user=root
db02 ansible_host=192.168.1.202 ansible_user=root

[all:vars]
ansible_ssh_private_key_file=/root/.ssh/id_rsa
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
```

### 1.3 密钥免密登录

```bash
# 在控制节点生成密钥
ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa

# 批量分发公钥
ansible all -m copy -a "src=~/.ssh/id_rsa.pub dest=~/.ssh/authorized_keys mode=0600" --ask-pass
```

## 二、常用模块实战

### 2.1 文件操作

```yaml
---
- name: 文件操作示例
  hosts: webservers
  tasks:
    - name: 创建目录
      ansible.builtin.file:
        path: /opt/app
        state: directory
        mode: '0755'
        owner: www
        group: www

    - name: 复制配置文件
      ansible.builtin.copy:
        src: ./nginx.conf
        dest: /etc/nginx/nginx.conf
        backup: yes
        mode: '0644'

    - name: 模板文件
      ansible.builtin.template:
        src: ./app.conf.j2
        dest: /etc/app/app.conf
```

### 2.2 包管理

```yaml
- name: 安装常用软件
  hosts: all
  tasks:
    - name: 安装 Nginx
      ansible.builtin.yum:
        name: nginx
        state: latest

    - name: 安装 Python3
      ansible.builtin.yum:
        name: python3
        state: present
```

### 2.3 服务管理

```yaml
- name: 管理服务状态
  hosts: webservers
  tasks:
    - name: 启动并启用 Nginx
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: yes
        daemon_reload: yes
```

## 三、Playbook 实战

### 3.1 完整的 Nginx 部署 Playbook

```yaml
---
- name: 部署 Nginx 服务
  hosts: webservers
  become: yes
  vars:
    nginx_version: "1.24"
    worker_processes: "auto"
    worker_connections: 65535

  tasks:
    - name: 安装依赖
      yum:
        name: gcc pcre-devel zlib-devel openssl-devel
        state: present

    - name: 创建 Nginx 用户
      user:
        name: www
        shell: /sbin/nologin
        create_home: no

    - name: 下载 Nginx
      get_url:
        url: "http://nginx.org/download/nginx-{{ nginx_version }}.tar.gz"
        dest: /tmp/nginx-{{ nginx_version }}.tar.gz

    - name: 编译安装
      shell: |
        cd /tmp && tar -xzf nginx-{{ nginx_version }}.tar.gz
        cd nginx-{{ nginx_version }}
        ./configure --prefix=/usr/local/nginx \
          --user=www \
          --group=www \
          --with-http_stub_status_module \
          --with-http_ssl_module \
          --with-http_gzip_static_module
        make -j4 && make install

    - name: 创建 systemd 服务
      template:
        src: nginx.service.j2
        dest: /etc/systemd/system/nginx.service

    - name: 启动 Nginx
      systemd:
        name: nginx
        state: started
        enabled: yes
```

### 3.2 滚动更新

```yaml
---
- name: 滚动更新应用
  hosts: webservers
  serial: 1
  become: yes
  tasks:
    - name: 停止应用
      systemd:
        name: myapp
        state: stopped

    - name: 部署新版本
      unarchive:
        src: ./myapp-v2.0.tar.gz
        dest: /opt/app/
        remote_src: no

    - name: 启动应用
      systemd:
        name: myapp
        state: started

    - name: 健康检查
      uri:
        url: http://localhost:8080/health
        status_code: 200
```

## 四、Roles 最佳实践

```
roles/
├── nginx/
│   ├── defaults/
│   │   └── main.yml
│   ├── files/
│   │   └── nginx.conf
│   ├── handlers/
│   │   └── main.yml
│   ├── meta/
│   │   └── main.yml
│   ├── tasks/
│   │   ├── install.yml
│   │   ├── config.yml
│   │   └── main.yml
│   ├── templates/
│   │   └── nginx.conf.j2
│   └── vars/
│       └── main.yml
└── mysql/
    └── ...
```

## 五、常用命令速查

| 命令 | 用途 |
|------|------|
| `ansible all -m ping` | 测试主机连通性 |
| `ansible web -a "uptime"` | 执行单条命令 |
| `ansible-playbook site.yml` | 执行 Playbook |
| `ansible-playbook -l web01 site.yml` | 指定主机执行 |
| `ansible-playbook --check site.yml` | 模拟执行（不实际操作） |
| `ansible-playbook -v site.yml` | 详细输出 |

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
