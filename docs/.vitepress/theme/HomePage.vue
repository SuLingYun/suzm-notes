<script setup>
import { withBase } from 'vitepress'
</script>

<template>
  <div class="home-hero">
    <!-- 背景装饰 -->
    <div class="home-bg">
      <div class="bg-glow bg-glow--1"></div>
      <div class="bg-glow bg-glow--2"></div>
      <div class="bg-grid"></div>
      <div class="bg-orbs">
        <span class="orb orb--1"></span>
        <span class="orb orb--2"></span>
        <span class="orb orb--3"></span>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="home-content">
      <!-- 徽章 -->
      <div class="home-badge">
        <span class="badge-pulse"></span>
        一个运维老兵的杂货铺
      </div>

      <!-- 标题 -->
      <h1 class="home-title">
        <span class="title-main">小弥渡的运维笔记</span>
        <span class="title-sub">记不住的就查这里</span>
      </h1>

      <!-- 描述 -->
      <p class="home-desc">
        十多年 IT 生涯，什么接触过一点！
        <br>
        踩过的坑写成笔记，用过的工具整理成手册。
      </p>

      <!-- 操作按钮 -->
      <div class="home-actions">
        <a :href="withBase('/quickref/')" class="action-btn action-btn--primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>速查手册</span>
          <svg class="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
        <a :href="withBase('/notes/')" class="action-btn action-btn--secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <span>笔记</span>
          <svg class="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>

      <!-- 统计 -->
      <div class="home-stats">
        <div class="stat-item">
          <span class="stat-value">271<span class="stat-plus">+</span></span>
          <span class="stat-label">笔记文章</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">212<span class="stat-plus">+</span></span>
          <span class="stat-label">速查手册</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   全屏首页
   ============================================ */
.home-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 80px 24px;
  overflow: hidden;
  text-align: center;
}

/* ============================================
   背景
   ============================================ */
.home-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* 发光 */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
}

.bg-glow--1 {
  top: -15%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
}
.dark .bg-glow--1 {
  background: radial-gradient(ellipse, rgba(96, 165, 250, 0.15) 0%, transparent 70%);
}

.bg-glow--2 {
  bottom: -10%;
  right: -5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
}
.dark .bg-glow--2 {
  background: radial-gradient(ellipse, rgba(34, 211, 238, 0.1) 0%, transparent 70%);
}

/* 网格 */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, var(--vp-c-text-3) 0.5px, transparent 0.5px);
  background-size: 36px 36px;
  opacity: 0.07;
  mask-image: radial-gradient(ellipse 50% 45% at center, black 25%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 50% 45% at center, black 25%, transparent 70%);
}

/* 浮动装饰球 */
.bg-orbs {
  position: absolute;
  inset: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  animation: float 8s ease-in-out infinite;
}

.orb--1 {
  top: 18%;
  left: 12%;
  width: 80px;
  height: 80px;
  background: var(--vp-c-brand-1);
  animation-delay: 0s;
}

.orb--2 {
  bottom: 20%;
  right: 15%;
  width: 60px;
  height: 60px;
  background: #06b6d4;
  animation-delay: -3s;
}

.orb--3 {
  top: 40%;
  right: 25%;
  width: 40px;
  height: 40px;
  background: #8b5cf6;
  animation-delay: -6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}

/* ============================================
   主内容
   ============================================ */
.home-content {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
}

/* 徽章 */
.home-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 18px;
  border-radius: 100px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 28px;
  letter-spacing: 0.02em;
}

.badge-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 标题 */
.home-title {
  margin: 0 0 18px;
}

.title-main {
  display: block;
  font-size: clamp(38px, 6vw, 56px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, #3b82f6 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .title-main {
  background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-sub {
  display: block;
  font-size: clamp(16px, 2.2vw, 22px);
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin-top: 8px;
  letter-spacing: 0.08em;
}

/* 描述 */
.home-desc {
  font-size: 15px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
  max-width: 440px;
  margin: 0 auto 36px;
}

/* 按钮 */
.home-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 32px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.action-btn--primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
}

.action-btn--primary:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
}

.action-btn--secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.action-btn--secondary:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.dark .action-btn--secondary:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.action-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* 统计 */
.home-stats {
  display: inline-flex;
  align-items: center;
  gap: 0;
  padding: 20px 48px;
  border-radius: 16px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0 32px;
}

.stat-value {
  font-size: 30px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.dark .stat-value {
  color: #60a5fa;
}

.stat-plus {
  font-size: 20px;
  font-weight: 600;
  opacity: 0.7;
  margin-left: 1px;
}

.stat-label {
  font-size: 12px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.03em;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--vp-c-divider);
}

/* ============================================
   响应式
   ============================================ */
@media (max-width: 768px) {
  .home-hero {
    padding: 72px 20px 48px;
    min-height: 100vh;
  }

  .home-stats {
    padding: 16px 20px;
  }

  .stat-item {
    padding: 0 20px;
  }

  .stat-value {
    font-size: 26px;
  }
}

@media (max-width: 639px) {
  .home-hero {
    padding: 64px 16px 40px;
  }

  .home-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .home-stats {
    flex-direction: column;
    gap: 12px;
    padding: 20px 32px;
  }

  .stat-divider {
    width: 40px;
    height: 1px;
  }

  .stat-item {
    padding: 0;
  }
}
</style>