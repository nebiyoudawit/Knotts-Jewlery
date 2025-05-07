import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Verify token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};