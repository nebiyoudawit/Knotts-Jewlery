import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CollectionSlider = () => {
  const collections = [
    {
      title: "Golden A Bracelets",
      description: "Handwoven silk thread bracelets with sterling silver accents. Each piece is crafted using traditional techniques that have been perfected over generations.",
      image: "/braclets.jpg",
      cta: "View Bracelets"
    },
    {
      title: "Golden Charm Necklaces",
      description: "18k gold plated charm necklaces featuring delicate pendants. Our collection includes birthstone charms, zodiac symbols, and custom engravings.",
      image: "/jewelry-necklaces.jpg",
      cta: "View Necklaces"
    },
    {
      title: "Vintage Signet Rings",
      description: "Heirloom-quality signet rings cast in solid sterling silver or 14k gold. Featuring traditional family crest designs or customizable with your initials.",
      image: "/rings.jpg",
      cta: "View Rings"
    },
  ];

  return (
    <div className="flex justify-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards]}
          className="w-[300px] h-[480px] md:w-[450px] md:h-[600px] lg:w-[520px] lg:h-[640px]"
        >
          {collections.map((collection, index) => (
            <SwiperSlide 
              key={index}
              className="relative flex flex-col justify-between rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Background Image with Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>
              <img 
                src={collection.image} 
                alt={collection.title}
                className="absolute w-full h-full object-cover"
              />
              
              {/* Content */}
              <div className="relative z-20 h-full flex flex-col justify-end p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                      {collection.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-200 leading-relaxed">
                      {collection.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link to="/product">
                    <button className="group inline-flex items-center gap-2 px-8 py-4 bg-[#05B171] text-white rounded-full hover:bg-[#048a5b] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1">
                      <span className="font-semibold">{collection.cta}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </motion.div>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-6 right-6 z-20">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </div>
  );
};

export default CollectionSlider;
