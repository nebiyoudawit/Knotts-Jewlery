import { Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, Box, IconButton } from '@mui/material';
import { IoClose } from "react-icons/io5";

const Navigation = ({ mobileOpen, handleDrawerToggle, onCategorySelect }) => {
  const categories = [
    { name: "Bracelets", path: "bracelets" },
    { name: "Charms", path: "charms" },
    { name: "Earrings", path: "earrings" },
    { name: "Rings", path: "rings" },
    { name: "Necklaces", path: "necklaces" }
  ];

  const handleClick = (category) => {
    onCategorySelect(category.name);
    if (mobileOpen) handleDrawerToggle();
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className='w-full h-[50px] shadow-md hidden md:block'>
        <div className="container h-full flex items-center justify-center">
          <ul className='flex items-center gap-16'>
            <li className='list-none'>
              <Link to="/" className='link transition'>
                <Button className='!text-[rgba(0,0,0,0.8)] !font-[500] hover:!text-[#05B171]'>Home</Button>
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.path} className='list-none'>
                <Link to={`/products/${category.path}`} className='link transition'>
                  <Button 
                    className='!text-[rgba(0,0,0,0.8)] !font-[500] hover:!text-[#05B171]'
                    onClick={() => handleClick(category)}
                  >
                    {category.name}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <div className="flex justify-between items-center mb-4">
            <Link to="/" onClick={handleDrawerToggle}>
              <img src="/logo.png" alt="Logo" className="h-8" />
            </Link>
            <IconButton onClick={handleDrawerToggle}>
              <IoClose size={24} />
            </IconButton>
          </div>
          <ul className='flex flex-col gap-2'>
            <li className='list-none'>
              <Link to="/" onClick={handleDrawerToggle}>
                <Button fullWidth className='!justify-start !text-[rgba(0,0,0,0.8)]'>Home</Button>
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.path} className='list-none'>
                <Link 
                  to={`/products/${category.path}`} 
                  onClick={() => handleClick(category)}
                >
                  <Button fullWidth className='!justify-start !text-[rgba(0,0,0,0.8)]'>
                    {category.name}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;