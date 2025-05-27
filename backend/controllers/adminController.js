import Product from '../models/products.js';
import User from '../models/users.js';
import Order from '../models/order.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

/* -------------------- ADMIN PRODUCT ROUTES -------------------- */

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

    const imagePaths = imageFiles.map(file => `/uploads/${file.filename}`);

    const product = await Product.create({
      name,
      price: parseFloat(price),
      originalPrice: onSale === 'true' ? parseFloat(originalPrice) : null,
      stock: parseInt(stock),
      category,
      onSale: onSale === 'true',
      images: imagePaths,
      description,
    });

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
        const fullPath = path.resolve(imagePath);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error(`Failed to delete image file: ${imagePath}`, err);
          }
        });
      });
    }

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
      .populate('user', 'name email')
      .populate('items.product', 'name price');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// UPDATE ORDER STATUS
export const updateAdminOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = Date.now(); // Update the timestamp

    // If the status is 'Delivered', set delivery date to today (if not already set)
    if (status === 'Delivered' && !order.deliveryDate) {
      order.deliveryDate = new Date();
    }

    await order.save();

    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
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