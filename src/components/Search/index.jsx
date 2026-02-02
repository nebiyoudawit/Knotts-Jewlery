import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync search term with URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(decodeURIComponent(urlSearchTerm));
    }
  }, [location.search]);

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    if (trimmed.length > 0) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      // If search term is empty, remove search param
      navigate('/products');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    navigate('/products');
  };

  return (
    <div className="w-full sm:w-[500px] md:w-[600px] mx-auto">
      <motion.div 
        className={`relative flex items-center bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
          isFocused 
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' 
            : 'border-gray-100 hover:border-gray-200'
        }`}
        whileTap={{ scale: 0.99 }}
      >
        {/* Search Icon */}
        <div className="pl-4 pr-3">
          <SearchIcon className={`w-5 h-5 transition-colors duration-300 ${
            isFocused ? 'text-emerald-600' : 'text-gray-400'
          }`} />
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Search for jewelry..."
          className="flex-1 h-12 focus:outline-none bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 pr-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Clear Button (shows when there's text) */}
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="mr-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200"
            type="button"
          >
            <svg 
              className="w-3 h-3 text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="mr-2 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 hidden sm:flex"
        >
          <span className="text-sm">Search</span>
        </button>


      </motion.div>
    </div>
  );
};

export default Search;
