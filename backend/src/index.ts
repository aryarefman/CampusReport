import dotenv from 'dotenv';
import './config/mongo';
dotenv.config();

import express from 'express';
import path from 'path';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/report.routes';
import chatbotRoutes from './routes/chatbot.routes';

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.resolve(__dirname, '../..', 'uploads');

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CampusReport API'
  });
});

app.get('/health-check', (req, res) => {
  const currentDate = new Date().toDateString();
  res.status(200).json({
    success: true,
    message: 'Hello World!',
    date: currentDate
  });
});

app.use('/auth', authRoutes);
app.use('/uploads', express.static(uploadsDir));
app.use('/reports', reportRoutes);
app.use('/chatbot', chatbotRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});