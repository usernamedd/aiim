# AIIM 界面设计文档
> 版本: v1.0 | 适用端: 全平台（Android / iOS / Windows / macOS / Linux） | 创建日期: 2026-05-25

> **前置说明：** 本文档描述 AIIM 所有端的**统一页面结构和组件层级**，不涉及具体技术实现。各平台的屏幕适配（响应式布局）见 `aiim-software-engineering-v2.md` 第 2 章。

---

## 1. 页面清单总览

### 1.1 页面分类

| 类别 | 页面名称 | 页面ID | 说明 |
|------|---------|--------|------|
| **启动流程** | 启动页 | P00 | Logo 动画，品牌展示 |
| **认证流程** | 登录页 | P01 | 手机号/邮箱 + 密码登录 |
| | 注册页 | P02 | 账号注册流程 |
| | 忘记密码页 | P03 | 找回密码 |
| **主框架** | 主聊列表页 | P10 | 会话列表 + 侧边栏/底部导航 |
| **聊天模块** | 私聊页 | P20 | 一对一聊天 |
| | 群聊页 | P21 | 群组聊天 |
| | 联系人列表页 | P22 | 好友/群组列表 |
| **软件工程切面** | 文件浏览器页 | P30 | 项目文件树 |
| | 调试控制台页 | P31 | 断点/变量/堆栈 |
| | 差异对比页 | P32 | 代码 Diff |
| | AI 助手页 | P33 | AI 对话 |
| **金融研究切面** | 仪表盘页 | P40 | 投资概览 |
| | 持仓详情页 | P41 | 个股/基金详情 |
| **个人中心** | 个人设置页 | P50 | 账号/主题/通知设置 |
| | 切行业切换页 | P51 | 切换行业切面 |
| **通用** | 全局搜索页 | P60 | 搜索消息/文件/联系人 |
| | 搜索结果页 | P61 | 搜索结果展示 |

---

## 2. 组件层级规范

### 2.1 组件命名约定

```
Page (页面)
└── LayoutComponent (布局组件)
    └── FeatureComponent (功能组件)
        └── UIComponent (UI 原子组件)
```

- **Page：** 路由级别的页面，对应一个 URL path
- **LayoutComponent：** 负责布局的组件（如侧边栏、底部导航）
- **FeatureComponent：** 负责业务功能的组件（如消息列表、文件树）
- **UIComponent：** 最底层的原子组件（如按钮、输入框、头像）

### 2.2 全局通用组件（所有页面共享）

| 组件ID | 组件名称 | 说明 |
|--------|---------|------|
| C00 | TopBar | 顶部栏（Logo + 导航 + 搜索 + 通知 + 个人） |
| C01 | BottomNav | 底部导航（手机端专用） |
| C02 | Sidebar | 侧边栏（桌面端/平板端专用） |
| C03 | MultiPanel | 多功能面板（软件工程/金融切面） |
| C04 | InputBar | 消息输入栏 |
| C05 | Avatar | 用户头像 |
| C06 | Badge | 徽章（未读数等） |
| C07 | Button | 按钮 |
| C08 | Icon | 图标 |
| C09 | Modal | 模态框 |
| C10 | Toast | 轻提示 |
| C11 | EmptyState | 空状态占位 |
| C12 | LoadingSpinner | 加载中 |
| C13 | Divider | 分割线 |

---

## 3. 各页面组件结构

---

### P00: 启动页

**页面路径：** `/` 或 App 冷启动

**目的：** 展示品牌 Logo，等待初始化完成

**页面层级：**

```
LaunchPage
├── LaunchBackground（背景色/渐变）
│   └── BrandLogo（Logo 图标 + 品牌名）
└── LoadingIndicator（C12 LoadingSpinner）
```

**说明：**
- 桌面端：居中展示
- 移动端：居中展示，全屏沉浸

---

### P01: 登录页

**页面路径：** `/login`

**目的：** 用户输入凭证登录

**页面层级：**

