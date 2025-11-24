import { Router } from 'express';
import {
    createReport,
    getMyReports,
    getUserReports,
    getAllReports,
    updateReportStatus,
    getReportStats,
} from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public endpoint to create a report (requires auth for userId)
router.post('/', authenticateToken, createReport);

// Get reports for the authenticated user
router.get('/my-reports', authenticateToken, getMyReports);

// Admin: get report statistics
router.get('/stats', authenticateToken, getReportStats);

// Get reports for a specific user (auth required)
router.get('/user/:userId', authenticateToken, getUserReports);

// Admin: get all reports (optional status filter)
router.get('/', authenticateToken, getAllReports);

// Admin: update status of a report
router.patch('/:id/status', authenticateToken, updateReportStatus);

export default router;
