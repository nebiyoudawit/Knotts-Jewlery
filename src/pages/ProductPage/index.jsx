import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaHeart,
  FaRegHeart,
  FaShoppingBag,
  FaChevronRight,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaUser,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../../context/ShopContext";
import ProductItem from "../../components/ProductItem";

const apiUrl = import.meta.env.VITE_API_URL;

const ProductPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const { addToCart, toggleWishlist, wishlist, currentUser } = useShop();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const productResponse = await fetch(`${apiUrl}/product/${id}`);

        if (!productResponse.ok) {
          const errorData = await productResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch product");
        }

        const productData = await productResponse.json();

        if (!productData.success || !productData.data) {
          throw new Error("Invalid product data received");
        }

        setProduct(productData.data);

        if (productData.data.category) {
          const relatedResponse = await fetch(
            `${apiUrl}/product/category/${productData.data.category}?limit=4`
          );

          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            const filteredRelated = relatedData.data
              .filter((p) => p._id !== productData.data._id)
              .slice(0, 4);
            setRelatedProducts(filteredRelated);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + change)));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });

  const handleRatingChange = (rating) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleReviewChange = (e) => {
    setNewReview((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
      setReviewLoading(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in to post a review.");

      const response = await fetch(`${apiUrl}/product/${product._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setProduct((prev) => ({
        ...prev,
        reviews: [
          ...prev.reviews,
          {
            _id: data.data._id,
            rating: data.data.rating,
            comment: data.data.comment,
            user: { name: currentUser.name },
            createdAt: new Date().toISOString(),
          },
        ],
        rating: data.updatedProduct.rating,
        reviewCount: data.updatedProduct.reviewCount,
      }));

      setNewReview({ rating: 0, comment: "" });
    } catch (error) {
      console.error("Review submit error:", error.message);
      alert(error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background for loading */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-emerald-200/40 to-cyan-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#05B171] border-t-transparent mb-3 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-emerald-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        </div>
        <div className="text-center px-4 relative z-10">
          <p className="text-gray-600 mb-4">{error || "Product not found"}</p>
          <Link
            to="/product"
            className="text-[#05B171] hover:text-[#048a5b] font-medium"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const getImageUrl = (image) => {
    if (!image) return "/placeholder.jpg";
    if (image.startsWith("http")) return image;
    const filename = image.split("/").pop();
    return `http://localhost:5000/uploads/${filename}`;
  };

  const imageGallery =
    product.images && product.images.length > 0
      ? product.images.map((img) =>
          typeof img === "string" ? getImageUrl(img) : getImageUrl(img.url)
        )
      : ["/placeholder.jpg"];
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-purple-50 relative overflow-hidden">
      {/* Vibrant Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-r from-emerald-300/30 via-cyan-300/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-gradient-to-r from-purple-300/30 via-pink-300/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-r from-cyan-300/30 to-blue-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] bg-emerald-400/50 rounded-full"
              initial={{
                x: Math.random() * 100 + 'vw',
                y: Math.random() * 100 + 'vh',
              }}
              animate={{
                y: [null, `-${Math.random() * 100}px`, `-${Math.random() * 200}px`],
                x: [null, `${Math.random() * 50 - 25}px`, `${Math.random() * 50 - 25}px`],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-1/4 w-32 h-32 border-2 border-emerald-200/30 rounded-lg rotate-45"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 border-2 border-purple-200/30 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 border-2 border-cyan-200/30 rotate-12"></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/5"></div>
      </div>

      {/* Breadcrumb - Simplified and without top nav */}
      <div className="relative z-10 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#05B171] transition-colors">
              Home
            </Link>
            <FaChevronRight className="h-3 w-3" />
            <Link to="/product" className="hover:text-[#05B171] transition-colors">
              Products
            </Link>
            <FaChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">{product.category}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-[1]">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {/* Image Gallery */}
          <div className="lg:col-span-1">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-3 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/20"
            >
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={imageGallery[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover max-h-[350px] sm:max-h-[400px] lg:max-h-none"
                onError={(e) => {
                  e.target.src = "/placeholder.jpg";
                }}
              />
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {imageGallery.map((img, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden border-2 transition-all shadow-md hover:shadow-lg ${
                    selectedImage === index
                      ? "border-[#05B171] shadow-lg shadow-emerald-500/30"
                      : "border-white/50 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-xl border border-white/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block bg-gradient-to-r from-emerald-100 to-cyan-100 text-[#05B171] text-xs font-semibold px-3 py-1 rounded-full mb-3"
                  >
                    {product.category}
                  </motion.span>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) =>
                        i < product.rating ? (
                          <FaStar key={i} className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <FaRegStar key={i} className="h-4 w-4 text-gray-300" />
                        )
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-full transition-all shadow-sm ${
                    isWishlisted
                      ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-500 shadow-red-200/50"
                      : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-400 hover:from-red-50 hover:to-pink-50 hover:text-red-500"
                  }`}
                >
                  {isWishlisted ? (
                    <FaHeart className="h-5 w-5" />
                  ) : (
                    <FaRegHeart className="h-5 w-5" />
                  )}
                </motion.button>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200/50">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-600">birr</span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-400 line-through ml-2">
                      {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {product.onSale && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
                    >
                      SALE
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200/50 mb-4">
                  <motion.button
                    whileHover={{ y: -2 }}
                    onClick={() => setActiveTab("description")}
                    className={`px-4 py-2 font-medium text-sm transition-all ${
                      activeTab === "description"
                        ? "text-[#05B171] border-b-2 border-[#05B171]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Description
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2 }}
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-2 font-medium text-sm transition-all ${
                      activeTab === "details"
                        ? "text-[#05B171] border-b-2 border-[#05B171]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Details
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2 }}
                    onClick={() => setActiveTab("shipping")}
                    className={`px-4 py-2 font-medium text-sm transition-all ${
                      activeTab === "shipping"
                        ? "text-[#05B171] border-b-2 border-[#05B171]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Shipping
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "description" && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-700 text-sm leading-relaxed"
                    >
                      {product.description}
                    </motion.div>
                  )}
                  {activeTab === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 text-sm"
                    >
                      {product.material && (
                        <div className="flex justify-between py-2 border-b border-gray-100/50">
                          <span className="text-gray-600">Material</span>
                          <span className="text-gray-900 font-medium">{product.material}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-gray-100/50">
                        <span className="text-gray-600">Category</span>
                        <span className="text-gray-900 font-medium">{product.category}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">SKU</span>
                        <span className="text-gray-900 font-mono text-xs">{product._id.slice(-8)}</span>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "shipping" && (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 text-sm"
                    >
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-lg border border-emerald-100/50">
                        <FaTruck className="h-5 w-5 text-[#05B171] mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Free Delivery</p>
                          <p className="text-gray-600 text-xs">Available at Summit, 4 Kilo, Megenagna, Figa, Gerji</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100/50">
                        <FaUndo className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Easy Returns</p>
                          <p className="text-gray-600 text-xs">30-day return policy on all items</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100/50">
                        <FaShieldAlt className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Authenticity Guaranteed</p>
                          <p className="text-gray-600 text-xs">Certified handcrafted jewelry</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="pt-6 border-t border-gray-200/50">
                <div className="flex flex-wrap gap-3">
                  {/* Quantity */}
                  <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200/50 shadow-sm">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2.5 hover:bg-gray-200/50 rounded-l-lg transition-colors disabled:opacity-30"
                    >
                      <span className="text-lg font-medium">−</span>
                    </button>
                    <span className="px-6 py-2.5 font-semibold text-gray-900 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      className="px-4 py-2.5 hover:bg-gray-200/50 rounded-r-lg transition-colors disabled:opacity-30"
                    >
                      <span className="text-lg font-medium">+</span>
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(5, 177, 113, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white py-2.5 px-6 rounded-lg hover:from-[#048a5b] hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/40 flex items-center justify-center gap-2 font-semibold"
                  >
                    <FaShoppingBag className="h-4 w-4" />
                    Add to Cart · {(product.price * quantity).toFixed(2)} birr
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-white/90 to-emerald-50/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Customer Reviews</h2>
                <p className="text-gray-600">See what our customers are saying</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) =>
                      i < product.rating ? (
                        <FaStar key={i} className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <FaRegStar key={i} className="h-5 w-5 text-gray-300" />
                      )
                    )}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{product.reviewCount} total reviews</p>
              </div>
            </div>

            {/* Write Review */}
            {currentUser ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-sm border border-white/50">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUser className="h-4 w-4 text-[#05B171]" />
                  Write Your Review
                </h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRatingChange(star)}
                        >
                          {star <= newReview.rating ? (
                            <FaStar className="h-7 w-7 text-yellow-400" />
                          ) : (
                            <FaRegStar className="h-7 w-7 text-gray-300" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Comment
                    </label>
                    <textarea
                      id="review"
                      rows="4"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05B171] focus:border-transparent resize-none transition-all"
                      value={newReview.comment}
                      onChange={handleReviewChange}
                      placeholder="Share your experience with this product..."
                    ></textarea>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(5, 177, 113, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-gradient-to-r from-[#05B171] to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-[#048a5b] hover:to-emerald-700 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !newReview.rating ||
                      !newReview.comment.trim() ||
                      reviewLoading
                    }
                  >
                    {reviewLoading ? "Posting..." : "Post Review"}
                  </motion.button>
                </form>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 rounded-xl p-6 text-center mb-6 shadow-sm border border-white/50">
                <p className="text-gray-700 mb-3">Sign in to leave a review</p>
                <Link
                  to="/login"
                  className="inline-block bg-gradient-to-r from-[#05B171] to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-[#048a5b] hover:to-emerald-700 transition-all shadow-md font-semibold"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#05B171] to-emerald-600 flex items-center justify-center text-white font-semibold shadow-md">
                          {(review.user?.name || review.name || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.user?.name || review.name || "Anonymous"}
                          </h4>
                          <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) =>
                              i < review.rating ? (
                                <FaStar key={i} className="h-3.5 w-3.5 text-yellow-400" />
                              ) : (
                                <FaRegStar key={i} className="h-3.5 w-3.5 text-gray-300" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </motion.div>
                ))
              ) : (
                <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 rounded-xl p-12 text-center shadow-sm border border-white/50">
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">You May Also Like</h2>
                <p className="text-gray-600 text-sm">Curated selections just for you</p>
              </div>
              <Link 
                to="/product" 
                className="text-[#05B171] hover:text-[#048a5b] font-medium text-sm flex items-center gap-2 group"
              >
                View All
                <FaChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-emerald-200/50">
                    <ProductItem product={relatedProduct} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;