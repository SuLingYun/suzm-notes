import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import Donation from './Donation.vue'
import DeployInfo from './DeployInfo.vue'
import FloatingTools from './FloatingTools.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'footer-before': () => h(Donation),
      'layout-bottom': () => h('div', { class: 'footer-meta' }, h(DeployInfo)),
      'layout-top': () => h(FloatingTools)
    })
  }
}
