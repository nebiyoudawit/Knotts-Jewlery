import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/headers/index.jsx'
import Home from './pages/Home/index.jsx'
import ProductListing from './pages/ProductListing/index.jsx'
import ProductPage from './pages/ProductPage/index.jsx'
import Login from './pages/login/index.jsx'
import CartPage from './pages/CartPage/index.jsx'
import WishlistPage from './pages/WishlistPage/index.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import ScrollToTop from './components/ScrollTop/index.jsx'
import Register from './pages/Register/index.jsx'
import { Toaster } from 'sonner';  // Only Sonner
import CheckoutPage from './pages/CheckoutPage/index.jsx'
import Profile from './pages/Profile/index.jsx'
import UserOrders from './pages/UserOrders/index.jsx'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProductManagment from './pages/admin/ProductManagment.jsx'
import OrderManagment from './pages/admin/OrderManagment.jsx'
import UserManagment from './pages/admin/UserManagment.jsx'
import OrderConfirmation from './components/OrderConformation'
import ContactUs from './pages/ContactUs/index.jsx'
import AboutUs from './pages/AboutUs/index.jsx'
import { useEffect } from 'react';

const AppRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const hideHeader = isAdmin || 
                    location.pathname === '/login' || 
                    location.pathname === '/register';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {!hideHeader && <Header />}
      <ScrollToTop />
      {/* REMOVED: Old ToastContainer */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" exact element={<Home />} />
        <Route path="/about" exact element={<AboutUs />} />
        <Route path="/contact" exact element={<ContactUs />} />
        <Route path="/product" exact element={<ProductListing />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:category" exact element={<ProductListing />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/login" exact element={<Login />} />
        <Route path="/checkout" exact element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/profile" exact element={<Profile />} />
        <Route path="/orders" exact element={<UserOrders />} />
        <Route path="/register" exact element={<Register />} />
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
        <Toaster 
          position="bottom-left"
          expand={true}
          richColors
          closeButton
          theme="light"
          duration={2000}
          toastOptions={{
            classNames: {
              toast: '!rounded-xl !border !border-gray-200 !shadow-xl',
              title: '!font-medium',
              description: '!text-gray-600',
              success: '!bg-gradient-to-r !from-emerald-50 !to-green-50 !border-emerald-200',
              error: '!bg-gradient-to-r !from-rose-50 !to-pink-50 !border-rose-200',
              info: '!bg-gradient-to-r !from-blue-50 !to-cyan-50 !border-blue-200',
              warning: '!bg-gradient-to-r !from-amber-50 !to-orange-50 !border-amber-200',
            },
          }}
        />
        <AppRoutes />
      </ShopProvider>
    </BrowserRouter>
  );
}

export default App;