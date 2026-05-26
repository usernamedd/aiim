export type AppMode = 'finance' | 'software' | 'general'

export interface AppModeOption {
  id: AppMode
  name: string
  description: string
  icon: string
}

export const APP_MODES: AppModeOption[] = [
  {
    id: 'finance',
    name: '金融研究',
    description: 'K线图、持仓管理、实时行情监控',
    icon: '📈',
  },
  {
    id: 'software',
    name: '软件工程',
    description: '文件浏览、代码编辑、调试控制台',
    icon: '💻',
  },
  {
    id: 'general',
    name: '通用',
    description: '基础聊天功能，无行业专属功能',
    icon: '💬',
  },
]
