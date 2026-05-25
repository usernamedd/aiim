# AIIM 前端实现计划

> 版本: v1.0 | 日期: 2026-05-25 | 状态: 待开发
>
> 本文档为 **AIIM 全端前端** 实现计划，覆盖所有页面（P00-P61），对齐 `aiim-software-engineering-v2.md` 的双维度架构：桌面端（Tauri + React）+ 移动端（Taro/RN）。

---

## 1. 架构概览

### 1.1 双维度架构

```
维度一：屏幕尺寸（响应式布局）
  └── CSS/Tailwind 统一实现，移动端优先

维度二：操作系统（平台适配）
  ├── 桌面端：Tauri + React（Windows / macOS / Linux）
  └── 移动端：Taro + React Native（Android / iOS）
```

### 1.2 页面矩阵

| 页面 ID | 页面名称 | 桌面端 | 移动端 |
|---------|---------|--------|--------|
| P00 | 启动页 | ✅ 全屏 | ✅ 全屏 |
| P01 | 登录页 | ✅ 居中卡片 | ✅ 全屏表单 |
| P02 | 注册页 | ✅ 居中卡片 | ✅ 全屏表单 |
| P03 | 忘记密码页 | ✅ 居中卡片 | ✅ 全屏表单 |
| P10 | 主聊列表页 | ✅ 侧边栏+多面板 | ✅ 抽屉+底部Tab |
| P20 | 私聊页 | ✅ 三栏布局 | ✅ 单栏+底部Tab |
| P21 | 群聊页 | ✅ 三栏布局 | ✅ 单栏+底部Tab |
| P22 | 联系人列表页 | ✅ 侧边栏Tab | ✅ 独立页面 |
| P30 | 文件浏览器页 | ✅ 多功能面板 | ✅ 独立Tab Page |
| P31 | 调试控制台页 | ✅ 多功能面板 | ✅ 独立Tab Page |
| P32 | 差异对比页 | ✅ 多功能面板 | ✅ 独立Tab Page |
| P33 | AI助手页 | ✅ 多功能面板 | ✅ 独立Tab Page |
| P40 | 仪表盘页 | ✅ 金融切面默认 | ✅ 独立Tab Page |
| P41 | 持仓详情页 | ✅ 长条页面 | ✅ 单栏滚动 |
| P50 | 个人设置页 | ✅ 左侧列表 | ✅ 单栏列表 |
| P51 | 切行业切换页 | ✅ 居中列表 | ✅ 单栏列表 |
| P60 | 全局搜索页 | ✅ 弹窗/侧边 | ✅ 全屏 |
| P61 | 搜索结果页 | ✅ 结果页面 | ✅ 单栏列表 |

### 1.3 技术栈（锁定）

```json
{
  "desktop": {
    "framework": "Tauri 2.x",
    "frontend": "React 18.3",
    "language": "TypeScript 5.4",
    "state": "Zustand 4.5",
    "styling": "Tailwind CSS 3.4",
    "layout": "react-resizable-panels 2.1",
    "icons": "@tabler/icons-react 2.47",
    "codeHighlight": "shiki 1.22",
    "fileTree": "react-virtualized-tree 2.8",
    "diff": "diff-match-patch 1.0"
  },
  "mobile": {
    "framework": "Taro 4.x (React Native)",
    "language": "TypeScript 5.4",
    "state": "Zustand 4.5",
    "styling": "Taro UI / UnoCSS",
    "navigation": "@react-navigation/native"
  },
  "shared": {
    "codeHighlight": "shiki 1.22",
    "diff": "diff-match-patch 1.0",
    "websocket": "native WebSocket",
    "sse": "EventSource"
  }
}
```

---

## 2. 基础架构阶段

### 2.1 项目脚手架

**目标：** 建立桌面端和移动端两个独立项目，统一代码组织规范。

