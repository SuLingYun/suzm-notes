# 云平台运维笔记

> 本索引页汇总云平台相关的运维笔记，涵盖 VMware 虚拟化与 Kubernetes 容器编排两大核心领域。

---

## 文章列表

<CategoryList category="云平台" />

---

## VMware 简介

VMware vSphere 是业界领先的服务器虚拟化平台，通过将物理服务器抽象为计算资源池，实现资源利用率的最大化。其核心组件包括：

- **ESXi**：裸机 Hypervisor，直接运行于物理硬件之上，负责虚拟机调度与管理。
- **vCenter Server**：集中管理平台，提供集群管理、HA（高可用）、DRS（分布式资源调度）、vMotion 等高级功能。
- **vSphere Client**：Web 管理界面，支持 HTML5 访问。

VMware 虚拟化技术广泛应用于企业数据中心，是基础设施即服务（IaaS）的基石。

---

## Kubernetes 简介

Kubernetes（K8s）是 Google 开源的容器编排平台，已成为云原生计算的事实标准。它提供：

- **自动化部署与扩缩容**：通过声明式配置管理应用生命周期。
- **服务发现与负载均衡**：内置 DNS 和 Service 机制。
- **自愈能力**：自动重启失败的容器，替换和重新调度节点故障的 Pod。
- **存储编排**：支持多种存储后端，实现持久化存储。

Kubernetes 与 VMware 可协同构建混合云基础设施，VMware 提供底层计算资源，Kubernetes 负责上层应用编排。

---

> **更新日期**：2026-07-08