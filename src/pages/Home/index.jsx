import React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import CollectionSlider from '../../components/CollectionSlider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ProductSlider from '../../components/ProductSlider';
import Footer from '../../components/Footer';

const Home = () => {
    const categories = ['All', 'Bracelets', 'Charms', 'Earrings', 'Rings', 'Necklaces'];

    const [bestTab, setBestTab] = React.useState(0);
    const [latestTab, setLatestTab] = React.useState(0);

    const [bestCategory, setBestCategory] = React.useState('All');
    const [latestCategory, setLatestCategory] = React.useState('All');

    const handleBestChange = (event, newValue) => {
        setBestTab(newValue);
        setBestCategory(categories[newValue]);
    };

    const handleLatestChange = (event, newValue) => {
        setLatestTab(newValue);
        setLatestCategory(categories[newValue]);
    };

    return (
        <div className="home-page pb-16 md:pb-0">
            {/* Hero Section */}
            <section className="relative w-full h-[80vh] max-h-[800px] overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="/hero-img1.jpg"
                        alt="Beautiful Jewelry Collection"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
                
                <div className="container relative h-full flex items-center">
                    <div className="max-w-2xl text-white">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                            Discover Our Exquisite Collection
                        </h1>
                        <p className="text-lg md:text-xl mb-8">
                            Handcrafted jewelry that tells your unique story. Perfect pieces for every occasion.
                        </p>
                        <Button
                            component={Link}
                            to="/product"
                            variant="contained"
                            size="large"
                            sx={{
                                backgroundColor: '#05B171',
                                '&:hover': { backgroundColor: '#048a5b' },
                                px: 6,
                                py: 1.5,
                                fontSize: '1rem'
                            }}
                        >
                            Shop Now
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Categories Section */}
            <section className="py-16 container">
                <h2 className="text-3xl font-bold text-center mb-12">Featured Collections</h2>
                <CollectionSlider />
            </section>

            {/* Best Sellers Section */}
            <section id="best" className="py-12 bg-gray-50">
                <div className="container">
                    <div className="flex items-center justify-between flex-col lg:flex-row mb-8">
                        <div className='leftSec w-full lg:w-[40%] mb-6 lg:mb-0'>
                            <h2 className="text-2xl font-bold">Our Best Sellers</h2>
                            <p className="text-gray-600">Discover our most popular pieces loved by our customers.</p>
                        </div>
                        <div className='rightSec w-full lg:w-[60%]'>
                            <Tabs
                                value={bestTab}
                                onChange={handleBestChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                aria-label="Best seller categories"
                                sx={{ '& .MuiTabs-indicator': { backgroundColor: '#05B171' } }}
                            >
                                {categories.map((cat, index) => (
                                    <Tab
                                        key={index}
                                        label={cat}
                                        sx={{ '&.Mui-selected': { color: '#05B171' } }}
                                    />
                                ))}
                            </Tabs>
                        </div>
                    </div>
                    
                    <ProductSlider category={bestCategory} sortBy="bestsellers" items={5} />
                </div>
            </section>

            {/* Decorative Section Separator */}
            <div className="w-full py-8 bg-gray-50 flex justify-center">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-50 px-4 text-[#05B171]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path 
                                    fillRule="evenodd" 
                                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>

            {/* New Arrivals Section */}
            <section id='latest' className="py-12 bg-gray-50">
                <div className="container">
                    <div className="flex items-center justify-between flex-col lg:flex-row mb-8">
                        <div className='leftSec w-full lg:w-[40%] mb-6 lg:mb-0'>
                            <h2 className="text-2xl font-bold">New Arrivals</h2>
                            <p className="text-gray-600">Elevate your style with our newest arrivals - each piece crafted to make a statement.</p>
                        </div>
                        <div className='rightSec w-full lg:w-[60%]'>
                            <Tabs
                                value={latestTab}
                                onChange={handleLatestChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                aria-label="New arrivals categories"
                                sx={{ '& .MuiTabs-indicator': { backgroundColor: '#05B171' } }}
                            >
                                {categories.map((cat, index) => (
                                    <Tab
                                        key={index}
                                        label={cat}
                                        sx={{ '&.Mui-selected': { color: '#05B171' } }}
                                    />
                                ))}
                            </Tabs>
                        </div>
                    </div>
                    
                    <ProductSlider category={latestCategory} sortBy="latest" items={5} />
                </div>
            </section>

            <hr />

            {/* Footer Section */}
            <Footer />
        </div>
    );
};

export default Home;
