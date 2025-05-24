import express from 'express';
import { createOrder, getOrderById } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route - requires authentication
router.post('/', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrderById);

export default router;