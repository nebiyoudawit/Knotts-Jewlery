import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner"; // CHANGED: Import from sonner, not react-toastify

const apiUrl = import.meta.env.VITE_API_URL;
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
    const token = localStorage.getItem("token");
    console.log("Auth token found on mount:", token);
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
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  // Verify token validity
  const verifyToken = async (token) => {
    setIsLoading(true);
    try {
      console.log("Verifying token...");
      const data = await makeRequest(`${apiUrl}/auth/verify`, "GET");
      console.log("Verify response:", data);

      if (!data || !data.user) {
        throw new Error("No user data returned from /verify");
      }

      setCurrentUser(data.user);
      setIsAdmin(data.user?.role === "admin");
    } catch (err) {
      console.error("Token verification failed:", err.message);
      logout(false); // don't toast on auto logout
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 AUTH FUNCTIONS
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await makeRequest(
        `${apiUrl}/auth/register`,
        "POST",
        userData
      );

      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      setIsAdmin(data.user?.role === "admin");
      toast.success("Registration successful!");
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
      const data = await makeRequest(`${apiUrl}/auth/login`, "POST", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      setIsAdmin(data.user?.role === "admin");
      toast.success("Login successful!");
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
      const data = await makeRequest(`${apiUrl}/auth/login`, "POST", {
        email,
        password,
      });

      if (data.user?.role !== "admin") {
        throw new Error("Access denied: Not an admin");
      }

      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      setIsAdmin(true);
      toast.success("Admin login successful!");
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
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsAdmin(false);
    setCart([]);
    setWishlist([]);
    toast.success("Logged out successfully");
  };

  const adminLogout = () => {
    if (currentUser?.role === "admin") {
      logout();
      toast.success("Admin logged out successfully");
    }
  };

  // 🛒 CART FUNCTIONS
  const fetchCart = async () => {
    try {
      const data = await makeRequest(`${apiUrl}/user/cart`, "GET");
      setCart(data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const [loading, setLoading] = useState({
    add: false,
    remove: false,
    update: false,
    itemId: null,
  });

  const addToCart = async (product, quantity = 1) => {
    if (!currentUser) {
      toast.error("You must be logged in to add items to the cart");
      return;
    }
    if (loading.add || loading.remove || loading.update || !product?._id)
      return;
    setLoading((prev) => ({ ...prev, add: true, itemId: product._id }));
    const previousCart = [...cart];

    try {
      const existingItem = cart.find(
        (item) => item?.product?._id === product._id
      );

      const optimisticCart = existingItem
        ? cart.map((item) =>
            item?.product?._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...cart, { product, quantity }];

      setCart(optimisticCart);
      toast.success(`${product.name} added to cart`);

      const data = await makeRequest(`${apiUrl}/user/cart`, "POST", {
        productId: product._id,
        quantity,
      });

      setCart(data);
    } catch (err) {
      setCart(previousCart);
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setLoading((prev) => ({ ...prev, add: false, itemId: null }));
    }
  };

  const removeFromCart = async (productId) => {
    if (loading.add || loading.remove || loading.update || !productId) return;

    setLoading((prev) => ({ ...prev, remove: true, itemId: productId }));
    const previousCart = [...cart];

    const optimisticCart = cart.filter(
      (item) => item?.product?._id !== productId && item?._id !== productId
    );
    setCart(optimisticCart);
    toast.info("Item removed from cart");

    try {
      const data = await makeRequest(
        `${apiUrl}/user/cart/${productId}`,
        "DELETE"
      );
      setCart(data);
    } catch (err) {
      setCart(previousCart);
      toast.error(err.message || "Failed to remove from cart");
    } finally {
      setLoading((prev) => ({ ...prev, remove: false, itemId: null }));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (loading.add || loading.remove || loading.update || !productId) return;

    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    setLoading((prev) => ({ ...prev, update: true, itemId: productId }));
    const previousCart = [...cart];

    try {
      const optimisticCart = cart.map((item) =>
        item?.product?._id === productId || item?._id === productId
          ? { ...item, quantity }
          : item
      );

      setCart(optimisticCart);
      toast.success("Quantity updated");

      const data = await makeRequest(
        `${apiUrl}/user/cart/${productId}`,
        "PUT",
        {
          quantity,
        }
      );

      setCart(data);
    } catch (err) {
      setCart(previousCart);
      toast.error(err.message || "Failed to update quantity");
    } finally {
      setLoading((prev) => ({ ...prev, update: false, itemId: null }));
    }
  };

  // 💖 WISHLIST FUNCTIONS
  const fetchWishlist = async () => {
    try {
      const data = await makeRequest(`${apiUrl}/user/wishlist`, "GET");
      setWishlist(data);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const toggleWishlist = async (product) => {
    if (!currentUser) {
      toast.error("You must be logged in to manage your wishlist");
      return;
    }
    if (loadingWishlist || !product?._id) return;

    setLoadingWishlist(true);

    const alreadyInWishlist = wishlist.some((item) => item._id === product._id);
    const previousWishlist = [...wishlist];
    const optimisticWishlist = alreadyInWishlist
      ? wishlist.filter((item) => item._id !== product._id)
      : [...wishlist, product];

    setWishlist(optimisticWishlist);

    if (alreadyInWishlist) {
      toast.info(`${product.name} removed from wishlist`);
    } else {
      toast.success(`${product.name} added to wishlist`);
    }

    try {
      const { wishlist: updatedWishlist } = await makeRequest(
        `${apiUrl}/user/wishlist/${product._id}`,
        "POST"
      );
      setWishlist(updatedWishlist);
    } catch (err) {
      setWishlist(previousWishlist);
      toast.error(err.message || "Failed to update wishlist");
    }

    setLoadingWishlist(false);
  };

  const checkWishlistStatus = async (productId) => {
    try {
      const { isInWishlist } = await makeRequest(
        `${apiUrl}/user/wishlist/check/${productId}`,
        "GET"
      );
      return isInWishlist;
    } catch (err) {
      console.error("Error checking wishlist:", err);
      return false;
    }
  };

  // 👤 PROFILE FUNCTIONS
  const updateUserProfile = async (updatedUserData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await makeRequest(
        `${apiUrl}/user/update`,
        "PUT",
        updatedUserData
      );
      setCurrentUser(data.user);
      toast.success("Profile updated successfully");
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
      await makeRequest(`${apiUrl}/user/change-password`, "PUT", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
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
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};