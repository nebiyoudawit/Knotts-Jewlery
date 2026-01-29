import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductItem from '../ProductItem';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

const ProductSlider = ({ items = 3, sortBy = 'latest', category = 'All' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#05B171] animate-spin" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600">
          <span className="text-sm font-medium">No products found</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Swiper
        slidesPerView={items}
        spaceBetween={24}
        navigation={true}
        modules={[Navigation]}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 16 },
          640: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: items, spaceBetween: 24 }
        }}
        className="productSwiper !pb-12"
        style={{
          '--swiper-navigation-color': '#05B171',
          '--swiper-navigation-size': '32px',
        }}
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
    </motion.div>
  );
};

export default ProductSlider;
