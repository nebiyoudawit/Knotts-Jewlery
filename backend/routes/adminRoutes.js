import express from 'express';
import {
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
  deleteUser
} from '../controllers/adminController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploads.js'; // ✅ Import upload middleware

const router = express.Router();

// Apply authentication + admin check to all routes
router.use(authMiddleware);

// ---------------- PRODUCT ROUTES ----------------
router.get('/products', getAdminProducts);
router.get('/products/:id', getAdminProductById);
router.post('/products', upload.array('images'), addAdminProduct); // ✅ Add multer to handle image uploads
router.put('/products/:id', upload.array('images'), updateAdminProduct); // ✅ Same for updates
router.delete('/products/:id', deleteAdminProduct);

// ---------------- USER ROUTES ----------------
router.get('/users', getUsers);
router.post('/users', addUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Get all orders
router.get('/orders', getAdminOrders);

// Get a specific order by ID
router.get('/orders/:id', getAdminOrderById);

// Update order status
router.put('/orders/:id/status', updateAdminOrderStatus);

// Delete an order
router.delete('/orders/:id', deleteAdminOrder);

export default router;
