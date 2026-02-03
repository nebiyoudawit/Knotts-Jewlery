import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaArrowRight, FaGem, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../../context/ShopContext";
import ProductItem from "../../components/ProductItem";

const ITEMS_PER_PAGE = 4;

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart, wishlistCount } = useShop();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pagination whenever wishlist changes
  useEffect(() => {
    const totalPages = Math.ceil(wishlist.length / ITEMS_PER_PAGE);
    setTotalPages(totalPages || 1);
    
    // Reset to page 1 if current page is beyond total pages
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
    
    // Get items for current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = wishlist.slice(startIndex, endIndex);
    setPaginatedItems(currentItems);
  }, [wishlist, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of product grid
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <motion.button
          key={i}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-all ${
            currentPage === i
              ? "bg-gradient-to-r from-[#05B171] to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          {i}
        </motion.button>
      );
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-emerald-50/40">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-100/30 to-rose-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-[1]">
        {/* Header with Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl blur-lg opacity-40"></div>
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FaHeart className="text-white text-xl sm:text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                My Wishlist
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {wishlistCount} {wishlistCount === 1 ? "Product" : "Products"} saved for later
              </p>
            </div>
          </div>
        </motion.div>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 sm:py-32"
          >
            {/* Animated Empty State */}
            <div className="relative mb-8 lg:mt-[-100px]">
              {/* Pulsing rings */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-xl"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.2, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-lg"
              />
              
              {/* Main icon circle */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <FaHeart className="text-gray-300 text-5xl sm:text-6xl" />
                </motion.div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">
              Your wishlist is waiting
            </h2>
            <p className="text-gray-500 mb-8 text-center max-w-md px-4 text-base sm:text-lg">
              Discover beautiful jewelry pieces and save your favorites to build your dream collection
            </p>
            
            <Link to="/product">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-[#05B171] to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-[#05B171] transition-all font-semibold inline-flex items-center gap-3 shadow-lg shadow-emerald-500/25"
              >
                <FaGem className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Explore Collection
                <FaArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Filter/Sort Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-gray-200/50 shadow-sm gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{wishlistCount}</span>
                  <span>items in your collection</span>
                </div>
                {totalPages > 1 && (
                  <div className="text-xs sm:text-sm text-gray-500">
                    (Page {currentPage} of {totalPages})
                  </div>
                )}
              </div>
              <Link
                to="/product"
                className="text-[#05B171] hover:text-emerald-700 font-medium text-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
              >
                Add more
                <FaArrowRight className="h-3 w-3" />
              </Link>
            </motion.div>

            {/* Wishlist Grid using ProductItem */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`page-${currentPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8"
              >
                {paginatedItems.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <ProductItem product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mb-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <FaChevronLeft className="h-4 w-4" />
                </motion.button>

                {renderPageNumbers()}

                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <FaChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Items per page info */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-gray-500 mb-8"
              >
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, wishlistCount)}-
                {Math.min(currentPage * ITEMS_PER_PAGE, wishlistCount)} of {wishlistCount} items
              </motion.div>
            )}

            {/* Bottom CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 sm:p-12 text-center border border-emerald-100/50 shadow-sm mb-20 lg:mb-0"
            >
              <div className="max-w-2xl mx-auto">
                <div className="w-12 h-12 bg-gradient-to-br from-[#05B171] to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                  <FaGem className="text-white text-xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  Looking for more Products?
                </h3>
                <p className="text-gray-600 mb-6">
                  Discover our complete collection of handcrafted jewelry pieces
                </p>
                <Link to="/product">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#05B171] to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-[#05B171] transition-all font-semibold inline-flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    Browse All Products
                    <FaArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;