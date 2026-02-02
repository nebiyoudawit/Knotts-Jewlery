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
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full hover:border-gray-200"
    >
      {/* Image Container with Hover Effects */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Link to={`/product/${product._id}`} className="block pt-[100%] relative">
          {/* Main Image */}
          <img
            src={getImageUrl()}
            alt={product.name}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
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

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        </Link>

        {/* Sale Badge - Modern Design */}
        {product.onSale && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 z-10"
          >
            <span className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg backdrop-blur-sm">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          </motion.div>
        )}

        {/* Quick Actions Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-white shadow-lg backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-emerald-600 transition-colors duration-300"
            aria-label="Quick View"
            onClick={() => {
              window.location.href = `/product/${product._id}`;
            }}
          >
            <FaEye className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
              isWishlisted
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                : "bg-white text-gray-700 hover:text-rose-500"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FaHeart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
        </motion.div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow p-5">
        <div className="mb-3">
          {/* Category */}
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
            {product.category}
          </span>

          {/* Product Name */}
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors duration-300 text-sm md:text-base leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating with Review Count */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) =>
              i < (product.rating || 0) ? (
                <FaStar key={i} className="h-3.5 w-3.5 text-amber-400 fill-current" />
              ) : (
                <FaStar key={i} className="h-3.5 w-3.5 text-gray-300" />
              )
            )}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price Section - Modern Layout */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                {product.price?.toFixed(2) || "59.99"}birr
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {product.originalPrice.toFixed(2)}birr
                </span>
              )}
            </div>
            
            {/* Stock Indicator */}
            {product.stock && product.stock < 10 && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Low Stock
              </span>
            )}
          </div>

          {/* Add to Cart Button with Hover Effect */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-800 hover:to-emerald-900 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 group/button"
          >
            <FaShoppingBag className="h-4 w-4 transition-transform duration-300 group-hover/button:scale-110" />
            <span>Add to Cart</span>
          </motion.button>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-200 rounded-2xl transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
};

export default ProductItem;