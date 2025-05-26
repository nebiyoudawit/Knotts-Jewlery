import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { CiSearch } from "react-icons/ci";
import { useNavigate, useLocation } from 'react-router-dom';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
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

  return (
    <div className="w-full sm:w-[500px] md:w-[600px] bg-[#e5e5e5] rounded-md relative px-3 py-2 mx-auto h-[50px]">
      <input
        type="text"
        placeholder="Search for products..."
        className="w-full h-[35px] focus:outline-none bg-inherit text-[15px] pr-12 rounded-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Search button - hidden on mobile */}
      <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 right-2">
        <Button
          className="!w-[36px] !min-w-[36px] h-[36px] !rounded-full !text-black !p-0"
          onClick={handleSearch}
        >
          <CiSearch className="text-[22px]" />
        </Button>
      </div>

      {/* Mobile search button - visible only on mobile */}
      <div className="sm:hidden absolute top-1/2 -translate-y-1/2 right-2">
        <Button
          className="!w-[36px] !min-w-[36px] h-[36px] !rounded-full !text-black !p-0"
          onClick={handleSearch}
        >
          <CiSearch className="text-[22px]" />
        </Button>
      </div>
    </div>
  );
};

export default Search;