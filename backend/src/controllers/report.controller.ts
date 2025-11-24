import { Request, Response } from 'express';
import Report from '../models/report.model';
import { upload } from '../middleware/upload';

// Create a new report (with image upload)
export const createReport = [
    upload.single('photo'),
    async (req: Request, res: Response) => {
        try {
            const { title, description, category, lat, lng, mapsLink, date, userId } = req.body;
            const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

            const report = await Report.create({
                title,
                description,
                category,
                photoUrl,
                location: {
                    lat: lat ? Number(lat) : 0,
                    lng: lng ? Number(lng) : 0
                },
                mapsLink,
                date: date || new Date(),
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

// Get single report by ID
export const getReportById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Get report by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch report' });
    }
};

// Update report (user can only update their own reports)
export const updateReport = [
    upload.single('photo'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            // @ts-ignore - user is attached by middleware
            const userId = req.user.id;
            const { title, description, category, lat, lng, mapsLink, date } = req.body;

            // Find the report
            const report = await Report.findById(id);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Report not found' });
            }

            // Check if user owns this report
            if (report.userId !== userId) {
                return res.status(403).json({ success: false, message: 'You can only edit your own reports' });
            }

            // Update fields
            const updateData: any = {};
            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (category) updateData.category = category;
            if (mapsLink !== undefined) updateData.mapsLink = mapsLink;
            if (date) updateData.date = date;
            if (lat !== undefined || lng !== undefined) {
                updateData.location = {
                    lat: lat ? Number(lat) : report.location.lat,
                    lng: lng ? Number(lng) : report.location.lng
                };
            }
            if (req.file) {
                updateData.photoUrl = `/uploads/${req.file.filename}`;
            }

            const updated = await Report.findByIdAndUpdate(id, updateData, { new: true });
            res.json({ success: true, data: updated });
        } catch (error) {
            console.error('Update report error:', error);
            res.status(500).json({ success: false, message: 'Failed to update report' });
        }
    }
];

// Admin: add comment to a report
export const addAdminComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        // @ts-ignore - user is attached by middleware
        const adminName = req.user.username || 'Admin';

        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Comment is required' });
        }

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Add comment to array
        if (!report.adminComments) {
            report.adminComments = [];
        }

        report.adminComments.push({
            comment: comment.trim(),
            adminName,
            timestamp: new Date()
        });

        await report.save();

        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
};

