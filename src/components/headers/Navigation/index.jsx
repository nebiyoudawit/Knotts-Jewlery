import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, Box, IconButton } from '@mui/material';
import { IoClose } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { 
  GiPrayerBeads, 
  GiButterfly,
  GiEarrings,
  GiRing,
  GiGemNecklace, 
} from "react-icons/gi";
import { motion } from 'framer-motion';

const Navigation = ({ mobileOpen, handleDrawerToggle, onCategorySelect }) => {
  const categories = [
    { 
      name: "Bracelets", 
      path: "bracelets", 
      icon: <GiPrayerBeads className="w-5 h-5" />,
      color: "text-blue-500"
    },
    { 
      name: "Charms", 
      path: "charms", 
      icon: <GiButterfly className="w-5 h-5" />,
      color: "text-rose-500"
    },
    { 
      name: "Earrings", 
      path: "earrings", 
      icon: <GiEarrings className="w-5 h-5" />,
      color: "text-amber-500"
    },
    { 
      name: "Rings", 
      path: "rings", 
      icon: <GiRing className="w-5 h-5" />,
      color: "text-purple-500"
    },
    { 
      name: "Necklaces", 
      path: "necklaces", 
      icon: <GiGemNecklace className="w-5 h-5" />,
      color: "text-emerald-500"
    }
  ];

  const handleClick = (category) => {
    onCategorySelect && onCategorySelect(category.name);
    if (mobileOpen) handleDrawerToggle();
  };

  return (
    <>
      {/* Desktop Navigation - Modernized */}
      <nav className='w-full border-b border-gray-100 hidden md:block bg-white/80 backdrop-blur-sm'>
        <div className="container">
          <div className='flex items-center justify-center gap-0'>
            {/* Home Link */}
            <Link 
              to="/" 
              className='group relative px-6 py-4 flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-all duration-200 font-medium'
            >
              <div className="relative">
                <FaHome className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute -inset-1 bg-emerald-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
              </div>
              <span className="relative">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-emerald-600 group-hover:w-full transition-all duration-200"></span>
              </span>
            </Link>

            {/* Categories with modern styling */}
            {categories.map((category) => (
              <Link 
                key={category.path}
                to={`/products/${category.path}`} 
                className='group relative px-6 py-4 flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-all duration-200 font-medium'
                onClick={() => handleClick(category)}
              >
                <div className="relative">
                  <div className={`transition-transform duration-200 group-hover:scale-110 ${category.color}`}>
                    {category.icon}
                  </div>
                  <div className="absolute -inset-1 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                </div>
                <span className="relative">
                  {category.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-emerald-600 group-hover:w-full transition-all duration-200"></span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer - Modernized */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 320,
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            backdropFilter: 'blur(10px)',
            borderLeft: '1px solid rgba(0,0,0,0.05)',
          },
        }}
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
        }}>
          {/* Header - Modern */}
          <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-white to-gray-50/50">
            <div className="flex justify-between items-center">
              <Link to="/" onClick={handleDrawerToggle}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <GiGemNecklace className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900 text-lg">Knotts</h1>
                    <p className="text-xs text-gray-500 font-medium">Jewelry</p>
                  </div>
                </div>
              </Link>
              <IconButton 
                onClick={handleDrawerToggle}
                sx={{
                  width: 40,
                  height: 40,
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  "&:hover": { 
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }
                }}
              >
                <IoClose size={20} className="text-gray-700" />
              </IconButton>
            </div>
          </div>
          
          {/* Navigation Links - Modern */}
          <div className="flex-1 overflow-y-auto p-6">
            <ul className='flex flex-col gap-1'>
              <motion.li 
                className='list-none'
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link 
                  to="/" 
                  onClick={handleDrawerToggle}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/80 transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-gray-200/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 flex items-center justify-center group-hover:from-emerald-500/20 group-hover:to-emerald-600/20 transition-all duration-200">
                    <FaHome className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold text-[15px]">
                      Home
                    </span>
                    <span className="text-xs text-gray-500">
                      Discover our collection
                    </span>
                  </div>
                </Link>
              </motion.li>
              
              <div className="mt-8 mb-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Categories
                  </p>
                </div>
              </div>

              {categories.map((category, index) => (
                <motion.li 
                  key={category.path} 
                  className='list-none'
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ transitionDelay: `${index * 30}ms` }}
                >
                  <Link 
                    to={`/products/${category.path}`} 
                    onClick={() => handleClick(category)}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/80 transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-gray-200/50"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color.replace('text', 'from')}/10 ${category.color.replace('text', 'to')}/20 flex items-center justify-center group-hover:scale-105 transition-all duration-200`}>
                      <div className={`${category.color} transition-colors duration-200`}>
                        {category.icon}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-semibold text-[15px] group-hover:text-emerald-700 transition-colors duration-200">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Explore collection
                      </span>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Footer - Modern */}
          <div className="p-6 border-t border-gray-100/50 bg-gradient-to-r from-white/50 to-transparent">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 p-5 border border-emerald-100/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
              </div>
              <p className="text-sm text-gray-800 font-semibold text-center">
                Handcrafted Excellence
              </p>
              <p className="text-xs text-gray-600 text-center mt-1 font-medium">
                Premium Jewelry Collections
              </p>
            </div>
          </div>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;