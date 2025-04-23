// src/components/admin/OrdersManager.jsx
import { useState } from 'react';
import { FiTruck, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const OrderManagment = () => {
  const [orders, setOrders] = useState([
    { id: 'ORD-1001', customer: 'Sarah Johnson', date: '2023-05-15', total: 1450, status: 'delivered' },
    { id: 'ORD-1002', customer: 'Michael Bekele', date: '2023-05-16', total: 2300, status: 'processing' },
    { id: 'ORD-1003', customer: 'Alemnesh Teka', date: '2023-05-17', total: 850, status: 'cancelled' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <FiCheckCircle className="text-green-500" />;
      case 'processing': return <FiClock className="text-amber-500" />;
      case 'shipped': return <FiTruck className="text-blue-500" />;
      case 'cancelled': return <FiXCircle className="text-red-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05B171] w-full"
          />
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            getStatusIcon={getStatusIcon}
            onStatusChange={updateStatus}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.total} birr</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border border-gray-300 rounded-md p-1 text-sm"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrderCard = ({ order, getStatusIcon, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{order.id}</h3>
          <div className="flex items-center gap-2 mt-1">
            {getStatusIcon(order.status)}
            <span className="text-sm capitalize">{order.status}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="border border-gray-300 rounded-md p-1 text-xs"
          >
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-gray-600 hover:text-gray-900 p-1"
          >
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Customer:</span>
            <span className="text-sm">{order.customer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm">{order.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total:</span>
            <span className="text-sm">{order.total} birr</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagment;