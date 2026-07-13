import { defineConfig } from 'vitepress'

const isNetlify = !!process.env.NETLIFY
const isDev = !process.env.BASE_PATH
const basePath = isDev || isNetlify ? '/' : '/suzm-notes/'

export default defineConfig({
  base: basePath,
  title: '小弥渡的运维笔记',
  description: '小弥渡的技术分享与日常笔记',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: `${basePath}logo.svg`, type: 'image/svg+xml' }],
    ['meta', { property: 'og:title', content: '小弥渡的运维笔记' }],
    ['meta', { property: 'og:description', content: '运维工程师的技术沉淀与实战经验分享' }],
    ['meta', { property: 'og:url', content: 'https://suzm.cn' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: '小弥渡的运维笔记' }],
    ['meta', { name: 'twitter:description', content: '运维工程师的技术沉淀与实战经验分享' }]
  ],
  // 本地搜索 - 基于 MiniSearch 的模糊全文搜索
  themeConfig: {
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
            { text: 'AI', collapsed: true, items: [
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
            { text: '编程语言与框架', collapsed: true, items: [
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
            { text: 'Docker 与容器', collapsed: true, items: [
              { text: 'docker', link: '/quickref/docker/docker' },
              { text: 'docker-compose', link: '/quickref/docker/docker-compose' },
              { text: 'dockerfile', link: '/quickref/docker/dockerfile' },
              { text: 'kubernetes', link: '/quickref/docker/kubernetes' },
            ] },
            { text: '配置格式', collapsed: true, items: [
              { text: 'ini', link: '/quickref/config/ini' },
              { text: 'json', link: '/quickref/config/json' },
              { text: 'toml', link: '/quickref/config/toml' },
              { text: 'yaml', link: '/quickref/config/yaml' },
            ] },
            { text: '前端开发', collapsed: true, items: [
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
            { text: 'Node.js 生态', collapsed: true, items: [
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
            { text: 'Python 生态', collapsed: true, items: [
              { text: 'conda', link: '/quickref/python/conda' },
              { text: 'django', link: '/quickref/python/django' },
              { text: 'fastapi', link: '/quickref/python/fastapi' },
              { text: 'flask', link: '/quickref/python/flask' },
              { text: 'jupyter', link: '/quickref/python/jupyter' },
              { text: 'pip', link: '/quickref/python/pip' },
              { text: 'pytorch', link: '/quickref/python/pytorch' },
              { text: 'uv', link: '/quickref/python/uv' },
            ] },
            { text: 'Linux 与命令行', collapsed: true, items: [
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
            { text: '工具与编辑器', collapsed: true, items: [
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
            { text: '软件包管理器', collapsed: true, items: [
              { text: 'apt', link: '/quickref/package-manager/apt' },
              { text: 'cargo', link: '/quickref/package-manager/cargo' },
              { text: 'cocoapods', link: '/quickref/package-manager/cocoapods' },
              { text: 'conan', link: '/quickref/package-manager/conan' },
              { text: 'homebrew', link: '/quickref/package-manager/homebrew' },
              { text: 'pacman', link: '/quickref/package-manager/pacman' },
              { text: 'sdkman', link: '/quickref/package-manager/sdkman' },
              { text: 'yum', link: '/quickref/package-manager/yum' },
            ] },
            { text: 'Git 与协作', collapsed: true, items: [
              { text: 'git', link: '/quickref/git/git' },
              { text: 'github', link: '/quickref/git/github' },
              { text: 'github-actions', link: '/quickref/git/github-actions' },
              { text: 'github-cli', link: '/quickref/git/github-cli' },
              { text: 'github-copilot', link: '/quickref/git/github-copilot' },
              { text: 'gitlab', link: '/quickref/git/gitlab' },
              { text: 'gitlab-ci', link: '/quickref/git/gitlab-ci' },
              { text: 'subversion', link: '/quickref/git/subversion' },
            ] },
            { text: '数据库与搜索', collapsed: true, items: [
              { text: 'elasticsearch', link: '/quickref/database/elasticsearch' },
              { text: 'mongodb', link: '/quickref/database/mongodb' },
              { text: 'mysql', link: '/quickref/database/mysql' },
              { text: 'neo4j', link: '/quickref/database/neo4j' },
              { text: 'oracle', link: '/quickref/database/oracle' },
              { text: 'postgres', link: '/quickref/database/postgres' },
              { text: 'redis', link: '/quickref/database/redis' },
              { text: 'sqlite', link: '/quickref/database/sqlite' },
            ] },
            { text: '网络设备', collapsed: true, items: [
              { text: 'cisco-devices', link: '/quickref/network/cisco-devices' },
              { text: 'huawei-devices', link: '/quickref/network/huawei-devices' },
            ] },
            { text: '快捷键', collapsed: true, items: [
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
            { text: '常用对照表', collapsed: true, items: [
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
      '/linux/': [
        { text: 'Linux 运维', items: 'auto', collapsed: false }
      ],
      '/network/': [
        { text: '网络', items: 'auto', collapsed: false }
      ],
      '/database/': [
        { text: '数据库', items: 'auto', collapsed: false }
      ],
      '/middleware/': [
        { text: '中间件', items: 'auto', collapsed: false }
      ],
      '/cloud/': [
        { text: '云平台', items: 'auto', collapsed: false }
      ],
      '/security/': [
        { text: '安全', items: 'auto', collapsed: false }
      ],
      '/automation/': [
        { text: '自动化运维', items: 'auto', collapsed: false }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/SuLingYun/suzm-notes' }
    ],

    // 页脚
    footer: {
      message: '以专业态度记录运维实践',
      copyright: `Copyright © ${new Date().getFullYear()} 小弥渡`
    }
  },

})
