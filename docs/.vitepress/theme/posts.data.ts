import { createContentLoader } from 'vitepress'

interface PostInfo {
  title: string
  url: string
  date: string
  category: string
}

declare const data: PostInfo[]
export { data }

// 只加载笔记分类下的文章（排除索引页和速查手册）
export default createContentLoader(['linux/*.md', 'network/*.md', 'database/*.md', 'middleware/*.md', 'cloud/*.md', 'security/*.md', 'automation/*.md'], {
  transform(raw) {
    const posts = raw
      .map(({ url, frontmatter }) => {
        const path = url.replace(/^\/+/, '').replace(/\/+$/, '')
        const parts = path.split('/')
        let category = ''
        
        if (parts.length >= 2 && parts[0] !== '') {
          category = parts[0]
        }
        
        const categoryMap: Record<string, string> = {
          'linux': 'Linux',
          'network': '网络',
          'security': '安全',
          'database': '数据库',
          'middleware': '中间件',
          'cloud': '云平台',
          'automation': '自动化运维',
        }
        
        category = categoryMap[category] || category
        
        const title = frontmatter.title || ''
        const date = frontmatter.date ? String(frontmatter.date) : ''
        
        return {
          title,
          url,
          date,
          category,
        }
      })
      .filter(post => 
        post.title && 
        post.date && 
        !post.url.endsWith('/index') &&
        post.url !== '/about' &&
        post.category
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return posts
  }
})
