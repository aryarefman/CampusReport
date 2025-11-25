import { Router } from 'express';
import {
    getUserChat,
    sendMessage,
    getAllChats,
    getChatById,
    replyToUser,
    markAsRead,
    closeChat,
    getUnreadCount
} from '../controllers/chat.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// User routes
router.get('/my-chat', authenticateToken, getUserChat);
router.post('/send', authenticateToken, sendMessage);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.put('/:id/read', authenticateToken, markAsRead);

// Admin routes
router.get('/all', authenticateToken, requireAdmin, getAllChats);
router.get('/:id', authenticateToken, getChatById);
router.post('/:id/reply', authenticateToken, requireAdmin, replyToUser);
router.put('/:id/close', authenticateToken, requireAdmin, closeChat);

export default router;
