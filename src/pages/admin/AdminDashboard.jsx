// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';

const apiUrl = import.meta.env.VITE_API_URL;

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
        const response = await fetch(`${apiUrl}/admin`, {
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
  return (
    <div className="p-6">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        {/* Recent Activity Skeleton */}
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats && (
          <>
            <StatCard 
              title="Total Revenue" 
              value={`${stats.totalRevenue.value} birr`}
              change={`+${stats.totalRevenue.change}%`}
              icon={<FiDollarSign className="text-2xl" />}
              color="purple"
            />
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders.value}
              change={`+${stats.totalOrders.change}%`}
              icon={<FiShoppingBag className="text-2xl" />}
              color="blue"
            />
            <StatCard 
              title="Total Customers" 
              value={stats.totalCustomers.value}
              change={`+${stats.totalCustomers.change}%`}
              icon={<FiUsers className="text-2xl" />}
              color="green"
            />
            <StatCard 
              title="Sales Growth" 
              value={`${stats.salesGrowth.change}%`}
              change={`+${stats.salesGrowth.change}%`}
              icon={<FiTrendingUp className="text-2xl" />}
              color="orange"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No recent activities found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color }) => {
  const colorVariants = {
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      changeColor: 'text-purple-600'
    },
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      changeColor: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      changeColor: 'text-green-600'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      changeColor: 'text-orange-600'
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${colorVariants[color].bg}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorVariants[color].iconBg} ${colorVariants[color].iconColor} transition-all duration-300 hover:scale-110`}>
          {icon}
        </div>
      </div>
      <p className={`text-sm mt-3 ${colorVariants[color].changeColor} flex items-center`}>
        <span className="font-medium">{change}</span>
        <span className="ml-1 text-gray-500">from last month</span>
      </p>
    </div>
  );
};

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
      case 'order': return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
      case 'customer': return 'bg-green-100 text-green-600 hover:bg-green-200';
      default: return 'bg-amber-100 text-amber-600 hover:bg-amber-200';
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
    <div className="flex items-start gap-4 pb-4 border-b border-gray-100 group hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-200">
      <div className={`p-3 rounded-full ${getIconColor()} transition-all duration-300 group-hover:scale-110`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors duration-200">{activity.title}</p>
        <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(activity.date)}</p>
      </div>
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default AdminDashboard;