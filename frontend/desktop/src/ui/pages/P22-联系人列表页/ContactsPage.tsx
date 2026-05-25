// Page: P22 联系人列表页
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { Button } from '../../components/C07-Button/Button';
import { Input } from '../../components/C08-Input/Input';
import { EmptyState } from '../../components/C11-EmptyState/EmptyState';
import { Spinner } from '../../components/C12-Loading/Loading';
import { useChat } from '../../hooks/useChat';
import type { Contact } from '../../../domain/entities/Contact';

export function ContactsPage() {
  const navigate = useNavigate();
  const { contacts, addContact, createGroup, isLoadingContacts } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const filteredContacts = contacts.filter((c: Contact) =>
    c.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddContact = async () => {
    if (!newContactUsername.trim()) return;
    await addContact(newContactUsername.trim());
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
          <Input
            placeholder="搜索联系人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              title="暂无联系人"
              description="添加联系人开始聊天"
            />
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => navigate(`/chat/${contact.id}`)}
                className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50"
              >
                <Avatar name={contact.nickname} src={contact.avatar} size="md" isOnline={contact.isOnline} />
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">{contact.nickname}</p>
                  <p className="text-sm text-slate-500">@{contact.username}</p>
                </div>
              </button>
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

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
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
              ))}
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
