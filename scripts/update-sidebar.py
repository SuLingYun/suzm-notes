#!/usr/bin/env python3
"""
侧边栏配置自动生成脚本
用法: python3 scripts/update-sidebar.py

扫描 docs/ 目录下所有分类文章，自动更新 config.ts 中的侧边栏配置。
所有笔记分类共享同一侧边栏结构（notesSidebarItems），与速查手册风格一致。
"""

import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(PROJECT_ROOT, 'docs', '.vitepress', 'config.ts')
DOCS_DIR = os.path.join(PROJECT_ROOT, 'docs')

# 分类映射: 目录名 -> 显示名称
SECTIONS = {
    'linux': 'Linux 运维',
    'network': '网络',
    'database': '数据库',
    'middleware': '中间件',
    'cloud': '云平台',
    'security': '安全',
    'automation': '自动化运维',
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
    """获取指定分类下的所有文章（排除 index.md）"""
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


def generate_notes_sidebar_items():
    """生成 notesSidebarItems 变量内容"""
    lines = ['const notesSidebarItems = [']
    for section_dir, section_name in SECTIONS.items():
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
    """生成共享侧边栏配置（所有分类路径指向 notesSidebarItems）"""
    lines = []
    for section_dir in SECTIONS:
        lines.append(f"      '/{section_dir}/': [")
        lines.append("        { text: '笔记', items: notesSidebarItems }")
        lines.append("      ],")
    # /notes/ 路径也共享同一结构
    lines.append("      '/notes/': [")
    lines.append("        { text: '笔记', items: notesSidebarItems }")
    lines.append("      ],")
    return '\n'.join(lines)


def replace_between_markers(content, start_marker, end_marker, new_content):
    """替换两个标记之间的内容"""
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print(f"⚠️  未找到标记 {start_marker} / {end_marker}，请检查 config.ts")
        return None

    # 找到 start_marker 所在行的下一个换行，作为替换内容的起始位置
    start_line_end = content.find('\n', start_idx) + 1
    # 找到 end_marker 所在行的开始位置
    end_line_start = content.rfind('\n', 0, end_idx) + 1

    return content[:start_line_end] + new_content + '\n' + content[end_line_start:]


def update_config():
    """更新 config.ts 文件中的侧边栏配置"""
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

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

    # 2. 更新侧边栏配置
    sidebar_config = generate_shared_sidebar_config()
    content = replace_between_markers(
        content,
        '// SIDEBAR_AUTO_GENERATED_START',
        '// SIDEBAR_AUTO_GENERATED_END',
        sidebar_config
    )
    if content is None:
        return False

    with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    # 统计文章数量
    total = 0
    for section_dir in SECTIONS:
        articles = get_articles(section_dir)
        count = len(articles)
        total += count
        if count > 0:
            print(f"  ✅ {SECTIONS[section_dir]}: {count} 篇文章")

    print(f"\n📊 共 {total} 篇文章，共享侧边栏配置已更新！")
    return True


def verify_articles():
    """检查各分类目录下的文章列表"""
    print("=" * 50)
    print("📋 当前文章清单")
    print("=" * 50)

    total = 0
    for section_dir, section_name in SECTIONS.items():
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

        total += len(articles)

    print(f"\n📊 总计: {total} 篇文章")
    return total


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == '--verify':
        verify_articles()
    elif len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("用法: python3 scripts/update-sidebar.py [选项]")
        print("")
        print("选项:")
        print("  (无参数)    更新侧边栏配置")
        print("  --verify    仅查看文章清单，不更新配置")
        print("  --help      显示帮助信息")
    else:
        print("=" * 50)
        print("🔧 正在更新侧边栏配置...")
        print("=" * 50)
        update_config()