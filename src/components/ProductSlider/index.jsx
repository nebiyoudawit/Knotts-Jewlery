import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductItem from '../ProductItem';
import { motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

const ProductSlider = ({ items = 3, sortBy = 'latest', category = 'All' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = new URL(`${apiUrl}/product/sorted`);
        url.searchParams.append('sortBy', sortBy);
        url.searchParams.append('limit', 8);
        if (category && category !== 'All') {
          url.searchParams.append('category', category);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy, category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 rounded-full" />
            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin absolute top-0 left-0" />
          </div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl text-red-700 shadow-lg">
          <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="font-semibold">Error: {error}</span>
        </div>
      </motion.div>
    );
  }

  if (!products.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="inline-flex flex-col items-center gap-4 px-10 py-8 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold mb-1">No products found</p>
            <p className="text-gray-500 text-sm">Check back soon for new arrivals</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative px-1"
    >
      {/* Custom Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 pointer-events-none">
        <div className="container mx-auto relative">
          <motion.button
            whileHover={{ scale: 1.1, x: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => swiperInstance?.slidePrev()}
            className="absolute -left-4 lg:-left-6 w-12 h-12 rounded-full bg-white shadow-xl hover:shadow-2xl border-2 border-gray-100 flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:border-emerald-200 transition-all duration-300 pointer-events-auto group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, x: 4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => swiperInstance?.slideNext()}
            className="absolute -right-4 lg:-right-6 w-12 h-12 rounded-full bg-white shadow-xl hover:shadow-2xl border-2 border-gray-100 flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:border-emerald-200 transition-all duration-300 pointer-events-auto group"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* Swiper Slider */}
      <Swiper
        onSwiper={setSwiperInstance}
        slidesPerView={items}
        spaceBetween={24}
        navigation={false}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={products.length > items}
        modules={[Navigation, Autoplay]}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 12 },
          640: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: items, spaceBetween: 24 }
        }}
        className="productSwiper !pb-2"
      >
        {products.map((product, index) => (
          <SwiperSlide key={product._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <ProductItem product={product} />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Pagination Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {products.length > items && [...Array(Math.ceil(products.length / items))].map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            onClick={() => swiperInstance?.slideTo(index * items)}
            className="w-2 h-2 rounded-full bg-gray-300 hover:bg-emerald-500 transition-all duration-300"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ProductSlider;