```
LoginPage
├── TopBar（C00，简化版：只显示返回按钮）
├── LogoArea
│   ├── BrandLogo（品牌 Logo）
│   └── BrandName（品牌名称）
├── LoginForm
│   ├── InputField（Phone/Email 输入框）
│   ├── InputField（Password 输入框）
│   │   └── ShowPasswordToggle（显示/隐藏密码切换）
│   ├── LinkButton（"忘记密码？"）
│   ├── PrimaryButton（"登录"）
│   └── Text（"还没有账号？去注册" + LinkButton）
├── Divider（C13 Divider）
└── SocialLoginArea（可选：微信/Google/Apple 登录）
```

**布局：** 单列居中，表单最大宽度 360px

---

### P02: 注册页

**页面路径：** `/register`

**目的：** 新用户注册账号

**页面层级：**

```
RegisterPage
├── TopBar（C00）
├── StepsIndicator（进度步骤指示器：1.账号 → 2.验证码 → 3.设置密码）
├── StepContent（动态切换）
│   ├── Step1: AccountInput
│   │   ├── InputField（Phone/Email）
│   │   └── PrimaryButton（"获取验证码"）
│   ├── Step2: VerifyCode
│   │   ├── Text（"验证码已发送至 xxx"）
│   │   ├── VerifyCodeInput（6 位验证码输入框）
│   │   └── ResendButton（"重新获取" + 倒计时）
│   └── Step3: SetPassword
│       ├── InputField（Password）
│       ├── InputField（Confirm Password）
│       └── PrimaryButton（"完成注册"）
└── Text（"已同意《用户协议》《隐私政策》"）
```

**布局：** 同登录页

---

### P03: 忘记密码页

**页面路径：** `/forgot-password`

**目的：** 找回密码流程（与注册页流程类似）

**页面层级：**

```
ForgotPasswordPage
├── TopBar（C00）
├── LogoArea
│   └── BrandLogo
├── StepContent
│   ├── Step1: AccountInput（输入手机号/邮箱）
│   ├── Step2: VerifyCode（输入验证码）
│   └── Step3: ResetPassword（设置新密码）
└── LinkButton（"想起密码了？去登录"）
```

---

### P10: 主聊列表页（主框架）

**页面路径：** `/`（默认首页）

**目的：** 展示会话列表，是所有平台的入口主页

**页面层级：**

```
MainFrame（主框架）
├── TopBar（C00，全功能版）
│   ├── LogoArea
│   ├── DomainSwitcher（行业切面切换：金融/软件工程/···）
│   ├── GlobalSearchButton（搜索按钮）
│   ├── NotificationBell（通知铃铛 + Badge）
│   └── ProfileAvatar（个人头像 → 跳转 P50）
├── ContentArea
│   ├── Sidebar（C02，桌面/平板端显示）
│   │   ├── SearchInput（搜索会话）
│   │   ├── ConversationList
│   │   │   └── ConversationItem × N
│   │   │       ├── Avatar（C05）
│   │   │       ├── Content
│   │   │       │   ├── Nickname（昵称）
│   │   │       │   ├── LastMessage（最后一条消息）
│   │   │       │   └── Timestamp（时间）
│   │   │       └── UnreadBadge（C06）
│   │   ├── GroupsSection
│   │   │   └── GroupItem × N
│   │   └── SettingsButton（设置入口）
│   └── ChatListArea
│       ├── ConversationList（手机端：全屏列表）
│       │   └── ConversationItem × N
│       └── EmptyState（C11，"暂无会话，开始聊天吧"）
└── BottomNav（C01，手机端显示）
    ├── Tab × 5（聊天/文件/调试/AI/我的）
    └── ActiveIndicator（当前激活 Tab 指示器）
```

**组件说明：**

| 组件 | 类型 | 说明 |
|------|------|------|
| ConversationItem | FeatureComponent | 单个会话条目 |
| DomainSwitcher | FeatureComponent | 行业切面切换器（Tab 或 Dropdown） |

---

### P20: 私聊页

**页面路径：** `/chat/:userId`

**目的：** 与单个用户的一对一聊天

**页面层级：**

```
ChatPage
├── TopBar（C00）
│   ├── BackButton（返回按钮）
│   ├── Avatar（C05，对话对象头像）
│   ├── Nickname（对话对象昵称）
│   ├── StatusIndicator（在线/离线状态）
│   └── MoreButton（⋮ 更多操作菜单）
├── MessageList（消息列表，核心区域）
│   ├── MessageBubble × N（每条消息的气泡）
│   │   ├── Avatar（C05，发送者头像，左侧显示）
│   │   ├── Content
│   │   │   ├── TextBubble（文本消息）
│   │   │   ├── CodeBubble（代码消息，含语法高亮）
│   │   │   ├── ImageBubble（图片消息）
│   │   │   ├── FileBubble（文件消息卡片）
│   │   │   └── AIBubble（AI 分析卡片）
│   │   └── Timestamp（时间戳，分组显示）
│   ├── DateDivider（日期分割线，如"今天"、"昨天"）
│   ├── TypingIndicator（对方正在输入···）
│   └── ScrollToBottomButton（滚动到底部按钮）
├── MultiPanel（C03，可选展开）
│   ├── TabBar
│   │   ├── FileExplorerTab
│   │   ├── DebugTab
│   │   ├── DiffTab
│   │   └── AITab
│   └── PanelContent
│       ├── FileExplorerPanel（P30 内容）
│       ├── DebugPanel（P31 内容）
│       ├── DiffPanel（P32 内容）
│       └── AIPanel（P33 内容）
└── InputBar（C04）
    ├── AttachButton（📎 附件）
    ├── FileButton（📁 文件）
    ├── ScreenshotButton（📸 截图）
    ├── InputArea（输入框，auto-grow）
    ├── SendButton（▶ 发送）
    └── AIAssistButton（🤖 AI 辅助，触发 AI 助手）
```

**组件说明：**

| 组件 | 类型 | 说明 |
|------|------|------|
| MessageBubble | FeatureComponent | 单条消息气泡 |
| MessageList | FeatureComponent | 消息列表容器 |
| InputBar | FeatureComponent | 底部输入栏 |
| DateDivider | UIComponent | 日期分割线 |
| TypingIndicator | UIComponent | 正在输入提示 |
| ScrollToBottomButton | UIComponent | 悬浮滚动到底部按钮 |

---

### P21: 群聊页

**页面路径：** `/group/:groupId`

**目的：** 群组多人聊天（继承 P20 私聊页大部分结构）

**与 P20 差异点：**

```
ChatPage（群聊版）
├── TopBar（C00）
│   ├── ···
│   └── GroupInfoButton（群信息按钮 → 跳转群信息面板）
├── MessageList
│   ├── MessageBubble
│   │   ├── SenderName（发送者昵称，显示在头像下方）
│   │   └── Content（同 P20）
│   └── GroupNoticeBubble（群公告气泡，管理员发布）
├── MultiPanel
│   ├── MemberListTab（群成员列表）
│   └── OtherTabs（同 P20）
└── InputBar
    └── AtButton（@ 提及成员按钮）
```

**新增组件：**

| 组件 | 类型 | 说明 |
|------|------|------|
| GroupNoticeBubble | FeatureComponent | 群公告气泡 |
| MemberListPanel | FeatureComponent | 群成员列表面板 |
| AtMemberPicker | FeatureComponent | @成员选择器 |

---

### P22: 联系人列表页

**页面路径：** `/contacts`

**目的：** 管理好友列表和群组列表

**页面层级：**

```
ContactsPage
├── TopBar（C00）
│   ├── Title（"联系人"）
│   ├── SearchButton
│   └── AddButton（添加好友/创建群组）
├── TabBar
│   ├── FriendsTab（好友）
│   └── GroupsTab（群组）
├── TabContent
│   ├── FriendsList
│   │   ├── Section（好友分组：A-G / H-N / O-Z）
│   │   └── FriendItem × N
│   │       ├── Avatar（C05）
│   │       ├── Nickname
│   │       ├── Signature（个性签名）
│   │       └── StatusIndicator
│   └── GroupsList
│       └── GroupItem × N
│           ├── Avatar（C05）
│           ├── GroupName
│           ├── MemberCount（成员数）
│           └── Description
└── FAB（Floating Action Button悬浮添加按钮）
```

**组件说明：**

| 组件 | 类型 | 说明 |
|------|------|------|
| FriendItem | FeatureComponent | 好友列表项 |
| GroupItem | FeatureComponent | 群组列表项 |
| SectionIndexer | UIComponent | 字母索引导航（右侧 A-Z） |
| FAB | UIComponent | 悬浮操作按钮 |

