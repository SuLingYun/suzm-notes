<script setup>
import { withBase } from 'vitepress'
import { ref, computed, onMounted } from 'vue'
import { data as posts } from './posts.data'
import { data as quickrefData } from './quickref.data'

const totalNotes = posts.length || 0
const totalQuickref = quickrefData.reduce((sum, q) => sum + q.count, 0) || 0

// 动态计算每个分类的文章数量，确保数字绝对准确
const categories = computed(() => {
  const counts = {}
  posts.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1
  })

  return [
    { name: 'Linux', icon: 'linux', count: counts['Linux'] || 0, color: '#f59e0b' },
    { name: '网络', icon: 'network', count: counts['网络'] || 0, color: '#3b82f6' },
    { name: '数据库', icon: 'database', count: counts['数据库'] || 0, color: '#06b6d4' },
    { name: '中间件', icon: 'middleware', count: counts['中间件'] || 0, color: '#8b5cf6' },
    { name: '云平台', icon: 'cloud', count: counts['云平台'] || 0, color: '#10b981' },
    { name: '安全', icon: 'security', count: counts['安全'] || 0, color: '#ef4444' },
    { name: '自动化', icon: 'automation', count: counts['自动化运维'] || 0, color: '#ec4899' },
    { name: '速查手册', icon: 'quickref', count: totalQuickref, color: '#0ea5e9' }
  ]
})

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
})
</script>

<template>
  <div class="home-page">
    <div class="home-bg">
      <div class="bg-glow bg-glow--1"></div>
      <div class="bg-glow bg-glow--2"></div>
      <div class="bg-glow bg-glow--3"></div>
      <div class="bg-grid"></div>
      <div class="bg-noise"></div>
    </div>

    <div class="home-inner">
      <div class="hero">
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

      <div class="categories-section">
        <div class="section-header">
          <h2 class="section-title">技术分类</h2>
          <p class="section-desc">涵盖 Linux、网络、数据库、云平台等运维核心领域</p>
        </div>

        <div class="categories-grid">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="category-card"
            :style="{ '--cat-color': cat.color }"
          >
            <div class="cat-icon">
              <svg v-if="cat.icon === 'linux'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              <svg v-else-if="cat.icon === 'network'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
              <svg v-else-if="cat.icon === 'database'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <svg v-else-if="cat.icon === 'middleware'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              <svg v-else-if="cat.icon === 'cloud'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19c0-3.03-2.47-5.5-5.5-5.5s-5.5 2.47-5.5 5.5"/><path d="M3.5 19c0-3.03 2.47-5.5 5.5-5.5s5.5 2.47 5.5 5.5"/></svg>
              <svg v-else-if="cat.icon === 'security'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <svg v-else-if="cat.icon === 'automation'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <svg v-else-if="cat.icon === 'quickref'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
            <div class="cat-info">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ cat.count }} 篇</span>
            </div>
          </div>
        </div>
      </div>

      <div class="featured-section">
        <div class="section-header">
          <h2 class="section-title">精选内容</h2>
        </div>

        <div class="featured-grid">
          <a :href="withBase('/quickref/')" class="featured-card featured-card--qr">
            <div class="card-ribbon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
              推荐
            </div>
            <div class="card-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
            <h3 class="card-title">速查手册</h3>
            <p class="card-desc">基于开源项目整理的中文技术速查手册，涵盖编程语言、前端框架、工具、命令等 15 个分类，适合日常开发与运维快速查阅。</p>
            <div class="card-footer">
              <span class="card-count">{{ totalQuickref }} 篇文档</span>
              <span class="card-action">
                浏览
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </a>

          <a :href="withBase('/notes/')" class="featured-card featured-card--notes">
            <div class="card-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="12" y1="11" x2="12" y2="17"/></svg>
            </div>
            <h3 class="card-title">运维笔记</h3>
            <p class="card-desc">十多年 IT 运维实战笔记，涵盖 Linux、网络、数据库、中间件、云平台、安全、自动化运维 7 个领域。踩过的坑都整理成了笔记。</p>
            <div class="card-footer">
              <span class="card-count">{{ totalNotes }} 篇文章</span>
              <span class="card-action">
                浏览
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  padding: 72px 24px 64px;
  overflow: hidden;
}

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
  max-width: 960px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 56px;
}

.hero-title {
  margin: 0 0 24px;
}

.hero-label {
  display: block;
  font-size: clamp(36px, 6vw, 56px);
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
  margin: 0 0 20px;
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

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.section-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin: 0;
}

.categories-section {
  margin-bottom: 56px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border-radius: 14px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--cat-color);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.category-card:hover::before {
  opacity: 1;
}

.dark .category-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.cat-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--cat-color) 12%, transparent);
  color: var(--cat-color);
  margin-bottom: 12px;
  flex-shrink: 0;
}

.dark .cat-icon {
  background: color-mix(in srgb, var(--cat-color) 15%, transparent);
}

.cat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.cat-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.cat-count {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.featured-section {
  margin-bottom: 24px;
}

.featured-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.featured-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 28px;
  border-radius: 16px;
  text-decoration: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.featured-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.featured-card--qr::before {
  background: linear-gradient(90deg, #0284c7, #06b6d4, #22d3ee);
}

.featured-card--notes::before {
  background: linear-gradient(90deg, #d97706, #f59e0b, #fbbf24);
}

.featured-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.featured-card:hover::before {
  opacity: 1;
}

.dark .featured-card:hover {
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.3);
}

.card-ribbon {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.card-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.featured-card--qr .card-icon-wrapper {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(2, 132, 199, 0.08));
  color: #06b6d4;
}

.featured-card--notes .card-icon-wrapper {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08));
  color: #d97706;
}

.dark .featured-card--qr .card-icon-wrapper {
  color: #22d3ee;
}

.dark .featured-card--notes .card-icon-wrapper {
  color: #fbbf24;
}

.featured-card .card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}

.featured-card .card-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.7;
  flex: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.card-count {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.card-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.featured-card--qr .card-action {
  color: #06b6d4;
}

.featured-card--notes .card-action {
  color: #d97706;
}

.dark .featured-card--qr .card-action {
  color: #22d3ee;
}

.dark .featured-card--notes .card-action {
  color: #fbbf24;
}

.card-action svg {
  transition: transform 0.3s ease;
}

.featured-card:hover .card-action svg {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .home-page { padding: 64px 20px 48px; }

  .categories-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }

  .featured-grid { grid-template-columns: 1fr; gap: 16px; }
}

@media (max-width: 639px) {
  .home-page { padding: 56px 16px 40px; }

  .hero { margin-bottom: 48px; }

  .categories-section { margin-bottom: 48px; }

  .categories-grid { grid-template-columns: 1fr; gap: 12px; }

  .category-card { padding: 18px; }

  .featured-card { padding: 24px; }
}
</style>