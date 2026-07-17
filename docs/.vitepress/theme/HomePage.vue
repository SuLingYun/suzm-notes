<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from './posts.data'
import { data as quickrefData } from './quickref.data'

// 笔记分类
const categories = [
  {
    id: 'linux',
    title: 'Linux 运维',
    emoji: '🐧',
    desc: '系统调优·故障排查·Shell 脚本',
    color: '#2563eb',
    count: 14
  },
  {
    id: 'network',
    title: '网络',
    emoji: '🌐',
    desc: '路由交换·防火墙·VPN·组网',
    color: '#0d9488',
    count: 11
  },
  {
    id: 'security',
    title: '安全',
    emoji: '🛡️',
    desc: '渗透测试·审计·合规·加固',
    color: '#dc2626',
    count: 6
  },
  {
    id: 'database',
    title: '数据库',
    emoji: '🗄️',
    desc: 'MySQL·Redis·MongoDB·达梦',
    color: '#9333ea',
    count: 9
  },
  {
    id: 'middleware',
    title: '中间件',
    emoji: '⚙️',
    desc: 'Nginx·Tomcat·Docker·K8s',
    color: '#ea580c',
    count: 6
  },
  {
    id: 'cloud',
    title: '云平台',
    emoji: '☁️',
    desc: 'VMware·K8s·混合云·AI 部署',
    color: '#0891b2',
    count: 6
  },
  {
    id: 'automation',
    title: '自动化运维',
    emoji: '🤖',
    desc: 'Ansible·Jenkins·Prometheus·Zabbix',
    color: '#16a34a',
    count: 7
  }
]

// 分类颜色映射
const categoryColors = {
  'Linux': '#2563eb',
  '网络': '#0d9488',
  '安全': '#dc2626',
  '数据库': '#9333ea',
  '中间件': '#ea580c',
  '云平台': '#0891b2',
  '自动化运维': '#16a34a'
}

function getCategoryColor(category) {
  return categoryColors[category] || '#6b7280'
}

// 统计数字动画
const totalArticles = posts.length || 59
const totalQuickref = quickrefData.reduce((sum, q) => sum + q.count, 0)

const stats = ref([
  { label: '笔记文章', value: 0, target: totalArticles, suffix: '' },
  { label: '速查手册', value: 0, target: totalQuickref, suffix: '' },
  { label: '分类总计', value: 0, target: 22, suffix: '' },
  { label: '持续更新', value: 0, target: 2026, suffix: '' }
])

onMounted(() => {
  setTimeout(() => {
    stats.value.forEach((stat, i) => {
      setTimeout(() => {
        const step = Math.max(1, Math.ceil(stat.target / 25))
        const timer = setInterval(() => {
          if (stat.value >= stat.target) {
            stat.value = stat.target
            clearInterval(timer)
          } else {
            stat.value = Math.min(stat.value + step, stat.target)
          }
        }, 28)
      }, i * 180)
    })
  }, 400)
})
</script>

