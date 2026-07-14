import { defineConfig } from 'vitepress'

const isNetlify = !!process.env.NETLIFY
const isGithubPages = !!process.env.GITHUB_PAGES
const isDev = !isGithubPages && !isNetlify
const basePath = isGithubPages ? '/suzm-notes/' : '/'
const siteUrl = isNetlify ? 'https://suzm.cn' : 'https://sulingyun.github.io/suzm-notes/'

export default defineConfig({
  base: basePath,
  title: '小弥渡的运维笔记',
  description: '一个运维老兵的杂货铺，十多年 IT 生涯，什么都接触过，什么都不太精通',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: `${basePath}favicon.png`, type: 'image/png' }],
    ['meta', { property: 'og:title', content: '小弥渡的运维笔记' }],
    ['meta', { property: 'og:description', content: '一个运维老兵的杂货铺 — 十多年 IT 生涯，什么都接触过，什么都不太精通。记不住的就查这里，用过的都整理好了' }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: '小弥渡的运维笔记' }],
    ['meta', { name: 'twitter:description', content: '一个运维老兵的杂货铺 — 十多年 IT 生涯，什么都接触过，什么都不太精通。记不住的就查这里，用过的都整理好了' }]
  ],
  // 本地搜索 - 基于 MiniSearch 的模糊全文搜索
  themeConfig: {
    // 站点 Logo，支持亮色/暗色双版本
    logo: {
      light: '/logo-light.png',
      dark: '/logo-dark.png',
    },
    // 隐藏 Logo 旁边的站点标题文字
    siteTitle: false,
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文章',
                buttonAriaLabel: '搜索文章'
              },
              modal: {
                noResultsText: '未找到相关结果',
                resetButtonTitle: '清除搜索条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '速查手册', link: '/quickref/' },
      {
        text: '笔记',
        items: [
          { text: 'Linux', link: '/linux/' },
          { text: '网络', link: '/network/' },
          { text: '安全', link: '/security/' },
          { text: '数据库', link: '/database/' },
          { text: '中间件', link: '/middleware/' },
          { text: '云平台', link: '/cloud/' },
          { text: '自动化运维', link: '/automation/' }
        ]
      },
      { text: '关于我', link: '/about' }
    ],

    // 侧边栏 - 根据路径自动匹配
    sidebar: {
      '/quickref/': [
        {
          text: '速查手册',
          items: [
            { text: 'AI',  items: [
              { text: 'ai-tools', link: '/quickref/ai/ai-tools' },
              { text: 'chatgpt', link: '/quickref/ai/chatgpt' },
              { text: 'claude', link: '/quickref/ai/claude' },
              { text: 'codex-cli', link: '/quickref/ai/codex-cli' },
              { text: 'cursor-cli', link: '/quickref/ai/cursor-cli' },
              { text: 'gemini-cli', link: '/quickref/ai/gemini-cli' },
              { text: 'gemma4', link: '/quickref/ai/gemma4' },
              { text: 'grok', link: '/quickref/ai/grok' },
              { text: 'grok-cli', link: '/quickref/ai/grok-cli' },
            ] },
            { text: '编程语言与框架',  items: [
              { text: 'bash', link: '/quickref/programming/bash' },
              { text: 'c', link: '/quickref/programming/c' },
              { text: 'cpp', link: '/quickref/programming/cpp' },
              { text: 'cs', link: '/quickref/programming/cs' },
              { text: 'dart', link: '/quickref/programming/dart' },
              { text: 'elixir', link: '/quickref/programming/elixir' },
              { text: 'erlang', link: '/quickref/programming/erlang' },
              { text: 'flutter', link: '/quickref/programming/flutter' },
              { text: 'golang', link: '/quickref/programming/golang' },
              { text: 'graphql', link: '/quickref/programming/graphql' },
              { text: 'hook', link: '/quickref/programming/hook' },
              { text: 'java', link: '/quickref/programming/java' },
              { text: 'javascript', link: '/quickref/programming/javascript' },
              { text: 'julia', link: '/quickref/programming/julia' },
              { text: 'kotlin', link: '/quickref/programming/kotlin' },
              { text: 'laravel', link: '/quickref/programming/laravel' },
              { text: 'latex', link: '/quickref/programming/latex' },
              { text: 'lua', link: '/quickref/programming/lua' },
              { text: 'matlab', link: '/quickref/programming/matlab' },
              { text: 'nix', link: '/quickref/programming/nix' },
              { text: 'php', link: '/quickref/programming/php' },
              { text: 'powershell', link: '/quickref/programming/powershell' },
              { text: 'python', link: '/quickref/programming/python' },
              { text: 'r', link: '/quickref/programming/r' },
              { text: 'ruby', link: '/quickref/programming/ruby' },
              { text: 'rust', link: '/quickref/programming/rust' },
              { text: 'scala', link: '/quickref/programming/scala' },
              { text: 'springboot', link: '/quickref/programming/springboot' },
              { text: 'swift', link: '/quickref/programming/swift' },
              { text: 'swiftui', link: '/quickref/programming/swiftui' },
              { text: 'typescript', link: '/quickref/programming/typescript' },
            ] },
            { text: 'Docker 与容器',  items: [
              { text: 'docker', link: '/quickref/docker/docker' },
              { text: 'docker-compose', link: '/quickref/docker/docker-compose' },
              { text: 'dockerfile', link: '/quickref/docker/dockerfile' },
              { text: 'kubernetes', link: '/quickref/docker/kubernetes' },
            ] },
            { text: '配置格式',  items: [
              { text: 'ini', link: '/quickref/config/ini' },
              { text: 'json', link: '/quickref/config/json' },
              { text: 'toml', link: '/quickref/config/toml' },
              { text: 'yaml', link: '/quickref/config/yaml' },
            ] },
            { text: '前端开发',  items: [
              { text: 'canvas', link: '/quickref/frontend/canvas' },
              { text: 'css', link: '/quickref/frontend/css' },
              { text: 'electron', link: '/quickref/frontend/electron' },
              { text: 'emmet', link: '/quickref/frontend/emmet' },
              { text: 'es6', link: '/quickref/frontend/es6' },
              { text: 'feds', link: '/quickref/frontend/feds' },
              { text: 'html', link: '/quickref/frontend/html' },
              { text: 'htmx', link: '/quickref/frontend/htmx' },
              { text: 'jquery', link: '/quickref/frontend/jquery' },
              { text: 'leaf', link: '/quickref/frontend/leaf' },
              { text: 'lessjs', link: '/quickref/frontend/lessjs' },
              { text: 'nextjs', link: '/quickref/frontend/nextjs' },
              { text: 'pinia', link: '/quickref/frontend/pinia' },
              { text: 'react', link: '/quickref/frontend/react' },
              { text: 'react-native', link: '/quickref/frontend/react-native' },
              { text: 'reactrouter', link: '/quickref/frontend/reactrouter' },
              { text: 'rxjs', link: '/quickref/frontend/rxjs' },
              { text: 'sass', link: '/quickref/frontend/sass' },
              { text: 'styled-components', link: '/quickref/frontend/styled-components' },
              { text: 'stylex', link: '/quickref/frontend/stylex' },
              { text: 'stylus', link: '/quickref/frontend/stylus' },
              { text: 'tailwindcss', link: '/quickref/frontend/tailwindcss' },
              { text: 'tauri', link: '/quickref/frontend/tauri' },
              { text: 'vue', link: '/quickref/frontend/vue' },
              { text: 'vue2', link: '/quickref/frontend/vue2' },
              { text: 'wails', link: '/quickref/frontend/wails' },
            ] },
            { text: 'Node.js 生态',  items: [
              { text: 'bun', link: '/quickref/nodejs/bun' },
              { text: 'ejs', link: '/quickref/nodejs/ejs' },
              { text: 'expressjs', link: '/quickref/nodejs/expressjs' },
              { text: 'jest', link: '/quickref/nodejs/jest' },
              { text: 'koajs', link: '/quickref/nodejs/koajs' },
              { text: 'lerna', link: '/quickref/nodejs/lerna' },
              { text: 'nestjs', link: '/quickref/nodejs/nestjs' },
              { text: 'npm', link: '/quickref/nodejs/npm' },
              { text: 'nvm', link: '/quickref/nodejs/nvm' },
              { text: 'package.json', link: '/quickref/nodejs/package.json' },
              { text: 'pm2', link: '/quickref/nodejs/pm2' },
              { text: 'pnpm', link: '/quickref/nodejs/pnpm' },
              { text: 'yarn', link: '/quickref/nodejs/yarn' },
            ] },
            { text: 'Python 生态',  items: [
              { text: 'conda', link: '/quickref/python/conda' },
              { text: 'django', link: '/quickref/python/django' },
              { text: 'fastapi', link: '/quickref/python/fastapi' },
              { text: 'flask', link: '/quickref/python/flask' },
              { text: 'jupyter', link: '/quickref/python/jupyter' },
              { text: 'pip', link: '/quickref/python/pip' },
              { text: 'pytorch', link: '/quickref/python/pytorch' },
              { text: 'uv', link: '/quickref/python/uv' },
            ] },
            { text: 'Linux 与命令行',  items: [
              { text: '7zip', link: '/quickref/commands/7zip' },
              { text: 'adb', link: '/quickref/commands/adb' },
              { text: 'ansible', link: '/quickref/commands/ansible' },
              { text: 'awk', link: '/quickref/commands/awk' },
              { text: 'chmod', link: '/quickref/commands/chmod' },
              { text: 'chown', link: '/quickref/commands/chown' },
              { text: 'cmd', link: '/quickref/commands/cmd' },
              { text: 'cron', link: '/quickref/commands/cron' },
              { text: 'curl', link: '/quickref/commands/curl' },
              { text: 'dotnet-cli', link: '/quickref/commands/dotnet-cli' },
              { text: 'find', link: '/quickref/commands/find' },
              { text: 'grep', link: '/quickref/commands/grep' },
              { text: 'iptables', link: '/quickref/commands/iptables' },
              { text: 'jq', link: '/quickref/commands/jq' },
              { text: 'netstat', link: '/quickref/commands/netstat' },
              { text: 'screen', link: '/quickref/commands/screen' },
              { text: 'sed', link: '/quickref/commands/sed' },
              { text: 'ssh', link: '/quickref/commands/ssh' },
              { text: 'systemd', link: '/quickref/commands/systemd' },
              { text: 'tar', link: '/quickref/commands/tar' },
              { text: 'taskset', link: '/quickref/commands/taskset' },
              { text: 'tmux', link: '/quickref/commands/tmux' },
              { text: 'zip', link: '/quickref/commands/zip' },
            ] },
            { text: '工具与编辑器',  items: [
              { text: 'cmake', link: '/quickref/tools/cmake' },
              { text: 'emacs', link: '/quickref/tools/emacs' },
              { text: 'ffmpeg', link: '/quickref/tools/ffmpeg' },
              { text: 'ftp', link: '/quickref/tools/ftp' },
              { text: 'gdb', link: '/quickref/tools/gdb' },
              { text: 'glances', link: '/quickref/tools/glances' },
              { text: 'htop', link: '/quickref/tools/htop' },
              { text: 'justfile', link: '/quickref/tools/justfile' },
              { text: 'linux-command', link: '/quickref/tools/linux-command' },
              { text: 'lsof', link: '/quickref/tools/lsof' },
              { text: 'make', link: '/quickref/tools/make' },
              { text: 'markdown', link: '/quickref/tools/markdown' },
              { text: 'minio', link: '/quickref/tools/minio' },
              { text: 'mitmproxy', link: '/quickref/tools/mitmproxy' },
              { text: 'netcat', link: '/quickref/tools/netcat' },
              { text: 'nginx', link: '/quickref/tools/nginx' },
              { text: 'openssl', link: '/quickref/tools/openssl' },
              { text: 'pandoc', link: '/quickref/tools/pandoc' },
              { text: 'ps', link: '/quickref/tools/ps' },
              { text: 'regex', link: '/quickref/tools/regex' },
              { text: 'sysdig', link: '/quickref/tools/sysdig' },
              { text: 'vim', link: '/quickref/tools/vim' },
              { text: 'vscode', link: '/quickref/tools/vscode' },
              { text: 'xpath', link: '/quickref/tools/xpath' },
              { text: 'yazi', link: '/quickref/tools/yazi' },
            ] },
            { text: '软件包管理器',  items: [
              { text: 'apt', link: '/quickref/package-manager/apt' },
              { text: 'cargo', link: '/quickref/package-manager/cargo' },
              { text: 'cocoapods', link: '/quickref/package-manager/cocoapods' },
              { text: 'conan', link: '/quickref/package-manager/conan' },
              { text: 'homebrew', link: '/quickref/package-manager/homebrew' },
              { text: 'pacman', link: '/quickref/package-manager/pacman' },
              { text: 'sdkman', link: '/quickref/package-manager/sdkman' },
              { text: 'yum', link: '/quickref/package-manager/yum' },
            ] },
            { text: 'Git 与协作',  items: [
              { text: 'git', link: '/quickref/git/git' },
              { text: 'github', link: '/quickref/git/github' },
              { text: 'github-actions', link: '/quickref/git/github-actions' },
              { text: 'github-cli', link: '/quickref/git/github-cli' },
              { text: 'github-copilot', link: '/quickref/git/github-copilot' },
              { text: 'gitlab', link: '/quickref/git/gitlab' },
              { text: 'gitlab-ci', link: '/quickref/git/gitlab-ci' },
              { text: 'subversion', link: '/quickref/git/subversion' },
            ] },
            { text: '数据库与搜索',  items: [
              { text: 'elasticsearch', link: '/quickref/database/elasticsearch' },
              { text: 'mongodb', link: '/quickref/database/mongodb' },
              { text: 'mysql', link: '/quickref/database/mysql' },
              { text: 'neo4j', link: '/quickref/database/neo4j' },
              { text: 'oracle', link: '/quickref/database/oracle' },
              { text: 'postgres', link: '/quickref/database/postgres' },
              { text: 'redis', link: '/quickref/database/redis' },
              { text: 'sqlite', link: '/quickref/database/sqlite' },
            ] },
            { text: '网络设备',  items: [
              { text: 'cisco-devices', link: '/quickref/network/cisco-devices' },
              { text: 'huawei-devices', link: '/quickref/network/huawei-devices' },
            ] },
            { text: '快捷键',  items: [
              { text: 'adobe-ae', link: '/quickref/shortcuts/adobe-ae' },
              { text: 'adobe-illustrator', link: '/quickref/shortcuts/adobe-illustrator' },
              { text: 'adobe-lightroom', link: '/quickref/shortcuts/adobe-lightroom' },
              { text: 'adobe-photoshop', link: '/quickref/shortcuts/adobe-photoshop' },
              { text: 'adobe-pr', link: '/quickref/shortcuts/adobe-pr' },
              { text: 'adobe-xd', link: '/quickref/shortcuts/adobe-xd' },
              { text: 'android-studio', link: '/quickref/shortcuts/android-studio' },
              { text: 'blender', link: '/quickref/shortcuts/blender' },
              { text: 'coreldraw', link: '/quickref/shortcuts/coreldraw' },
              { text: 'figma', link: '/quickref/shortcuts/figma' },
              { text: 'finder', link: '/quickref/shortcuts/finder' },
              { text: 'firefox', link: '/quickref/shortcuts/firefox' },
              { text: 'gitlab-shortcuts', link: '/quickref/shortcuts/gitlab-shortcuts' },
              { text: 'gmail', link: '/quickref/shortcuts/gmail' },
              { text: 'google-chrome', link: '/quickref/shortcuts/google-chrome' },
              { text: 'intelli-j-idea', link: '/quickref/shortcuts/intelli-j-idea' },
              { text: 'phpstorm', link: '/quickref/shortcuts/phpstorm' },
              { text: 'pycharm', link: '/quickref/shortcuts/pycharm' },
              { text: 'sketch', link: '/quickref/shortcuts/sketch' },
              { text: 'sublime-text', link: '/quickref/shortcuts/sublime-text' },
              { text: 'twitter', link: '/quickref/shortcuts/twitter' },
              { text: 'vimium', link: '/quickref/shortcuts/vimium' },
              { text: 'vscode-shortcuts', link: '/quickref/shortcuts/vscode-shortcuts' },
              { text: 'webstorm', link: '/quickref/shortcuts/webstorm' },
              { text: 'xcode', link: '/quickref/shortcuts/xcode' },
              { text: 'zed', link: '/quickref/shortcuts/zed' },
            ] },
            { text: '常用对照表',  items: [
              { text: 'ascii-code', link: '/quickref/reference/ascii-code' },
              { text: 'aspect-ratio', link: '/quickref/reference/aspect-ratio' },
              { text: 'colors-named', link: '/quickref/reference/colors-named' },
              { text: 'emoji', link: '/quickref/reference/emoji' },
              { text: 'excel-fn', link: '/quickref/reference/excel-fn' },
              { text: 'google-search', link: '/quickref/reference/google-search' },
              { text: 'html-char', link: '/quickref/reference/html-char' },
              { text: 'http-status-code', link: '/quickref/reference/http-status-code' },
              { text: 'iso-3166-1', link: '/quickref/reference/iso-3166-1' },
              { text: 'iso-639-1', link: '/quickref/reference/iso-639-1' },
              { text: 'mime', link: '/quickref/reference/mime' },
              { text: 'ports', link: '/quickref/reference/ports' },
              { text: 'quickreference', link: '/quickref/reference/quickreference' },
              { text: 'resolutions', link: '/quickref/reference/resolutions' },
              { text: 'semver', link: '/quickref/reference/semver' },
              { text: 'symbol-code', link: '/quickref/reference/symbol-code' },
              { text: 'time-zones', link: '/quickref/reference/time-zones' },
            ] },
          ]
        }
      ],
      // SIDEBAR_AUTO_GENERATED_START
      '/linux/': [
        { text: 'Linux 运维', items: [
          { text: 'CentOS 系统调优完全指南', link: '/linux/centos-tuning' },
          { text: 'CentOS 7 搭建 FTP 服务器（vsftpd）', link: '/linux/centos7-ftp-server' },
          { text: 'CentOS 7 完整安装与配置手册', link: '/linux/centos7-install-config' },
          { text: 'CentOS 7.9 升级内核三种方法', link: '/linux/centos7-kernel-upgrade' },
          { text: 'CentOS 7 安装 VNC 远程桌面服务', link: '/linux/centos7-vnc-service' },
          { text: 'journalctl 常用组合命令大全', link: '/linux/journalctl-cheatsheet' },
          { text: 'Linux 服务器之间网络测速（iperf3）', link: '/linux/linux-iperf-speedtest' },
          { text: 'Linux 软 RAID 运维命令', link: '/linux/linux-soft-raid' },
          { text: 'Markdown 排版演示', link: '/linux/markdown-demo' },
          { text: 'Rocky Linux 9.7 使用清华大学 ELRepo 源升级内核完整流程', link: '/linux/rocky-linux-kernel-upgrade' },
          { text: 'Shell 编程实战', link: '/linux/shell-programming' },
          { text: 'SSH 安全加固', link: '/linux/ssh-security' },
          { text: 'Linux systemd 服务管理添加', link: '/linux/systemd-service-management' },
          { text: 'Linux 系统故障排查指南', link: '/linux/troubleshooting' },
        ]}
      ],
      '/network/': [
        { text: '网络', items: [
          { text: 'CentOS 7 新加网卡及双网卡环境添加永久路由', link: '/network/centos7-network-route' },
          { text: '防火墙配置指南', link: '/network/firewall' },
          { text: 'FRP 内网穿透软件安装【Linux 系统】', link: '/network/frp-intranet-penetration' },
          { text: 'H3C 交换机 IRF 堆叠配置', link: '/network/h3c-irf-stack' },
          { text: '华为 AR3260 路由器配置', link: '/network/huawei-ar3260-router' },
          { text: '华为交换机运维手册', link: '/network/huawei-switch-ops' },
          { text: 'Linux 防火墙管理指南', link: '/network/linux-firewall-management' },
          { text: 'Linux 网卡 Bonding 配置指南（华为交换机版）', link: '/network/linux-network-bonding' },
          { text: 'Linux 网络配置文档', link: '/network/linux-network-config' },
          { text: '各种交换机查看邻居交换机情况', link: '/network/switch-neighbor-discovery' },
          { text: 'WAF 防护实践', link: '/network/waf' },
        ]}
      ],
      '/database/': [
        { text: '数据库', items: [
          { text: 'CentOS 7.9 离线安装 MySQL 5.7.36', link: '/database/centos7-offline-mysql5736' },
          { text: 'MySQL 数据库 binlog 日志正确清理方法', link: '/database/mysql-binlog-cleanup' },
          { text: 'MySQL 连接数激增（2万连接）紧急排查与处理手册', link: '/database/mysql-connection-surge' },
          { text: 'CentOS 7.9 MySQL 高可用集群（PXC + HAProxy + Keepalived）部署指南', link: '/database/mysql-pxc-ha-cluster' },
          { text: 'MySQL 主从复制配置', link: '/database/mysql-replication' },
          { text: 'MySQL 运维指南', link: '/database/mysql' },
          { text: 'Redis 缓存策略与高可用', link: '/database/redis-cache' },
          { text: 'Redis 运维指南', link: '/database/redis' },
        ]}
      ],
      '/middleware/': [
        { text: '中间件', items: [
          { text: 'Docker & Docker Compose 全场景命令手册', link: '/middleware/docker-full-manual' },
          { text: 'NGINX + Keepalived 高可用配置', link: '/middleware/nginx-keepalived-ha' },
          { text: 'Nginx 反向代理与负载均衡', link: '/middleware/nginx-proxy' },
          { text: 'Nginx 安全升级完整指南', link: '/middleware/nginx-security-upgrade' },
          { text: 'Nginx 配置指南', link: '/middleware/nginx' },
          { text: 'Tomcat 部署与优化', link: '/middleware/tomcat' },
        ]}
      ],
      '/cloud/': [
        { text: '云平台', items: [
          { text: 'Alibaba Cloud Linux 3 导入VMware vSphere虚拟化平台', link: '/cloud/alibaba-cloud-vmware-import' },
          { text: 'KunLun G5680 V2 单节点部署 DeepSeek-70B', link: '/cloud/deepseek-70b-deploy' },
          { text: 'Kubernetes 入门与实战', link: '/cloud/kubernetes-practice' },
          { text: 'Kubernetes 容器编排实战', link: '/cloud/kubernetes' },
          { text: 'LLaMA-Factory NPU 环境部署文档', link: '/cloud/llama-factory-npu-deploy' },
          { text: 'VMware 虚拟化运维', link: '/cloud/vmware' },
        ]}
      ],
      '/security/': [
        { text: '安全', items: [
          { text: '数据库审计与合规', link: '/security/database-audit' },
          { text: 'Kali Linux 系统 Docker 安装及部署 AWVS、Nessus', link: '/security/kali-docker-awvs-nessus' },
          { text: 'Kali Linux 安装后需要做的事情', link: '/security/kali-linux-post-install' },
          { text: 'Windows Server 域控制器重置管理员密码', link: '/security/windows-domain-controller-reset-password' },
          { text: '堡垒机部署与配置', link: '/security/堡垒机' },
          { text: '数据库审计实践', link: '/security/数据库审计' },
        ]}
      ],
      '/automation/': [
        { text: '自动化运维', items: [
          { text: 'Ansible 入门与实战', link: '/automation/ansible' },
          { text: 'elssh 构建指南 - 基于 Docker 的 RPM 打包', link: '/automation/elssh-build-guide' },
          { text: 'Jenkins CI/CD 流水线搭建', link: '/automation/jenkins' },
          { text: 'Prometheus 监控体系搭建', link: '/automation/prometheus' },
          { text: 'rsync + inotify 实时文件同步工具', link: '/automation/rsync-inotify-sync' },
          { text: 'Shell 脚本自动化实战', link: '/automation/shell-scripts' },
          { text: 'Zabbix 企业级监控实战', link: '/automation/zabbix' },
        ]}
      ],
      // SIDEBAR_AUTO_GENERATED_END
    },

    // 页脚
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} 小弥渡`
    }
  },

})
