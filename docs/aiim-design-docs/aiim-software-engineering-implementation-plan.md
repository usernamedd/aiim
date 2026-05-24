# AIIM 软件工程场景 · 技术实现计划

> 版本: v1.0 | 日期: 2026-05-24 | 状态: 待开发

---

## 🎯 交付目标

在 AIIM 项目中新增**软件工程专属 UI 模式**，包含：
1. 文件浏览器（Explorer Panel）
2. 调试视图（Debug Panel）
3. 差异对比视图（Diff View）
4. AI 代码助手视图
5. 代码消息类型
6. 快捷指令系统

---

## 📦 技术栈版本（锁定）

```json
{
  "frontend": {
    "framework": "React 18.3",
    "language": "TypeScript 5.4",
    "state": "Zustand 4.5",
    "fileTree": "react-virtualized-tree 2.8",
    "codeHighlight": "shiki 1.22",
    "diff": "diff-match-patch 1.0",
    "styling": "Tailwind CSS 3.4",
    "icons": "@tabler/icons-react 2.47",
    "layout": "react-resizable-panels 2.1"
  },
  "backend": {
    "runtime": "Node.js 20 LTS",
    "fileProxy": "chokidar 3.6",
    "websocket": "ws 8.18",
    "llm": "OpenAI SDK 1.58"
  }
}
```

---

## 🔢 阶段一：项目脚手架 + 基础架构

### 1.1 搭建前端项目结构

**目标：** 确定目录结构和技术栈版本

```
frontend/
├── src/
│   ├── features/                    ← 按功能分目录
│   │   ├── software-engineering/   ← 软件工程场景
│   │   │   ├── components/
│   │   │   │   ├── FileExplorer/
│   │   │   │   │   ├── FileTree.tsx
│   │   │   │   │   ├── FilePreview.tsx
│   │   │   │   │   ├── FileContextMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── DebugPanel/
│   │   │   │   │   ├── DebugView.tsx
│   │   │   │   │   ├── CallStack.tsx
│   │   │   │   │   ├── VariableWatch.tsx
│   │   │   │   │   ├── DebugConsole.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── DiffView/
│   │   │   │   │   ├── DiffViewer.tsx
│   │   │   │   │   ├── DiffLine.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── AIAssistant/
│   │   │   │   │   ├── AIChat.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── styles/
│   │   │   │   └── software-engineering.css
│   │   │   ├── hooks/
│   │   │   │   ├── useFileTree.ts
│   │   │   │   ├── useDebugger.ts
│   │   │   │   └── useDiff.ts
│   │   │   ├── stores/
│   │   │   │   └── software-engineering-store.ts
│   │   │   └── index.ts
│   │   └── im/                      ← 已有 IM 核心
│   │       └── components/
│   │           ├── MessageArea.tsx
│   │           └── ChatInput.tsx
│   ├── shared/
│   │   ├── components/
│   │   │   ├── CodeBlock.tsx        ← 代码消息
│   │   │   └── SlashCommandMenu.tsx ← 斜杠命令
│   │   └── types/
│   │       └── index.ts
│   └── App.tsx
├── package.json
└── tsconfig.json
```

**任务清单：**

- [ ] `01-init.sh` 创建目录结构
- [ ] `02-install-pkgs.sh` 安装所有依赖
- [ ] `03-tsconfig.json` 配置 TypeScript
- [ ] `04-tailwind.config.js` 配置 Tailwind
- [ ] `05-path-aliases.json` 配置 Vite path aliases
- [ ] `06-eslint-rules.json` ESLint 规则

---

### 1.2 场景切换架构

**目标：** 在 App 顶层支持「金融研究」和「软件工程」两种 UI 模式

```typescript
// stores/app-mode-store.ts
type AppMode = 'financial' | 'software-engineering';

// 全局状态
interface AppStore {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}
```

**UI 布局：**

```
金融研究模式:
  侧边栏 + [仪表盘/研报面板] + 消息流

软件工程模式:
  侧边栏 + 消息流 + [IDE多功能面板]
```

**任务清单：**

- [ ] `app-mode-store.ts` 建立 AppMode 状态
- [ ] `App.tsx` 顶部 Tab 切换组件
- [ ] `Sidebar.tsx` 根据 mode 渲染不同侧边栏
- [ ] `MainArea.tsx` 根据 mode 挂载不同主面板
- [ ] `ide-panel-store.ts` 记住 IDE 面板折叠状态

---

## 🔢 阶段二：文件浏览器（Explorer Panel）

### 2.1 文件树组件

**目标：** 类似 VSCode 资源管理器，支持目录展开、文件点击、右键菜单

**核心依赖：**
- `react-virtualized-tree` — 大目录虚拟化渲染（目录超过500个文件不卡）
- `chokidar` — 后端监听文件变化（前端 WebSocket 接收）

**任务清单：**

- [ ] `FileTree.tsx` 渲染树形结构
  - 支持 `▶/▼` 展开收起
  - 文件图标按扩展名区分（.ts/.json/.md 等）
  - `🔵new` 标签显示 git 新增文件
  - 点击文件触发 `onFileSelect(filePath)`
- [ ] `useFileTree.ts` Hook
  - 订阅文件系统变更（WebSocket）
  - `expandNode(path)` / `collapseNode(path)`
  - `selectFile(path)` / `openFileInNewTab(path)`
- [ ] `FilePreview.tsx` 文件预览区
  - 按文件类型渲染（图片/文本/代码高亮）
  - 行号显示
  - 底部操作栏：复制/下载/在VSCode打开
- [ ] `FileContextMenu.tsx` 右键菜单
  - 在新标签页打开
  - 复制路径
  - 在 Finder/Explorer 中显示
  - 重命名
  - 删除
  - **AIIM 特有：** 复制为文件消息 / 发送给 AI 分析
- [ ] `software-engineering-store.ts` 文件状态持久化

### 2.2 后端文件代理

**目标：** 安全地让前端读取项目文件列表

```typescript
// backend/apis/file-system.ts

// GET /api/fs/list?path=src/agents
// 返回目录树

// GET /api/fs/read?path=src/agents/planner.ts
// 返回文件内容

// GET /api/fs/watch
// WebSocket，文件变化实时推送
```

**任务清单：**

- [ ] `FileSystemProxy.ts` 后端文件代理服务
- [ ] 鉴权：只允许读取 project root 下的文件（防止 `../../etc/passwd`）
- [ ] WebSocket 文件监听 + 推送
- [ ] 前端 WebSocket 接收并刷新文件树
- [ ] `useFileTree.ts` 接入 WebSocket

### 2.3 文件拖拽分享

**目标：** 把文件拖进聊天窗口 → 生成文件消息

**任务清单：**

- [ ] `ChatInput.tsx` 实现拖拽区域
- [ ] 拖拽文件 → 生成 `FileMessage`
- [ ] 已发送文件消息点击可预览

---

## 🔢 阶段三：差异对比视图（Diff View）

### 3.1 Diff 组件

**核心依赖：**
- `diff-match-patch` — Google 开源，支持字符级 diff

**任务清单：**

- [ ] `DiffViewer.tsx` 并排对比布局
  - 左右两个文件面板
  - 行号对齐
  - 高亮类型：`🟥删除` / `🟩新增` / `🟡修改` / `🔵移动`
  - 文件选择器（两个版本）
  - 导航按钮：上一处变更 / 下一处变更
- [ ] `DiffLine.tsx` 单行渲染组件
  - 根据 diff 类型应用不同颜色
  - 左侧对照线（修改行）
- [ ] `useDiff.ts` Hook
  - 调用后端 API 计算 diff
  - `computeDiff(oldText, newText)` → `DiffResult[]`
- [ ] 后端 `POST /api/diff/compute` 接口
  - 使用 `diff-match-patch` 计算差异
  - 返回结构化 diff 数组

### 3.2 AI 自动分析 Diff

**目标：** 调用 LLM 分析两版代码差异，输出摘要

**任务清单：**

- [ ] `DiffAIAnalyzer.tsx` AI 分析摘要卡片
- [ ] 后端 `POST /api/diff/analyze` 接口
  - 构造 prompt（附两个版本代码）
  - 调用 LLM，返回变更摘要
  - 流式输出到前端
- [ ] 前端流式渲染 AI 回复

### 3.3 差异消息类型

**目标：** 聊天中的 DiffMessage 可点击展开

**任务清单：**

- [ ] `DiffMessage.tsx` 消息组件
  - 引用消息格式（类似 GitHub PR review）
  - 点击展开 DiffViewer
  - AI 分析摘要嵌内嵌

---

## 🔢 阶段四：调试视图（Debug Panel）

### 4.1 调试控制条

**目标：** 调试工具栏，VSCode 同款按钮

**按钮：**
- ▶ Run / Continue（F5）
- ⏸ Pause（F5 切换）
- ⏹ Stop（⇧F5）
- ⟳ Restart（⇧⌘F5）
- ➡ Step Over（F10）
- ➜ Step Into（F11）
- ⏭ Step Out（⇧F11）

**任务清单：**

- [ ] `DebugBar.tsx` 调试控制条
- [ ] `useDebugger.ts` Hook
  - 连接 CDP（Chrome DevTools Protocol）
  - 管理断点列表
  - 管理调试状态（running / paused / stopped）

### 4.2 源码面板 + 断点

**目标：** 显示源码，左侧行号可点击设置断点

**任务清单：**

- [ ] `SourceViewer.tsx` 源码面板
  - 行号列（可点击设断点）
  - 当前执行行高亮（🔴红色）
  - 断点标记（红点●brk）
  - 当前位置跳转
- [ ] `useBreakpoints.ts` 断点管理
  - `addBreakpoint(file, line)`
  - `removeBreakpoint(file, line)`
  - CDP 同步断点状态

### 4.3 调用堆栈

**目标：** 显示当前调用链，可点击跳转

```tsx
// CallStack.tsx
interface StackFrame {
  name: string;   // "executor.execute()"
  line: number;   // 7
  file: string;   // "src/agents/executor.ts"
}
```

**任务清单：**

- [ ] `CallStack.tsx` 堆栈面板
  - 缩进树形显示调用层级
  - ▶ 标记当前帧
  - 点击跳转源码到对应行
- [ ] `useCallStack.ts` 从 CDP 获取堆栈数据

### 4.4 变量监视

**目标：** 显示当前作用域的变量值

**任务清单：**

- [ ] `VariableWatch.tsx` 变量面板
  - 局部变量 / 闭包变量分组
  - 颜色区分类型：`🔵基本` / `🟡对象` / `🟢字符串` / `🔴异常`
  - 可添加自定义监视表达式
- [ ] `useVariables.ts` 从 CDP scope 获取变量

### 4.5 控制台输出

**目标：** 实时显示 console.log / 调试日志

**任务清单：**

- [ ] `DebugConsole.tsx` 控制台面板
  - 滚动自动跟随最新输出
  - 日志级别：log / warn / error / info
  - 清空按钮
  - 支持筛选日志级别
- [ ] `useConsole.ts` 从 CDP 接收 console 消息
  - WebSocket 实时推送日志到前端

### 4.6 CDP 连接服务

**目标：** 后端代理 Chrome DevTools Protocol

```
前端 ──WebSocket── 后端 CDP Proxy ──CDP── Chrome DevTools
```

**任务清单：**

- [ ] `CDPServer.ts` 后端 CDP 连接管理
  - 启动 Chrome 进程（`--headless --remote-debugging-port=9222`）
  - 或连接到已有 Chrome 实例
  - WebSocket 桥接前端 ↔ CDP
- [ ] `DebuggerWebSocket.ts` 前端 WebSocket 客户端
  - 断点事件监听
  - 执行控制命令（step / continue / pause）
  - 变量/堆栈/控制台 数据接收
- [ ] `useDebugger.ts` 整合所有 CDP 逻辑

---

## 🔢 阶段五：AI 代码助手

### 5.1 AI Chat 组件

**目标：** 嵌入 AI 对话，专门回答代码问题

**任务清单：**

- [ ] `AIAssistant.tsx` AI 面板 Tab 页
  - 对话历史
  - 流式输出消息
  - 代码片段可复制
  - 相关文件引用（点击跳转文件浏览器）
- [ ] `useAIChat.ts` Hook
  - 管理 AI 对话历史
  - 调用后端 `/api/ai/chat` 接口
  - 流式渲染

### 5.2 后端 AI 接口

**目标：** 调用 LLM，提供代码上下文

```typescript
// POST /api/ai/chat
// Body: { messages: [...], context: { filePath,currentLine } }
// 流式响应（SSE）
```

**任务清单：**

- [ ] `AICodeAssistant.ts` 后端服务
  - 提取当前文件内容作为上下文
  - 构造 system prompt（你是代码助手）
  - 调用 LLM 流式返回
- [ ] 支持 Markdown 代码块渲染
- [ ] 支持代码片段高亮复制

### 5.3 代码解释快捷指令

**目标：** 用户选中文本 / 光标在某行，输入 `/explain`

**任务清单：**

- [ ] `SlashCommandMenu.tsx` 识别 `/explain`
- [ ] 自动获取当前文件 + 行号
- [ ] 调用 AI 解释代码
- [ ] 输出解释结果卡片

---

## 🔢 阶段六：消息类型 + 斜杠命令

### 6.1 代码消息组件

**目标：** 聊天中展示带语法高亮的代码

**任务清单：**

- [ ] `CodeBlock.tsx` 代码消息
  - Shiki 语法高亮（按语言着色）
  - 行号
  - 按文件名显示标签
  - 右上角：复制 / 展开 / 在IDE打开
- [ ] `CodeMessage.tsx` 完整消息（包含用户引用、头像等）
- [ ] 在消息流中注册 `code` 消息类型

### 6.2 斜杠命令菜单

**目标：** 输入 `/` 弹出命令菜单，快捷触发功能

