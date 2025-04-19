import React from 'react';
import { FaInstagram, FaTelegram, FaTiktok, FaPhone, FaQuestionCircle, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 ">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Knotts Jewlery</h2>
            <p className="text-gray-600">
              Experience the charm of our handmade jewelry that adds a touch of uniqueness to your style!!
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <FaPhone className="text-[#05B171]" />
                <p>0961599628</p>
              </div>
              <p className="text-gray-600">Monday - Friday, 08am - 9pm</p>
            </div>
          </div>

          {/* Help Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaQuestionCircle className="text-[#05B171]" />
              Need help with your order?
            </h3>
            <div className="flex items-center gap-2 text-gray-600">
              <FaEnvelope className="text-[#05B171]" />
              <p>knottsjewlery@gmail.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Products</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#best" className='link cursor-pointer'>Best Selling</a></li>
              <li><a href="#latest" className='link cursor-pointer'>New Release</a></li>
              <li><Link to="/" className="link">Rings</Link></li>
              <li><Link to="/" className="link">Necklaces</Link></li>
              <li><Link to="/" className="link">Charms</Link></li>
             <li> <Link to="/" className="link">Earrings</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Follow us on social media:</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/knotts_jewelry?igsh=Mzc5MHJ1N3d4d3hw" target="_blank" className="text-gray-600 hover:text-[#05B171]">
                <FaInstagram size={20} />
              </a>
              <a href="https://t.me/knotts_jewelry" className="text-gray-600 hover:text-[#05B171]" target='_blank'>
                <FaTelegram size={20} />
              </a>
              <a href="https://www.tiktok.com/@knotts_jewelry?_t=ZM-8vesDYue3Rl&_r=1" className="text-gray-600 hover:text-[#05B171]" target='_blank'>
                <FaTiktok size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Knotts Jewlery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;