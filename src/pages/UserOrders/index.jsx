import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiX,
} from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);
  const [error, setError] = useState('');
  const { currentUser, updateUserProfile } = useShop();

  const [user, setUser] = useState({
      name: '',
      email: '',
    });

    useEffect(() => {
        if (currentUser) {
          setUser({
            name: currentUser.name,
            email: currentUser.email,
          });
        }
      }, [currentUser]);


  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/user/orders', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch orders');

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No authentication token found');
      return;
    }

    setCanceling(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/user/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Cancellation failed');

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      alert('Order cancelled successfully');
    } catch (err) {
      alert(err.message || 'Error cancelling order');
    } finally {
      setCanceling(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-[#05B171]" />;
      case 'cancelled':
        return <FiXCircle className="text-red-500" />;
      case 'pending':
        return <FiClock className="text-amber-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  const canCancelOrder = (orderDate) => {
    const now = new Date();
    const placed = new Date(orderDate);
    const diffHours = (now - placed) / (1000 * 60 * 60);
    return diffHours < 24 && diffHours >= 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#05B171] flex items-center justify-center text-white text-xl font-bold">
              {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-2">
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-100">
                <FiUser />
                <span>Profile</span>
              </Link>
              <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-md bg-[#05B171] text-white">
                <FiShoppingBag />
                <span>My Orders</span>
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            {loading ? (
              <p>Loading orders...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiShoppingBag className="text-gray-400 text-3xl" />
                </div>
                <h2 className="text-xl font-medium mb-2">No orders yet</h2>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
                <Link
                  to="/products"
                  className="inline-block bg-[#05B171] text-white px-6 py-3 rounded-md hover:bg-[#048a5b]"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const isPending = order.status === 'pending';
                  const cancellable = isPending && canCancelOrder(order.createdAt);

                  return (
                    <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Order Header */}
                      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium">{getStatusText(order.status)}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-sm text-gray-600">Order #{order._id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="text-gray-400" />
                          <span>Ordered on {formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-gray-200">
                        {order.items.map((item, i) => {
                          const name = item.name || 'Unnamed product';
                          const image = item.image || '/placeholder.png'; // Add placeholder image in public folder
                          const price = typeof item.price === 'number' ? item.price : 0;
                          const qty = item.qty || 0;

                          return (
                            <div key={i} className="p-4 flex items-start gap-4">
                              <img src={image} alt={name} className="w-16 h-16 object-cover rounded border" />
                              <div className="flex-1">
                                <h3 className="font-medium">{name}</h3>
                                <div className="flex justify-between text-sm text-gray-600 mt-2">
                                  <span>{qty} × {price.toFixed(2)} birr</span>
                                  <span>{(qty * price).toFixed(2)} birr</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between gap-3 items-center">
                        <span className="text-sm text-gray-600">{order.items.length} items</span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">Total: {order.totalPrice?.toFixed(2) || '0.00'} birr</span>
                          {order.status === 'delivered' && (
                            <button className="px-4 py-2 bg-[#05B171] text-white rounded hover:bg-[#048a5b] text-sm">
                              Buy Again
                            </button>
                          )}
                          {isPending && cancellable ? (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={canceling === order._id}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center gap-2"
                            >
                              <FiX size={16} />
                              {canceling === order._id ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          ) : (
                            isPending && (
                              <span className="text-sm text-gray-500">Cancellation window expired</span>
                            )
                          )}
                        </div>
                      </div>
                      {isPending && cancellable && (
                        <div className="bg-amber-50 p-3 text-sm text-amber-700 border-t border-amber-200">
                          You can cancel this order within 24 hours of placing it
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrders;
