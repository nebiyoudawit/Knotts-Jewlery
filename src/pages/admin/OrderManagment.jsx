import { useState, useEffect } from 'react';
import { FiTruck, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const API_BASE_URL = 'http://localhost:5000/api/admin';

const OrderManagment = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You need to log in to access orders');
      navigate('/login'); // Redirect to login if no token
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleApiError = (error, defaultMessage) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || defaultMessage;
    toast.error(message);
    
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      navigate('/login');
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
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data || []);
    } catch (err) {
      handleApiError(err, 'Failed to fetch orders');
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <FiCheckCircle className="text-green-500" />;
      case 'pending': return <FiClock className="text-amber-500" />;
      case 'cancelled': return <FiXCircle className="text-red-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      // Get current order first
      const orderRes = await fetch(`${API_BASE_URL}/orders/${orderId}`, { headers });
      if (!orderRes.ok) throw new Error('Failed to fetch order');
      const currentOrder = await orderRes.json();

      // Update order status
      const statusRes = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!statusRes.ok) {
        const errorData = await statusRes.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      const updatedOrder = await statusRes.json();
      let newPaymentStatus = updatedOrder.paymentStatus;
      let shouldUpdateSales = false;

      // Status transition logic
      if (newStatus === 'delivered' && currentOrder.status !== 'delivered') {
        const paymentRes = await fetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ paymentStatus: 'Paid' })
        });
        if (!paymentRes.ok) throw new Error('Failed to update payment status');
        newPaymentStatus = 'paid';
        shouldUpdateSales = true;
      } 
      else if (currentOrder.status === 'delivered' && newStatus !== 'delivered') {
        const paymentRes = await fetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ paymentStatus: 'Pending' })
        });
        if (!paymentRes.ok) throw new Error('Failed to update payment status');
        newPaymentStatus = 'pending';
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { 
            ...updatedOrder, 
            paymentStatus: newPaymentStatus 
          } : order
        )
      );
      
      toast.success('Order status updated successfully');
    } catch (err) {
      handleApiError(err, 'Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Orders Management</h2>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading orders...</div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Order #{order._id.slice(-6)}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(order.status)}
                    <span className="text-sm capitalize">{order.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="border border-gray-300 rounded-md p-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={() => toggleOrderDetails(order._id)} 
                    className="text-gray-600 hover:text-gray-900 p-1"
                  >
                    {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
              </div>
              
              {expandedOrder === order._id && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Customer:</span>
                    <span className="text-sm">{order.user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Date:</span>
                    <span className="text-sm">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="text-sm">{order.total} birr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payment:</span>
                    <span className={`text-sm ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Items:</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span>{item.price * item.quantity} birr</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No orders found.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading orders...</div>
        ) : orders.length > 0 ? (
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
              {orders.map(order => (
                <>
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.user?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.total} birr</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="border border-gray-300 rounded-md p-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button 
                          onClick={() => toggleOrderDetails(order._id)} 
                          className="text-gray-600 hover:text-gray-900 p-1"
                        >
                          {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Order Details</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Order ID:</span> {order._id}</p>
                              <p><span className="text-gray-500">Customer:</span> {order.user?.name}</p>
                              <p><span className="text-gray-500">Number:</span> {order.user?.phone}</p>
                              <p><span className="text-gray-500">Order Date:</span> {formatDate(order.createdAt)}</p>
                              {order.deliveryDate && (
                                <p><span className="text-gray-500">Delivery Date:</span> {formatDate(order.deliveryDate)}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Items</h4>
                            <ul className="space-y-2">
                              {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between text-sm">
                                  <span>{item.name} x {item.quantity}</span>
                                  <span>{item.price * item.quantity} birr</span>
                                </li>
                              ))}
                              <li className="flex justify-between font-medium border-t pt-2 mt-2">
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagment;