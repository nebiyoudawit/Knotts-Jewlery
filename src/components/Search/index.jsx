import React from 'react';
import Button from '@mui/material/Button';
import { CiSearch } from "react-icons/ci";

const Search = () => {
  return (
    <div className="w-full sm:w-[500px] md:w-[600px] bg-[#e5e5e5] rounded-md relative px-3 py-2 mx-auto">
      <input
        type="text"
        placeholder="Search for products..."
        className="w-full h-10 focus:outline-none bg-inherit text-[15px] pr-12 rounded-md"
      />

      {/* Hidden on mobile, visible on sm+ */}
      <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 right-2">
        <Button
          className="!w-[36px] !min-w-[36px] h-[36px] !rounded-full !text-black !p-0"
        >
          <CiSearch className="text-[22px]" />
        </Button>
      </div>
    </div>
  );
};

export default Search;
