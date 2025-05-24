import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="text-center py-12">Loading order details...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <FaCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order #{order?._id} has been received.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <p className="mb-2"><strong>Order ID:</strong> {order?._id}</p>
            <p className="mb-2"><strong>Delivery Method:</strong> {order?.shippingAddress.includes('PICKUP:') ? 'Pickup' : 'Delivery'}</p>
            <p className="mb-2"><strong>Payment Method:</strong> {order?.paymentMethod}</p>
            <p className="mb-2"><strong>Total:</strong> {order?.total.toFixed(2)} ETB</p>
          </div>

          <Link
            to="/product"
            className="inline-flex items-center px-6 py-3 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b] transition-colors"
          >
            <FaShoppingBag className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;