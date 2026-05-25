# AIIM 前端实现计划

> 版本: v1.1 | 日期: 2026-05-26 | 状态: P0 开发中
>
> 本文档为 **AIIM 全端前端** 实现计划，覆盖所有页面（P00-P61）。技术架构：桌面端（Tauri + React）+ 移动端（Android Kotlin / iOS Swift 原生）。

---

## 0. P0 任务清单（聊天核心优先）

> **原则**：先做核心聊天功能，移动端调研同步进行。

### 桌面端（Tauri + React）

**阶段 0-1：项目起跑（4 项）**
- [ ] Tauri 项目初始化 + React + TypeScript
- [ ] Tailwind CSS 配置 + path aliases（`@/` → `src/`）
- [ ] Zustand store 架构（`auth-store.ts` / `chat-store.ts`）
- [ ] 路由系统配置 + 页面脚手架

**阶段 0-2：认证模块（4 项）**
- [ ] P01 登录页（居中卡片：Logo + 表单 + 第三方登录入口）
- [ ] P02 注册页（居中卡片 + 协议勾选）
- [ ] JWT 存储 + 自动跳转逻辑（登录后 → P10）
- [ ] 认证 API 对接（登录 / 注册 / Token 刷新）

**阶段 0-3：聊天核心（8 项）**
- [ ] P10 主聊列表页（侧边栏 + 多面板布局）
- [ ] P20 私聊页（三栏布局：会话列表 + 消息流 + 面板）
- [ ] P21 群聊页（含群信息侧边栏）
- [ ] WebSocket 实时消息（连接 / 接收 / 发送）
- [ ] 消息列表 + 消息气泡组件（文本 / 图片 / 文件 / 代码块）
- [ ] 消息输入区（多附件支持）
- [ ] 消息分页加载（上拉加载历史）
- [ ] 已读 / 未读状态同步

**阶段 0-4：路由守卫 + 设置（2 项）**
- [ ] 路由守卫（未登录 → P01）
- [ ] P50 个人设置页（退出登录）

**阶段 0-5：共享组件（精简，聊天必需）（6 项）**
- [ ] C05 Avatar 头像组件
- [ ] C07 Button（Primary / Secondary / Danger 变体）
- [ ] C08 Input（含 Textarea 变体）
- [ ] C13 MessageBubble 消息气泡
- [ ] C03 Toast 轻提示
- [ ] C12 Loading 加载指示器

### 移动端（同步调研，不写代码）

- [ ] Android (Kotlin) 技术调研 + 项目初始化
- [ ] iOS (Swift) 技术调研 + 项目初始化

### P0 汇总

```
桌面端（Tauri）          24 项
移动端调研               2 项
────────────────────────────
P0 合计                 26 项
```

**P0 完成后**：一个可登录、可聊天的基础 IM 桌面 App。

---

## 1. 架构概览

### 1.1 三平台架构

```
┌──────────────────────────────────────────┐
│              AIIM 前端                    │
├─────────────┬────────────┬───────────────┤
│  桌面端      │  Android   │     iOS       │
│  Tauri      │  Kotlin    │     Swift     │
│  React      │  原生       │     原生       │
├─────────────┴────────────┴───────────────┤
│         共享业务逻辑层（前端 shared/）      │
│  (消息处理 / WebSocket / AI 交互)          │
└──────────────────────────────────────────┘
```

### 1.2 页面矩阵

