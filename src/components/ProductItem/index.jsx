import React from "react";
import {
  FaStar,
  FaRegStar,
  FaRegHeart,
  FaHeart,
  FaShoppingBag,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";

const ProductItem = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  console.log("Product in ProductItem:", product);
  console.log("Product images:", product.images);

  // Handle image URL - check if it's already a full URL or needs the server prefix
  const getImageUrl = () => {
    const image = product.images?.[0];
    if (!image) return "/default-product.jpg";

    if (image.startsWith("http")) return image;

    const filename = image.split("/").pop();
    const fullUrl = `http://localhost:5000/uploads/${filename}`;
    console.log("Resolved Image URL:", fullUrl); // Add this
    return fullUrl;
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 h-full">
      {/* Product Image with Wishlist Button */}
      <div className="relative pt-[100%]">
        <Link to={`/product/${product._id}`}>
          <img
            src={getImageUrl()}
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-product.jpg";
            }}
          />
        </Link>

        {/* Sale section */}
        {product.onSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            SALE
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`absolute top-3 right-3 p-2 rounded-full transition-all shadow-sm
        ${
          isWishlisted
            ? "bg-pink-100 hover:bg-pink-200"
            : "bg-white/90 hover:bg-white"
        }`}
          onClick={() => toggleWishlist(product)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? (
            <FaHeart className="h-5 w-5 text-pink-500 hover:text-pink-600 transition-colors" />
          ) : (
            <FaRegHeart className="h-5 w-5 text-gray-500 hover:text-pink-500 transition-colors" />
          )}
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow p-4">
        <span className="text-xs uppercase text-gray-500 mb-1">
          {product.category}
        </span>
        <Link to={`/product/${product._id}`} className="link">
          <h3 className="font-medium mb-1 text-gray-900 lg:line-clamp-1 line-clamp-2 overflow-hidden text-ellipsis hover:text-[#05B171] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex mr-1">
            {[...Array(5)].map((_, i) =>
              i < (product.rating || 4) ? (
                <FaStar key={i} className="h-3 w-3 text-yellow-400" />
              ) : (
                <FaRegStar key={i} className="h-3 w-3 text-yellow-400" />
              )
            )}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900 mr-[13px]">
            {product.price?.toFixed(2) || "59.99"}
            <span className="text-sm truncate"> birr</span>
          </span>
          {product.originalPrice && (
            <span className="text-xs lg:text-sm text-gray-500 line-through">
              {product.originalPrice.toFixed(2)}
              <span className="text-[10px] truncate"> birr</span>
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          className="w-full py-2 bg-[#05B171] text-white rounded-md font-medium 
          hover:bg-[#048a5b] transition-colors duration-200 flex items-center 
          justify-center gap-2 text-sm mt-auto"
          onClick={() => addToCart(product)}
        >
          <FaShoppingBag className="h-3 w-3" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
