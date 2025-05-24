import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductItem from '../ProductItem';

const ProductSlider = ({ items = 3, sortBy = 'latest', category = 'All' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = new URL('http://localhost:5000/api/products/sorted');
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

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  if (!products.length) return <div className="text-center py-12">No products found</div>;

  return (
    <Swiper
      slidesPerView={items}
      spaceBetween={20}
      navigation={true}
      modules={[Navigation]}
      breakpoints={{
        320: { slidesPerView: 2 },
        640: { slidesPerView: 3 },
        1024: { slidesPerView: items }
      }}
      className="mySwiper"
    >
      {products.map((product) => (
        <SwiperSlide key={product._id}>
          <ProductItem product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductSlider;
