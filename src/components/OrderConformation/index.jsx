import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCheck,
  FiAlertTriangle,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiPrinter,
  FiShoppingBag,
  FiPackage,
  FiXCircle,
} from 'react-icons/fi';
import useSeo from '../../hooks/useSeo';
import { privateSeo } from '../../seo/pages';
import { useShop } from '../../context/ShopContext';
import { PHONES } from '../../seo/site';

const apiUrl = import.meta.env.VITE_API_URL;
const BASE_URL = (apiUrl || '').replace('/api', '');

const formatBirr = (value = 0) =>
  `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;

const imageUrl = (image) => {
  if (!image) return '/default-product.jpg';
  if (image.startsWith('http')) return image;
  return `${BASE_URL}${image}`;
};

// Paper-receipt torn edge along the bottom of the card
const zigzag = {
  backgroundImage:
    'linear-gradient(135deg, #fff 33.33%, transparent 33.33%), linear-gradient(225deg, #fff 33.33%, transparent 33.33%)',
  backgroundSize: '16px 16px',
  backgroundPosition: 'top left',
};

const Row = ({ label, value, strong }) => (
  <div className="flex items-center justify-between">
    <span className={strong ? 'text-base font-semibold text-gray-900' : 'text-sm text-gray-500'}>{label}</span>
    <span className={strong ? 'text-lg font-bold text-gray-900' : 'text-sm font-medium text-gray-800'}>{value}</span>
  </div>
);

const OrderConfirmation = () => {
  useSeo(privateSeo("Order Confirmed"));
  const { orderId } = useParams();
  const { currentUser } = useShop();
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
          throw new Error('We couldn\'t load this order');
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#05B171] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading your receipt…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-500 text-sm mb-6">{error || 'This order does not exist.'}</p>
          <Link
            to="/orders"
            className="inline-flex px-6 py-3 bg-[#05B171] text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            Go to my orders
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const deliveryFee = Math.max(0, (order.total || 0) - subtotal);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isPickup = order.shippingAddress?.startsWith('PICKUP:');
  const address = isPickup ? order.shippingAddress.replace('PICKUP:', '').trim() : order.shippingAddress;
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const isPaid = order.paymentStatus === 'Paid';
  const placedAt = new Date(order.createdAt);
  const firstName = currentUser?.name?.split(' ')[0];

  const steps = [
    { label: 'Placed', done: true },
    { label: isPickup ? 'Ready for pickup' : 'On the way', done: isDelivered },
    { label: isPickup ? 'Picked up' : 'Delivered', done: isDelivered },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-gray-50 to-gray-50 px-4 pt-8 pb-28 md:pb-16 print:bg-white print:p-0">
      <div className="mx-auto w-full max-w-lg">
        {/* Hero */}
        <div className="text-center mb-6 print:hidden">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg ${
              isCancelled ? 'bg-red-500 shadow-red-500/30' : 'bg-[#05B171] shadow-emerald-500/30'
            }`}
          >
            {isCancelled ? <FiXCircle className="w-8 h-8 text-white" /> : <FiCheck className="w-8 h-8 text-white" strokeWidth={3} />}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isCancelled ? 'Order cancelled' : `Thank you${firstName ? `, ${firstName}` : ''}!`}
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm md:text-base">
              {isCancelled
                ? 'This order was cancelled and will not be delivered.'
                : isPickup
                ? 'Your order is placed. We will let you know when it is ready to collect.'
                : 'Your order is placed. We will call you before we deliver.'}
            </p>
          </motion.div>
        </div>

        {/* Receipt */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="relative drop-shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
        >
          <div className="bg-white rounded-t-2xl">
            {/* Receipt header */}
            <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-4">
              <div>
                <img src="/logo.png" alt="Knotts Jewelry" className="h-8 mb-3" />
                <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase">Receipt</p>
                <p className="font-mono text-base font-bold text-gray-900 mt-0.5">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {placedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {placedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Progress */}
            {!isCancelled && (
              <div className="px-6 pb-5">
                <div className="flex items-center">
                  {steps.map((step, i) => (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-col items-center gap-1.5 w-20 shrink-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step.done ? 'bg-[#05B171] text-white' : i === 1 ? 'bg-emerald-50 text-[#05B171] ring-2 ring-[#05B171]' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {step.done ? <FiCheck className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                        </div>
                        <span className={`text-[11px] text-center leading-tight ${step.done || i === 1 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 -mt-5 rounded ${steps[i + 1].done ? 'bg-[#05B171]' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <div className="mx-6 border-t border-dashed border-gray-200" />

            {/* Items */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
              <ul className="space-y-4">
                {items.map((item, i) => (
                  <li key={item.product?._id || i} className="flex items-center gap-3">
                    <img
                      src={imageUrl(item.product?.image)}
                      alt={item.product?.name || 'Product'}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-100 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-product.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.product?.name || 'Removed product'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.quantity} × {formatBirr(item.product?.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatBirr((item.product?.price || 0) * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-6 border-t border-dashed border-gray-200" />

            {/* Totals */}
            <div className="px-6 py-5 space-y-2.5">
              <Row label="Subtotal" value={formatBirr(subtotal)} />
              <Row
                label={isPickup ? 'Pickup' : 'Delivery'}
                value={deliveryFee > 0 ? formatBirr(deliveryFee) : <span className="text-[#05B171]">Free</span>}
              />
              <div className="pt-2.5 mt-1 border-t border-gray-100">
                <Row label="Total" value={formatBirr(order.total)} strong />
              </div>
            </div>

            <div className="mx-6 border-t border-dashed border-gray-200" />

            {/* Details */}
            <div className="px-6 py-5 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <FiMapPin className="w-4 h-4 text-[#05B171]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{isPickup ? 'Pickup point' : 'Deliver to'}</p>
                  <p className="text-sm font-medium text-gray-800 break-words">{address}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <FiCreditCard className="w-4 h-4 text-[#05B171]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Payment</p>
                  <p className="text-sm font-medium text-gray-800">{order.paymentMethod}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                      isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isPaid ? 'Paid' : 'Due on arrival'}
                  </span>
                </div>
              </div>
              {order.deliveryDate && !isCancelled && (
                <div className="flex gap-3 sm:col-span-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <FiTruck className="w-4 h-4 text-[#05B171]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{isDelivered ? 'Delivered' : 'Estimated arrival'}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(order.deliveryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="px-6 pb-6 text-center text-xs text-gray-400">
              Questions about your order? Call{' '}
              {PHONES.map((p, i) => (
                <span key={p.tel}>
                  {i > 0 && ' or '}
                  <a href={`tel:${p.tel}`} className="text-gray-600 font-medium">{p.display}</a>
                </span>
              ))}
            </p>
          </div>
          <div className="h-4 w-full rotate-180" style={zigzag} />
        </motion.section>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-3 print:hidden"
        >
          <Link
            to="/products"
            className="col-span-2 py-3.5 bg-[#05B171] text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
          >
            <FiShoppingBag className="w-4 h-4" />
            Continue shopping
          </Link>
          <Link
            to="/orders"
            className="py-3 bg-white border border-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiPackage className="w-4 h-4" />
            My orders
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="py-3 bg-white border border-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiPrinter className="w-4 h-4" />
            Print receipt
          </button>
        </motion.div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
