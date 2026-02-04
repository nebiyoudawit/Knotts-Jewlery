import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiTruck,
  FiCreditCard,
  FiShoppingBag,
  FiCheck,
  FiPackage,
  FiAlertCircle,
  FiHome,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../../context/ShopContext";

const apiUrl = import.meta.env.VITE_API_URL;

const CheckoutPage = () => {
  const { cart, currentUser } = useShop();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryFee] = useState(200);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Handle image URL - check if it's already a full URL or needs the server prefix
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x300";
    if (imagePath.includes("http")) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const pickupLocations = [
    { id: 1, name: "Figa", address: "" },
    { id: 2, name: "Gerji", address: "" },
    { id: 3, name: "Megenagna", address: "" },
  ];

  useEffect(() => {
    setPaymentMethod("");
  }, [selectedLocation]);

  const getCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
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
          setDeliveryAddress(address);
        } catch (err) {
          setLocationError("Failed to get address from location.");
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location access denied. Please enable it in your browser settings and try again."
          );
        } else {
          setLocationError("Unable to retrieve your location.");
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentMethod || (!selectedLocation && !deliveryAddress.trim())) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      const total = selectedLocation ? subtotal : subtotal + deliveryFee;

      const orderData = {
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: selectedLocation
          ? `PICKUP: ${selectedLocation}`
          : deliveryAddress,
        paymentMethod,
        totalPrice: total,
        deliveryFee: selectedLocation ? 0 : deliveryFee,
      };

      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();
      window.location.href = `/order-confirmation/${data.data._id}`;
    } catch (error) {
      console.error("Order submission error:", error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = !selectedLocation && !deliveryAddress ? 1 : !paymentMethod ? 2 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/20 py-8 sm:py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Gradient Orbs */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"
        ></motion.div>

        <motion.div
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/3 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"
        ></motion.div>

        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
        ></motion.div>

        {/* Floating Shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-40 right-1/4 w-20 h-20 border-4 border-emerald-200/30 rounded-lg"
        ></motion.div>

        <motion.div
          animate={{
            rotate: [360, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-40 right-1/3 w-16 h-16 border-4 border-teal-200/30 rounded-full"
        ></motion.div>

        <motion.div
          animate={{
            rotate: [0, -360],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-20 w-12 h-12 bg-gradient-to-br from-cyan-200/40 to-blue-200/40 rounded-lg transform rotate-45"
        ></motion.div>

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCA2MCAwIEwgNjAgNjAgTCAwIDYwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA1QjE3MSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

        {/* Sparkle Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            className="absolute w-2 h-2 bg-emerald-400/60 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          ></motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your order in a few simple steps</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              {/* Step 1 */}
              <div className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  currentStep >= 1 ? "bg-[#05B171] text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {currentStep > 1 ? <FiCheck className="h-5 w-5" /> : "1"}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Delivery</p>
                  <p className="text-xs text-gray-500">Choose method</p>
                </div>
              </div>
              <div className={`flex-1 h-1 mx-4 rounded transition-colors ${
                currentStep >= 2 ? "bg-[#05B171]" : "bg-gray-200"
              }`}></div>

              {/* Step 2 */}
              <div className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  currentStep >= 2 ? "bg-[#05B171] text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {currentStep > 2 ? <FiCheck className="h-5 w-5" /> : "2"}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Payment</p>
                  <p className="text-xs text-gray-500">Select method</p>
                </div>
              </div>
              <div className={`flex-1 h-1 mx-4 rounded transition-colors ${
                currentStep >= 3 ? "bg-[#05B171]" : "bg-gray-200"
              }`}></div>

              {/* Step 3 */}
              <div className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  currentStep >= 3 ? "bg-[#05B171] text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  3
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Place order</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FiTruck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Delivery Method</h2>
                      <p className="text-sm text-gray-600">Choose pickup or delivery</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Pickup Locations */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FiMapPin className="h-4 w-4 text-[#05B171]" />
                      Pickup Locations (Free)
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {pickupLocations.map((location) => {
                        const isGerji = location.name === "Gerji";
                        const isSelected = selectedLocation === location.name;
                        return (
                          <motion.div
                            key={location.id}
                            whileHover={!isGerji ? { scale: 1.02 } : {}}
                            whileTap={!isGerji ? { scale: 0.98 } : {}}
                            onClick={() => {
                              if (!isGerji) {
                                setSelectedLocation((prev) =>
                                  prev === location.name ? "" : location.name
                                );
                                if (selectedLocation !== location.name) {
                                  setDeliveryAddress("");
                                }
                              }
                            }}
                            className={`relative rounded-xl p-4 border-2 transition-all ${
                              isGerji
                                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "border-[#05B171] bg-emerald-50 shadow-lg shadow-emerald-500/20 cursor-pointer"
                                : "border-gray-200 hover:border-emerald-200 cursor-pointer"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#05B171] rounded-full flex items-center justify-center shadow-lg">
                                <FiCheck className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div className="text-center">
                              <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                                <FiMapPin className="h-5 w-5 text-white" />
                              </div>
                              <h4 className="font-bold text-gray-900">{location.name}</h4>
                              {isGerji && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FiHome className="h-4 w-4 text-[#05B171]" />
                      Home Delivery ({deliveryFee} ETB)
                    </h3>

                    {selectedLocation ? (
                      <div className="flex items-start gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                          <FiCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-900">Pickup Selected</p>
                          <p className="text-sm text-emerald-700 mt-1">
                            You've selected pickup at <span className="font-bold">{selectedLocation}</span>. 
                            No delivery fee will be charged.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter your full delivery address"
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#05B171] focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            required={!selectedLocation}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={getCurrentLocation}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Use current location"
                          >
                            <FiMapPin className="h-5 w-5 text-gray-400 hover:text-[#05B171]" />
                          </motion.button>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FiAlertCircle className="h-3 w-3" />
                          Click the location icon to auto-fill your address
                        </p>
                        {locationError && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <FiAlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-700">{locationError}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FiCreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                      <p className="text-sm text-gray-600">Choose how to pay</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Pay on Delivery */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod("Pay on Delivery")}
                    className={`relative rounded-xl p-5 border-2 cursor-pointer transition-all ${
                      paymentMethod === "Pay on Delivery"
                        ? "border-[#05B171] bg-emerald-50 shadow-lg shadow-emerald-500/20"
                        : "border-gray-200 hover:border-emerald-200"
                    }`}
                  >
                    {paymentMethod === "Pay on Delivery" && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#05B171] rounded-full flex items-center justify-center shadow-lg">
                        <FiCheck className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <FiPackage className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Pay on Delivery</h3>
                        <p className="text-sm text-gray-600 mt-1">Pay cash when your order arrives</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Online Payment - Coming Soon */}
                  <div className="relative rounded-xl p-5 border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed">
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        Coming Soon
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
                        <FiCreditCard className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Online Payment</h3>
                        <p className="text-sm text-gray-600 mt-1">Pay securely with your card</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FiShoppingBag className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                      <p className="text-sm text-gray-600">{cart.length} items</p>
                    </div>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="p-6 max-h-64 overflow-y-auto">
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                          <img 
                            src={getImageUrl(item.images?.[0] || item.image)} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300x300";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {(item.price * item.quantity).toFixed(2)} ETB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-6 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} ETB</span>
                  </div>

                  {!selectedLocation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold text-gray-900">{deliveryFee.toFixed(2)} ETB</span>
                    </div>
                  )}

                  {selectedLocation && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <FiCheck className="h-4 w-4" />
                        Free
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {selectedLocation
                          ? subtotal.toFixed(2)
                          : (subtotal + deliveryFee).toFixed(2)}{" "}
                        <span className="text-base">ETB</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={
                      loading ||
                      paymentMethod !== "Pay on Delivery" ||
                      (!selectedLocation && !deliveryAddress)
                    }
                    className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === "Pay on Delivery" &&
                      (selectedLocation || deliveryAddress) &&
                      !loading
                        ? "bg-gradient-to-r from-[#05B171] to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheck className="h-5 w-5" />
                        Place Order
                      </>
                    )}
                  </motion.button>

                  <Link
                    to="/cart"
                    className="block w-full py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 text-center hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;