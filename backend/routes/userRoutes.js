import express from 'express';
import { 
  updateUserProfile, 
  changeUserPassword 
} from '../controllers/userController.js';
import { 
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} from '../controllers/cartControllers.js';
import { 
  getWishlist,
  toggleWishlist,
  checkWishlist
} from '../controllers/wishlistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// User profile routes
router.put('/update', authMiddleware, updateUserProfile);
router.put('/change-password', authMiddleware, changeUserPassword);

// Cart routes
router.get('/cart', authMiddleware, getCart);
router.post('/cart', authMiddleware, addToCart);
router.put('/cart/:productId', authMiddleware, updateCartItem);
router.delete('/cart/:productId', authMiddleware, removeFromCart);

// Wishlist routes
router.get('/wishlist', authMiddleware, getWishlist);
router.post('/wishlist/:productId', authMiddleware, toggleWishlist);
router.get('/wishlist/check/:productId', authMiddleware, checkWishlist);

export default router;