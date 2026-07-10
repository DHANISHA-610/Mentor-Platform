import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { FiSearch, FiSend, FiArrowLeft } from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';

const API_URL = 'http://localhost:5000/api/chat';
const SOCKET_URL = 'http://localhost:5000';

export default function ChatPage() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const activeIdRef = useRef(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketError, setSocketError] = useState('');
  const [activeMessages, setActiveMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const socketRef = useRef(null);

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

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      setSocketError(err.message || 'Socket connection failed');
    });

    socket.on('receive_message', ({ conversationId, message, lastMessage, lastMessageTime }) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage,
                lastMessageTime,
                unread: conversation.id === activeIdRef.current ? 0 : (conversation.unread || 0) + 1,
              }
            : conversation
        )
      );

      if (conversationId === activeIdRef.current) {
        setActiveMessages((prev) => [...prev, message]);
      }
    });

    socket.on('message_sent', ({ conversationId, message, lastMessage, lastMessageTime }) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage,
                lastMessageTime,
              }
            : conversation
        )
      );

      if (conversationId === activeIdRef.current) {
        setActiveMessages((prev) => [...prev, message]);
      }
    });

    socket.on('message_updated', ({ conversationId, message, lastMessage, lastMessageTime }) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage,
                lastMessageTime,
              }
            : conversation
        )
      );

      if (conversationId === activeIdRef.current) {
        setActiveMessages((prev) =>
          prev.map((existing) => (existing.id === message.id ? { ...existing, ...message } : existing))
        );
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!activeId || !token) {
      setActiveMessages([]);
      setEditingMessageId(null);
      return;
    }

    const fetchConversation = async () => {
      try {
        const res = await fetch(`${API_URL}/${activeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load conversation');
        }

        setActiveMessages(data.conversation.messages || []);
        setEditingMessageId(null);
      } catch (err) {
        setError(err.message || 'Unable to load conversation');
      }
    };

    fetchConversation();
  }, [activeId, token]);

  const activeConv = conversations.find((c) => c.id === activeId);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeId) return;

    const socket = socketRef.current;
    const trimmedText = message.trim();

    const sendEdit = async () => {
      const payload = {
        text: trimmedText,
      };

      if (socket && socket.connected) {
        socket.emit(
          'edit_message',
          { conversationId: activeId, messageId: editingMessageId, text: trimmedText },
          (response) => {
            if (!response?.success) {
              setError(response?.message || 'Unable to edit message');
            }
          }
        );
      } else {
        try {
          const res = await fetch(`${API_URL}/${activeId}/messages/${editingMessageId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to edit message');
          }

          setConversations((prev) =>
            prev.map((conversation) =>
              conversation.id === activeId
                ? {
                    ...conversation,
                    lastMessage: data.message.text,
                    lastMessageTime: data.message.time,
                  }
                : conversation
            )
          );
          setActiveMessages((prev) =>
            prev.map((item) =>
              item.id === data.message.id ? { ...item, ...data.message } : item
            )
          );
        } catch (err) {
          setError(err.message || 'Unable to edit message');
        }
      }
    };

    if (editingMessageId) {
      await sendEdit();
      setEditingMessageId(null);
      setMessage('');
      return;
    }

    const payload = {
      conversationId: activeId,
      text: trimmedText,
    };

    if (socket && socket.connected) {
      socket.emit('send_message', payload, (response) => {
        if (!response?.success) {
          setError(response?.message || 'Unable to send message');
        }
      });
    } else {
      try {
        const res = await fetch(`${API_URL}/${activeId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: trimmedText }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to send message');
        }

        const newMsg = {
          id: data.message.id,
          senderId: '',
          text: data.message.text,
          time: data.message.time,
          isOwn: true,
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessage: newMsg.text,
                  lastMessageTime: newMsg.time,
                }
              : c
          )
        );
        setActiveMessages((prev) => [...prev, newMsg]);
      } catch (err) {
        setError(err.message || 'Unable to send message');
      }
    }

    setMessage('');
  };

  const selectConversation = (id) => {
    setActiveId(id);
    setShowMobileChat(true);
    setEditingMessageId(null);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const startEditMessage = (messageId, text) => {
    setEditingMessageId(messageId);
    setMessage(text);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </DashboardLayout>
    );
  }

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
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No conversations found.</div>
            ) : (
              filtered.map((conv) => (
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
              ))
            )}
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
                {activeMessages.length === 0 ? (
                  <div className="text-center text-sm text-slate-500">No messages yet. Start the conversation.</div>
                ) : (
                  activeMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.isOwn ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-900'
                      }`}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm wrap-break-word">{msg.text}</p>
                          {msg.edited && (
                            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-100">
                              edited
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-xs">
                          <p className={msg.isOwn ? 'text-brand-200' : 'text-slate-400'}>{msg.time}</p>
                          {msg.isOwn && (
                            <button
                              type="button"
                              onClick={() => startEditMessage(msg.id, msg.text)}
                              className="text-brand-100 hover:text-white"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    {editingMessageId ? 'Update' : <FiSend className="h-4 w-4" />}
                  </button>
                </div>
                {socketError && <p className="mt-2 text-xs text-red-500">{socketError}</p>}
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
