import { createContentLoader } from 'vitepress'

export interface QuickrefCategory {
  name: string
  key: string
  path: string
  count: number
  color: string
}

declare const data: QuickrefCategory[]
export { data }

const categoryNames: Record<string, string> = {
  ai: 'AI 工具',
  commands: '命令行',
  config: '配置格式',
  database: '数据库',
  docker: 'Docker',
  frontend: '前端框架',
  git: 'Git',
  network: '网络设备',
  nodejs: 'Node.js',
  'package-manager': '包管理器',
  programming: '编程语言',
  python: 'Python',
  reference: '参考',
  shortcuts: '快捷键',
  tools: '工具'
}

const categoryColors: Record<string, string> = {
  ai: '#ec4899',
  commands: '#10b981',
  config: '#6366f1',
  database: '#a855f7',
  docker: '#0ea5e9',
  frontend: '#3b82f6',
  git: '#ef4444',
  network: '#d946ef',
  nodejs: '#84cc16',
  'package-manager': '#14b8a6',
  programming: '#f59e0b',
  python: '#2563eb',
  reference: '#f97316',
  shortcuts: '#8b5cf6',
  tools: '#06b6d4'
}

export default createContentLoader('quickref/*/*.md', {
  transform(raw) {
    const categories: Record<string, number> = {}

    raw.forEach(({ url }) => {
      // url like /quickref/ai/chatgpt.html
      const parts = url.replace(/\.html$/, '').split('/')
      if (parts.length >= 3) {
        const key = parts[2]
        categories[key] = (categories[key] || 0) + 1
      }
    })

    return Object.entries(categories)
      .filter(([key]) => categoryNames[key])
      .map(([key, count]) => ({
        name: categoryNames[key],
        key,
        path: `/quickref/${key}/`,
        count,
        color: categoryColors[key] || '#6b7280'
      }))
      .sort((a, b) => b.count - a.count)
  }
})