import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/headers/index.jsx'
import Home from './pages/Home/index.jsx'
import ProductListing from './pages/ProductListing/index.jsx'
import ProductPage from './pages/ProductPage/index.jsx'
import Login from './pages/login/index.jsx'
import SellerDashboard from './pages/Seller/index.jsx'
import CartPage from './pages/CartPage/index.jsx'
import WishlistPage from './pages/WishlistPage/index.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import ScrollToTop from './components/ScrollTop/index.jsx'
import Register from './pages/Register/index.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CheckoutPage from './pages/CheckoutPage/index.jsx'
import Profile from './pages/Profile/index.jsx'
import UserOrders from './pages/UserOrders/index.jsx'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProductManagment from './pages/admin/ProductManagment.jsx'
import OrderManagment from './pages/admin/OrderManagment.jsx'
import UserManagment from './pages/admin/UserManagment.jsx'

import { useEffect } from 'react';

// 👇 Move Routes into a child component so we can use `useLocation`
const AppRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {!isAdmin && <Header />}
      <ScrollToTop />
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" exact element={<Home />} />
        <Route path="/product" exact element={<ProductListing />} />
        <Route path="/products/:category" exact element={<ProductListing />} />
        <Route path="/product/:id" exact element={<ProductPage />} />
        <Route path="/login" exact element={<Login />} />
        <Route path="/checkout" exact element={<CheckoutPage />} />
        <Route path="/profile" exact element={<Profile />} />
        <Route path="/orders" exact element={<UserOrders />} />
        <Route path="/register" exact element={<Register />} />
        <Route path="/seller" exact element={<SellerDashboard />} />
        <Route path="/cart" exact element={<CartPage />} />
        <Route path="/wishlist" exact element={<WishlistPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="product" element={<ProductManagment />} />
          <Route path="order" element={<OrderManagment />} />
          <Route path="user" element={<UserManagment />} />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <AppRoutes />
      </ShopProvider>
    </BrowserRouter>
  );
}

export default App;
