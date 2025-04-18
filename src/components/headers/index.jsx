// src/components/Header/index.jsx
import React, { useState } from 'react';
import { 
  Badge, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Divider,
  Typography,
  Avatar,
  Box,
  ListItemIcon, 
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { IoCartOutline, IoMenu, IoHomeOutline, IoSearchOutline } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FiUser, FiLogIn, FiUserPlus, FiLogOut, FiShoppingBag } from "react-icons/fi";
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import Search from '../Search';
import { useShop } from '../../context/ShopContext';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 5,
    border: `2px solid ${(theme.vars || theme).palette.background.paper}`,
    padding: '0 4px',
  },
}));

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [desktopAnchorEl, setDesktopAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  
  const { 
    cartCount = 0, 
    wishlistCount = 0, 
    wishlist = [],
    currentUser,
    logout
  } = useShop();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopMenuOpen = (event) => {
    setDesktopAnchorEl(event.currentTarget);
  };

  const handleDesktopMenuClose = () => {
    setDesktopAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  // Account menu component to avoid duplication
  const AccountMenu = ({ anchorEl, onClose, isMobile = false }) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: isMobile ? 'top' : 'bottom',
        horizontal: isMobile ? 'center' : 'right',
      }}
      transformOrigin={{
        vertical: isMobile ? 'bottom' : 'top',
        horizontal: isMobile ? 'center' : 'right',
      }}
      PaperProps={{
        style: {
          width: '200px',
        },
      }}
    >
      {currentUser ? (
        <>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {currentUser.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentUser.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem component={Link} to="/account" onClick={onClose}>
            <ListItemIcon><FiUser size={18} /></ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem component={Link} to="/orders" onClick={onClose}>
            <ListItemIcon><FiShoppingBag size={18} /></ListItemIcon>
            <ListItemText>My Orders</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { logout(); onClose(); }}>
            <ListItemIcon><FiLogOut size={18} /></ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem component={Link} to="/login" onClick={onClose}>
            <ListItemIcon><FiLogIn size={18} /></ListItemIcon>
            <ListItemText>Login</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem component={Link} to="/register" onClick={onClose}>
            <ListItemIcon><FiUserPlus size={18} /></ListItemIcon>
            <ListItemText>Register</ListItemText>
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top strip - hidden on mobile */}
      <div className="top-strip py-2 border-t-[1px] border-gray-250 border-b-[1px] hidden md:block bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="col1 w-[50%]">
              <p className="text-[14px]">Free delivery at summit, 4 kilo, megenagna, figa,gerji (Unity University)🚛📦</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
                <div className="header border-b border-opacity-20 border-gray-300 bg-white">
                  <div className="container">
                    {/* Mobile Top Row */}
                    <div className="flex items-center justify-between py-3 md:hidden">
                        <div className="w-1/4 flex justify-start">
                          <IconButton onClick={handleDrawerToggle}>
                            <IoMenu size={25} />
                          </IconButton>
                        </div>

                      <div className="flex justify-center">
                        {showMobileSearch ? (
                          <div className="w-full max-w-[700px]">
                            <Search />
                          </div>
                        ) : (
                          <Link to={"/"}>
                            <img src="/logo.png" alt="Logo" className="h-10" />
                          </Link>
                        )}
                      </div>

                      <div className="w-1/4 flex justify-end">
                        <IconButton 
                          aria-label="search"
                          onClick={() => setShowMobileSearch(prev => !prev)}
                        >
                          <IoSearchOutline size={22} />
                        </IconButton>
                      </div>
          </div>
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between py-3">
            <div className="col1 w-[25%]">
              <Link to={"/"}><img src="/logo.png" alt="Logo" className="h-10" /></Link>
            </div>
            <div className="col2 w-[45%] px-4">
              <Search />
            </div>
            <div className="col3 w-[30%] flex items-center pl-7">
              <ul className='flex items-center justify-end gap-3 w-full'>
                {currentUser ? (
                  <li className='flex items-center gap-2'>
                    <IconButton onClick={handleDesktopMenuOpen}>
                      <Avatar sx={{ width: 30, height: 30 }} src={currentUser.avatar}>
                        {currentUser.name.charAt(0)}
                      </Avatar>
                    </IconButton>
                    <Typography variant="body2" className="hidden sm:block">
                      {currentUser.name.split(' ')[0]}
                    </Typography>
                  </li>
                ) : (
                  <li className='flex items-center gap-2'>
                    <FiUser size={25} className="text-gray-600" />
                    <div className='flex gap-1'>
                      <Link to="/login" className="link transition flex items-center gap-1">
                        <FiLogIn size={19} /> Login
                      </Link>
                      <span>|</span>
                      <Link to="/register" className="link transition">
                        Register
                      </Link>
                    </div>
                  </li>
                )}
                <li>
                  <Link to="/wishlist">
                    <Tooltip title="Wishlist" arrow placement="top">
                      <IconButton aria-label="heart">
                        <StyledBadge badgeContent={wishlistCount} color="secondary">
                          {wishlist.length > 0 ? (
                            <FaHeart className="text-pink-500" size={22} />
                          ) : (
                            <FaRegHeart size={22} />
                          )}
                        </StyledBadge>
                      </IconButton>
                    </Tooltip>
                  </Link>
                </li>
                <li>
                  <Link to="/cart">
                    <Tooltip title="Cart" arrow placement="top">
                      <IconButton aria-label="cart">
                        <StyledBadge badgeContent={cartCount} color="secondary">
                          <IoCartOutline size={30} />
                        </StyledBadge>
                      </IconButton>
                    </Tooltip>
                  </Link>
                </li>
              </ul>
              <AccountMenu 
                anchorEl={desktopAnchorEl} 
                onClose={handleDesktopMenuClose}
              />
            </div>
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 border-t bg-white border-gray-200 z-1050 md:hidden shadow-lg">
            <Link to="/" className="flex flex-col items-center">
              <IconButton aria-label="home">
                <IoHomeOutline size={22} />
              </IconButton>
              <span className="text-xs">Home</span>
            </Link>
            
           
              <Link to="/cart" className='flex flex-col items-center'>
                <Tooltip title="Cart" arrow placement="top">
                  <IconButton aria-label="cart">
                    <StyledBadge badgeContent={cartCount} color="secondary">
                      <IoCartOutline size={25} />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>
                <span className="text-xs">Cart</span>
              </Link>
            
            
            <Link to="/wishlist" className="flex flex-col items-center">
              <Tooltip title="Wishlist" arrow placement="top">
                <IconButton aria-label="wishlist">
                  <StyledBadge badgeContent={wishlistCount} color="secondary">
                    {wishlist.length > 0 ? (
                      <FaHeart className="text-pink-500" size={20} />
                    ) : (
                      <FaRegHeart size={20} />
                    )}
                  </StyledBadge>
                </IconButton>
              </Tooltip>
              <span className="text-xs">Wishlist</span>
            </Link>
            
            <div className="flex flex-col items-center">
              <IconButton 
                aria-label="account"
                onClick={handleMobileMenuOpen}
              >
                {currentUser ? (
                  <Avatar sx={{ width: 24, height: 24 }} src={currentUser.avatar}>
                    {currentUser.name.charAt(0)}
                  </Avatar>
                ) : (
                  <FiUser size={20} />
                )}
              </IconButton>
              <span className="text-xs">Account</span>
              <AccountMenu 
                anchorEl={mobileAnchorEl} 
                onClose={handleMobileMenuClose}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      </div>

      <Navigation mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
    </header>
  );
};

export default Header;