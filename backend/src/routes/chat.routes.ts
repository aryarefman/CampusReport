import { Router } from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, sendMessage);
router.get('/', authenticateToken, getMessages);
router.get('/conversations', authenticateToken, getConversations); // Admin only
router.get('/:otherUserId', authenticateToken, getMessages);

export default router;