<template>
  <div class="home-page">

    <!-- ============================================
         HERO 区域
         ============================================ -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-glow hero-glow--1"></div>
        <div class="hero-glow hero-glow--2"></div>
        <div class="hero-dots"></div>
      </div>

      <div class="hero-inner">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          一个运维老兵的杂货铺
        </div>

        <h1 class="hero-title">
          <span class="hero-main">小弥渡的运维笔记</span>
          <span class="hero-sub">记不住的就查这里</span>
        </h1>

        <p class="hero-desc">
          十多年 IT 生涯，什么都会一点，什么都不精通。<br class="hide-mobile">
          踩过的坑写成笔记，用过的工具整理成手册。
        </p>

        <div class="hero-actions">
          <a :href="withBase('/linux/')" class="btn btn--primary">
            <span>开始阅读</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a :href="withBase('/quickref/')" class="btn btn--ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            <span>浏览手册</span>
          </a>
          <a :href="withBase('/about')" class="btn btn--ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>关于我</span>
          </a>
        </div>

        <div class="hero-metrics">
          <div class="hm-item">
            <span class="hm-value">{{ totalQuickref }}</span>
            <span class="hm-label">速查手册</span>
          </div>
          <div class="hm-dot"></div>
          <div class="hm-item">
            <span class="hm-value">{{ totalArticles }}</span>
            <span class="hm-label">笔记文章</span>
          </div>
          <div class="hm-dot"></div>
          <div class="hm-item">
            <span class="hm-value">22</span>
            <span class="hm-label">分类</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         统计条
         ============================================ -->
    <section class="stats">
      <div class="stats-inner">
        <div v-for="(s, i) in stats" :key="i" class="stat-cell">
          <span class="stat-num">{{ s.value }}{{ s.suffix || '+' }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <!-- ============================================
         笔记分类
         ============================================ -->
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          笔记分类
        </h2>
        <p class="section-desc">系统化整理，快速定位</p>
      </div>

      <div class="card-grid card-grid--notes">
        <a
          v-for="cat in categories"
          :key="cat.id"
          :href="withBase('/' + cat.id + '/')"
          class="card card--note"
          :style="{ '--c': cat.color }"
        >
          <span class="card-emoji">{{ cat.emoji }}</span>
          <div class="card-body">
            <h3 class="card-title">{{ cat.title }}</h3>
            <p class="card-desc">{{ cat.desc }}</p>
          </div>
          <div class="card-meta">
            <span class="card-count">{{ cat.count }} 篇</span>
            <svg class="card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </a>
      </div>
    </section>

    <!-- ============================================
         速查手册
         ============================================ -->
    <section class="section section--quickref">
      <div class="section-head">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          速查手册
        </h2>
        <p class="section-desc">基于真实分类，共 {{ totalQuickref }} 篇</p>
      </div>

      <div class="card-grid card-grid--quickref">
        <a
          v-for="qr in quickrefData"
          :key="qr.key"
          :href="withBase(qr.path)"
          class="card card--qr"
          :style="{ '--c': qr.color }"
        >
          <div class="qr-top">
            <span class="qr-name">{{ qr.name }}</span>
            <span class="qr-badge">{{ qr.count }}</span>
          </div>
          <div class="qr-bar">
            <span class="qr-bar-fill" :style="{ width: (qr.count / 31) * 100 + '%' }"></span>
          </div>
          <div class="qr-footer">
            <span class="qr-action">浏览 →</span>
          </div>
        </a>
      </div>

      <div class="section-cta">
        <a :href="withBase('/quickref/')" class="cta-link">
          查看全部速查手册
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </section>

    <!-- ============================================
         最近更新
         ============================================ -->
    <section class="section section--recent">
      <div class="section-head">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          最近更新
        </h2>
        <p class="section-desc">最新的技术笔记</p>
      </div>

      <div class="card-grid card-grid--posts">
        <a
          v-for="post in posts.slice(0, 12)"
          :key="post.url"
          :href="withBase(post.url)"
          class="card card--post"
        >
          <div class="post-top">
            <span class="post-tag" :style="{ '--t': getCategoryColor(post.category) }">
              {{ post.category }}
            </span>
            <span class="post-date">{{ post.date }}</span>
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <p v-if="post.description" class="post-desc">{{ post.description }}</p>
          <div class="post-bottom">
            <span class="post-read">
              阅读全文
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </a>
      </div>

      <div class="section-cta">
        <span class="stats-text">共 {{ totalArticles }} 篇文章 · 持续更新中</span>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ============================================
   全局
   ============================================ */
.home-page {
  overflow-x: hidden;
}

.section {
  max-width: 1152px;
  margin: 0 auto;
  padding: 64px 24px 0;
}
.section--recent { padding-bottom: 64px; }

.section-head {
  text-align: center;
  margin-bottom: 36px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px;
  color: var(--vp-c-text-1);
}

.section-title svg {
  color: var(--vp-c-brand-1);
  opacity: 0.8;
}

.section-desc {
  font-size: 14px;
  color: var(--vp-c-text-3);
  margin: 0;
}

.section-cta {
  text-align: center;
  margin-top: 32px;
}

.cta-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 10px;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.cta-link:hover {
  background: var(--vp-c-brand-soft);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
  gap: 10px;
}

.stats-text {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* ============================================
   HERO
   ============================================ */
.hero {
  position: relative;
  overflow: hidden;
  padding: 80px 24px 56px;
  text-align: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.hero-glow--1 {
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 500px;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
}
.dark .hero-glow--1 {
  background: radial-gradient(ellipse, rgba(96, 165, 250, 0.12) 0%, transparent 70%);
}

.hero-glow--2 {
  bottom: -10%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(6, 182, 212, 0.12) 0%, transparent 70%);
}
.dark .hero-glow--2 {
  background: radial-gradient(ellipse, rgba(34, 211, 238, 0.08) 0%, transparent 70%);
}

.hero-dots {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, var(--vp-c-text-3) 0.5px, transparent 0.5px);
  background-size: 32px 32px;
  opacity: 0.08;
  mask-image: radial-gradient(ellipse 50% 40% at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 50% 40% at center, black 30%, transparent 70%);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 100px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 24px;
  letter-spacing: 0.02em;
}

.badge-dot {
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

.hero-title {
  margin: 0 0 14px;
}

.hero-main {
  display: block;
  font-size: clamp(34px, 5.5vw, 52px);
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
  font-size: clamp(15px, 2vw, 20px);
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin-top: 6px;
  letter-spacing: 0.06em;
}

.hero-desc {
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  max-width: 480px;
  margin: 0 auto 28px;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;
}

.btn--primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
}
.btn--primary:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
}

