import { Schema, model, Document } from 'mongoose';

export interface IReport extends Document {
    title: string;
    description: string;
    photoUrl?: string;
    location: {
        lat: number;
        lng: number;
    };
    status: 'pending' | 'in progress' | 'done';
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        photoUrl: { type: String },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        status: { type: String, enum: ['pending', 'in progress', 'done'], default: 'pending' },
        userId: { type: String, required: true },
    },
    { timestamps: true }
);

export default model<IReport>('Report', ReportSchema);
