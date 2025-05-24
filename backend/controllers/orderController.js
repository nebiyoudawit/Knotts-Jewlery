import Order from '../models/order.js';
import Product from '../models/products.js';
import User from '../models/users.js';
import mongoose from 'mongoose';

export const createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod } = req.body;

    // Validate user
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate products and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ success: false, message: `Invalid product ID: ${item.product}` });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      total += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'Pay on Delivery',
      status: 'Pending',
      paymentStatus: 'Pending'
    });

    await order.save();

    // Format response
    const response = {
      _id: order._id,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      items: order.items.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.total,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: response
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order',
      error: error.message
    });
  }
};
export const getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID' });
      }
  
      const order = await Order.findById(id)
        .populate('user', 'name email')
        .populate('items.product', 'name price images');
  
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching order',
        error: error.message
      });
    }
  };

  