// src/pages/CartPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaHeart, FaRegHeart, FaShoppingBag } from 'react-icons/fa';
import { useShop } from '../../context/ShopContext';

const CartPage = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartCount,
    toggleWishlist,
    wishlist
  } = useShop();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Your Cart ({cartCount})</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaShoppingBag className="text-gray-400 text-3xl" />
          </div>
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
          <Link 
            to="/product" 
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 border-b">
                <div className="col-span-5 font-medium text-gray-600">Product</div>
                <div className="col-span-2 font-medium text-gray-600">Price</div>
                <div className="col-span-3 font-medium text-gray-600">Quantity</div>
                <div className="col-span-2 font-medium text-gray-600">Total</div>
              </div>
              
              {/* Cart Items */}
              {cart.map(item => (
                <div key={item.id} className="p-4 border-b last:border-b-0 group">
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-4">
                    {/* Product Info */}
                    <div className="md:col-span-5 flex items-start gap-4">
                      <Link to={`/product/${item.id}`} className="shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded border border-gray-200"
                        />
                      </Link>
                      <div>
                        <Link to={`/product/${item.id}`} className="font-medium hover:text-emerald-600">
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <div className="flex items-center mt-1">
                          <button 
                            onClick={() => toggleWishlist(item)}
                            className="text-sm flex items-center gap-1 text-gray-500 hover:text-pink-500"
                          >
                            {wishlist.some(w => w.id === item.id) ? (
                              <FaHeart className="text-pink-500" size={14} />
                            ) : (
                              <FaRegHeart size={14} />
                            )}
                            <span>{wishlist.some(w => w.id === item.id) ? 'Saved' : 'Save for later'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="md:col-span-2 flex items-center">
                      <span className="font-medium">
                        {item.price.toFixed(2)} birr
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          {item.originalPrice.toFixed(2)} birr
                        </span>
                      )}
                    </div>
                    
                    {/* Quantity */}
                    <div className="md:col-span-3 flex items-center">
                      <div className="flex items-center border border-gray-300 rounded-md w-fit">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x border-gray-300">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="md:col-span-2 flex items-center justify-between">
                      <span className="font-medium">
                        {(item.price * item.quantity).toFixed(2)} birr
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.id, item.name)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3 mb-10">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} birr</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold text-lg">{subtotal.toFixed(2)} birr</span>
              </div>

              <Link to="/checkout">
                <button className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 transition-colors font-medium">
                  Proceed to Checkout
                </button>
              </Link>
              <div className="mt-4 text-center">
                <Link to="/product" className="text-emerald-600 hover:underline text-sm">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
