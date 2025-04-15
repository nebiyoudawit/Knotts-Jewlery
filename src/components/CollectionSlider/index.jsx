import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';
import { Link } from 'react-router-dom';

const CollectionSlider = () => {
  const collections = [
    {
      title: "Golden A Bracelets",
      description: "Handwoven silk thread bracelets with sterling silver accents. Each piece is crafted using traditional techniques that have been perfected over generations. Perfect for both casual and formal occasions.",
      image: "/braclets.jpg",
      cta: "View Bracelets Collection"
    },
    {
      title: "Golden Charm Necklaces",
      description: "18k gold plated charm necklaces featuring delicate pendants. Our collection includes birthstone charms, zodiac symbols, and custom engravings. Each piece comes with a 24-inch adjustable chain.",
      image: "/jewelry-necklaces.jpg",
      cta: "View Necklaces Collection"
    },
    {
      title: "Vintage Signet Rings",
      description: "Heirloom-quality signet rings cast in solid sterling silver or 14k gold. Featuring traditional family crest designs or customizable with your initials. Available in sizes 4-12 with half sizes available.",
      image: "/rings.jpg",
      cta: "View Rings Collection"
    },
  ];

  return (
    <div className="flex justify-center py-8 px-4">
      <Swiper
        effect={'cards'}
        grabCursor={true}
        modules={[EffectCards]}
        className="w-[300px] h-[420px] md:w-[450px] md:h-[550px] lg:w-[500px] lg:h-[550px]"
      >
        {collections.map((collection, index) => (
          <SwiperSlide 
            key={index}
            className="relative flex flex-col justify-between rounded-xl overflow-hidden bg-gradient-to-t from-black/80 via-black/50 to-transparent"
          >
            {/* Background Image */}
            <img 
              src={collection.image} 
              alt={collection.title}
              className="absolute w-full h-full object-cover -z-10"
            />
            
            {/* Title and Description */}
            <div className="p-6 pt-8 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">{collection.title}</h3>
              <p className="text-sm md:text-base opacity-90 leading-relaxed text-gray-100">{collection.description}</p>
            </div>

            {/* View Collection Button - Fixed at Bottom */}
            <div className="p-6 w-full flex justify-center">
              <Link to={"/product"} >
              <button className="px-6 py-3 bg-[#05B171] text-white rounded-full border-2 border-[#048a5b] hover:bg-[#048a5b] transition-all text-sm font-medium tracking-wide shadow-lg">
                {collection.cta}
              </button>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default CollectionSlider;