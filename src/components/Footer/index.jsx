import React from 'react';
import { FaInstagram, FaTelegram, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, Sparkles } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Best Selling', path: '#best' },
    { name: 'New Release', path: '#latest' },
  ];

  const categories = [
    { name: 'Rings', path: '/' },
    { name: 'Necklaces', path: '/' },
    { name: 'Charms', path: '/' },
    { name: 'Earrings', path: '/' },
  ];

  const socialLinks = [
    { 
      name: 'Instagram', 
      icon: <FaInstagram />, 
      url: 'https://www.instagram.com/knotts_jewelry?igsh=Mzc5MHJ1N3d4d3hw',
      color: 'hover:text-pink-500'
    },
    { 
      name: 'Telegram', 
      icon: <FaTelegram />, 
      url: 'https://t.me/knotts_jewelry',
      color: 'hover:text-blue-500'
    },
    { 
      name: 'TikTok', 
      icon: <FaTiktok />, 
      url: 'https://www.tiktok.com/@knotts_jewelry?_t=ZM-8vesDYue3Rl&_r=1',
      color: 'hover:text-black'
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#05B171]" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#05B171] to-emerald-600 bg-clip-text text-transparent">
                Knotts Jewlery
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Experience the charm of our handmade jewelry that adds a touch of uniqueness to your style!
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#05B171]/10 group-hover:bg-[#05B171]/20 transition-colors">
                  <Phone className="w-4 h-4 text-[#05B171]" />
                </div>
                <div>
                  <p className="font-semibold">0961599628</p>
                  <p className="text-sm text-gray-500">Mon - Fri, 08am - 9pm</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900">Get In Touch</h3>
            <div className="flex items-center gap-3 text-gray-700 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#05B171]/10 group-hover:bg-[#05B171]/20 transition-colors">
                <Mail className="w-4 h-4 text-[#05B171]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email us</p>
                <a 
                  href="mailto:knottsjewlery@gmail.com"
                  className="font-medium hover:text-[#05B171] transition-colors"
                >
                  knottsjewlery@gmail.com
                </a>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 ${social.color} hover:scale-110 hover:shadow-md transition-all duration-300`}
                    aria-label={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
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
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-600 hover:text-[#05B171] hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#05B171] transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-5"
          >
            <h3 className="text-lg font-semibold text-gray-900">Shop by Category</h3>
            <ul className="space-y-2.5">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link 
                    to={category.path} 
                    className="text-gray-600 hover:text-[#05B171] hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#05B171] transition-colors"></span>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Knotts Jewlery. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link to="/" className="hover:text-[#05B171] transition-colors">Privacy Policy</Link>
              <Link to="/" className="hover:text-[#05B171] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
