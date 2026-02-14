import { useState, useEffect } from "react";
import {
  FiSearch, FiX, FiPackage, FiCalendar, FiMapPin, FiUser,
  FiClock, FiCheckCircle, FiShoppingBag, FiCheck,
  FiEdit3, FiEye, FiPhone
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [bulkAction, setBulkAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
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
    const message = error.response?.data?.message || error.message || defaultMessage;
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
      setFilteredOrders(data || []);
    } catch (err) {
      handleApiError(err, "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let results = orders;
    if (searchTerm) {
      results = results.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOrders(results);
    setCurrentPage(1);
  }, [searchTerm, orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return false;

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      const updatedOrder = await response.json();
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? updatedOrder.order : order
        )
      );
      return true;
    } catch (err) {
      handleApiError(err, "Failed to update order status");
      return false;
    }
  };

  const handleBulkAction = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    setIsUpdating(true);
    try {
      const promises = selectedOrders.map(orderId =>
        bulkAction === 'delete' 
          ? fetch(`${API_BASE_URL}/orders/${orderId}`, {
              method: "DELETE",
              headers: getAuthHeaders(),
            })
          : updateOrderStatus(orderId, bulkAction)
      );

      await Promise.all(promises);

      if (bulkAction === 'delete') {
        setOrders(prevOrders => 
          prevOrders.filter(order => !selectedOrders.includes(order._id))
        );
        toast.success(`${selectedOrders.length} orders deleted successfully`);
      } else {
        toast.success(`${selectedOrders.length} orders updated to ${bulkAction}`);
      }

      setSelectedOrders([]);
      setShowBulkActionModal(false);
    } catch (err) {
      handleApiError(err, "Failed to perform bulk action");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = (ordersList) => {
    const orderIds = ordersList.map(o => o._id);
    if (selectedOrders.length === orderIds.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orderIds);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const isDeliveryToday = (deliveryDate) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    return today.toDateString() === delivery.toDateString();
  };

  const getFilteredOrdersByTab = () => {
    switch(activeTab) {
      case "dueToday":
        return filteredOrders.filter(o => isDeliveryToday(o.deliveryDate) && o.status === 'pending');
      case "pending":
        return filteredOrders.filter(o => o.status === 'pending');
      case "delivered":
        return filteredOrders.filter(o => o.status === 'delivered');
      case "cancelled":
        return filteredOrders.filter(o => o.status === 'cancelled');
      default:
        return filteredOrders;
    }
  };

  const allOrdersForTab = getFilteredOrdersByTab();
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = allOrdersForTab.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allOrdersForTab.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const stats = {
    all: orders.length,
    dueToday: orders.filter(o => isDeliveryToday(o.deliveryDate) && o.status === 'pending').length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const tabs = [
    { id: "all", label: "All Orders", count: stats.all, icon: FiShoppingBag },
    { id: "dueToday", label: "Due Today", count: stats.dueToday, icon: FiClock },
    { id: "pending", label: "Pending", count: stats.pending, icon: FiClock },
    { id: "delivered", label: "Delivered", count: stats.delivered, icon: FiCheckCircle },
    { id: "cancelled", label: "Cancelled", count: stats.cancelled, icon: FiX }
  ];

  const StatusChangeModal = () => {
    const [newStatus, setNewStatus] = useState(selectedOrderForStatus?.status || "pending");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
      setLoading(true);
      const success = await updateOrderStatus(selectedOrderForStatus._id, newStatus);
      setLoading(false);
      if (success) {
        toast.success(`Order status updated to ${newStatus}`);
        setShowStatusModal(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FiEdit3 className="text-emerald-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Change Order Status</h3>
                  <p className="text-sm text-gray-500">#{selectedOrderForStatus?._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {['pending', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    newStatus === status ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {status === 'pending' && <FiClock className="text-amber-600 text-xl" />}
                    {status === 'delivered' && <FiCheckCircle className="text-emerald-600 text-xl" />}
                    {status === 'cancelled' && <FiX className="text-red-600 text-xl" />}
                    <span className="font-medium text-gray-900 capitalize">{status}</span>
                  </div>
                  {newStatus === status && <FiCheck className="text-emerald-600 text-xl" />}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-semibold transition-all shadow-lg shadow-emerald-200/50 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrderDetailsModal = () => {
    const order = selectedOrderForDetails;
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 animate-scale-in">
          <div className="p-8 border-b-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                  <FiPackage className="text-emerald-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                <FiX className="text-2xl" />
              </button>
            </div>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="text-emerald-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <FiPhone className="text-gray-400 text-sm" />
                        {order.user?.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiMapPin className="text-emerald-600" />
                    Shipping Address
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{order.shippingAddress}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiCalendar className="text-emerald-600" />
                    Order Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Order Date</span>
                      <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Delivery Date</span>
                      <span className="font-medium text-gray-900">{formatDate(order.deliveryDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Payment Method</span>
                      <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Payment Status</span>
                      <PaymentBadge status={order.paymentStatus} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiShoppingBag className="text-emerald-600" />
                    Order Items ({order.items.length})
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border-2 border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="font-bold text-gray-900">{item.price * item.quantity} birr</p>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Qty: {item.quantity}</span>
                          <span className="text-gray-600">{item.price} birr each</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-900">Order Total</span>
                    <span className="text-3xl font-bold text-emerald-600">{order.total} birr</span>
                  </div>
                  <div className="pt-4 border-t-2 border-emerald-200/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Status</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t-2 border-gray-100 bg-gray-50">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-semibold transition-all shadow-lg shadow-emerald-200/50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BulkActionModal = () => {
    const [loading, setLoading] = useState(false);

    const actions = [
      { value: 'pending', label: 'Mark as Pending', icon: FiClock },
      { value: 'delivered', label: 'Mark as Delivered', icon: FiCheckCircle },
      { value: 'cancelled', label: 'Mark as Cancelled', icon: FiX }
    ];

    const handleSubmit = async () => {
      if (!bulkAction) {
        toast.error("Please select an action");
        return;
      }
      setLoading(true);
      await handleBulkAction();
      setLoading(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Bulk Actions</h3>
                <p className="text-sm text-gray-500">{selectedOrders.length} orders selected</p>
              </div>
              <button
                onClick={() => setShowBulkActionModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-3">
              {actions.map(action => (
                <button
                  key={action.value}
                  onClick={() => setBulkAction(action.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    bulkAction === action.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="text-xl text-emerald-600" />
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </div>
                  {bulkAction === action.value && <FiCheck className="text-emerald-600 text-xl" />}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkActionModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !bulkAction}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-semibold transition-all shadow-lg shadow-emerald-200/50 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Apply Action'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 p-4 md:p-8">
      <style>{`
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scaleIn 0.3s ease-out; }
        .table-row { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>

      {showStatusModal && <StatusChangeModal />}
      {showDetailsModal && <OrderDetailsModal />}
      {showBulkActionModal && <BulkActionModal />}

      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#05B171] to-emerald-600 shadow-lg shadow-emerald-200">
                  <FiShoppingBag className="text-white text-xl" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Order Management</h1>
              </div>
              <p className="text-base text-gray-500 ml-16">Manage and track all customer orders</p>
            </div>
            
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">{selectedOrders.length} selected</span>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={() => { setBulkAction(""); setShowBulkActionModal(true); }}
                  className="px-6 py-2 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-medium text-sm shadow-lg shadow-emerald-200/50"
                >
                  Bulk Actions
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-12 py-4 w-full border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white shadow-sm text-base"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                <FiX className="text-xl" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedOrders([]); setCurrentPage(1); }}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <tab.icon className="text-xl" />
                <div className="text-left">
                  <p className="text-sm font-semibold">{tab.label}</p>
                  <p className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-gray-500'}`}>{tab.count} orders</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : currentOrders.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <>
            {currentOrders.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 mb-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === currentOrders.length}
                    onChange={() => toggleSelectAll(currentOrders)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">Select All ({currentOrders.length} on this page)</span>
                </div>
                <span className="text-sm text-gray-500">Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, allOrdersForTab.length)} of {allOrdersForTab.length} orders</span>
              </div>
            )}

            <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-100">
                      <th className="px-8 py-5 text-left">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                          onChange={() => toggleSelectAll(currentOrders)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Order</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Customer</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Delivery</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Total</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, index) => (
                      <OrderRow
                        key={order._id}
                        order={order}
                        index={index}
                        isSelected={selectedOrders.includes(order._id)}
                        onToggleSelect={toggleSelectOrder}
                        onViewDetails={() => { setSelectedOrderForDetails(order); setShowDetailsModal(true); }}
                        onChangeStatus={() => { setSelectedOrderForStatus(order); setShowStatusModal(true); }}
                        formatDate={formatDate}
                        isDeliveryToday={isDeliveryToday}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {allOrdersForTab.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border-2 border-gray-100 p-5">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-semibold text-gray-900">{Math.min(indexOfLastItem, allOrdersForTab.length)}</span> of{" "}
                  <span className="font-semibold text-gray-900">{allOrdersForTab.length}</span> orders
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`w-10 h-10 rounded-xl font-medium transition-all ${
                              currentPage === pageNumber
                                ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white shadow-lg'
                                : 'border-2 border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border-2 border-gray-100">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-emerald-600"></div>
    </div>
    <p className="mt-6 text-gray-500 font-medium">Loading orders...</p>
  </div>
);

const EmptyState = ({ activeTab }) => {
  const messages = {
    all: "No orders found",
    dueToday: "No orders due for delivery today",
    pending: "No pending orders",
    delivered: "No delivered orders",
    cancelled: "No cancelled orders"
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-3xl border-2 border-gray-100">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
        <FiShoppingBag className="text-gray-400 text-4xl" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{messages[activeTab]}</h3>
      <p className="text-gray-500 text-center max-w-md">
        {activeTab === 'all' ? "Orders will appear here when customers place them." : "Try switching to a different tab."}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' }
  };
  const style = config[status] || config.pending;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  const lowerStatus = status.toLowerCase();
  const config = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
  };
  const style = config[lowerStatus] || config.pending;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
};

const OrderRow = ({ order, index, isSelected, onToggleSelect, onViewDetails, onChangeStatus, formatDate, isDeliveryToday }) => {
  const isDueToday = isDeliveryToday(order.deliveryDate) && order.status === 'pending';

  return (
    <tr className="table-row border-b border-gray-100 hover:bg-gray-50/60 transition-all" style={{ animationDelay: `${index * 30}ms` }}>
      <td className="px-8 py-6">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(order._id)}
          className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <FiPackage className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div>
          <p className="font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-400">{order.user?.phone || 'No phone'}</p>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-2">
          {isDueToday && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">Today</span>
          )}
          <p className="text-sm text-gray-600">{formatDate(order.deliveryDate)}</p>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="font-bold text-gray-900">{order.total} birr</p>
      </td>
      <td className="px-8 py-6">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onViewDetails}
            className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="View Details"
          >
            <FiEye className="text-lg" />
          </button>
          <button
            onClick={onChangeStatus}
            className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            title="Change Status"
          >
            <FiEdit3 className="text-lg" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default OrderManagement;