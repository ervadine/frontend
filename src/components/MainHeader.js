// components/Header/MainHeader.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountDropdown from './AccountDropdown';
import './nav.css';
import { fetchCompany, selectCompany, selectCompanyName, selectCompanyLogo } from '../store/redux/companySlice';

const MainHeader = ({ cartCount, wishlistCount, onSearch, onMobileSearchToggle, onMobileNavToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Select company data from Redux store
  const companyName = useSelector(selectCompanyName);
  const companyLogo = useSelector(selectCompanyLogo);
  const company = useSelector(selectCompany);

  // Fetch company data on component mount
  useEffect(() => {
    dispatch(fetchCompany());
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search page with query parameter
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      // Call parent search handler if provided
      if (onSearch) {
        onSearch(searchTerm);
      }
    }
  };

  const handleMobileSearchClick = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    // Call parent mobile search toggle handler if provided
    if (onMobileSearchToggle) {
      onMobileSearchToggle(!isMobileSearchOpen);
    }
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      if (onSearch) {
        onSearch(searchTerm);
      }
      // Close mobile search after submission
      setIsMobileSearchOpen(false);
      if (onMobileSearchToggle) {
        onMobileSearchToggle(false);
      }
    }
  };

  const handleMobileNavClick = () => {
    if (onMobileNavToggle) {
      onMobileNavToggle();
    }
    // Alternatively, you can toggle a class directly on the navmenu
    document.body.classList.toggle('mobile-nav-active');
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('#navmenu');
    
    if (navToggle && navMenu) {
      navToggle.classList.toggle('bi-list');
      navToggle.classList.toggle('bi-x');
      navMenu.classList.toggle('mobile-nav-active');
    }
  };

  // Function to render logo - either image or text
  const renderLogo = () => {
    if (companyLogo?.url) {
      return (
        <>
          <img 
            src={companyLogo.url} 
            alt={companyName || 'Store Logo'} 
            className="logo-img"
            style={{ maxHeight: '40px', width: 'auto' }}
          />
          <span className="site-name ms-2">{companyName || 'eStore'}</span>
        </>
      );
    }
    
    // Fallback to text logo
    return <h1 className="sitename">{companyName || 'eStore'}</h1>;
  };

  return (
    <>
      <div className="main-header">
        <div className="container-fluid container-xl">
          <div className="d-flex py-3 align-items-center justify-content-between">
            {/* Logo */}
            <a href="/" className="logo d-flex align-items-center">
              {renderLogo()}
            </a>

            {/* Desktop Search Form */}
            <form className="search-form desktop-search-form" onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search for products"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="header-actions d-flex align-items-center justify-content-end">
              {/* Mobile Search Toggle */}
              <button 
                className="header-action-btn mobile-search-toggle d-xl-none" 
                type="button"
                onClick={handleMobileSearchClick}
              >
                <i className="bi bi-search"></i>
              </button>

              {/* Account */}
              <AccountDropdown />

              {/* Wishlist */}
              <a href="/account?section=wishlist" className="header-action-btn d-none d-md-block">
                <i className="bi bi-heart"></i>
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </a>

              {/* Cart */}
              <a href="/cart" className="header-action-btn">
                <i className="bi bi-cart3"></i>
                {cartCount > 0 ? <span className="badge">{cartCount}</span> : <span className="badge">0</span>}
              </a>

              {/* Mobile Navigation Toggle - FIXED: Added button with click handler */}
              <button 
                className="mobile-nav-toggle d-xl-none" 
                type="button"
                onClick={handleMobileNavClick}
                aria-label="Toggle mobile navigation"
              >
                <i className="bi bi-list"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Form */}
      <div className={`collapse ${isMobileSearchOpen ? 'show' : ''}`} id="mobileSearch">
        <div className="container">
          <form className="search-form" onSubmit={handleMobileSearchSubmit}>
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search for products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MainHeader;