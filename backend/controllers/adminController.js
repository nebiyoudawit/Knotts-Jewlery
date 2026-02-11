import Product from '../models/products.js';
import User from '../models/users.js';
import Order from '../models/order.js';
import redisClient from '../utils/redisClient.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { invalidateDashboardCache, invalidateAdminOrderList, invalidateAdminProductList, invalidateAdminUserList } from '../utils/cacheUtils.js';
/* Admin Dashboard Controller */

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 100; // Avoid division by zero
  return ((current - previous) / previous) * 100;
};

export const getEnhancedDashboardStats = async (req, res) => {
  try {
    const cacheKey = 'dashboard:enhanced:stats';

    // Check Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        ...JSON.parse(cached),
        cached: true
      });
    }

    // 1. Get basic stats (from existing function)
    const currentDate = new Date();
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Calculate basic stats
    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

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

    const totalOrders = await Order.countDocuments();
    const prevMonthOrders = await Order.countDocuments({ createdAt: { $lt: previousMonthDate } });
    const ordersChange = calculatePercentageChange(totalOrders, prevMonthOrders);

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const prevMonthCustomers = await User.countDocuments({ 
      role: 'customer', 
      createdAt: { $lt: previousMonthDate } 
    });
    const customersChange = calculatePercentageChange(totalCustomers, prevMonthCustomers);

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

    // 2. Today's metrics
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfYesterday = new Date(new Date().setDate(today.getDate() - 1));
    startOfYesterday.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    const todayRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'Paid',
          createdAt: { $gte: startOfToday } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const todayRevenueValue = todayRevenue[0]?.total || 0;

    const yesterdayOrders = await Order.countDocuments({
      createdAt: { 
        $gte: startOfYesterday,
        $lt: startOfToday
      }
    });

    // 3. Sales chart data (last 6 months)
    const salesChartData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Format sales chart data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedSalesData = salesChartData.map(item => ({
      month: monthNames[item._id.month - 1],
      sales: item.revenue,
      orders: item.orders
    }));

    // 4. Category distribution
    const categoryDistribution = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$product.price'] } },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const categoryColors = {
      'Rings': '#10b981',
      'Necklaces': '#3b82f6',
      'Bracelets': '#8b5cf6',
      'Earrings': '#f59e0b',
      'Watches': '#ef4444',
      'Other': '#6b7280'
    };

    const formattedCategoryData = categoryDistribution.map(item => ({
      name: item._id,
      value: Math.round(item.revenue),
      count: item.count,
      color: categoryColors[item._id] || '#6b7280'
    }));

    // 5. Recent orders with details (last 5 orders)
    const recentOrdersDetailed = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('_id total status paymentStatus createdAt');

    const formattedRecentOrders = recentOrdersDetailed.map(order => ({
      id: `ORD${order._id.toString().slice(-6).toUpperCase()}`,
      customer: order.user?.name || 'Unknown Customer',
      amount: order.total,
      status: order.status,
      date: order.createdAt,
      paymentStatus: order.paymentStatus
    }));

    // 6. Top selling products
    const topProducts = await Product.find()
      .sort({ sales: -1 })
      .limit(5)
      .select('name sales price stock images');

    const formattedTopProducts = topProducts.map(product => ({
      name: product.name,
      sales: product.sales || 0,
      revenue: (product.sales || 0) * product.price,
      stock: product.stock,
      image: product.images?.[0] || null
    }));

    // 7. Order status summary
    const orderStatusSummary = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusSummary = {
      pending: orderStatusSummary.find(s => s._id === 'pending')?.count || 0,
      delivered: orderStatusSummary.find(s => s._id === 'delivered')?.count || 0,
      cancelled: orderStatusSummary.find(s => s._id === 'cancelled')?.count || 0
    };

    // 8. Recent activities
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('user', 'name email');

    const recentCustomers = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(3);

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
    ].sort((a, b) => b.date - a.date).slice(0, 5);

    // Build the complete response
    const response = {
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
        },
        todayOrders: todayOrders,
        todayRevenue: todayRevenueValue.toFixed(2),
        yesterdayOrders: yesterdayOrders
      },
      charts: {
        salesData: formattedSalesData,
        categoryData: formattedCategoryData
      },
      recentOrders: formattedRecentOrders,
      topProducts: formattedTopProducts,
      orderStatusSummary: statusSummary,
      recentActivities: recentActivities,
      summary: {
        totalProducts: await Product.countDocuments(),
        outOfStock: await Product.countDocuments({ stock: 0 }),
        averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
      }
    };

    // Cache the result for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);

  } catch (err) {
    console.error('Error fetching enhanced dashboard stats:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch enhanced dashboard stats', 
      error: err.message 
    });
  }
};

// Get monthly analytics for detailed reports
export const getMonthlyAnalytics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const cacheKey = `dashboard:analytics:${year}`;
    
    // Check Redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          customers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          month: '$_id.month',
          revenue: 1,
          orders: 1,
          uniqueCustomers: { $size: '$customers' }
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Fill in missing months
    const completeMonthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find(m => m.month === i + 1);
      return {
        month: i + 1,
        monthName: new Date(2000, i, 1).toLocaleString('default', { month: 'short' }),
        revenue: monthData?.revenue || 0,
        orders: monthData?.orders || 0,
        uniqueCustomers: monthData?.uniqueCustomers || 0
      };
    });

    const response = {
      success: true,
      year: parseInt(year),
      monthlyData: completeMonthlyData,
      summary: {
        totalRevenue: completeMonthlyData.reduce((sum, month) => sum + month.revenue, 0),
        totalOrders: completeMonthlyData.reduce((sum, month) => sum + month.orders, 0),
        averageRevenuePerOrder: completeMonthlyData.reduce((sum, month) => sum + month.revenue, 0) / 
                               completeMonthlyData.reduce((sum, month) => sum + month.orders, 1)
      }
    };

    await redisClient.setEx(cacheKey, 600, JSON.stringify(response));
    res.json(response);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly analytics',
      error: err.message
    });
  }
};

