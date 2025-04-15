import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductList from './ProductList';
import AddProductForm from './AddProductForm.jsx';
import './SellerStyles.css';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [sellerEmail, setSellerEmail] = useState('');
  const navigate = useNavigate();
  
  
  const handleLogout = () => {
    // Clear seller data from localStorage
    localStorage.removeItem('sellerLoggedIn');
    localStorage.removeItem('sellerEmail');
    
    // Show logout message
    const logoutToast = document.createElement('div');
    logoutToast.className = 'toast toast-info';
    logoutToast.textContent = 'Logged out successfully!';
    document.body.appendChild(logoutToast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      document.body.removeChild(logoutToast);
      // Navigate to login page
      navigate('/seller/login');
    }, 3000);
  };

  return (
    <div className="seller-dashboard-container">
      <div className="seller-dashboard-header">
        <h1>Seller Dashboard</h1>
        <div className="seller-info">
          <span>{sellerEmail}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          My Products
        </button>
        <button 
          className={`tab-button ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}
        >
          Add New Product
        </button>
        <button 
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'products' && <ProductList />}
        {activeTab === 'add-product' && <AddProductForm />}
        {activeTab === 'messages' && (
          <div className="messages-placeholder">
            <h3>Messaging Feature (Bonus)</h3>
            <p>This feature would allow you to communicate with potential buyers.</p>
            <p>Coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;