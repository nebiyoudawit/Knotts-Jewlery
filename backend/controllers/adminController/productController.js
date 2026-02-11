import Product from '../../models/products.js';
import redisClient from '../../utils/redisClient.js';
import { invalidateDashboardCache, invalidateAdminProductList, invalidateAdminOrderList } from '../../utils/cacheUtils.js';

// Helper function for product search cache deletion
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
    await invalidateDashboardCache();
    
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
  }
};

// UPDATE PRODUCT
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
    await invalidateDashboardCache();
    
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
  }
};

// DELETE PRODUCT
export const deleteAdminProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await deleteProductSearchCache();
    await invalidateAdminProductList();
    await invalidateDashboardCache();
    
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