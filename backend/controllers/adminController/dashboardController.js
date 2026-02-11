import Product from '../../models/products.js';
import User from '../../models/users.js';
import Order from '../../models/order.js';
import redisClient from '../../utils/redisClient.js';

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

// Get enhanced dashboard stats with all metrics
export const getEnhancedDashboardStats = async (req, res) => {
  try {
    const cacheKey = 'dashboard:enhanced:stats';

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        ...JSON.parse(cached),
        cached: true
      });
    }

    const currentDate = new Date();
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

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

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedSalesData = salesChartData.map(item => ({
      month: monthNames[item._id.month - 1],
      sales: item.revenue,
      orders: item.orders
    }));

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
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: lastHour }
    });

    const recentCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: lastHour }
    });

    const pendingOrders = await Order.countDocuments({
      status: 'pending'
    });

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

// Get basic dashboard statistics (legacy)
export const getDashboardStats = async (req, res) => {
  try {
    const cacheKey = 'dashboard:stats';

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        ...JSON.parse(cached),
        cached: true
      });
    }

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