**桌面端（Tauri）：**
```
frontend/desktop/
├── src/
│   ├── app/                    # 根组件、路由配置
│   │   └── App.tsx
│   ├── pages/                 # 页面组件（P00-P61）
│   │   ├── P01-登录页/
│   │   ├── P10-主聊列表页/
│   │   └── ...
│   ├── components/             # 全局共享组件
│   │   ├── C00-TopBar/
│   │   ├── C05-Avatar/
│   │   ├── C07-Button/
│   │   ├── C08-Input/
│   │   └── C11-EmptyState/
│   ├── features/              # 按功能分目录
│   │   ├── auth/              # 认证功能
│   │   ├── im/                # 即时通讯
│   │   ├── multi-panel/       # 多功能面板
│   │   │   ├── FileExplorer/
│   │   │   ├── DebugPanel/
│   │   │   ├── DiffView/
│   │   │   └── AIAssistant/
│   │   ├── financial/         # 金融研究切面
│   │   └── settings/          # 设置功能
│   ├── shared/                 # 跨端共享逻辑
│   │   ├── hooks/
│   │   ├── stores/            # Zustand stores
│   │   ├── types/
│   │   └── utils/
│   └── styles/
│       └── globals.css
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── src-tauri/
    ├── Cargo.toml
    └── tauri.conf.json
```

**移动端（Taro）：**
```
frontend/mobile/
├── src/
│   ├── app.tsx                 # 根组件
│   ├── pages/                  # 页面组件（对应 P00-P61）
│   │   ├── index (P10-主聊列表)
│   │   ├── chat-P20/
│   │   ├── chat-P21/
│   │   └── ...
│   ├── components/             # 共享组件（RN 版本）
│   │   ├── C00-TopBar/
│   │   ├── C05-Avatar/
│   │   └── ...
│   ├── features/              # 按功能分目录
│   │   ├── auth/
│   │   ├── im/
│   │   ├── multi-panel/
│   │   └── ...
│   ├── shared/                 # 跨端共享逻辑
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   └── styles/
├── package.json
├── tsconfig.json
├── babel.config.js
└── taro.config.ts
```

**跨端共享策略：**
```
┌─────────────────────────────────────────┐
│         共享业务逻辑层                   │
│  (消息处理 / AI交互 / 文件操作)          │
│  → frontend/shared/                    │
├──────────────────┬──────────────────────┤
│  desktop/       │  mobile/            │
│  (React Web)   │  (React Native)     │
├──────────────────┴──────────────────────┤
│         共享 UI 组件库                  │
│  (消息气泡 / 代码块 / 文件卡片)          │
│  → components/Cxx-*                   │
└─────────────────────────────────────────┘
```

**任务清单：**

- [ ] `desktop/` 初始化 Tauri 项目 + React + TypeScript
- [ ] `mobile/` 初始化 Taro 项目 + React Native
- [ ] 配置 `frontend/shared/` 共享目录结构
- [ ] 配置 Tailwind CSS（desktop）
- [ ] 配置 UnoCSS（Taro）
- [ ] 配置 `@tabler/icons-react` 图标库
- [ ] 配置 `shiki` 代码高亮库
- [ ] 配置 `diff-match-patch` Diff 库
- [ ] 配置 Zustand store 架构
- [ ] 配置 Vite path aliases（`@/` → `src/`）
- [ ] 配置 ESLint / Prettier 代码规范

---

### 2.2 共享组件库（C 系列）

**目标：** 实现所有可复用 UI 组件，桌面端和移动端共享设计规范，但组件实现分开（Taro RN 版本 vs React Web 版本）。

| 组件 ID | 组件名称 | 说明 | 状态 |
|---------|---------|------|------|
| C00 | TopBar | 顶部导航栏 | 待实现 |
| C01 | TabBar | 底部/顶部 Tab 切换 | 待实现 |
| C02 | SearchBar | 搜索框 | 待实现 |
| C03 | Toast | 轻提示 | 待实现 |
| C04 | Dialog | 对话框/确认框 | 待实现 |
| C05 | Avatar | 头像组件 | 待实现 |
| C06 | Badge | 徽章/计数 | 待实现 |
| C07 | Button | 按钮 | 待实现 |
| C08 | Input | 输入框 | 待实现 |
| C09 | Switch | 开关 | 待实现 |
| C10 | Slider | 滑动条 | 待实现 |
| C11 | EmptyState | 空状态占位 | 待实现 |
| C12 | Loading | 加载指示器 | 待实现 |
| C13 | MessageBubble | 消息气泡 | 待实现 |
| C14 | CodeBlock | 代码块 | 待实现 |
| C15 | FileCard | 文件卡片 | 待实现 |
| C16 | Tree | 树形控件 | 待实现 |

**任务清单：**

