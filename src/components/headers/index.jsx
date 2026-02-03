import React, { useState } from "react";
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
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  IoCartOutline,
  IoMenu,
  IoBagOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import {
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiShoppingBag,
  FiPackage,
  FiSettings,
  FiShield,
  FiChevronRight
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import Navigation from "./Navigation";
import Search from "../Search";
import { useShop } from "../../context/ShopContext";
import { Truck } from "lucide-react";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 5,
    border: `2px solid ${(theme.vars || theme).palette.background.paper}`,
    padding: "0 4px",
    backgroundColor: "#05B171",
    color: "white",
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
    logout,
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

  // Updated AccountMenu component
  const AccountMenu = ({ anchorEl, onClose, isMobile = false }) => {
    const menuVariants = {
      hidden: { opacity: 0, y: -10, scale: 0.95 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      },
      exit: { opacity: 0, y: -10, scale: 0.95 }
    };

    const itemVariants = {
      hover: { 
        x: 4,
        transition: { type: "spring", stiffness: 400 }
      }
    };

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{
          vertical: isMobile ? "top" : "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
        transformOrigin={{
          vertical: isMobile ? "bottom" : "top",
          horizontal: isMobile ? "center" : "right",
        }}
        PaperProps={{
          style: {
            width: isMobile ? "280px" : "260px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)",
            marginTop: isMobile ? 16 : 8,
            border: "1px solid rgba(0,0,0,0.05)",
            overflow: "hidden",
            background: "white",
          },
        }}
        MenuListProps={{
          sx: { padding: 0 }
        }}
      >
        {currentUser ? (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
          >
            {/* User Info Header */}
            <Box 
              sx={{ 
                p: 2.5, 
                background: "linear-gradient(135deg, #05B171 0%, #048a5b 100%)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <Box 
                sx={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)"
                }}
              />
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)"
                    }}
                  >
                    <FiUser size={20} color="white" />
                  </Box>
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="600" 
                      sx={{ 
                        color: "white",
                        fontSize: "0.95rem"
                      }}
                    >
                      {currentUser.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: "rgba(255,255,255,0.85)",
                        display: "block",
                        maxWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {currentUser.email}
                    </Typography>
                  </Box>
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5
                  }}
                >
                  <FiShield size={12} />
                  {currentUser.role === "admin" ? "Administrator" : "Member"}
                </Typography>
              </Box>
            </Box>

            {/* Menu Items */}
            <Box sx={{ p: 1 }}>
              <MenuItem 
                component={Link} 
                to="/profile" 
                onClick={onClose}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderRadius: "10px",
                  my: 0.5,
                  "&:hover": { 
                    background: "linear-gradient(90deg, rgba(5, 177, 113, 0.1) 0%, rgba(4, 138, 91, 0.05) 100%)"
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FiUser size={18} color="#05B171" />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile" 
                  primaryTypographyProps={{ 
                    fontWeight: 500,
                    fontSize: "0.9rem"
                  }}
                />
                <FiChevronRight size={16} color="#9ca3af" />
              </MenuItem>

              <MenuItem 
                component={Link} 
                to="/orders" 
                onClick={onClose}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderRadius: "10px",
                  my: 0.5,
                  "&:hover": { 
                    background: "linear-gradient(90deg, rgba(5, 177, 113, 0.1) 0%, rgba(4, 138, 91, 0.05) 100%)"
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FiPackage size={18} color="#05B171" />
                </ListItemIcon>
                <ListItemText 
                  primary="My Orders" 
                  primaryTypographyProps={{ 
                    fontWeight: 500,
                    fontSize: "0.9rem"
                  }}
                />
                <FiChevronRight size={16} color="#9ca3af" />
              </MenuItem>

              {currentUser?.role === "admin" && (
                <>
                  <Divider sx={{ my: 1, borderColor: "rgba(0,0,0,0.05)" }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      px: 2, 
                      py: 1, 
                      color: "#6b7280",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    Admin Panel
                  </Typography>
                  <MenuItem 
                    component={Link} 
                    to="/admin" 
                    onClick={onClose}
                    sx={{ 
                      py: 1.5, 
                      px: 2,
                      borderRadius: "10px",
                      my: 0.5,
                      "&:hover": { 
                        background: "linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)"
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FiShield size={18} color="#ef4444" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Admin Dashboard" 
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        fontSize: "0.9rem"
                      }}
                    />
                    <Box sx={{ 
                      px: 1, 
                      py: 0.25, 
                      background: "#ef4444", 
                      borderRadius: "6px" 
                    }}>
                      <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
                        NEW
                      </Typography>
                    </Box>
                  </MenuItem>
                </>
              )}
            </Box>

            <Divider sx={{ borderColor: "rgba(0,0,0,0.05)" }} />

            {/* Logout */}
            <Box sx={{ p: 1 }}>
              <MenuItem 
                onClick={() => {
                  logout();
                  onClose();
                }}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderRadius: "10px",
                  my: 0.5,
                  "&:hover": { 
                    background: "linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)"
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FiLogOut size={18} color="#ef4444" />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  primaryTypographyProps={{ 
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    color: "#ef4444"
                  }}
                />
              </MenuItem>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
          >
            <Box sx={{ p: 2.5, textAlign: "center" }}>
              <Box 
                sx={{ 
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #05B171 0%, #048a5b 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px"
                }}
              >
                <FiUser size={28} color="white" />
              </Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Welcome!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sign in to access your account
              </Typography>
            </Box>

            <Box sx={{ p: 1 }}>
              <MenuItem 
                component={Link} 
                to="/login" 
                onClick={onClose}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderRadius: "10px",
                  my: 0.5,
                  background: "linear-gradient(135deg, #05B171 0%, #048a5b 100%)",
                  color: "white",
                  "&:hover": { 
                    opacity: 0.9
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FiLogIn size={18} color="white" />
                </ListItemIcon>
                <ListItemText 
                  primary="Sign In" 
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    fontSize: "0.9rem"
                  }}
                />
              </MenuItem>

              <MenuItem 
                component={Link} 
                to="/register" 
                onClick={onClose}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderRadius: "10px",
                  my: 0.5,
                  border: "2px solid #05B171",
                  "&:hover": { 
                    background: "rgba(5, 177, 113, 0.05)"
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FiUserPlus size={18} color="#05B171" />
                </ListItemIcon>
                <ListItemText 
                  primary="Create Account" 
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#05B171"
                  }}
                />
              </MenuItem>
            </Box>
          </motion.div>
        )}
      </Menu>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top strip - hidden on mobile */}
      <div className="top-strip py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hidden md:block">
        <div className="container">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <p className="text-sm font-medium">
                Free delivery at Summit, 4 Kilo, Megenagna, Figa
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href="tel:0961599628" className="hover:text-emerald-100 transition-colors">
                📞 0961599628
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header bg-white">
        <div className="container">
          {/* Mobile Top Row */}
          <div className="flex items-center justify-between py-4 md:hidden">
            <div className="w-1/4 flex justify-start">
              <IconButton 
                onClick={handleDrawerToggle}
                sx={{
                  "&:hover": { backgroundColor: "#f0fdf4" }
                }}
              >
                <IoMenu size={26} className="text-gray-700" />
              </IconButton>
            </div>

            <div className="flex justify-center">
              {showMobileSearch ? (
                <div className="w-full max-w-[700px]">
                  <Search />
                </div>
              ) : (
                <Link to={"/"} className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="h-11" />
                </Link>
              )}
            </div>

            <div className="w-1/4 flex justify-end">
              <IconButton
                aria-label="search"
                onClick={() => setShowMobileSearch((prev) => !prev)}
                sx={{
                  "&:hover": { backgroundColor: "#f0fdf4" }
                }}
              >
                <IoSearchOutline size={24} className="text-gray-700" />
              </IconButton>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between py-4">
            <div className="col1 w-[20%]">
              <Link to={"/"} className="flex items-center gap-2 group">
                <img src="/logo.png" alt="Logo" className="h-12 transition-transform group-hover:scale-105" />
              </Link>
            </div>
            
            <div className="col2 w-[50%] px-4">
              <Search />
            </div>
            
            <div className="col3 w-[30%] flex items-center justify-end">
              <ul className="flex items-center gap-2">
                {currentUser ? (
                  <li className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer" onClick={handleDesktopMenuOpen}>
                    <Avatar
                      sx={{ 
                        width: 32, 
                        height: 32,
                        border: "2px solid #05B171"
                      }}
                      src={currentUser.avatar}
                    >
                      {currentUser.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" className="hidden lg:block font-medium text-gray-700">
                      {currentUser.name.split(" ")[0]}
                    </Typography>
                  </li>
                ) : (
                  <li className="flex items-center gap-3 px-3 py-2">
                    <Link
                      to="/login"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-medium"
                    >
                      <FiLogIn size={18} />
                      <span className="text-sm">Login</span>
                    </Link>
                    <Link 
                      to="/register" 
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-medium shadow-md hover:shadow-lg"
                    >
                      <FiUserPlus size={18} />
                      <span className="text-sm">Register</span>
                    </Link>
                  </li>
                )}
                
                <li>
                  <Link to="/wishlist">
                    <Tooltip title="Wishlist" arrow placement="bottom">
                      <IconButton 
                        aria-label="heart"
                        sx={{
                          "&:hover": { backgroundColor: "#fef2f2" }
                        }}
                      >
                        <StyledBadge
                          badgeContent={wishlistCount}
                          sx={{
                            "& .MuiBadge-badge": {
                              backgroundColor: "#ec4899",
                            }
                          }}
                        >
                          {wishlist.length > 0 ? (
                            <FaHeart className="text-pink-500" size={22} />
                          ) : (
                            <FaRegHeart size={22} className="text-gray-600" />
                          )}
                        </StyledBadge>
                      </IconButton>
                    </Tooltip>
                  </Link>
                </li>
                
                <li>
                  <Link to="/cart">
                    <Tooltip title="Cart" arrow placement="bottom">
                      <IconButton 
                        aria-label="cart"
                        sx={{
                          "&:hover": { backgroundColor: "#f0fdf4" }
                        }}
                      >
                        <StyledBadge badgeContent={cartCount}>
                          <IoCartOutline size={28} className="text-gray-600" />
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
          <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 bg-white border-t-2 border-emerald-100 z-[1050] md:hidden shadow-2xl">
            <Link to="/product" className="flex flex-col items-center group">
              <IconButton 
                aria-label="Shop"
                sx={{
                  "&:hover": { backgroundColor: "#f0fdf4" }
                }}
              >
                <IoBagOutline size={24} className="text-gray-600 group-hover:text-emerald-600" />
              </IconButton>
              <span className="text-xs text-gray-600 group-hover:text-emerald-600 font-medium">Shop</span>
            </Link>

            <Link to="/cart" className="flex flex-col items-center group">
              <Tooltip title="Cart" arrow placement="top">
                <IconButton 
                  aria-label="cart"
                  sx={{
                    "&:hover": { backgroundColor: "#f0fdf4" }
                  }}
                >
                  <StyledBadge badgeContent={cartCount}>
                    <IoCartOutline size={26} className="text-gray-600 group-hover:text-emerald-600" />
                  </StyledBadge>
                </IconButton>
              </Tooltip>
              <span className="text-xs text-gray-600 group-hover:text-emerald-600 font-medium">Cart</span>
            </Link>

            <Link to="/wishlist" className="flex flex-col items-center group">
              <Tooltip title="Wishlist" arrow placement="top">
                <IconButton 
                  aria-label="wishlist"
                  sx={{
                    "&:hover": { backgroundColor: "#fef2f2" }
                  }}
                >
                  <StyledBadge
                    badgeContent={wishlistCount}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#ec4899",
                      }
                    }}
                  >
                    {wishlist.length > 0 ? (
                      <FaHeart className="text-pink-500" size={22} />
                    ) : (
                      <FaRegHeart size={22} className="text-gray-600 group-hover:text-pink-500" />
                    )}
                  </StyledBadge>
                </IconButton>
              </Tooltip>
              <span className="text-xs text-gray-600 group-hover:text-pink-500 font-medium">Wishlist</span>
            </Link>

            <div className="flex flex-col items-center group">
              <IconButton 
                aria-label="account" 
                onClick={handleMobileMenuOpen}
                sx={{
                  "&:hover": { backgroundColor: "#f0fdf4" }
                }}
              >
                {currentUser ? (
                  <Avatar
                    sx={{ 
                      width: 26, 
                      height: 26,
                      border: "2px solid #05B171"
                    }}
                    src={currentUser.avatar}
                  >
                    {currentUser.name.charAt(0)}
                  </Avatar>
                ) : (
                  <FiUser size={22} className="text-gray-600 group-hover:text-emerald-600" />
                )}
              </IconButton>
              <span className="text-xs text-gray-600 group-hover:text-emerald-600 font-medium">Account</span>
              <AccountMenu
                anchorEl={mobileAnchorEl}
                onClose={handleMobileMenuClose}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      </div>

      <Navigation
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
    </header>
  );
};

export default Header;