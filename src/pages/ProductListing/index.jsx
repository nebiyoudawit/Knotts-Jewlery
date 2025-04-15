import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaShoppingBag, FaFilter } from 'react-icons/fa';
import { useShop } from '../../context/ShopContext';
import jewelryProducts from '../../data/jewelryProducts';

const ProductListing = () => {
  const { category: urlCategory } = useParams();
  const {
    addToCart,
    toggleWishlist,
    wishlist,
    cart
  } = useShop();

  const categoryMap = {
    bracelets: "Bracelets",
    charms: "Charms",
    earrings: "Earrings",
    rings: "Rings",
    necklaces: "Necklaces"
  };

  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ratingsFilter, setRatingsFilter] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (urlCategory && categoryMap[urlCategory]) {
      setSelectedCategory(categoryMap[urlCategory]);
    } else {
      setSelectedCategory(null);
    }
  }, [urlCategory]);

  const filteredProducts = jewelryProducts.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (ratingsFilter && Math.floor(product.rating) < ratingsFilter) return false;
    return true;
  });

  const categories = [...new Set(jewelryProducts.map(product => product.category))];

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <button 
          className="md:hidden flex items-center gap-2 mb-4 bg-white px-4 py-2 rounded-lg shadow-sm"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <FaFilter /> Filters
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white p-6 rounded-lg shadow-sm h-fit sticky top-20`}>
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
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
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
                {[4, 3, 2, 1].map(rating => (
                  <div 
                    key={rating} 
                    className={`flex items-center cursor-pointer ${ratingsFilter === rating ? 'font-medium' : ''}`}
                    onClick={() => setRatingsFilter(rating === ratingsFilter ? null : rating)}
                  >
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        i < rating ? 
                        <FaStar key={i} className="h-4 w-4 text-yellow-400" /> : 
                        <FaRegStar key={i} className="h-4 w-4 text-yellow-400" />
                      ))}
                    </div>
                    <span>& Up</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="w-full bg-[#05B171] text-white py-2 rounded-md hover:bg-[#048a5b] transition-colors"
              onClick={() => {
                setSelectedCategory(null);
                setPriceRange([0, 200]);
                setRatingsFilter(null);
              }}
            >
              Clear All Filters
            </button>
          </div>

          {/* Products grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-2xl font-bold">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                {selectedCategory && ` in ${selectedCategory}`}
              </h1>
              <div>
                <select className="border rounded-md px-3 py-2">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {filteredProducts.map(product => {
                  const isWishlisted = wishlist.some(item => item.id === product.id);
                  return (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
                      {/* Product Image */}
                      <div className="relative pt-[100%] bg-gray-100">
                        <Link to={`/product/${product.id}`}>
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </Link>
                        {product.onSale && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            SALE
                          </div>
                        )}
                        <button 
                          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full"
                          onClick={() => toggleWishlist(product)}
                          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          {isWishlisted ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart className="text-gray-600 hover:text-red-500" />
                          )}
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="mb-1">
                          <span className="text-xs uppercase text-gray-500">{product.category}</span>
                        </div>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-[#05B171] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center mb-2">
                          <div className="flex mr-1">
                            {[...Array(5)].map((_, i) => (
                              i < product.rating ? 
                              <FaStar key={i} className="h-3 w-3 text-yellow-400" /> : 
                              <FaRegStar key={i} className="h-3 w-3 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({product.reviewCount})</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-[#05B171] text-white py-2 rounded-md hover:bg-[#048a5b] flex items-center justify-center gap-2"
                        >
                          <FaShoppingBag /> Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">No products match your filters</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more products</p>
                <button 
                  className="text-[#05B171] hover:underline"
                  onClick={() => {
                    setSelectedCategory(null);
                    setPriceRange([0, 200]);
                    setRatingsFilter(null);
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;