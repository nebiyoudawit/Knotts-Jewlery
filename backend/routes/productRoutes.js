// routes/productRoutes.js
import express from 'express';
import { getProducts, getProductById, addProductReview, getSortedProducts, getProductsByCategory } from '../controllers/productController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';


const router = express.Router();

//Home page - product Sliders
router.get('/sorted', getSortedProducts);

// Product listing - no reviews
router.get('/', getProducts);

router.get('/category/:category', getProductsByCategory);


// Single product - with reviews
router.get('/:id', getProductById);

// 🔐 Protect this route so only logged-in users can add reviews
router.post('/:id/reviews', authMiddleware, addProductReview);

export default router;