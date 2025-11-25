import { Request, Response } from 'express';
import Report from '../models/report.model';
import { upload } from '../middleware/upload';

// Auto-response templates based on category
const getAutoResponseTemplate = (category: string): string => {
    const templates: { [key: string]: string } = {
        'facility': 'Terima kasih telah melaporkan kerusakan fasilitas. Tim teknisi kami akan segera memeriksa dan memperbaiki masalah ini. Kami akan memberikan update progress perbaikan secara berkala.',
        'incident': 'Laporan insiden Anda telah kami terima. Tim keamanan kampus akan segera menindaklanjuti dan melakukan investigasi. Keamanan dan keselamatan adalah prioritas utama kami.',
        'event': 'Terima kasih atas laporan terkait event/kegiatan. Tim manajemen kampus akan meninjau dan mengkoordinasikan hal ini dengan pihak terkait. Kami akan segera memberikan konfirmasi lebih lanjut.',
        'other': 'Laporan Anda telah kami terima dan akan segera ditindaklanjuti oleh tim yang berwenang. Terima kasih atas partisipasi Anda dalam meningkatkan kualitas kampus.'
    };

    return templates[category] || templates['other'];
};

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
                adminComments: [
                    {
                        comment: getAutoResponseTemplate(category),
                        adminName: 'System Admin',
                        timestamp: new Date()
                    }
                ]
            });

            res.status(201).json({ success: true, data: report });
        } catch (error) {
            console.error('Create report error:', error);
            res.status(500).json({ success: false, message: 'Failed to create report' });
        }
    },
];

// Helper to build query filters
const buildFilter = (query: any) => {
    const { search, category, status, priority, startDate, endDate } = query;
    const filter: any = {};

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return filter;
};

// Get reports for the authenticated user
export const getMyReports = async (req: Request, res: Response) => {
    try {
        // @ts-ignore - user is attached by middleware
        const userId = req.user.id;
        const filter = buildFilter(req.query);
        filter.userId = userId;

        const reports = await Report.find(filter).sort({ createdAt: -1 });
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

// Admin: get all reports (with advanced filters)
export const getAllReports = async (req: Request, res: Response) => {
    try {
        const filter = buildFilter(req.query);
        const reports = await Report.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Get all reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
};

// Auto-response templates for status changes
const getStatusChangeTemplate = (status: string, category: string): string => {
    const templates: { [key: string]: string } = {
        'in progress': `Laporan Anda sedang dalam proses penanganan. ${category === 'facility' ? 'Tim teknisi kami sedang bekerja untuk memperbaiki masalah ini.' :
            category === 'incident' ? 'Tim keamanan sedang melakukan investigasi dan penanganan.' :
                category === 'event' ? 'Tim manajemen sedang mengkoordinasikan kegiatan ini.' :
                    'Tim kami sedang menangani laporan Anda.'
            } Terima kasih atas kesabaran Anda.`,
        'done': `Laporan Anda telah selesai ditangani. ${category === 'facility' ? 'Perbaikan fasilitas telah diselesaikan oleh tim teknisi kami.' :
            category === 'incident' ? 'Insiden telah ditangani dan diselesaikan oleh tim keamanan.' :
                category === 'event' ? 'Koordinasi kegiatan telah selesai dilakukan.' :
                    'Penanganan laporan Anda telah selesai.'
            } Terima kasih atas laporan dan partisipasi Anda dalam meningkatkan kualitas kampus!`
    };

    return templates[status] || '';
};

// Admin: update status, priority, or assignment of a report
export const updateReportStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo } = req.body;

        // Get current report to check status change
        const currentReport = await Report.findById(id);
        if (!currentReport) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignedTo = assignedTo;

        // Add auto-comment if status changed to 'in progress' or 'done'
        if (status && status !== currentReport.status && (status === 'in progress' || status === 'done')) {
            const autoComment = {
                comment: getStatusChangeTemplate(status, currentReport.category),
                adminName: 'System Admin',
                timestamp: new Date()
            };

            updateData.$push = { adminComments: autoComment };
        }

        const updated = await Report.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update report' });
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

// Admin: delete a comment from a report
export const deleteAdminComment = async (req: Request, res: Response) => {
    try {
        const { id, commentId } = req.params;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        if (!report.adminComments) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Filter out the comment to delete
        // @ts-ignore - Mongoose subdocuments have _id
        report.adminComments = report.adminComments.filter(c => c._id.toString() !== commentId);

        await report.save();

        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
};

// Analytics: get detailed statistics for charts
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const isAdmin = req.user.role === 'admin'; // Assuming role is available

        // If not admin, restrict to own reports? 
        // For now, let's make two modes: global (for admin) and personal (for user)
        // We'll check query param 'scope'
        const { scope } = req.query;
        const matchStage = (scope === 'personal' || !isAdmin) ? { userId } : {};

        // 1. Reports per month (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Report.aggregate([
            { $match: { ...matchStage, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // 2. Reports by Category
        const categoryStats = await Report.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Reports by Status
        const statusStats = await Report.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Reports by Priority
        const priorityStats = await Report.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 5. Resolution Time Analytics (Avg hours to resolve)
        // Only for 'done' reports
        const resolutionStats = await Report.aggregate([
            { $match: { ...matchStage, status: 'done' } },
            {
                $project: {
                    duration: { $subtract: ['$updatedAt', '$createdAt'] }
                }
            },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' }
                }
            }
        ]);

        const avgResolutionHours = resolutionStats.length > 0
            ? Math.round(resolutionStats[0].avgDuration / (1000 * 60 * 60))
            : 0;

        // 6. Category Performance (Completion Rate)
        const categoryPerformance = await Report.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: 1 },
                    resolved: {
                        $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
                    },
                    avgRating: { $avg: '$rating' }
                }
            },
            {
                $project: {
                    category: '$_id',
                    total: 1,
                    resolved: 1,
                    completionRate: {
                        $multiply: [{ $divide: ['$resolved', '$total'] }, 100]
                    },
                    avgRating: { $ifNull: [{ $round: ['$avgRating', 1] }, 0] }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                monthly: monthlyStats.map(item => ({
                    name: `${item._id.month}/${item._id.year}`,
                    count: item.count
                })),
                category: categoryStats.map(item => ({
                    name: item._id,
                    value: item.count
                })),
                status: statusStats.map(item => ({
                    name: item._id,
                    value: item.count
                })),
                priority: priorityStats.map(item => ({
                    name: item._id || 'medium', // Default to medium if null
                    value: item.count
                })),
                performance: {
                    avgResolutionHours,
                    categoryPerformance: categoryPerformance.map(item => ({
                        name: item._id,
                        completionRate: Math.round(item.completionRate),
                        avgRating: item.avgRating,
                        total: item.total,
                        resolved: item.resolved
                    }))
                }
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
};

// Admin: Get recent activity feed
export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        // 1. New Reports
        const newReports = await Report.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title createdAt category status userId');

        // 2. Recent Comments
        // We need to unwind adminComments to sort them
        const recentComments = await Report.aggregate([
            { $unwind: '$adminComments' },
            { $sort: { 'adminComments.timestamp': -1 } },
            { $limit: 10 },
            {
                $project: {
                    title: 1,
                    comment: '$adminComments.comment',
                    adminName: '$adminComments.adminName',
                    timestamp: '$adminComments.timestamp',
                    type: 'comment'
                }
            }
        ]);

        // Combine and sort
        const activities = [
            ...newReports.map(r => ({
                id: r._id,
                type: 'new_report',
                title: r.title,
                date: r.createdAt,
                details: `New ${r.category} report submitted`
            })),
            ...recentComments.map(c => ({
                id: c._id,
                type: 'comment',
                title: c.title,
                date: c.timestamp,
                details: `Admin ${c.adminName} commented: "${c.comment.substring(0, 30)}${c.comment.length > 30 ? '...' : ''}"`
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 20);

        res.json({ success: true, data: activities });
    } catch (error) {
        console.error('Activity feed error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch activity feed' });
    }
};

// Admin: Export reports to CSV
export const exportReports = async (req: Request, res: Response) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });

        // CSV Header
        const fields = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Date', 'Location (Lat,Lng)', 'Description', 'Admin Comments'];
        let csv = fields.join(',') + '\n';

        // CSV Rows
        reports.forEach(report => {
            const comments = report.adminComments?.map(c => `${c.adminName}: ${c.comment}`).join(' | ') || '';
            const row = [
                report._id,
                `"${report.title.replace(/"/g, '""')}"`, // Escape quotes
                report.category,
                report.status,
                report.priority || 'medium',
                new Date(report.date || report.createdAt).toISOString().split('T')[0],
                `"${report.location.lat},${report.location.lng}"`,
                `"${report.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`, // Escape quotes and newlines
                `"${comments.replace(/"/g, '""')}"`
            ];
            csv += row.join(',') + '\n';
        });

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=reports_export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, message: 'Failed to export reports' });
    }
};
