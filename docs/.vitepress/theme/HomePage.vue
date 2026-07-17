<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from './posts.data'

// 分类数据
const categories = [
  {
    id: 'linux',
    title: 'Linux 运维',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    desc: '系统调优、故障排查、Shell 脚本',
    color: '#1a56db',
    count: 14
  },
  {
    id: 'network',
    title: '网络与安全',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    desc: '防火墙策略、WAF 防护、交换机配置',
    color: '#0d9488',
    count: 17
  },
  {
    id: 'database',
    title: '数据库',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    desc: 'MySQL 主从、Redis 缓存、MongoDB',
    color: '#9333ea',
    count: 9
  },
  {
    id: 'middleware',
    title: '中间件',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
    desc: 'Nginx、Tomcat、Docker、Kubernetes',
    color: '#ea580c',
    count: 6
  },
  {
    id: 'cloud',
    title: '云原生',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>',
    desc: 'VMware、K8s、混合云、DeepSeek 部署',
    color: '#0891b2',
    count: 6
  },
  {
    id: 'automation',
    title: '自动化运维',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
    desc: 'Ansible、Jenkins、Prometheus、Zabbix',
    color: '#16a34a',
    count: 7
  }
]

// 速查手册分类
const quickrefCategories = [
  { name: '编程语言', count: 31, path: '/quickref/programming/', color: '#f59e0b' },
  { name: '前端框架', count: 26, path: '/quickref/frontend/', color: '#3b82f6' },
  { name: '快捷键', count: 26, path: '/quickref/shortcuts/', color: '#8b5cf6' },
  { name: '工具', count: 25, path: '/quickref/tools/', color: '#06b6d4' },
  { name: '命令行', count: 23, path: '/quickref/commands/', color: '#10b981' },
  { name: '参考', count: 17, path: '/quickref/reference/', color: '#f97316' },
  { name: 'Node.js', count: 13, path: '/quickref/nodejs/', color: '#84cc16' },
  { name: 'AI 工具', count: 9, path: '/quickref/ai/', color: '#ec4899' },
  { name: '数据库', count: 8, path: '/quickref/database/', color: '#a855f7' },
  { name: 'Git', count: 8, path: '/quickref/git/', color: '#ef4444' },
  { name: 'Python', count: 8, path: '/quickref/python/', color: '#2563eb' },
  { name: '包管理器', count: 8, path: '/quickref/package-manager/', color: '#14b8a6' },
  { name: 'Docker', count: 4, path: '/quickref/docker/', color: '#0ea5e9' },
  { name: '配置格式', count: 4, path: '/quickref/config/', color: '#6366f1' },
  { name: '网络设备', count: 2, path: '/quickref/network/', color: '#d946ef' }
]

// 统计数字动画
const stats = ref([
  { label: '技术文章', value: 0, target: posts.length || 59 },
  { label: '速查手册', value: 0, target: 212 },
  { label: '分类', value: 0, target: 7 },
  { label: '持续更新', value: 0, target: 2026, suffix: '' }
])

const animated = ref(false)

onMounted(() => {
  // 触发统计数字动画
  setTimeout(() => {
    animated.value = true
    stats.value.forEach((stat, index) => {
      setTimeout(() => {
        const step = Math.ceil(stat.target / 30)
        const timer = setInterval(() => {
          if (stat.value >= stat.target) {
            stat.value = stat.target
            clearInterval(timer)
          } else {
            stat.value = Math.min(stat.value + step, stat.target)
          }
        }, 30)
      }, index * 200)
    })
  }, 300)
})
</script>

