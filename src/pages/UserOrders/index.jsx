import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiX } from 'react-icons/fi';

const UserOrders = () => {
  // Sample order data with delivery dates
  const orders = [
    {
      id: 'ORD-12345',
      date: new Date(), // Today's order
      deliveryDate: 'March 20, 2023',
      status: 'delivered',
      total: 1450,
      items: [
        { 
          id: 1,
          name: 'Silver Bracelet', 
          quantity: 1, 
          price: 450,
          imageUrl: 'https://via.placeholder.com/80'
        }
      ],
      shippingAddress: 'Bole Road, Addis Ababa',
      paymentMethod: 'Credit Card (•••• •••• •••• 4242)'
    },
    {
      id: 'ORD-12344',
      date: new Date(Date.now() - 86400000), // Yesterday's order (24 hours ago)
      deliveryDate: 'March 5, 2023',
      status: 'pending',
      total: 2300,
      items: [
        { 
          id: 3,
          name: 'Handwoven Bracelet', 
          quantity: 1, 
          price: 1200,
          imageUrl: 'https://via.placeholder.com/80'
        }
      ],
      shippingAddress: 'Kirkos Subcity, Addis Ababa',
      paymentMethod: 'Mobile Payment'
    },
    {
      id: 'ORD-12343',
      date: new Date(Date.now() - 3600000), // 1 hour ago
      deliveryDate: 'April 12, 2023',
      status: 'pending',
      total: 1850,
      items: [
        { 
          id: 5,
          name: 'Diamond Necklace', 
          quantity: 1, 
          price: 1850,
          imageUrl: 'https://via.placeholder.com/80'
        }
      ],
      shippingAddress: 'Bole Road, Addis Ababa',
      paymentMethod: 'Credit Card (•••• •••• •••• 1234)'
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
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
    switch(status) {
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

  // Check if order is within cancellation window (less than 24 hours old)
  const canCancelOrder = (orderDate) => {
    const now = new Date();
    const orderTime = new Date(orderDate);
    const hoursSinceOrder = (now - orderTime) / (1000 * 60 * 60);
    return hoursSinceOrder < 24 && hoursSinceOrder >= 0;
  };

  // Format date to display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle order cancellation
  const handleCancelOrder = (orderId) => {
    // In a real app, this would call an API to cancel the order
    alert(`Order ${orderId} has been cancelled successfully.`);
    // You would typically update the state or refetch orders here
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
                S
              </div>
              <div>
                <h3 className="font-medium">Sarah Johnson</h3>
                <p className="text-sm text-gray-500">sarah@example.com</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                to="/profile"
                className="w-full text-left px-4 py-3 rounded-md flex items-center gap-3 hover:bg-gray-100"
              >
                <FiUser className="text-lg" />
                <span>Profile</span>
              </Link>
              <Link
                to="/orders"
                className="w-full text-left px-4 py-3 rounded-md flex items-center gap-3 bg-[#05B171] text-white"
              >
                <FiShoppingBag className="text-lg" />
                <span>My Orders</span>
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            {orders.length === 0 ? (
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
                {orders.map(order => {
                  const isPending = order.status === 'pending';
                  const cancellable = isPending && canCancelOrder(order.date);
                  const orderDateText = formatDate(order.date);
                  
                  return (
                    <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Order Header */}
                      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className={`text-sm font-medium ${
                              order.status === 'delivered' ? 'text-[#05B171]' :
                              order.status === 'cancelled' ? 'text-red-600' :
                              'text-amber-600'
                            }`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <span className="hidden sm:block text-gray-400">|</span>
                          <span className="text-sm text-gray-600">Order #{order.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="text-gray-400" />
                          <span>Ordered on {orderDateText}</span>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="divide-y divide-gray-200">
                        {order.items.map(item => (
                          <div key={item.id} className="p-4">
                            <div className="flex items-start gap-4">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium hover:text-[#05B171]">
                                  {item.name}
                                </h3>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-gray-600 text-sm">
                                    {item.quantity} × {item.price.toFixed(2)} birr
                                  </span>
                                  <span className="font-medium">
                                    {(item.price * item.quantity).toFixed(2)} birr
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Order Footer */}
                      <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-700 font-medium">Total: {order.total.toFixed(2)} birr</span>
                          {order.status === 'delivered' && (
                            <button className="px-4 py-2 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b] text-sm">
                              Buy Again
                            </button>
                          )}
                          {isPending && (
                            <>
                              {cancellable ? (
                                <button 
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-2"
                                >
                                  <FiX size={16} />
                                  Cancel Order
                                </button>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  Cancellation window expired
                                </span>
                              )}
                            </>
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