- [ ] C00 TopBar 桌面端 + 移动端
- [ ] C01 TabBar 桌面端（顶部） + 移动端（底部）
- [ ] C02 SearchBar 桌面端 + 移动端
- [ ] C03 Toast 桌面端 + 移动端
- [ ] C04 Dialog 桌面端 + 移动端
- [ ] C05 Avatar 桌面端 + 移动端
- [ ] C06 Badge 桌面端 + 移动端
- [ ] C07 Button 桌面端 + 移动端（含 Primary/Secondary/Danger/Ghost 变体）
- [ ] C08 Input 桌面端 + 移动端（含 Textarea 变体）
- [ ] C09 Switch 桌面端 + 移动端
- [ ] C10 Slider 桌面端 + 移动端
- [ ] C11 EmptyState 桌面端 + 移动端
- [ ] C12 Loading 桌面端 + 移动端
- [ ] C13 MessageBubble（文本/图片/文件/代码消息气泡）
- [ ] C14 CodeBlock（语法高亮 + 行号 + 复制按钮）
- [ ] C15 FileCard 桌面端 + 移动端
- [ ] C16 Tree 桌面端 + 移动端（虚拟化大列表）

---

### 2.3 路由与状态架构

**目标：** 建立页面路由和全局状态管理。

**路由设计：**
```
PWA 路由：
/              → P00 启动页（自动检测登录状态跳转）
login          → P01 登录页
register       → P02 注册页
forgot-password → P03 忘记密码页
home           → P10 主聊列表页
chat/:chatId   → P20 私聊页 或 P21 群聊页
contacts       → P22 联系人列表页
dashboard      → P40 仪表盘页
stock/:symbol  → P41 持仓详情页
settings       → P50 个人设置页
settings/domain → P51 切行业切换页
search         → P60 全局搜索页
search/results → P61 搜索结果页
```

**全局状态（Zustand）：**
```
stores/
├── auth-store.ts         # 登录状态、Token、用户信息
├── app-mode-store.ts    # 当前行业切面（金融/软件工程/医疗/通用）
├── chat-store.ts        # 会话列表、当前会话、消息分页
├── domain-store.ts      # 行业切面数据（持仓/文件/调试等）
├── ui-store.ts          # 侧边栏折叠状态、IDE面板Tab、多语言
└── search-store.ts      # 搜索历史、搜索结果
```

**任务清单：**

- [ ] 桌面端路由配置（React Router v6）
- [ ] 移动端路由配置（Taro 路由）
- [ ] `auth-store.ts` 实现
- [ ] `app-mode-store.ts` 实现（含切面切换逻辑）
- [ ] `chat-store.ts` 实现（含 WebSocket 消息订阅）
- [ ] `domain-store.ts` 实现（金融/软件工程数据分离）
- [ ] `ui-store.ts` 实现（面板折叠/展开状态）
- [ ] `search-store.ts` 实现

---

## 3. 阶段一：认证模块（P01-P03）

**目标：** 实现登录、注册、忘记密码三个页面，连接后端认证 API。

**技术要点：**
- 表单验证（手机号、邮箱、密码强度）
- JWT Token 存储（桌面端 localStorage，移动端 SecureStore）
- 登录状态全局同步
- 第三方登录占位（微信/Google，后续接入）

**对应设计文档：**
- `pages/P01-登录页.md`
- `pages/P02-注册页.md`
- `pages/P03-忘记密码页.md`

**任务清单：**

- [ ] P01 登录页桌面端（居中卡片，Logo + 表单 + 第三方登录 + 底部链接）
- [ ] P01 登录页移动端（全屏表单）
- [ ] P02 注册页桌面端（居中卡片 + 协议勾选）
- [ ] P02 注册页移动端（全屏表单）
- [ ] P03 忘记密码页桌面端 + 移动端（手机号+验证码+新密码）
- [ ] 表单验证 Hook（`useFormValidation`）
- [ ] 认证 API 对接（登录/注册/忘记密码/获取Token）
- [ ] JWT 存储和自动刷新逻辑
- [ ] 登录后跳转到主聊列表（P10）

---

## 4. 阶段二：主聊列表 + 消息基础设施（P10 / P20 / P21 / P22）

**目标：** 实现 IM 核心功能：会话列表、私聊、群聊、联系人。

**技术要点：**
- WebSocket 实时消息推送
- 消息分页加载（滚动到底部加载历史）
- 消息类型：文本/图片/文件/代码块
- 已读/未读状态
- 群成员列表

**对应设计文档：**
- `pages/P10-主聊列表页.md`
- `pages/P20-私聊页.md`
- `pages/P21-群聊页.md`
- `pages/P22-联系人列表页.md`

**4.1 主聊列表页（P10）**

