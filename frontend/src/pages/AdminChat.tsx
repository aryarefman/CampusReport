import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, CheckCircle, Clock, User } from 'lucide-react';
import './AdminChat.css';

interface Message {
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'admin';
    message: string;
    timestamp: Date;
    isRead: boolean;
}

interface Chat {
    _id: string;
    userId: string;
    userName: string;
    messages: Message[];
    status: string;
    lastMessageAt: Date;
}

const AdminChat: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [message, setMessage] = useState('');
    const [filter, setFilter] = useState<'active' | 'closed' | 'all'>('active');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChats();
        const interval = setInterval(loadChats, 3000); // Auto-refresh every 3 seconds
        return () => clearInterval(interval);
    }, [filter]);

    useEffect(() => {
        if (selectedChat) {
            const interval = setInterval(() => loadChatById(selectedChat._id), 2000);
            return () => clearInterval(interval);
        }
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedChat?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = filter === 'all'
                ? 'http://localhost:3000/api/chat/all'
                : `http://localhost:3000/api/chat/all?status=${filter}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setChats(data.data);
            }
        } catch (error) {
            console.error('Failed to load chats:', error);
        }
    };

    const loadChatById = async (chatId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/chat/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setSelectedChat(data.data);
                markAsRead(chatId);
            }
        } catch (error) {
            console.error('Failed to load chat:', error);
        }
    };

    const markAsRead = async (chatId: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/api/chat/${chatId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const sendReply = async () => {
        if (!message.trim() || !selectedChat) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/chat/${selectedChat._id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            if (data.success) {
                setSelectedChat(data.data);
                setMessage('');
                loadChats();
            }
        } catch (error) {
            console.error('Failed to send reply:', error);
        }
    };

    const closeChat = async (chatId: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/api/chat/${chatId}/close`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            loadChats();
            if (selectedChat?._id === chatId) {
                setSelectedChat(null);
            }
        } catch (error) {
            console.error('Failed to close chat:', error);
        }
    };

    const getUnreadCount = (chat: Chat) => {
        return chat.messages.filter(m => m.senderRole === 'user' && !m.isRead).length;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendReply();
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--background-color)',
            padding: '30px'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <h1 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    fontSize: '2rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <MessageCircle size={32} />
                    Admin Chat
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '30px',
                    fontSize: '1.1rem'
                }}>
                    Kelola percakapan dengan pengguna
                </p>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    {(['active', 'closed', 'all'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: filter === status ? 'var(--accent-color)' : 'var(--card-bg)',
                                color: filter === status ? 'white' : 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {status === 'active' ? 'Aktif' : status === 'closed' ? 'Selesai' : 'Semua'}
                        </button>
                    ))}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '350px 1fr',
                    gap: '20px',
                    height: 'calc(100vh - 250px)'
                }}>
                    {/* Chat List */}
                    <div style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '16px',
                        padding: '20px',
                        overflowY: 'auto',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h3 style={{
                            margin: '0 0 15px 0',
                            color: 'var(--text-primary)',
                            fontSize: '1.1rem'
                        }}>
                            Percakapan ({chats.length})
                        </h3>

                        {chats.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                padding: '40px 20px'
                            }}>
                                <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                <p>Belum ada percakapan</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {chats.map(chat => {
                                    const unread = getUnreadCount(chat);
                                    return (
                                        <div
                                            key={chat._id}
                                            onClick={() => setSelectedChat(chat)}
                                            style={{
                                                padding: '15px',
                                                borderRadius: '12px',
                                                backgroundColor: selectedChat?._id === chat._id ? 'var(--accent-color)' : 'var(--background-alt)',
                                                color: selectedChat?._id === chat._id ? 'white' : 'var(--text-primary)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: `2px solid ${selectedChat?._id === chat._id ? 'var(--accent-color)' : 'transparent'}`
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontWeight: '600'
                                                }}>
                                                    <User size={18} />
                                                    {chat.userName}
                                                </div>
                                                {unread > 0 && (
                                                    <span style={{
                                                        backgroundColor: '#e74c3c',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: '22px',
                                                        height: '22px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {unread}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                opacity: 0.8,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {chat.messages[chat.messages.length - 1]?.message || 'Belum ada pesan'}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                opacity: 0.7,
                                                marginTop: '5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                {chat.status === 'active' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                                {new Date(chat.lastMessageAt).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Chat Window */}
                    <div style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {selectedChat ? (
                            <>
                                {/* Header */}
                                <div style={{
                                    padding: '20px',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: 'var(--background-alt)'
                                }}>
                                    <div>
                                        <h3 style={{
                                            margin: 0,
                                            color: 'var(--text-primary)',
                                            fontSize: '1.2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <User size={24} />
                                            {selectedChat.userName}
                                        </h3>
                                        <p style={{
                                            margin: '5px 0 0 34px',
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem'
                                        }}>
                                            {selectedChat.messages.length} pesan
                                        </p>
                                    </div>
                                    {selectedChat.status === 'active' && (
                                        <button
                                            onClick={() => closeChat(selectedChat._id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: '#27ae60',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <CheckCircle size={16} />
                                            Tandai Selesai
                                        </button>
                                    )}
                                </div>

                                {/* Messages */}
                                <div style={{
                                    flex: 1,
                                    padding: '20px',
                                    overflowY: 'auto',
                                    backgroundColor: 'var(--background-alt)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '15px'
                                }}>
                                    {selectedChat.messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                justifyContent: msg.senderRole === 'admin' ? 'flex-end' : 'flex-start'
                                            }}
                                        >
                                            <div style={{
                                                maxWidth: '70%',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                backgroundColor: msg.senderRole === 'admin' ? 'var(--accent-color)' : 'var(--card-bg)',
                                                color: msg.senderRole === 'admin' ? 'white' : 'var(--text-primary)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    opacity: 0.8,
                                                    marginBottom: '5px',
                                                    fontWeight: '600'
                                                }}>
                                                    {msg.senderName}
                                                </div>
                                                <div style={{ fontSize: '0.95rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                                    {msg.message}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    opacity: 0.7,
                                                    marginTop: '5px',
                                                    textAlign: 'right'
                                                }}>
                                                    {new Date(msg.timestamp).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                {selectedChat.status === 'active' && (
                                    <div style={{
                                        padding: '15px',
                                        borderTop: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--card-bg)',
                                        display: 'flex',
                                        gap: '10px'
                                    }}>
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ketik balasan..."
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                backgroundColor: 'var(--input-bg)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={sendReply}
                                            disabled={!message.trim()}
                                            style={{
                                                padding: '12px 20px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: message.trim() ? 'var(--accent-color)' : 'var(--border-color)',
                                                color: 'white',
                                                cursor: message.trim() ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Send size={18} />
                                            Kirim
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <MessageCircle size={64} style={{ opacity: 0.3, marginBottom: '20px' }} />
                                    <p style={{ fontSize: '1.1rem' }}>Pilih percakapan untuk memulai</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