---

### P30: 文件浏览器页

**页面路径：** `/files`（或作为 MultiPanel 内 Tab）

**目的：** 浏览项目目录结构，预览文件内容

**页面层级：**

```
FileExplorerPage
├── TopBar（C00）
│   ├── Title（"文件浏览器"）
│   ├── RefreshButton
│   └── MoreButton（排序方式/显示选项）
├── Breadcrumb（路径导航）
│   └── PathSegment × N（可点击跳转目录）
├── FileTree（文件树，核心组件）
│   ├── TreeNode × N
│   │   ├── ExpandIcon（▶/▼ 展开图标）
│   │   ├── FileIcon（📁/📄 文件图标）
│   │   ├── FileName
│   │   ├── FileMeta（文件大小/行数）
│   │   └── GitStatusBadge（🔵new/🟡modified/🔴deleted）
├── FilePreview（文件预览区）
│   ├── PreviewHeader
│   │   ├── FileName
│   │   ├── FileTab（多文件 Tab 页）
│   │   └── CloseButton
│   ├── CodeViewer（代码预览）
│   │   ├── LineNumbers（行号列）
│   │   ├── CodeContent（语法高亮代码）
│   │   └── Scrollbar
│   └── ImageViewer（图片预览，支持缩放）
└── EmptyState（C11，"选择一个文件预览"）
```

**组件说明：**

| 组件 | 类型 | 说明 |
|------|------|------|
| FileTree | FeatureComponent | 文件树组件 |
| TreeNode | FeatureComponent | 文件树节点（递归） |
| FilePreview | FeatureComponent | 文件预览区 |
| Breadcrumb | UIComponent | 路径导航 |
| GitStatusBadge | UIComponent | Git 状态标签 |

---

### P31: 调试控制台页

**页面路径：** `/debug`（或作为 MultiPanel 内 Tab）

**目的：** 嵌入式调试，查看断点/变量/调用栈/控制台输出

**页面层级：**

```
DebugConsolePage
├── DebugToolbar（调试工具栏）
│   ├── RunButton（▶）
│   ├── PauseButton（⏸）
│   ├── StopButton（⏹）
│   ├── RestartButton（⟳）
│   ├── StepOverButton（➡）
│   ├── StepIntoButton（➜）
│   └── StepOutButton（⏭）
├── SourceViewer（源码查看器）
│   ├── LineNumbers
│   ├── SourceCode（可点击设置断点）
│   │   └── BreakpointMarker（断点标记 ●）
│   └── CurrentLineHighlight（当前执行行高亮）
├── DebugPanels（调试信息面板，横向三栏）
│   ├── CallStackPanel
│   │   ├── StackFrame × N（调用栈帧）
│   │   │   ├── FrameIndicator（▶ 当前帧）
│   │   │   ├── FrameLocation（文件名:行号）
│   │   │   └── FrameFunction（函数名）
│   │   └── EmptyState（"无调用栈"）
│   ├── VariablesPanel
│   │   ├── ScopeSection × N（局部变量/闭包变量）
│   │   │   ├── ScopeLabel
│   │   │   └── VariableItem × N
│   │   │       ├── VarName
│   │   │       └── VarValue（可展开查看对象）
│   │   └── WatchExpressions
│   │       ├── WatchItem × N
│   │       └── AddWatchButton
│   └── ConsolePanel
│       ├── LogEntry × N（控制台日志）
│       │   ├── LogLevel（>/WARN/ERROR 图标）
│       │   ├── LogMessage
│       │   └── Timestamp
│       └── ClearButton
└── EmptyState（C11，"启动调试会话"）
```

---

### P32: 差异对比页

**页面路径：** `/diff`（或作为 MultiPanel 内 Tab）

**目的：** 并排显示两个文件版本的差异

**页面层级：**

```
DiffViewerPage
├── TopBar（C00）
│   ├── Title（"差异对比"）
│   ├── LeftFileSelector（下拉选择旧版本）
│   ├── SwapButton（⇄ 交换 A/B）
│   └── RightFileSelector（下拉选择新版本）
├── DiffToolbar
│   ├── PrevChangeButton（上一处变更）
│   ├── NextChangeButton（下一处变更）
│   ├── UnifiedToggle（合并视图/分栏视图切换）
│   └── StatsSummary（+3 行 / -1 行 / 4 处变更）
├── DiffContent（Diff 核心内容）
│   ├── DiffLine × N
│   │   ├── LineNumber（行号）
│   │   ├── DiffIndicator（+, -, ' '）
│   │   ├── DiffBackground（🟢绿/🟥红/🟡黄背景色）
│   │   └── LineContent（行内容）
│   └── EmptyState（"选择两个版本对比"）
├── DiffLegend（图例说明）
│   ├── AddedIndicator（🟢 新增）
│   ├── DeletedIndicator（🟥 删除）
│   ├── ModifiedIndicator（🟡 修改）
│   └── UnchangedIndicator（无色 未变）
└── AIAbstractPanel（AI 分析摘要，可折叠）
    ├── SummaryTitle（"🤖 AI 分析摘要"）
    └── SummaryContent（变更摘要 + 风险评估）
```

---

### P33: AI 助手页

**页面路径：** `/ai`（或作为 MultiPanel 内 Tab）

**目的：** 与 AI 对话，专门解答代码相关问题

**页面层级：**

```
AIAssistantPage
├── TopBar（C00）
│   ├── Title（"AI 代码助手"）
│   ├── ContextIndicator（"上下文：src/agents/planner.ts"）
│   └── ClearContextButton（清除上下文）
├── ChatMessageList（对话消息列表）
│   ├── UserMessage × N
│   │   ├── Avatar（C05，用户头像）
│   │   ├── MessageContent
│   │   │   └── TextBubble
│   │   └── Timestamp
│   ├── AIMessage × N
│   │   ├── Avatar（C05，AI 头像）
│   │   ├── MessageContent
│   │   │   ├── TextBubble
│   │   │   ├── CodeBubble
│   │   │   └── StructuredBubble（结构化回复，如列表）
│   │   ├── RelatedFiles（相关文件链接）
│   │   │   └── FileLink × N
│   │   └── Actions
│   │       ├── CopyButton（复制回复）
│   │       └── RegenerateButton（重新生成）
│   └── TypingIndicator（AI 正在输入···）
├── SuggestedQuestions（建议问题，可选）
│   ├── QuestionChip × N
│   │   └── QuestionText
│   └── LoadingSkeleton（加载骨架屏）
└── InputBar（C04）
    ├── AttachButton
    └── InputArea（"问我任何关于代码的问题..."）
```

---

### P40: 仪表盘页（金融研究切面）

**页面路径：** `/dashboard`（或作为 MultiPanel 内 Tab）

**目的：** 展示投资组合概览、市场行情

**页面层级：**

```
DashboardPage
├── TopBar（C00）
│   ├── Title（"投资仪表盘"）
│   ├── DateSelector（选择日期）
│   └── RefreshButton
├── SummaryCards（收益概览卡片组）
│   ├── TotalValueCard（总资产）
│   │   ├── Value（金额）
│   │   ├── Change（涨跌额 + 涨跌幅）
│   │   └── TrendChart（迷你趋势图）
│   ├── TodayPLCard（今日盈亏）
│   └── AssetAllocationCard（资产配置饼图）
├── MarketOverview（市场行情区）
│   ├── IndexCard × N（上证指数/深证成指/创业板等）
│   │   ├── IndexName
│   │   ├── IndexValue
│   │   └── ChangePercent
│   └── MarketHeatMap（市场情绪热力图，可选）
├── HoldingsList（持仓列表）
│   ├── HoldingItem × N
│   │   ├── StockName + Code
│   │   ├── CurrentPrice
│   │   ├── ChangePercent
│   │   ├── HoldVolume
│   │   ├── MarketValue
│   │   └── PL（盈亏金额）
│   └── EmptyState（C11，"暂无持仓"）
└── RecentTransactions（近期交易记录）
    ├── TransactionItem × N
    └── ViewAllButton
```

---

### P41: 持仓详情页（金融研究切面）

**页面路径：** `/stock/:symbol`

**目的：** 查看单个持仓的详细信息

**页面层级：**

