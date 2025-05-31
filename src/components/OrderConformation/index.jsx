import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaExclamationTriangle } from 'react-icons/fa';

const apiUrl = import.meta.env.VITE_API_URL;

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${apiUrl}/orders/${orderId}`, {
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
          {order?.paymentStatus === 'Paid' ? (
            <>
              <FaCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your order #{order?._id} has been confirmed.
              </p>
            </>
          ) : order?.paymentStatus === 'Failed' ? (
            <>
              <FaExclamationTriangle className="mx-auto text-6xl text-yellow-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Processing</h1>
              <p className="text-gray-600 mb-6">
                There was an issue with your payment for order #{order?._id}. 
                Please check your email or contact support.
              </p>
            </>
          ) : (
            <>
              <FaCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Received!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order #{order?._id}. {order?.paymentMethod === 'Pay on Delivery' ? 
                'Please prepare the exact amount for delivery.' : 'Your payment is being processed.'}
              </p>
            </>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <p className="mb-2"><strong>Order ID:</strong> {order?._id}</p>
            <p className="mb-2"><strong>Delivery To:</strong> {order?.shippingAddress}</p>
            <p className="mb-2"><strong>Payment Method:</strong> {order?.paymentMethod}</p>
            <p className="mb-2"><strong>Payment Status:</strong> 
              <span className={`ml-1 ${
                order?.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order?.paymentStatus}
              </span>
            </p>
            <p className="mb-2"><strong>Order Status:</strong> {order?.status}</p>
            <p className="mb-2"><strong>Total:</strong> {order?.total?.toFixed(2)} ETB</p>
            {order?.deliveryDate && (
              <p className="mb-2">
                <strong>Estimated Delivery:</strong> {new Date(order.deliveryDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-[#05B171] text-white rounded-md hover:bg-[#048a5b] transition-colors"
            >
              <FaShoppingBag className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;