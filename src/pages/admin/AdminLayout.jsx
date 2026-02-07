import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers, FiLogOut, FiMenu, FiX,
  FiChevronRight, FiBell, FiSearch
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../../context/ShopContext';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/admin/product', icon: FiBox, label: 'Products' },
  { to: '/admin/order', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/user', icon: FiUsers, label: 'Users' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();

  const { logout, currentUser } = useShop();

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-32 w-80 h-80 bg-gradient-to-br from-green-100/20 to-emerald-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen || !isMobile ? 0 : -280,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed z-30 w-72 h-full bg-white border-r border-gray-200 shadow-xl md:relative md:flex-shrink-0"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/logo.png"
              alt="Jewelry Store Logo"
              className="h-11"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Admin Profile Card */}
        <div className="p-4 m-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#05B171] to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {currentUser?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {currentUser?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = isActiveRoute(to);
            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#05B171] to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon
                  className={`text-xl ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-[#05B171]'
                  } transition-colors`}
                />
                <span className="font-medium text-sm">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-3"
                  >
                    <FiChevronRight className="text-white" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <FiLogOut className="text-xl group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-[1]">
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm pb-[8px] pt-[6px]">
          <div className="flex items-center justify-between p-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <FiMenu className="text-xl" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {navItems.find(item => isActiveRoute(item.to))?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Manage your jewelry store</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-700 transition-colors">
                <FiBell className="text-xl" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-2 lg:p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
