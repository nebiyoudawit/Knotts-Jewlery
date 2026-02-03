import React from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaHeart, FaRegHeart, FaShoppingBag, FaArrowRight, FaLock, FaTruck, FaChevronLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../../context/ShopContext";

const CartPage = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
    toggleWishlist,
    wishlist,
  } = useShop();

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Handle image URL - check if it's already a full URL or needs the server prefix
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x300";
    if (imagePath.includes("http")) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaShoppingBag className="text-gray-400 text-3xl sm:text-4xl" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 text-center px-4">
              Start adding items to your cart
            </p>
            <Link to="/product">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#05B171] text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-[#048a5b] transition-all font-medium inline-flex items-center gap-2"
              >
                Browse Products
                <FaArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Cart Items - Takes full width on mobile */}
            <div className="flex-1 lg:flex-[2]">
              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence mode="popLayout">
                  {cart.map((item, index) => {
                    const isWishlisted = wishlist.some((w) => w._id === item._id);
                    return (
                      <motion.div
                        layout
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-3 sm:p-4">
                          <div className="flex gap-3 sm:gap-4">
                            {/* Product Image */}
                            <Link to={`/product/${item._id}`} className="shrink-0">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                  src={getImageUrl(item.images?.[0])}
                                  alt={item.name}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/300x300";
                                  }}
                                />
                              </div>
                            </Link>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2 mb-1">
                                <Link
                                  to={`/product/${item._id}`}
                                  className="font-semibold text-sm sm:text-base text-gray-900 hover:text-[#05B171] transition-colors line-clamp-2"
                                >
                                  {item.name}
                                </Link>
                                <button
                                  onClick={() => removeFromCart(item._id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                >
                                  <FaTimes className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <p className="text-xs sm:text-sm text-gray-500 mb-2">{item.category}</p>

                              {/* Price & Quantity Row */}
                              <div className="flex items-center justify-between gap-3 mt-3">
                                {/* Price */}
                                <div>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                                      {item.price.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-600">birr</span>
                                  </div>
                                  {item.originalPrice && (
                                    <span className="text-xs text-gray-400 line-through">
                                      {item.originalPrice.toFixed(2)} birr
                                    </span>
                                  )}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-0 bg-gray-100 rounded-lg">
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 hover:bg-gray-200 rounded-l-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <span className="text-base sm:text-lg font-medium">−</span>
                                  </button>
                                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-sm sm:text-base text-gray-900 min-w-[40px] sm:min-w-[50px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 hover:bg-gray-200 rounded-r-lg transition-colors"
                                  >
                                    <span className="text-base sm:text-lg font-medium">+</span>
                                  </button>
                                </div>
                              </div>

                              {/* Actions Row */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <button
                                  onClick={() => toggleWishlist(item)}
                                  className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-red-500 transition-colors"
                                >
                                  {isWishlisted ? (
                                    <FaHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                                  ) : (
                                    <FaRegHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  )}
                                  <span>{isWishlisted ? "Saved" : "Save for later"}</span>
                                </button>
                                
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Total</p>
                                  <p className="text-base sm:text-lg font-bold text-[#05B171]">
                                    {(item.price * item.quantity).toFixed(2)} birr
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Continue Shopping Link */}
              <div className="mt-6">
                <Link
                  to="/product"
                  className="inline-flex items-center gap-2 text-[#05B171] hover:text-[#048a5b] font-medium transition-colors text-sm sm:text-base"
                >
                  <FaChevronLeft className="h-3.5 w-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Order Summary - Sticky on desktop, bottom sheet style on mobile */}
            <div className="w-full lg:w-96 lg:shrink-0 mb-20 lg:mb-0">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 lg:sticky lg:top-24 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#05B171] to-[#048a5b] p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Order Summary</h2>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Summary Items */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                      <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} birr</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-bold text-[#05B171]">
                        {subtotal.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">birr</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link to="/checkout">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#05B171] text-white py-3.5 sm:py-4 rounded-lg sm:rounded-xl hover:bg-[#048a5b] transition-all font-semibold shadow-lg flex items-center justify-center gap-2 text-base sm:text-lg mb-3"
                    >
                      <FaLock className="h-4 w-4" />
                      Proceed to Checkout
                    </motion.button>
                  </Link>

                  {/* Trust Badges */}
                  <div className="space-y-2.5 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
                      <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                        <FaTruck className="h-3.5 w-3.5 text-[#05B171]" />
                      </div>
                      <span>Free delivery at Summit, 4 Kilo, Megenagna, Figa only</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                        <FaLock className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <span>Secure payment processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;