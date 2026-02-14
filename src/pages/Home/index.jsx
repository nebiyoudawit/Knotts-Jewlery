import React from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import ProductSlider from "../../components/ProductSlider";
import Footer from "../../components/Footer";
import { Sparkles, Award, Shield, Truck, Heart } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const categories = [
    "All",
    "Bracelets",
    "Charms",
    "Earrings",
    "Rings",
    "Necklaces",
  ];

  const [bestTab, setBestTab] = React.useState(0);
  const [latestTab, setLatestTab] = React.useState(0);

  const [bestCategory, setBestCategory] = React.useState("All");
  const [latestCategory, setLatestCategory] = React.useState("All");

  const handleBestChange = (event, newValue) => {
    setBestTab(newValue);
    setBestCategory(categories[newValue]);
  };

  const handleLatestChange = (event, newValue) => {
    setLatestTab(newValue);
    setLatestCategory(categories[newValue]);
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Handcrafted Excellence",
      description:
        "Each piece is meticulously crafted by skilled artisans with attention to every detail",
      color: "from-amber-400 to-amber-600",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description:
        "We use only the finest materials to ensure lasting beauty and durability",
      color: "from-emerald-400 to-emerald-600",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Authentic & Genuine",
      description:
        "Every piece comes with a certificate of authenticity and quality guarantee",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Free Local Delivery",
      description:
        "Enjoy free delivery to Summit, 4 Kilo, Megenagna, and Figa areas",
      color: "from-purple-400 to-purple-600",
    },
  ];

  return (
    <main className="home-page pb-16 md:pb-0">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] max-h-[800px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-img2.jpg"
            alt="Beautiful Jewelry Collection"
            className="w-full h-full object-cover"
          />
          {/* Darker overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"></div>
        </div>

        <div className="container relative h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white mt-[-100px] md:mt-[-80px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block mb-4 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30"
            >
              <span className="text-emerald-300 text-sm font-medium">
                Handcrafted with Love
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Discover Our Exquisite Collections
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              Handcrafted jewelry that tells your unique story. Perfect pieces
              for every occasion.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                component={Link}
                to="/product"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#05B171",
                  "&:hover": { backgroundColor: "#048a5b" },
                  px: 6,
                  py: 1.5,
                  fontSize: "1rem",
                  borderRadius: "50px",
                  boxShadow: "0 4px 20px rgba(5, 177, 113, 0.4)",
                }}
              >
                Shop Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section - Replaces Featured Categories */}
      <section className="py-20 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              Why Choose Knotts Jewelry
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of craftsmanship, quality, and care
              in every piece we create
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                  {/* Icon with gradient background */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section
        id="best"
        className="py-20 bg-gradient-to-b from-white via-emerald-50/20 to-white"
      >
        <div className="container">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4">
              <Award className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-semibold uppercase tracking-wide">
                Customer Favorites
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Our Best Sellers
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover the pieces our customers can't get enough of - timeless
              designs that elevate every moment
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex flex-wrap justify-center gap-3 p-2 bg-white rounded-2xl shadow-lg border border-gray-100 w-full md:w-auto">
              {categories.map((cat, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBestChange(null, index)}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    bestTab === index
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div>
          {/* Product Slider */}
          <ProductSlider
            category={bestCategory}
            sortBy="bestsellers"
            items={5}
          />
        </div>
      </section>

      {/* Decorative Section Separator */}
      <div className="w-full py-16 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 flex justify-center">
        <div className="relative w-full max-w-4xl">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-emerald-200"></div>
          </div>
          <div className="relative flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring" }}
              className="bg-white px-8 py-4 rounded-full shadow-xl border-2 border-emerald-100"
            >
              <Heart className="w-6 h-6 text-emerald-600 fill-emerald-600" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <section
        id="latest"
        className="py-20 bg-gradient-to-b from-white via-purple-50/20 to-white"
      >
        <div className="container">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 text-sm font-semibold uppercase tracking-wide">
                Fresh & New
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              New Arrivals
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Be the first to discover our latest creations - designed to
              inspire and captivate
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex flex-wrap justify-center gap-3 p-2 bg-white rounded-2xl shadow-lg border border-gray-100 w-full md:w-auto">
              {categories.map((cat, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLatestChange(null, index)}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    latestTab === index
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Slider */}
          <ProductSlider category={latestCategory} sortBy="latest" items={5} />
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </main>
  );
};

export default Home;
