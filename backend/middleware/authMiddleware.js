import jwt from 'jsonwebtoken';
import User from '../models/users.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user with token version check
    const user = await User.findOne({
      _id: decoded.id,
      tokenVersion: decoded.tokenVersion
    }).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found or token revoked' 
      });
    }

    // Attach the user to the request object
    req.user = user;
    next();

  } catch (err) {
    console.error('Authentication error:', err.message);
    
    const message = err.name === 'TokenExpiredError' 
      ? 'Token expired' 
      : 'Invalid token';
    
    return res.status(401).json({ 
      success: false,
      message 
    });
  }
};

// Separate admin middleware for better separation of concerns
export const adminMiddleware = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
  next();
};