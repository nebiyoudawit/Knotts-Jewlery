import express from 'express';

// Import from separate admin controller files
import {
  getEnhancedDashboardStats,
  getRealTimeUpdates
} from '../controllers/adminController/dashboardController.js';

import {
  getAdminProducts,
  getAdminProductById,
  addAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
} from '../controllers/adminController/productController.js';

import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  deleteAdminOrder,
  updateOrderPaymentStatus
} from '../controllers/adminController/orderController.js';

import {
  getUsers,
  addUser,
  updateUser,
  deleteUser
} from '../controllers/adminController/userController.js';

// This one is in productController.js
import { updateProductSales } from '../controllers/adminController/productController.js';

import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploads.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware, adminMiddleware);

// ---------------- DASHBOARD ROUTES ----------------
router.get('/enhanced', getEnhancedDashboardStats);  // New enhanced dashboard
router.get('/updates', getRealTimeUpdates);

// ---------------- PRODUCT ROUTES ----------------
router.get('/products', getAdminProducts);
router.get('/products/:id', getAdminProductById);
router.post('/products', upload.array('images'), addAdminProduct);
router.put('/products/:id', upload.array('images'), updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);
router.put('/products/:id/sales', updateProductSales); // Moved here from orders

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
router.delete('/orders/:id', deleteAdminOrder);

export default router;