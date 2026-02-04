import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiX,
  FiTruck,
  FiCreditCard,
  FiPackage,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiSearch,
  FiEye,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../../context/ShopContext";
import OrderDetailModal from "../../components/OrderDetailModal";

const apiUrl = import.meta.env.VITE_API_URL;

const ITEMS_PER_PAGE = 5;

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);
  const [error, setError] = useState("");
  const { currentUser } = useShop();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    cancelled: 0,
  });

  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");
  const [targetOrderId, setTargetOrderId] = useState(null);
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name,
        email: currentUser.email,
      });
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/user/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        delivered: data.filter(o => o.status === "delivered").length,
        pending: data.filter(o => o.status === "pending").length,
        cancelled: data.filter(o => o.status === "cancelled").length,
      };
      setStats(stats);
    } catch (err) {
      setError(err.message || "Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters whenever orders or filters change
  useEffect(() => {
    let result = orders;
    
    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter(order => order.status === filters.status);
    }
    
    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(searchTerm) ||
        (order.shippingAddress && order.shippingAddress.toLowerCase().includes(searchTerm)) ||
        (order.paymentMethod && order.paymentMethod.toLowerCase().includes(searchTerm)) ||
        order.items.some(item => 
          item.name && item.name.toLowerCase().includes(searchTerm)
        )
      );
    }
    
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [orders, filters]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const confirmCancelOrder = (orderId) => {
    setTargetOrderId(orderId);
    setModalMessage("Are you sure you want to cancel this order?");
    setModalType("confirm");
    setShowModal(true);
  };

  const handleCancelConfirmed = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalMessage("No authentication token found");
      setModalType("info");
      return;
    }

    setCanceling(targetOrderId);
    try {
      const res = await fetch(`${apiUrl}/user/orders/${targetOrderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Cancellation failed");

      setOrders((prev) =>
        prev.map((order) =>
          order._id === targetOrderId
            ? { ...order, status: "cancelled" }
            : order
        )
      );

      setStats(prev => ({
        ...prev,
        cancelled: prev.cancelled + 1,
        pending: prev.pending - 1
      }));

      setModalMessage("Order cancelled successfully.");
    } catch (err) {
      setModalMessage(err.message || "Error cancelling order");
    } finally {
      setModalType("info");
      setCanceling(null);
      setTargetOrderId(null);
      setShowModal(true);
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

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

  const canCancelOrder = (orderDate) => {
    const now = new Date();
    const placed = new Date(orderDate);
    const diffHours = (now - placed) / (1000 * 60 * 60);
    return diffHours < 24 && diffHours >= 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const shortenOrderId = (id) => {
    return id.length > 12 ? `${id.substring(0, 8)}...${id.substring(id.length - 4)}` : id;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <motion.button
          key={i}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
            currentPage === i
              ? "bg-gradient-to-r from-[#05B171] to-emerald-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          {i}
        </motion.button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          First
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Previous
        </motion.button>
        
        {pages}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Next
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Last
        </motion.button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/40 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-green-100/30 to-emerald-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative z-[1]">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Track and manage your orders</p>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Link to="/" className="hover:text-[#05B171] transition-colors">
                Home
              </Link>
              <FiChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              <Link to="/profile" className="hover:text-[#05B171] transition-colors">
                Profile
              </Link>
              <FiChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[#05B171] font-medium">Orders</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar - Collapsible on Mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-full lg:w-72 lg:shrink-0"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden lg:sticky lg:top-24">
              {/* User Info */}
              <div className="bg-gradient-to-br from-[#05B171] to-emerald-600 p-4 sm:p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                <div className="relative flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center text-[#05B171] text-xl sm:text-2xl font-bold shadow-xl mb-3 border-4 border-white/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-white mb-1 text-center">{user.name}</h3>
                  <p className="text-xs sm:text-sm text-emerald-50 text-center truncate max-w-full px-2">{user.email}</p>
                </div>
              </div>

              {/* Filters Section */}
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <FiFilter className="h-3 w-3 sm:h-4 sm:w-4" />
                    Filters
                  </h4>
                  
                  {/* Search Input */}
                  <div className="mb-3 sm:mb-4">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                      Search Orders
                    </label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        placeholder="Search orders..."
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:border-[#05B171] focus:ring-2 focus:ring-emerald-100 outline-none text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:border-[#05B171] focus:ring-2 focus:ring-emerald-100 outline-none text-xs sm:text-sm bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {filters.status !== "all" || filters.search.trim() !== "" ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilters({ status: "all", search: "" })}
                      className="w-full py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                    >
                      Clear Filters
                    </motion.button>
                  ) : null}
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-3 sm:p-4 space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 group-hover:bg-emerald-50 rounded-lg flex items-center justify-center transition-colors">
                    <FiUser className="text-gray-600 group-hover:text-[#05B171] transition-colors text-sm sm:text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm sm:text-base">Profile Settings</span>
                  </div>
                  <FiChevronRight className="text-gray-400 group-hover:text-[#05B171] transition-colors h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-[#05B171] border border-emerald-100 shadow-sm"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-[#05B171] to-emerald-600 rounded-lg flex items-center justify-center">
                    <FiShoppingBag className="text-white text-sm sm:text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">My Orders</span>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#05B171] rounded-full"></div>
                  </div>
                </Link>
              </nav>

              {/* Order Stats */}
              <div className="p-3 sm:p-4 border-t border-gray-100">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Order Summary</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Total Orders</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Delivered</span>
                      <span className="text-xs sm:text-sm font-medium text-emerald-600">{stats.delivered}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Pending</span>
                      <span className="text-xs sm:text-sm font-medium text-amber-600">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Cancelled</span>
                      <span className="text-xs sm:text-sm font-medium text-red-600">{stats.cancelled}</span>
                    </div>
                    {filters.status !== "all" && (
                      <div className="pt-2 sm:pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Filtered</span>
                          <span className="text-xs sm:text-sm font-bold text-[#05B171]">{filteredOrders.length}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex-1"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#05B171] to-emerald-600 p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                      Order History
                    </h2>
                    <p className="text-emerald-50/90 text-xs sm:text-sm">
                      Showing {paginatedOrders.length} of {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                      {filters.status !== "all" && ` (${filters.status})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle - Hidden on small screens */}
                    <div className="hidden sm:flex bg-white/20 backdrop-blur-sm rounded-lg p-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#05B171]" : "text-white"}`}
                      >
                        <FiList className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#05B171]" : "text-white"}`}
                      >
                        <FiGrid className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchOrders}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-[#05B171] rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/30 text-sm sm:text-base"
                    >
                      <svg
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`}
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Refresh</span>
                      <span className="sm:hidden">Reload</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-emerald-200 border-t-[#05B171] rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiPackage className="h-5 w-5 sm:h-6 sm:w-6 text-[#05B171]" />
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading your orders...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiXCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">{error}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchOrders}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-500/30 text-sm sm:text-base"
                    >
                      Try Again
                    </motion.button>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {filters.status !== "all" || filters.search.trim() !== "" ? (
                        <FiSearch className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-400" />
                      ) : (
                        <FiShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-400" />
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      {filters.status !== "all" || filters.search.trim() !== "" 
                        ? "No matching orders found" 
                        : "No orders yet"}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
                      {filters.status !== "all" || filters.search.trim() !== ""
                        ? "Try changing your filters or search terms to find orders."
                        : "You haven't placed any orders yet. Start shopping to see your orders here."}
                    </p>
                    {(filters.status !== "all" || filters.search.trim() !== "") ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters({ status: "all", search: "" })}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-500/30 text-sm sm:text-base"
                      >
                        Clear Filters
                      </motion.button>
                    ) : (
                      <Link to="/products">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-500/30 text-sm sm:text-base"
                        >
                          Browse Products
                        </motion.button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    {viewMode === "list" || window.innerWidth < 640 ? (
                      <div className="space-y-3 sm:space-y-4">
                        <AnimatePresence>
                          {paginatedOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const isExpanded = expandedOrder === order._id;
                            const isPending = order.status === "pending";
                            const cancellable = isPending && canCancelOrder(order.createdAt);

                            return (
                              <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                              >
                                {/* Order Header */}
                                <div
                                  className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer"
                                  onClick={() => toggleOrderExpand(order._id)}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className={`p-1.5 sm:p-2 rounded-lg ${statusConfig.bg} ${statusConfig.border}`}>
                                        {statusConfig.icon}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                            Order #{shortenOrderId(order._id)}
                                          </h3>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} self-start sm:self-auto`}>
                                            {statusConfig.text}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1 flex-wrap">
                                          <div className="flex items-center gap-1">
                                            <FiCalendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                            <span>{formatDate(order.createdAt)}</span>
                                          </div>
                                          <span className="text-gray-300 hidden sm:inline">•</span>
                                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                                      <div className="text-right">
                                        <p className="text-xs sm:text-sm text-gray-600">Total</p>
                                        <p className="text-base sm:text-lg font-bold text-gray-900">
                                          {order.totalPrice?.toFixed(2) || "0.00"} birr
                                        </p>
                                      </div>
                                      <div className="text-gray-400">
                                        {isExpanded ? <FiChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Actions - Always visible */}
                                <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 flex-wrap">
                                    <span className="truncate max-w-[120px] sm:max-w-none">ID: {shortenOrderId(order._id)}</span>
                                    <span className="text-gray-300 hidden sm:inline">•</span>
                                    <span className="flex items-center gap-1">
                                      <FiCreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                      {getPaymentStatusText(order.paymentStatus)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openOrderDetail(order);
                                      }}
                                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all font-medium flex items-center gap-1.5 sm:gap-2"
                                    >
                                      <FiEye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                      View
                                    </motion.button>
                                    {isPending && cancellable && (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          confirmCancelOrder(order._id);
                                        }}
                                        disabled={canceling === order._id}
                                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all font-medium flex items-center gap-1.5 sm:gap-2"
                                      >
                                        <FiX className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        Cancel
                                      </motion.button>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                  <div className="p-3 sm:p-4 bg-white">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FiTruck className="text-white h-4 w-4 sm:h-5 sm:w-5" />
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Shipping</h4>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                                              {order.shippingAddress || "Not specified"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FiCreditCard className="text-white h-4 w-4 sm:h-5 sm:w-5" />
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Payment</h4>
                                            <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                              <span className="text-xs sm:text-sm text-gray-600">{order.paymentMethod || "Not specified"}</span>
                                              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                                                order.paymentStatus?.toLowerCase() === "paid" 
                                                  ? "bg-emerald-50 text-emerald-600" 
                                                  : "bg-amber-50 text-amber-600"
                                              }`}>
                                                {getPaymentStatusText(order.paymentStatus)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Items Preview */}
                                    <div className="mb-4">
                                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Items ({order.items.length})</h4>
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {order.items.slice(0, 3).map((item, i) => (
                                          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                              {item.image ? (
                                                <img 
                                                  src={item.image} 
                                                  alt={item.name || "Product"} 
                                                  className="w-full h-full object-cover rounded-lg"
                                                />
                                              ) : (
                                                <FiPackage className="h-5 w-5 text-gray-400" />
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-gray-900 text-sm truncate">{item.name || "Unnamed product"}</p>
                                              <div className="flex justify-between text-xs text-gray-600">
                                                <span>{item.qty || 0} × {item.price?.toFixed(2) || "0.00"}</span>
                                                <span>{((item.qty || 0) * (item.price || 0)).toFixed(2)} birr</span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        {order.items.length > 3 && (
                                          <p className="text-xs text-gray-500 text-center">
                                            +{order.items.length - 3} more items
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Order Actions */}
                                    <div className="pt-3 border-t border-gray-200">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="text-xs sm:text-sm text-gray-600">
                                          Order placed: {formatDate(order.createdAt)}
                                        </div>
                                        <div className="flex gap-2">
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openOrderDetail(order);
                                            }}
                                            className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all font-medium"
                                          >
                                            Full Details
                                          </motion.button>
                                          {isPending && cancellable && (
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                confirmCancelOrder(order._id);
                                              }}
                                              disabled={canceling === order._id}
                                              className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium"
                                            >
                                              Cancel Order
                                            </motion.button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    ) : (
                      /* Grid View - Only on larger screens */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedOrders.map((order) => {
                          const statusConfig = getStatusConfig(order.status);
                          const isPending = order.status === "pending";
                          const cancellable = isPending && canCancelOrder(order.createdAt);

                          return (
                            <motion.div
                              key={order._id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow"
                            >
                              {/* Grid Card Header */}
                              <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${statusConfig.bg} ${statusConfig.border}`}>
                                      {statusConfig.icon}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 text-sm">Order #{shortenOrderId(order._id)}</h3>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                        {statusConfig.text}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">
                                    {order.totalPrice?.toFixed(2)} birr
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <FiCalendar className="h-3 w-3" />
                                    <span>{formatDate(order.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FiPackage className="h-3 w-3" />
                                    <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Grid Card Content */}
                              <div className="p-4">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-xs font-medium text-gray-700 mb-1">Payment Status</h4>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        order.paymentStatus?.toLowerCase() === "paid" 
                                          ? "bg-emerald-500" 
                                          : "bg-amber-500"
                                      }`}></div>
                                      <span className="text-sm text-gray-900">{getPaymentStatusText(order.paymentStatus)}</span>
                                    </div>
                                  </div>
                                  
                                  {order.deliveryDate && (
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-700 mb-1">Delivery Date</h4>
                                      <p className="text-sm text-gray-900">{formatDate(order.deliveryDate)}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Grid Card Actions */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openOrderDetail(order)}
                                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all font-medium flex items-center gap-2"
                                  >
                                    <FiEye className="h-3 w-3" />
                                    View
                                  </motion.button>
                                  
                                  {isPending && cancellable && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => confirmCancelOrder(order._id)}
                                      className="px-3 py-1.5 text-xs bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all font-medium flex items-center gap-2"
                                    >
                                      <FiX className="h-3 w-3" />
                                      Cancel
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
                          </div>
                          <div className="flex flex-col items-center gap-3">
                            {renderPagination()}
                            <div className="text-xs text-gray-500">
                              Page {currentPage} of {totalPages}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onCancelOrder={confirmCancelOrder}
      />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => modalType === "info" && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  modalType === "confirm" ? "bg-red-100" : "bg-emerald-100"
                }`}>
                  {modalType === "confirm" ? (
                    <FiX className="h-6 w-6 text-red-600" />
                  ) : (
                    <FiCheckCircle className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {modalType === "confirm" ? "Confirm Cancellation" : "Notification"}
                </h3>
                <p className="text-gray-600 text-center mb-6">{modalMessage}</p>
                <div className="flex gap-3">
                  {modalType === "confirm" ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowModal(false);
                          handleCancelConfirmed();
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all"
                      >
                        Yes, Cancel Order
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowModal(false);
                          setTargetOrderId(null);
                        }}
                        className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                      >
                        Go Back
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 font-semibold transition-all"
                    >
                      OK
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserOrders;