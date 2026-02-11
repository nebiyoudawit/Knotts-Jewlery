// src/components/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiPackage,
  FiStar,
  FiActivity,
  FiCalendar,
  FiChevronRight,
  FiChevronLeft,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiPercent,
  FiBox,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/enhanced`, {
        // Changed from /admin/dashboard/enhanced
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      toast.error(err.message);
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // For real-time updates:
  const fetchRealTimeUpdates = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/updates`, {
        // Changed from /admin/dashboard/updates
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setRealTimeUpdates(data.updates);
      }
    } catch (err) {
      console.error("Real-time updates error:", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchRealTimeUpdates();

    // Poll for real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeUpdates, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchRealTimeUpdates]);

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color,
    gradient,
    suffix = "",
  }) => {
    const changeNumber = parseFloat(change);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className={`p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/80`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-800">
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix}
            </p>
          </div>
          <div className={`p-3 rounded-full ${gradient} shadow-lg`}>{icon}</div>
        </div>
        <div className="flex items-center">
          <span
            className={`text-sm font-medium ${changeNumber >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            {changeNumber >= 0 ? "+" : ""}
            {changeNumber}%
          </span>
          <span className="text-xs text-gray-500 ml-2">from last month</span>
        </div>
      </motion.div>
    );
  };

  const MiniStatCard = ({ title, value, icon, color, tooltip }) => {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>{icon}</div>
          <div>
            <p className="text-xs text-gray-500">{title}</p>
            <p className="text-lg font-bold text-gray-800">{value}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FiCheckCircle className="w-4 h-4" />;
      case "pending":
        return <FiClock className="w-4 h-4" />;
      case "cancelled":
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl p-6 h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 rounded-2xl p-6 h-80"></div>
          <div className="bg-gray-200 rounded-2xl p-6 h-80"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    stats,
    charts,
    recentOrders,
    topProducts,
    recentActivities,
    summary,
    orderStatusSummary,
  } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back!{" "}
            {realTimeUpdates && (
              <span className="text-emerald-600 font-medium">
                {realTimeUpdates.recentOrders} new orders in the last hour
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
            <FiCalendar className="text-gray-500" />
            <span className="text-sm text-gray-600">
              Today: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Mini Stats */}
      {realTimeUpdates && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStatCard
            title="Recent Orders"
            value={realTimeUpdates.recentOrders}
            icon={<FiShoppingBag className="w-5 h-5 text-blue-600" />}
            color="text-blue-600"
            tooltip="Orders in last hour"
          />
          <MiniStatCard
            title="Pending Orders"
            value={realTimeUpdates.pendingOrders}
            icon={<FiClock className="w-5 h-5 text-amber-600" />}
            color="text-amber-600"
            tooltip="Orders awaiting processing"
          />
          <MiniStatCard
            title="Recent Customers"
            value={realTimeUpdates.recentCustomers}
            icon={<FiUsers className="w-5 h-5 text-emerald-600" />}
            color="text-emerald-600"
            tooltip="New customers in last hour"
          />
          <MiniStatCard
            title="Low Stock"
            value={realTimeUpdates.lowStockProducts}
            icon={<FiAlertCircle className="w-5 h-5 text-rose-600" />}
            color="text-rose-600"
            tooltip="Products with low inventory"
          />
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={parseFloat(stats.totalRevenue.value)}
          change={stats.totalRevenue.change}
          icon={<FiDollarSign className="w-6 h-6 text-white" />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          suffix=" birr"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.value}
          change={stats.totalOrders.change}
          icon={<FiShoppingBag className="w-6 h-6 text-white" />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.value}
          change={stats.totalCustomers.change}
          icon={<FiUsers className="w-6 h-6 text-white" />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Growth Rate"
          value={stats.salesGrowth.change}
          change={stats.salesGrowth.change}
          icon={<FiTrendingUp className="w-6 h-6 text-white" />}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          suffix="%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Sales Overview (Last 6 Months)
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                  formatter={(value) => [
                    `${value.toLocaleString()} birr`,
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ stroke: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Orders"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Revenue by Category
            </h3>
            <FiPackage className="text-gray-400" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {charts.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${value.toLocaleString()} birr`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {charts.categoryData.slice(0, 4).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {item.count} sold
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
            <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
              View all <FiChevronRight />
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <FiShoppingBag className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {order.amount.toFixed(2)} birr
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Top Products</h3>
            <FiStar className="text-amber-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                    <span className="font-bold text-emerald-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.sales} sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {product.revenue.toFixed(2)} birr
                  </p>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(product.sales / Math.max(...topProducts.map((p) => p.sales))) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          <FiActivity className="text-gray-400" />
        </div>

        {/* Activity List with Pagination */}
        <div className="space-y-4">
          {recentActivities
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((activity, index) => (
              <motion.div
                key={`${activity.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 hover:bg-gray-50/50 rounded-xl border border-gray-100 transition-all duration-200 group"
              >
                <div
                  className={`p-3 rounded-full ${
                    activity.type === "order"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                  } transition-transform duration-300 group-hover:scale-110`}
                >
                  {activity.type === "order" ? <FiShoppingBag /> : <FiUsers />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 group-hover:text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()} at{" "}
                      {new Date(activity.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {activity.type}
                    </span>
                  </div>
                </div>
                <FiChevronRight className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
              </motion.div>
            ))}
        </div>

        {/* Pagination Controls */}
        {recentActivities.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all duration-200 ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            {Array.from(
              { length: Math.ceil(recentActivities.length / itemsPerPage) },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === page
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(recentActivities.length / itemsPerPage),
                  ),
                )
              }
              disabled={
                currentPage ===
                Math.ceil(recentActivities.length / itemsPerPage)
              }
              className={`p-2 rounded-lg transition-all duration-200 ${
                currentPage ===
                Math.ceil(recentActivities.length / itemsPerPage)
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
