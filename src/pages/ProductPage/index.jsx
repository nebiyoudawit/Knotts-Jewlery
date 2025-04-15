import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaShoppingBag, FaChevronLeft } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useShop } from '../../context/ShopContext';
import jewelryProducts from '../../data/jewelryProducts';

const ProductPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Use shop context for cart and wishlist functionality
  const { 
    addToCart, 
    toggleWishlist, 
    wishlist,
    cart 
  } = useShop();

  // Find the current product
  const product = jewelryProducts.find(p => p.id === parseInt(id));

  // Check if product is in wishlist
  const isWishlisted = wishlist.some(item => item.id === product?.id);

  // Set related products when product changes
  useEffect(() => {
    if (product) {
      const related = jewelryProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Link 
          to="/products" 
          className="bg-[#05B171] text-white px-6 py-2 rounded-md hover:bg-[#048a5b] transition-colors inline-flex items-center gap-2"
        >
          <IoMdArrowRoundBack /> Back to Products
        </Link>
      </div>
    );
  }

  // Sample image gallery
  const imageGallery = [
    product.imageUrl,
    product.imageUrl, // Replace with actual different images
    product.imageUrl,
    product.imageUrl
  ];

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Add the product to cart with selected quantity
    const productWithQuantity = { ...product, quantity };
    addToCart(productWithQuantity);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#05B171]">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/product" className="hover:text-[#05B171]">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back Button (Mobile) */}
        <Link 
          to="/product" 
          className="md:hidden flex items-center gap-2 mb-6 text-[#05B171] hover:underline"
        >
          <FaChevronLeft /> Back to Products
        </Link>

        {/* Main Product Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <img 
                src={imageGallery[selectedImage]} 
                alt={product.name}
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {imageGallery.map((img, index) => (
                <button
                  key={index}
                  className={`bg-white p-1 rounded-md border ${selectedImage === index ? 'border-[#05B171]' : 'border-gray-200'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-16 object-cover rounded-md"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
                <button 
                  onClick={handleToggleWishlist}
                  className="text-2xl text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>

              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    i < product.rating ? 
                    <FaStar key={i} className="h-5 w-5 text-yellow-400" /> : 
                    <FaRegStar key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviewCount} reviews)</span>
              </div>

              <div className="mb-6">
                <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through ml-2">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.onSale && (
                  <span className="ml-2 bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                    On Sale
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Details</h2>
                <ul className="text-gray-700 space-y-1">
                  <li><strong>Category:</strong> {product.category}</li>
                  <li><strong>Material:</strong> Sterling Silver</li>
                  <li><strong>Shipping:</strong> Free delivery on all orders</li>
                </ul>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex items-center border border-gray-300 rounded-md mr-4">
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => handleQuantityChange(-1)}
                  >
                    -
                  </button>
                  <span className="px-3 py-2">{quantity}</span>
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#05B171] text-white px-6 py-3 rounded-md hover:bg-[#048a5b] transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingBag /> Add to Cart (${(product.price * quantity).toFixed(2)})
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span>Free shipping</span>
                  <span>•</span>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
                  <Link to={`/product/${relatedProduct.id}`} className="block">
                    <div className="relative pt-[100%] bg-gray-100">
                      <img 
                        src={relatedProduct.imageUrl} 
                        alt={relatedProduct.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      {relatedProduct.onSale && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          SALE
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${relatedProduct.id}`}>
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-[#05B171] transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-1">
                        {[...Array(5)].map((_, i) => (
                          i < relatedProduct.rating ? 
                          <FaStar key={i} className="h-3 w-3 text-yellow-400" /> : 
                          <FaRegStar key={i} className="h-3 w-3 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({relatedProduct.reviewCount})</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-lg font-bold">${relatedProduct.price.toFixed(2)}</span>
                      {relatedProduct.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${relatedProduct.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;