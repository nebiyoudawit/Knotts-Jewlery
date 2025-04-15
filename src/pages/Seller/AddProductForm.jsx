import React, { useState } from 'react';
import jewelryProducts from '../../data/jewelryProducts';
import './SellerStyles.css';

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!imagePreview) {
      newErrors.image = 'Product image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData({
        ...formData,
        image: file
      });
      
      // Clear error for image if it exists
      if (errors.image) {
        setErrors({
          ...errors,
          image: ''
        });
      }
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, you would upload the image and send data to an API
      // For now, we'll just simulate adding it to our mock data
      const newProduct = {
        id: `product-${Date.now()}`,
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        image: imagePreview, // In a real app, this would be a URL from your image hosting
        sellerId: localStorage.getItem('sellerEmail') || 'seller@example.com'
      };
      
      // Add to mock products (in a real app, this would be an API call)
      jewelryProducts.push(newProduct);
      
      // Show success toast
      const successToast = document.createElement('div');
      successToast.className = 'toast toast-success';
      successToast.textContent = 'Product added successfully!';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        category: '',
        description: '',
        image: null
      });
      setImagePreview('');
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home & Kitchen</option>
            <option value="sports">Sports & Outdoors</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your product..."
            rows="4"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Product Image *</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
          {errors.image && <span className="error-message">{errors.image}</span>}
          
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Product preview" />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button">Add Product</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;