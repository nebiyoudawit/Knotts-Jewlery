// routes/productRoutes.js
import express from 'express';
import { getProducts, getProductById, addProductReview } from '../controllers/productController.js';

const router = express.Router();

// Product listing - no reviews
router.get('/', getProducts);

// Single product - with reviews
router.get('/:id', getProductById);

router.post('/:id/reviews', addProductReview);

export default router;