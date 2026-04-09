// components/Header/MobileSearch.js
import React, { useState } from 'react';

const MobileSearch = ({ isOpen, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className={`collapse ${isOpen ? 'show' : ''}`} id="mobileSearch">
      <div className="container">
        <form className="search-form" onSubmit={handleSubmit}>
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
  );
};

export default MobileSearch;