// Get real-time dashboard updates
export const getRealTimeUpdates = async (req, res) => {
  try {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    
    // Get recent orders in the last hour
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: lastHour }
    });

    // Get recent customers in the last hour
    const recentCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: lastHour }
    });

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({
      status: 'pending'
    });

    // Get low stock products
    const lowStockProducts = await Product.countDocuments({
      stock: { $gt: 0, $lt: 10 }
    });

    res.json({
      success: true,
      updates: {
        recentOrders,
        recentCustomers,
        pendingOrders,
        lowStockProducts,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time updates',
      error: err.message
    });
  }
};

// Get dashboard statistics (legacy endpoint)
export const getDashboardStats = async (req, res) => {
  try {
    const cacheKey = 'dashboard:stats';

    // 1. Check Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        ...JSON.parse(cached),
        cached: true
      });
    }

    // 2. Proceed with MongoDB queries if not cached
    const currentDate = new Date();
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

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

    const totalOrders = await Order.countDocuments();
    const prevMonthOrders = await Order.countDocuments({ createdAt: { $lt: previousMonthDate } });
    const ordersChange = calculatePercentageChange(totalOrders, prevMonthOrders);

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const prevMonthCustomers = await User.countDocuments({ 
      role: 'customer', 
      createdAt: { $lt: previousMonthDate } 
    });
    const customersChange = calculatePercentageChange(totalCustomers, prevMonthCustomers);

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

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('user', 'name email');

    const recentCustomers = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(3);

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

    const response = {
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
    };

    // 3. Cache the result
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);

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
  const cacheKey = 'admin:products';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const products = await Product.find();
    await redisClient.setEx(cacheKey, 300, JSON.stringify(products));

    res.json(products);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: err.message,
    });
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

    const imageUrls = imageFiles ? imageFiles.map(file => file.path) : [];

    const product = await Product.create({
      name,
      price: parseFloat(price),
      originalPrice: onSale === 'true' ? parseFloat(originalPrice) : null,
      stock: parseInt(stock),
      category,
      onSale: onSale === 'true',
      images: imageUrls,
      description,
      sales: 0,
    });

    await deleteProductSearchCache();
    await invalidateAdminProductList();
    await invalidateDashboardCache(); // ADDED: Invalidate dashboard cache
    
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
  }
};

export const updateAdminProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, stock, category, onSale, description } = req.body;
    const imageFiles = req.files;

    // Parse existing images
    let existingImages = [];
    if (req.body.existingImages) {
      if (typeof req.body.existingImages === 'string') {
        try {
          existingImages = JSON.parse(req.body.existingImages);
        } catch {
          existingImages = [req.body.existingImages];
        }
      } else if (Array.isArray(req.body.existingImages)) {
        existingImages = req.body.existingImages;
      }
    }

    const newImageUrls = imageFiles ? imageFiles.map(file => file.path) : [];

    const updateData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      onSale: onSale === 'true' || onSale === true,
      description,
      originalPrice: (onSale === 'true' || onSale === true) ? parseFloat(originalPrice) : null,
      images: [...existingImages, ...newImageUrls],
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await deleteProductSearchCache();
    await invalidateAdminProductList();
    await invalidateDashboardCache(); // ADDED: Invalidate dashboard cache
    
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
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await deleteProductSearchCache();
    await invalidateAdminProductList();
    await invalidateDashboardCache(); // ADDED: Invalidate dashboard cache
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: err.message,
    });
  }
};

/* -------------------- USER ROUTES  -------------------- */

export const getUsers = async (req, res) => {
  const cacheKey = 'admin:users';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const users = await User.find().select('-password');
    await redisClient.setEx(cacheKey, 300, JSON.stringify(users));

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role, address, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

    const newUser = await User.create({ name, email, password, role, address, phone });

    await invalidateDashboardCache(); 
    await invalidateAdminUserList();

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
    await invalidateDashboardCache();
    await invalidateAdminUserList();
    
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
    
    await invalidateAdminUserList();
    await invalidateAdminOrderList();
    await invalidateDashboardCache(); // ADDED: Invalidate dashboard cache
    
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
  const cacheKey = 'admin:orders';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const orders = await Order.find().populate('user', 'name phone');
    await redisClient.setEx(cacheKey, 300, JSON.stringify(orders));

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: err.message,
    });
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
    
    // CRITICAL: Invalidate BOTH dashboard cache keys
    await invalidateDashboardCache();
    await invalidateAdminOrderList();
    
    res.json({
      success: true,
      order,
      message: `Order status updated to ${status}`
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status', 
      error: err.message 
    });
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
    
    // CRITICAL: Invalidate BOTH dashboard cache keys
    await invalidateDashboardCache();
    await invalidateAdminOrderList();
    
    res.json({
      success: true,
      order,
      message: `Payment status updated to ${paymentStatus}`
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment status', 
      error: err.message 
    });
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
    
    // CRITICAL: Invalidate dashboard cache
    await invalidateDashboardCache();
    await invalidateAdminProductList();
    await invalidateAdminOrderList();
    
    res.json({
      success: true,
      product,
      message: `Product sales updated`
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product sales', 
      error: err.message 
    });
  }
};

// DELETE ORDER
export const deleteAdminOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // CRITICAL: Invalidate dashboard cache
    await invalidateDashboardCache();
    await invalidateAdminOrderList();
    
    res.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete order', 
      error: err.message 
    });
  }
};