- [ ] 桌面端：侧边栏（220px）+ 多面板布局
- [ ] 移动端：抽屉式侧边栏 + 底部 Tab
- [ ] 会话列表组件（按最近消息排序）
- [ ] Tab 切换（聊天群组文件）
- [ ] 新建聊天按钮
- [ ] WebSocket 在线状态同步

**4.2 私聊页（P20）**

- [ ] 桌面端：三栏布局（会话列表 + 消息流 + 面板）
- [ ] 移动端：单栏 + 底部 Tab 切换功能
- [ ] 消息气泡列表（文本/图片/文件/代码）
- [ ] 消息输入区（支持多附件）
- [ ] 多功能面板 Tab（文件浏览器/调试/差异/AI助手）
- [ ] 消息分页加载（上拉加载历史）
- [ ] 实时消息推送（WebSocket）
- [ ] 已读回执

**4.3 群聊页（P21）**

- [ ] 群信息侧边栏（群头像/名称/成员数）
- [ ] 群成员列表（可收起/展开）
- [ ] 置顶消息功能
- [ ] @提及高亮
- [ ] 群聊消息气泡（区别于私聊的标识）

**4.4 联系人列表页（P22）**

- [ ] Tab 切换（联系人/群聊）
- [ ] 联系人列表（头像 + 昵称 + 在线状态）
- [ ] 搜索过滤
- [ ] 添加联系人/创建群聊入口
- [ ] 邀请成员功能

---

## 5. 阶段三：金融研究切面（P40 / P41）

**目标：** 实现金融研究行业切面的专属页面：仪表盘和持仓详情。

**对应设计文档：**
- `pages/P40-仪表盘页.md`
- `pages/P41-持仓详情页.md`

**技术要点：**
- K 线图（使用 `tradingview-lightweightcharts` 或 `echarts-for-react`）
- 实时行情数据（WebSocket 推送）
- 持仓卡片交互
- 股票搜索和自选

**任务清单：**

- [ ] P40 仪表盘页桌面端（K线图 + 持仓卡片 + 统计面板）
- [ ] P40 仪表盘页移动端（单栏垂直布局）
- [ ] K线图表组件（分时/日K/周K/月K 多周期）
- [ ] 持仓卡片组件（成本/市值/盈亏）
- [ ] 实时行情 WebSocket 对接
- [ ] P41 持仓详情页桌面端 + 移动端
- [ ] 估值指标卡（PE/PB/市值等）
- [ ] 分红融资卡
- [ ] 相关新闻区（情感标签）
- [ ] 交易/提醒按钮（跳转外部券商）

---

## 6. 阶段四：软件工程切面 — 核心 IDE 功能（P30 / P31 / P32 / P33）

**目标：** 实现软件工程行业切面的多功能面板：文件浏览器、调试控制台、差异对比、AI助手。

> 这是原 `aiim-software-engineering-implementation-plan.md` 的核心内容，已整合到全端实现计划中，并根据 v2 设计文档更新。

**对应设计文档：**
- `pages/P30-文件浏览器页.md`
- `pages/P31-调试控制台页.md`
- `pages/P32-差异对比页.md`
- `pages/P33-AI助手页.md`

### 6.1 文件浏览器（P30）

**桌面端：** 多功能面板（360px，可折叠）
**移动端：** 独立 Tab Page

**技术要点：**
- 文件树虚拟化（`react-virtualized-tree`，500+ 文件不卡顿）
- 后端文件代理（`/api/fs/list`、`/api/fs/read`，防止路径遍历）
- WebSocket 文件变更监听（`chokidar`）
- 文件预览（代码高亮、图片、Markdown）

**任务清单：**

- [ ] 文件树组件 `FileTree.tsx`
  - ▶/▼ 展开收起
  - 文件图标按扩展名区分（.ts/.json/.md 等）
  - 🔵new 标签（git 新增文件）
  - 点击文件触发预览
- [ ] `useFileTree.ts` Hook
  - 订阅文件系统变更（WebSocket）
  - `expandNode(path)` / `collapseNode(path)`
  - `selectFile(path)`
- [ ] 文件预览组件 `FilePreview.tsx`
  - 按类型渲染（图片/文本/代码高亮）
  - 行号显示
  - 底部操作栏（复制/下载/在VSCode打开）
- [ ] 右键菜单 `FileContextMenu.tsx`
  - 在新标签页打开
  - 复制路径
  - 重命名
  - 删除
  - 发送给 AI 分析
- [ ] 后端文件代理 API
  - `GET /api/fs/list?path=src/`
  - `GET /api/fs/read?path=src/file.ts`
  - `WS /api/fs/watch` 文件变更推送
  - 鉴权：只允许读取 project root（防路径遍历）
- [ ] 拖拽文件进聊天（生成 `FileMessage`）

### 6.2 调试控制台（P31）

**桌面端：** 多功能面板（调试视图）
**移动端：** 独立 Tab Page，垂直堆叠布局

**技术要点：**
- Chrome DevTools Protocol（CDP）连接
- 断点管理（设置/取消/条件断点）
- 调用堆栈可视化
- 变量监视（局部/闭包）
- 控制台日志实时输出

**任务清单：**

- [ ] 调试控制条 `DebugBar.tsx`
  - ▶ Run / ⏸ Pause / ⏹ Stop / ⟳ Restart
  - ➡ Step Over / ➜ Step Into / ⏭ Step Out
  - 快捷键支持（F5/F10/F11/⇧F11）
- [ ] 源码面板 `SourceViewer.tsx`
  - 行号列（可点击设置断点）
  - 🔴 当前执行行高亮
  - 红点● 断点标记
- [ ] 调用堆栈面板 `CallStack.tsx`
  - 树形缩进显示调用层级
  - 点击跳转源码对应行
- [ ] 变量监视面板 `VariableWatch.tsx`
  - 局部变量 / 闭包变量分组
  - 颜色区分类型（基本/对象/字符串/异常）
  - 可添加自定义监视表达式
- [ ] 控制台输出 `DebugConsole.tsx`
  - 实时滚动跟随
  - 日志级别（log/warn/error/info）
  - 清空按钮
- [ ] CDP 连接服务
  - 后端 `CDPServer.ts`：启动 Chrome（`--headless --remote-debugging-port=9222`）或连接已有实例
  - WebSocket 桥接前端 ↔ CDP
  - 前端 `DebuggerWebSocket.ts`：断点事件、执行控制、变量/堆栈/控制台数据接收
- [ ] 后端 `POST /api/debug/connect` 接口
  - 启动/连接调试会话
  - 返回 sessionId

### 6.3 差异对比视图（P32）

**桌面端：** 多功能面板（并排双栏）
**移动端：** 独立 Tab Page，单栏手势切换

**技术要点：**
- `diff-match-patch` 计算字符级差异
- Web Worker 后台计算（大文件不阻塞 UI）
- AI 自动分析 Diff 并生成摘要

**任务清单：**

- [ ] `DiffViewer.tsx` 并排对比布局
  - 左右两个文件面板
  - 行号对齐
  - 高亮类型：🟥删除 / 🟩新增 / 🟡修改 / 🔵移动
  - 导航按钮（上一处变更 / 下一处变更）
- [ ] `DiffLine.tsx` 单行渲染
  - 根据 diff 类型应用不同颜色
  - 左侧对照线
- [ ] `useDiff.ts` Hook
  - 调用后端 API 计算 diff
  - `computeDiff(oldText, newText)` → `DiffResult[]`
- [ ] 后端 `POST /api/diff/compute` 接口（`diff-match-patch`）
- [ ] `DiffAIAnalyzer.tsx` AI 分析摘要卡片
- [ ] 后端 `POST /api/diff/analyze` 接口（调用 LLM，流式输出）
- [ ] `DiffMessage.tsx`（聊天中的 Diff 消息卡片，可点击展开）

### 6.4 AI 助手视图（P33）

**桌面端：** 多功能面板（对话形式）
**移动端：** 独立 Tab Page，消息式对话

**技术要点：**
- 流式输出（Server-Sent Events / WebSocket）
- 代码片段可复制
- 相关文件引用（点击跳转文件浏览器）
- `/explain` 斜杠命令（解释选中代码）

**任务清单：**

- [ ] `AIAssistant.tsx` AI 面板
  - 对话历史列表
  - 流式输出消息
  - 代码片段可复制
  - 相关文件引用（点击跳转）
- [ ] `useAIChat.ts` Hook
  - 调用后端 `/api/ai/chat`（SSE 流式）
  - 管理 AI 对话历史
- [ ] 后端 `POST /api/ai/chat` 接口
  - 支持上下文（当前文件 + 行号）
  - 支持 system prompt 切换
  - SSE 流式响应
