import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiX,
  FiTruck,
  FiCreditCard,
} from "react-icons/fi";
import { useShop } from "../../context/ShopContext";
import { Helmet } from "react-helmet-async";

const apiUrl = import.meta.env.VITE_API_URL;

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);
  const [error, setError] = useState("");
  const { currentUser } = useShop();

  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info"); // "info" | "confirm"
  const [targetOrderId, setTargetOrderId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name,
        email: currentUser.email,
      });
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/user/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const confirmCancelOrder = (orderId) => {
    setTargetOrderId(orderId);
    setModalMessage("Are you sure you want to cancel this order?");
    setModalType("confirm");
    setShowModal(true);
  };

  const handleCancelConfirmed = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalMessage("No authentication token found");
      setModalType("info");
      return;
    }

    setCanceling(targetOrderId);
    try {
      const res = await fetch(`${apiUrl}/user/orders/${targetOrderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Cancellation failed");

      setOrders((prev) =>
        prev.map((order) =>
          order._id === targetOrderId
            ? { ...order, status: "cancelled" }
            : order
        )
      );

      setModalMessage("Order cancelled successfully.");
    } catch (err) {
      setModalMessage(err.message || "Error cancelling order");
    } finally {
      setModalType("info");
      setCanceling(null);
      setTargetOrderId(null);
      setShowModal(true);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FiCheckCircle className="text-[#05B171]" />;
      case "cancelled":
        return <FiXCircle className="text-red-500" />;
      case "pending":
        return <FiClock className="text-amber-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      default:
        return "pending";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      default:
        return status || "Pending";
    }
  };

  const canCancelOrder = (orderDate) => {
    const now = new Date();
    const placed = new Date(orderDate);
    const diffHours = (now - placed) / (1000 * 60 * 60);
    return diffHours < 24 && diffHours >= 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDeliveryDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Helmet>
        <title>Your Orders | Knott's Jewelry</title>
        <meta
          name="description"
          content="Track your past and current orders with Knott's Jewelry."
        />
        <link
          rel="canonical"
          href="https://knotts-jewlery-xjku.vercel.app/orders"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
            My Orders
          </h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
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
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-100"
                >
                  <FiUser />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-3 rounded-md bg-[#05B171] text-white"
                >
                  <FiShoppingBag />
                  <span>My Orders</span>
                </Link>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-[#05B171]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span className="ml-3 text-gray-600 text-sm">
                    Fetching your orders...
                  </span>
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiShoppingBag className="text-gray-400 text-3xl" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">No orders yet</h2>
                  <p className="text-gray-600 mb-6">
                    You haven't placed any orders yet
                  </p>
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
                    const isPending = order.status === "pending";
                    const cancellable =
                      isPending && canCancelOrder(order.createdAt);

                    return (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(order.status)}
                            <span className="text-sm font-medium">
                              {getStatusText(order.status)}
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-sm text-gray-600">
                              Order #{order._id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiCalendar className="text-gray-400" />
                            <span>
                              Ordered on {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <FiTruck className="text-gray-500 mt-1" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                Shipping Address
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.shippingAddress || "Not specified"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <FiCreditCard className="text-gray-500 mt-1" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                Payment
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-gray-600">
                                  {order.paymentMethod || "Not specified"}
                                </span>
                                <span className="text-sm px-2 py-1 rounded bg-gray-100">
                                  {getPaymentStatusText(order.paymentStatus)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-200">
                          {order.items.map((item, i) => {
                            const name = item.name || "Unnamed product";
                            const image = item.image || "/placeholder.png";
                            const price =
                              typeof item.price === "number" ? item.price : 0;
                            const qty = item.qty || 0;

                            return (
                              <div
                                key={i}
                                className="p-4 flex items-start gap-4"
                              >
                                <img
                                  src={image}
                                  alt={name}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <div className="flex-1">
                                  <h3 className="font-medium">{name}</h3>
                                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                                    <span>
                                      {qty} × {price.toFixed(2)} birr
                                    </span>
                                    <span>{(qty * price).toFixed(2)} birr</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between gap-3 items-center">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">
                              {order.items.length} items
                            </span>
                            {order.deliveryDate && (
                              <span className="text-xs text-gray-500">
                                Expected delivery:{" "}
                                {formatDeliveryDate(order.deliveryDate)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              Total: {order.totalPrice?.toFixed(2) || "0.00"}{" "}
                              birr
                            </span>
                            {isPending && cancellable ? (
                              <button
                                onClick={() => confirmCancelOrder(order._id)}
                                disabled={canceling === order._id}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center gap-2"
                              >
                                <FiX size={16} />
                                {canceling === order._id
                                  ? "Cancelling..."
                                  : "Cancel Order"}
                              </button>
                            ) : (
                              isPending && (
                                <span className="text-sm text-gray-500">
                                  Cancellation window expired
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        {isPending && cancellable && (
                          <div className="bg-amber-50 p-3 text-sm text-amber-700 border-t border-amber-200">
                            You can cancel this order within 24 hours of placing
                            it
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

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
          >
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-md text-center">
              <p className="text-gray-800 mb-4">{modalMessage}</p>
              <div className="flex justify-center gap-4">
                {modalType === "confirm" ? (
                  <>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        handleCancelConfirmed();
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Yes, Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setTargetOrderId(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-[#05B171] text-white rounded hover:bg-[#048a5b]"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserOrders;
