import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaFilter, FaStar, FaRegStar } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Drawer } from "@mui/material";
import { useShop } from "../../context/ShopContext";
import { Helmet } from "react-helmet-async";
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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [urlSearchTerm]); // refetch when URL search term changes

  // Sync selectedCategory state from urlCategory param for UI
  useEffect(() => {
    setSelectedCategory(urlCategory ? categoryMap[urlCategory] : null);
  }, [urlCategory]);

  // Frontend filtering of products based on category, price range, ratings, sorting (all client side)
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

  const categories = useMemo(
    () => [...new Set(allProducts.map((p) => p.category))],
    [allProducts]
  );

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setRatingsFilter(null);
    setSortOption("featured");
    if (allProducts.length > 0) {
      const prices = allProducts.map((p) => p.price);
      setPriceRange([Math.min(...prices), Math.max(...prices)]);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05B171]"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shop All Jewelry | Knott's Jewelry</title>
        <meta
          name="description"
          content="Browse our full collection of high-quality rings, bracelets, earrings, and more."
        />
        <link
          rel="canonical"
          href="https://knotts-jewlery-xjku.vercel.app/product"
        />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Mobile Filter/Sort */}
          <div className="flex md:hidden justify-between items-center gap-4 mb-6">
            <button
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <FaFilter /> Filters
            </button>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="featured">Featured</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Mobile Filter Drawer */}
          <Drawer
            anchor="bottom"
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            sx={{
              "& .MuiDrawer-paper": {
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                padding: "20px",
                maxHeight: "80vh",
              },
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="overflow-y-auto pb-4">
              {selectedCategory && (
                <div className="mb-4 p-2 bg-gray-100 rounded-md">
                  <p className="font-medium">Current Category:</p>
                  <p className="text-[#05B171]">{selectedCategory}</p>
                  <button
                    className="text-sm text-gray-500 hover:underline mt-1"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear category
                  </button>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="flex justify-between mb-2">
                  <span>{priceRange[0]} birr</span>
                  <span>{priceRange[1]} birr</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full"
                />
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="radio"
                        id={`category-${category}`}
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category}`}>{category}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Customer Ratings</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className={`flex items-center cursor-pointer ${
                        ratingsFilter === rating ? "font-medium" : ""
                      }`}
                      onClick={() =>
                        setRatingsFilter(
                          rating === ratingsFilter ? null : rating
                        )
                      }
                    >
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) =>
                          i < rating ? (
                            <FaStar
                              key={i}
                              className="h-4 w-4 text-yellow-400"
                            />
                          ) : (
                            <FaRegStar
                              key={i}
                              className="h-4 w-4 text-yellow-400"
                            />
                          )
                        )}
                      </div>
                      <span>& Up</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleClearFilters}
                >
                  Clear All
                </button>
                <button
                  className="flex-1 bg-[#05B171] text-white py-2 rounded-md hover:bg-[#048a5b] transition-colors"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Show Results
                </button>
              </div>
            </div>
          </Drawer>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Desktop Filters */}
            <div className="hidden md:block w-full md:w-64 bg-white p-6 rounded-lg shadow-sm h-fit sticky top-20">
              <h2 className="text-lg font-bold mb-4">Filters</h2>

              {selectedCategory && (
                <div className="mb-4 p-2 bg-gray-100 rounded-md">
                  <p className="font-medium">Current Category:</p>
                  <p className="text-[#05B171]">{selectedCategory}</p>
                  <button
                    className="text-sm text-gray-500 hover:underline mt-1"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear category
                  </button>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="flex justify-between mb-2">
                  <span>{priceRange[0]} birr</span>
                  <span>{priceRange[1]} birr</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full"
                />
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="radio"
                        id={`category-${category}`}
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category}`}>{category}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Customer Ratings</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className={`flex items-center cursor-pointer ${
                        ratingsFilter === rating ? "font-medium" : ""
                      }`}
                      onClick={() =>
                        setRatingsFilter(
                          rating === ratingsFilter ? null : rating
                        )
                      }
                    >
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) =>
                          i < rating ? (
                            <FaStar
                              key={i}
                              className="h-4 w-4 text-yellow-400"
                            />
                          ) : (
                            <FaRegStar
                              key={i}
                              className="h-4 w-4 text-yellow-400"
                            />
                          )
                        )}
                      </div>
                      <span>& Up</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="w-full bg-[#05B171] text-white py-2 rounded-md hover:bg-[#048a5b] transition-colors"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </button>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="hidden md:flex justify-between items-center mb-10">
                <h1 className="text-2xl font-bold">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "Product" : "Products"}
                  {selectedCategory && ` in ${selectedCategory}`}
                  {urlSearchTerm && ` matching "${urlSearchTerm}"`}
                </h1>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="featured">Featured</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              <div className="md:hidden mb-4">
                <h1 className="text-xl font-bold">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "Product" : "Products"}
                  {selectedCategory && ` in ${selectedCategory}`}
                  {urlSearchTerm && ` matching "${urlSearchTerm}"`}
                </h1>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {filteredProducts.map((product) => (
                    <ProductItem
                      key={product._id}
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isInWishlist={wishlist.some(
                        (item) => item._id === product._id
                      )}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg text-center">
                  <h3 className="text-lg font-medium mb-2">
                    No products found.
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search term.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductListing;