```
StockDetailPage
├── TopBar（C00）
│   ├── BackButton
│   ├── StockName + Code
│   └── StarButton（收藏自选）
├── PriceHeader（价格头部）
│   ├── CurrentPrice（大字）
│   ├── Change + ChangePercent（涨跌）
│   ├── Open / High / Low / Volume（行情数据网格）
│   └── TrendChart（分时/K线图）
├── StockInfo（股票信息卡）
│   ├── PE（市盈率）
│   ├── PB（市净率）
│   ├── MarketCap（总市值）
│   ├── SharesOutstanding（流通股）
│   └── DividendYield（股息率）
├── HoldingSection（持仓信息）
│   ├── HoldVolume
│   ├── CostPrice（成本价）
│   ├── CurrentValue（当前市值）
│   ├── PLAmount（盈亏金额）
│   └── PLPercent（盈亏比例）
└── RelatedNews（相关新闻）
    └── NewsItem × N
```

---

### P50: 个人设置页

**页面路径：** `/settings`

**目的：** 账号管理、应用设置

**页面层级：**

```
SettingsPage
├── TopBar（C00）
│   └── Title（"设置"）
├── SettingsList（设置项列表）
│   ├── AccountSection（账号设置）
│   │   ├── ProfileItem（头像 + 昵称 + 编辑入口）
│   │   ├── PhoneItem（手机号）
│   │   ├── EmailItem（邮箱）
│   │   └── PasswordItem（修改密码）
│   ├── AppearanceSection（外观设置）
│   │   ├── ThemeItem（主题：浅色/深色/跟随系统）
│   │   ├── FontSizeItem（字体大小）
│   │   └── LanguageItem（语言）
│   ├── NotificationSection（通知设置）
│   │   ├── PushNotificationItem（推送通知开关）
│   │   ├── MessageSoundItem（消息提示音）
│   │   └── DoNotDisturbItem（免打扰时段）
│   ├── PrivacySection（隐私设置）
│   │   ├── OnlineStatusItem（显示在线状态）
│   │   └── ReadReceiptItem（已读回执）
│   ├── DomainSection（行业切面）
│   │   ├── DomainSwitcherItem（切换切面）
│   │   │   ├── CurrentDomain（当前：软件工程）
│   │   │   └── Arrow（→ 跳转 P51）
│   │   └── DomainSettingsItem（切面专属设置）
│   └── AboutSection（关于）
│       ├── VersionItem（版本号）
│       ├── TermsItem（用户协议）
│       └── PrivacyItem（隐私政策）
└── LogoutButton（退出登录）
```

---

### P51: 切行业切换页

**页面路径：** `/settings/domain`

**目的：** 切换当前行业切面（软件工程/金融研究/医疗/···）

**页面层级：**

```
DomainSwitchPage
├── TopBar（C00）
│   ├── BackButton
│   └── Title（"选择行业"）
├── DomainList（行业选项列表）
│   ├── DomainItem × N
│   │   ├── DomainIcon（🤖 / 📊 / 🏥 / ···）
│   │   ├── DomainName
│   │   ├── DomainDescription
│   │   └── Checkmark（当前选中 ✓）
│   └── DomainItem（"通用"）
│       └── DomainDescription（"纯聊天，无行业切面"）
└── Description
    └── Text（"切换后将重新加载对应行业功能"）
```

---

### P60: 全局搜索页

**页面路径：** `/search`

**目的：** 搜索消息、文件、联系人

**页面层级：**

```
GlobalSearchPage
├── TopBar（C00）
│   └── SearchInput（自动聚焦，带清除按钮）
├── SearchFilters（搜索过滤器）
│   ├── FilterChip × N
│   │   ├── All（全部）
│   │   ├── Messages（消息）
│   │   ├── Files（文件）
│   │   ├── Contacts（联系人）
│   │   └── Code（代码，软件工程切面）
│   └── DateRangePicker（可选：时间范围）
├── SearchResults（搜索结果）
│   ├── ResultSection × N
│   │   ├── SectionHeader（"消息" / "文件" / "联系人"）
│   │   └── ResultItem × N
│   │       ├── Avatar
│   │       ├── HighlightedText（高亮关键词）
│   │       └── Timestamp/Meta
│   └── EmptyState（C11，"输入关键词搜索"）
└── RecentSearches（最近搜索，可选）
    └── RecentItem × N
```

