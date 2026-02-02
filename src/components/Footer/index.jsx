import React from 'react';
import { FaInstagram, FaTelegram, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    // Change these to use Link component with proper routes
    { name: 'Best Selling', path: '/' },
    { name: 'New Release', path: '/' },
  ];

  const categories = [
    { name: 'Rings', path: '/products/rings' },
    { name: 'Necklaces', path: '/products/necklaces' },
    { name: 'Charms', path: '/products/charms' },
    { name: 'Earrings', path: '/products/earrings' },
  ];

  const socialLinks = [
    { 
      name: 'Instagram', 
      icon: <FaInstagram />, 
      url: 'https://www.instagram.com/knotts_jewelry?igsh=Mzc5MHJ1N3d4d3hw',
      color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500',
      iconColor: 'hover:text-white'
    },
    { 
      name: 'Telegram', 
      icon: <FaTelegram />, 
      url: 'https://t.me/knotts_jewelry',
      color: 'hover:bg-blue-500',
      iconColor: 'hover:text-white'
    },
    { 
      name: 'TikTok', 
      icon: <FaTiktok />, 
      url: 'https://www.tiktok.com/@knotts_jewelry?_t=ZM-8vesDYue3Rl&_r=1',
      color: 'hover:bg-black',
      iconColor: 'hover:text-white'
    },
  ];

  // Function to handle section navigation
  const scrollToSection = (sectionId) => {
    // If we're on the homepage, scroll to the section
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // If we're on a different page, navigate to homepage with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 via-emerald-50/30 to-white">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Knotts Jewelry
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              Handcrafted jewelry that tells your unique story. Each piece is designed with love and care to add elegance to your everyday moments.
            </p>
            
            {/* Social Media */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Connect With Us</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-200 text-gray-700 transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color} ${social.iconColor}`}
                    aria-label={social.name}
                  >
                    <span className="text-xl">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent"></span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.name === 'Best Selling' || link.name === 'New Release' ? (
                    <button 
                      onClick={() => scrollToSection(link.name === 'Best Selling' ? 'best' : 'latest')}
                      className="text-gray-600 hover:text-emerald-600 transition-all duration-200 group flex items-center gap-2 w-full text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-500 group-hover:scale-150 transition-all duration-200"></span>
                      {link.name}
                    </button>
                  ) : (
                    <Link 
                      to={link.path} 
                      className="text-gray-600 hover:text-emerald-600 transition-all duration-200 group flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-500 group-hover:scale-150 transition-all duration-200"></span>
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 relative inline-block">
              Shop by Category
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent"></span>
            </h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link 
                    to={category.path} 
                    className="text-gray-600 hover:text-emerald-600 transition-all duration-200 group flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-500 group-hover:scale-150 transition-all duration-200"></span>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 relative inline-block">
              Get In Touch
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent"></span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Call us</p>
                  <p className="font-medium text-gray-900">0961599628</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email us</p>
                  <a 
                    href="mailto:knottsjewelry@gmail.com"
                    className="font-medium text-gray-900 hover:text-emerald-600 transition-colors text-sm"
                  >
                    knottsjewelry@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Free delivery</p>
                  <p className="font-medium text-gray-900 text-sm">Summit, 4 Kilo, Megenagna, Figa</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-500 text-sm flex items-center gap-2"
            >
              © {new Date().getFullYear()} Knotts Jewelry. Crafted with 
              <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" /> 
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex gap-6 text-sm text-gray-500"
            >
              <Link to="/" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
              <Link to="/" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
              <Link to="/" className="hover:text-emerald-600 transition-colors">Shipping Info</Link>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;