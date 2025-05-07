import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
dotenv.config();

const app = express();

// Enable CORS (allow requests from frontend)
app.use(cors());

// Parse JSON requests (e.g., for POST/PUT requests with JSON bodies)
app.use(express.json());

// Connect to MongoDB using the URI from .env
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});
// Handle 404 Not Found
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  // Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error' });
  });

const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });