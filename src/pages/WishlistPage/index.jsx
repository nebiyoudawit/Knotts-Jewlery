// src/pages/WishlistPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingBag, FaTimes, FaStar, FaRegStar } from 'react-icons/fa';
import { useShop } from '../../context/ShopContext';
import ProductItem from '../../components/ProductItem';

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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map(product => (
                  <ProductItem 
                    key={product.id} 
                    product={product}
                    onAddToCart={addToCart}
                    onToggleWishlist={toggleWishlist}
                    isInWishlist={wishlist.some(item => item.id === product.id)}
                  />
                ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;