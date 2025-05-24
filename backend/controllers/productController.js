import Product from '../models/products.js';
import productListingDTO from '../Dtos/productListingdto.js';
import productDetailsDTO from '../Dtos/productDetailsDto.js';
import mongoose from 'mongoose';


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

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error sorting products:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve sorted products' });
  }
};




// Get all products - listing (no reviews or full description)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().select('-reviews -description');
    const response = products.map(productListingDTO);

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

// Add a review to a product
export const addProductReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id || 'Anonymous';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID'
    });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be a number between 1 and 5'
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const newReview = {
      user: userId,
      rating,
      comment
    };

    product.reviews.push(newReview);

    const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = parseFloat((totalRatings / product.reviews.length).toFixed(1));
    product.reviewCount = product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: newReview,
      updatedProduct: {
        rating: product.rating,
        reviewCount: product.reviewCount
      }
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};
