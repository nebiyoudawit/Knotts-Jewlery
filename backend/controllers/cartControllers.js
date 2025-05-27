// controllers/cartController.js
import User from '../models/users.js';
import Product from '../models/products.js';
import mongoose from 'mongoose';

// Helper function to format cart items for frontend
const formatCartItem = (item) => {
  // Guard against missing product (e.g. deleted product)
  if (!item.product) return null;

  return {
    _id: item.product._id.toString(),
    name: item.product.name,
    price: item.product.price,
    originalPrice: item.product.originalPrice,
    images: item.product.images && item.product.images.length > 0
      ? item.product.images
      : ['/default-product.jpg'], // fallback default image
    category: item.product.category?.name || '',
    quantity: item.quantity
  };
};

// @desc    Get user's cart
// @route   GET /api/user/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'cart.items.product',
        select: 'name price originalPrice images category',
        populate: { path: 'category', select: 'name' }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out items with missing products
    const validItems = user.cart.items.filter(item => item.product);

    const formattedItems = validItems
      .map(formatCartItem)
      .filter(item => item !== null);

    res.status(200).json(formattedItems);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// @desc    Add item to cart
// @route   POST /api/user/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingIndex = user.cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingIndex >= 0) {
      user.cart.items[existingIndex].quantity += quantity;
    } else {
      user.cart.items.push({ product: productId, quantity });
    }

    await user.save();

    // Return updated cart populated
    const updatedUser = await User.findById(req.user._id)
      .populate({
        path: 'cart.items.product',
        select: 'name price originalPrice images category',
        populate: { path: 'category', select: 'name' }
      });

    const validItems = updatedUser.cart.items.filter(item => item.product);
    const formattedItems = validItems.map(formatCartItem).filter(i => i !== null);

    res.status(200).json(formattedItems);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/user/cart/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    if (quantity == null || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Quantity must be a number' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      user.cart.items.splice(itemIndex, 1);
    } else {
      user.cart.items[itemIndex].quantity = quantity;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate({
        path: 'cart.items.product',
        select: 'name price originalPrice images category',
        populate: { path: 'category', select: 'name' }
      });

    const validItems = updatedUser.cart.items.filter(item => item.product);
    const formattedItems = validItems.map(formatCartItem).filter(i => i !== null);

    res.status(200).json(formattedItems);
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/user/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart.items = user.cart.items.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate({
        path: 'cart.items.product',
        select: 'name price originalPrice images category',
        populate: { path: 'category', select: 'name' }
      });

    const validItems = updatedUser.cart.items.filter(item => item.product);
    const formattedItems = validItems.map(formatCartItem).filter(i => i !== null);

    res.status(200).json(formattedItems);
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/user/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart.items = [];
    await user.save();

    res.status(200).json([]); // Return empty cart array
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};