- [ ] `SlashCommandMenu.tsx` 斜杠命令菜单
  - `/explain` — 解释选中代码
  - `/file` — 打开文件浏览器
  - `/debug` — 启动调试
  - `/diff` — 打开差异对比
  - 键盘导航（↑↓ + Enter）

---

## 7. 阶段五：全局搜索（P60 / P61）

**目标：** 实现统一的全局搜索功能，覆盖消息、文件、联系人、代码。

**对应设计文档：**
- `pages/P60-全局搜索页.md`
- `pages/P61-搜索结果页.md`

**技术要点：**
- 实时搜索（debounce 300ms）
- 多类型过滤（Tab：全部/消息/文件/联系人/代码）
- 关键词高亮
- 分页加载

**任务清单：**

- [ ] P60 全局搜索页桌面端 + 移动端
  - 搜索输入框（自动聚焦）
  - Tab 过滤栏
  - 最近搜索记录
  - 推荐搜索
- [ ] P61 搜索结果页桌面端 + 移动端
  - 结果分组（消息/文件/联系人/代码）
  - 高级筛选面板（时间范围/文件类型/发送者）
  - 排序（相关性/时间/文件大小）
  - 分页导航
- [ ] 后端 `GET /api/search?q=&type=&page=` 接口
- [ ] 高亮文本组件（`HighlightedText`）
- [ ] 点击结果跳转对应页面并定位

---

## 8. 阶段六：设置与其他页面（P50 / P51）

**目标：** 实现个人设置和行业切面切换功能。

**对应设计文档：**
- `pages/P50-个人设置页.md`
- `pages/P51-切行业切换页.md`

**任务清单：**

- [ ] P50 个人设置页桌面端（分组列表） + 移动端（单栏列表）
  - 账号信息（头像/昵称/手机/邮箱/密码）
  - 外观设置（主题/字体大小/语言）
  - 通知设置（推送/提示音/免打扰）
  - 隐私设置（在线状态/已读回执）
  - 存储空间（使用量/清理缓存）
  - 关于（版本号/用户协议/开源许可）
  - 退出登录
- [ ] P51 切行业切换页
  - 当前切面提示
  - 切面列表（通用/金融研究/软件工程/医疗）
  - 切换确认对话框
  - `app-mode-store.ts` 状态更新

---

## 9. 阶段七：集成与优化

**目标：** 全端集成、响应式适配完善、性能优化。

**任务清单：**

- [ ] 桌面端响应式布局验证（< 768px / 768-1023px / ≥ 1024px）
- [ ] 移动端响应式布局验证（竖屏/横屏切换）
- [ ] 触控交互验证（长按/双击/滑动手势）
- [ ] WebSocket 重连逻辑（网络波动恢复）
- [ ] 离线消息缓存（localStorage / AsyncStorage）
- [ ] 性能优化
  - 消息列表虚拟滚动（大对话不卡）
  - 文件树虚拟化（500+ 文件）
  - 图片懒加载
  - 代码块按需渲染
- [ ] 快捷键全局注册（桌面端）
- [ ] 多语言支持（i18n，占位，后续扩展）
- [ ] 主题切换（深色/浅色/跟随系统）

---

## 10. 任务总览

| 阶段 | 内容 | 任务数 |
|------|------|--------|
| **2. 基础架构** | 项目脚手架 + 组件库 + 路由状态 | ~30 |
| **3. 阶段一** | 认证模块（P01-P03） | ~10 |
| **4. 阶段二** | IM核心（P10/P20/P21/P22） | ~25 |
| **5. 阶段三** | 金融切面（P40/P41） | ~12 |
| **6. 阶段四** | 软件工程IDE（P30/P31/P32/P33） | ~35 |
| **7. 阶段五** | 全局搜索（P60/P61） | ~10 |
| **8. 阶段六** | 设置页面（P50/P51） | ~10 |
| **9. 阶段七** | 集成与优化 | ~15 |
| **合计** | | **~157** |

---

## 11. 参考文档

| 文档 | 说明 |
|------|------|
| `aiim-software-engineering-v2.md` | v2.1 多端维度架构设计（桌面+移动） |
| `aiim-ui-design.md` | 全端统一界面设计文档（汇总） |
| `pages/P00-P61.md` | 17个独立页面详细设计文档 |
| `技术选型.md` | 技术栈选型理由 |
| `docs/backend/需求文档/需求文档.md` | 后端需求文档 |

---

*AIIM 前端实现计划 v1.0，2026-05-25*
