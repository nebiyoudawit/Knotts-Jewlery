import Product from '../models/products.js';
import User from '../models/users.js';
import Order from '../models/order.js';
import redisClient from '../utils/redisClient.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

/* Admin Dashboard Controller */

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 100; // Avoid division by zero
  return ((current - previous) / previous) * 100;
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get current date and previous month date
    const currentDate = new Date();
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    // Calculate total revenue (sum of all paid orders)
    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Calculate previous month revenue for comparison
    const prevMonthRevenueResult = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'Paid',
          createdAt: { $lt: previousMonthDate } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const prevMonthRevenue = prevMonthRevenueResult[0]?.total || 0;
    const revenueChange = calculatePercentageChange(totalRevenue, prevMonthRevenue);

    // Calculate total orders
    const totalOrders = await Order.countDocuments();
    const prevMonthOrders = await Order.countDocuments({ createdAt: { $lt: previousMonthDate } });
    const ordersChange = calculatePercentageChange(totalOrders, prevMonthOrders);

    // Calculate total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const prevMonthCustomers = await User.countDocuments({ 
      role: 'customer', 
      createdAt: { $lt: previousMonthDate } 
    });
    const customersChange = calculatePercentageChange(totalCustomers, prevMonthCustomers);

    // Calculate sales growth (based on product sales)
    const totalSalesResult = await Product.aggregate([
      { $group: { _id: null, total: { $sum: '$sales' } } }
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;
    const prevMonthSales = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          createdAt: { $lt: previousMonthDate } 
        } 
      },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } }
    ]);
    const prevSales = prevMonthSales[0]?.total || 0;
    const salesGrowth = calculatePercentageChange(totalSales, prevSales);

    // Get recent activities
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('user', 'name email');

    const recentCustomers = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(3);

    // Format recent activities
    const recentActivities = [
      ...recentOrders.map(order => ({
        type: 'order',
        title: 'New order received',
        description: `Order #${order._id.toString().slice(-6)} from ${order.user?.name}`,
        date: order.createdAt,
        icon: 'shopping-bag'
      })),
      ...recentCustomers.map(user => ({
        type: 'customer',
        title: 'New customer registered',
        description: `${user.name} (${user.email})`,
        date: user.createdAt,
        icon: 'user'
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 3);

    res.json({
      success: true,
      stats: {
        totalRevenue: {
          value: totalRevenue.toFixed(2),
          change: revenueChange.toFixed(0)
        },
        totalOrders: {
          value: totalOrders,
          change: ordersChange.toFixed(0)
        },
        totalCustomers: {
          value: totalCustomers,
          change: customersChange.toFixed(0)
        },
        salesGrowth: {
          value: totalSales,
          change: salesGrowth.toFixed(0)
        }
      },
      recentActivities
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats', 
      error: err.message 
    });
  }
};


/* -------------------- ADMIN PRODUCT ROUTES -------------------- */
const deleteProductSearchCache = async () => {
  const keys = await redisClient.keys('products:search:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
    console.log(`Deleted Redis cache keys: ${keys.join(', ')}`);
  }
};

// GET ALL PRODUCTS
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: err.message });
  }
};

// GET PRODUCT BY ID
export const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ADD NEW PRODUCT WITH IMAGE
export const addAdminProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, stock, category, onSale, description } = req.body;
    const imageFiles = req.files;

    if (!name || !price || !stock || !category || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const imagePaths = imageFiles ? imageFiles.map(file => `/uploads/${file.filename}`) : [];

    const product = await Product.create({
      name,
      price: parseFloat(price),
      originalPrice: onSale === 'true' ? parseFloat(originalPrice) : null,
      stock: parseInt(stock),
      category,
      onSale: onSale === 'true',
      images: imagePaths,
      description,
      sales: 0,
    });
    await deleteProductSearchCache();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
  }
};

