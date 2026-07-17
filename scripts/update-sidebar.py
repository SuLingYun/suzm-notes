#!/usr/bin/env python3
"""
侧边栏配置自动生成脚本
用法: python3 scripts/update-sidebar.py

扫描 docs/ 目录下所有文章，自动更新 config.ts 中的侧边栏配置。

功能：
1. 笔记侧边栏：所有笔记分类共享同一 structure（notesSidebarItems）
2. 速查手册侧边栏：自动扫描 quickref/ 子目录并生成分类列表
3. 新增文章后运行此脚本即可自动更新所有侧边栏
"""

import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(PROJECT_ROOT, 'docs', '.vitepress', 'config.ts')
DOCS_DIR = os.path.join(PROJECT_ROOT, 'docs')

# ============================================
# 笔记分类映射
# ============================================
NOTES_SECTIONS = {
    'linux': 'Linux 运维',
    'network': '网络',
    'database': '数据库',
    'middleware': '中间件',
    'cloud': '云平台',
    'security': '安全',
    'automation': '自动化运维',
}

# ============================================
# 速查手册分类映射
# 与 quickref.data.ts 中的 categoryNames 保持一致
# ============================================
QUICKREF_CATEGORIES = {
    'ai': 'AI',
    'programming': '编程语言与框架',
    'docker': 'Docker 与容器',
    'config': '配置格式',
    'frontend': '前端开发',
    'nodejs': 'Node.js 生态',
    'python': 'Python 生态',
    'commands': 'Linux 与命令行',
    'tools': '工具与编辑器',
    'package-manager': '软件包管理器',
    'git': 'Git 与协作',
    'database': '数据库与搜索',
    'network': '网络设备',
    'shortcuts': '快捷键',
    'reference': '常用对照表',
}


