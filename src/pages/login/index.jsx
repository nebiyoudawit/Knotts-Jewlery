import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiChevronLeft, FiHome } from "react-icons/fi";
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
    <main className="min-h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* LEFT SIDE - Visual/Branding Section (Wider) */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-[#05B171] via-emerald-600 to-teal-700 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          {/* Subtle Floating Jewelry Items */}
          {/* Ring 1 */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-16 h-16 opacity-15"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="8" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="4" />
            </svg>
          </motion.div>

          {/* Bracelet */}
          <motion.div
            animate={{
              y: [0, 20, 0],
              x: [0, -10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="absolute bottom-1/3 right-1/4 w-20 h-20 opacity-20"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="6" strokeDasharray="5,5" />
            </svg>
          </motion.div>

          {/* Earring */}
          <motion.div
            animate={{
              y: [0, -25, 0],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute top-1/3 right-1/3 w-12 h-12 opacity-25"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="30" r="8" fill="white" />
              <path d="M50,38 L50,70 L35,85 L65,85 Z" fill="white" />
            </svg>
          </motion.div>

          {/* Small Sparkle 1 */}
          <motion.div
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/3 w-6 h-6"
          >
            <div className="w-full h-full bg-white/30 rounded-full"></div>
          </motion.div>

          {/* Small Sparkle 2 */}
          <motion.div
            animate={{
              opacity: [0.15, 0.35, 0.15],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-1/4 right-1/3 w-5 h-5"
          >
            <div className="w-full h-full bg-white/25 rounded-full"></div>
          </motion.div>

          {/* Floating Orbs */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl"
          ></motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          {/* Desktop Header with Back and Home buttons */}
          <div className="flex items-center justify-between">
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

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Continue Your
                <br />
                <span className="text-emerald-200">Jewelry Journey</span>
                <br />
                With Knotts
              </h1>
              <p className="text-lg text-emerald-100/90 mb-10 leading-relaxed">
                Sign in to access your personalized collection, track orders, 
                and discover new handcrafted pieces that tell your unique story.
              </p>
            </motion.div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE - Modern Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-8 relative">
        {/* Modern Background with Depth */}
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

        {/* Form Container with Glass Morphism */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Glass Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
            {/* Mobile Header with Back and Home buttons */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform flex items-center gap-2"
                >
                  <FiChevronLeft className="w-6 h-6" />
                  <span className="text-sm font-medium">Back</span>
                </button>

                <Link to="/" className="inline-flex items-center gap-3 group">
                  <img src="/logo.png" alt="Knotts Jewelry Logo" className="h-10 transition-transform group-hover:scale-105" />
                </Link>

                <button
                  onClick={() => navigate("/")}
                  className="p-2 -mr-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform flex items-center gap-2"
                >
                  <FiHome className="w-6 h-6" />
                  <span className="text-sm font-medium hidden sm:inline">Home</span>
                </button>
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-sm text-gray-600">
                  Sign in to continue your shopping journey
                </p>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-gray-600">
                Sign in to continue your shopping journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute z-500 left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiMail className="text-base lg:text-base" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-10 pr-3 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 text-sm backdrop-blur-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 z-500 -translate-y-1/2 text-gray-400">
                    <FiLock className="text-base lg:text-base" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 text-sm backdrop-blur-sm"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300/50 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 flex justify-center items-center gap-2 mt-6 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white/80 backdrop-blur-sm text-gray-500 font-medium">Don't have an account?</span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/register"
              className="block text-center w-full py-3 border border-gray-300/50 text-gray-700 rounded-xl font-medium text-sm hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 group backdrop-blur-sm"
            >
              <span className="inline-flex items-center gap-2">
                Create an Account
                <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By continuing, you agree to our{" "}
              <span className="text-emerald-600 hover:text-emerald-700 hover:underline">Terms of Service</span>
              {" "}and{" "}
              <span className="text-emerald-600 hover:text-emerald-700 hover:underline">Privacy Policy</span>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;