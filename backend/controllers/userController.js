import User from '../models/users.js';
import Order from '../models/order.js';
import bcrypt from 'bcrypt';

// @desc    Update user profile
// @route   PUT /api/user/update
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields if provided
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
export const changeUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'Both current and new passwords are required' });

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect current password' });

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

/// @desc    Get all orders for the logged-in user with populated product details
// @route   GET /api/user/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  console.log("✅ getUserOrders hit");

  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product'); // This populates the product data

    // Transform the data: flatten product into each item
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      user: order.user,
      items: order.items.map(item => ({
        name: item.product?.name || 'Unknown',
        image: item.product?.image ? `http://localhost:5000/${item.product?.image}` : '',
        price: item.product?.price || 0,
        qty: item.qty,
      })),
      totalPrice: order.total || 0,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      deliveryDate: order.deliveryDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    res.status(200).json(formattedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};


// @desc    Get single order by ID (if it belongs to user)
// @route   GET /api/user/orders/:orderId
// @access  Private
export const getUserOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};
// @desc    Cancel a user’s order within 24 hours
// @route   PUT /api/user/orders/:orderId/cancel
// @access  Private
export const cancelUserOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order already cancelled' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
    }

    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const hoursDiff = (now - orderTime) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(400).json({ message: 'Cancellation window expired (24h)' });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
};
