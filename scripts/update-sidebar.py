#!/usr/bin/env python3
"""
侧边栏配置自动生成脚本
用法: python3 scripts/update-sidebar.py

扫描 docs/ 目录下所有分类文章，自动更新 config.ts 中的侧边栏配置。
新增文章时只需创建 .md 文件，运行此脚本即可。
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

def generate_sidebar_section(section_dir, section_name):
    """生成单个分类的侧边栏配置"""
    dirpath = os.path.join(DOCS_DIR, section_dir)
    if not os.path.isdir(dirpath):
        return None
    
    files = sorted([
        f for f in os.listdir(dirpath) 
        if f.endswith('.md') and f != 'index.md'
    ])
    
    if not files:
        return None
    
    items = []
    for f in files:
        fpath = os.path.join(dirpath, f)
        name = f[:-3]
        title = extract_title(fpath)
        items.append(f"          {{ text: '{title}', link: '/{section_dir}/{name}' }},")
    
    items_str = '\n'.join(items)
    
    return f"""      '/{section_dir}/': [
        {{ text: '{section_name}', items: [
{items_str}
        ]}}
      ],"""

def generate_sidebar_code():
    """生成所有分类的侧边栏配置代码"""
    sections = []
    for section_dir, section_name in SECTIONS.items():
        result = generate_sidebar_section(section_dir, section_name)
        if result:
            sections.append(result)
    return '\n'.join(sections)

def update_config():
    """更新 config.ts 文件中的侧边栏配置"""
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_sidebar = generate_sidebar_code()
    
    # 使用标记定位需要替换的区域
    start_marker = '// SIDEBAR_AUTO_GENERATED_START'
    end_marker = '// SIDEBAR_AUTO_GENERATED_END'
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx == -1 or end_idx == -1:
        print("⚠️  未找到侧边栏自动生成标记，请检查 config.ts 中是否包含 SIDEBAR_AUTO_GENERATED_START/END 标记")
        return False
    
    # 找到 start_marker 所在行的下一个换行，作为替换内容的起始位置
    start_line_end = content.find('\n', start_idx) + 1
    # 找到 end_marker 所在行的开始位置
    end_line_start = content.rfind('\n', 0, end_idx) + 1
    
    # 替换两个标记之间的内容
    new_content = content[:start_line_end] + new_sidebar + '\n' + content[end_line_start:]
    
    with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    # 统计文章数量
    total = 0
    for section_dir in SECTIONS:
        dirpath = os.path.join(DOCS_DIR, section_dir)
        if os.path.isdir(dirpath):
            count = len([f for f in os.listdir(dirpath) if f.endswith('.md') and f != 'index.md'])
            total += count
            if count > 0:
                print(f"  ✅ {SECTIONS[section_dir]}: {count} 篇文章")
    
    print(f"\n📊 共 {total} 篇文章，侧边栏配置已更新！")
    return True

def verify_articles():
    """检查各分类目录下的文章列表"""
    print("=" * 50)
    print("📋 当前文章清单")
    print("=" * 50)
    
    total = 0
    for section_dir, section_name in SECTIONS.items():
        dirpath = os.path.join(DOCS_DIR, section_dir)
        if not os.path.isdir(dirpath):
            print(f"  ⚠️  {section_name} 目录不存在")
            continue
        
        files = sorted([
            f for f in os.listdir(dirpath) 
            if f.endswith('.md') and f != 'index.md'
        ])
        
        if not files:
            print(f"  ⚠️  {section_name}: 无文章")
            continue
        
        print(f"\n  📁 {section_name} ({len(files)} 篇):")
        for f in files:
            fpath = os.path.join(dirpath, f)
            title = extract_title(fpath)
            print(f"    ├─ {title}")
            print(f"    │  文件: {f}")
        
        total += len(files)
    
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