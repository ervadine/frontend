import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import { 
  getAllProducts, 
  selectProducts, 
  selectLoading,
  selectFilters
} from '../store/redux/productSlice';
import { 
  fetchCategories, 
  selectCategories,
  selectLoadingStates as selectCategoryLoading 
} from '../store/redux/categorySlice';

const ProductList = ({ addToCart, toggleWishlist, cartLoading, wishlistLoading }) => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const loading = useSelector(selectLoading);
  const categoriesRaw = useSelector(selectCategories);
  const categoryLoading = useSelector(selectCategoryLoading);
  const filters = useSelector(selectFilters);

  const [activeFilter, setActiveFilter] = useState('*');
  const [sortBy, setSortBy] = useState('featured');

  // FIX: Extract categories array safely
  const getCategoriesArray = () => {
    if (!categoriesRaw) return [];
    if (Array.isArray(categoriesRaw)) return categoriesRaw;
    if (categoriesRaw.data && Array.isArray(categoriesRaw.data)) return categoriesRaw.data;
    if (categoriesRaw.categories && Array.isArray(categoriesRaw.categories)) return categoriesRaw.categories;
    return [];
  };

  const categories = getCategoriesArray();

  // Fetch products and categories on component mount
  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Helper function to get category utils
  const categoryUtils = useMemo(() => ({
    getParentCategories: () => {
      return categories.filter(cat => !cat.parent || cat.parent === null);
    },
    getProductsInCategory: (categoryId, includeChildren = false) => {
      if (includeChildren) {
        const getChildCategoryIds = (catId) => {
          const children = categories.filter(cat => cat.parent === catId);
          let allIds = [catId];
          children.forEach(child => {
            allIds = [...allIds, ...getChildCategoryIds(child._id)];
          });
          return allIds;
        };

        const categoryIds = getChildCategoryIds(categoryId);
        return products.filter(product => 
          categoryIds.includes(product.category?._id || product.category)
        );
      }
      
      return products.filter(product => 
        product.category?._id === categoryId || product.category === categoryId
      );
    }
  }), [categories, products]);

  // Helper function to get min price from product colors
  const getMinPriceFromProduct = (product) => {
    if (product.priceRange?.min) {
      return product.priceRange.min;
    }
    
    if (product.colors?.availableColors && Array.isArray(product.colors.availableColors)) {
      const prices = product.colors.availableColors
        .map(color => color.price)
        .filter(price => price != null && typeof price === 'number');
      
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    
    return product.price || 0;
  };

  // Generate product URL
  const generateProductUrl = (product) => {
    return `/product/${product._id}`;
  };

  // Create filters based on actual categories
  const filtersList = useMemo(() => {
    const mainFilters = [
      { key: '*', label: 'All Products', count: products.length }
    ];

    if (categoryLoading?.categories || !categories.length) {
      return mainFilters;
    }

    const parentCategories = categoryUtils.getParentCategories();
    
    const categoryFilters = parentCategories.map(category => {
      const productsInCategory = categoryUtils.getProductsInCategory(category._id, true);
      return {
        key: category.seo?.slug || category._id,
        label: category.name,
        count: productsInCategory.length,
        sex: category.sex
      };
    }).filter(category => category.count > 0);

    return [...mainFilters, ...categoryFilters];
  }, [products, categories, categoryUtils, categoryLoading]);

  // Helper function to get category slug for filtering
  const getProductCategorySlug = (product) => {
    const productCategory = categories.find(cat => 
      cat._id === (product.category?._id || product.category)
    );
    
    if (!productCategory) return 'other';

    if (!productCategory.parent || productCategory.parent === null) {
      return productCategory.seo?.slug || productCategory._id;
    }

    const parentCategory = categories.find(cat => cat._id === productCategory.parent);
    return parentCategory ? (parentCategory.seo?.slug || parentCategory._id) : (productCategory.seo?.slug || productCategory._id);
  };

  // Filter products based on active category
  const filteredProducts = useMemo(() => {
    if (activeFilter === '*') return products;

    const category = categories.find(cat => 
      (cat.seo?.slug === activeFilter) || (cat._id === activeFilter)
    );
    
    if (!category) return products;

    return categoryUtils.getProductsInCategory(category._id, true);
  }, [products, activeFilter, categories, categoryUtils]);

  // Sort products using min price from colors
  const sortedAndFilteredProducts = useMemo(() => {
    let sortedProducts = [...filteredProducts];

    switch (sortBy) {
      case 'price-low-high':
        sortedProducts.sort((a, b) => getMinPriceFromProduct(a) - getMinPriceFromProduct(b));
        break;
      case 'price-high-low':
        sortedProducts.sort((a, b) => getMinPriceFromProduct(b) - getMinPriceFromProduct(a));
        break;
      case 'name-a-z':
        sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-z-a':
        sortedProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'rating':
        sortedProducts.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        break;
      case 'newest':
        sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'featured':
      default:
        sortedProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return (b.salesCount || 0) - (a.salesCount || 0);
        });
        break;
    }

    return sortedProducts;
  }, [filteredProducts, sortBy]);

  // Generate category URL for "View All" link
  const getCategoryUrl = (categorySlug) => {
    if (categorySlug === '*') return '/products';
    return `/categories/${categorySlug}`;
  };

  // Loading state
  if (loading || categoryLoading?.categories) {
    return (
      <section id="product-list" className="product-list section">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="product-list" className="product-list section ">
      <div className="container isotope-layout" data-aos="fade-up" data-aos-delay="100">
        
        {/* Section Title */}
        <div className="section-title mb-5">
          <h2>All Products</h2>
          <p>Browse our complete collection of high-quality products</p>
        </div>

        {/* Controls Row */}
        <div className="row mb-4">
          <div className="col-md-8">
            {/* Category Filters */}
            <div className="product-filters isotope-filters" data-aos="fade-up">
              <ul className="d-flex flex-wrap gap-2 list-unstyled">
                {filtersList.map(filter => (
                  <li 
                    key={filter.key}
                    className={`filter-item ${activeFilter === filter.key ? 'filter-active' : ''}`}
                    data-filter={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                  >
                    {filter.label}
                    <span className="filter-count">({filter.count})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="col-md-4">
            {/* Sort Dropdown */}
            <div className="sort-dropdown" data-aos="fade-up">
              <select 
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-a-z">Name: A to Z</option>
                <option value="name-z-a">Name: Z to A</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="results-info" data-aos="fade-up">
              <p className="text-muted mb-0">
                Showing {sortedAndFilteredProducts.length} of {products.length} products
                {activeFilter !== '*' && (
                  <span className="ms-2">
                    in <strong>{filtersList.find(f => f.key === activeFilter)?.label}</strong>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="row product-container isotope-container">
          {sortedAndFilteredProducts.map((product, index) => (
            <div 
              key={product._id} 
              className={`col-lg-3 col-md-3 col-xs-3 product-item isotope-item ${getProductCategorySlug(product)}`}
              data-aos="fade-up" 
              data-aos-delay={index * 100}
            >
              <ProductCard 
                product={product}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                productUrl={generateProductUrl(product)}
                cartLoading={cartLoading}
                wishlistLoading={wishlistLoading}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedAndFilteredProducts.length === 0 && (
          <div className="text-center py-5" data-aos="fade-up">
            <div className="empty-state">
              <i className="bi bi-search display-1 text-muted"></i>
              <h4 className="mt-3">No products found</h4>
              <p className="text-muted">
                {activeFilter === '*' 
                  ? "There are no products available at the moment." 
                  : `No products found in ${filtersList.find(f => f.key === activeFilter)?.label}.`}
              </p>
              {activeFilter !== '*' && (
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => setActiveFilter('*')}
                >
                  View All Products
                </button>
              )}
            </div>
          </div>
        )}

        {/* Load More / View All */}
        {sortedAndFilteredProducts.length > 0 && (
          <div className="text-center mt-5" data-aos="fade-up">
            <a href={getCategoryUrl(activeFilter)} className="view-all-btn">
              View All {activeFilter !== '*' ? filtersList.find(f => f.key === activeFilter)?.label : 'Products'} 
              <i className="bi bi-arrow-right"></i>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;