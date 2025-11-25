import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUserStats, getPriorityReports } from '../controllers/user.controller';

const router = Router();

// Admin routes
router.get('/stats', authenticateToken, getUserStats);
router.get('/priority-reports', authenticateToken, getPriorityReports);

export default router;
