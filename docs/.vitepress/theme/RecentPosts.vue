<script setup>
import { withBase } from 'vitepress'
import { data as posts } from './posts.data'

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

<template>
  <section class="recent-posts">
    <h2 class="section-title">📝 最近更新</h2>
    <div class="posts-grid">
      <a v-for="post in posts.slice(0, 15)" :key="post.url" :href="withBase(post.url)" class="post-card">
        <div class="post-header">
          <span class="post-category" :style="{ backgroundColor: getCategoryColor(post.category) + '20', color: getCategoryColor(post.category) }">
            {{ post.category }}
          </span>
          <span class="post-date">{{ post.date }}</span>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-desc" v-if="post.description">{{ post.description }}</p>
      </a>
    </div>
    <div class="stats">
      <span>共 {{ posts.length }} 篇文章 · 持续更新中</span>
    </div>
  </section>
</template>

<style scoped>
.recent-posts {
  max-width: 1152px;
  margin: 0 auto;
  padding: 48px 24px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 36px;
  color: var(--vp-c-text-1);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.post-card {
  display: block;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  background: var(--vp-c-bg);
}

.post-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-category {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.post-date {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.post-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats {
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 14px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
