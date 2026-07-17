<script setup>
import { withBase } from 'vitepress'

defineProps({
  current: { type: String, default: '' }
})

const categories = [
  { name: '笔记概览', path: '/notes/', id: 'notes' },
  { name: 'Linux 运维', path: '/linux/', id: 'linux' },
  { name: '网络', path: '/network/', id: 'network' },
  { name: '安全', path: '/security/', id: 'security' },
  { name: '数据库', path: '/database/', id: 'database' },
  { name: '中间件', path: '/middleware/', id: 'middleware' },
  { name: '云平台', path: '/cloud/', id: 'cloud' },
  { name: '自动化运维', path: '/automation/', id: 'automation' },
]
</script>

<template>
  <nav class="category-nav">
    <a
      v-for="cat in categories"
      :key="cat.id"
      :href="withBase(cat.path)"
      class="nav-pill"
      :class="{ active: cat.id === current }"
    >
      {{ cat.name }}
    </a>
  </nav>
</template>

<style scoped>
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.nav-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.2s ease;
}

.nav-pill:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.nav-pill.active {
  color: #fff;
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.dark .nav-pill.active {
  color: #1a1a2e;
  background: #60a5fa;
  border-color: #60a5fa;
}
</style>