<template>
  <div class="home-page">
    <!-- ========== Hero 区域 ========== -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="hero-grid"></div>
        <div class="hero-glow"></div>
      </div>
      <div class="hero-container">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          十多年 IT 生涯 · 持续整理中
        </div>
        <h1 class="hero-title">
          <span class="hero-title-main">小弥渡的运维笔记</span>
          <span class="hero-title-sub">记不住的就查这里</span>
        </h1>
        <p class="hero-desc">
          一个运维老兵的杂货铺 — 技术一直在变，笔记永远跟得上
        </p>
        <div class="hero-actions">
          <a :href="withBase('/linux/')" class="hero-btn hero-btn-primary">
            开始阅读
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a :href="withBase('/quickref/')" class="hero-btn hero-btn-secondary">
            速查手册
          </a>
        </div>
        <!-- 装饰性指标 -->
        <div class="hero-metrics">
          <div class="hero-metric">
            <span class="metric-value">212</span>
            <span class="metric-label">速查手册</span>
          </div>
          <div class="hero-metric-divider"></div>
          <div class="hero-metric">
            <span class="metric-value">{{ posts.length }}</span>
            <span class="metric-label">技术文章</span>
          </div>
          <div class="hero-metric-divider"></div>
          <div class="hero-metric">
            <span class="metric-value">22</span>
            <span class="metric-label">分类</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 统计条 ========== -->
    <section class="stats-section">
      <div class="stats-container">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-item"
        >
          <span class="stat-value">{{ stat.value }}{{ stat.suffix || '+' }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- ========== 分类卡片 ========== -->
    <section class="categories-section">
      <div class="section-header">
        <h2 class="section-title">内容分类</h2>
        <p class="section-desc">系统化整理，快速定位所需知识</p>
      </div>
      <div class="categories-grid">
        <a
          v-for="cat in categories"
          :key="cat.id"
          :href="withBase('/' + cat.id + '/')"
          class="category-card"
          :style="{ '--card-accent': cat.color }"
        >
          <div class="card-icon" v-html="cat.icon"></div>
          <div class="card-body">
            <h3 class="card-title">{{ cat.title }}</h3>
            <p class="card-desc">{{ cat.desc }}</p>
          </div>
          <div class="card-footer">
            <span class="card-count">{{ cat.count }} 篇文章</span>
            <span class="card-arrow">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </a>
      </div>
    </section>

    <!-- ========== 速查手册分类 ========== -->
    <section class="quickref-section">
      <div class="section-header">
        <h2 class="section-title">速查手册</h2>
        <p class="section-desc">212 篇技术速查手册，15 个分类 — 随手翻，随时查</p>
      </div>
      <div class="quickref-grid">
        <a
          v-for="qr in quickrefCategories"
          :key="qr.name"
          :href="withBase(qr.path)"
          class="quickref-chip"
          :style="{ '--chip-color': qr.color }"
        >
          <span class="chip-name">{{ qr.name }}</span>
          <span class="chip-count">{{ qr.count }}</span>
        </a>
      </div>
      <div class="quickref-cta">
        <a :href="withBase('/quickref/')" class="cta-link">
          浏览全部速查手册
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </section>

    <!-- ========== 最近更新 ========== -->
    <section class="recent-section">
      <div class="section-header">
        <h2 class="section-title">最近更新</h2>
        <p class="section-desc">最新的技术笔记和文章</p>
      </div>
      <div class="posts-grid">
        <a
          v-for="post in posts.slice(0, 12)"
          :key="post.url"
          :href="withBase(post.url)"
          class="post-card"
        >
          <div class="post-card-top">
            <span class="post-category" :style="{ backgroundColor: getCategoryColor(post.category) + '18', color: getCategoryColor(post.category) }">
              {{ post.category }}
            </span>
            <span class="post-date">{{ post.date }}</span>
          </div>
          <h3 class="post-card-title">{{ post.title }}</h3>
          <p class="post-card-desc" v-if="post.description">{{ post.description }}</p>
          <div class="post-card-footer">
            <span class="post-read-more">阅读全文</span>
          </div>
        </a>
      </div>
      <div class="recent-footer">
        <span class="stats-text">共 {{ posts.length }} 篇文章 · 持续更新中</span>
      </div>
    </section>
  </div>
</template>

<script>
// 分类颜色映射
const categoryColors = {
  'Linux': '#1a56db',
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
</script>

<style scoped>
/* ============================================
   首页布局
   ============================================ */
.home-page {
  overflow-x: hidden;
}

/* ============================================
   Hero 区域
   ============================================ */
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 80px 24px 60px;
  text-align: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(26, 86, 219, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26, 86, 219, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 60% 50% at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 50% at center, black 30%, transparent 70%);
}

.dark .hero-grid {
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.05) 1px, transparent 1px);
}

