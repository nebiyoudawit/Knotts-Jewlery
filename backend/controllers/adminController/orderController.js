import Order from '../../models/order.js';
import Product from '../../models/products.js';
import { invalidateDashboardCache, invalidateAdminOrderList, invalidateAdminProductList } from '../../utils/cacheUtils.js';
import redisClient from '../../utils/redisClient.js';

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

// UPDATE ORDER STATUS
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
    
    // Invalidate caches
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
    
    // Invalidate caches
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

// DELETE ORDER
export const deleteAdminOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Invalidate caches
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