import React from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiCalendar,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiHash,
  FiMapPin,
} from "react-icons/fi";

const OrderDetailModal = ({ order, isOpen, onClose, onCancelOrder }) => {
  if (!order || !isOpen) return null;

  const getStatusConfig = (status) => {
    const configs = {
      delivered: {
        icon: <FiCheckCircle className="h-5 w-5" />,
        text: "Delivered",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
      },
      cancelled: {
        icon: <FiXCircle className="h-5 w-5" />,
        text: "Cancelled",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-100",
      },
      pending: {
        icon: <FiClock className="h-5 w-5" />,
        text: "Pending",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
      },
    };
    return configs[status] || configs.pending;
  };

  const getPaymentStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      default:
        return status || "Pending";
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canCancelOrder = (orderDate) => {
    const now = new Date();
    const placed = new Date(orderDate);
    const diffHours = (now - placed) / (1000 * 60 * 60);
    return diffHours < 24 && diffHours >= 0;
  };

  const statusConfig = getStatusConfig(order.status);
  const isPending = order.status === "pending";
  const cancellable = isPending && canCancelOrder(order.createdAt);

  // Check if it's a pickup order
  const isPickupOrder = order.shippingAddress?.includes("PICKUP:");
  const pickupLocation = isPickupOrder 
    ? order.shippingAddress.replace("PICKUP: ", "")
    : null;

  // Calculate subtotal from items
  const calculateSubtotal = () => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => {
      const price = typeof item.price === "number" ? item.price : 0;
      const qty = item.qty || 0;
      return sum + (price * qty);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = order.deliveryFee || 200;
  const total = order.totalPrice || (subtotal + deliveryFee);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modal Header - Clean with only title and close button */}
        <div className="bg-gradient-to-r from-[#05B171] to-emerald-600 p-4 sm:p-6 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-white truncate">Order Details</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 sm:p-2 bg-white text-[#05B171] rounded-lg hover:bg-gray-100 transition-all shadow-lg flex-shrink-0 ml-2"
            >
              <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Order ID Section - Moved from header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiHash className="text-white h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">Order ID</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <code className="text-sm font-mono text-gray-800 bg-gray-200 px-2 py-1 rounded truncate">
                      {order._id}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(order._id);
                        // You could add a toast notification here
                      }}
                      className="text-xs text-[#05B171] hover:text-emerald-700 font-medium hover:underline"
                    >
                      Copy ID
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status & Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="text-white h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900">Order Date</h4>
                    <p className="text-sm text-gray-600">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPackage className="text-white h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900">Order Status</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                        <div className="flex items-center gap-2">
                          {statusConfig.icon}
                          {statusConfig.text}
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 md:col-span-1 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCreditCard className="text-white h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900">Payment Status</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        order.paymentStatus?.toLowerCase() === "paid" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {isPickupOrder ? (
                  <FiPackage className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiTruck className="h-5 w-5 text-gray-500" />
                )}
                {isPickupOrder ? "Pickup Information" : "Delivery Information"}
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isPickupOrder 
                      ? "bg-gradient-to-br from-emerald-500 to-green-500" 
                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                  }`}>
                    {isPickupOrder ? (
                      <FiPackage className="text-white h-5 w-5" />
                    ) : (
                      <FiTruck className="text-white h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {isPickupOrder ? "Pickup Location" : "Delivery Address"}
                        </p>
                        <p className="text-gray-900 break-words">
                          {isPickupOrder ? pickupLocation : order.shippingAddress}
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-sm font-medium text-center ${
                        isPickupOrder 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        {isPickupOrder ? "Pickup Order" : "Home Delivery"}
                      </div>
                    </div>
                  </div>
                </div>

                {!isPickupOrder && order.deliveryDate && (
                  <div className="flex items-center gap-3 pl-13">
                    <FiCalendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
                      <p className="text-gray-900">{formatDateTime(order.deliveryDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCreditCard className="h-5 w-5 text-gray-500" />
                Payment Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCreditCard className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="text-gray-900">{order.paymentMethod || "Not specified"}</p>
                  </div>
                </div>
                {order.paidAt && (
                  <div className="flex items-center gap-3 pl-13">
                    <FiCalendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                      <p className="text-gray-900">{formatDate(order.paidAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Order Items ({order.items?.length || 0})</h4>
                <div className="text-sm text-gray-600">
                  Total: <span className="font-bold text-gray-900">{total.toFixed(2)} birr</span>
                </div>
              </div>
              <div className="space-y-4">
                {order.items?.map((item, i) => {
                  const name = item.name || item.product?.name || "Unnamed product";
                  const image = item.image || item.product?.image || "/placeholder.png";
                  const price = typeof item.price === "number" ? item.price : item.product?.price || 0;
                  const qty = item.qty || item.quantity || 0;
                  const itemTotal = qty * price;

                  return (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <img
                          src={image}
                          alt={name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate">{name}</h5>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Quantity:</span> {qty}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Price: {price.toFixed(2)} birr</p>
                            <p className="font-medium text-gray-900">Total: {itemTotal.toFixed(2)} birr</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Responsive Order Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  {/* Desktop view - Side by side */}
                  <div className="hidden sm:grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      {!isPickupOrder && (
                        <p className="text-sm text-gray-600">Delivery Fee</p>
                      )}
                      <p className="text-lg font-bold text-gray-900 mt-2">Total</p>
                    </div>
                    <div className="space-y-2 text-right">
                      <p className="text-sm text-gray-600">{subtotal.toFixed(2)} birr</p>
                      {!isPickupOrder ? (
                        <p className="text-sm text-gray-600">{deliveryFee.toFixed(2)} birr</p>
                      ) : (
                        <p className="text-sm text-emerald-600">Free pickup</p>
                      )}
                      <p className="text-2xl font-bold text-gray-900 mt-2">{total.toFixed(2)} birr</p>
                    </div>
                  </div>

                  {/* Mobile view - Stacked */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium text-gray-900">{subtotal.toFixed(2)} birr</span>
                    </div>
                    
                    {!isPickupOrder ? (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Delivery Fee</span>
                        <span className="text-sm font-medium text-gray-900">{deliveryFee.toFixed(2)} birr</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Delivery Method</span>
                        <span className="text-sm font-medium text-emerald-600">Free pickup</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">{total.toFixed(2)} birr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            {cancellable && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                        <FiClock className="h-3 w-3 text-amber-600" />
                      </div>
                      <h5 className="font-semibold text-amber-800">Order can be cancelled</h5>
                    </div>
                    <p className="text-sm text-amber-700">
                      You can cancel this order within 24 hours of placing it. Order was placed on {formatDate(order.createdAt)}.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onClose();
                      onCancelOrder(order._id);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-lg shadow-red-500/30"
                  >
                    Cancel Order
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderDetailModal;