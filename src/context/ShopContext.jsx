import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

const defaultContextValue = {
  cart: [],
  wishlist: [],
  cartCount: 0,
  wishlistCount: 0,
  currentUser: null,
  isAdmin: false,
  isLoading: false,
  error: null,
  login: () => {},
  logout: () => {},
  adminLogin: () => {},
  adminLogout: () => {},
  register: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  toggleWishlist: () => {},
  checkWishlistStatus: () => {},
  clearError: () => {},
  updateUserProfile: () => {},
  changePassword: () => {},
  fetchCart: () => {},
  fetchWishlist: () => {},
};

const ShopContext = createContext(defaultContextValue);

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check auth state on mount and fetch user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  // Fetch cart and wishlist when user changes
  useEffect(() => {
    if (currentUser) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [currentUser]);

  // Helper function for API requests
  const makeRequest = async (url, method, body = null) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  };

  // Verify token validity
  const verifyToken = async (token) => {
    setIsLoading(true);
    try {
      const data = await makeRequest('http://localhost:5000/api/auth/verify', 'GET');
      setCurrentUser(data.user);
      setIsAdmin(data.user?.role === 'admin');
    } catch (err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 AUTH FUNCTIONS
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await makeRequest('http://localhost:5000/api/auth/register', 'POST', userData);
      
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      setIsAdmin(data.user?.role === 'admin');
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await makeRequest('http://localhost:5000/api/auth/login', 'POST', { email, password });
      
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      setIsAdmin(data.user?.role === 'admin');
      toast.success('Login successful!');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await makeRequest('http://localhost:5000/api/auth/login', 'POST', { email, password });
      
      if (data.user?.role !== 'admin') {
        throw new Error('Access denied: Not an admin');
      }

      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      setIsAdmin(true);
      toast.success('Admin login successful!');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAdmin(false);
    setCart([]);
    setWishlist([]);
    toast.success('Logged out successfully');
  };

  const adminLogout = () => {
    if (currentUser?.role === 'admin') {
      logout();
      toast.success('Admin logged out successfully');
    }
  };

  // 🛒 CART FUNCTIONS
  const fetchCart = async () => {
    try {
      const data = await makeRequest('http://localhost:5000/api/user/cart', 'GET');
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      // Ensure product has an _id (MongoDB uses _id by default)
      if (!product._id) {
        throw new Error('Invalid product ID');
      }
  
      const data = await makeRequest('http://localhost:5000/api/user/cart', 'POST', {
        productId: product._id,  // Use _id instead of id
        quantity
      });
      setCart(data);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const data = await makeRequest(`http://localhost:5000/api/user/cart/${productId}`, 'DELETE');
      setCart(data);
      toast.info('Item removed from cart');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        return removeFromCart(productId);
      }
      const data = await makeRequest(`http://localhost:5000/api/user/cart/${productId}`, 'PUT', { quantity });
      setCart(data);
      toast.success('Quantity updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 💖 WISHLIST FUNCTIONS
  const fetchWishlist = async () => {
    try {
      const data = await makeRequest('http://localhost:5000/api/user/wishlist', 'GET');
      setWishlist(data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const toggleWishlist = async (product) => {
    try {
      if (!product._id) {
        throw new Error('Invalid product ID');
      }
  
      const { wishlist: updatedWishlist, isInWishlist } = await makeRequest(
        `http://localhost:5000/api/user/wishlist/${product._id}`,
        'POST'
      );
      setWishlist(updatedWishlist);
      toast[isInWishlist ? 'success' : 'info'](
        isInWishlist 
          ? `${product.name} added to wishlist`
          : `${product.name} removed from wishlist`
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const checkWishlistStatus = async (productId) => {
    try {
      const { isInWishlist } = await makeRequest(
        `http://localhost:5000/api/user/wishlist/check/${productId}`,
        'GET'
      );
      return isInWishlist;
    } catch (err) {
      console.error('Error checking wishlist:', err);
      return false;
    }
  };

  // 👤 PROFILE FUNCTIONS
  const updateUserProfile = async (updatedUserData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await makeRequest(
        'http://localhost:5000/api/user/update',
        'PUT',
        updatedUserData
      );
      setCurrentUser(data.user);
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      await makeRequest(
        'http://localhost:5000/api/user/change-password',
        'PUT',
        { currentPassword, newPassword }
      );
      toast.success('Password changed successfully');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        wishlistCount,
        currentUser,
        isAdmin,
        isLoading,
        error,
        login,
        logout,
        adminLogin,
        adminLogout,
        register,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        checkWishlistStatus,
        clearError,
        updateUserProfile,
        changePassword,
        fetchCart,
        fetchWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};