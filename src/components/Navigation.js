// components/Header/Navigation.js
import React, { useState } from 'react';

const Navigation = ({ categories }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navItems = [
    { label: 'Home', href: '/', active: true },
    { label: 'About', href: '/about' },
    { label: 'All Categories', href: '/categories' },
    { label: 'Cart', href: '/cart' },
    { label: 'Contact', href: '/contact' }
  ];

  const handleDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };
 
  const renderDropdownItems = (items) => {
    return items.map((item, idx) => (
      <li key={idx} className={item.items ? 'dropdown' : ''}>
        <a href={item.href}>
          <span>{item.label}</span>
          {item.items && <i className="bi bi-chevron-down toggle-dropdown"></i>}
        </a>
        {item.items && (
          <ul>
            {renderDropdownItems(item.items)}
          </ul>
        )}
      </li>
    ));
  };

  // FIX: Extract categories array from props (could be direct array or nested in data)
  const getCategoriesArray = () => {
    if (Array.isArray(categories)) {
      return categories;
    }
    if (categories?.data && Array.isArray(categories.data)) {
      return categories.data;
    }
    if (categories?.categories && Array.isArray(categories.categories)) {
      return categories.categories;
    }
    return [];
  };
  
  const categoriesArray = getCategoriesArray();
  
  // Get parent categories (categories without parent)
  const parentCategories = categoriesArray.filter(cat => !cat.parent || cat.parent === null);

  // Get child categories for each parent
  const getChildCategories = (parentId) => {
    return categoriesArray.filter(cat => cat.parent === parentId);
  };

  // Helper function to generate category URL using slug
  const generateCategoryUrl = (category) => {
    if (!category) return '#';
    const slug = category.seo?.slug || category._id;
    return `/categories/${slug}`;
  };

  const renderMobileMegamenu = () => (
    <ul className="mobile-megamenu">
      {parentCategories.map(category => (
        <li key={category._id} className="dropdown">
          <a href="#">
            <span>{category.name}</span>
            <i className="bi bi-chevron-down toggle-dropdown"></i>
          </a>
          <ul>
            {getChildCategories(category._id).map(child => (
              <li key={child._id}>
                <a href={generateCategoryUrl(child)}>{child.name}</a>
              </li>
            ))}
            <li><a href={generateCategoryUrl(category)}>View all {category.name}</a></li>
          </ul>
        </li>
      ))}
    </ul>
  );

  const renderMegamenuContent = () => (
    <div className="desktop-megamenu">
      <div className="megamenu-tabs">
        <ul className="nav nav-tabs" id="allCategoriesMegaMenuTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button className="nav-link active" id="category-tab" data-bs-toggle="tab" data-bs-target="#category-content" type="button" aria-selected="true" role="tab">Categories</button>
          </li>
        </ul>
      </div>

      <div className="megamenu-content tab-content">
        <div className="tab-pane fade show active" id="category-content" role="tabpanel" aria-labelledby="category-tab">
          <div className="category-grid">
            {parentCategories.map(category => (
              <div className="category-column" key={category._id}>
                <h4>{category.name}</h4>
                <ul>
                  {getChildCategories(category._id).map(child => (
                    <li key={child._id}>
                      <a href={generateCategoryUrl(child)}>{child.name}</a>
                    </li>
                  ))}
                  <li><a href={generateCategoryUrl(category)}>View all {category.name}</a></li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="header-nav">
      <div className="container-fluid container-xl">
        <div className="position-relative">
          <nav id="navmenu" className="navmenu">
            <ul>
              {navItems.map((item, index) => (
                <li 
                  key={index}
                  className={`
                    ${item.active ? 'active' : ''}
                    ${item.dropdown ? 'dropdown' : ''}
                    ${item.megamenu ? 'products-megamenu-1' : ''}
                  `}
                >
                  <a 
                    href={item.href}
                    onClick={(e) => {
                      if (item.dropdown || item.megamenu) {
                        e.preventDefault();
                        handleDropdownToggle(index);
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    {(item.dropdown || item.megamenu) && (
                      <i className="bi bi-chevron-down toggle-dropdown"></i>
                    )}
                  </a>
                  
                  {item.dropdown && item.items && activeDropdown === index && (
                    <ul>
                      {renderDropdownItems(item.items)}
                    </ul>
                  )}
                  
                  {item.megamenu && activeDropdown === index && (
                    <>
                      {renderMobileMegamenu()}
                      {renderMegamenuContent()}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navigation;