// UPDATE PRODUCT WITH IMAGE SUPPORT
export const updateAdminProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, stock, category, onSale, description } = req.body;
    const imageFiles = req.files;

    // Safely parse existingImages
    let existingImages = [];
    if (req.body.existingImages) {
      if (typeof req.body.existingImages === 'string') {
        try {
          existingImages = JSON.parse(req.body.existingImages);
        } catch (err) {
          existingImages = [req.body.existingImages]; // single string fallback
        }
      } else if (Array.isArray(req.body.existingImages)) {
        existingImages = req.body.existingImages;
      } else {
        existingImages = [];
      }
    }

    // Construct update data
    const updateData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      onSale: onSale === 'true' || onSale === true,
      description,
      originalPrice:
        onSale === 'true' || onSale === true
          ? parseFloat(originalPrice)
          : null,
    };

    // Handle new image uploads
    const newImagePaths = (imageFiles || []).map(file => `/uploads/${file.filename}`);
    updateData.images = [...existingImages, ...newImagePaths];

    // Update product in DB
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    await deleteProductSearchCache();
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
  }
};


export const deleteAdminProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from the filesystem
    if (deletedProduct.images && deletedProduct.images.length > 0) {
      deletedProduct.images.forEach((imagePath) => {
        const fullPath = path.join(process.cwd(), imagePath);

        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`Failed to delete image file: ${imagePath}`, err);
            }
          });
        } else {
          console.warn(`Image file not found: ${fullPath}`);
        }
      });
    }

    await deleteProductSearchCache();

    res.json({
      success: true,
      message: 'Product and images deleted successfully'
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: err.message
    });
  }
};
/* -------------------- USER ROUTES  -------------------- */

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(
      users 
    );
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role, address, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role, address, phone });
    const { password: _, ...userData } = newUser.toObject();
    res.status(201).json({ success: true, user: userData });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(400).json({ success: false, message: 'Invalid user data', error: err.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      error: err.message 
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, address, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = name;
    user.email = email;
    user.role = role;
    user.address = address;
    user.phone = phone;
    await user.save();

    const { password: _, ...userData } = user.toObject();
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};

/* -------------------- ADMIN ORDER ROUTES -------------------- */

// GET ALL ORDERS
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name phone')
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
};

// GET ORDER BY ID
export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const updateAdminOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('user', 'name phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.status;

    // Handle reverting from 'delivered'
    if (previousStatus === 'delivered' && status !== 'delivered') {
      order.paymentStatus = 'Pending';

      for (let item of order.items) {
        if (!item.product || !item.product._id) continue;

        const product = await Product.findById(item.product._id);
        if (!product) continue;

        product.sales = (product.sales || 0) - item.quantity;
        product.stock = (product.stock || 0) + item.quantity;
        await product.save();
      }

      order.deliveryDate = null;
    }

    // Handle transition to 'delivered'
    if (status === 'delivered' && previousStatus !== 'delivered') {
      order.paymentStatus = 'Paid';

      for (let item of order.items) {
        if (!item.product || !item.product._id) continue;

        const product = await Product.findById(item.product._id);
        if (!product) continue;

        product.sales = (product.sales || 0) + item.quantity;
        product.stock = (product.stock || 0) - item.quantity;
        await product.save();
      }

      if (!order.deliveryDate) {
        order.deliveryDate = new Date();
      }
    }

    order.status = status;
    order.updatedAt = Date.now();

    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
  }
};



// UPDATE PAYMENT STATUS
export const updateOrderPaymentStatus = async (req, res) => {
  const { paymentStatus } = req.body;
  const validStatuses = ['Pending', 'Paid'];

  if (!validStatuses.includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid payment status' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json(order );
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update payment status', error: err.message });
  }
};

// UPDATE PRODUCT SALES
export const updateProductSales = async (req, res) => {
  const { quantity } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.sales += parseInt(quantity) || 1;
    product.stock -= parseInt(quantity) || 1;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product sales', error: err.message });
  }
};

// DELETE ORDER
export const deleteAdminOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete order', error: err.message });
  }
};