---

## 4. 组件复用关系图

### 4.1 全局复用组件（所有页面）

```
C00 TopBar              ← 所有页面
C01 BottomNav           ← 手机端页面
C02 Sidebar             ← 桌面/平板端页面
C03 MultiPanel           ← P20/P21/P30/P31/P32/P33
C04 InputBar             ← P20/P21/P33
C05 Avatar              ← 所有显示用户头像的场景
C06 Badge               ← 未读数、徽章
C07 Button              ← 所有按钮
C08 Icon                ← 所有图标
C09 Modal               ← 确认对话框、详情弹窗
C10 Toast               ← 操作反馈
C11 EmptyState          ← 空列表/空结果
C12 LoadingSpinner      ← 加载中状态
C13 Divider             ← 内容分割
```

### 4.2 跨页面复用组件

```
MessageBubble     ← P20/P21（私聊/群聊）
ConversationItem  ← P10（主聊列表）
FriendItem        ← P22（联系人）
GroupItem         ← P22/P21（群组列表/群聊页）
FileTree / TreeNode ← P30（文件浏览器）
CodeViewer        ← P30/P31（文件预览/调试源码）
DiffLine          ← P32（差异对比）
StockCard         ← P40/P41（仪表盘/持仓详情）
```

---

## 5. 页面路由映射

| 页面ID | 路由路径 | 桌面端 | 平板端 | 手机端 |
|--------|---------|--------|--------|--------|
| P00 | `/`（启动） | ✅ | ✅ | ✅ |
| P01 | `/login` | ✅ | ✅ | ✅ |
| P02 | `/register` | ✅ | ✅ | ✅ |
| P03 | `/forgot-password` | ✅ | ✅ | ✅ |
| P10 | `/`（主页） | ✅ | ✅ | ✅ |
| P20 | `/chat/:userId` | ✅ | ✅ | ✅ |
| P21 | `/group/:groupId` | ✅ | ✅ | ✅ |
| P22 | `/contacts` | ✅ | ✅ | ✅ |
| P30 | `/files`（或面板） | ✅ | ✅ | ✅ |
| P31 | `/debug`（或面板） | ✅ | ✅ | ✅ |
| P32 | `/diff`（或面板） | ✅ | ✅ | ✅ |
| P33 | `/ai`（或面板） | ✅ | ✅ | ✅ |
| P40 | `/dashboard`（或面板） | ✅ | ✅ | ✅ |
| P41 | `/stock/:symbol` | ✅ | ✅ | ✅ |
| P50 | `/settings` | ✅ | ✅ | ✅ |
| P51 | `/settings/domain` | ✅ | ✅ | ✅ |
| P60 | `/search` | ✅ | ✅ | ✅ |

---

## 6. 设计原则

| 原则 | 说明 |
|------|------|
| **组件原子化** | 拆分到最小可复用单元（Button/Avatar/Input），避免重复实现 |
| **页面一致性** | 同一页面在不同平台逻辑相同，仅布局响应式适配 |
| **功能内聚** | 每个组件只负责一件事（MessageBubble 只渲染消息气泡，不处理发送） |
| **渐进式展开** | MultiPanel 默认折叠，需要时展开，不挤占消息流空间 |
| **状态反馈** | 每个操作都有即时状态反馈（Loading/Toast/Empty） |
| **手势优先（移动端）** | 左滑返回、长按菜单、下拉刷新等手势操作符合平台习惯 |
| **快捷键支持（桌面端）**** | 常用操作支持键盘快捷键（⌘K 搜索、⌘B 侧边栏） |

---

## 7. 下一步

- [ ] **UI 组件库设计：** 制定 C00-C13 等全局组件的视觉规范（颜色/字体/间距/圆角）
- [ ] **页面原型设计：** 使用 Figma 等工具绘制各页面线框图
- [ ] **交互流程图：** 绘制用户操作流程（登录流程/发消息流程/搜索流程）
- [ ] **状态机设计：** 定义每个组件的所有状态（Normal/Hover/Active/Disabled/Loading/Error）

---

*AIIM 界面设计文档 v1.0，2026-05-25*