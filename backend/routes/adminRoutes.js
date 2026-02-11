import express from 'express';
import {
  getDashboardStats,
  getEnhancedDashboardStats,
  getMonthlyAnalytics,
  getRealTimeUpdates,
  getAdminProducts,
  getAdminProductById,
  addAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders, 
  getAdminOrderById, 
  updateAdminOrderStatus, 
  deleteAdminOrder, 
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  updateOrderPaymentStatus,
  updateProductSales
} from '../controllers/adminController.js';

import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploads.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware, adminMiddleware);

// ---------------- DASHBOARD ROUTES ----------------
router.get('/', getDashboardStats);  // Legacy endpoint
router.get('/enhanced', getEnhancedDashboardStats);  // New enhanced dashboard
router.get('/analytics', getMonthlyAnalytics);
router.get('/updates', getRealTimeUpdates);

// ---------------- PRODUCT ROUTES ----------------
router.get('/products', getAdminProducts);
router.get('/products/:id', getAdminProductById);
router.post('/products', upload.array('images'), addAdminProduct);
router.put('/products/:id', upload.array('images'), updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

// ---------------- USER ROUTES ----------------
router.get('/users', getUsers);
router.post('/users', addUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ---------------- ORDER ROUTES ----------------
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', updateAdminOrderStatus); 
router.put('/orders/:id/payment', updateOrderPaymentStatus); 
router.put('/products/:id/sales', updateProductSales); 
router.delete('/orders/:id', deleteAdminOrder);

export default router;