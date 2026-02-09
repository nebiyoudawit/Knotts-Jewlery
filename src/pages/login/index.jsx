import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiShoppingBag, FiStar, FiHeart, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, error, clearError } = useShop();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      const success = await login(email, password);

      if (success) {
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error(error || "Invalid email or password");
      }
    } catch (err) {
      toast.error(error || "An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex overflow-hidden bg-white">
      {/* LEFT SIDE - Visual/Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-gradient-to-br from-[#05B171] via-emerald-600 to-teal-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Decorative Beads */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"
          ></motion.div>
          <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-32 w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm"
          ></motion.div>
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-32 left-40 w-40 h-40 bg-white/10 rounded-full backdrop-blur-sm"
          ></motion.div>
          <motion.div
            animate={{ y: [0, 25, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-20 w-28 h-28 bg-white/10 rounded-full backdrop-blur-sm"
          ></motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg 
                  className="w-7 h-7 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  <circle cx="12" cy="6" r="2" strokeWidth="2" />
                  <circle cx="12" cy="18" r="2" strokeWidth="2" />
                  <circle cx="6" cy="9" r="2" strokeWidth="2" />
                  <circle cx="18" cy="9" r="2" strokeWidth="2" />
                  <circle cx="6" cy="15" r="2" strokeWidth="2" />
                  <circle cx="18" cy="15" r="2" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">BeadCraft</h2>
                <p className="text-xs text-emerald-100">Handmade Jewelry</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                Discover Unique
                <br />
                Handcrafted
                <br />
                <span className="text-emerald-200">Beaded Jewelry</span>
              </h1>
              <p className="text-lg text-emerald-100 mb-12 leading-relaxed">
                Each piece is carefully crafted with love and attention to detail. 
                Join thousands of customers who trust us for authentic, handmade jewelry.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiShoppingBag className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Free Shipping</h3>
                    <p className="text-sm text-emerald-100">On orders over $50</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiStar className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Premium Quality</h3>
                    <p className="text-sm text-emerald-100">Handpicked materials</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiHeart className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Made with Love</h3>
                    <p className="text-sm text-emerald-100">By skilled artisans</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiTrendingUp className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Trending Styles</h3>
                    <p className="text-sm text-emerald-100">Latest designs</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-3 gap-8 pt-12 border-t border-white/20"
          >
            <div>
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-sm text-emerald-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-sm text-emerald-100">Unique Designs</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">4.9</div>
              <div className="text-sm text-emerald-100">Average Rating</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 lg:p-12 bg-gray-50 relative">
        {/* Decorative Elements for Mobile */}
        <div className="lg:hidden absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-100/30 to-emerald-100/30 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#05B171] to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg 
                  className="w-7 h-7 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  <circle cx="12" cy="6" r="2" strokeWidth="2" />
                  <circle cx="12" cy="18" r="2" strokeWidth="2" />
                  <circle cx="6" cy="9" r="2" strokeWidth="2" />
                  <circle cx="18" cy="9" r="2" strokeWidth="2" />
                  <circle cx="6" cy="15" r="2" strokeWidth="2" />
                  <circle cx="18" cy="15" r="2" strokeWidth="2" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-900">BeadCraft</h2>
                <p className="text-xs text-gray-600">Handmade Jewelry</p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to continue your shopping journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiMail className="text-lg" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#05B171] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock className="text-lg" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#05B171] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#05B171] focus:ring-[#05B171] cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#05B171] hover:text-emerald-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-[#05B171] to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 flex justify-center items-center gap-2 group ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:-translate-y-1"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500 font-medium">Don't have an account?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block text-center w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-[#05B171] hover:text-[#05B171] hover:bg-emerald-50 transition-all duration-300 group"
          >
            <span className="inline-flex items-center gap-2">
              Create an Account
              <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-8">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-[#05B171] hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-[#05B171] hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;
