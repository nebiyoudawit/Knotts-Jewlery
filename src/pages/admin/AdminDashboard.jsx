// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000/api/admin';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(API_BASE_URL, {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data.stats);
        setRecentActivities(data.recentActivities);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats && (
          <>
            <StatCard 
              title="Total Revenue" 
              value={`${stats.totalRevenue.value} birr`}
              change={`+${stats.totalRevenue.change}%`}
              icon={<FiDollarSign className="text-2xl" />}
            />
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders.value}
              change={`+${stats.totalOrders.change}%`}
              icon={<FiShoppingBag className="text-2xl" />}
            />
            <StatCard 
              title="Total Customers" 
              value={stats.totalCustomers.value}
              change={`+${stats.totalCustomers.change}%`}
              icon={<FiUsers className="text-2xl" />}
            />
            <StatCard 
              title="Sales Growth" 
              value={`${stats.salesGrowth.change}%`}
              change={`+${stats.salesGrowth.change}%`}
              icon={<FiTrendingUp className="text-2xl" />}
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="p-2 rounded-full bg-[#05B171] bg-opacity-10 text-[#05B171]">
        {icon}
      </div>
    </div>
    <p className="text-sm mt-3 text-green-600 flex items-center">
      <span>{change}</span>
      <span className="ml-1">from last month</span>
    </p>
  </div>
);

const ActivityItem = ({ activity }) => {
  const getIcon = () => {
    switch(activity.icon) {
      case 'shopping-bag': return <FiShoppingBag />;
      case 'user': return <FiUsers />;
      default: return <FiDollarSign />;
    }
  };

  const getIconColor = () => {
    switch(activity.type) {
      case 'order': return 'bg-blue-100 text-blue-600';
      case 'customer': return 'bg-green-100 text-green-600';
      default: return 'bg-amber-100 text-amber-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
      <div className={`p-2 rounded-full ${getIconColor()}`}>
        {getIcon()}
      </div>
      <div>
        <p className="font-medium">{activity.title}</p>
        <p className="text-sm text-gray-500">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(activity.date)}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;