import { Request, Response } from 'express';
import Message from '../models/message.model';
import { AuthRequest } from '../types';

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { content, receiver } = req.body;
        const sender = req.user!.id;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        const message = await Message.create({
            sender,
            receiver: receiver || 'admin',
            content,
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { otherUserId } = req.params; // If admin is viewing a user's chat

        let query: any = {};

        if (req.user!.role === 'admin' && otherUserId) {
            // Admin viewing conversation with a specific user
            query = {
                $or: [
                    { sender: otherUserId, receiver: 'admin' },
                    { sender: userId, receiver: otherUserId } // Admin sending to user (if we implement admin replies as direct messages)
                ]
            };
            // Actually, for "Chat with Admin", the receiver is 'admin'.
            // When admin replies, sender is admin (userId), receiver is user (otherUserId).
            // When user sends, sender is user (otherUserId), receiver is 'admin'.
            query = {
                $or: [
                    { sender: otherUserId, receiver: 'admin' },
                    { sender: userId, receiver: otherUserId }
                ]
            };
        } else {
            // User viewing their own chat with admin
            query = {
                $or: [
                    { sender: userId, receiver: 'admin' },
                    { sender: 'admin', receiver: userId } // Assuming admin has an ID but sends as 'admin' role? 
                    // Wait, if admin is a user, they have an ID.
                    // Let's assume admin replies are stored with sender=admin_id and receiver=user_id.
                    // But the user sends to 'admin'.
                ]
            };

            // To simplify, let's say:
            // User -> Admin: sender=userId, receiver='admin'
            // Admin -> User: sender=adminId, receiver=userId

            // So for a user, we want messages where (sender=userId AND receiver='admin') OR (receiver=userId)
            query = {
                $or: [
                    { sender: userId, receiver: 'admin' },
                    { receiver: userId }
                ]
            };
        }

        const messages = await Message.find(query).sort({ timestamp: 1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to get messages' });
    }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        // Only for admin
        if (req.user!.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Find all messages sent to 'admin'
        const messages = await Message.find({ receiver: 'admin' }).populate('sender', 'username email');

        // Group by sender
        const conversations: any = {};
        messages.forEach((msg: any) => {
            if (!conversations[msg.sender._id]) {
                conversations[msg.sender._id] = {
                    user: msg.sender,
                    lastMessage: msg,
                    unreadCount: 0
                };
            }
            // Update last message
            if (new Date(msg.timestamp) > new Date(conversations[msg.sender._id].lastMessage.timestamp)) {
                conversations[msg.sender._id].lastMessage = msg;
            }
            if (!msg.isRead) {
                conversations[msg.sender._id].unreadCount++;
            }
        });

        res.json({ success: true, data: Object.values(conversations) });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: 'Failed to get conversations' });
    }
}
