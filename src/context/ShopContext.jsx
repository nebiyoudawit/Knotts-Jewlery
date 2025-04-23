import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

const defaultContextValue = {
  cart: [],
  wishlist: [],
  cartCount: 0,
  wishlistCount: 0,
  currentUser: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  adminLogin: () => {},
  adminLogout: () => {},
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

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('isAdmin') === 'true';
      }
      return false;
    } catch (error) {
      console.error('Error parsing admin status:', error);
      return false;
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

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin);
  }, [isAdmin]);

  // Authentication methods
  const login = (email, password) => {
    // In a real app, this would verify credentials with your backend
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

  const adminLogin = (email, password) => {
    // In a real app, verify credentials with your backend
    if (email === 'admin@example.com' && password === 'admin123') {
      setIsAdmin(true);
      setCurrentUser({
        id: 'admin-1',
        name: 'Admin User',
        email: email,
        avatar: null,
        isAdmin: true
      });
      toast.success('Admin login successful!');
      return true;
    }
    toast.error('Invalid admin credentials');
    return false;
  };

  const register = (name, email, password) => {
    const mockUser = {
      id: Date.now().toString(),
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
    setIsAdmin(false);
    toast.success('Logged out successfully!');
  };

  const adminLogout = () => {
    setIsAdmin(false);
    // Keep regular user logged in if they were both admin and regular user
    if (currentUser?.email === 'admin@example.com') {
      setCurrentUser(null);
    }
    toast.success('Admin logged out');
  };

  // Cart methods with notifications
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
  
    // Show toast after state update logic
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      toast.success(`${product.name} quantity updated to ${newQuantity}`);
    } else {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const removeFromCart = (productId) => {
    const product = cart.find(item => item.id === productId);
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    if (product) {
      toast.info(`${product.name} removed from cart`);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const product = cart.find(item => item.id === productId);
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    
    if (product) {
      toast.success(`${product.name} quantity updated to ${newQuantity}`);
    }
  };

  // Wishlist methods with notifications
  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
  
    setWishlist(prev =>
      isInWishlist
        ? prev.filter(item => item.id !== product.id)
        : [...prev, product]
    );
  
    toast[isInWishlist ? 'info' : 'success'](
      isInWishlist 
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist!`
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
        isAdmin,
        login,
        logout,
        adminLogin,
        adminLogout,
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