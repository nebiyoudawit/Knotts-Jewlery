import { useState, useEffect, useCallback } from "react";
import {
  FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp,
  FiPackage, FiClock, FiCheckCircle, FiXCircle,
  FiArrowUp, FiArrowDown, FiCalendar, FiEye
} from "react-icons/fi";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(null);

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
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      toast.error(err.message);
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRealTimeUpdates = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/updates`, {
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
    const interval = setInterval(fetchRealTimeUpdates, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchRealTimeUpdates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-100 border-t-emerald-600"></div>
          <div className="absolute inset-0 rounded-full bg-emerald-50 opacity-20"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load dashboard</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-[#05B171] to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, charts, recentOrders, topProducts, orderStatusSummary } = dashboardData;

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
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.4s ease-out; }
      `}</style>

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#05B171] to-emerald-600 shadow-lg shadow-emerald-200">
              <FiTrendingUp className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {realTimeUpdates && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <QuickStatCard
              label="Recent Orders"
              value={realTimeUpdates.recentOrders}
              icon={<FiShoppingBag className="text-blue-600" />}
              color="blue"
            />
            <QuickStatCard
              label="Pending"
              value={realTimeUpdates.pendingOrders}
              icon={<FiClock className="text-amber-600" />}
              color="amber"
            />
            <QuickStatCard
              label="New Customers"
              value={realTimeUpdates.recentCustomers}
              icon={<FiUsers className="text-emerald-600" />}
              color="emerald"
            />
            <QuickStatCard
              label="Low Stock"
              value={realTimeUpdates.lowStockProducts}
              icon={<FiPackage className="text-red-600" />}
              color="red"
            />
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`${parseFloat(stats.totalRevenue.value).toLocaleString()} birr`}
            change={parseFloat(stats.totalRevenue.change)}
            icon={<FiDollarSign className="text-white text-2xl" />}
            gradient="from-emerald-500 to-teal-600"
            delay="0.2s"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.value.toLocaleString()}
            change={parseFloat(stats.totalOrders.change)}
            icon={<FiShoppingBag className="text-white text-2xl" />}
            gradient="from-blue-500 to-blue-600"
            delay="0.3s"
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers.value.toLocaleString()}
            change={parseFloat(stats.totalCustomers.change)}
            icon={<FiUsers className="text-white text-2xl" />}
            gradient="from-purple-500 to-purple-600"
            delay="0.4s"
          />
          <StatCard
            title="Sales Growth"
            value={`${stats.salesGrowth.change}%`}
            change={parseFloat(stats.salesGrowth.change)}
            icon={<FiTrendingUp className="text-white text-2xl" />}
            gradient="from-amber-500 to-orange-600"
            delay="0.5s"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-500 mt-1">Last 6 months performance</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <p className="text-xs text-emerald-600 font-semibold">Total Revenue</p>
                <p className="text-lg font-bold text-emerald-700">
                  {charts.salesData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()} birr
                </p>
              </div>
            </div>
            <RevenueLineGraph data={charts.salesData} />
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm animate-fade-in-up" style={{animationDelay: '0.7s'}}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Categories</h3>
              <p className="text-sm text-gray-500 mt-1">Revenue distribution</p>
            </div>
            <div className="space-y-4">
              {charts.categoryData.slice(0, 5).map((category, index) => (
                <CategoryBar
                  key={index}
                  name={category.name}
                  value={category.value}
                  count={category.count}
                  color={category.color}
                  maxValue={Math.max(...charts.categoryData.map(c => c.value))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status</h3>
            <div className="space-y-4">
              <StatusItem
                label="Delivered"
                count={orderStatusSummary.delivered}
                icon={<FiCheckCircle className="text-emerald-600" />}
                color="emerald"
              />
              <StatusItem
                label="Pending"
                count={orderStatusSummary.pending}
                icon={<FiClock className="text-amber-600" />}
                color="amber"
              />
              <StatusItem
                label="Cancelled"
                count={orderStatusSummary.cancelled}
                icon={<FiXCircle className="text-red-600" />}
                color="red"
              />
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm animate-fade-in-up" style={{animationDelay: '0.9s'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                View All <FiEye className="text-base" />
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order, index) => (
                <OrderItem key={index} order={order} delay={index * 0.05} />
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm animate-fade-in-up" style={{animationDelay: '1s'}}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Top Selling Products</h3>
              <p className="text-sm text-gray-500 mt-1">Best performers this month</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topProducts.map((product, index) => (
              <ProductCard key={index} product={product} rank={index + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Stat Card Component
const QuickStatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl bg-${color}-50`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Main Stat Card Component
const StatCard = ({ title, value, change, icon, gradient, delay }) => (
  <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all animate-fade-in-up" style={{animationDelay: delay}}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {change >= 0 ? (
        <div className="flex items-center gap-1 text-emerald-600">
          <FiArrowUp className="text-sm" />
          <span className="text-sm font-semibold">+{change.toFixed(1)}%</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600">
          <FiArrowDown className="text-sm" />
          <span className="text-sm font-semibold">{change.toFixed(1)}%</span>
        </div>
      )}
      <span className="text-xs text-gray-500">vs last month</span>
    </div>
  </div>
);

// Revenue Line Graph Component
const RevenueLineGraph = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const maxRevenue = Math.max(...data.map(d => d.sales));
  const minRevenue = Math.min(...data.map(d => d.sales));
  const padding = (maxRevenue - minRevenue) * 0.2;
  const chartMax = maxRevenue + padding;
  const chartMin = Math.max(0, minRevenue - padding);
  const range = chartMax - chartMin;
  
  const width = 600;
  const height = 200;
  const pointRadius = 6;
  
  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.sales - chartMin) / range) * height;
    return { x, y, value: d.sales, month: d.month, orders: d.orders };
  });
  
  // Create path for the line
  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');
  
  // Create path for the gradient fill
  const areaPath = `M 0 ${height} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${width} ${height} Z`;
  
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="0"
            y1={(height / 4) * i}
            x2={width}
            y2={(height / 4) * i}
            stroke="#f0f0f0"
            strokeWidth="1"
          />
        ))}
        
        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#revenueGradient)"
        />
        
        {/* Main line */}
        <path
          d={linePath}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r={pointRadius}
              fill="white"
              stroke="#10b981"
              strokeWidth="3"
              className="hover:r-8 transition-all cursor-pointer"
            >
              <title>{`${point.month}: ${point.value.toLocaleString()} birr (${point.orders} orders)`}</title>
            </circle>
            <circle
              cx={point.x}
              cy={point.y}
              r={pointRadius - 2}
              fill="#10b981"
              className="pointer-events-none"
            />
          </g>
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-6 px-2">
        {data.map((d, i) => (
          <div key={i} className="text-center flex-1">
            <p className="text-sm font-semibold text-gray-700">{d.month}</p>
            <p className="text-xs text-gray-500 mt-1">{d.orders} orders</p>
            <p className="text-xs font-medium text-emerald-600 mt-0.5">
              {d.sales.toLocaleString()} birr
            </p>
          </div>
        ))}
      </div>
      
      {/* Y-axis indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-right pr-2 text-xs text-gray-500">
        <span>{chartMax.toLocaleString()}</span>
        <span>{((chartMax + chartMin) / 2).toLocaleString()}</span>
        <span>{chartMin.toLocaleString()}</span>
      </div>
    </div>
  );
};

// Category Bar Component
const CategoryBar = ({ name, value, count, color, maxValue }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <span className="text-sm font-bold text-gray-900">{value.toLocaleString()} birr</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{count} sold</p>
    </div>
  );
};

// Status Item Component
const StatusItem = ({ label, count, icon, color }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl bg-${color}-50`}>
        {icon}
      </div>
      <span className="font-medium text-gray-700">{label}</span>
    </div>
    <span className="text-2xl font-bold text-gray-900">{count}</span>
  </div>
);

// Order Item Component
const OrderItem = ({ order, delay }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all animate-fade-in-up" style={{animationDelay: `${delay}s`}}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
          <FiShoppingBag className="text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{order.id}</p>
          <p className="text-sm text-gray-500">{order.customer}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">{order.amount.toFixed(2)} birr</p>
        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border-2 ${getStatusColor(order.status)} mt-1`}>
          {order.status}
        </span>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, rank }) => (
  <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all group">
    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-sm">#{rank}</span>
    </div>
    <div className="mb-4">
      <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <FiPackage className="text-gray-400 text-4xl" />
        )}
      </div>
      <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{product.name}</h4>
      <p className="text-xs text-gray-500">{product.sales} sales</p>
    </div>
    <div className="pt-4 border-t-2 border-gray-100">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Revenue</span>
        <span className="font-bold text-emerald-600">{product.revenue.toLocaleString()} birr</span>
      </div>
    </div>
  </div>
);

export default AdminDashboard;