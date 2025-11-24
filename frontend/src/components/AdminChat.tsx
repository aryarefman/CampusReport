import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { Send, User, Search } from 'lucide-react';

interface Message {
    _id: string;
    sender: string;
    receiver: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

interface Conversation {
    user: {
        _id: string;
        username: string;
        email: string;
    };
    lastMessage: Message;
    unreadCount: number;
}

export default function AdminChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser);
            const interval = setInterval(() => fetchMessages(selectedUser), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const data = await apiService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const data = await apiService.getMessages(userId);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            setLoading(true);
            // For admin, we need to specify the receiver (the user)
            // The backend sendMessage controller expects 'receiver' in body
            await apiService.sendMessage(newMessage, selectedUser);
            setNewMessage('');
            await fetchMessages(selectedUser);
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Sidebar - Conversations List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Conversations</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No conversations yet
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.user._id}
                                onClick={() => setSelectedUser(conv.user._id)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedUser === conv.user._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">{conv.user.username}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{conv.lastMessage.content}</p>
                                {conv.unreadCount > 0 && (
                                    <span className="inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full mt-2">
                                        {conv.unreadCount} new
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {conversations.find(c => c.user._id === selectedUser)?.user.username || 'User'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {conversations.find(c => c.user._id === selectedUser)?.user.email}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                // In admin view:
                                // If sender is NOT the selected user (meaning it's the admin/me), align right.
                                // If sender IS the selected user, align left.
                                // Wait, if I am admin, my ID is in req.user.id.
                                // But the message object has sender ID.
                                // If sender === selectedUser, it's incoming.
                                const isMe = msg.sender !== selectedUser;

                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !newMessage.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <User size={48} className="mb-4 opacity-20" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
