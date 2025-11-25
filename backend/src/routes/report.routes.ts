// src/routes/report.routes.ts
import { Router } from 'express';
import {
    createReport,
    getMyReports,
    getUserReports,
    getAllReports,
    updateReportStatus,
    getReportStats,
    getReportById,
    updateReport,
    addAdminComment,
    deleteAdminComment,
    getAnalytics,
    getRecentActivity,
    exportReports
} from '../controllers/report.controller';
import { analyzeImage } from '../controllers/image-analysis.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Image analysis endpoint
router.post('/analyze-image', authenticateToken, analyzeImage);

// Public report creation (requires auth)
router.post('/', authenticateToken, createReport);

// User-specific endpoints
router.get('/my-reports', authenticateToken, getMyReports);
router.get('/user/:userId', authenticateToken, getUserReports);

// Admin statistics and analytics (must be before generic routes)
router.get('/stats', authenticateToken, getReportStats);
router.get('/analytics', authenticateToken, getAnalytics);
router.get('/activity', authenticateToken, getRecentActivity);
router.get('/export', authenticateToken, exportReports);

// Report CRUD operations
router.get('/:id', authenticateToken, getReportById);
router.put('/:id', authenticateToken, updateReport);
router.patch('/:id/status', authenticateToken, updateReportStatus);
router.post('/:id/comment', authenticateToken, addAdminComment);
router.delete('/:id/comment/:commentId', authenticateToken, deleteAdminComment);

// Admin: get all reports (optional filters)
router.get('/', authenticateToken, getAllReports);

export default router;
