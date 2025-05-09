import Product from '../models/products.js';
import productListingDTO from '../Dtos/productListingdto.js';
import productDetailsDTO from '../Dtos/productDetailsDto.js';
import mongoose from 'mongoose';


// For listing - no reviews
export const getProducts = async (req, res) => {
    try {
      const products = await Product.find().select('-reviews -description');
      const response = products.map(productListingDTO);
      
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  // For single product - with reviews
  export const getProductById = async (req, res) => {
    const { id } = req.params; // Get the product ID from the URL parameters
    console.log('Product ID:', id);
  
    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
  
    try {
      // Fetch the product by ID from the database
      const product = await Product.findById(id).populate('reviews');
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Map the product to the DTO format
      const response = productDetailsDTO(product);
  
      res.status(200).json({ data: response });
    } catch (error) {
      console.error('Error details:', error);  // Log the complete error object
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  export const addProductReview = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
  
      const newReview = {
        user: req.user?.id || 'Anonymous', // Assuming you have user authentication
        rating: req.body.rating,
        comment: req.body.comment
      };
  
      product.reviews.push(newReview);
      
      // Recalculate average rating
      const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.rating = totalRatings / product.reviews.length;
      product.reviewCount = product.reviews.length;
  
      await product.save();
  
      res.status(201).json({
        success: true,
        data: newReview,
        updatedProduct: {
          rating: product.rating,
          reviewCount: product.reviewCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };