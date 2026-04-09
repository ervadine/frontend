// components/category/FilterSidebar.js
import React, { useState, useRef, useEffect } from 'react';

const FilterSidebar = ({ 
  filters = {}, 
  onFilterChange = () => {}, 
  onClearAll = () => {}, 
  categories = [], 
  brands = [],
  currentCategory = null,
  availableColors = [],
  availableSizes = [],
  brandProductCounts = {},
  availableSubcategories = [],
  allValidSubcategories = []
}) => {
  // FIXED: Ensure all filter arrays are always arrays, even if undefined
  const defaultFilters = {
    priceRange: [0, 1000],
    selectedColors: [],
    selectedSizes: [],
    selectedBrands: [],
    selectedCategories: [],
    selectedSubcategories: []
  };

  const safeFilters = { 
    ...defaultFilters, 
    ...filters,
    // FIXED: Ensure all arrays are properly initialized
    selectedColors: Array.isArray(filters.selectedColors) ? filters.selectedColors : defaultFilters.selectedColors,
    selectedSizes: Array.isArray(filters.selectedSizes) ? filters.selectedSizes : defaultFilters.selectedSizes,
    selectedBrands: Array.isArray(filters.selectedBrands) ? filters.selectedBrands : defaultFilters.selectedBrands,
    selectedCategories: Array.isArray(filters.selectedCategories) ? filters.selectedCategories : defaultFilters.selectedCategories,
    selectedSubcategories: Array.isArray(filters.selectedSubcategories) ? filters.selectedSubcategories : defaultFilters.selectedSubcategories
  };

  const [expandedCategories, setExpandedCategories] = useState({});
  const [priceRange, setPriceRange] = useState(safeFilters.priceRange);
  const [searchBrand, setSearchBrand] = useState('');
  const [searchColor, setSearchColor] = useState('');
  const [searchSize, setSearchSize] = useState('');
  const [searchSubcategory, setSearchSubcategory] = useState('');
  
  const minPriceRef = useRef(safeFilters.priceRange[0]);
  const maxPriceRef = useRef(safeFilters.priceRange[1]);

  useEffect(() => {
    if (!Array.isArray(safeFilters.priceRange)) {
      setPriceRange([0, 1000]);
      minPriceRef.current = 0;
      maxPriceRef.current = 1000;
    }
  }, [safeFilters.priceRange]);

  useEffect(() => {
    if (safeFilters.priceRange && Array.isArray(safeFilters.priceRange)) {
      setPriceRange(safeFilters.priceRange);
      minPriceRef.current = safeFilters.priceRange[0];
      maxPriceRef.current = safeFilters.priceRange[1];
    }
  }, [safeFilters.priceRange]);

  const filteredBrands = Array.isArray(brands) ? brands.filter(brand => 
    brand.name?.toLowerCase().includes(searchBrand.toLowerCase())
  ) : [];

  const filteredColors = Array.isArray(availableColors) ? availableColors.filter(color => 
    color.name?.toLowerCase().includes(searchColor.toLowerCase()) ||
    color.value?.toLowerCase().includes(searchColor.toLowerCase())
  ) : [];

  const filteredSizes = Array.isArray(availableSizes) ? availableSizes.filter(size => 
    size.name?.toLowerCase().includes(searchSize.toLowerCase()) ||
    size.value?.toLowerCase().includes(searchSize.toLowerCase())
  ) : [];

  const filteredSubcategories = Array.isArray(availableSubcategories) ? 
    availableSubcategories.filter(subcategory => 
      subcategory.toLowerCase().includes(searchSubcategory.toLowerCase())
    ) : [];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    const newPriceRange = type === 'min' 
      ? [Math.min(numValue, priceRange[1]), priceRange[1]]
      : [priceRange[0], Math.max(numValue, priceRange[0])];
    
    if (newPriceRange[0] <= newPriceRange[1]) {
      setPriceRange(newPriceRange);
    }
  };

  const handlePriceRangeApply = () => {
    onFilterChange({ 
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    });
  };

  const handleColorChange = (colorValue) => {
    const currentColors = safeFilters.selectedColors;
    const newColors = currentColors.includes(colorValue)
      ? currentColors.filter(c => c !== colorValue)
      : [...currentColors, colorValue];
    
    onFilterChange({ selectedColors: newColors });
  };

  const handleSizeChange = (sizeValue) => {
    const currentSizes = safeFilters.selectedSizes;
    const newSizes = currentSizes.includes(sizeValue)
      ? currentSizes.filter(s => s !== sizeValue)
      : [...currentSizes, sizeValue];
    
    onFilterChange({ selectedSizes: newSizes });
  };

  const handleBrandChange = (brandId) => {
    const currentBrands = safeFilters.selectedBrands;
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(b => b !== brandId)
      : [...currentBrands, brandId];
    
    onFilterChange({ selectedBrands: newBrands });
  };

  const handleCategoryChange = (categoryId) => {
    const currentCategories = safeFilters.selectedCategories;
    
    // FIXED: Check if category is already selected
    const isSelected = currentCategories.includes(categoryId);
    const newCategories = isSelected
      ? currentCategories.filter(c => c !== categoryId) // Remove if already selected
      : [...currentCategories, categoryId]; // Add if not selected
    
    console.log('Category change:', {
      categoryId,
      isSelected,
      currentCategories,
      newCategories
    });
    
    onFilterChange({ selectedCategories: newCategories });
  };

  const handleSubcategoryChange = (subcategory) => {
    const currentSubcategories = safeFilters.selectedSubcategories;
    const newSubcategories = currentSubcategories.includes(subcategory)
      ? currentSubcategories.filter(s => s !== subcategory)
      : [...currentSubcategories, subcategory];
    
    onFilterChange({ selectedSubcategories: newSubcategories });
  };

  const getSubcategoryProductCount = (subcategory) => {
    if (!allValidSubcategories || allValidSubcategories.length === 0) return 0;
    
    return availableSubcategories.includes(subcategory) ? '✓' : 0;
  };

  const getParentCategories = () => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(cat => !cat?.parent || cat.parent === null);
  };

  const getChildCategories = (parentId) => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(cat => cat?.parent === parentId);
  };

  const getCategoryLink = (category) => {
    if (category.seo?.slug) {
      return `/products?slug=${category.seo.slug}`;
    }
    if (category.slug) {
      return `/products?slug=${category.slug}`;
    }
    return `/products?slug=${category.name?.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const handleClearAllClick = () => {
    console.log('Clear All Filters clicked in FilterSidebar');
    
    setPriceRange([0, 1000]);
    setSearchBrand('');
    setSearchColor('');
    setSearchSize('');
    setSearchSubcategory('');
    setExpandedCategories({});
    
    if (typeof onClearAll === 'function') {
      onClearAll();
    } else {
      console.error('onClearAll is not a function:', onClearAll);
      window.location.href = '/categories';
    }
  };

  // FIXED: Helper function to safely check if item is included in array
  const isCategorySelected = (categoryId) => {
    return safeFilters.selectedCategories.includes(categoryId);
  };

  const isBrandSelected = (brandId) => {
    return safeFilters.selectedBrands.includes(brandId);
  };

  const isSizeSelected = (sizeValue) => {
    return safeFilters.selectedSizes.includes(sizeValue);
  };

  const isColorSelected = (colorValue) => {
    return safeFilters.selectedColors.includes(colorValue);
  };

  const isSubcategorySelected = (subcategory) => {
    return safeFilters.selectedSubcategories.includes(subcategory);
  };

  return (
    <div className="widgets-container">
      {/* Product Categories Widget */}
      <div className="product-categories-widget widget-item mb-4">
        <h3 className="widget-title">Categories</h3>
        <ul className="category-tree list-unstyled mb-0">
          {getParentCategories().map(category => {
            if (!category?._id) return null;
            
            const childCategories = getChildCategories(category._id);
            const hasChildren = childCategories.length > 0;
            const isExpanded = expandedCategories[category._id];
            const isCurrentCategory = currentCategory && currentCategory._id === category._id;
            const isSelected = isCategorySelected(category._id);

            return (
              <li key={category._id} className="category-item mb-2">
                <div 
                  className={`d-flex justify-content-between align-items-center category-header ${isExpanded ? '' : 'collapsed'}`}
                  style={{ cursor: hasChildren ? 'pointer' : 'default' }}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryChange(category._id)}
                      id={`category-${category._id}`}
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor={`category-${category._id}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <a 
                        href={getCategoryLink(category)} 
                        onClick={(e) => {
                          if (isCurrentCategory) {
                            e.preventDefault();
                          }
                        }}
                        className={isCurrentCategory ? 'text-primary fw-bold' : ''}
                      >
                        {category.name || 'Unnamed Category'}
                      </a>
                    </label>
                  </div>
                  {hasChildren && (
                    <button 
                      className="category-toggle btn btn-sm btn-link p-0"
                      onClick={() => toggleCategory(category._id)}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    </button>
                  )}
                </div>
                {hasChildren && isExpanded && (
                  <ul className="subcategory-list list-unstyled ps-3 mt-2">
                    {childCategories.map(child => (
                      <li key={child._id} className="mb-1">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isCategorySelected(child._id)}
                            onChange={() => handleCategoryChange(child._id)}
                            id={`category-${child._id}`}
                          />
                          <label 
                            className="form-check-label" 
                            htmlFor={`category-${child._id}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <a href={getCategoryLink(child)}>
                              {child.name || 'Unnamed Subcategory'}
                            </a>
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Subcategory Filter Widget */}
      <div className="subcategory-filter-widget widget-item mb-4">
        <h3 className="widget-title">Filter by Subcategory</h3>
        <div className="subcategory-filter-content">
          <div className="subcategory-search mb-3 position-relative">
            <input
              type="text"
              className="form-control"
              placeholder="Search subcategories..."
              value={searchSubcategory}
              onChange={(e) => setSearchSubcategory(e.target.value)}
            />
            <i className="bi bi-search position-absolute" style={{ 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6c757d'
            }}></i>
          </div>

          <div className="subcategory-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredSubcategories.map(subcategory => (
              <div key={subcategory} className="subcategory-item mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isSubcategorySelected(subcategory)}
                    onChange={() => handleSubcategoryChange(subcategory)}
                    id={`subcategory-${subcategory.replace(/\s+/g, '-')}`}
                  />
                  <label 
                    className="form-check-label d-flex justify-content-between" 
                    htmlFor={`subcategory-${subcategory.replace(/\s+/g, '-')}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>{subcategory}</span>
                    <span className="subcategory-count text-muted">
                      ({getSubcategoryProductCount(subcategory)})
                    </span>
                  </label>
                </div>
              </div>
            ))}
            {filteredSubcategories.length === 0 && (
              <div className="text-muted small">No subcategories found</div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Range Widget */}
      <div className="pricing-range-widget widget-item mb-4">
        <h3 className="widget-title">Price Range</h3>
        <div className="price-range-container">
          <div className="current-range mb-3">
            <span className="min-price fw-bold">${priceRange[0]}</span>
            <span className="mx-2">-</span>
            <span className="max-price fw-bold">${priceRange[1]}</span>
          </div>

          <div className="range-slider mb-3 position-relative" style={{ height: '20px' }}>
            <div className="slider-track position-absolute h-100 bg-light" style={{ 
              width: '100%',
              borderRadius: '10px'
            }}></div>
            <div className="slider-selected position-absolute h-100 bg-primary" style={{ 
              left: `${(priceRange[0] / 1000) * 100}%`,
              width: `${((priceRange[1] - priceRange[0]) / 1000) * 100}%`,
              borderRadius: '10px'
            }}></div>
            <input
              type="range"
              className="min-range position-absolute"
              min="0"
              max="1000"
              value={priceRange[0]}
              step="10"
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              style={{
                width: '100%',
                height: '20px',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 2
              }}
            />
            <input
              type="range"
              className="max-range position-absolute"
              min="0"
              max="1000"
              value={priceRange[1]}
              step="10"
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              style={{
                width: '100%',
                height: '20px',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 2
              }}
            />
          </div>

          <div className="price-inputs mt-3">
            <div className="row g-2">
              <div className="col-6">
                <div className="input-group input-group-sm">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control min-price-input"
                    placeholder="Min"
                    min="0"
                    max="1000"
                    value={priceRange[0] || 0}
                    step="10"
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="input-group input-group-sm">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control max-price-input"
                    placeholder="Max"
                    min="0"
                    max="1000"
                    value={priceRange[1] || 1000}
                    step="10"
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button 
              className="btn btn-primary btn-sm w-100 mt-2"
              onClick={handlePriceRangeApply}
            >
              Apply Price Range
            </button>
          </div>
        </div>
      </div>

      {/* Brand Filter Widget */}
      <div className="brand-filter-widget widget-item mb-4">
        <h3 className="widget-title">Filter by Brand</h3>
        <div className="brand-filter-content">
          <div className="brand-search mb-3 position-relative">
            <input
              type="text"
              className="form-control"
              placeholder="Search brands..."
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
            />
            <i className="bi bi-search position-absolute" style={{ 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6c757d'
            }}></i>
          </div>

          <div className="brand-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredBrands.map(brand => (
              <div key={brand._id} className="brand-item mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isBrandSelected(brand._id)}
                    onChange={() => handleBrandChange(brand._id)}
                    id={`brand-${brand._id}`}
                  />
                  <label 
                    className="form-check-label d-flex justify-content-between" 
                    htmlFor={`brand-${brand._id}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>{brand.name || 'Unnamed Brand'}</span>
                    <span className="brand-count text-muted">
                      ({brandProductCounts[brand._id] || 0})
                    </span>
                  </label>
                </div>
              </div>
            ))}
            {filteredBrands.length === 0 && (
              <div className="text-muted small">No brands found</div>
            )}
          </div>
        </div>
      </div>

      {/* Color Filter Widget */}
      <div className="color-filter-widget widget-item mb-4">
        <h3 className="widget-title">Filter by Color</h3>
        <div className="color-filter-content">
          <div className="color-search mb-3 position-relative">
            <input
              type="text"
              className="form-control"
              placeholder="Search colors..."
              value={searchColor}
              onChange={(e) => setSearchColor(e.target.value)}
            />
            <i className="bi bi-search position-absolute" style={{ 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6c757d'
            }}></i>
          </div>

          <div className="color-options d-flex flex-wrap gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredColors.map(color => (
              <div key={color.value} className="color-option">
                <input
                  className="form-check-input d-none"
                  type="checkbox"
                  checked={isColorSelected(color.value)}
                  onChange={() => handleColorChange(color.value)}
                  id={`color-${color.value}`}
                />
                <label 
                  className="form-check-label" 
                  htmlFor={`color-${color.value}`}
                  style={{ cursor: 'pointer' }}
                  title={color.name}
                >
                  <span
                    className={`color-swatch d-inline-block rounded-circle ${isColorSelected(color.value) ? 'selected' : ''}`}
                    style={{ 
                      width: '30px', 
                      height: '30px',
                      backgroundColor: color.hex,
                      border: isColorSelected(color.value) ? '2px solid #007bff' : '2px solid transparent',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  ></span>
                </label>
              </div>
            ))}
            {filteredColors.length === 0 && (
              <div className="text-muted small">No colors found</div>
            )}
          </div>
        </div>
      </div>

      {/* Size Filter Widget */}
      <div className="size-filter-widget widget-item mb-4">
        <h3 className="widget-title">Filter by Size</h3>
        <div className="size-filter-content">
          <div className="size-search mb-3 position-relative">
            <input
              type="text"
              className="form-control"
              placeholder="Search sizes..."
              value={searchSize}
              onChange={(e) => setSearchSize(e.target.value)}
            />
            <i className="bi bi-search position-absolute" style={{ 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6c757d'
            }}></i>
          </div>

          <div className="size-options d-flex flex-wrap gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredSizes.map(size => (
              <div key={size.value} className="size-option">
                <input
                  className="form-check-input d-none"
                  type="checkbox"
                  checked={isSizeSelected(size.value)}
                  onChange={() => handleSizeChange(size.value)}
                  id={`size-${size.value}`}
                />
                <label 
                  className="form-check-label" 
                  htmlFor={`size-${size.value}`}
                  style={{ cursor: 'pointer' }}
                >
                  <span
                    className={`size-chip ${isSizeSelected(size.value) ? 'selected' : ''}`}
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: isSizeSelected(size.value) ? '2px solid #007bff' : '1px solid #dee2e6',
                      backgroundColor: isSizeSelected(size.value) ? '#f8f9fa' : 'white',
                      color: isSizeSelected(size.value) ? '#007bff' : '#495057',
                      fontWeight: isSizeSelected(size.value) ? '600' : '400',
                      transition: 'all 0.2s'
                    }}
                  >
                    {size.name}
                  </span>
                </label>
              </div>
            ))}
            {filteredSizes.length === 0 && (
              <div className="text-muted small">No sizes found</div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Filter Widgets */}
      <div className="additional-filters widget-item mb-4">
        <h3 className="widget-title">Additional Filters</h3>
        <div className="additional-filters-content">
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="inStockOnly"
              checked={safeFilters.inStock === true}
              onChange={(e) => onFilterChange({ inStock: e.target.checked ? true : null })}
            />
            <label className="form-check-label" htmlFor="inStockOnly" style={{ cursor: 'pointer' }}>
              In Stock Only
            </label>
          </div>
          
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="featuredOnly"
              checked={safeFilters.featured === true}
              onChange={(e) => onFilterChange({ featured: e.target.checked ? true : null })}
            />
            <label className="form-check-label" htmlFor="featuredOnly" style={{ cursor: 'pointer' }}>
              Featured Only
            </label>
          </div>
          
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="onSaleOnly"
              checked={safeFilters.onSale === true}
              onChange={(e) => onFilterChange({ onSale: e.target.checked ? true : null })}
            />
            <label className="form-check-label" htmlFor="onSaleOnly" style={{ cursor: 'pointer' }}>
              On Sale Only
            </label>
          </div>
        </div>
      </div>

      {/* Clear All Filters Button */}
      <div className="widget-item">
        <button
          className="btn btn-outline-secondary w-100"
          onClick={handleClearAllClick}
          type="button"
        >
          <i className="bi bi-x-circle me-2"></i>
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;