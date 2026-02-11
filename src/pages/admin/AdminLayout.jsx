import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers, FiLogOut, FiMenu, FiX,
  FiChevronRight, FiBell, FiSearch, FiArrowUp, FiArrowDown, FiHome,
  FiUser, FiSettings, FiActivity
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { logout, currentUser } = useShop();

  // Mock recent activities for notifications - matching your exact design
  const recentActivities = [
    {
      id: 1,
      type: 'order',
      title: 'New Order #1234',
      description: 'Gold Diamond Ring - $2,499',
      date: new Date(2024, 0, 15, 14, 30),
      read: false
    },
    {
      id: 2,
      type: 'user',
      title: 'New User Registered',
      description: 'John Doe created an account',
      date: new Date(2024, 0, 15, 10, 15),
      read: false
    },
    {
      id: 3,
      type: 'order',
      title: 'Order Shipped #1235',
      description: 'Silver Pendant Necklace',
      date: new Date(2024, 0, 14, 16, 45),
      read: true
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Delivered #1230',
      description: 'Pearl Earrings Set',
      date: new Date(2024, 0, 14, 9, 20),
      read: true
    },
    {
      id: 5,
      type: 'user',
      title: 'New User Registered',
      description: 'Jane Smith created an account',
      date: new Date(2024, 0, 13, 11, 0),
      read: false
    }
  ];

  const unreadCount = recentActivities.filter(a => !a.read).length;

  // Close menus when route changes
  useEffect(() => {
    setSidebarOpen(false);
    setShowProfileMenu(false);
    setShowNotifications(false);
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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu || showNotifications) {
        const profileMenu = document.getElementById('profile-menu');
        const notificationsPanel = document.getElementById('notifications-panel');
        const profileButton = document.getElementById('profile-button');
        const notificationsButton = document.getElementById('notifications-button');
        
        if (profileMenu && !profileMenu.contains(e.target) && 
            profileButton && !profileButton.contains(e.target)) {
          setShowProfileMenu(false);
        }
        
        if (notificationsPanel && !notificationsPanel.contains(e.target) && 
            notificationsButton && !notificationsButton.contains(e.target)) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showNotifications]);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter current page
      console.log('Searching for:', searchQuery);
      // You can implement global search logic here
    }
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
        <div className="flex items-center p-6 border-b border-gray-200">
          <div className="flex items-center m-auto">
            <img src="/icons1.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
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
        <header className="relative bg-white border-b border-gray-100 shadow-sm lg:p-[5px]">
          {/* Gradient decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-transparent to-teal-50/50 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 p-4 lg:px-8">
              {/* Left Section */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform"
                >
                  <FiMenu className="text-xl" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {navItems.find(item => isActiveRoute(item.to))?.label || 'Dashboard'}
                    </h2>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-700">Live</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Right Section - Action Bar */}
              <div className="flex items-center gap-3">

                {/* Admin Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    id="profile-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-[#05B171] to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-sm">
                      {currentUser?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {currentUser?.name || 'Admin'}
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold">Administrator</p>
                    </div>
                    <FiChevronRight className={`hidden xl:block text-gray-400 transition-transform duration-200 ${
                      showProfileMenu ? 'rotate-90' : ''
                    }`} />
                  </motion.button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        id="profile-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#05B171] to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                              {currentUser?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">
                                {currentUser?.name || 'Admin User'}
                              </p>
                              <p className="text-xs text-emerald-700 font-medium">
                                {currentUser?.email || 'admin@jewelrystore.com'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            to="/"
                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-emerald-50 rounded-xl transition-all group"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
                              <FiHome className="text-gray-600 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <div>
                              <p className="font-medium">Main Website</p>
                              <p className="text-xs text-gray-500">Go back to store</p>
                            </div>
                          </Link>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Logout Button */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                          >
                            <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                              <FiLogOut className="text-red-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                              <p className="font-medium">Logout</p>
                              <p className="text-xs text-gray-500">Sign out of admin panel</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;