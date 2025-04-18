import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaFilter, FaStar, FaRegStar } from 'react-icons/fa';
import { useShop } from '../../context/ShopContext';
import jewelryProducts from '../../data/jewelryProducts';
import ProductItem from '../../components/ProductItem';

const ProductListing = () => {
  const { category: urlCategory } = useParams();
  const { addToCart, toggleWishlist, wishlist } = useShop();

  const categoryMap = {
    bracelets: "Bracelets",
    charms: "Charms",
    earrings: "Earrings",
    rings: "Rings",
    necklaces: "Necklaces",
  };

  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ratingsFilter, setRatingsFilter] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('featured');

  useEffect(() => {
    if (urlCategory && categoryMap[urlCategory]) {
      setSelectedCategory(categoryMap[urlCategory]);
    } else {
      setSelectedCategory(null);
    }
  }, [urlCategory]);

  const filteredProducts = jewelryProducts
    .filter(product => {
      if (selectedCategory && product.category !== selectedCategory) return false;
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      if (ratingsFilter && Math.floor(product.rating) < ratingsFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'lowToHigh') return a.price - b.price;
      if (sortOption === 'highToLow') return b.price - a.price;
      if (sortOption === 'newest') return b.id - a.id;
      return 0;
    });

  const categories = [...new Set(jewelryProducts.map(product => product.category))];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        
        {/* Mobile: Filter + Sort */}
        <div className="flex md:hidden justify-between items-center gap-4 mb-6">
          <button 
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <FaFilter /> Filters
          </button>
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Filters Sidebar */}
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

          {/* Products Grid + Header */}
          <div className="flex-1">
            {/* Desktop: Product Count & Sort */}
            <div className="hidden md:flex justify-between items-center mb-10">
              <h1 className="text-2xl font-bold">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                {selectedCategory && ` in ${selectedCategory}`}
              </h1>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* Mobile: Product Count */}
            <div className="md:hidden mb-4">
              <h1 className="text-xl font-bold">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                {selectedCategory && ` in ${selectedCategory}`}
              </h1>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {filteredProducts.map(product => (
                  <ProductItem key={product.id} product={product} />
                ))}
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
