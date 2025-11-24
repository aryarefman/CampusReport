import { Schema, model, Document } from 'mongoose';

export interface IReport extends Document {
    title: string;
    description: string;
    category: 'incident' | 'event' | 'facility' | 'other';
    photoUrl?: string;
    location: {
        lat: number;
        lng: number;
    };
    mapsLink?: string;
    date: Date;
    status: 'pending' | 'in progress' | 'done';
    userId: string;
    adminComments?: Array<{
        comment: string;
        adminName: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, enum: ['incident', 'event', 'facility', 'other'], required: true },
        photoUrl: { type: String },
        location: {
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 },
        },
        mapsLink: { type: String },
        date: { type: Date, required: true },
        status: { type: String, enum: ['pending', 'in progress', 'done'], default: 'pending' },
        userId: { type: String, required: true },
        adminComments: [{
            comment: { type: String, required: true },
            adminName: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true }
);

export default model<IReport>('Report', ReportSchema);
