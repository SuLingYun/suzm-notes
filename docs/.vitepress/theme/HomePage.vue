<script setup>
import { withBase } from 'vitepress'
import { ref, onMounted } from 'vue'
import { data as posts } from './posts.data'
import { data as quickrefData } from './quickref.data'

const totalNotes = posts.length || 0
const totalQuickref = quickrefData.reduce((sum, q) => sum + q.count, 0) || 0
const totalArticles = totalNotes + totalQuickref

const quickrefDesc = `基于 jaywcjlove/reference 开源项目整理的中文技术速查手册，涵盖编程语言、前端框架、工具、命令等 15 个分类，共 ${totalQuickref} 篇，适合日常开发与运维快速查阅。`
const notesDesc = `十多年 IT 运维实战笔记，涵盖 Linux、网络、数据库、中间件、云平台、安全、自动化运维 7 个领域，共 ${totalNotes} 篇文章。踩过的坑都整理成了笔记，方便查阅。`

// 打字机效果
const displayText = ref('')
const fullText = '记不住的就查这里'
let charIndex = 0
let isDeleting = false

onMounted(() => {
  const typeInterval = setInterval(() => {
    if (!isDeleting) {
      displayText.value = fullText.slice(0, charIndex + 1)
      charIndex++
      if (charIndex === fullText.length) {
        setTimeout(() => { isDeleting = true }, 2000)
      }
    } else {
      displayText.value = fullText.slice(0, charIndex - 1)
      charIndex--
      if (charIndex === 0) {
        isDeleting = false
      }
    }
  }, 120)

  // 数字动画
  const statNumbers = document.querySelectorAll('.stat-number')
  const animateNumbers = () => {
    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target)
      if (isNaN(target)) return
      let current = 0
      const step = Math.max(1, Math.floor(target / 40))
      const timer = setInterval(() => {
        current += step
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        el.textContent = current
      }, 30)
    })
  }

  // 用 IntersectionObserver 触发数字动画
  const statsRow = document.querySelector('.stats-row')
  if (statsRow) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumbers()
          observer.disconnect()
        }
      })
    }, { threshold: 0.3 })
    observer.observe(statsRow)
  }
})
</script>

<template>
  <div class="home-page">
    <!-- 背景装饰 -->
    <div class="home-bg">
      <div class="bg-glow bg-glow--1"></div>
      <div class="bg-glow bg-glow--2"></div>
      <div class="bg-glow bg-glow--3"></div>
      <div class="bg-grid"></div>
      <div class="bg-noise"></div>
    </div>

    <div class="home-inner">
      <!-- ========== Hero ========== -->
      <div class="hero">
        <div class="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          ops@notes
          <span class="badge-dot"></span>
        </div>

        <h1 class="hero-title">
          <span class="hero-label">小弥渡的运维笔记</span>
        </h1>

        <p class="hero-type">
          <span class="type-prompt">$</span>
          <span class="type-text">{{ displayText }}</span>
          <span class="type-cursor" :class="{ blink: displayText.length === fullText.length }">|</span>
        </p>

        <p class="hero-desc">
          十多年 IT 生涯，什么接触过一点。踩过的坑写成笔记，用过的工具整理成手册。
        </p>
      </div>

      <!-- ========== 统计 ========== -->
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-icon stat-icon--total">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number" data-target="0">{{ totalArticles }}</span>
            <span class="stat-label">文章总数</span>
          </div>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-item">
          <div class="stat-icon stat-icon--qr">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number" data-target="0">{{ totalQuickref }}</span>
            <span class="stat-label">速查手册</span>
          </div>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-item">
          <div class="stat-icon stat-icon--notes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-number" data-target="0">{{ totalNotes }}</span>
            <span class="stat-label">笔记文章</span>
          </div>
        </div>
      </div>

      <!-- ========== 入口卡片 ========== -->
      <div class="cards-row">
        <a :href="withBase('/quickref/')" class="entry-card entry-card--qr">
          <div class="card-bg-pattern"></div>
          <div class="card-top">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
            <div class="card-label">
              <span class="card-label-count">{{ totalQuickref }}</span>
              <span class="card-label-text">篇文档</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">速查手册</h3>
            <p class="card-desc">{{ quickrefDesc }}</p>
          </div>
          <div class="card-bottom">
            <span class="card-action">
              浏览手册
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </a>

        <a :href="withBase('/notes/')" class="entry-card entry-card--notes">
          <div class="card-bg-pattern"></div>
          <div class="card-top">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="12" y1="11" x2="12" y2="17"/></svg>
            </div>
            <div class="card-label">
              <span class="card-label-count">{{ totalNotes }}</span>
              <span class="card-label-text">篇文章</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">笔记</h3>
            <p class="card-desc">{{ notesDesc }}</p>
          </div>
          <div class="card-bottom">
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
   首页 - 全屏技术文档风格
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

