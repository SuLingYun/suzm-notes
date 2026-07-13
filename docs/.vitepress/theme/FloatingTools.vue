<template>
  <div class="joe_action">
    <!-- 火箭返回顶部按钮 -->
    <div class="joe_action_item scroll" :class="{ active: showRocket }" @click="scrollToTop" title="返回顶部">
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
        <path d="M725.902 498.916c18.205-251.45-93.298-410.738-205.369-475.592l-6.257-3.982-6.258 3.414c-111.502 64.853-224.711 224.142-204.8 475.59-55.751 53.476-80.214 116.623-80.214 204.8v15.36l179.2-35.27c11.378 40.39 58.596 69.973 113.21 69.973 54.613 0 101.262-29.582 112.64-68.836l180.337 36.41v-15.36c-.569-89.885-25.031-153.6-82.489-206.507zM571.733 392.533c-33.564 31.29-87.04 28.445-118.329-5.12s-28.444-87.04 5.12-117.76c33.565-31.289 87.04-28.444 118.33 5.12s28.444 86.471-5.12 117.76zm-56.32 368.64c-35.84 0-64.284 29.014-64.284 64.285 0 35.84 54.044 182.613 64.284 182.613s64.285-146.773 64.285-182.613c0-35.271-29.014-64.285-64.285-64.285z"></path>
      </svg>
    </div>

    <!-- 主题切换按钮 -->
    <div class="joe_action_item mode" @click="toggleTheme" title="切换主题">
      <!-- 月亮图标（暗色模式） -->
      <svg class="icon-1" :class="{ active: isDark }" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
        <path d="M587.264 104.96c33.28 57.856 52.224 124.928 52.224 196.608 0 218.112-176.128 394.752-393.728 394.752-29.696 0-58.368-3.584-86.528-9.728C223.744 832.512 369.152 934.4 538.624 934.4c229.376 0 414.72-186.368 414.72-416.256 1.024-212.992-159.744-389.12-366.08-413.184z"></path>
        <path d="M340.48 567.808l-23.552-70.144-70.144-23.552 70.144-23.552 23.552-70.144 23.552 70.144 70.144 23.552-70.144 23.552-23.552 70.144zM168.96 361.472l-30.208-91.136-91.648-30.208 91.136-30.208 30.72-91.648 30.208 91.136 91.136 30.208-91.136 30.208-30.208 91.648z"></path>
      </svg>
      <!-- 太阳图标（亮色模式） -->
      <svg class="icon-2" :class="{ active: !isDark }" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
        <path d="M234.24 512a277.76 277.76 0 1 0 555.52 0 277.76 277.76 0 1 0-555.52 0zM512 187.733a42.667 42.667 0 0 1-42.667-42.666v-102.4a42.667 42.667 0 0 1 85.334 0v102.826A42.667 42.667 0 0 1 512 187.733zm-258.987 107.52a42.667 42.667 0 0 1-29.866-12.373l-72.96-73.387a42.667 42.667 0 0 1 59.306-59.306l73.387 72.96a42.667 42.667 0 0 1 0 59.733 42.667 42.667 0 0 1-29.867 12.373zm-107.52 259.414H42.667a42.667 42.667 0 0 1 0-85.334h102.826a42.667 42.667 0 0 1 0 85.334zm34.134 331.946a42.667 42.667 0 0 1-29.44-72.106l72.96-73.387a42.667 42.667 0 0 1 59.733 59.733l-73.387 73.387a42.667 42.667 0 0 1-29.866 12.373zM512 1024a42.667 42.667 0 0 1-42.667-42.667V878.507a42.667 42.667 0 0 1 85.334 0v102.826A42.667 42.667 0 0 1 512 1024zm332.373-137.387a42.667 42.667 0 0 1-29.866-12.373l-73.387-73.387a42.667 42.667 0 0 1 0-59.733 42.667 42.667 0 0 1 59.733 0l72.96 73.387a42.667 42.667 0 0 1-29.44 72.106zm136.96-331.946H878.507a42.667 42.667 0 1 1 0-85.334h102.826a42.667 42.667 0 0 1 0 85.334zM770.987 295.253a42.667 42.667 0 0 1-29.867-12.373 42.667 42.667 0 0 1 0-59.733l73.387-72.96a42.667 42.667 0 1 1 59.306 59.306l-72.96 73.387a42.667 42.667 0 0 1-29.866 12.373z"></path>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isDark = ref(false)
const showRocket = ref(false)

// 检测初始主题
function detectTheme() {
  isDark.value = document.documentElement.classList.contains('dark')
}

// 切换主题
function toggleTheme() {
  const newTheme = isDark.value ? 'light' : 'dark'
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
  localStorage.setItem('vitepress-theme-appearance', newTheme)
  isDark.value = !isDark.value
}

// 滚动到顶部
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听滚动显示火箭按钮
function handleScroll() {
  showRocket.value = window.scrollY > 300
}

onMounted(() => {
  detectTheme()
  window.addEventListener('scroll', handleScroll, { passive: true })
  // 监听主题变化（用户可能通过其他方式切换）
  const observer = new MutationObserver(() => {
    detectTheme()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.joe_action {
  position: fixed;
  bottom: 90px;
  right: 30px;
  z-index: 333;
}

.joe_action_item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--vp-c-bg-elv);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1), 0 5px 20px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.joe_action_item:last-child {
  margin-bottom: 0;
}

.joe_action_item:hover {
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.15), 0 5px 25px 0 rgba(0, 0, 0, 0.25);
}

.joe_action_item svg {
  fill: var(--vp-c-text-2);
  transition: fill 0.3s ease;
}

.joe_action_item:hover svg {
  fill: var(--vp-c-brand-1);
}

/* 火箭按钮 - 默认隐藏，滚动后显示 */
.joe_action_item.scroll {
  opacity: 0;
  transform: scale(0.5);
  pointer-events: none;
  visibility: hidden;
  transition: visibility 0.35s, opacity 0.35s, transform 0.35s;
}

.joe_action_item.scroll.active {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
  visibility: visible;
}

/* 主题切换 - 默认显示太阳图标，暗色时显示月亮图标 */
.joe_action_item.mode .icon-1,
.joe_action_item.mode .icon-2 {
  display: none;
}

.joe_action_item.mode .icon-1.active,
.joe_action_item.mode .icon-2.active {
  display: block;
}

/* 移动端适配 */
@media (max-width: 639px) {
  .joe_action {
    bottom: 80px;
    right: 16px;
  }

  .joe_action_item {
    width: 36px;
    height: 36px;
  }

  .joe_action_item svg {
    width: 22px;
    height: 22px;
  }
}
</style>