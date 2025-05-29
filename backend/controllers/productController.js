import Product from '../models/products.js';
import productListingDTO from '../Dtos/productListingdto.js';
import productDetailsDTO from '../Dtos/productDetailsDto.js';
import mongoose from 'mongoose';
import Review from '../models/review.js';
import redisClient from '../utils/redisClient.js';
// Get sorted products for home page - product sliders
// This endpoint is used to fetch products sorted by latest or bestsellers
export const getSortedProducts = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'latest';
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    let sortOptions = {};

    if (sortBy === 'bestsellers') {
      sortOptions = { sales: -1 };
    } else if (sortBy === 'latest') {
      sortOptions = { createdAt: -1 };
    }

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    const products = await Product.find(filter).sort(sortOptions).limit(limit);

    // Apply DTO to each product
    const formattedProducts = products.map(productListingDTO);

    res.status(200).json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Error sorting products:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve sorted products' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const search = req.query.search || '';
    const filter = {};
    const cacheKey = `products:search:${search}`;

    // 1. Check Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        cached: true,
      });
    }

    // 2. Not in cache — query MongoDB
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter).select('-reviews -description');
    const response = products.map(productListingDTO);

    // 3. Cache the result
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response)); 

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product by ID with reviews
export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID'
    });
  }

  try {
    const product = await Product.findById(id).populate('reviews');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const response = productDetailsDTO(product);

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Get products by category with For the Related Products section
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find({ category }).limit(limit);

    // Apply productListingDTO to each product
    const formattedProducts = products.map(productListingDTO);

    res.status(200).json({
      success: true,
      data: formattedProducts,
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products',
    });
  }
};

// Add a review to a product
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const userId = req.user?.id || null; // Use null if not authenticated
    const userName = req.user?.name || 'Anonymous';

    // Create and save review
    const newReview = await Review.create({
      user: userId,
      name: userName,
      product: productId,
      rating,
      comment,
    });

    // Push ONLY the ObjectId
    product.reviews.push(newReview._id);

    // Recalculate rating
    const allReviews = await Review.find({ product: productId });
    const reviewCount = allReviews.length;
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    product.reviewCount = reviewCount;
    product.rating = averageRating;

    await product.save();
    await redisClient.del(`products:search:`);
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        _id: newReview._id,
        rating: newReview.rating,
        comment: newReview.comment,
        user: userName,
      },
      updatedProduct: {
        rating: product.rating,
        reviewCount: product.reviewCount,
      },
    });
  } catch (error) {
    console.error('Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message,
    });
  }
};
