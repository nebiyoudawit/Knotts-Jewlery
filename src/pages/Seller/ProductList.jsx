import React, { useState, useEffect } from 'react';
import jewelryProducts from '../../data/jewelryProducts';
import './SellerStyles.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    price: '',
    category: '',
    description: '',
    image: ''
  });
  
  // Simulate fetching products from an API
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      // In a real app, you would filter by seller ID
      const sellerProducts = jewelryProducts.filter(product => 
        product.sellerId === 'seller@example.com' || 
        localStorage.getItem('sellerEmail') === product.sellerId
      );
      setProducts(sellerProducts);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setEditFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image
    });
  };
  
  const handleCancelEdit = () => {
    setEditingProduct(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  const handleUpdateProduct = () => {
    // Validate form data
    if (!editFormData.name || !editFormData.price || !editFormData.category) {
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'toast toast-error';
      errorToast.textContent = 'Please fill in all required fields';
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 3000);
      
      return;
    }
    
    // Update product in local state
    const updatedProducts = products.map(product => 
      product.id === editingProduct ? { ...editFormData } : product
    );
    
    setProducts(updatedProducts);
    setEditingProduct(null);
    
    // In a real app, you would make an API call to update the product
    // Show success toast
    const successToast = document.createElement('div');
    successToast.className = 'toast toast-success';
    successToast.textContent = 'Product updated successfully!';
    document.body.appendChild(successToast);
    
    setTimeout(() => {
      document.body.removeChild(successToast);
    }, 3000);
  };
  
  const handleDeleteProduct = (productId) => {
    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Remove product from local state
      const filteredProducts = products.filter(product => product.id !== productId);
      setProducts(filteredProducts);
      
      // In a real app, you would make an API call to delete the product
      // Show success toast
      const successToast = document.createElement('div');
      successToast.className = 'toast toast-success';
      successToast.textContent = 'Product deleted successfully!';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading your products...</div>;
  }

  return (
    <div className="product-list-container">
      <h2>My Products</h2>
      
      {products.length === 0 ? (
        <div className="no-products-message">
          <p>You don't have any products listed yet.</p>
          <p>Click on "Add New Product" to get started!</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              {editingProduct === product.id ? (
                <div className="edit-product-form">
                  <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={editFormData.price}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={editFormData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="books">Books</option>
                      <option value="home">Home & Kitchen</option>
                      <option value="sports">Sports & Outdoors</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button 
                      type="button" 
                      className="save-button"
                      onClick={handleUpdateProduct}
                    >
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                    <p className="product-category">Category: {product.category}</p>
                    <p className="product-description">{product.description}</p>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEditClick(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;