import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaShoppingBag, FaChevronLeft } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useShop } from '../../context/ShopContext';
import ProductItem from '../../components/ProductItem';

const ProductPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    addToCart, 
    toggleWishlist, 
    wishlist,
    currentUser
  } = useShop();

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    user: currentUser ? currentUser.name : ''
  });
  

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch product details
        const productResponse = await fetch(`http://localhost:5000/api/products/${id}`);
        
        if (!productResponse.ok) {
          const errorData = await productResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch product');
        }

        const productData = await productResponse.json();
        
        if (!productData.success || !productData.data) {
          throw new Error('Invalid product data received');
        }

        setProduct(productData.data);
        
        // Fetch related products if category exists
        if (productData.data.category) {
          const relatedResponse = await fetch(
            `http://localhost:5000/api/products/category/${productData.data.category}?limit=4`
          );
          
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            const filteredRelated = relatedData.data
              .filter(p => p._id !== productData.data._id)
              .slice(0, 4);
            setRelatedProducts(filteredRelated);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, comment: e.target.value });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please login to submit a review');
      return;
    }
    if (newReview.rating === 0 || !newReview.comment.trim()) {
      alert('Please provide both a rating and comment');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const responseData = await response.json();
      
      // Update local state with new review
      setProduct(prev => ({
        ...prev,
        reviews: [...prev.reviews, responseData.data],
        rating: responseData.updatedProduct.rating,
        reviewCount: responseData.updatedProduct.reviewCount
      }));
      
      setNewReview({ rating: 0, comment: '', user: currentUser.name });
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.message);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + change)));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ 
        ...product, 
        quantity,
        id: product._id // Ensure we use the correct ID field
      });
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist({
        ...product,
        id: product._id // Ensure we use the correct ID field
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05B171]"></div>
        <h1 className="text-2xl font-bold mt-4">Loading Product...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FiXCircle className="inline-block text-4xl text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error Loading Product</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link 
          to="/products" 
          className="bg-[#05B171] text-white px-6 py-2 rounded-md hover:bg-[#048a5b] transition-colors inline-flex items-center gap-2"
        >
          <IoMdArrowRoundBack /> Back to Products
        </Link>
      </div>
    );
  }

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

  // Prepare image gallery
  const imageGallery = product.images && product.images.length > 0 
    ? product.images.map(img => img.url)
    : ['/placeholder.jpg'];

  const isWishlisted = wishlist.some(item => item._id === product._id);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation breadcrumbs */}
        <nav className="flex mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#05B171]">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-[#05B171]">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product main content */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Product images */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <img 
                src={imageGallery[selectedImage]} 
                alt={product.name}
                className="w-full h-auto rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
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
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <button 
                  onClick={handleToggleWishlist}
                  className="text-2xl"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400 hover:text-red-500" />}
                </button>
              </div>

              {/* Rating and price */}
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

              {/* Description and details */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Details</h2>
                <ul className="text-gray-700 space-y-1">
                  <li><strong>Category:</strong> {product.category}</li>
                  {product.material && <li><strong>Material:</strong> {product.material}</li>}
                  <li><strong>Shipping:</strong> Free delivery on all orders</li>
                </ul>
              </div>

              {/* Add to cart section */}
              <div className="flex items-center mb-6 gap-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 w-10"
                    onClick={() => handleQuantityChange(-1)}
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-center flex-1">{quantity}</span>
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 w-10"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#05B171] text-white px-6 py-3 rounded-md hover:bg-[#048a5b] transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingBag /> 
                  <span>Add to Cart (${(product.price * quantity).toFixed(2)})</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Free shipping</span>
                  <span>•</span>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="flex mr-4">
                {[...Array(5)].map((_, i) => (
                  i < product.rating ? 
                  <FaStar key={i} className="h-6 w-6 text-yellow-400" /> : 
                  <FaRegStar key={i} className="h-6 w-6 text-yellow-400" />
                ))}
              </div>
              <span className="text-lg font-semibold">{product.rating.toFixed(1)} out of 5</span>
            </div>
            <p className="text-gray-700">{product.reviewCount} customer reviews</p>
          </div>

          {/* Review form */}
          {currentUser && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Your Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="text-2xl focus:outline-none mr-1"
                      >
                        {star <= newReview.rating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-yellow-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="review" className="block text-gray-700 mb-2">Your Review</label>
                  <textarea
                    id="review"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05B171]"
                    value={newReview.comment}
                    onChange={handleReviewChange}
                    placeholder="Share your thoughts about this product..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-[#05B171] text-white px-6 py-2 rounded-md hover:bg-[#048a5b] transition-colors"
                  disabled={!newReview.rating || !newReview.comment.trim()}
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          <div className="space-y-6">
            {product.reviews.map(review => (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{review.user?.name || 'Anonymous'}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    i < review.rating ? 
                    <FaStar key={i} className="h-4 w-4 text-yellow-400" /> : 
                    <FaRegStar key={i} className="h-4 w-4 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductItem 
                  key={relatedProduct._id} 
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;