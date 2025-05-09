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
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    user: 'Anonymous'
  });
  
  const { 
    addToCart, 
    toggleWishlist, 
    wishlist,
    cart 
  } = useShop();

  const isWishlisted = product ? wishlist.some(item => item.id === product._id) : false;

  useEffect(() => {
    console.log("Product ID from URL params:", id);
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productResponse = await fetch(`http://localhost:5000/api/products/${id}`);
        
        if (!productResponse.ok) {
          throw new Error('Failed to fetch product');
        }
        console.log('Raw product response:', productResponse);
        const productData = await productResponse.json();
        setProduct(productData.data);
        setReviews(productData.data.reviews || []);
        
        // Fetch related products
        const relatedResponse = await fetch(`/api/products?category=${productData.data.category}`);
        if (!relatedResponse.ok) {
          throw new Error('Failed to fetch related products');
        }
        const relatedData = await relatedResponse.json();
        const filteredRelated = relatedData.data
          .filter(p => p._id !== productData.data._id)
          .slice(0, 4);
        setRelatedProducts(filteredRelated);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const imageGallery = product 
    ? [
        product.imageUrl,
        ...(product.additionalImages || []).slice(0, 3) // Show up to 3 additional images
      ]
    : [];

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, comment: e.target.value });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0 || !newReview.comment.trim()) return;
    
    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const responseData = await response.json();
      
      setReviews([...reviews, responseData.data]);
      setNewReview({ rating: 0, comment: '', user: 'Anonymous' });
      
      // Update product rating
      if (product) {
        setProduct({
          ...product,
          rating: responseData.updatedProduct.rating,
          reviewCount: responseData.updatedProduct.reviewCount
        });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const productWithQuantity = { 
        ...product, 
        quantity,
        id: product._id // Ensure we use the correct ID field
      };
      addToCart(productWithQuantity);
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
        <h1 className="text-2xl font-bold mb-4">Loading Product...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full max-w-full md:container md:mx-auto px-0 md:px-4 py-4 md:py-8">
        <nav className="flex px-4 md:px-0 mb-4 md:mb-6 text-sm text-gray-600 overflow-x-auto whitespace-nowrap md:overflow-visible md:whitespace-normal">
          <Link to="/" className="hover:text-[#05B171]">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/product" className="hover:text-[#05B171]">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 truncate max-w-[120px] md:max-w-none inline-block">{product.name}</span>
        </nav>

        <Link 
          to="/product" 
          className="md:hidden flex items-center gap-2 px-4 mb-4 text-[#05B171] hover:underline text-sm"
        >
          <FaChevronLeft /> Back to Products
        </Link>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 md:mb-12 w-full">
          <div className="w-full md:w-1/2 px-0 md:px-0">
            <div className="bg-white p-2 md:p-4 rounded-none md:rounded-lg shadow-sm md:shadow-md mb-3">
              <img 
                src={imageGallery[selectedImage]} 
                alt={product.name}
                className="w-full h-auto rounded-none md:rounded-lg object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-1 md:gap-2 px-2 md:px-0">
              {imageGallery.map((img, index) => (
                <button
                  key={index}
                  className={`bg-white p-1 rounded-md border ${selectedImage === index ? 'border-[#05B171]' : 'border-gray-200'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-14 md:h-16 object-cover rounded-md"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2 px-4 md:px-0">
            <div className="bg-white p-4 md:p-6 rounded-none md:rounded-lg shadow-sm md:shadow-md">
              <div className="flex justify-between items-start">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{product.name}</h1>
                <button 
                  onClick={handleToggleWishlist}
                  className="text-xl md:text-2xl text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>

              <div className="flex items-center mb-3 md:mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    i < product.rating ? 
                    <FaStar key={i} className="h-4 md:h-5 w-4 md:w-5 text-yellow-400" /> : 
                    <FaRegStar key={i} className="h-4 md:h-5 w-4 md:w-5 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm md:text-base text-gray-600">({product.reviewCount} reviews)</span>
              </div>

              <div className="mb-4 md:mb-6">
                <span className="text-xl md:text-2xl font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-base md:text-lg text-gray-500 line-through ml-2">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.onSale && (
                  <span className="ml-2 bg-red-100 text-red-600 text-xs md:text-sm px-2 py-1 rounded">
                    On Sale
                  </span>
                )}
              </div>

              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Description</h2>
                <p className="text-sm md:text-base text-gray-700">{product.description}</p>
              </div>

              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Details</h2>
                <ul className="text-sm md:text-base text-gray-700 space-y-1">
                  <li><strong>Category:</strong> {product.category}</li>
                  <li><strong>Material:</strong> {product.material || 'Sterling Silver'}</li>
                  <li><strong>Shipping:</strong> Free delivery on all orders</li>
                </ul>
              </div>

              <div className="flex flex-col md:flex-row items-center mb-4 md:mb-6 gap-3">
                <div className="flex items-center border border-gray-300 rounded-md w-full md:w-auto">
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
                  className="w-full md:w-auto bg-[#05B171] text-white px-6 py-3 rounded-md hover:bg-[#048a5b] transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingBag /> 
                  <span className="whitespace-nowrap">Add to Cart (${(product.price * quantity).toFixed(2)})</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-3 md:pt-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span>Free shipping</span>
                  <span>•</span>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-white p-4 md:p-6 rounded-none md:rounded-lg shadow-sm md:shadow-md">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Customer Reviews</h2>
          
          <div className="mb-6 md:mb-8">
            <div className="flex items-center mb-3 md:mb-4">
              <div className="flex mr-3 md:mr-4">
                {[...Array(5)].map((_, i) => (
                  i < product.rating ? 
                  <FaStar key={i} className="h-5 md:h-6 w-5 md:w-6 text-yellow-400" /> : 
                  <FaRegStar key={i} className="h-5 md:h-6 w-5 md:w-6 text-yellow-400" />
                ))}
              </div>
              <span className="text-base md:text-lg font-semibold">{product.rating.toFixed(1)} out of 5</span>
            </div>
            <p className="text-sm md:text-base text-gray-700">{reviews.length} customer reviews</p>
          </div>

          <div className="mb-6 md:mb-8 p-3 md:p-4 bg-gray-50 rounded-lg">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3 md:mb-4">
                <label className="block text-sm md:text-base text-gray-700 mb-1 md:mb-2">Your Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="text-xl md:text-2xl focus:outline-none mr-1"
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
              <div className="mb-3 md:mb-4">
                <label htmlFor="review" className="block text-sm md:text-base text-gray-700 mb-1 md:mb-2">Your Review</label>
                <textarea
                  id="review"
                  rows="3"
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05B171]"
                  value={newReview.comment}
                  onChange={handleReviewChange}
                  placeholder="Share your thoughts about this product..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-[#05B171] text-white px-4 md:px-6 py-2 rounded-md hover:bg-[#048a5b] transition-colors text-sm md:text-base"
                disabled={!newReview.rating || !newReview.comment.trim()}
              >
                Submit Review
              </button>
            </form>
          </div>

          <div className="space-y-4 md:space-y-6">
            {reviews.map(review => (
              <div key={review._id || review.id} className="border-b border-gray-200 pb-4 md:pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <h3 className="text-sm md:text-base font-semibold">{review.user}</h3>
                  <span className="text-xs md:text-sm text-gray-500">
                    {new Date(review.createdAt || review.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex mb-1 md:mb-2">
                  {[...Array(5)].map((_, i) => (
                    i < review.rating ? 
                    <FaStar key={i} className="h-3 md:h-4 w-3 md:w-4 text-yellow-400" /> : 
                    <FaRegStar key={i} className="h-3 md:h-4 w-3 md:w-4 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm md:text-base text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8 md:mt-16 px-4 md:px-0 mb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductItem 
                  key={relatedProduct._id} 
                  product={relatedProduct}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.some(item => item.id === relatedProduct._id)}
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