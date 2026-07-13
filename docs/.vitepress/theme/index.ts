import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import Donation from './Donation.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'footer-before': () => h(Donation)
    })
  }
}
