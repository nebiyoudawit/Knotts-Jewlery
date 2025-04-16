// src/context/ShopContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize with default values
const defaultContextValue = {
  cart: [],
  wishlist: [],
  cartCount: 0,
  wishlistCount: 0,
  currentUser: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  toggleWishlist: () => {},
};

const ShopContext = createContext(defaultContextValue);

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedWishlist = localStorage.getItem('wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing wishlist from localStorage:', error);
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Authentication methods
  const login = (email, password) => {
    // In a real app, you would make an API call here
    // For demo purposes, we'll just create a mock user
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: email,
      avatar: null
    };
    
    setCurrentUser(mockUser);
    toast.success('Logged in successfully!');
    return true;
  };

  const register = (name, email, password) => {
    // In a real app, you would make an API call here
    // For demo purposes, we'll just create a mock user
    const mockUser = {
      id: '1',
      name: name,
      email: email,
      avatar: null
    };
    
    setCurrentUser(mockUser);
    toast.success('Account created successfully!');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    toast.success('Logged out successfully!');
  };

  // Cart methods
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => 
      prev.some(item => item.id === product.id)
        ? prev.filter(item => item.id !== product.id)
        : [...prev, product]
    );
  };

  // Calculate derived values
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
        login,
        logout,
        register,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist
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