/* ========== 背景 ========== */
.home-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
}
.bg-glow--1 {
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 700px;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
}
.dark .bg-glow--1 {
  background: radial-gradient(ellipse, rgba(96, 165, 250, 0.12) 0%, transparent 70%);
}
.bg-glow--2 {
  bottom: -15%;
  right: -8%;
  width: 500px;
  height: 500px;
  background: radial-gradient(ellipse, rgba(6, 182, 212, 0.12) 0%, transparent 70%);
}
.dark .bg-glow--2 {
  background: radial-gradient(ellipse, rgba(34, 211, 238, 0.08) 0%, transparent 70%);
}
.bg-glow--3 {
  top: 40%;
  left: -10%;
  width: 350px;
  height: 350px;
  background: radial-gradient(ellipse, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
}
.dark .bg-glow--3 {
  background: radial-gradient(ellipse, rgba(129, 140, 248, 0.06) 0%, transparent 70%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(128, 128, 128, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(128, 128, 128, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 60% 50% at center, black 20%, transparent 65%);
  -webkit-mask-image: radial-gradient(ellipse 60% 50% at center, black 20%, transparent 65%);
}

.bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.015;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
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
  margin-bottom: 40px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 28px;
  letter-spacing: 0.02em;
  transition: border-color 0.3s;
}
.hero-badge svg {
  opacity: 0.7;
}
.hero-badge:hover {
  border-color: var(--vp-c-brand-1);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(34, 197, 94, 0.5); }
  50% { opacity: 0.5; box-shadow: 0 0 2px rgba(34, 197, 94, 0.2); }
}

.hero-title {
  margin: 0 0 20px;
}

.hero-label {
  display: block;
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, #3b82f6 45%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.dark .hero-label {
  background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 45%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-type {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace;
  font-size: clamp(15px, 2vw, 18px);
  color: var(--vp-c-text-2);
  margin: 0 0 16px;
  min-height: 28px;
}

.type-prompt {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  opacity: 0.8;
}

.type-text {
  letter-spacing: 0.04em;
}

.type-cursor {
  font-weight: 300;
  color: var(--vp-c-brand-1);
  opacity: 0.8;
  animation: cursorBlink 0.8s step-end infinite;
}
.type-cursor.blink {
  animation: cursorBlink 0.8s step-end infinite;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0; }
}

.hero-desc {
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  max-width: 480px;
  margin: 0 auto;
}

/* ========== 统计 ========== */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 40px;
  padding: 20px 32px;
  border-radius: 14px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s;
}
.stats-row:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.dark .stats-row:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 32px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}
.stat-icon--total {
  background: rgba(37, 99, 235, 0.1);
  color: #3b82f6;
}
.dark .stat-icon--total {
  background: rgba(96, 165, 250, 0.12);
  color: #60a5fa;
}
.stat-icon--qr {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}
.dark .stat-icon--qr {
  background: rgba(34, 211, 238, 0.12);
  color: #22d3ee;
}
.stat-icon--notes {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}
.dark .stat-icon--notes {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stat-number {
  font-size: 26px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.stat-label {
  font-size: 12px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.03em;
}

.stat-divider {
  width: 1px;
  height: 38px;
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.card-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.entry-card--qr .card-bg-pattern {
  background: radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.06) 0%, transparent 60%);
}
.entry-card--notes .card-bg-pattern {
  background: radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.06) 0%, transparent 60%);
}
.entry-card:hover .card-bg-pattern {
  opacity: 1;
}

.entry-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.entry-card--qr::before {
  background: linear-gradient(90deg, #0284c7, #06b6d4, #22d3ee);
}
.entry-card--notes::before {
  background: linear-gradient(90deg, #d97706, #f59e0b, #fbbf24);
}
.entry-card:hover::before {
  opacity: 1;
}

.entry-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}
.dark .entry-card:hover {
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.3);
}

/* 卡片顶部 */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

.card-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}
.entry-card--qr .card-icon {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(2, 132, 199, 0.08));
  color: #06b6d4;
}
.entry-card--notes .card-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08));
  color: #d97706;
}
.dark .entry-card--qr .card-icon {
  color: #22d3ee;
}
.dark .entry-card--notes .card-icon {
  color: #fbbf24;
}

.card-label {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
}
.entry-card--qr .card-label {
  background: rgba(6, 182, 212, 0.08);
  color: #06b6d4;
}
.entry-card--notes .card-label {
  background: rgba(245, 158, 11, 0.08);
  color: #d97706;
}
.dark .entry-card--qr .card-label {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
}
.dark .entry-card--notes .card-label {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.card-label-count {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.card-label-text {
  font-weight: 400;
  opacity: 0.8;
}

/* 卡片主体 */
.card-body {
  flex: 1;
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.card-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.7;
}

/* 卡片底部 */
.card-bottom {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  position: relative;
  z-index: 1;
}

.card-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  transition: all 0.3s ease;
}
.entry-card--qr .card-action {
  color: #06b6d4;
}
.entry-card--notes .card-action {
  color: #d97706;
}
.dark .entry-card--qr .card-action {
  color: #22d3ee;
}
.dark .entry-card--notes .card-action {
  color: #fbbf24;
}

.card-action svg {
  transition: transform 0.3s ease;
}

.entry-card:hover .card-action svg {
  transform: translateX(4px);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .home-page { padding: 64px 20px 40px; }

  .stats-row { padding: 18px 16px; }
  .stat-item { padding: 0 16px; gap: 10px; }
  .stat-icon { width: 34px; height: 34px; }
  .stat-number { font-size: 22px; }

  .cards-row { grid-template-columns: 1fr; gap: 16px; }
}

@media (max-width: 639px) {
  .home-page { padding: 56px 16px 32px; }

  .stats-row {
    flex-direction: column;
    gap: 16px;
    padding: 20px 24px;
  }
  .stat-divider { width: 40px; height: 1px; }
  .stat-item { padding: 0; width: 100%; justify-content: center; }
}
</style>