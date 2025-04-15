// src/pages/WishlistPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingBag, FaTimes, FaStar, FaRegStar } from 'react-icons/fa';
import { useShop } from '../../context/ShopContext';

const WishlistPage = () => {
  const { 
    wishlist, 
    toggleWishlist, 
    addToCart,
    wishlistCount 
  } = useShop();

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist ({wishlistCount})</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaHeart className="text-gray-400 text-3xl" />
          </div>
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save items you love to buy them later</p>
          <Link 
            to="/product" 
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 relative">
              {/* Remove from wishlist button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all shadow-sm z-10"
                aria-label="Remove from wishlist"
              >
                <FaHeart className="h-4 w-4 text-pink-500" />
              </button>
              
              {/* Product Image */}
              <Link to={`/product/${product.id}`} className="block relative pt-[100%]">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </Link>
              
              {/* Product Details */}
              <div className="p-4">
                <Link to={`/product/${product.id}`} className="block mb-1">
                  <span className="text-xs uppercase text-gray-500">{product.category}</span>
                  <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex mr-1">
                    {[...Array(5)].map((_, i) =>
                      i < product.rating ? (
                        <FaStar key={i} className="h-3 w-3 text-yellow-400" />
                      ) : (
                        <FaRegStar key={i} className="h-3 w-3 text-gray-300" />
                      )
                    )}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviewCount})</span>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-md font-semibold text-gray-900">
                    {product.price.toFixed(2)} birr
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {product.originalPrice.toFixed(2)} birr
                    </span>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full py-2 bg-emerald-100 text-emerald-800 rounded-md font-medium 
                            hover:bg-emerald-200 transition-colors duration-200 flex items-center 
                            justify-center gap-2 text-sm"
                >
                  <FaShoppingBag className="h-3 w-3" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;