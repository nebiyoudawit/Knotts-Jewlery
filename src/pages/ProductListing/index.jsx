import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FaStar, FaRegStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { HiAdjustments } from "react-icons/hi";
import { Drawer } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../../context/ShopContext";
import ProductItem from "../../components/ProductItem";

const apiUrl = import.meta.env.VITE_API_URL;

const ProductListing = () => {
  const { category: urlCategory } = useParams();
  const location = useLocation();
  const { addToCart, toggleWishlist, wishlist } = useShop();

  const categoryMap = {
    bracelets: "Bracelets",
    charms: "Charms",
    earrings: "Earrings",
    rings: "Rings",
    necklaces: "Necklaces",
  };

  // State
  const [allProducts, setAllProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ratingsFilter, setRatingsFilter] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  
  // Pagination state - 8 products per page for both mobile and desktop
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Get search term from URL
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const urlSearchTerm = searchParams.get("search") || "";

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiUrl}/product?search=${encodeURIComponent(urlSearchTerm)}`
        );
        if (!response.ok) throw new Error("Failed to fetch products");

        const { data } = await response.json();

        // Fix image URLs
        const processedProducts = data.map((product) => ({
          ...product,
          image: product.image?.startsWith("uploads/")
            ? `http://localhost:5000/${product.image.replace(/\\/g, "/")}`
            : product.image || "/default-product.jpg",
        }));

        setAllProducts(processedProducts);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [urlSearchTerm]);

  // Sync selectedCategory state from urlCategory param for UI
  useEffect(() => {
    setSelectedCategory(urlCategory ? categoryMap[urlCategory] : null);
  }, [urlCategory]);

  // Frontend filtering of products
  const filteredProducts = useMemo(() => {
    let results = [...allProducts];

    if (selectedCategory) {
      results = results.filter((p) => p.category === selectedCategory);
    }

    results = results.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (ratingsFilter) {
      results = results.filter((p) => Math.floor(p.rating) >= ratingsFilter);
    }

    // Sorting
    switch (sortOption) {
      case "lowToHigh":
        return results.sort((a, b) => a.price - b.price);
      case "highToLow":
        return results.sort((a, b) => b.price - a.price);
      case "newest":
        return results.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      default:
        return results;
    }
  }, [allProducts, selectedCategory, priceRange, ratingsFilter, sortOption]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const categories = useMemo(
    () => [...new Set(allProducts.map((p) => p.category))],
    [allProducts]
  );

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setRatingsFilter(null);
    setSortOption("featured");
    setCurrentPage(1);
    if (allProducts.length > 0) {
      const prices = allProducts.map((p) => p.price);
      setPriceRange([Math.min(...prices), Math.max(...prices)]);
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (ratingsFilter) count++;
    if (allProducts.length > 0) {
      const prices = allProducts.map((p) => p.price);
      const maxPrice = Math.max(...prices);
      if (priceRange[1] < maxPrice) count++;
    }
    return count;
  }, [selectedCategory, ratingsFilter, priceRange, allProducts]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: document.querySelector('section.flex-1')?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mb-12"></div>
            <div className="flex gap-8">
              <div className="hidden lg:block w-64">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                  {[...Array(8)].map((_, i) => (
                    <div key={i}>
                      <div className="aspect-square bg-gray-200 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="py-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
                {selectedCategory || "All Products"}
              </h1>
              <p className="text-sm text-gray-600">
                Page {currentPage}: Showing {currentProducts.length} of {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                {urlSearchTerm && (
                  <span> for "<span className="text-gray-900">{urlSearchTerm}</span>"</span>
                )}
              </p>
            </div>

            {/* Desktop Sort */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-sm border-0 border-b border-gray-300 py-1 pr-8 focus:outline-none focus:border-gray-900 bg-transparent cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter/Sort Bar */}
        <div className="flex md:hidden gap-2 py-4 border-b border-gray-200">
          <button
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2.5 rounded-md text-sm font-medium hover:border-gray-900 transition-colors relative"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <HiAdjustments size={18} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 border border-gray-300 py-2.5 px-3 rounded-md text-sm font-medium focus:outline-none focus:border-gray-900 bg-white"
          >
            <option value="featured">Featured</option>
            <option value="lowToHigh">Price: Low - High</option>
            <option value="highToLow">Price: High - Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="left"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: "100%",
              maxWidth: "400px",
              padding: "0",
            },
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-gray-900">
                  Category
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="category-mobile"
                      checked={!selectedCategory}
                      onChange={() => {
                        setSelectedCategory(null);
                        setCurrentPage(1);
                      }}
                      className="mr-3 w-4 h-4 accent-gray-900"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      All Products
                    </span>
                  </label>
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={selectedCategory === category}
                        onChange={() => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                        }}
                        className="mr-3 w-4 h-4 accent-gray-900"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-gray-900">
                  Price
                </h3>
                <div className="flex justify-between mb-3 text-sm text-gray-600">
                  <span>{priceRange[0]} birr</span>
                  <span className="font-medium text-gray-900">{priceRange[1]} birr</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => {
                    setPriceRange([priceRange[0], parseInt(e.target.value)]);
                    setCurrentPage(1);
                  }}
                  className="w-full accent-gray-900"
                />
              </div>

              {/* Ratings */}
              <div>
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-gray-900">
                  Rating
                </h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className="flex items-center cursor-pointer group"
                      onClick={() => {
                        setRatingsFilter(rating === ratingsFilter ? null : rating);
                        setCurrentPage(1);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={ratingsFilter === rating}
                        onChange={() => {}}
                        className="mr-3 w-4 h-4 accent-gray-900"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) =>
                          i < rating ? (
                            <FaStar key={i} className="h-3.5 w-3.5 text-yellow-400" />
                          ) : (
                            <FaRegStar key={i} className="h-3.5 w-3.5 text-gray-300" />
                          )
                        )}
                        <span className="text-sm text-gray-700 ml-1 group-hover:text-gray-900">
                          & up
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 space-y-2">
              <button
                className="w-full bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                onClick={() => setMobileFiltersOpen(false)}
              >
                View {filteredProducts.length} Products
              </button>
              <button
                className="w-full border border-gray-300 text-gray-900 py-3 rounded-md font-medium hover:border-gray-900 transition-colors"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
            </div>
          </div>
        </Drawer>

        <div className="flex gap-8 py-8">
          {/* Desktop Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden lg:block w-64 flex-shrink-0 overflow-hidden"
              >
                <div className="pr-8 border-r border-gray-200 space-y-8">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide text-gray-900">
                      Category
                    </h3>
                    <div className="space-y-2.5">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          checked={!selectedCategory}
                          onChange={() => {
                            setSelectedCategory(null);
                            setCurrentPage(1);
                          }}
                          className="mr-3 w-4 h-4 accent-gray-900"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          All Products
                        </span>
                      </label>
                      {categories.map((category) => (
                        <label
                          key={category}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category}
                            onChange={() => {
                              setSelectedCategory(category);
                              setCurrentPage(1);
                            }}
                            className="mr-3 w-4 h-4 accent-gray-900"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide text-gray-900">
                      Price
                    </h3>
                    <div className="flex justify-between mb-3 text-sm text-gray-600">
                      <span>{priceRange[0]} birr</span>
                      <span className="font-medium text-gray-900">{priceRange[1]} birr</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => {
                        setPriceRange([priceRange[0], parseInt(e.target.value)]);
                        setCurrentPage(1);
                      }}
                      className="w-full accent-gray-900"
                    />
                  </div>

                  {/* Ratings */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide text-gray-900">
                      Rating
                    </h3>
                    <div className="space-y-2.5">
                      {[4, 3, 2, 1].map((rating) => (
                        <div
                          key={rating}
                          className="flex items-center cursor-pointer group"
                          onClick={() => {
                            setRatingsFilter(rating === ratingsFilter ? null : rating);
                            setCurrentPage(1);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={ratingsFilter === rating}
                            onChange={() => {}}
                            className="mr-3 w-4 h-4 accent-gray-900"
                          />
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) =>
                              i < rating ? (
                                <FaStar key={i} className="h-3.5 w-3.5 text-yellow-400" />
                              ) : (
                                <FaRegStar key={i} className="h-3.5 w-3.5 text-gray-300" />
                              )
                            )}
                            <span className="text-sm text-gray-700 ml-1 group-hover:text-gray-900 transition-colors">
                              & up
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm underline text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <section className="flex-1 min-w-0">
            {currentProducts.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8"
                >
                  {currentProducts.map((product) => (
                    <ProductItem
                      key={product._id}
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isInWishlist={wishlist.some((item) => item._id === product._id)}
                    />
                  ))}
                </motion.div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-medium mb-2 text-gray-900">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Try adjusting your filters or search to find what you're looking for.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="border border-gray-900 text-gray-900 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Pagination Component - ALWAYS VISIBLE */}
            <div className="mt-8 flex flex-col items-center mb-10 ">
              <div className="flex items-center justify-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-lg ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <FaChevronLeft size={16} />
                </button>

                {/* Page Numbers - Show single page as "1" if only one page exists */}
                {totalPages <= 1 ? (
                  <button
                    className="min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium bg-gray-900 text-white"
                  >
                    1
                  </button>
                ) : (
                  getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))
                )}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-2.5 rounded-lg ${
                    currentPage === totalPages || totalPages === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <FaChevronRight size={16} />
                </button>
              </div>

              {/* Page Info - ALWAYS VISIBLE */}
              <p className="mt-4 text-sm text-gray-600 mb-10 lg:mb-0">
                Page {currentPage} of {totalPages || 1} • 
                Showing {currentProducts.length} of {filteredProducts.length} products • 
                8 products per page
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProductListing;