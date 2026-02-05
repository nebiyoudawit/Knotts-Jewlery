import React from "react";
import { FaStar, FaRegStar, FaHeart, FaShoppingBag, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { motion } from 'framer-motion';

const ProductItem = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;
  const BASE_URL = API_BASE.replace("/api", "");

  const getImageUrl = () => {
    const image = product.image || (product.images?.[0] ?? "");
    if (!image) return "/default-product.jpg";
    if (image.startsWith("http")) return image;
    return `${BASE_URL}${image}`;
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 h-full hover:border-gray-200"
    >
      {/* Image Container - Made more compact */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Link to={`/product/${product._id}`} className="block pt-[90%] relative">
          {/* Main Image */}
          <img
            src={getImageUrl()}
            alt={product.name}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-105' : 'scale-100'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-product.jpg";
            }}
            loading="lazy"
          />

          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
          )}

          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </Link>

        {/* Mobile Wishlist Button (Always visible on mobile) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlist}
          className={`md:hidden absolute top-3 right-3 z-20 w-8 h-8 rounded-full shadow-md backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
            isWishlisted
              ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
              : "bg-white/90 text-gray-700 hover:text-rose-500"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FaHeart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Sale Badge - Smaller */}
        {product.onSale && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-3 left-3 z-10"
          >
            <span className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          </motion.div>
        )}

        {/* Quick Actions Overlay - More compact (Hidden on mobile, visible on hover on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
          className="hidden md:flex absolute bottom-3 left-1/2 transform -translate-x-1/2 gap-1.5 z-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full bg-white shadow-md backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-emerald-600 transition-colors duration-200"
            aria-label="Quick View"
            onClick={() => {
              window.location.href = `/product/${product._id}`;
            }}
          >
            <FaEye className="h-3.5 w-3.5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full shadow-md backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
              isWishlisted
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                : "bg-white text-gray-700 hover:text-rose-500"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FaHeart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
        </motion.div>
      </div>

      {/* Product Details - More compact padding */}
      <div className="flex flex-col flex-grow p-4">
        <div className="mb-2">
          {/* Category - Smaller text */}
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
            {product.category}
          </span>

          {/* Product Name - More compact */}
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 hover:text-emerald-600 transition-colors duration-200 text-sm leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating with Review Count - More compact */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) =>
              i < (product.rating || 0) ? (
                <FaStar key={i} className="h-3 w-3 text-amber-400 fill-current" />
              ) : (
                <FaStar key={i} className="h-3 w-3 text-gray-300" />
              )
            )}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price Section - More compact layout */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-900">
                {product.price?.toFixed(2) || "59.99"}birr
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {product.originalPrice.toFixed(2)}birr
                </span>
              )}
            </div>
            
            {/* Stock Indicator - Smaller */}
            {product.stock && product.stock < 10 && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Low Stock
              </span>
            )}
          </div>

          {/* Add to Cart Button - More compact */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-800 hover:to-emerald-900 transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <FaShoppingBag className="h-3.5 w-3.5 transition-transform duration-200 group-hover/button:scale-105" />
            <span>Add to Cart</span>
          </motion.button>
        </div>
      </div>

      {/* Subtle Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-100 rounded-xl transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default ProductItem;