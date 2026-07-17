---
title: 云平台运维笔记
description: 云平台运维相关技术笔记
---

# 云平台运维笔记

本目录汇总云平台相关的运维笔记，涵盖 VMware 虚拟化与 Kubernetes 容器编排两大核心领域。

## 涵盖内容

- **VMware 虚拟化**：虚拟机运维、vSphere 管理、平台导入导出
- **Kubernetes**：容器编排入门、实战部署、集群管理
- **AI 部署**：DeepSeek 大模型部署、LLaMA-Factory NPU 环境搭建

## VMware 简介

VMware vSphere 是业界领先的服务器虚拟化平台，通过将物理服务器抽象为计算资源池，实现资源利用率的最大化。其核心组件包括：

- **ESXi**：裸机 Hypervisor，直接运行于物理硬件之上
- **vCenter Server**：集中管理平台，提供 HA、DRS、vMotion 等高级功能
- **vSphere Client**：Web 管理界面，支持 HTML5 访问

## Kubernetes 简介

Kubernetes（K8s）是 Google 开源的容器编排平台，已成为云原生计算的事实标准。它提供：

- **自动化部署与扩缩容**：通过声明式配置管理应用生命周期
- **服务发现与负载均衡**：内置 DNS 和 Service 机制
- **自愈能力**：自动重启失败的容器，替换故障 Pod
- **存储编排**：支持多种存储后端，实现持久化存储

> 持续更新中。