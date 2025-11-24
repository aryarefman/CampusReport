import { Request, Response } from 'express';
import Report from '../models/report.model';
import { upload } from '../middleware/upload';

// Create a new report (with image upload)
export const createReport = [
    upload.single('photo'),
    async (req: Request, res: Response) => {
        try {
            const { title, description, lat, lng, userId } = req.body;
            const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

            const report = await Report.create({
                title,
                description,
                photoUrl,
                location: { lat: Number(lat), lng: Number(lng) },
                userId,
                status: 'pending',
            });

            res.status(201).json({ success: true, data: report });
        } catch (error) {
            console.error('Create report error:', error);
            res.status(500).json({ success: false, message: 'Failed to create report' });
        }
    },
];

// Get reports for the authenticated user
export const getMyReports = async (req: Request, res: Response) => {
    try {
        // @ts-ignore - user is attached by middleware
        const userId = req.user.id;
        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Get my reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
};

// Get reports for a specific user (Admin or specific use case)
export const getUserReports = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Get user reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
};

// Admin: get all reports (optional filter by status)
export const getAllReports = async (req: Request, res: Response) => {
    try {
        const { status } = req.query as { status?: string };
        const filter = status ? { status } : {};
        const reports = await Report.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Get all reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
};

// Admin: update status of a report
export const updateReportStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};
// Admin: get report statistics
export const getReportStats = async (req: Request, res: Response) => {
    try {
        const total = await Report.countDocuments();
        const pending = await Report.countDocuments({ status: 'pending' });
        const inProgress = await Report.countDocuments({ status: 'in progress' });
        const done = await Report.countDocuments({ status: 'done' });

        res.json({
            success: true,
            data: {
                total,
                pending,
                inProgress,
                done,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};
