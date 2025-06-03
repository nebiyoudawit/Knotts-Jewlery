import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers, FiSettings, FiLogOut, FiMenu, FiX,
  FiChevronRight
} from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/product', icon: FiBox, label: 'Products' },
  { to: '/admin/order', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/user', icon: FiUsers, label: 'Users' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useShop();

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 w-64 h-full bg-gradient-to-b from-[#05B171] to-[#048a5b] text-white transition-all duration-300 ease-in-out shadow-xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:relative md:translate-x-0 md:flex-shrink-0`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
          <h1 className="text-xl font-bold whitespace-nowrap transition-all duration-300">
            Admin Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white text-2xl hover:scale-110 transition-transform"
          >
            <FiX />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2 h-[calc(100%-8rem)] overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`group flex items-center justify-between space-x-3 py-3 px-4 rounded-lg transition-all duration-200
                ${location.pathname === to ? 'bg-white/10 shadow-md' : 'hover:bg-white/5 hover:shadow-sm'}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`text-xl ${location.pathname === to ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
                <span className="text-sm font-medium">{label}</span>
              </div>
              {location.pathname === to && (
                <FiChevronRight className="text-white animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full space-x-3 py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-200 group"
          >
            <FiLogOut className="text-xl text-white/80 group-hover:text-white" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 h-16 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 text-2xl hover:scale-110 transition-transform"
          >
            <FiMenu />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find(item => item.to === location.pathname)?.label || 'Admin'}
          </h2>
          <div className="w-6"></div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;