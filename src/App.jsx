import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/headers/index.jsx'
import Home from './pages/Home/index.jsx'
import ProductListing from './pages/ProductListing/index.jsx'
import ProductPage from './pages/ProductPage/index.jsx'
import NotFound from './pages/NotFound/index.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import ScrollToTop from './components/ScrollTop/index.jsx'
import { Toaster } from 'sonner';

const Login = lazy(() => import('./pages/login/index.jsx'))
const CartPage = lazy(() => import('./pages/CartPage/index.jsx'))
const WishlistPage = lazy(() => import('./pages/WishlistPage/index.jsx'))
const Register = lazy(() => import('./pages/Register/index.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage/index.jsx'))
const Profile = lazy(() => import('./pages/Profile/index.jsx'))
const UserOrders = lazy(() => import('./pages/UserOrders/index.jsx'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ProductManagment = lazy(() => import('./pages/admin/ProductManagment.jsx'))
const OrderManagment = lazy(() => import('./pages/admin/OrderManagment.jsx'))
const UserManagment = lazy(() => import('./pages/admin/UserMangment/index.jsx'))
const OrderConfirmation = lazy(() => import('./components/OrderConformation'))
const ContactUs = lazy(() => import('./pages/ContactUs/index.jsx'))
const AboutUs = lazy(() => import('./pages/AboutUs/index.jsx'))

// Pages outside the main shopping path load on demand, keeping the first download small.
const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#05B171] border-t-transparent" />
  </div>
);

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
      <Suspense fallback={<RouteFallback />}>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
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