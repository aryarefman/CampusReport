import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import express from 'express';
import cors from 'cors';

import './config/mongo';
import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/report.routes';
import chatbotRoutes from './routes/chatbot.routes';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  const currentDate = new Date().toISOString();
  res.status(200).json({
    success: true,
    message: 'CampusReport API',
    date: currentDate,
  });
});

app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);
app.use('/chatbot', chatbotRoutes);
app.use('/api/chat', chatRoutes);
app.use('/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});