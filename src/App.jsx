import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/headers/index.jsx'
import Home from './pages/Home/index.jsx'
import ProductListing from './pages/ProductListing/index.jsx'
import ProductPage from './pages/ProductPage/index.jsx'
import Login from './pages/login/index.jsx'
import SellerDashboard from './pages/Seller/index.jsx'
import CartPage from './pages/CartPage/index.jsx'
import WishlistPage from './pages/WishlistPage/index.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import ScrollToTop from './components/ScrollTop/index.jsx'

function App() {
  return (
    <>
  
    <BrowserRouter>
      <ShopProvider>
     <Header/>
     <ScrollToTop/>
     <Routes>
     
     <Route path={"/"} exact={true} element={<Home/>} />
     <Route path={"/product"} exact={true} element={<ProductListing/>} />
     <Route path={"/products/:category"} exact={true} element={<ProductListing/>} />
     <Route path={"/product/:id"} exact={true} element={<ProductPage/>} />
     <Route path={"/login"} exact={true} element={<Login/>} />
      <Route path={"/seller"} exact={true} element={<SellerDashboard/>} />
      <Route path={"/cart"} exact={true} element={<CartPage/>} />
      <Route path={"/wishlist"} exact={true} element={<WishlistPage/>} />
    
     </Routes>
     </ShopProvider>
     </BrowserRouter>
    </>
  );
}

export default App
