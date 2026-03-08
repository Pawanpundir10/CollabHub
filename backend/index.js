import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import joinRequestRoutes from './routes/joinRequests.js';
import { setupSocket } from './socket/chat.js';
import Message from './models/Message.js';
import { verifyToken } from './middleware/auth.js';
const app = express();
const httpServer = createServer(app);

// Enable CORS for frontend to reach backend
const allowedOrigins = [
  'http://localhost:5173', // Vite standard dev
  'http://localhost:8080', // Alternate dev
  process.env.CLIENT_URL, // Production Vercel injected URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Required for httpOnly cookies
}));

app.use(express.json());
app.use(cookieParser());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collabhub';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    credentials: true
  }
});
setupSocket(io);

// Specialized message history route (since it doesn't quite fit in groups.js directly)
app.get('/api/groups/:id/messages', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.id })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', joinRequestRoutes); // The routes expects '/:id/request' so we mount it on '/api/groups'

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