.btn--ghost {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.btn--ghost:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

/* Hero 指标 */
.hero-metrics {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 44px;
  padding-top: 28px;
  border-top: 1px solid var(--vp-c-divider);
}

.hm-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.hm-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  font-variant-numeric: tabular-nums;
}

.hm-label {
  font-size: 11px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.04em;
}

.hm-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--vp-c-divider);
}

/* ============================================
   统计条
   ============================================ */
.stats {
  padding: 0 24px;
  max-width: 900px;
  margin: 0 auto;
}

.stats-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--vp-c-divider);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 14px 22px;
  background: var(--vp-c-bg);
  gap: 4px;
}

.stat-num {
  font-size: 26px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
}

.dark .stat-num { color: #60a5fa; }

.stat-label {
  font-size: 12px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.02em;
}

/* ============================================
   卡片网格
   ============================================ */
.card-grid {
  display: grid;
  gap: 16px;
}

.card-grid--notes {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.card-grid--quickref {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.card-grid--posts {
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
}

/* ============================================
   笔记分类卡片
   ============================================ */
.card--note {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 14px;
  text-decoration: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid transparent;
  border-left-color: var(--c);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.card--note:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--c) 12%, transparent);
  border-color: var(--c);
}

.dark .card--note:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.card-emoji {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 12px;
  display: block;
}

.card-body { flex: 1; }

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
}

.card-desc {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.card-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--c);
}

.card-arrow {
  color: var(--vp-c-text-3);
  transition: transform 0.3s ease, color 0.3s ease;
}

.card--note:hover .card-arrow {
  transform: translateX(4px);
  color: var(--c);
}

/* ============================================
   速查手册卡片
   ============================================ */
.card--qr {
  display: flex;
  flex-direction: column;
  padding: 18px 20px;
  border-radius: 12px;
  text-decoration: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card--qr:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--c) 10%, transparent);
  border-color: var(--c);
}

.dark .card--qr:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.qr-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.qr-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.qr-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: color-mix(in srgb, var(--c) 14%, transparent);
  color: var(--c);
}

.qr-bar {
  height: 4px;
  border-radius: 4px;
  background: var(--vp-c-divider);
  overflow: hidden;
  margin-bottom: 10px;
}

.qr-bar-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--c);
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.card--qr:hover .qr-bar-fill {
  opacity: 1;
}

.qr-footer {
  display: flex;
  justify-content: flex-end;
}

.qr-action {
  font-size: 11px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  transition: all 0.25s ease;
}

.card--qr:hover .qr-action {
  color: var(--c);
}

/* ============================================
   文章卡片
   ============================================ */
.card--post {
  display: flex;
  flex-direction: column;
  padding: 22px;
  border-radius: 14px;
  text-decoration: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card--post:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-brand-1);
}

.dark .card--post:hover {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
}

.post-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.post-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--t) 14%, transparent);
  color: var(--t);
}

.post-date {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.post-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 6px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin: 0 0 auto;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-bottom {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.post-read {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.25s ease;
}

.card--post:hover .post-read {
  opacity: 1;
  transform: translateX(0);
}

/* ============================================
   响应式
   ============================================ */
@media (max-width: 960px) {
  .card-grid--posts { grid-template-columns: repeat(2, 1fr); }

  .section--quickref {
    background: none;
  }
}

@media (max-width: 768px) {
  .hero { padding: 60px 20px 44px; }

  .stats-inner { grid-template-columns: repeat(2, 1fr); }

  .card-grid--notes { grid-template-columns: repeat(2, 1fr); }
  .card-grid--quickref { grid-template-columns: repeat(3, 1fr); }

  .hide-mobile { display: none; }
}

@media (max-width: 639px) {
  .card-grid--notes { grid-template-columns: 1fr; }
  .card-grid--quickref { grid-template-columns: repeat(2, 1fr); }
  .card-grid--posts { grid-template-columns: 1fr; }

  .section { padding: 48px 16px 0; }
  .section--recent { padding-bottom: 48px; }

  .hero-metrics { gap: 14px; }

  .hero-desc br.hide-mobile { display: none; }
}
</style>