| 页面 ID | 页面名称 | 桌面端 | Android | iOS |
|---------|---------|--------|---------|-----|
| P00 | 启动页 | ✅ 全屏 | 待开发 | 待开发 |
| P01 | 登录页 | ✅ 居中卡片 | 待开发 | 待开发 |
| P02 | 注册页 | ✅ 居中卡片 | 待开发 | 待开发 |
| P03 | 忘记密码页 | ✅ 居中卡片 | 待开发 | 待开发 |
| P10 | 主聊列表页 | ✅ 侧边栏+多面板 | 待开发 | 待开发 |
| P20 | 私聊页 | ✅ 三栏布局 | 待开发 | 待开发 |
| P21 | 群聊页 | ✅ 三栏布局 | 待开发 | 待开发 |
| P22 | 联系人列表页 | ✅ 侧边栏Tab | 待开发 | 待开发 |
| P30 | 文件浏览器页 | ✅ 多功能面板 | 待开发 | 待开发 |
| P31 | 调试控制台页 | ✅ 多功能面板 | 待开发 | 待开发 |
| P32 | 差异对比页 | ✅ 多功能面板 | 待开发 | 待开发 |
| P33 | AI助手页 | ✅ 多功能面板 | 待开发 | 待开发 |
| P40 | 仪表盘页 | ✅ 金融切面默认 | 待开发 | 待开发 |
| P41 | 持仓详情页 | ✅ 长条页面 | 待开发 | 待开发 |
| P50 | 个人设置页 | ✅ 左侧列表 | 待开发 | 待开发 |
| P51 | 切行业切换页 | ✅ 居中列表 | 待开发 | 待开发 |
| P60 | 全局搜索页 | ✅ 弹窗/侧边 | 待开发 | 待开发 |
| P61 | 搜索结果页 | ✅ 结果页面 | 待开发 | 待开发 |

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
  "android": {
    "framework": "Kotlin + Android SDK",
    "language": "Kotlin 1.9",
    "ui": "Jetpack Compose",
    "state": "Kotlin Flow + DataStore",
    "websocket": "OkHttp"
  },
  "ios": {
    "framework": "Swift + UIKit/SwiftUI",
    "language": "Swift 5.9",
    "ui": "SwiftUI（主）+ UIKit（部分）",
    "state": "Combine + UserDefaults",
    "websocket": "URLSession WebSocket"
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

## 2. 桌面端项目结构（六边形架构）

### 2.1 六边形架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                             │
│  （React 组件：pages / components / hooks）                   │
└────────────────────────────┬────────────────────────────────┘
                             │ 调用
┌────────────────────────────▼────────────────────────────────┐
│                   Adapters Layer（驱动适配器）                 │
│  driving/tauri/  ← Tauri Commands（处理 UI 请求）            │
└────────────────────────────┬────────────────────────────────┘
                             │ 调用
┌────────────────────────────▼────────────────────────────────┐
│                   Application Layer                          │
│  （Use Cases：用例编排，调用 Domain）                         │
│  ports/driving/  ← 输入端口接口（UI 调用的服务接口）          │
│  ports/driven/   ← 输出端口接口（Repository/Gateway 定义）   │
│  use-cases/      ← 具体用例实现                             │
└────────────────────────────┬────────────────────────────────┘
                             │ 调用
┌────────────────────────────▼────────────────────────────────┐
│                     Domain Layer ★                           │
│  （纯业务逻辑，无任何外部依赖）                                │
│  entities/       ← 核心实体（User / Message / ChatRoom）      │
│  value-objects/  ← 值对象（MessageId / Token）               │
│  services/       ← 领域服务（纯函数）                        │
│  events/         ← 领域事件（MessageSent / UserLoggedIn）    │
└────────────────────────────┬────────────────────────────────┘
                             │ 实现
┌────────────────────────────▼────────────────────────────────┐
│                   Adapters Layer（从驱动适配器）                │
│  driven/api/      ← REST API 适配器（Axios）                 │
│  driven/websocket/← WebSocket 适配器                        │
│  driven/storage/  ← localStorage 适配器                      │
│  driven/repository/← Repository 实现（内存/IndexedDB）       │
└─────────────────────────────────────────────────────────────┘
```

**依赖方向：严格单向**

```
UI → adapters(driving) → application(use-cases) → domain
                                              ↓
                                    adapters(driven) → 外部世界（API/WS/DB）
```

### 2.2 目录结构

```
frontend/desktop/
├── src/
│   ├── domain/                        ★ Domain Core（无任何外部依赖）
│   │   ├── entities/                  # User, Message, ChatRoom, Contact, Group
│   │   │   ├── User.ts
│   │   │   ├── Message.ts
│   │   │   ├── ChatRoom.ts
│   │   │   └── index.ts
│   │   ├── value-objects/             # MessageId, UserId, Token, MessageContent
│   │   │   └── index.ts
│   │   ├── services/                  # Domain 业务逻辑（纯函数，无副作用）
│   │   │   └── index.ts
│   │   └── events/                    # Domain Event 定义
│   │       └── index.ts
│   │
│   ├── application/                   ★ Application Layer（用例编排）
│   │   ├── ports/                     # Port 接口定义（双向）
│   │   │   ├── driving/               # 输入端口（UI 调用的服务接口）
│   │   │   │   ├── AuthService.ts
│   │   │   │   ├── ChatService.ts
│   │   │   │   └── index.ts
│   │   │   └── driven/               # 输出端口（基础设施接口）
│   │   │       ├── AuthGateway.ts
│   │   │       ├── MessageRepository.ts
│   │   │       ├── UserRepository.ts
│   │   │       ├── WebSocketPort.ts
│   │   │       └── index.ts
│   │   │
│   │   └── use-cases/                 # 具体 Use Case 实现
│   │       ├── auth/
│   │       │   ├── LoginUseCase.ts
│   │       │   ├── RegisterUseCase.ts
│   │       │   ├── RefreshTokenUseCase.ts
│   │       │   └── index.ts
│   │       ├── chat/
│   │       │   ├── SendMessageUseCase.ts
│   │       │   ├── LoadMessagesUseCase.ts
│   │       │   ├── CreateChatRoomUseCase.ts
│   │       │   ├── MarkMessageReadUseCase.ts
│   │       │   └── index.ts
│   │       └── contact/
│   │           ├── AddContactUseCase.ts
│   │           ├── CreateGroupUseCase.ts
│   │           └── index.ts
│   │
│   ├── adapters/                       ★ Adapters Layer
│   │   ├── driving/                    # 主驱动适配器（连接 UI）
│   │   │   └── tauri/
│   │   │       └── TauriCommandAdapter.ts
│   │   │
│   │   └── driven/                     # 从驱动适配器（连接外部）
│   │       ├── api/
│   │       │   └── RestAuthGateway.ts
│   │       ├── websocket/
│   │       │   └── WsMessageAdapter.ts
│   │       ├── storage/
│   │       │   └── LocalStorageAdapter.ts
│   │       └── repository/
│   │           ├── InMemoryUserRepository.ts
│   │           └── InMemoryMessageRepository.ts
│   │
│   ├── infrastructure/                  ★ Infrastructure（框架/工具配置）
│   │   ├── tauri/                      # Tauri 相关配置
│   │   ├── router/                    # React Router 配置
│   │   └── ioc/                       # 依赖注入容器（实现 Port → Adapter 绑定）
│   │       └── container.ts
│   │
│   └── ui/                             ★ UI Layer（React 组件）
│       ├── app/
│       │   └── App.tsx
│       ├── pages/                      # 页面组件（P01-P61）
│       │   ├── P01-登录页/
│       │   ├── P10-主聊列表页/
│       │   └── ...
│       ├── components/                 # 共享 UI 组件（C 系列）
│       │   ├── C05-Avatar/
│       │   ├── C07-Button/
│       │   └── ...
│       └── hooks/                      # UI Hooks（调用 Use Cases）
│           ├── useAuth.ts
│           └── useChat.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── src-tauri/
    ├── Cargo.toml
    └── tauri.conf.json
```

### 2.3 依赖注入容器（IoC）

> 六边形架构核心：Domain 不依赖外部，外部依赖通过 Port 接口注入。

```
// infrastructure/ioc/container.ts
// 绑定 Port 接口 → 具体 Adapter 实现

// 认证
container.bind(AuthGateway, RestAuthGateway)

// 消息
container.bind(MessageRepository, InMemoryMessageRepository)

// WebSocket
container.bind(WebSocketPort, WsMessageAdapter)

// Use Cases 注入依赖
container.bind(LoginUseCase, (container) => new LoginUseCase(
  container.get(AuthGateway),
  container.get(UserRepository),
))
```

### 2.4 全局 UI 状态（Zustand，轻量）

> 仅用于 UI 状态（侧边栏折叠、弹窗开关等），不承载业务逻辑。

```
infrastructure/stores/
├── ui-store.ts          # 侧边栏折叠、面板 Tab、主题
├── app-mode-store.ts   # 当前行业切面（金融/软件工程/通用）
└── search-store.ts     # 搜索历史
```

### 2.5 路由设计

```
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

---

## 3. 移动端项目结构

### 3.1 Android (Kotlin)

```
frontend/android/
├── app/
│   └── src/main/
│       ├── java/com/aiim/app/
│       │   ├── ui/
│       │   │   ├── auth/        # 登录、注册
│       │   │   ├── chat/        # 私聊、群聊
│       │   │   ├── contacts/    # 联系人
│       │   │   └── ...
│       │   ├── data/           # Repository、API
│       │   ├── domain/         # UseCase、业务逻辑
│       │   └── di/             # Hilt 依赖注入
│       └── res/
├── build.gradle.kts
└── settings.gradle.kts
```

### 3.2 iOS (Swift)

```
frontend/ios/
├── AIIM/
│   ├── App/
│   │   └── AIIMApp.swift
│   ├── Features/
│   │   ├── Auth/              # 登录、注册
│   │   ├── Chat/              # 私聊、群聊
│   │   ├── Contacts/          # 联系人
│   │   └── ...
│   ├── Core/
│   │   ├── Network/           # WebSocket、API
│   │   ├── Storage/           # UserDefaults
│   │   └── Design/            # 设计系统
│   └── Resources/
├── project.yml
└── Podfile
```

### 3.3 移动端技术选型说明

| 平台 | UI 框架 | 状态管理 | 架构 | WebSocket |
|------|---------|---------|------|-----------|
| Android | Jetpack Compose | Kotlin Flow + DataStore | MVVM + Clean | OkHttp |
| iOS | SwiftUI（主）+ UIKit | Combine + UserDefaults | MVVM | URLSession |

---

## 4. 共享组件库（C 系列）

> 桌面端 React Web 实现，移动端各自原生实现。

| 组件 ID | 组件名称 | 说明 | 状态 |
|---------|---------|------|------|
| C00 | TopBar | 顶部导航栏 | 待实现 |
| C01 | TabBar | Tab 切换 | 待实现 |
| C02 | SearchBar | 搜索框 | 待实现 |
| C03 | Toast | 轻提示 | P0 待实现 |
| C04 | Dialog | 对话框/确认框 | 待实现 |
| C05 | Avatar | 头像组件 | P0 待实现 |
| C06 | Badge | 徽章/计数 | 待实现 |
| C07 | Button | 按钮 | P0 待实现 |
| C08 | Input | 输入框 | P0 待实现 |
| C09 | Switch | 开关 | 待实现 |
| C10 | Slider | 滑动条 | 待实现 |
| C11 | EmptyState | 空状态占位 | 待实现 |
| C12 | Loading | 加载指示器 | P0 待实现 |
| C13 | MessageBubble | 消息气泡 | P0 待实现 |
| C14 | CodeBlock | 代码块 | 待实现 |
| C15 | FileCard | 文件卡片 | 待实现 |
| C16 | Tree | 树形控件 | 待实现 |

---

## 5. 阶段一：认证模块（P01-P03）

**目标：** 实现登录、注册、忘记密码三个页面，连接后端认证 API。

**技术要点：**
- 表单验证（手机号、邮箱、密码强度）
- JWT Token 存储（localStorage）
- 登录状态全局同步
- 第三方登录占位（微信/Google，后续接入）

**任务清单：**

桌面端：
- [x] ~~P01 登录页~~ → P0 中
- [x] ~~P02 注册页~~ → P0 中
- [ ] P03 忘记密码页（桌面端）
- [ ] 表单验证 Hook（`useFormValidation`）
- [x] ~~认证 API 对接~~ → P0 中
- [x] ~~JWT 存储和自动刷新逻辑~~ → P0 中
- [x] ~~登录后跳转到主聊列表（P10）~~ → P0 中

---

## 6. 阶段二：主聊列表 + 消息基础设施（P10 / P20 / P21 / P22）

**目标：** 实现 IM 核心功能：会话列表、私聊、群聊、联系人。

**技术要点：**
- WebSocket 实时消息推送
- 消息分页加载（滚动到底部加载历史）
- 消息类型：文本/图片/文件/代码块
- 已读/未读状态
- 群成员列表

**任务清单：**

- [x] ~~P10 主聊列表页~~ → P0 中
- [x] ~~P20 私聊页~~ → P0 中
- [x] ~~P21 群聊页~~ → P0 中
- [ ] P22 联系人列表页
- [x] ~~WebSocket 实时消息~~ → P0 中
- [x] ~~消息列表 + 消息气泡~~ → P0 中
- [x] ~~消息输入区~~ → P0 中
- [x] ~~消息分页加载~~ → P0 中
- [x] ~~已读/未读状态~~ → P0 中

---

## 7. 阶段三：金融研究切面（P40 / P41）

**目标：** 实现金融研究行业切面的专属页面：仪表盘和持仓详情。

**技术要点：**
- K 线图（`tradingview-lightweightcharts` 或 `echarts-for-react`）
- 实时行情数据（WebSocket 推送）
- 持仓卡片交互

**任务清单：**

- [ ] P40 仪表盘页（K线图 + 持仓卡片 + 统计面板）
- [ ] P41 持仓详情页
- [ ] K线图表组件（分时/日K/周K/月K 多周期）
- [ ] 持仓卡片组件（成本/市值/盈亏）
- [ ] 实时行情 WebSocket 对接
- [ ] 估值指标卡（PE/PB/市值等）
- [ ] 分红融资卡
- [ ] 相关新闻区（情感标签）
- [ ] 交易/提醒按钮（跳转外部券商）

---

## 8. 阶段四：软件工程切面 — IDE 功能（P30 / P31 / P32 / P33）

**目标：** 实现软件工程行业切面的多功能面板：文件浏览器、调试控制台、差异对比、AI助手。

**技术要点：**
- 文件树（`react-virtualized-tree`）支持虚拟化大列表
- 代码编辑器（Monaco Editor 或 CodeMirror）
- 调试面板（断点、变量、堆栈 — 接入 Chrome DevTools Protocol）
- 差异对比（`diff-match-patch`）
- AI 助手（流式响应，SSE）

**任务清单：**

**P30 文件浏览器：**
- [ ] 文件树组件（支持右键菜单、拖拽）
- [ ] 文件预览（图片/文本/代码语法高亮）
- [ ] 文件操作（新建/删除/重命名/移动）
- [ ] 工作目录切换

**P31 调试控制台：**
- [ ] 断点管理（增删改查）
- [ ] 变量监视面板
- [ ] 调用堆栈面板
- [ ] 控制台输出（log/warn/error）
- [ ] Chrome DevTools Protocol 接入

**P32 差异对比：**
- [ ] 两文件/两版本对比
- [ ] 语法高亮 + 行内差异标记
- [ ] 合并/采纳按钮
- [ ] 历史版本记录

**P33 AI助手：**
- [ ] 流式响应（Markdown 渲染）
- [ ] 代码块高亮（shiki）
- [ ] 对话历史上下文
- [ ] 快捷命令（解释代码/优化建议/生成测试）

---

## 9. 阶段五：搜索与全局功能（P60 / P61）

**目标：** 全局搜索能力，跨聊天记录、文件、联系人搜索。

**技术要点：**
- 搜索索引（前端可用 Fuse.js 做轻量搜索）
- 搜索结果分类展示
- 搜索历史记录

**任务清单：**

- [ ] P60 全局搜索页（桌面端弹窗/侧边）
- [ ] P61 搜索结果页
- [ ] Fuse.js 搜索配置
- [ ] 搜索历史记录
- [ ] 分类过滤（聊天/文件/联系人）

---

## 10. 阶段六：设置与个人中心（P50 / P51）

**目标：** 用户设置和行业切面切换。

**技术要点：**
- 行业切面切换（金融 / 软件工程 / 通用）
- 主题切换（后续支持）
- 通知设置
- 退出登录

**任务清单：**

- [x] ~~P50 个人设置页~~ → P0 中（退出登录）
- [ ] P51 切行业切换页
- [ ] App Mode Store 切换逻辑
- [ ] 通知设置面板

---

## 11. 阶段七：多语言与主题（规划中）

- [ ] i18n 国际化框架（react-i18next）
- [ ] 主题系统（Light / Dark，后续支持）
- [ ] 字体大小调整