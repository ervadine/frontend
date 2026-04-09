// components/Header/Header.js
import React, { useState } from 'react';
import TopBar from './TopBar';
import MainHeader from './MainHeader';
import Navigation from './Navigation';
import MobileSearch from './MobileSearch';

const Header = ({ 
  cartCount = 0, 
  wishlistCount = 0, 
  categories = [], 
  onSearch = () => {} 
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearch = (searchTerm) => {
    onSearch(searchTerm);
    setMobileSearchOpen(false);
  };

  const handleMobileSearchToggle = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };

  return (
    <header id="header" className="header position-relative">
      <TopBar />
      <MainHeader 
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onSearch={handleSearch}
        onMobileSearchToggle={handleMobileSearchToggle}
      />
      <Navigation categories={categories} />

      <MobileSearch 
        isOpen={mobileSearchOpen}
        onSearch={handleSearch}
      />
    </header>
  ); 
};

export default Header;