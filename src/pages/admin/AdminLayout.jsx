import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers, FiLogOut, FiMenu, FiX,
  FiExternalLink, FiChevronDown, FiChevronRight,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../../context/ShopContext';
import useSeo from '../../hooks/useSeo';
import { privateSeo } from '../../seo/pages';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/order', icon: FiShoppingBag, label: 'Orders', badge: 'pending' },
  { to: '/admin/product', icon: FiBox, label: 'Products' },
  { to: '/admin/user', icon: FiUsers, label: 'Users' },
];

const isActiveRoute = (pathname, path) =>
  path === '/admin' ? pathname === '/admin' : pathname.startsWith(path);

const Initial = ({ name, className = '' }) => (
  <span className={`flex items-center justify-center rounded-full bg-[#05B171] text-white font-semibold shrink-0 ${className}`}>
    {name?.[0]?.toUpperCase() || 'A'}
  </span>
);

const AdminLayout = () => {
  useSeo(privateSeo("Admin"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useShop();

  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Orders waiting to be fulfilled, shown next to "Orders"
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((orders) => setPendingCount((orders || []).filter((o) => o.status === 'pending').length))
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!document.getElementById('admin-account')?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const current = navItems.find((item) => isActiveRoute(location.pathname, item.to)) || navItems[0];

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen || !isMobile ? 0 : -272 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed z-30 w-64 h-full flex flex-col bg-[#0F1D18] text-[#A9BCB3] md:relative md:shrink-0"
      >
        <div className="flex items-center justify-between h-16 px-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img src="/icons1.png" alt="" className="w-8 h-8 object-contain" />
            <span className="text-white font-bold text-lg tracking-tight">Knotts</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6FE3B4] bg-[#05B171]/15 px-1.5 py-0.5 rounded">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="md:hidden p-1.5 -mr-1.5 text-[#A9BCB3] hover:text-white">
            <FiX className="text-lg" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-4">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#5F7469]">Manage</p>
          <ul className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label, badge }) => {
              const active = isActiveRoute(location.pathname, to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-white/[0.08] text-white' : 'hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#05B171]" />}
                    <Icon className={`text-[18px] ${active ? 'text-[#34D399]' : ''}`} />
                    <span className="flex-1">{label}</span>
                    {badge === 'pending' && pendingCount > 0 && (
                      <span className="min-w-[22px] h-5 px-1.5 rounded-full bg-[#05B171] text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="px-3 mt-7 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#5F7469]">Store</p>
          <Link to="/" className="flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium hover:bg-white/[0.04] hover:text-white transition-colors">
            <FiExternalLink className="text-[18px]" />
            View store
          </Link>
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2">
            <Initial name={currentUser?.name} className="w-9 h-9 text-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser?.name || 'Admin'}</p>
              <p className="text-xs truncate">{currentUser?.email || 'Administrator'}</p>
            </div>
            <button onClick={handleLogout} aria-label="Log out" title="Log out" className="p-2 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors">
              <FiLogOut />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 shrink-0 flex items-center justify-between gap-4 px-4 lg:px-8 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <FiMenu className="text-xl" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
              <Link to="/admin" className="hidden sm:block text-gray-500 hover:text-gray-800">Admin</Link>
              <FiChevronRight className="hidden sm:block text-gray-300 shrink-0" />
              <span className="font-semibold text-gray-900 truncate">{current.label}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden lg:block text-sm text-gray-500 mr-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiExternalLink className="text-gray-500" />
              View store
            </Link>
            <div className="relative" id="admin-account">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-gray-100"
              >
                <Initial name={currentUser?.name} className="w-7 h-7 text-xs" />
                <span className="hidden md:block text-sm font-medium text-gray-800 max-w-[140px] truncate">
                  {currentUser?.name?.split(' ')[0] || 'Admin'}
                </span>
                <FiChevronDown className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link to="/" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                        <FiExternalLink className="text-gray-400" /> View store
                      </Link>
                      <button onClick={handleLogout} role="menuitem" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                        <FiLogOut /> Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

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
