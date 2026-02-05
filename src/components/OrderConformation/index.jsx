import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiMapPin, FiCreditCard, FiCalendar, FiX } from 'react-icons/fi';

const apiUrl = import.meta.env.VITE_API_URL;

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${apiUrl}/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => navigate('/'), 300);
  };

  const isPaid = order?.paymentStatus === 'Paid';
  const isFailed = order?.paymentStatus === 'Failed';

  // Calculate total items
  const totalItems = order?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 z-10 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>

                {loading ? (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-3 border-[#05B171] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading order details...</p>
                  </div>
                ) : error ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                      <FaExclamationTriangle className="text-2xl text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Order</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-[#05B171] text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isPaid 
                            ? 'bg-emerald-50' 
                            : isFailed 
                            ? 'bg-red-50'
                            : 'bg-emerald-50'
                        }`}>
                          {isFailed ? (
                            <FaExclamationTriangle className="text-2xl text-red-500" />
                          ) : (
                            <FaCheckCircle className="text-2xl text-[#05B171]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            {isPaid ? 'Order Confirmed!' : isFailed ? 'Payment Failed' : 'Order Received'}
                          </h1>
                          <p className="text-gray-600 text-sm">
                            {isPaid 
                              ? 'Thank you for your purchase. Your order has been confirmed.'
                              : isFailed
                              ? 'There was an issue processing your payment.'
                              : 'Your order has been received and is being processed.'}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-sm">
                            <span className="text-gray-500">Order ID:</span>
                            <span className="font-mono font-semibold text-gray-900">{order?._id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="p-8 space-y-6">
                      {/* Compact Order Summary */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FiPackage className="h-4 w-4 text-[#05B171]" />
                          Order Summary
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Items</span>
                            <span className="text-sm font-medium text-gray-900">
                              {totalItems} {totalItems === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="text-lg font-bold text-gray-900">
                              {order?.total?.toFixed(2)} ETB
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FiMapPin className="h-4 w-4 text-[#05B171]" />
                          Delivery Address
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {order?.shippingAddress}
                          </p>
                        </div>
                      </div>

                      {/* Payment & Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FiCreditCard className="h-4 w-4 text-[#05B171]" />
                            Payment
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-1">{order?.paymentMethod}</p>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                              isPaid 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : isFailed
                                ? 'bg-red-50 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {order?.paymentStatus}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FiCalendar className="h-4 w-4 text-[#05B171]" />
                            Status
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-1">{order?.status}</p>
                            {order?.deliveryDate && (
                              <p className="text-xs text-gray-500">
                                Est. delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions - Responsive */}
                    <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Continue Shopping Button */}
                        <Link
                          to="/products"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 py-3 px-4 bg-[#05B171] text-white text-center rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                        >
                          <FaShoppingBag className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Continue Shopping</span>
                        </Link>
                        
                        {/* View Orders Button */}
                        <Link
                          to="/orders"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-100 transition-colors order-1 sm:order-2"
                        >
                          <span className="truncate">View Orders</span>
                        </Link>
                      </div>
                      
                      {/* Extra Close Button for Mobile */}
                      <div className="mt-3 sm:hidden">
                        <button
                          onClick={handleClose}
                          className="w-full py-2.5 text-gray-600 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderConfirmation;