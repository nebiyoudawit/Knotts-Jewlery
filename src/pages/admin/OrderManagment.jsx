import { useState, useEffect } from "react";
import {
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
  FiEdit,
  FiEye,
  FiDollarSign
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState({
    orderId: null,
    newStatus: null,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to log in to access orders");
      navigate("/login");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleApiError = (error, defaultMessage) => {
    console.error("API Error:", error);
    const message =
      error.response?.data?.message || error.message || defaultMessage;
    toast.error(message);

    if (error.response?.status === 401) {
      navigate("/login");
    }

    return message;
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/orders`, { headers });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data || []);
    } catch (err) {
      handleApiError(err, "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      // Get current order first
      const orderRes = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers,
      });
      if (!orderRes.ok) throw new Error("Failed to fetch order");
      const currentOrder = await orderRes.json();

      // Update order status
      const statusRes = await fetch(
        `${API_BASE_URL}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!statusRes.ok) {
        const errorData = await statusRes.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      const updatedOrder = await statusRes.json();
      let newPaymentStatus = updatedOrder.paymentStatus;
      let shouldUpdateSales = false;

      // Status transition logic
      if (newStatus === "delivered" && currentOrder.status !== "delivered") {
        const paymentRes = await fetch(
          `${API_BASE_URL}/orders/${orderId}/payment`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ paymentStatus: "Paid" }),
          }
        );
        if (!paymentRes.ok) throw new Error("Failed to update payment status");
        newPaymentStatus = "paid";
        shouldUpdateSales = true;
      } else if (
        currentOrder.status === "delivered" &&
        newStatus !== "delivered"
      ) {
        const paymentRes = await fetch(
          `${API_BASE_URL}/orders/${orderId}/payment`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ paymentStatus: "Pending" }),
          }
        );
        if (!paymentRes.ok) throw new Error("Failed to update payment status");
        newPaymentStatus = "pending";
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...updatedOrder,
                paymentStatus: newPaymentStatus,
              }
            : order
        )
      );

      return true;
    } catch (err) {
      handleApiError(err, "Failed to update order status");
      return false;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      setIsUpdating(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete order");
      }

      // Remove the order from local state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );

      toast.success("Order deleted successfully");
      return true;
    } catch (err) {
      handleApiError(err, "Failed to delete order");
      return false;
    } finally {
      setIsUpdating(false);
      setShowDeleteModal(false);
    }
  };

  const initiateStatusChange = (orderId, newStatus) => {
    setPendingUpdate({ orderId, newStatus });
    setShowConfirmModal(true);
  };

  const initiateDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const StatusBadge = ({ status }) => {
    const statusClasses = {
      delivered: "bg-emerald-500/10 text-emerald-600",
      pending: "bg-amber-500/10 text-amber-600",
      cancelled: "bg-rose-500/10 text-rose-600",
    };
    
    return (
      <span className={`inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === "delivered" ? "bg-emerald-500" : 
          status === "pending" ? "bg-amber-500" : "bg-rose-500"
        }`}></span>
        {status}
      </span>
    );
  };

  const PaymentBadge = ({ status }) => {
    const paymentClasses = {
      paid: "bg-emerald-500/10 text-emerald-600",
      pending: "bg-amber-500/10 text-amber-600",
      failed: "bg-rose-500/10 text-rose-600",
    };
    
    return (
      <span className={`inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium ${paymentClasses[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === "paid" ? "bg-emerald-500" : 
          status === "pending" ? "bg-amber-500" : "bg-rose-500"
        }`}></span>
        {status}
      </span>
    );
  };

  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <FiCheckCircle className="text-blue-600 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Confirm Status Change</h3>
        </div>
        <p className="text-gray-600 mb-6 pl-13">
          Are you sure you want to change this order status to{" "}
          <span className="font-semibold capitalize text-blue-600">
            {pendingUpdate.newStatus}
          </span>
          ?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setIsUpdating(true);
              const success = await updateOrderStatus(
                pendingUpdate.orderId,
                pendingUpdate.newStatus
              );
              setIsUpdating(false);

              if (success) {
                setShowConfirmModal(false);
                toast.success(
                  `Order status updated to ${pendingUpdate.newStatus}`
                );
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-24"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
            <FiTrash2 className="text-red-600 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Order?</h3>
        </div>
        <p className="text-gray-600 mb-6 pl-13">
          This action cannot be undone. All data associated with this order will be permanently removed.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={async () => await deleteOrder(orderToDelete)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-24"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {showConfirmModal && <ConfirmationModal />}
      {showDeleteModal && <DeleteConfirmationModal />}

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <p className="text-gray-500 mt-1">View and manage customer orders</p>
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-xs p-4 border border-gray-100 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden transition-all hover:shadow-sm">
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">Order #{order._id.slice(-6)}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => initiateStatusChange(order._id, e.target.value)}
                      disabled={isUpdating}
                      className={`border border-gray-200 rounded-lg p-1 text-xs ${isUpdating ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300"} focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                    >
                      <option value="pending">Pending</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => initiateDeleteOrder(order._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={isUpdating}
                    >
                      <FiTrash2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleOrderDetails(order._id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      disabled={isUpdating}
                    >
                      {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="font-medium">{order.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-medium">{order.total} birr</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment</p>
                    <PaymentBadge status={order.paymentStatus} />
                  </div>
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <p className="text-sm">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} <span className="text-gray-500">x {item.quantity}</span>
                            </span>
                            <span className="font-medium">{item.price * item.quantity} birr</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
              <FiTruck className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500">There are currently no orders to display</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Order ID", "Customer", "Date", "Total", "Status", "Payment", "Actions"].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <>
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        #{order._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.user?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {order.total} birr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => initiateStatusChange(order._id, e.target.value)}
                            disabled={isUpdating}
                            className={`border border-gray-200 rounded-lg px-3 py-1 text-sm ${isUpdating ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300"} focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                          >
                            <option value="pending">Pending</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => initiateDeleteOrder(order._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={isUpdating}
                          >
                            <FiTrash2 size={18} />
                          </button>
                          <button
                            onClick={() => toggleOrderDetails(order._id)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            disabled={isUpdating}
                          >
                            {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order._id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-gray-500">Customer Name</p>
                                  <p className="text-sm font-medium">{order.user?.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Contact Number</p>
                                  <p className="text-sm font-medium">{order.user?.phone}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Shipping Address</p>
                                  <p className="text-sm font-medium">{order.shippingAddress}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                                {order.items.map((item, index) => (
                                  <li key={index} className="px-4 py-3 flex justify-between">
                                    <div>
                                      <p className="font-medium text-gray-900">{item.name}</p>
                                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">{item.price * item.quantity} birr</p>
                                  </li>
                                ))}
                                <li className="px-4 py-3 bg-gray-50 flex justify-between font-medium">
                                  <span>Total</span>
                                  <span>{order.total} birr</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4">
              <FiTruck className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 max-w-md mx-auto">There are currently no orders to display. When orders are placed, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;