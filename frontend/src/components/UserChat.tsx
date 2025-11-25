import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import './UserChat.css';

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
    messages: Message[];
    status: string;
}

const UserChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const [message, setMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadChat();
            const interval = setInterval(loadChat, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChat = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/chat/my-chat', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setChat(data.data);
                if (isOpen) {
                    markAsRead(data.data._id);
                }
            }
        } catch (error) {
            console.error('Failed to load chat:', error);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/chat/unread-count', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to load unread count:', error);
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
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            if (data.success) {
                setChat(data.data);
                setMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="user-chat-button"
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-color)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    zIndex: 1000
                }}
            >
                <MessageCircle size={28} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="user-chat-window" style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '380px',
                    height: '500px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1001,
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--accent-color)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chat dengan Admin</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                                Tanyakan apapun tentang laporan Anda
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '5px'
                            }}
                        >
                            <X size={24} />
                        </button>
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
                        {chat?.messages.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                marginTop: '50px'
                            }}>
                                <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                <p>Belum ada pesan. Mulai percakapan!</p>
                            </div>
                        ) : (
                            chat?.messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.senderRole === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        backgroundColor: msg.senderRole === 'user' ? 'var(--accent-color)' : 'var(--card-bg)',
                                        color: msg.senderRole === 'user' ? 'white' : 'var(--text-primary)',
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
                                            {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
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
                            placeholder="Ketik pesan..."
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
                            onClick={sendMessage}
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
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserChat;