.hero-glow {
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(ellipse, rgba(26, 86, 219, 0.12) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.dark .hero-glow {
  background: radial-gradient(ellipse, rgba(96, 165, 250, 0.08) 0%, transparent 70%);
}

.hero-container {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 100px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 28px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title {
  margin: 0 0 16px;
}

.hero-title-main {
  display: block;
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, #3b82f6 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .hero-title-main {
  background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-title-sub {
  display: block;
  font-size: clamp(16px, 2.5vw, 22px);
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin-top: 8px;
  letter-spacing: 0.04em;
}

.hero-desc {
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  max-width: 520px;
  margin: 0 auto 32px;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;
}

.hero-btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
}

.hero-btn-primary:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 86, 219, 0.3);
}

.dark .hero-btn-primary:hover {
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.25);
}

.hero-btn-secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.hero-btn-secondary:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

/* Hero 装饰性指标 */
.hero-metrics {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--vp-c-divider);
}

.hero-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  font-variant-numeric: tabular-nums;
}

.metric-label {
  font-size: 12px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.03em;
}

.hero-metric-divider {
  width: 1px;
  height: 32px;
  background: var(--vp-c-divider);
}

/* ============================================
   统计条
   ============================================ */
.stats-section {
  padding: 0 24px;
  max-width: 900px;
  margin: 0 auto;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--vp-c-divider);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  background: var(--vp-c-bg);
  gap: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
  transition: all 0.3s ease;
}

.dark .stat-value {
  color: #60a5fa;
}

.stat-label {
  font-size: 13px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.02em;
}

/* ============================================
   内容分类
   ============================================ */
.categories-section,
.quickref-section,
.recent-section {
  max-width: 1152px;
  margin: 0 auto;
  padding: 64px 24px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--vp-c-text-1);
  letter-spacing: -0.01em;
}

.section-desc {
  font-size: 15px;
  color: var(--vp-c-text-2);
  margin: 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.category-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  border-radius: 16px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-accent);
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border-color: var(--card-accent);
}

.dark .category-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.category-card:hover::before {
  opacity: 1;
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--card-accent) 10%, transparent);
  color: var(--card-accent);
  margin-bottom: 16px;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 6px;
}

.card-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
}

.card-count {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.card-arrow {
  color: var(--vp-c-text-3);
  transition: transform 0.3s ease, color 0.3s ease;
  display: flex;
}

.category-card:hover .card-arrow {
  transform: translateX(4px);
  color: var(--card-accent);
}

/* ============================================
   速查手册分类
   ============================================ */
.quickref-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.quickref-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 100px;
  text-decoration: none;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s ease;
  font-size: 14px;
}

.quickref-chip:hover {
  border-color: var(--chip-color);
  background: color-mix(in srgb, var(--chip-color) 8%, var(--vp-c-bg));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--chip-color) 15%, transparent);
}

.chip-name {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.chip-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: color-mix(in srgb, var(--chip-color) 15%, transparent);
  color: var(--chip-color);
}

.quickref-cta {
  text-align: center;
}

.cta-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.cta-link:hover {
  background: var(--vp-c-brand-soft);
  gap: 10px;
}

/* ============================================
   最近更新
   ============================================ */
.recent-section {
  padding-bottom: 64px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.post-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 14px;
  text-decoration: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  border-color: var(--vp-c-brand-1);
}

.dark .post-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.post-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.post-category {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.02em;
}

.post-date {
  font-size: 12px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.post-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0 0 auto;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
}

.post-read-more {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.25s ease;
}

.post-card:hover .post-read-more {
  opacity: 1;
  transform: translateX(0);
}

.recent-footer {
  text-align: center;
}

.stats-text {
  font-size: 14px;
  color: var(--vp-c-text-3);
}

/* ============================================
   响应式
   ============================================ */
@media (max-width: 960px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 20px 48px;
  }

  .hero-metrics {
    gap: 16px;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    padding: 20px 12px;
  }

  .stat-value {
    font-size: 24px;
  }
}

@media (max-width: 639px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .categories-section,
  .quickref-section,
  .recent-section {
    padding: 48px 16px 0;
  }

  .recent-section {
    padding-bottom: 48px;
  }

  .hero-metrics {
    flex-wrap: wrap;
    gap: 12px;
  }

  .hero-metric-divider {
    display: none;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>