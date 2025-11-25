import { Request, Response } from 'express';
import Chat from '../models/chat.model';

// User: Get or create chat session
export const getUserChat = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const userName = req.user.username;

        let chat = await Chat.findOne({ userId });

        if (!chat) {
            chat = await Chat.create({
                userId,
                userName,
                messages: [],
                status: 'active'
            });
        }

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Get user chat error:', error);
        res.status(500).json({ success: false, message: 'Failed to get chat' });
    }
};

// User: Send message to admin
export const sendMessage = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const userName = req.user.username;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        let chat = await Chat.findOne({ userId });

        if (!chat) {
            chat = await Chat.create({
                userId,
                userName,
                messages: [],
                status: 'active'
            });
        }

        chat.messages.push({
            senderId: userId,
            senderName: userName,
            senderRole: 'user',
            message: message.trim(),
            timestamp: new Date(),
            isRead: false
        });

        chat.lastMessageAt = new Date();
        await chat.save();

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

// Admin: Get all chats
export const getAllChats = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const filter: any = {};

        if (status) {
            filter.status = status;
        }

        const chats = await Chat.find(filter).sort({ lastMessageAt: -1 });

        res.json({ success: true, data: chats });
    } catch (error) {
        console.error('Get all chats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get chats' });
    }
};

// Admin: Get single chat by ID
export const getChatById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findById(id);

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Get chat by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to get chat' });
    }
};

// Admin: Reply to user
export const replyToUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        // @ts-ignore
        const adminId = req.user.id;
        // @ts-ignore
        const adminName = req.user.username;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const chat = await Chat.findById(id);

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        chat.messages.push({
            senderId: adminId,
            senderName: adminName,
            senderRole: 'admin',
            message: message.trim(),
            timestamp: new Date(),
            isRead: false
        });

        chat.lastMessageAt = new Date();
        await chat.save();

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Reply to user error:', error);
        res.status(500).json({ success: false, message: 'Failed to send reply' });
    }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const userRole = req.user.role;

        const chat = await Chat.findById(id);

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Mark messages as read based on role
        chat.messages.forEach(msg => {
            if (userRole === 'admin' && msg.senderRole === 'user') {
                msg.isRead = true;
            } else if (userRole === 'user' && msg.senderRole === 'admin') {
                msg.isRead = true;
            }
        });

        await chat.save();

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
};

// Admin: Close chat
export const closeChat = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const chat = await Chat.findByIdAndUpdate(
            id,
            { status: 'closed' },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('Close chat error:', error);
        res.status(500).json({ success: false, message: 'Failed to close chat' });
    }
};

// Get unread message count
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const userRole = req.user.role;

        if (userRole === 'admin') {
            // Count all unread messages from users
            const chats = await Chat.find({ status: 'active' });
            let unreadCount = 0;

            chats.forEach(chat => {
                chat.messages.forEach(msg => {
                    if (msg.senderRole === 'user' && !msg.isRead) {
                        unreadCount++;
                    }
                });
            });

            res.json({ success: true, data: { unreadCount } });
        } else {
            // Count unread messages from admin for this user
            const chat = await Chat.findOne({ userId });
            let unreadCount = 0;

            if (chat) {
                chat.messages.forEach(msg => {
                    if (msg.senderRole === 'admin' && !msg.isRead) {
                        unreadCount++;
                    }
                });
            }

            res.json({ success: true, data: { unreadCount } });
        }
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Failed to get unread count' });
    }
};
