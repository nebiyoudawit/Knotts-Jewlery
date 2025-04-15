import react from 'react';
import Button from '@mui/material/Button';
import { CiSearch } from "react-icons/ci";
const Search = ()=>{
    return(
        <div className="searchBox w-[100%] h-[50px] bg-[#e5e5e5] rounded-[5px] relative p-2">
        <input type="text" placeholder="Search for products..." className="w-full h-[35px] focus:outline-none bg-inherit p-2 text-[15px]"></input>
        <Button  className="!absolute top-[5px] right-[5px] z-50 !w-[37px] !min-w-[37px] h-[37px] !rounded-full !text-black"><CiSearch className='text-black text-[22px]'/></Button>
    </div>
    )
}
export default Search;