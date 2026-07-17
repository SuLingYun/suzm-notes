<script setup>
import { withBase } from 'vitepress'
import { data as posts } from './posts.data'
import { data as quickrefData } from './quickref.data'

const totalNotes = posts.length || 0
const totalQuickref = quickrefData.reduce((sum, q) => sum + q.count, 0) || 0
const totalArticles = totalNotes + totalQuickref

const quickrefDesc = `基于 jaywcjlove/reference 开源项目整理的中文技术速查手册，涵盖编程语言、前端框架、工具、命令等 15 个分类，共 ${totalQuickref} 篇，适合日常开发与运维快速查阅。`
const notesDesc = `十多年 IT 运维实战笔记，涵盖 Linux、网络、数据库、中间件、云平台、安全、自动化运维 7 个领域，共 ${totalNotes} 篇文章。踩过的坑都整理成了笔记，方便查阅。`
</script>

<template>
  <div class="home-page">
    <!-- 背景 -->
    <div class="home-bg">
      <div class="bg-glow bg-glow--1"></div>
      <div class="bg-glow bg-glow--2"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="home-inner">
      <!-- ========== Hero ========== -->
      <div class="hero">
        <div class="hero-badge">
          <span class="badge-pulse"></span>
          一个运维老兵的杂货铺
        </div>
        <h1 class="hero-title">
          <span class="hero-main">小弥渡的运维笔记</span>
          <span class="hero-sub">记不住的就查这里</span>
        </h1>
        <p class="hero-desc">
          十多年 IT 生涯，什么接触过一点！
          <br>
          踩过的坑写成笔记，用过的工具整理成手册。
        </p>
      </div>

      <!-- ========== 统计 ========== -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-val">{{ totalArticles }}<span class="stat-plus">+</span></span>
          <span class="stat-lbl">文章总数</span>
        </div>
        <div class="stat-div"></div>
        <div class="stat-item">
          <span class="stat-val">{{ totalQuickref }}<span class="stat-plus">+</span></span>
          <span class="stat-lbl">速查手册</span>
        </div>
        <div class="stat-div"></div>
        <div class="stat-item">
          <span class="stat-val">{{ totalNotes }}<span class="stat-plus">+</span></span>
          <span class="stat-lbl">笔记文章</span>
        </div>
      </div>

      <!-- ========== 入口卡片 ========== -->
      <div class="cards-row">
        <!-- 速查手册 -->
        <a :href="withBase('/quickref/')" class="entry-card entry-card--qr">
          <div class="card-icon-box" style="background:#e0f2fe;color:#0284c7">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div class="card-body">
            <h3 class="card-title">速查手册</h3>
            <p class="card-desc">{{ quickrefDesc }}</p>
          </div>
          <div class="card-footer">
            <span class="card-action">
              浏览手册
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </a>

        <!-- 笔记 -->
        <a :href="withBase('/notes/')" class="entry-card entry-card--notes">
          <div class="card-icon-box" style="background:#fef3c7;color:#d97706">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="card-body">
            <h3 class="card-title">笔记</h3>
            <p class="card-desc">{{ notesDesc }}</p>
          </div>
          <div class="card-footer">
            <span class="card-action">
              浏览笔记
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   首页 - 全屏带内容
   ============================================ */
.home-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 72px 24px 48px;
  overflow: hidden;
}

/* 背景 */
.home-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

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

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, var(--vp-c-text-3) 0.5px, transparent 0.5px);
  background-size: 32px 32px;
  opacity: 0.07;
  mask-image: radial-gradient(ellipse 50% 50% at center, black 25%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 50% 50% at center, black 25%, transparent 70%);
}

.home-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

/* ========== Hero ========== */
.hero {
  text-align: center;
  margin-bottom: 36px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 16px;
  border-radius: 100px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 24px;
}

.badge-pulse {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.hero-title { margin: 0 0 14px; }

.hero-main {
  display: block;
  font-size: clamp(34px, 5.5vw, 50px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, #3b82f6 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.dark .hero-main {
  background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  display: block;
  font-size: clamp(15px, 2.2vw, 20px);
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin-top: 6px;
  letter-spacing: 0.06em;
}

.hero-desc {
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  max-width: 440px;
  margin: 0 auto;
}

/* ========== 统计 ========== */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 36px;
  padding: 18px 40px;
  border-radius: 14px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0 36px;
}

.stat-val {
  font-size: 28px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
}
.dark .stat-val { color: #60a5fa; }

.stat-plus {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.7;
  margin-left: 1px;
}

.stat-lbl {
  font-size: 12px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.03em;
}

.stat-div {
  width: 1px;
  height: 36px;
  background: var(--vp-c-divider);
}

/* ========== 入口卡片 ========== */
.cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.entry-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  border-radius: 16px;
  text-decoration: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.entry-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.entry-card--qr::before { background: linear-gradient(90deg, #0284c7, #38bdf8); }
.entry-card--notes::before { background: linear-gradient(90deg, #d97706, #f59e0b); }

.entry-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}

.dark .entry-card:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.entry-card:hover::before { opacity: 1; }

.card-icon-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.card-body { flex: 1; }

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
}

.card-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.65;
}

.card-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
}

.card-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.3s ease;
}

.entry-card:hover .card-action {
  opacity: 1;
  transform: translateX(0);
}

.card-action svg {
  transition: transform 0.3s ease;
}

.entry-card:hover .card-action svg {
  transform: translateX(3px);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .home-page { padding: 64px 20px 40px; }

  .stats-row { padding: 16px 20px; }
  .stat-item { padding: 0 20px; }
  .stat-val { font-size: 24px; }

  .cards-row { grid-template-columns: 1fr; gap: 16px; }
}

@media (max-width: 639px) {
  .home-page { padding: 56px 16px 32px; }

  .stats-row {
    flex-direction: column;
    gap: 14px;
    padding: 20px 24px;
  }
  .stat-div { width: 40px; height: 1px; }
  .stat-item { padding: 0; }
}
</style>