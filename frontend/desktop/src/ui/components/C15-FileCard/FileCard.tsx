// Component: C15 FileCard — 文件卡片
interface FileCardProps {
  name: string;
  size?: string;
  modifiedTime?: string;
  icon?: string;
  onClick?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  selected?: boolean;
}

const EXT_ICON: Record<string, string> = {
  pdf: '📄', doc: '📝', docx: '📝', txt: '📃', md: '📋',
  jpg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️',
  mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬',
  mp3: '🎵', wav: '🎵', ogg: '🎵', flac: '🎵',
  zip: '🗜️', rar: '🗜️', '7z': '🗜️', tar: '🗜️', gz: '🗜️',
  js: '📜', ts: '📜', jsx: '📜', tsx: '📜', py: '🐍',
  java: '☕', kt: '🎯', swift: '🍎', go: '🔵', rs: '🦀',
  html: '🌐', css: '🎨', json: '📋', yaml: '⚙️', yml: '⚙️',
  default: '📎',
};

function getIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return EXT_ICON[ext] || EXT_ICON.default;
}

export function FileCard({ name, size, modifiedTime, icon, onClick, onDownload, onDelete, selected }: FileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        selected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
          : 'bg-white dark:bg-slate-800 hover:shadow-md border border-slate-200 dark:border-slate-700'
      }`}
    >
      <span className="text-2xl">{icon || getIcon(name)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{name}</p>
        <div className="flex gap-2 text-xs text-slate-500">
          {size && <span>{size}</span>}
          {modifiedTime && <span>{modifiedTime}</span>}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onDownload && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
            title="下载"
          >
            📥
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
            title="删除"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}