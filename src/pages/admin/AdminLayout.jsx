import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers, FiSettings, FiLogOut, FiMenu, FiX,
} from 'react-icons/fi';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/product', icon: FiBox, label: 'Products' },
  { to: '/admin/order', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/user', icon: FiUsers, label: 'Users' },
];
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 w-64 h-full bg-[#05B171] text-white transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:relative md:translate-x-0 md:flex-shrink-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#048a5b] h-16">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white text-2xl"
          >
            <FiX />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-1 h-[calc(100%-8rem)] overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors
                ${location.pathname === to ? 'bg-[#048a5b]' : 'hover:bg-[#04965f]'}`}
            >
              <Icon className="text-xl" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#048a5b] h-16">
          
          <button className="flex items-center w-full space-x-3 py-2 px-4 rounded-lg hover:bg-[#04965f] transition-colors">
            <FiLogOut className="text-xl" />
            <span className="text-sm font-medium">Logout</span>
          </button>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 text-2xl"
          >
            <FiMenu />
          </button>
          <h2 className="text-lg font-semibold">
            {navItems.find(item => item.to === location.pathname)?.label || 'Admin'}
          </h2>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;