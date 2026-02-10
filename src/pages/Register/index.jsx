import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiArrowRight, FiEye, FiEyeOff, FiChevronLeft, FiStar, FiTruck, FiHome } from "react-icons/fi";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../../success-animation.json";
import { useShop } from "../../context/ShopContext";

const Register = () => {
  const { register } = useShop();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    setError("");
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          setLocationLoading(false);
          setFormData((prev) => ({ ...prev, address }));
        } catch (err) {
          setError("Failed to get address from location.");
          setLocationLoading(false);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setError(
            "Location access denied. Please enable location permissions in your browser settings and try again."
          );
        } else {
          setError("Unable to retrieve your location.");
        }
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const success = await register(formData);
    if (success) {
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate("/");
      }, 2000);
    } else {
      setError("Registration failed. Please check your inputs and try again.");
    }

    setLoading(false);
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-6 bg-white rounded-2xl shadow-2xl border border-gray-100"
      >
        <Lottie
          animationData={successAnimation}
          loop={false}
          autoplay={true}
          style={{ width: 180, height: 180 }}
        />
      </motion.div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {showSuccess && <SuccessModal />}

      {/* MOBILE VERSION - Updated to match login page styling */}
      <div className="lg:hidden min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Mobile Header - Clean Design with glass morphism */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-300/50 shadow-sm">
          <div className="px-5 py-4 flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform flex items-center gap-2"
            >
              <FiChevronLeft className="w-6 h-6" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <img src="/icons1.png" alt="Knotts Jewelry Logo" className="h-10 w-10" />
              <span className="text-lg font-bold text-gray-900">Knotts Jewelry</span>
            </div>

            {/* Home Button */}
            <button
              onClick={() => navigate("/")}
              className="p-2 -mr-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform flex items-center gap-2"
            >
              <FiHome className="w-6 h-6" />
              <span className="text-sm font-medium hidden sm:inline">Home</span>
            </button>
          </div>
        </div>

        {/* Modern Background with Depth for Mobile */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient Mesh Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(to right, #05B171 1px, transparent 1px),
                                linear-gradient(to bottom, #05B171 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Floating Elements with Depth */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-100/30 to-teal-100/20 rounded-full blur-3xl"
          ></motion.div>
          
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-tr from-green-100/20 to-emerald-100/10 rounded-full blur-3xl"
          ></motion.div>
        </div>

        {/* Mobile Welcome Section */}
        <div className="px-6 pt-8 pb-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Join Knotts Jewelry
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
              Create your account to discover exquisite handcrafted pieces for every occasion
            </p>
          </motion.div>
        </div>

        {/* Mobile Form Container with Glass Morphism */}
        <div className="flex-1 px-5 pb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-5 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-500 text-gray-400">
                    <FiUser className="text-base" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full pl-10 pr-3 py-3.5 bg-white/80 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-500 text-base backdrop-blur-sm"
                    placeholder="Nebiyou Dawit"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-500 text-gray-400">
                    <FiMail className="text-base" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full pl-10 pr-3 py-3.5 bg-white/80 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-500 text-base backdrop-blur-sm"
                    placeholder="aberakeb21@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-500 text-gray-400">
                    <FiLock className="text-base" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-3.5 bg-white/80 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-500 text-base backdrop-blur-sm"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 active:scale-95"
                  >
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-500 text-gray-400">
                    <FiPhone className="text-base" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full pl-10 pr-3 py-3.5 bg-white/80 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-500 text-base backdrop-blur-sm"
                    placeholder="0979968808"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Address Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="address">
                    Delivery Address
                  </label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                  >
                    {locationLoading ? (
                      <>
                        <svg
                          className="animate-spin h-3.5 w-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Locating...</span>
                      </>
                    ) : (
                      <>
                        <FiMapPin className="h-4 w-4" />
                        <span>Use Current Location</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3 z-500 text-gray-400">
                    <FiMapPin className="text-base" />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    className="w-full pl-10 pr-3 py-3.5 bg-white/80 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-500 text-base backdrop-blur-sm resize-none"
                    placeholder="akaki kality addis ababa ethiopia"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 active:shadow-lg ${loading ? "opacity-90 cursor-not-allowed" : ""
                    }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Create Account</span>
                      <FiArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500 text-sm font-medium">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <Link
              to="/login"
              className="block w-full py-3.5 border-2 border-gray-300/50 text-gray-800 rounded-xl font-semibold text-center text-base hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 active:scale-[0.98] backdrop-blur-sm"
            >
              Sign In Instead
            </Link>
          </motion.div>
        </div>
      </div>

      {/* DESKTOP VERSION */}
      <div className="hidden lg:flex flex-col lg:flex-row lg:h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* LEFT SIDE - Desktop only with Floating Jewelry */}
        <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-[#05B171] via-emerald-600 to-teal-700 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
                backgroundSize: '60px 60px'
              }}></div>
            </div>

            {/* Floating Jewelry Items - Bracelets */}
            <motion.div
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-20 left-20 w-32 h-32 opacity-20"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="8" />
                <circle cx="30" cy="30" r="6" fill="white" />
                <circle cx="70" cy="30" r="6" fill="white" />
                <circle cx="70" cy="70" r="6" fill="white" />
                <circle cx="30" cy="70" r="6" fill="white" />
                <circle cx="50" cy="20" r="6" fill="white" />
                <circle cx="80" cy="50" r="6" fill="white" />
                <circle cx="50" cy="80" r="6" fill="white" />
                <circle cx="20" cy="50" r="6" fill="white" />
              </svg>
            </motion.div>

            {/* Earring 1 */}
            <motion.div
              animate={{
                y: [0, -25, 0],
                x: [0, 15, 0],
                rotate: [0, 20, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute bottom-32 left-32 w-20 h-20 opacity-30"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="20" r="8" fill="white" />
                <line x1="50" y1="28" x2="50" y2="45" stroke="white" strokeWidth="3" />
                <polygon points="50,45 35,75 65,75" fill="white" />
                <circle cx="50" cy="60" r="5" fill="#05B171" />
              </svg>
            </motion.div>

            {/* Bracelet 2 */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-2/3 right-20 w-28 h-28 opacity-25"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="6" />
                <circle cx="50" cy="20" r="5" fill="white" />
                <circle cx="80" cy="50" r="5" fill="white" />
                <circle cx="50" cy="80" r="5" fill="white" />
                <circle cx="20" cy="50" r="5" fill="white" />
                <circle cx="65" cy="25" r="4" fill="#14b8a6" />
                <circle cx="75" cy="65" r="4" fill="#14b8a6" />
                <circle cx="35" cy="75" r="4" fill="#14b8a6" />
                <circle cx="25" cy="35" r="4" fill="#14b8a6" />
              </svg>
            </motion.div>

            {/* Decorative sparkles */}
            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 left-1/2 w-8 h-8"
            >
              <FiStar className="w-full h-full text-white" />
            </motion.div>

            <motion.div
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-1/3 left-1/3 w-6 h-6"
            >
              <FiStar className="w-full h-full text-white" />
            </motion.div>

            <motion.div
              animate={{
                opacity: [0.4, 0.9, 0.4],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute top-1/2 right-1/4 w-7 h-7"
            >
              <FiStar className="w-full h-full text-white" />
            </motion.div>
          </div>

          <div className="relative z-10 flex flex-col justify-center p-8 text-white w-full h-full">
            {/* Desktop Header with Back and Home buttons */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <img src="/icons1.png" alt="Knotts Jewelry Logo" className="h-12 transition-transform group-hover:scale-105" />
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Knotts Jewelry</h2>
                </div>
              </Link>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <FiHome className="w-5 h-5" />
                  <span>Home</span>
                </button>
              </div>
            </div>

            <div className="max-w-xl px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  Welcome to
                  <br />
                  <span className="text-emerald-200">Knotts Jewelry</span>
                  <br />
                  Family
                </h1>
                <p className="text-lg text-emerald-100/90 mb-8 max-w-md">
                  Create your account to discover exquisite handcrafted pieces that tell your unique story.
                  Perfect jewelry for every occasion, crafted with love and attention to detail.
                </p>

                <div className="space-y-4 mt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiStar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-emerald-100">Premium Quality Guarantee</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <FiTruck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-emerald-100">Fast & Secure Delivery</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-sm text-emerald-100/80">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="w-full lg:w-[45%]">
          {/* Desktop Form - Background styling only */}
          <div className="hidden overflow-hidden lg:flex items-center justify-center p-8 relative lg:mt-[-15px] ">
            {/* Modern Background with Depth for Desktop */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Gradient Mesh Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100"></div>
              
              {/* Subtle Grid Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(to right, #05B171 1px, transparent 1px),
                                    linear-gradient(to bottom, #05B171 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}></div>
              </div>
              
              {/* Floating Elements with Depth */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-100/30 to-teal-100/20 rounded-full blur-3xl"
              ></motion.div>
              
              <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-tr from-green-100/20 to-emerald-100/10 rounded-full blur-3xl"
              ></motion.div>
              
              {/* Decorative Corner Accents */}
              <div className="absolute top-0 right-0 w-48 h-48">
                <div className="absolute top-8 right-8 w-32 h-32 border-t-2 border-r-2 border-emerald-200/30 rounded-tr-3xl"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-48 h-48">
                <div className="absolute bottom-8 left-8 w-32 h-32 border-b-2 border-l-2 border-emerald-200/30 rounded-bl-3xl"></div>
              </div>
            </div>

            {/* Keep the original desktop form layout */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-lg lg:max-w-3xl relative z-10"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
                <div className="hidden lg:block mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Create Account
                    </h1>
                  </div>
                  <p className="text-base text-gray-600 pl-13">
                    Join us and start your jewelry journey today
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 lg:mb-6 p-3 lg:p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg lg:rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-4 lg:space-y-6">
                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-1 lg:mb-2" htmlFor="name">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-500 text-gray-400">
                            <FiUser className="text-sm lg:text-base" />
                          </div>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            className="w-full pl-9 lg:pl-10 pr-3 py-2.5 lg:py-3 bg-white/80 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 text-sm lg:text-base backdrop-blur-sm"
                            placeholder="Nebiyou Dawit"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-1 lg:mb-2" htmlFor="email">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-500 text-gray-400">
                            <FiMail className="text-sm lg:text-base" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className="w-full pl-9 lg:pl-10 pr-3 py-2.5 lg:py-3 bg-white/80 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 text-sm lg:text-base backdrop-blur-sm"
                            placeholder="aberakeb23@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-1 lg:mb-2" htmlFor="phone">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-500 text-gray-400">
                            <FiPhone className="text-sm lg:text-base" />
                          </div>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            className="w-full pl-9 lg:pl-10 pr-3 py-2.5 lg:py-3 bg-white/80 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 text-sm lg:text-base backdrop-blur-sm"
                            placeholder="0912345678"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 lg:space-y-6">
                      <div>
                        <label className="block text-sm lg:text-base font-medium text-gray-700 mb-1 lg:mb-2" htmlFor="password">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-500 text-gray-400">
                            <FiLock className="text-sm lg:text-base" />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className="w-full pl-9 lg:pl-10 pr-9 lg:pr-10 py-2.5 lg:py-3 bg-white/80 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 text-sm lg:text-base backdrop-blur-sm"
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <FiEyeOff className="text-sm lg:text-base" /> : <FiEye className="text-sm lg:text-base" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1 lg:mb-2">
                          <label className="block text-sm lg:text-base font-medium text-gray-700" htmlFor="address">
                            Delivery Address
                          </label>
                        </div>
                        <div className="relative">
                          <div className="absolute left-3 top-2.5 lg:top-3 z-500 text-gray-400">
                            <FiMapPin className="text-sm z-500 lg:text-base" />
                          </div>
                          <textarea
                            id="address"
                            name="address"
                            rows="3"
                            className="w-full pl-9 lg:pl-10 pr-3 py-2.5 lg:py-3 bg-white/80 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 text-sm lg:text-base backdrop-blur-sm resize-none"
                            placeholder="akaki kality around kality hospital"
                            value={formData.address}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="text-xs lg:text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 lg:gap-1.5 disabled:opacity-50"
                        >
                          {locationLoading ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              <span className="hidden sm:inline">Getting location...</span>
                              <span className="sm:hidden">Locating...</span>
                            </>
                          ) : (
                            <>
                              <FiMapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span className="hidden sm:inline">Use Current Location</span>
                              <span className="sm:hidden">Current</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 lg:pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 lg:py-3 rounded-lg font-semibold text-sm lg:text-base hover:shadow-md hover:shadow-emerald-500/30 transition-all duration-200 flex justify-center items-center gap-2 ${loading ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <FiArrowRight className="text-sm lg:text-base group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>

                <div className="relative my-4 lg:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs lg:text-sm">
                    <span className="px-2 lg:px-3 bg-white/80 backdrop-blur-sm text-gray-500 font-medium">Already have an account?</span>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="block text-center w-full py-2.5 lg:py-3 border border-gray-300/50 text-gray-700 rounded-lg font-medium text-sm lg:text-base hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 group backdrop-blur-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    Sign In Instead
                    <FiArrowRight className="text-sm lg:text-base group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;