import Review from '../models/review.js';
import Product from '../models/products.js';
import mongoose from 'mongoose';

// Helper: Recalculate product rating and reviewCount
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const reviewCount = reviews.length;
  const rating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: rating.toFixed(1),
    reviewCount
  });
};

// @desc    Create a review
// @route   POST /api/reviews/:productId
// @access  Private
export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (alreadyReviewed) {
    return res.status(400).json({ message: 'Product already reviewed by user' });
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    comment,
  });

  product.reviews.push(review._id);
  await product.save();

  await updateProductRating(productId);

  res.status(201).json({ message: 'Review added', review });
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name') // optional: include reviewer name
    .sort({ createdAt: -1 });

  res.status(200).json(reviews);
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
export const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this review' });
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  await review.save();
  await updateProductRating(review.product);

  res.status(200).json({ message: 'Review updated', review });
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this review' });
  }

  await review.deleteOne();

  // Remove review from product
  await Product.findByIdAndUpdate(review.product, {
    $pull: { reviews: review._id }
  });

  await updateProductRating(review.product);

  res.status(200).json({ message: 'Review deleted' });
};
