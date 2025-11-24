import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { Bot, Send, X, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export default function Chatbot() {
    const { token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content:
                "Hi! I'm your CampusReport assistant. Ask me anything about facility reports, statistics, or how to use the system!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:3000/chatbot/chat',
                { message: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const aiMsg: Message = {
                role: 'ai',
                content: response.data.data.message,
                timestamp: new Date(response.data.data.timestamp)
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error('Chat error:', err);
            let errMsg = 'Sorry, something went wrong. Please try again.';
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    errMsg = `Error: ${err.response.data?.message || err.response.statusText}`;
                } else if (err.request) {
                    errMsg = 'No response from server. Check if backend is running.';
                } else {
                    errMsg = `Request error: ${err.message}`;
                }
            }
            toast.error(errMsg);
            const errorMsg: Message = { role: 'ai', content: errMsg, timestamp: new Date() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
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
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                    border: 'none',
                    boxShadow: 'var(--shadow-lg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    transition: 'transform 0.3s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
                onMouseOver={e => {
                    e.currentTarget.style.transform = isOpen ? 'rotate(180deg) scale(1.1)' : 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                }}
            >
                {isOpen ? <X size={28} color="white" /> : <Bot size={28} color="white" />}
            </button>

            {/* Chat Card */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '20px',
                        width: '100%',
                        maxWidth: '380px',
                        height: '500px',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-color)',
                        zIndex: 999,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '20px',
                            backgroundColor: 'var(--primary-color)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <Bot size={24} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>CampusReport Assistant</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Powered by Gemini AI</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '20px',
                            backgroundColor: 'var(--background-alt)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                <div
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : 'var(--card-bg)',
                                        color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {msg.content}
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '4px',
                                        textAlign: msg.role === 'user' ? 'right' : 'left'
                                    }}
                                >
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div
                                style={{
                                    alignSelf: 'flex-start',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Loader size={16} color="var(--accent-color)" className="spin" />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            padding: '16px',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            gap: '10px'
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: input.trim() && !isLoading ? 'var(--primary-color)' : 'var(--border-color)',
                                color: 'white',
                                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.3s ease'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Animation keyframes */}
            <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </>
    );
}
