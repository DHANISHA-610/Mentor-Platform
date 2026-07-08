import { useEffect, useState } from 'react';
import { FiSearch, FiSend, FiArrowLeft } from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';

const API_URL = 'http://localhost:5000/api/chat';

export default function ChatPage() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load conversations');
        }

        setConversations(data.conversations || []);
        setActiveId(data.conversations?.[0]?.id || null);
      } catch (err) {
        setError(err.message || 'Unable to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchConversations();
    }
  }, [token]);

  const activeConv = conversations.find((c) => c.id === activeId);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeId) return;

    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, lastMessageTime: 'Now' }
          : c
      )
    );
    setMessage('');
  };

  const selectConversation = (id) => {
    setActiveId(id);
    setShowMobileChat(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  return (
    <DashboardLayout>
      <PageHeader title="Messages" subtitle="Chat with your mentors and mentees" />

      <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className={`w-full border-r border-slate-200 md:w-80 lg:w-96 ${showMobileChat ? 'hidden md:block' : 'block'}`}>
          <div className="border-b border-slate-200 p-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                  activeId === conv.id ? 'bg-brand-50' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <img src={conv.avatar} alt={conv.name} className="h-10 w-10 rounded-full bg-slate-100" />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-slate-900">{conv.name}</p>
                    <span className="text-xs text-slate-400">{conv.lastMessageTime}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-medium text-white">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={`flex flex-1 flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 md:hidden"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <img src={activeConv.avatar} alt={activeConv.name} className="h-9 w-9 rounded-full bg-slate-100" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{activeConv.name}</p>
                  <p className="text-xs text-slate-500">
                    {activeConv.online ? '● Online' : 'Offline'} · {activeConv.role}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {activeConv.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      msg.isOwn
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`mt-1 text-xs ${msg.isOwn ? 'text-brand-200' : 'text-slate-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="rounded-lg bg-brand-600 px-4 py-2.5 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                  >
                    <FiSend className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
