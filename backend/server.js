import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import path from 'path';
import redisClient from './utils/redisClient.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON requests

// ✅ Connect to MongoDB
connectDB();

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/admin', adminRoutes);
app.use('/api/product', productRoutes);
app.use('/api/orders', orderRoutes);

// ✅ Logging Middleware
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});
// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('FULL ERROR:', err);
  console.error('ERROR MESSAGE:', err?.message);
  console.error('ERROR NAME:', err?.name);
  res.status(500).json({ message: 'Server error', error: err?.message || String(err) });
});

// ✅ Start server after Redis connects
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await redisClient.connect({
      url: process.env.REDIS_URL,
    });
    console.log('✅ Redis connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Redis connection error:', err);
    process.exit(1);
  }
})();
