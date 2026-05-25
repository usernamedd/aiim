# P33: AI 助手页

> **版本:** v1.0 | **页面ID:** P33 | **适用端:** 全平台（Android / iOS / Windows / macOS / Linux）

---

## 1. 页面概述

| 项目 | 内容 |
|------|------|
| **页面路径** | `/ai`（独立页面）或作为 MultiPanel 内 Tab（`P20/P21 MultiPanel → AITab`） |
| **目的** | 与 AI 代码助手对话，专门解答代码相关问题，支持代码高亮、相关文件链接 |
| **前置条件** | 用户已登录，进入软件工程切面 |

---

## 2. 组件层级（Tree Structure）

```
AIAssistantPage
│
├── TopBar
│   └── C00 TopBar
│       ├── Title（"AI 代码助手"）
│       ├── ContextIndicator
│       │   ├── ContextIcon（📁）
│       │   └── ContextPath（"上下文：src/agents/planner.ts"）
│       │       └── ClickableText（可点击，跳转到 P30 文件浏览器定位到该文件）
│       └── ClearContextButton（🗑 清除上下文）
│
├── ChatMessageList
│   └── ScrollContainer
│       │
│       ├── ContextFileBanner（上下文文件提示条）
│       │   ├── BannerIcon（📁）
│       │   ├── BannerText（"已加载 3 个文件到上下文"）
│       │   └── ViewFilesButton（"查看文件"）
│       │
│       ├── UserMessage × N
│       │   ├── MessageBubble
│       │   │   ├── Avatar（C05，用户头像）
│       │   │   └── Content
│       │   │       └── TextBubble
│       │   │           └── C08 Text（用户输入的文本）
│       │   └── Timestamp
│       │
│       ├── AIMessage × N
│       │   ├── MessageBubble
│       │   │   ├── Avatar（C05，AI 头像 🤖）
│       │   │   └── Content
│       │   │       ├── TextBubble
│       │   │       │   └── C08 Text（AI 回复的文本，支持 Markdown）
│       │   │       │
│       │   │       ├── CodeBubble
│       │   │       │   ├── CodeBlock
│       │   │       │   │   ├── LanguageLabel（"typescript"）
│       │   │       │   │   ├── CodeContent（语法高亮代码）
│       │   │       │   │   ├── LineNumbers（行号，可选）
│       │   │       │   │   └── CopyButton（📋 一键复制）
│       │   │       │   └── CodeActions
│       │   │       │       ├── RunButton（▶ 运行代码，可选）
│       │   │       │       └── ExpandButton（⤢ 全屏）
│       │   │       │
│       │   │       ├── StructuredBubble（结构化回复）
│       │   │       │   ├── BulletList（• 列表）
│       │   │       │   │   └── ListItem × N
│       │   │       │   ├── NumberedList（1. 编号列表）
│       │   │       │   ├── Blockquote（引用块）
│       │   │       │   ├── Table（表格）
│       │   │       │   └── Callout（提示框，如 ⚠️ 注意）
│       │   │       │
│       │   │       └── ThinkingBubble（思考过程，可折叠）
│       │   │           ├── ToggleButton（"查看 AI 思考过程"）
│       │   │           └── ThinkingContent（AI 思考时的推理过程）
│       │   │
│       │   ├── RelatedFiles（相关文件链接）
│       │   │   ├── SectionLabel（"📁 相关文件"）
│       │   │   └── FileLink × N
│       │   │       ├── FileIcon（文件类型图标）
│       │   │       ├── FileName（文件名）
│       │   │       └── FilePath（文件路径）
│       │   │           └── ClickableText（点击 → 跳转 P30 定位到该文件）
│       │   │
│       │   ├── Citations（引用来源，可选）
│       │   │   └── Citation × N
│       │   │       ├── CitationIndex（[1]）
│       │   │       └── CitationText（引用文本片段）
│       │   │
│       │   └── Actions
│       │       ├── CopyButton（📋 复制全部回复）
│       │       ├── RegenerateButton（🔄 重新生成）
│       │       ├── ThumbsUpButton（👍 满意）
│       │       └── ThumbsDownButton（👎 不满意）
│       │
│       ├── TypingIndicator（AI 正在输入）
│       │   ├── Avatar（🤖 小尺寸头像）
│       │   └── TypingDots（三个跳动圆点 ···）
│       │
│       └── ScrollToBottomButton
│
├── SuggestedQuestions（建议问题，可选显示）
│   ├── SectionLabel（"试试这样问"）
│   ├── QuestionChip × N
│   │   ├── ChipIcon（💬）
│   │   └── QuestionText
│   │       └── ClickableText（点击 → 填充到输入框并发送）
│   └── LoadingSkeleton（加载骨架屏，显示 3 个占位 Chip）
│
└── InputBar
    └── C04 InputBar
        ├── AttachButton（📎 附件，可上传文件/代码片段）
        ├── ScreenshotButton（📸 截图）
        ├── InputArea
        │   ├── AutoGrowTextarea
        │   │   └── PlaceholderText（"问我任何关于代码的问题..."）
        │   └── CodeModeToggle（</> 代码模式开关）
        ├── SendButton（▶ 发送）
        └── VoiceInputButton（🎤 语音输入，可选）
```

**嵌套关系说明：**
- `AIAssistantPage` → 根页面容器
  - `TopBar` → 顶部栏（C00）
    - `ContextIndicator` → 上下文指示器（FeatureComponent），显示当前加载的文件
    - `ClearContextButton` → 清除上下文按钮（UIComponent）
  - `ChatMessageList` → 对话消息列表（FeatureComponent）
    - `ContextFileBanner` → 上下文文件横幅（FeatureComponent）
    - `UserMessage × N` → 用户消息（FeatureComponent）
      - `MessageBubble` → 消息气泡（同 P20 结构，但内容简化）
    - `AIMessage × N` → AI 消息（FeatureComponent，核心组件）
      - `TextBubble` → 文本回复气泡（UIComponent）
      - `CodeBubble` → 代码回复气泡（FeatureComponent）
        - `CodeBlock` → 代码块（FeatureComponent）
      - `StructuredBubble` → 结构化回复（FeatureComponent）
      - `ThinkingBubble` → AI 思考过程（FeatureComponent，可选折叠）
      - `RelatedFiles` → 相关文件区（FeatureComponent）
      - `Citations` → 引用来源（FeatureComponent）
      - `Actions` → 消息操作区（LayoutComponent）
    - `TypingIndicator` → 正在输入提示（UIComponent）
  - `SuggestedQuestions` → 建议问题区（FeatureComponent）
  - `InputBar` → 底部输入栏（C04）
    - `CodeModeToggle` → 代码模式开关（UIComponent）

---

## 3. 布局规范

### 桌面端布局（≥768px）

```
┌──────────────────────────────────────────────────────────────────┐
│  [TopBar: AI 代码助手]  📁 src/agents/planner.ts  [🗑]           │
├──────────────────────────────────────────────────────────────────┤
│  📁 已加载 3 个文件到上下文      [查看文件]                       │  ← ContextFileBanner
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [头像]                                   │
│  如何优化这个函数的性能？                      │
│  10:30                                    │
│                                                                  │
│                           这个函数可以使用备忘录模式...   🤖      │
│                           ┌──────────────────────────┐          │
│                           │ function memoizedFn() {  │          │
│                           │   // ...                 │          │
│                           │ }           [📋] [⤢]  │          │
│                           └──────────────────────────┘          │
│                                                                  │
│                           📁 相关文件                            │
│                           📄 src/utils/helper.ts               │
│                           📄 src/types/index.ts                 │
│                                          10:31                   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  💬 试试这样问                                                   │
│  [💬 如何处理异步错误] [💬 解释这段代码] [💬 优化建议]           │  ← SuggestedQuestions
├──────────────────────────────────────────────────────────────────┤
│  [📎] [📸]  [问我任何关于代码的问题...        </>]  [▶]  [🎤]   │  ← InputBar
└──────────────────────────────────────────────────────────────────┘
```

- **AI 消息气泡最大宽度：** 80% 屏幕宽度
- **代码块最大高度：** 400px，超出可滚动/展开
- **SuggestedQuestions 高度：** 60px，可选显示

### 移动端布局（<768px）

```
┌──────────────────────────────────────┐
│  [TopBar: AI 代码助手]    [📁] [🗑]  │
├──────────────────────────────────────┤
│  📁 已加载 3 个文件      [查看]       │
├──────────────────────────────────────┤
│                                      │
│  [头像]                              │
│  如何优化这个函数？                    │
│                          10:30        │
│                                      │
│              这个函数可以使用...  🤖   │
│              ┌──────────────────┐   │
│              │ function xxx() {  │   │
│              │ }    [📋]       │   │
│              └──────────────────┘   │
│                          10:31        │
│                                      │
├──────────────────────────────────────┤
│  💬 试试这样问                        │
│  [💬 优化] [💬 解释] [💬 建议]        │
├──────────────────────────────────────┤
│ [📎] [📸]  [输入...     </>] [▶]    │
└──────────────────────────────────────┘
```

---

## 4. 组件分类

| 组件ID | 组件名称 | 类型 | 说明 |
|--------|---------|------|------|
| - | AIAssistantPage | Page | AI 助手页面容器 |
| C00 | TopBar | LayoutComponent | 顶部栏 |
| - | ContextIndicator | FeatureComponent | 上下文文件指示器 |
| - | ChatMessageList | FeatureComponent | 消息列表容器 |
| - | ContextFileBanner | FeatureComponent | 上下文文件横幅 |
| - | UserMessage | FeatureComponent | 用户消息 |
| - | AIMessage | FeatureComponent | AI 消息（核心） |
| - | TextBubble | UIComponent | 文本气泡 |
| - | CodeBubble | FeatureComponent | 代码气泡 |
| - | CodeBlock | FeatureComponent | 代码块 |
| - | StructuredBubble | FeatureComponent | 结构化回复 |
| - | ThinkingBubble | FeatureComponent | AI 思考过程 |
| - | RelatedFiles | FeatureComponent | 相关文件区 |
| - | Citations | FeatureComponent | 引用来源 |
| - | SuggestedQuestions | FeatureComponent | 建议问题 |
| - | QuestionChip | UIComponent | 问题标签 |
| C04 | InputBar | FeatureComponent | 底部输入栏 |
| C05 | Avatar | UIComponent | 头像基组件 |

---

## 5. 交互行为

| 行为 | 处理 |
|------|------|
| **发送消息** | 输入问题 → 按 Enter/点击发送 → 显示用户消息 → AI 正在输入 → 显示 AI 回复 |
| **代码块操作** | 点击 📋 复制代码；点击 ⤢ 全屏查看；支持代码语言高亮 |
| **点击相关文件** | 跳转到 P30 文件浏览器，定位到该文件 |
| **查看 AI 思考** | 点击"查看 AI 思考过程" → 展开显示推理步骤（可选功能） |
| **重新生成** | 点击 🔄 → AI 重新生成回复，覆盖当前回复 |
| **评价回复** | 点击 👍/👎 → 反馈给 AI 用于改进 |
| **代码模式** | 点击 </> → 切换为纯代码输入模式 |
| **上传附件** | 点击 📎 → 上传代码文件 → 自动添加到上下文 |
| **清除上下文** | 点击 🗑 → 清空已加载的上下文文件 |
| **查看上下文** | 点击"查看文件" → 显示上下文文件列表，可移除单个文件 |

---

## 6. 状态

| 组件 | 状态 | 表现 |
|------|------|------|
| **AIMessage** | Typing | 显示 TypingIndicator 动画 |
| | Complete | 显示完整回复 |
| | Error | 显示错误提示 + 重试按钮 |
| **ThinkingBubble** | Collapsed | 默认折叠，显示"查看 AI 思考过程" |
| | Expanded | 展开显示思考步骤 |
| **RelatedFiles** | HasFiles | 显示相关文件列表 |
| | NoFiles | 不显示此区块 |
| **SuggestedQuestions** | Loading | 显示 3 个骨架屏 Chip |
| | Loaded | 显示真实建议问题 |
| | Hidden | 用户已发送消息后隐藏 |
| **InputBar** | Normal | 文本输入模式 |
| | CodeMode | 代码输入模式，字体等宽 |

---

## 7. 复用说明

| 组件 | 复用位置 |
|------|---------|
| C00 TopBar | 所有页面 |
| C04 InputBar | P20/P21/P33 |
| C05 Avatar | 所有页面 |
| TypingIndicator | P20/P21/P33 |

---

*P33 AI 助手页 v1.0，2026-05-25*
