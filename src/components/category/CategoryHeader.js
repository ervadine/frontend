// components/CategoryHeader/CategoryHeader.js
import React, { useState, useEffect, useRef } from 'react';

const CategoryHeader = ({ 
  filters = {}, 
  onFilterChange = () => {}, 
  activeFilters = [], 
  onClearFilter = () => {}, 
  onClearAll = () => {},
  totalProducts = 0,
  totalAllProducts = 0,
  // Subcategory props
  availableSubcategories = [],
  allValidSubcategories = [],
  smartSubcategorySuggestions = []
}) => {
  // Safely access filter values with defaults - FIXED: Handle null values properly
  const safeFilters = {
    search: '',
    minPrice: null,
    maxPrice: null,
    sortBy: 'featured',
    viewMode: 'grid',
    itemsPerPage: 12,
    selectedSubcategories: [],
    inStock: false,  // FIXED: Default to false instead of null
    featured: false, // FIXED: Default to false instead of null
    onSale: false,   // FIXED: Default to false instead of null
    ...filters
  };

  // State for subcategory dropdown
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [searchSubcategory, setSearchSubcategory] = useState('');
  
  // Use ref for dropdown container
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Initialize selected subcategories from filters
  useEffect(() => {
    if (filters.selectedSubcategories) {
      setSelectedSubcategories(filters.selectedSubcategories);
    }
  }, [filters.selectedSubcategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && buttonRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !buttonRef.current.contains(event.target)) {
        setShowSubcategoryDropdown(false);
      }
    };

    if (showSubcategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    if (showSubcategoryDropdown && dropdownRef.current) {
      // Force a reflow to ensure proper positioning
      const dropdown = dropdownRef.current;
      dropdown.style.display = 'none';
      void dropdown.offsetHeight; // Trigger reflow
      dropdown.style.display = 'block';
      
      // Ensure it's positioned correctly
      dropdown.style.position = 'absolute';
      dropdown.style.top = '100%';
      dropdown.style.left = '0';
      dropdown.style.zIndex = '10002';
      
      // Bring to front
      dropdown.style.transform = 'translateZ(0)';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showSubcategoryDropdown]);

  // Filter subcategories based on search
  const getFilteredSubcategories = () => {
    const subcategoriesToUse = smartSubcategorySuggestions.length > 0 
      ? smartSubcategorySuggestions 
      : availableSubcategories;
    
    if (searchSubcategory) {
      return subcategoriesToUse.filter(subcategory => 
        subcategory.toLowerCase().includes(searchSubcategory.toLowerCase())
      );
    }
    
    return subcategoriesToUse;
  };

  // Helper to get price range value for select
  const getPriceRangeValue = () => {
    const { minPrice, maxPrice } = safeFilters;
    
    if (minPrice === null && maxPrice === null) return '1000';
    if (maxPrice === 25) return '25';
    if (minPrice === 25 && maxPrice === 50) return '50';
    if (minPrice === 50 && maxPrice === 100) return '100';
    if (minPrice === 100 && maxPrice === 200) return '200';
    if (minPrice === 200) return '1000';
    
    return '1000';
  };

  const handlePriceRangeChange = (value) => {
    switch (value) {
      case '25':
        onFilterChange({ minPrice: null, maxPrice: 25 });
        break;
      case '50':
        onFilterChange({ minPrice: 25, maxPrice: 50 });
        break;
      case '100':
        onFilterChange({ minPrice: 50, maxPrice: 100 });
        break;
      case '200':
        onFilterChange({ minPrice: 100, maxPrice: 200 });
        break;
      case '1000':
        onFilterChange({ minPrice: 200, maxPrice: null });
        break;
      default:
        onFilterChange({ minPrice: null, maxPrice: null });
    }
  };

  const handleClearFilter = (filterType, filterValue) => {
    if (typeof filterValue === 'object' && filterValue !== null) {
      const { type, value } = filterValue;
      onClearFilter(type, value);
    } else {
      onClearFilter(filterType, filterValue);
    }
  };

  // FIXED: Helper function to safely get select values - handle null properly
  const getSelectValue = (key, defaultValue) => {
    const value = safeFilters[key];
    // For boolean values that might be null, convert to false
    if (key === 'inStock' || key === 'featured' || key === 'onSale') {
      return value === true;
    }
    return value !== null && value !== undefined ? value : defaultValue;
  };

  // FIXED: Helper to get safe value for inputs/selects
  const getSafeValue = (key, defaultValue) => {
    const value = safeFilters[key];
    return value !== null && value !== undefined ? value : defaultValue;
  };

  return (
    <section id="category-header" className="category-header section">
      <div className="container" data-aos="fade-up">
        {/* Filter and Sort Options */}
        <div className="filter-container mb-4" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="filter-item search-form">
                <label htmlFor="productSearch" className="form-label">Search Products</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="productSearch" 
                    placeholder="Search for products..." 
                    aria-label="Search for products"
                    value={getSafeValue('search', '')}
                    onChange={(e) => onFilterChange({ search: e.target.value })}
                  />
                  <button className="btn search-btn" type="button">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <div className="filter-item">
                <label htmlFor="priceRange" className="form-label">Price Range</label>
                <select 
                  className="form-select" 
                  id="priceRange"
                  value={getPriceRangeValue()}
                  onChange={(e) => handlePriceRangeChange(e.target.value)}
                >
                  <option value="1000">All Prices</option>
                  <option value="25">Under $25</option>
                  <option value="50">$25 to $50</option>
                  <option value="100">$50 to $100</option>
                  <option value="200">$100 to $200</option>
                  <option value="1000">$200 & Above</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <div className="filter-item">
                <label htmlFor="sortBy" className="form-label">Sort By</label>
                <select 
                  className="form-select" 
                  id="sortBy"
                  value={getSafeValue('sortBy', 'featured')}
                  onChange={(e) => onFilterChange({ 
                    sortBy: e.target.value,
                    sortOrder: e.target.value === 'price-low-high' ? 'asc' : 
                              e.target.value === 'price-high-low' ? 'desc' : 
                              e.target.value === 'newest' ? 'desc' : 'desc'
                  })}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="filter-item">
                <label className="form-label">View</label>
                <div className="d-flex align-items-center">
                  <div className="view-options me-3">
                    <button 
                      type="button" 
                      className={`btn view-btn ${getSafeValue('viewMode', 'grid') === 'grid' ? 'active' : ''}`}
                      data-view="grid" 
                      aria-label="Grid view"
                      onClick={() => onFilterChange({ viewMode: 'grid' })}
                    >
                      <i className="bi bi-grid-3x3-gap-fill"></i>
                    </button>
                    <button 
                      type="button" 
                      className={`btn view-btn ${getSafeValue('viewMode', 'grid') === 'list' ? 'active' : ''}`}
                      data-view="list" 
                      aria-label="List view"
                      onClick={() => onFilterChange({ viewMode: 'list' })}
                    >
                      <i className="bi bi-list-ul"></i>
                    </button>
                  </div>

                  <div className="items-per-page">
                    <select 
                      className="form-select" 
                      id="itemsPerPage" 
                      aria-label="Items per page"
                      value={getSafeValue('itemsPerPage', 12)}
                      onChange={(e) => onFilterChange({ itemsPerPage: parseInt(e.target.value) })}
                    >
                      <option value="12">12 per page</option>
                      <option value="24">24 per page</option>
                      <option value="48">48 per page</option>
                      <option value="96">96 per page</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="row mt-3">
              <div className="col-12" data-aos="fade-up" data-aos-delay="200">
                <div className="active-filters">
                  <span className="active-filter-label">Active Filters:</span>
                  <div className="filter-tags">
                    {activeFilters.map((filter, index) => (
                      <span key={index} className="filter-tag">
                        {filter.label || filter} 
                        <button 
                          className="filter-remove"
                          onClick={() => handleClearFilter(filter.type || 'category', filter)}
                          aria-label={`Remove ${filter.label}`}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </span>
                    ))}
                    <button 
                      className="clear-all-btn"
                      onClick={onClearAll}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="row mt-2">
            <div className="col-12">
              <div className="results-count">
                Showing {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                {totalAllProducts > totalProducts && (
                  <span className="text-muted ms-2">
                    (filtered from {totalAllProducts} total)
                  </span>
                )}
                
                {/* Subcategory summary */}
                {safeFilters.selectedSubcategories && safeFilters.selectedSubcategories.length > 0 && (
                  <span className="ms-2">
                    <span className="badge bg-info">
                      {safeFilters.selectedSubcategories.length} subcategor
                      {safeFilters.selectedSubcategories.length === 1 ? 'y' : 'ies'}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryHeader;