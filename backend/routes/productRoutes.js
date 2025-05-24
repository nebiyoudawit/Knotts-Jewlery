// routes/productRoutes.js
import express from 'express';
import { getProducts, getProductById, addProductReview, getSortedProducts } from '../controllers/productController.js';

const router = express.Router();

//Home page - product Sliders
router.get('/sorted', getSortedProducts);

// Product listing - no reviews
router.get('/', getProducts);

// Single product - with reviews
router.get('/:id', getProductById);

router.post('/:id/reviews', addProductReview);

export default router;