import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
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

  const pickupLocations = [
    { id: 1, name: "Figa", address: "Bole, Addis Ababa" },
    { id: 2, name: "Gerji", address: "Near Gerji Mebrat Hail" },
    { id: 3, name: "Megenagna", address: "Megenagna Square" },
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg font-bold">
                  {cart.length}
                </span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Your Order
                </h2>
                <p className="text-sm text-gray-500">
                  {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Pickup Location */}
            <section className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-6 w-6 text-green-500">
                  <FaMapMarkerAlt className="h-full w-full" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">
                  Pickup Location (Optional)
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Select a pickup location to avoid delivery fees. Leave blank for
                home delivery.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pickupLocations.map((location) => {
                  const isGerji = location.name === "Gerji";
                  return (
                    <div
                      key={location.id}
                      className={`relative rounded-xl p-5 transition-all border-2 ${
                        isGerji
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                          : "cursor-pointer " +
                            (selectedLocation === location.name
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300")
                      }`}
                      onClick={() => {
                        if (!isGerji) {
                          setSelectedLocation((prev) =>
                            prev === location.name ? "" : location.name
                          );
                        }
                      }}
                    >
                      {selectedLocation === location.name && (
                        <div className="absolute top-2 right-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 text-center">
                        {location.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 text-center">
                        {location.address}
                      </p>
                      {isGerji && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Delivery Info */}
            <section className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                  <FiMapPin className="h-full w-full" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">
                  Delivery Information
                </h2>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl">
                {selectedLocation ? (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                      <svg
                        className="h-full w-full"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        You've selected pickup at{" "}
                        <span className="font-medium text-green-700">
                          {selectedLocation}
                        </span>
                        . No delivery fee will be charged.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-700">
                          Your order will be delivered to your address.
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          Delivery Fee: {deliveryFee} ETB
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="delivery-address"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Delivery Address
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <input
                            id="delivery-address"
                            type="text"
                            placeholder="Enter your full delivery address"
                            className="block w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            aria-label="Use current location"
                            title="Use current location"
                          >
                            <FiMapPin className="h-5 w-5 text-gray-400 hover:text-green-500" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Tap the icon to get your current location.
                        </p>
                        {locationError && (
                          <p className="mt-2 text-sm text-red-600">
                            {locationError}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Payment Method */}
            <section className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-6 w-6 text-purple-500">
                  <FaCreditCard className="h-full w-full" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">
                  Payment Method
                </h2>
              </div>
              <div className="space-y-4">
                <div
                  className={`relative rounded-xl p-5 border-2 cursor-pointer transition-all ${
                    paymentMethod === "Pay on Delivery"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("Pay on Delivery")}
                >
                  {paymentMethod === "Pay on Delivery" && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <FaMoneyBillWave className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-900">
                        Pay on Delivery
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay cash when your order arrives
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl p-5 border-2 border-gray-200 bg-gray-50 cursor-not-allowed">
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex items-start opacity-75">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaCreditCard className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-900">
                        Online Payment
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay securely with your card
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Order Summary */}
            <section className="p-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} ETB
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900">
                    {subtotal.toFixed(2)} ETB
                  </span>
                </div>

                {!selectedLocation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delivery Fee</span>
                    <span className="text-sm font-medium text-gray-900">
                      {deliveryFee.toFixed(2)} ETB
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-base font-medium text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {selectedLocation
                      ? subtotal.toFixed(2)
                      : (subtotal + deliveryFee).toFixed(2)}{" "}
                    ETB
                  </span>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-white flex flex-col sm:flex-row justify-between gap-4">
              <Link
                to="/cart"
                className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 text-center hover:bg-gray-50 transition-colors"
              >
                Back to Cart
              </Link>
              <button
                type="submit"
                disabled={
                  loading ||
                  paymentMethod !== "Pay on Delivery" ||
                  (!selectedLocation && !deliveryAddress)
                }
                className={`px-6 py-3 rounded-lg text-base font-medium text-white flex justify-center items-center gap-2 transition-colors ${
                  paymentMethod === "Pay on Delivery" &&
                  (selectedLocation || deliveryAddress) &&
                  !loading
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
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
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
                      ></path>
                    </svg>
                    Processing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
