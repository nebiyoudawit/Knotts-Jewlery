// controllers/wishlistController.js
import User from '../models/users.js';
import Product from '../models/products.js';

// Helper function to format wishlist items for frontend
const formatWishlistItems = (items) => {
  return items.map(item => ({
    id: item.product._id.toString(),
    name: item.product.name,
    price: item.product.price,
    originalPrice: item.product.originalPrice,
    imageUrl: item.product.images[0]?.url || '/default-product.jpg',
    category: item.product.category?.name || '',
    rating: item.product.rating || 0,
    reviewCount: item.product.reviewCount || 0
  }));
};

// @desc    Get user's wishlist
// @route   GET /api/user/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate({
          path: 'wishlist.product',
          select: 'name price images category rating reviewCount',
          populate: {
            path: 'category',
            select: 'name'
          }
        });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const formattedItems = user.wishlist.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        images: item.product.images, // Ensure images array is included
        category: item.product.category?.name || '',
        rating: item.product.rating || 0,
        reviewCount: item.product.reviewCount || 0
      }));
  
      res.status(200).json(formattedItems);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error fetching wishlist' });
    }
  };

// @desc    Toggle product in wishlist
// @route   POST /api/user/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if product is already in wishlist
    const existingIndex = user.wishlist.findIndex(
      item => item.product.toString() === productId
    );

    let isInWishlist;
    if (existingIndex >= 0) {
      // Remove from wishlist
      user.wishlist.splice(existingIndex, 1);
      isInWishlist = false;
    } else {
      // Add to wishlist
      user.wishlist.push({ product: productId });
      isInWishlist = true;
    }

    await user.save();

    // Return updated wishlist and status
    const updatedUser = await User.findById(req.user._id)
      .populate({
        path: 'wishlist.product',
        select: 'name price originalPrice images category rating reviewCount',
        populate: {
          path: 'category',
          select: 'name'
        }
      });

    const formattedItems = formatWishlistItems(updatedUser.wishlist);
    res.status(200).json({
      wishlist: formattedItems,
      isInWishlist
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating wishlist' });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/user/wishlist/check/:productId
// @access  Private
export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isInWishlist = user.wishlist.some(
      item => item.product.toString() === productId
    );

    res.status(200).json({ isInWishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error checking wishlist' });
  }
};