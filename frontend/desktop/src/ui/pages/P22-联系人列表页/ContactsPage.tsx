// Page: P22 联系人列表页
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { Button } from '../../components/C07-Button/Button';
import { Input } from '../../components/C08-Input/Input';
import { EmptyState } from '../../components/C11-EmptyState/EmptyState';
import { Spinner } from '../../components/C12-Loading/Loading';
import { useChat } from '../../hooks/useChat';
import type { Contact } from '../../../domain/entities/Contact';

// Contact group categories
type ContactGroup = 'friends' | 'colleagues' | 'strangers';

// Context menu state
interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  contactId: string | null;
}

// SearchBar Component

// SearchBar Component (C02)
function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '搜索...'}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// Context Menu Component
function ContextMenu({
  state,
  onClose,
  onDelete,
  onStartChat,
}: {
  state: ContextMenuState;
  onClose: () => void;
  onDelete: (contactId: string) => void;
  onStartChat: (contactId: string) => void;
}) {
  if (!state.visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Menu */}
      <div
        className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[140px]"
        style={{ left: state.x, top: state.y }}
      >
        <button
          onClick={() => {
            if (state.contactId) onStartChat(state.contactId);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          发消息
        </button>
        <button
          onClick={() => {
            if (state.contactId) onDelete(state.contactId);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          删除联系人
        </button>
      </div>
    </>
  );
}

export function ContactsPage() {
  const navigate = useNavigate();
  const { contacts, addContact: storeAddContact, createGroup, isLoadingContacts, removeContact } = useChat();

  // No mock fallback — use real data from store
  const [activeTab, setActiveTab] = useState<ContactGroup>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    contactId: null,
  });

  // Filter contacts by group and search query
  const getFilteredContacts = useCallback(() => {
    let filtered = contacts;
    
    // Filter by tab/group
    if (activeTab === 'friends') {
      filtered = filtered.filter((c) => !c.tags || c.tags.includes('friends'));
    } else if (activeTab === 'colleagues') {
      filtered = filtered.filter((c) => c.tags?.includes('colleagues'));
    } else if (activeTab === 'strangers') {
      filtered = filtered.filter((c) => c.tags?.includes('strangers'));
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (c: Contact) =>
          c.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [contacts, activeTab, searchQuery]);

  const filteredContacts = getFilteredContacts();

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, contactId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      contactId,
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Delete contact — calls real API
  const handleDeleteContact = (contactId: string) => {
    removeContact(contactId);
  };

  // Start chat with contact
  const handleStartChat = (contactId: string) => {
    navigate(`/chat/${contactId}`);
  };

  const handleAddContact = async () => {
    if (!newContactUsername.trim()) return;
    await storeAddContact(newContactUsername.trim());
    setNewContactUsername('');
    setShowAddModal(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedContacts.length === 0) return;
    const room = await createGroup(groupName.trim(), selectedContacts);
    setShowGroupModal(false);
    setGroupName('');
    setSelectedContacts([]);
    navigate(`/group/${room.id}`);
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const tabs: { key: ContactGroup; label: string }[] = [
    { key: 'friends', label: '朋友' },
    { key: 'colleagues', label: '同事' },
    { key: 'strangers', label: '陌生人' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">联系人</h1>
            <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>←</Button>
          </div>
          
          {/* SearchBar (C02) */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索联系人..."
          />
        </div>

        {/* Tab Bar (Contact Groups) */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => setShowAddModal(true)}>
            + 添加
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => setShowGroupModal(true)}>
            + 建群
          </Button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingContacts ? (
            <div className="flex justify-center p-4"><Spinner size="sm" /></div>
          ) : filteredContacts.length === 0 ? (
            <EmptyState
              icon="👥"
              title={`暂无${activeTab === 'friends' ? '好友' : activeTab === 'colleagues' ? '同事' : '陌生人'}`}
              description="添加联系人开始聊天"
            />
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onContextMenu={(e) => handleContextMenu(e, contact.id)}
              >
                <button
                  onClick={() => navigate(`/chat/${contact.id}`)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50"
                >
                  <Avatar name={contact.nickname} src={contact.avatar} size="md" isOnline={contact.isOnline} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{contact.nickname}</p>
                    <p className="text-sm text-slate-500">@{contact.username}</p>
                  </div>
                  {/* Online status indicator */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      contact.isOnline
                        ? 'bg-green-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p>选择一个联系人开始聊天</p>
        </div>
      </main>

      {/* Context Menu */}
      <ContextMenu
        state={contextMenu}
        onClose={closeContextMenu}
        onDelete={handleDeleteContact}
        onStartChat={handleStartChat}
      />

      {/* Add Contact Modal (C04 Dialog) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">添加联系人</h3>
            <Input
              label="用户名"
              placeholder="请输入用户名"
              value={newContactUsername}
              onChange={(e) => setNewContactUsername(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)}>取消</Button>
              <Button variant="primary" className="flex-1" onClick={handleAddContact}>添加</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">创建群聊</h3>
            <Input
              label="群名称"
              placeholder="请输入群名称"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <p className="text-sm text-slate-500 mt-3 mb-2">选择群成员（{selectedContacts.length} 已选）</p>
            <div className="flex-1 overflow-y-auto space-y-2">
              {
                contacts.map((contact: Contact) => (
                  <button
                    key={contact.id}
                    onClick={() => toggleContactSelection(contact.id)}
                    className={`w-full p-3 flex items-center gap-3 rounded-lg transition-colors ${
                      selectedContacts.includes(contact.id)
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent'
                    }`}
                  >
                    <Avatar name={contact.nickname} size="sm" />
                    <span className="text-sm text-slate-900 dark:text-white">{contact.nickname}</span>
                  </button>
                ))
              }
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" className="flex-1" onClick={() => setShowGroupModal(false)}>取消</Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedContacts.length === 0}
              >
                创建（{selectedContacts.length}人）
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}