def extract_title(filepath):
    """从 .md 文件的 frontmatter 中提取 title"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read(500)

    if content.startswith('---'):
        end = content.find('---', 3)
        if end > 0:
            fm = content[3:end]
            for line in fm.split('\n'):
                line = line.strip()
                if line.startswith('title:'):
                    return line[6:].strip().strip("'\"")
    return os.path.basename(filepath)[:-3]


def get_articles(section_dir):
    """获取指定目录下的所有文章（排除 index.md）"""
    dirpath = os.path.join(DOCS_DIR, section_dir)
    if not os.path.isdir(dirpath):
        return []
    files = sorted([
        f for f in os.listdir(dirpath)
        if f.endswith('.md') and f != 'index.md'
    ])
    articles = []
    for f in files:
        fpath = os.path.join(dirpath, f)
        name = f[:-3]
        title = extract_title(fpath)
        articles.append({'title': title, 'name': name, 'section': section_dir})
    return articles


def get_quickref_articles(category_dir):
    """获取速查手册指定分类下的所有文章"""
    dirpath = os.path.join(DOCS_DIR, 'quickref', category_dir)
    if not os.path.isdir(dirpath):
        return []
    files = sorted([
        f for f in os.listdir(dirpath)
        if f.endswith('.md') and f != 'index.md'
    ])
    articles = []
    for f in files:
        fpath = os.path.join(dirpath, f)
        name = f[:-3]
        title = extract_title(fpath)
        articles.append({'title': title, 'name': name})
    return articles


# ============================================
# 笔记侧边栏生成
# ============================================

def generate_notes_sidebar_items():
    """生成 notesSidebarItems 变量内容"""
    lines = ['const notesSidebarItems = [']
    for section_dir, section_name in NOTES_SECTIONS.items():
        articles = get_articles(section_dir)
        if not articles:
            continue
        lines.append(f"  {{ text: '{section_name}', collapsed: true, items: [")
        for a in articles:
            lines.append(f"    {{ text: '{a['title']}', link: '/{a['section']}/{a['name']}' }},")
        lines.append("  ]},")
    lines.append(']')
    return '\n'.join(lines)


def generate_shared_sidebar_config():
    """生成共享侧边栏配置（所有笔记分类路径指向 notesSidebarItems）"""
    lines = []
    for section_dir in NOTES_SECTIONS:
        lines.append(f"      '/{section_dir}/': [")
        lines.append("        { text: '笔记', items: notesSidebarItems }")
        lines.append("      ],")
    lines.append("      '/notes/': [")
    lines.append("        { text: '笔记', items: notesSidebarItems }")
    lines.append("      ],")
    return '\n'.join(lines)


# ============================================
# 速查手册侧边栏生成
# ============================================

def generate_quickref_sidebar():
    """生成速查手册侧边栏 items 列表"""
    lines = []
    for cat_dir, cat_name in QUICKREF_CATEGORIES.items():
        articles = get_quickref_articles(cat_dir)
        if not articles:
            continue
        lines.append(f"            {{ text: '{cat_name}', collapsed: true, items: [")
        for a in articles:
            lines.append(f"              {{ text: '{a['title']}', link: '/quickref/{cat_dir}/{a['name']}' }},")
        lines.append("            ] },")
    return '\n'.join(lines)


# ============================================
# 通用工具
# ============================================

def replace_between_markers(content, start_marker, end_marker, new_content, indent=0):
    """替换两个标记之间的内容"""
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print(f"⚠️  未找到标记 {start_marker} / {end_marker}，请检查 config.ts")
        return None

    start_line_end = content.find('\n', start_idx) + 1
    end_line_start = content.rfind('\n', 0, end_idx) + 1

    return content[:start_line_end] + new_content + '\n' + content[end_line_start:]


# ============================================
# 主流程
# ============================================

def update_config():
    """更新 config.ts 文件中的侧边栏配置"""
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. 更新 notesSidebarItems 变量
    notes_items = generate_notes_sidebar_items()
    content = replace_between_markers(
        content,
        '// NOTES_SIDEBAR_ITEMS_START',
        '// NOTES_SIDEBAR_ITEMS_END',
        notes_items
    )
    if content is None:
        return False

    # 2. 更新笔记侧边栏配置
    sidebar_config = generate_shared_sidebar_config()
    content = replace_between_markers(
        content,
        '// SIDEBAR_AUTO_GENERATED_START',
        '// SIDEBAR_AUTO_GENERATED_END',
        sidebar_config
    )
    if content is None:
        return False

    # 3. 更新速查手册侧边栏
    quickref_sidebar = generate_quickref_sidebar()
    content = replace_between_markers(
        content,
        '// QUICKREF_SIDEBAR_START',
        '// QUICKREF_SIDEBAR_END',
        quickref_sidebar
    )
    if content is None:
        return False

    if content == original_content:
        print("  ℹ️  无变化，侧边栏已是最新")
    else:
        with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
            f.write(content)

    # 统计
    notes_total = 0
    print("\n📁 笔记分类:")
    for section_dir, section_name in NOTES_SECTIONS.items():
        articles = get_articles(section_dir)
        count = len(articles)
        notes_total += count
        if count > 0:
            print(f"  ✅ {section_name}: {count} 篇")

    quickref_total = 0
    print("\n📁 速查手册分类:")
    for cat_dir, cat_name in QUICKREF_CATEGORIES.items():
        articles = get_quickref_articles(cat_dir)
        count = len(articles)
        quickref_total += count
        if count > 0:
            print(f"  ✅ {cat_name}: {count} 篇")

    print(f"\n📊 总计: 笔记 {notes_total} 篇 + 速查手册 {quickref_total} 篇 = {notes_total + quickref_total} 篇")
    print("✅ 侧边栏配置已更新！")
    return True


def verify_articles():
    """检查所有文章清单"""
    print("=" * 50)
    print("📋 笔记文章清单")
    print("=" * 50)

    notes_total = 0
    for section_dir, section_name in NOTES_SECTIONS.items():
        articles = get_articles(section_dir)
        if not articles:
            dirpath = os.path.join(DOCS_DIR, section_dir)
            if not os.path.isdir(dirpath):
                print(f"  ⚠️  {section_name} 目录不存在")
            else:
                print(f"  ⚠️  {section_name}: 无文章")
            continue

        print(f"\n  📁 {section_name} ({len(articles)} 篇):")
        for a in articles:
            print(f"    ├─ {a['title']}")
            print(f"    │  文件: {a['name']}.md")
        notes_total += len(articles)

    print("\n" + "=" * 50)
    print("📋 速查手册清单")
    print("=" * 50)

    quickref_total = 0
    for cat_dir, cat_name in QUICKREF_CATEGORIES.items():
        articles = get_quickref_articles(cat_dir)
        if not articles:
            print(f"  ⚠️  {cat_name} ({cat_dir}): 无文章")
            continue

        print(f"\n  📁 {cat_name} ({len(articles)} 篇):")
        for a in articles:
            print(f"    ├─ {a['title']}")
            print(f"    │  文件: {a['name']}.md")
        quickref_total += len(articles)

    print(f"\n📊 总计: 笔记 {notes_total} 篇 + 速查手册 {quickref_total} 篇 = {notes_total + quickref_total} 篇")
    return notes_total + quickref_total


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == '--verify':
        verify_articles()
    elif len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("用法: python3 scripts/update-sidebar.py [选项]")
        print("")
        print("选项:")
        print("  (无参数)    更新侧边栏配置（笔记 + 速查手册）")
        print("  --verify    仅查看文章清单，不更新配置")
        print("  --help      显示帮助信息")
    else:
        print("=" * 50)
        print("🔧 正在更新侧边栏配置...")
        print("=" * 50)
        update_config()