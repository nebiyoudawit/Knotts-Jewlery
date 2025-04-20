import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { useShop } from '../../context/ShopContext';

const CheckoutPage = () => {
  const { cart } = useShop();

  const [selectedLocation, setSelectedLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee] = useState(200); // Fixed delivery fee

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const pickupLocations = [
    { id: 1, name: 'Figa', address: 'Figa Mall, 1st Floor' },
    { id: 2, name: 'Gerji', address: 'Gerji Main Road, Shop 25' },
    { id: 3, name: 'Megenagna', address: 'Megenagna Square, Unit 12' }
  ];

  useEffect(() => {
    setPaymentMethod(''); // Reset payment method when pickup location changes
  }, [selectedLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedLocation && !deliveryAddress.trim()) {
      alert('Please enter your delivery address.');
      return;
    }

    console.log({
      deliveryType: selectedLocation ? 'pickup' : 'delivery',
      selectedLocation,
      deliveryAddress,
      paymentMethod,
      cart
    });

    // Proceed to payment or order confirmation logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Pickup Location */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-[#05B171]" />
              Pickup Location (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a pickup location to avoid delivery fees. Leave blank for home delivery.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pickupLocations.map(location => (
                <div
                  key={location.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedLocation === location.name
                      ? 'border-[#05B171] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() =>
                    setSelectedLocation(prev =>
                      prev === location.name ? '' : location.name
                    )
                  }
                >
                  <h3 className="font-medium">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.address}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {selectedLocation ? (
                <p className="text-green-600">
                  You've selected pickup at <strong>{selectedLocation}</strong>. No delivery fee will be charged.
                </p>
              ) : (
                <>
                  <p className="text-gray-600">Your order will be delivered to your address.</p>
                  <p className="font-medium">Delivery Fee: {deliveryFee} ETB</p>
                  <input
                    type="text"
                    placeholder="Enter delivery address"
                    className="mt-2 w-full border border-gray-300 rounded-md p-2"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="space-y-4">
              {/* Pay on Delivery */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'delivery'
                    ? 'border-[#05B171] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('delivery')}
              >
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-3 text-xl text-[#05B171]" />
                  <div>
                    <h3 className="font-medium">Pay on Delivery</h3>
                    <p className="text-sm text-gray-600">Pay cash when your order arrives</p>
                  </div>
                </div>
              </div>

              {/* Online Payment */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-[#05B171] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('online')}
              >
                <div className="flex items-center">
                  <FaCreditCard className="mr-3 text-xl text-[#05B171]" />
                  <div>
                    <h3 className="font-medium">Online Payment</h3>
                    <p className="text-sm text-gray-600">Pay securely with your credit/debit card</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {/* Product list */}
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-700">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} ETB</span>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{subtotal.toFixed(2)} ETB</span>
            </div>

            {/* Delivery Fee */}
            {!selectedLocation && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>{deliveryFee.toFixed(2)} ETB</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>
                {selectedLocation
                  ? subtotal.toFixed(2)
                  : (subtotal + deliveryFee).toFixed(2)} ETB
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link
              to="/cart"
              className="px-6 py-3 border border-gray-300 rounded-md text-center hover:bg-gray-50 transition-colors"
            >
              Back to Cart
            </Link>
            <button
              type="submit"
              disabled={!paymentMethod || (!selectedLocation && !deliveryAddress)}
              className={`px-6 py-3 rounded-md text-white ${
                paymentMethod && (selectedLocation || deliveryAddress)
                  ? 'bg-[#05B171] hover:bg-[#048a5b]'
                  : 'bg-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
