import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { upload } from '../middleware/upload';
import fs from 'fs';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
});

// Analyze image and return description
export const analyzeImage = [
    upload.single('image'),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Image file is required'
                });
            }

            console.log('Analyzing image:', req.file.filename);

            // Read the image file
            const imagePath = req.file.path;
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');

            // Call Gemini Vision API
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `Analyze this image carefully and provide a detailed, professional description for a campus facility report system.

Your description should:
1. Identify the main subject or issue in the image (e.g., damaged facility, event, incident, or general observation)
2. Describe specific details: condition, location characteristics, severity (if applicable)
3. Note any safety concerns or urgency indicators
4. Mention relevant context (time of day, weather conditions if visible, people involved if any)
5. Use clear, objective language suitable for official documentation

Format your response as a cohesive paragraph (150-200 words) that would help administrators understand the situation without seeing the image. Be specific and factual, avoiding assumptions.`
                            },
                            {
                                inlineData: {
                                    mimeType: req.file.mimetype,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ]
            });

            const description = response.text;

            console.log('AI Description generated');

            // Clean up the uploaded file (optional, or keep it for the report)
            // fs.unlinkSync(imagePath);

            return res.json({
                success: true,
                data: {
                    description,
                    photoUrl: `/uploads/${req.file.filename}`
                }
            });

        } catch (error: any) {
            console.error('=== IMAGE ANALYSIS ERROR ===');
            console.error('Error:', error);
            console.error('Message:', error?.message);
            console.error('===========================');

            return res.status(500).json({
                success: false,
                message: error?.message || 'Failed to analyze image',
                error: error?.message || 'Unknown error'
            });
        }
    }
];
