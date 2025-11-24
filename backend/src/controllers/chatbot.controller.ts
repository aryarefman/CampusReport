import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import Report from '../models/report.model';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
});

export const chat = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        const userId = (req as any).user?.id;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        console.log('Processing chat message:', message);

        // Fetch relevant data from database
        const allReports = await Report.find().sort({ createdAt: -1 }).limit(50);
        const userReports = userId ? await Report.find({ userId }).sort({ createdAt: -1 }).limit(10) : [];

        // Calculate statistics
        const stats = {
            total: await Report.countDocuments(),
            pending: await Report.countDocuments({ status: 'pending' }),
            inProgress: await Report.countDocuments({ status: 'in progress' }),
            done: await Report.countDocuments({ status: 'done' })
        };

        console.log('Stats:', stats);

        // Build context for AI
        const contextMessage = `You are a helpful assistant for CampusReport.

Current Statistics:
- Total Reports: ${stats.total}
- Pending: ${stats.pending}
- In Progress: ${stats.inProgress}
- Completed: ${stats.done}

Recent Reports: ${allReports.slice(0, 5).map(r => r.title).join(', ')}

Answer the user's question concisely in under 100 words.

User Question: ${message}`;

        // Generate AI response using @google/genai syntax
        console.log('Calling Gemini API...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contextMessage
        });

        const aiMessage = response.text;

        console.log('AI Response received');

        return res.json({
            success: true,
            data: {
                message: aiMessage,
                timestamp: new Date()
            }
        });

    } catch (error: any) {
        console.error('=== CHATBOT ERROR ===');
        console.error('Error:', error);
        console.error('Message:', error?.message);
        console.error('===================');

        return res.status(500).json({
            success: false,
            message: error?.message || 'Failed to process chat message',
            error: error?.message || 'Unknown error'
        });
    }
};
