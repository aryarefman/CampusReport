import { Request, Response } from 'express';
import User from '../models/user.model';
import Report from '../models/report.model';

// Get user statistics (Admin only)
export const getUserStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();

        // Active users (users who created reports in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentReports = await Report.find({
            createdAt: { $gte: thirtyDaysAgo }
        }).distinct('userId');

        const activeUsers = recentReports.length;

        // Top contributors (users with most reports)
        const topContributors = await Report.aggregate([
            {
                $group: {
                    _id: '$userId',
                    reportCount: { $sum: 1 }
                }
            },
            { $sort: { reportCount: -1 } },
            { $limit: 10 }
        ]);

        // Get user details for top contributors
        const topContributorsWithDetails = await Promise.all(
            topContributors.map(async (contributor) => {
                const user = await User.findOne({ _id: contributor._id }).select('username email');
                return {
                    userId: contributor._id,
                    username: user?.username || 'Unknown',
                    email: user?.email || 'Unknown',
                    reportCount: contributor.reportCount
                };
            })
        );

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                topContributors: topContributorsWithDetails
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user statistics' });
    }
};

// Get priority reports (critical and high priority that are pending or in progress)
export const getPriorityReports = async (req: Request, res: Response) => {
    try {
        const priorityReports = await Report.find({
            priority: { $in: ['critical', 'high'] },
            status: { $in: ['pending', 'in progress'] }
        }).sort({ priority: -1, createdAt: -1 }).limit(20);

        res.json({
            success: true,
            data: priorityReports
        });
    } catch (error) {
        console.error('Get priority reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch priority reports' });
    }
};
