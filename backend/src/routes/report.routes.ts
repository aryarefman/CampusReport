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
} from '../controllers/report.controller';
import { analyzeImage } from '../controllers/image-analysis.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Image analysis endpoint
router.post('/analyze-image', authenticateToken, analyzeImage);

// Public endpoint to create a report (requires auth for userId)
router.post('/', authenticateToken, createReport);

// Get reports for the authenticated user
router.get('/my-reports', authenticateToken, getMyReports);

// Admin: get report statistics
router.get('/stats', authenticateToken, getReportStats);

// Get single report by ID
// Get reports for a specific user (auth required)
router.get('/user/:userId', authenticateToken, getUserReports);

router.get('/:id', authenticateToken, getReportById);

// Update report (user can only update their own)
router.put('/:id', authenticateToken, updateReport);

// Admin: get all reports (optional status filter)
router.get('/', authenticateToken, getAllReports);

// Admin: update status of a report
router.patch('/:id/status', authenticateToken, updateReportStatus);

// Admin: add comment to a report
router.post('/:id/comment', authenticateToken, addAdminComment);

export default router;
