import DefaultTheme from 'vitepress/theme'
import { h, defineComponent, ref, onMounted, onUnmounted } from 'vue'
import Donation from './Donation.vue'
import DeployInfo from './DeployInfo.vue'
import FloatingTools from './FloatingTools.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
  },
  Layout: defineComponent({
    name: 'MyLayout',
    setup() {
      const sidebarCollapsed = ref(true)
      const showMenuBtn = ref(false)
      let observer = null
      let titleObserver = null

      // 默认展开侧边栏
      // 不再默认添加 sidebar-collapsed，让侧边栏默认可见

      function toggleSidebar(e) {
        if (e) {
          e.stopImmediatePropagation()
          e.preventDefault()
        }
        sidebarCollapsed.value = !sidebarCollapsed.value
        document.documentElement.classList.toggle('sidebar-collapsed', sidebarCollapsed.value)
      }

      // 创建菜单按钮 DOM 元素
      function createMenuBtn() {
        const btn = document.createElement('button')
        btn.className = 'sidebar-menu-btn'
        btn.title = '展开侧边栏'
        btn.setAttribute('aria-label', '展开侧边栏')
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`
        btn.addEventListener('click', toggleSidebar)
        return btn
      }

      // 注入菜单按钮到标题链接之前（作为兄弟元素，不在 a 标签内部）
      function injectMenuBtn() {
        const titleContainer = document.querySelector('.VPNavBar .title')
        if (!titleContainer) return
        const titleLink = titleContainer.querySelector('.VPNavBarTitle')
        if (!titleLink) return

        // 移除已存在的按钮避免重复
        const existing = titleContainer.querySelector('.sidebar-menu-btn')
        if (existing) existing.remove()

        // 只在有侧边栏的页面显示
        if (!showMenuBtn.value) return

        const btn = createMenuBtn()
        titleContainer.insertBefore(btn, titleLink)
      }

      onMounted(() => {
        // 检查当前页面是否有侧边栏，只在有侧边栏的页面显示菜单按钮
        const vpContent = document.querySelector('.VPContent')
        if (vpContent) {
          showMenuBtn.value = vpContent.classList.contains('has-sidebar')
          observer = new MutationObserver(() => {
            showMenuBtn.value = vpContent.classList.contains('has-sidebar')
            // 延迟执行以确保 DOM 已更新
            setTimeout(injectMenuBtn, 0)
          })
          observer.observe(vpContent, { attributes: true, attributeFilter: ['class'] })
        }

        // 等待 VitePress 渲染完成后注入按钮（nav 可能未渲染完成，需要重试）
        function tryInject() {
          const titleContainer = document.querySelector('.VPNavBar .title')
          if (titleContainer) {
            injectMenuBtn()
            if (!titleObserver) {
              titleObserver = new MutationObserver(() => {
                setTimeout(injectMenuBtn, 0)
              })
              titleObserver.observe(titleContainer, { childList: true, subtree: true })
            }
          } else {
            setTimeout(tryInject, 50)
          }
        }
        tryInject()
      })

      onUnmounted(() => {
        if (observer) observer.disconnect()
        if (titleObserver) titleObserver.disconnect()
      })

      return () => h(DefaultTheme.Layout, null, {
      'footer-before': () => h(Donation),
      'layout-bottom': () => h('div', { class: 'footer-meta' }, [
        h('div', { class: 'footer-meta__inner' }, [
          // 左侧：版权信息 + Netlify 部署信息
          h('div', { class: 'footer-copyright' }, [
            h('div', { class: 'footer-copyright__highlight' }, [
              'Copyright © 2026 ',
              h('a', { href: 'https://github.com/SuLingYun', target: '_blank', rel: 'noopener noreferrer' }, '小弥渡'),
              h('br'),
              h(DeployInfo)
            ])
          ]),
          // 右侧：社交图标
          h('div', { class: 'footer-social' }, [
            h('a', { href: 'https://github.com/SuLingYun', target: '_blank', rel: 'noopener noreferrer', title: 'GitHub' }, [
              h('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20' }, [
                h('path', { d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z' })
              ])
            ]),
            h('a', { href: 'https://gitee.com/SuLingYun', target: '_blank', rel: 'noopener noreferrer', title: 'Gitee' }, [
              h('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20' }, [
                h('path', { d: 'M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.59.59 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z' })
              ])
            ])
          ])
        ])
      ]),
      'layout-top': () => h(FloatingTools)
    })
    }
  })
}
