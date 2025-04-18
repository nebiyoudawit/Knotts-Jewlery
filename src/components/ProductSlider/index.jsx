import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductItem from '../ProductItem';
import jewelryProducts from '../../data/jewelryProducts'; // Import from external file

const ProductSlider = ({ items = 3, category = 'All' }) => {
  const filteredProducts = category === 'All' 
    ? jewelryProducts 
    : jewelryProducts.filter(product => product.category === category);

  return (
    <Swiper
      slidesPerView={items}
      spaceBetween={20}
      navigation={true}
      modules={[Navigation]}
      breakpoints={{
        320: { slidesPerView: 2 }, // 2 item on mobile
        640: { slidesPerView: 3 }, // 3 items on tablet
        1024: { slidesPerView: items } // specified items on desktop
      }}
      className="mySwiper"
    >
      {filteredProducts.map((product) => (
        <SwiperSlide key={product.id}>
          <ProductItem product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductSlider;