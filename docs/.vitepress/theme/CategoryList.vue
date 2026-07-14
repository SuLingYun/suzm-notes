<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as allPosts } from './posts.data'

const props = defineProps({
  category: {
    type: String,
    required: true
  }
})

const posts = computed(() =>
  allPosts
    .filter(p => p.category === props.category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
)
</script>

<template>
  <div class="category-list">
    <div class="category-stats">共 {{ posts.length }} 篇文章</div>
    <div class="post-list">
      <a
        v-for="post in posts"
        :key="post.url"
        :href="withBase(post.url)"
        class="post-item"
      >
        <div class="post-item-main">
          <span class="post-item-title">{{ post.title }}</span>
          <span class="post-item-desc" v-if="post.description">{{ post.description }}</span>
        </div>
        <span class="post-item-date">{{ post.date }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.category-list {
  margin: 24px 0;
}

.category-stats {
  color: var(--vp-c-text-3);
  font-size: 14px;
  margin-bottom: 16px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  background: var(--vp-c-bg);
}

.post-item:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.post-item-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.post-item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.post-item-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-item-date {
  font-size: 13px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  margin-left: 16px;
  flex-shrink: 0;
}

@media (max-width: 639px) {
  .post-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .post-item-date {
    margin-left: 0;
  }

  .post-item-desc {
    white-space: normal;
  }
}
</style>
