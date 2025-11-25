import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'admin';
    message: string;
    timestamp: Date;
    isRead: boolean;
}

export interface IChat extends Document {
    userId: string;
    userName: string;
    messages: IMessage[];
    status: 'active' | 'closed';
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const ChatSchema = new Schema<IChat>({
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    messages: [MessageSchema],
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    lastMessageAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model<IChat>('Chat', ChatSchema);
