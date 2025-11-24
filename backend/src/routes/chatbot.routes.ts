import { Router } from 'express';
import { chat } from '../controllers/chatbot.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/chat', authenticateToken, chat);

export default router;
