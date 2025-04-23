// src/components/admin/AdminDashboard.jsx
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: '24,540 birr', icon: <FiDollarSign className="text-2xl" />, change: '+12%' },
    { title: 'Total Orders', value: '1,234', icon: <FiShoppingBag className="text-2xl" />, change: '+5%' },
    { title: 'Total Customers', value: '845', icon: <FiUsers className="text-2xl" />, change: '+8%' },
    { title: 'Sales Growth', value: '18%', icon: <FiTrendingUp className="text-2xl" />, change: '+3%' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="p-2 rounded-full bg-[#05B171] bg-opacity-10 text-[#05B171]">
                {stat.icon}
              </div>
            </div>
            <p className="text-sm mt-3 text-green-600 flex items-center">
              <span>{stat.change}</span>
              <span className="ml-1">from last month</span>
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <FiShoppingBag />
            </div>
            <div>
              <p className="font-medium">New order received</p>
              <p className="text-sm text-gray-500">Order #ORD-1005 from Michael Bekele</p>
              <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <FiUsers />
            </div>
            <div>
              <p className="font-medium">New customer registered</p>
              <p className="text-sm text-gray-500">Alemnesh Teka (alemnesh@example.com)</p>
              <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              <FiDollarSign />
            </div>
            <div>
              <p className="font-medium">Payment processed</p>
              <p className="text-sm text-gray-500">Order #ORD-1004 payment of 1,850 birr</p>
              <p className="text-xs text-gray-400 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;