// components/Header/TopBar.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AnnouncementSlider from './AnnouncementSlider';
import { fetchCompany, selectCompany, selectCompanyCurrency, selectCompanyPhone } from '../store/redux/companySlice';

const TopBar = () => {
  const dispatch = useDispatch();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  
  // Select company data from Redux store
  const company = useSelector(selectCompany);
  const companyPhone = useSelector(selectCompanyPhone);
  const companyCurrency = useSelector(selectCompanyCurrency);
  
  // Fetch company data on component mount
  useEffect(() => {
    dispatch(fetchCompany());
  }, [dispatch]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageOpen && !event.target.closest('.language-dropdown')) {
        setLanguageOpen(false);
      }
      if (currencyOpen && !event.target.closest('.currency-dropdown')) {
        setCurrencyOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [languageOpen, currencyOpen]);
  
  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '+1 (234) 567-890';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };
  
  const announcements = [
    "🚚 We ship fast, place your order",
    "💰 30 days money back guarantee.",
  ];

  return (
    <div className="top-bar py-2">
      <div className="container-fluid container-xl">
        <div className="row align-items-center">
          <div className="col-lg-4 d-none d-lg-flex">
            <div className="top-bar-item">
              <i className="bi bi-telephone-fill me-2"></i>
              <span>Need help? Call us: </span>
              <a href={`tel:${companyPhone || '+1234567890'}`}>
                {formatPhoneNumber(companyPhone)}
              </a>
            </div>
          </div>

          <div className="col-lg-4 col-md-12 text-center">
            <AnnouncementSlider announcements={announcements} />
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <div className="d-flex justify-content-end">
              {/* Language Dropdown */}
              <div className="top-bar-item dropdown me-3 language-dropdown">
                <span 
                  className="dropdown-toggle" 
                  onClick={() => setLanguageOpen(!languageOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-translate me-2"></i>EN
                </span>
                {languageOpen && (
                  <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', right: 0 }}>
                    <a className="dropdown-item" href="#">English</a>
                    
                  </div>
                )}
              </div>
              
              {/* Currency Dropdown */}
              <div className="top-bar-item dropdown currency-dropdown">
                <span 
                  className="dropdown-toggle" 
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-currency-dollar me-2"></i>
                  {companyCurrency || 'USD'}
                </span>
                {currencyOpen && (
                  <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', right: 0 }}>
                    <a className="dropdown-item" href="#">USD ($)</a>
                    
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;