**命令清单：**

| 命令 | 功能 |
|------|------|
| `/file` | 打开文件浏览器 |
| `/debug` | 启动调试会话 |
| `/diff` | 打开差异对比 |
| `/grep "keyword"` | 全局搜索 |
| `/ai "question"` | 向 AI 提问 |
| `/test` | 运行测试 |
| `/doc` | 查看文档 |
| `/history` | 查看会话历史 |

**任务清单：**

- [ ] `SlashCommandMenu.tsx` 命令菜单组件
  - 搜索过滤（输入时过滤）
  - 最近使用排序
  - 键盘导航（↑↓ + Enter）
  - 命令补全
- [ ] `useSlashCommands.ts` Hook
  - 解析输入文本中的 `/`
  - 匹配命令列表
  - 触发对应 Action

---

## 🔢 阶段七：实时通信架构

### 7.1 WebSocket 服务

**目标：** 前端到后端全双工通信，支撑调试日志和文件变更推送

**消息类型：**

```typescript
type WSMessage =
  | { type: 'file:change', path: string, action: 'add'|'change'|'unlink' }
  | { type: 'debug:console', level: 'log'|'warn'|'error', args: any[] }
  | { type: 'debug:breakpoint', frame: StackFrame }
  | { type: 'debug:paused', reason: string }
```

**任务清单：**

- [ ] `backend/ws-server.ts` WebSocket 服务器
  - 心跳保活
  - 消息路由（按 type 分发）
  - 鉴权（用户 Token）
- [ ] `frontend/hooks/useWebSocket.ts` WebSocket 客户端
  - 自动重连
  - 消息订阅（type-based）
  - Typed 消息类型

---

## 🔢 阶段八：集成 + 测试

### 8.1 功能集成

**任务清单：**

- [ ] IM 消息流 ↔ IDE 面板联动
  - 发代码消息 → 自动在 IDE 面板高亮
  - `/diff` 命令 → 自动打开 Diff 面板
- [ ] 场景切换数据隔离
  - 金融模式数据 ≠ 软件工程数据
- [ ] 多 Tab 文件打开管理
  - 有 Tab 栏，支持切换和关闭

### 8.2 自动化测试

**任务清单：**

- [ ] `FileTree.test.tsx` 单元测试
  - 渲染正确目录结构
  - 点击展开/收起
  - 右键菜单触发
- [ ] `DiffViewer.test.tsx` 单元测试
  - 高亮颜色断言
  - 文件A/B 对照渲染
- [ ] `useDebugger.test.ts` 逻辑测试
  - 断点添加/移除
  - 状态机切换
- [ ] `e2e/` 端到端测试（Playwright）
  - 从文件树打开文件 → 发消息 → AI 回复

### 8.3 性能测试

**任务清单：**

- [ ] 文件树：1000+ 文件节点不卡（虚拟列表验证）
- [ ] Diff：10万字文件对比 3秒内完成
- [ ] WebSocket：文件变更到 UI 更新 <500ms

---

## 📊 里程碑汇总

| 阶段 | 名称 | 核心交付物 | 预计工时 |
|------|------|-----------|---------|
| 1 | 脚手架 + 架构 | 项目结构、场景切换 | 2d |
| 2 | 文件浏览器 | FileTree、Preview、拖拽 | 3d |
| 3 | Diff 对比 | DiffViewer、AI分析 | 2d |
| 4 | 调试视图 | DebugPanel、CDP集成 | 4d |
| 5 | AI 代码助手 | AI Chat、快捷指令 | 2d |
| 6 | 消息 + 命令 | CodeBlock、SlashMenu | 2d |
| 7 | 实时通信 | WebSocket 架构 | 2d |
| 8 | 集成测试 | 联调、自动化测试 | 3d |
| **总计** | | | **20d ≈ 4周** |

---

## ⚠️ 风险点 + 应对策略

| 风险 | 说明 | 应对 |
|------|------|------|
| CDP 兼容性 | Chrome DevTools Protocol 维护成本高 | 先用 CDP，后续可切换到 Debug Adapter Protocol (DAP) 更通用 |
| 大目录性能 | 超过500文件节点卡顿 | react-virtualized-tree 虚拟列表，预设500节点阈值报警 |
| WebSocket 断连 | 文件变更推送丢失 | 心跳 + 增量同步 + 客户端重连恢复 |
| LLM 上下文长度 | 文件过大超出 token 限制 | 按需读取 + 截断策略，先读前200行 |
| 安全风险 | 文件读取路径遍历 | 所有文件操作限制在 project root，严密校验 `../` |

---

*本计划为可执行的技术实现方案，每个任务块均可独立开发、单独测试。*
