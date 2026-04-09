import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/category/ProductCard';
import FilterSidebar from '../components/category/FilterSidebar';
import CategoryHeader from '../components/category/CategoryHeader';
import Pagination from '../components/Pagination';

import {  
  getAllProducts,
  getProductsByBrands,
  selectProducts,
  selectPagination,
  selectLoading,
  selectError,
  clearError
} from '../store/redux/productSlice';
import { 
  fetchCategories,
  selectCategories
} from '../store/redux/categorySlice';
import { 
  fetchBrands,
  selectBrands 
} from '../store/redux/brandSlice';
import { selectCartItemCount } from '../store/redux/cartSlice';

import { 
  addToWishlist, 
  removeFromWishlist, 
  selectWishlist,
  selectIsInWishlist,
  selectIsLoading,
} from '../store/redux/authSlice';


const CategoryPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const searchParams = new URLSearchParams(location.search);
  const categorySlug = searchParams.get('slug');
  const categoryId = searchParams.get('category');
  const categorySlugParam = searchParams.get('categorySlug');
  const brandId = searchParams.get('brand');
  
  const subcategoryParam = searchParams.get('subcategory');
  const subcategoryArrayParam = searchParams.getAll('subcategory[]');
  
  const products = useSelector(selectProducts);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const categories = useSelector(selectCategories);
  const brands = useSelector(selectBrands);
  const cartCount = useSelector(selectCartItemCount);
  
  // Wishlist selectors
  const wishlist = useSelector(selectWishlist);
  const wishlistLoading = useSelector(selectIsLoading);
  
  // Helper function to check if a product is in wishlist
  const checkIsInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item._id === productId);
  }, [wishlist]);
  
  const [currentCategory, setCurrentCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevSlugRef = useRef(slug);
  const prevParamsRef = useRef('');
  
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [brandProductCounts, setBrandProductCounts] = useState({});
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minPrice: null,
    maxPrice: null,
    inStock: null,
    featured: null,
    onSale: null,
    search: '',
    selectedBrands: [],
    selectedSizes: [],
    selectedCategories: [],
    selectedSubcategories: [],
    viewMode: 'grid',
    itemsPerPage: 12
  });

  // Wishlist handlers
  const handleAddToWishlist = useCallback(async (productId) => {
    try {
      await dispatch(addToWishlist(productId)).unwrap();
      // Optional: Show success toast/notification
      console.log('Product added to wishlist successfully');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      // Optional: Show error toast/notification
    }
  }, [dispatch]);

  const handleRemoveFromWishlist = useCallback(async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      // Optional: Show success toast/notification
      console.log('Product removed from wishlist successfully');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      // Optional: Show error toast/notification
    }
  }, [dispatch]);

  const handleWishlistToggle = useCallback(async (productId, e) => {
    // Stop event propagation to prevent card click if needed
    if (e) {
      e.stopPropagation();
    }
    
    const isCurrentlyInWishlist = checkIsInWishlist(productId);
    
    if (isCurrentlyInWishlist) {
      await handleRemoveFromWishlist(productId);
    } else {
      await handleAddToWishlist(productId);
    }
  }, [checkIsInWishlist, handleAddToWishlist, handleRemoveFromWishlist]);

  // FIXED: Added useEffect to update currentCategory when slug changes
  useEffect(() => {
    if (slug || categorySlug) {
      const foundCategory = findCategoryBySlug(slug || categorySlug);
      setCurrentCategory(foundCategory);
      
      // Update selectedCategories to include current category if not already included
      if (foundCategory && !filters.selectedCategories.includes(foundCategory._id)) {
        setFilters(prev => ({
          ...prev,
          selectedCategories: [foundCategory._id]
        }));
      }
    }
  }, [slug, categorySlug, categories]);

  const getAllValidSubcategories = () => {
    const subcategories = new Set();
    
    if (products && Array.isArray(products)) {
      products.forEach(product => {
        if (product.subcategory) {
          if (Array.isArray(product.subcategory)) {
            product.subcategory.forEach(sub => {
              if (sub && typeof sub === 'string') {
                subcategories.add(sub.trim());
              }
            });
          } else if (typeof product.subcategory === 'string') {
            subcategories.add(product.subcategory.trim());
          }
        }
      });
    }
    
    if (subcategories.size === 0) {
      return [
        'T-Shirts', 'Polos', 'Dress Shirts', 'Casual Shirts',
        'Jeans', 'Chinos', 'Dress Pants', 'Shorts',
        'Jackets', 'Coats', 'Sweaters', 'Hoodies',
        'Dresses', 'Skirts', 'Blouses', 'Tops',
        'Sneakers', 'Boots', 'Loafers', 'Sandals'
      ];
    }
    
    return Array.from(subcategories).sort();
  };

  const getAvailableSubcategories = useCallback(() => {
    const subcategories = new Set();
    
    if (products && Array.isArray(products)) {
      products.forEach(product => {
        if (product.subcategory) {
          if (Array.isArray(product.subcategory)) {
            product.subcategory.forEach(sub => {
              if (sub && typeof sub === 'string') {
                subcategories.add(sub.trim());
              }
            });
          } else if (typeof product.subcategory === 'string') {
            subcategories.add(product.subcategory.trim());
          }
        }
      });
    }
    
    return Array.from(subcategories).sort();
  }, [products]);

  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.includes('/category/slug/')) {
      const extractedSlug = path.replace('/category/slug/', '');
      const cleanSlug = extractedSlug.replace(/\/$/, '');
      navigate(`/category/${cleanSlug}`, { replace: true });
      return;
    }

    if (path.startsWith('/category/') && !slug) {
      const pathParts = path.split('/');
      const possibleSlug = pathParts[2];
      
      if (possibleSlug && possibleSlug !== 'categories') {
        navigate(`/category/${possibleSlug}`, { replace: true });
      }
    }
  }, [navigate, slug]);

  useEffect(() => {
    if (!isInitialLoad) return;
    
    const selectedSubcategories = [];
    
    if (subcategoryParam) {
      selectedSubcategories.push(subcategoryParam);
    }
    
    if (subcategoryArrayParam && subcategoryArrayParam.length > 0) {
      subcategoryArrayParam.forEach(sub => {
        if (!selectedSubcategories.includes(sub)) {
          selectedSubcategories.push(sub);
        }
      });
    }
    
    if (selectedSubcategories.length > 0) {
      setFilters(prev => ({
        ...prev,
        selectedSubcategories
      }));
    }
  }, [isInitialLoad, subcategoryParam, subcategoryArrayParam]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (products && brands) {
      const counts = {};
      brands.forEach(brand => {
        if (brand._id) {
          const brandProducts = products.filter(product => 
            product.brand && product.brand._id === brand._id
          );
          counts[brand._id] = brandProducts.length;
        }
      });
      setBrandProductCounts(counts);
    }
  }, [products, brands]);

  useEffect(() => {
    if (!products || products.length === 0) {
      setAvailableColors([]);
      return;
    }

    const colorMap = new Map();

    products.forEach(product => {
      if (product.colors?.availableColors) {
        product.colors.availableColors.forEach(color => {
          if (color.value && !colorMap.has(color.value)) {
            colorMap.set(color.value, {
              value: color.value,
              name: color.name || color.value,
              hex: color.hexCode || '#CCCCCC'
            });
          }
        });
      }
    });

    setAvailableColors(Array.from(colorMap.values()));
  }, [products]);

  const findCategoryBySlug = useCallback((categorySlug) => {
    if (!categorySlug || !categories || categories.length === 0) {
      return null;
    }
    
    let category = categories.find(cat => 
      cat.seo?.slug === categorySlug || 
      cat.slug === categorySlug ||
      cat.name?.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase()
    );
    
    if (!category) {
      category = categories.find(cat => 
        cat.seo?.slug?.toLowerCase() === categorySlug.toLowerCase() ||
        cat.slug?.toLowerCase() === categorySlug.toLowerCase() ||
        cat.name?.toLowerCase() === categorySlug.toLowerCase().replace(/-/g, ' ')
      );
    }
    
    return category;
  }, [categories]);

  const buildApiParams = useCallback((customFilters = null) => {
    const filterObj = customFilters || filters;
    const apiParams = {
      page: filterObj.page,
      limit: filterObj.limit,
      sortBy: filterObj.sortBy,
      sortOrder: filterObj.sortOrder
    };

    if (filterObj.minPrice !== null && filterObj.minPrice !== undefined) {
      apiParams.minPrice = filterObj.minPrice;
    }
    
    if (filterObj.maxPrice !== null && filterObj.maxPrice !== undefined) {
      apiParams.maxPrice = filterObj.maxPrice;
    }
    
    if (filterObj.inStock !== null) {
      apiParams.inStock = filterObj.inStock;
    }
    
    if (filterObj.featured !== null) {
      apiParams.featured = filterObj.featured;
    }
    
    if (filterObj.onSale !== null) {
      apiParams.onSale = filterObj.onSale;
    }
    
    if (filterObj.search) {
      apiParams.search = filterObj.search;
    }
    
    if (filterObj.selectedSizes && filterObj.selectedSizes.length > 0) {
      apiParams.sizes = filterObj.selectedSizes.join(',');
    }
    
    if (filterObj.selectedBrands && Array.isArray(filterObj.selectedBrands) && filterObj.selectedBrands.length > 0) {
      apiParams.brandIds = filterObj.selectedBrands;
    }
    
    if (filterObj.selectedCategories && Array.isArray(filterObj.selectedCategories) && filterObj.selectedCategories.length > 0) {
      apiParams.categories = filterObj.selectedCategories.join(',');
    }
    
    if (filterObj.selectedSubcategories && filterObj.selectedSubcategories.length > 0) {
      apiParams.subcategories = filterObj.selectedSubcategories.join(',');
    }

    return apiParams;
  }, [filters]);

  const getActiveFilters = useCallback(() => {
    const activeFilters = [];
    
    // Category filters - FIXED: Properly handle category selection
    if (filters.selectedCategories && Array.isArray(filters.selectedCategories) && filters.selectedCategories.length > 0) {
      filters.selectedCategories.forEach(categoryId => {
        const category = categories.find(c => c._id === categoryId);
        if (category) {
          activeFilters.push({
            type: 'category',
            value: categoryId,
            label: category.name
          });
        }
      });
    } else if (currentCategory && (!filters.selectedCategories || filters.selectedCategories.length === 0)) {
      // If we have a current category but no selected categories, still show it
      activeFilters.push({
        type: 'category',
        value: currentCategory._id,
        label: currentCategory.name
      });
    }
    
    // Subcategory filters
    if (filters.selectedSubcategories && Array.isArray(filters.selectedSubcategories) && filters.selectedSubcategories.length > 0) {
      filters.selectedSubcategories.forEach(subcategory => {
        activeFilters.push({
          type: 'subcategory',
          value: subcategory,
          label: `Subcategory: ${subcategory}`
        });
      });
    }
    
    // Brand filters
    if (filters.selectedBrands && Array.isArray(filters.selectedBrands) && filters.selectedBrands.length > 0) {
      filters.selectedBrands.forEach(brandId => {
        const brand = brands.find(b => b._id === brandId);
        if (brand) {
          activeFilters.push({
            type: 'brand',
            value: brandId,
            label: brand.name
          });
        }
      });
    }
    
    // Size filters
    if (filters.selectedSizes && Array.isArray(filters.selectedSizes) && filters.selectedSizes.length > 0) {
      filters.selectedSizes.forEach(size => {
        const sizeObj = availableSizes.find(s => s.value === size);
        activeFilters.push({
          type: 'size',
          value: size,
          label: sizeObj ? sizeObj.name : size
        });
      });
    }
    
    // Search filter
    if (filters.search) {
      activeFilters.push({
        type: 'search',
        value: filters.search,
        label: `Search: ${filters.search}`
      });
    }
    
    // Price filter
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || '∞';
      activeFilters.push({
        type: 'price',
        value: 'price',
        label: `Price: $${min} - $${max}`
      });
    }
    
    // Stock filter
    if (filters.inStock !== null) {
      activeFilters.push({
        type: 'inStock',
        value: 'inStock',
        label: filters.inStock ? 'In Stock Only' : 'Out of Stock'
      });
    }
    
    // Featured filter
    if (filters.featured !== null) {
      activeFilters.push({
        type: 'featured',
        value: 'featured',
        label: filters.featured ? 'Featured Only' : 'Not Featured'
      });
    }
    
    // On Sale filter
    if (filters.onSale !== null) {
      activeFilters.push({
        type: 'onSale',
        value: 'onSale',
        label: filters.onSale ? 'On Sale Only' : 'Not on Sale'
      });
    }

    return activeFilters;
  }, [filters, categories, brands, availableSizes, currentCategory]);

  const fetchProductsByBrands = useCallback(async (brandIds, params = {}) => {
    if (!brandIds || brandIds.length === 0) return null;
    
    try {
      const result = await dispatch(getProductsByBrands({ 
        brandIds,
        params
      })).unwrap();
      
      return result;
    } catch (error) {
      console.error('Error fetching brand products:', error);
      return null;
    }
  }, [dispatch]);

  const fetchAllProductsWithFilters = useCallback(async (params = {}) => {
    try {
      const result = await dispatch(getAllProducts(params)).unwrap();
      return result;
    } catch (error) {
      console.error('Error fetching all products:', error);
      return null;
    }
  }, [dispatch]);

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data...');
      
      dispatch(clearError());
      
      const initialParams = {
        ...filters,
        page: 1
      };
      
      if (categorySlug || slug) {
        initialParams.slug = categorySlug || slug;
      } else if (categoryId) {
        initialParams.category = categoryId;
      } else if (brandId) {
        initialParams.brand = brandId;
      }
      
      if (categorySlug || slug) {
        const foundCategory = findCategoryBySlug(categorySlug || slug);
        setCurrentCategory(foundCategory);
      } else if (categoryId && categories) {
        const foundCategory = categories.find(cat => cat._id === categoryId);
        setCurrentCategory(foundCategory);
      } else {
        setCurrentCategory(null);
      }
      
      await fetchAllProductsWithFilters(initialParams);
      setIsInitialLoad(false);
    };

    if (isInitialLoad) {
      loadData();
    }
  }, [isInitialLoad, dispatch, findCategoryBySlug, fetchAllProductsWithFilters, filters, categories, slug, categorySlug, categoryId, categorySlugParam, brandId]);

  useEffect(() => {
    if (!products) {
      setFilteredProducts([]);
      return;
    }

    let productsArray = [];
    
    if (Array.isArray(products)) {
      productsArray = products;
    } else if (products && typeof products === 'object') {
      const hasNumericKeys = Object.keys(products).some(key => !isNaN(key));
      
      if (hasNumericKeys) {
        productsArray = Object.values(products);
      } else if (products.data && Array.isArray(products.data)) {
        productsArray = products.data;
      }
    }
    
    productsArray = productsArray.filter(item => 
      item && 
      item._id && 
      !item.filterMetadata && 
      !item.filters
    );

    if (productsArray.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...productsArray];

    // Apply category filtering - FIXED: Added category filtering logic
    if (filters.selectedCategories && Array.isArray(filters.selectedCategories) && filters.selectedCategories.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.category) return false;
        
        return filters.selectedCategories.includes(product.category._id || product.category);
      });
    }

    // Apply subcategory filtering
    if (filters.selectedSubcategories && Array.isArray(filters.selectedSubcategories) && filters.selectedSubcategories.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.subcategory) return false;
        
        const productSubcategories = Array.isArray(product.subcategory) 
          ? product.subcategory 
          : [product.subcategory];
        
        return filters.selectedSubcategories.some(selectedSubcategory =>
          productSubcategories.some(productSubcategory =>
            productSubcategory?.toLowerCase() === selectedSubcategory.toLowerCase()
          )
        );
      });
    }

    if (filters.minPrice !== null || filters.maxPrice !== null) {
      filtered = filtered.filter(product => {
        const minPrice = product.priceRange?.min || product.displayPrice || product.price || 0;
        const productPrice = minPrice;
        
        if (filters.minPrice !== null && productPrice < filters.minPrice) return false;
        if (filters.maxPrice !== null && productPrice > filters.maxPrice) return false;
        return true;
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        (product.category?.name && product.category.name.toLowerCase().includes(searchTerm)) ||
        (product.brand?.name && product.brand.name.toLowerCase().includes(searchTerm)) ||
        (product.subcategory && (
          (Array.isArray(product.subcategory) && 
           product.subcategory.some(sub => sub?.toLowerCase().includes(searchTerm))) ||
          (typeof product.subcategory === 'string' && 
           product.subcategory.toLowerCase().includes(searchTerm))
        ))
      );
    }
    
    if (filters.inStock !== null) {
      filtered = filtered.filter(product => 
        filters.inStock ? product.inStock === true : product.inStock === false
      );
    }
    
    if (filters.featured !== null) {
      filtered = filtered.filter(product => 
        filters.featured ? product.isFeatured === true : product.isFeatured === false
      );
    }
    
    if (filters.onSale !== null) {
      filtered = filtered.filter(product => 
        filters.onSale ? product.hasDiscount === true : product.hasDiscount === false
      );
    }

    if (filters.selectedSizes && Array.isArray(filters.selectedSizes) && filters.selectedSizes.length > 0) {
      filtered = filtered.filter(product => {
        const productSizes = [];
        
        if (product.sizeConfig?.availableSizes) {
          product.sizeConfig.availableSizes.forEach(size => {
            productSizes.push(size.value);
          });
        }
        
        if (product.variants) {
          product.variants.forEach(variant => {
            if (variant.size?.value) {
              productSizes.push(variant.size.value);
            }
          });
        }
        
        return filters.selectedSizes.some(selectedSize => 
          productSizes.includes(selectedSize)
        );
      });
    }

    if (filters.selectedBrands && Array.isArray(filters.selectedBrands) && filters.selectedBrands.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.brand) return false;
        return filters.selectedBrands.includes(product.brand._id);
      });
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterChange = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    
    // FIXED: When clearing categories, also clear currentCategory
    if (newFilters.selectedCategories && newFilters.selectedCategories.length === 0) {
      setCurrentCategory(null);
    }
    
    setFilters(updatedFilters);
    setCurrentPage(1);
    
    const fetchWithNewFilters = async () => {
      dispatch(clearError());
      
      const apiParams = buildApiParams(updatedFilters);
      
      if (updatedFilters.selectedBrands && updatedFilters.selectedBrands.length > 0) {
        await fetchProductsByBrands(updatedFilters.selectedBrands, apiParams);
      } else {
        await fetchAllProductsWithFilters(apiParams);
      }
    };
    
    fetchWithNewFilters();
  }, [filters, dispatch, buildApiParams, fetchProductsByBrands, fetchAllProductsWithFilters]);

  const handleSidebarFilterChange = useCallback((sidebarFilters) => {
    const updatedFilters = { 
      ...filters, 
      ...sidebarFilters,
      page: 1 
    };
    
    // FIXED: When clearing categories, also clear currentCategory
    if (sidebarFilters.selectedCategories && sidebarFilters.selectedCategories.length === 0) {
      setCurrentCategory(null);
    }
    
    setFilters(updatedFilters);
    setCurrentPage(1);
    
    const fetchWithNewFilters = async () => {
      dispatch(clearError());
      
      const apiParams = buildApiParams(updatedFilters);
      
      if (updatedFilters.selectedBrands && updatedFilters.selectedBrands.length > 0) {
        await fetchProductsByBrands(updatedFilters.selectedBrands, apiParams);
      } else {
        await fetchAllProductsWithFilters(apiParams);
      }
    };
    
    fetchWithNewFilters();
  }, [filters, dispatch, buildApiParams, fetchProductsByBrands, fetchAllProductsWithFilters]);

  const clearAllFilters = useCallback(() => {
    console.log('clearAllFilters called in CategoryPage');
    
    if (slug || categorySlug || categoryId) {
      navigate('/categories');
      return;
    }
    
    const resetFilters = {
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      minPrice: null,
      maxPrice: null,
      inStock: null,
      featured: null,
      onSale: null,
      search: '',
      selectedBrands: [],
      selectedSizes: [],
      selectedCategories: [],
      selectedSubcategories: [],
      viewMode: 'grid',
      itemsPerPage: 12
    };
    
    setFilters(resetFilters);
    setCurrentPage(1);
    setCurrentCategory(null);
    
    const fetchWithResetFilters = async () => {
      dispatch(clearError());
      
      const apiParams = buildApiParams(resetFilters);
      console.log('Fetching with reset filters:', apiParams);
      
      try {
        await fetchAllProductsWithFilters(apiParams);
      } catch (error) {
        console.error('Error fetching products after clearing filters:', error);
      }
    };
    
    fetchWithResetFilters();
  }, [slug, categorySlug, categoryId, navigate, dispatch, buildApiParams, fetchAllProductsWithFilters]);

  const handlePageChange = useCallback((page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    setCurrentPage(page);
    
    const fetchForPage = async () => {
      dispatch(clearError());
      
      const apiParams = buildApiParams(updatedFilters);
      
      if (filters.selectedBrands && filters.selectedBrands.length > 0) {
        await fetchProductsByBrands(filters.selectedBrands, apiParams);
      } else {
        await fetchAllProductsWithFilters(apiParams);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    fetchForPage();
  }, [filters, dispatch, buildApiParams, fetchProductsByBrands, fetchAllProductsWithFilters]);

  const handleClearFilter = useCallback((filterType, value) => {
    let newFilters = { ...filters, page: 1 };
    
    switch (filterType) {
      case 'brand':
        newFilters.selectedBrands = (newFilters.selectedBrands || []).filter(id => id !== value);
        break;
      case 'size':
        newFilters.selectedSizes = (newFilters.selectedSizes || []).filter(size => size !== value);
        break;
      case 'category':
        newFilters.selectedCategories = (newFilters.selectedCategories || []).filter(id => id !== value);
        // FIXED: Also clear currentCategory if the cleared category was the current one
        if (currentCategory && currentCategory._id === value) {
          setCurrentCategory(null);
        }
        break;
      case 'subcategory':
        newFilters.selectedSubcategories = (newFilters.selectedSubcategories || []).filter(sub => sub !== value);
        break;
      case 'price':
        newFilters.minPrice = null;
        newFilters.maxPrice = null;
        break;
      case 'search':
        newFilters.search = '';
        break;
      case 'inStock':
        newFilters.inStock = null;
        break;
      case 'featured':
        newFilters.featured = null;
        break;
      case 'onSale':
        newFilters.onSale = null;
        break;
      default:
        return;
    }
    
    setFilters(newFilters);
    setCurrentPage(1);
    
    const fetchWithUpdatedFilters = async () => {
      dispatch(clearError());
      
      const apiParams = buildApiParams(newFilters);
      
      if (newFilters.selectedBrands && newFilters.selectedBrands.length > 0) {
        await fetchProductsByBrands(newFilters.selectedBrands, apiParams);
      } else {
        await fetchAllProductsWithFilters(apiParams);
      }
    };
    
    fetchWithUpdatedFilters();
  }, [filters, dispatch, buildApiParams, fetchProductsByBrands, fetchAllProductsWithFilters, currentCategory]);

  const getPageTitle = () => {
    if (currentCategory) {
      return currentCategory.name;
    }
    if (brandId && brands.length > 0) {
      const brand = brands.find(b => b._id === brandId);
      return brand ? `${brand.name} Products` : 'Brand Products';
    }
    if (categorySlug || slug || categoryId) {
      return 'Products';
    }
    return "All Products";
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', url: '/' }
    ];

    if (currentCategory) {
      breadcrumbs.push({
        label: currentCategory.name,
        url: `/products?slug=${currentCategory.seo?.slug || currentCategory.slug || slug}`
      });
    } else if (brandId && brands.length > 0) {
      const brand = brands.find(b => b._id === brandId);
      if (brand) {
        breadcrumbs.push({
          label: brand.name,
          url: `/products?brand=${brandId}`
        });
      }
    } else if (categorySlug || slug || categoryId) {
      breadcrumbs.push({
        label: 'Products',
        url: '/products'
      });
    } else {
      breadcrumbs.push({
        label: 'All Products',
        url: '/products'
      });
    }

    return breadcrumbs;
  };

  // Enhance products with wishlist status before passing to ProductCard
  const productsWithWishlistStatus = filteredProducts.map(product => ({
    ...product,
    isInWishlist: checkIsInWishlist(product._id),
    wishlistLoading: wishlistLoading
  }));

  if (loading && isInitialLoad) {
    return (
      <div className="category-page">
        <Header 
          cartCount={cartCount}
          categories={categories}
        />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <Header 
          cartCount={cartCount}
          categories={categories}
        />
        <div className="container py-5 text-center">
          <div className="alert alert-danger">
            <h4>Error loading products</h4>
            <p>{error}</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="category-page">
      <Header 
        cartCount={cartCount}
        categories={categories}
      />
      
      <main className="main">
        <div className="page-title light-background py-4">
          <div className="container d-lg-flex justify-content-between align-items-center">
            <h1 className="mb-2 mb-lg-0">{getPageTitle()}</h1>
            <nav className="breadcrumbs">
              <ol className="breadcrumb mb-0">
                {getBreadcrumbs().map((crumb, index) => (
                  <li 
                    key={index} 
                    className={`breadcrumb-item ${index === getBreadcrumbs().length - 1 ? 'active' : ''}`}
                  >
                    {index === getBreadcrumbs().length - 1 ? (
                      <span>{crumb.label}</span>
                    ) : (
                      <Link to={crumb.url}>{crumb.label}</Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        <div className="container py-4">
          <div className="row">
            <div className="col-lg-3 sidebar">
              <FilterSidebar 
                filters={{
                  priceRange: filters.minPrice !== null || filters.maxPrice !== null 
                    ? [filters.minPrice || 0, filters.maxPrice || 1000] 
                    : [0, 1000],
                  selectedSizes: filters.selectedSizes || [],
                  selectedBrands: filters.selectedBrands || [],
                  selectedCategories: filters.selectedCategories || (currentCategory ? [currentCategory._id] : []),
                  selectedSubcategories: filters.selectedSubcategories || [],
                  selectedColors: [], // Ensure this is always an array
                  searchTerm: filters.search || '',
                  inStock: filters.inStock,
                  featured: filters.featured,
                  onSale: filters.onSale
                }}
                onFilterChange={handleSidebarFilterChange}
                onClearAll={clearAllFilters}
                categories={categories}
                brands={brands}
                currentCategory={currentCategory}
                availableSizes={availableSizes}
                availableColors={availableColors}
                brandProductCounts={brandProductCounts}
                availableSubcategories={getAvailableSubcategories()}
                allValidSubcategories={getAllValidSubcategories()}
              />
            </div>

            <div className="col-lg-9">
              <CategoryHeader 
                filters={filters}
                onFilterChange={handleFilterChange}
                activeFilters={getActiveFilters()}
                onClearFilter={handleClearFilter}
                onClearAll={clearAllFilters}
                totalProducts={filteredProducts.length}
                totalAllProducts={products?.length || 0}
                availableSubcategories={getAvailableSubcategories()}
              />

              <section id="category-product-list" className="category-product-list section">
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading products...</p>
                    </div>
                  ) : (
                    (() => {
                      let productsToCheck = products;
                      
                      if (products && typeof products === 'object' && !Array.isArray(products)) {
                        if (products.data && Array.isArray(products.data)) {
                          productsToCheck = products.data;
                        } else {
                          const keys = Object.keys(products);
                          if (keys.length === 0) {
                            productsToCheck = [];
                          } else {
                            const hasProducts = keys.some(key => 
                              products[key] && products[key]._id && !products[key].filterMetadata
                            );
                            productsToCheck = hasProducts ? Object.values(products) : [];
                          }
                        }
                      }
                      
                      const hasProducts = Array.isArray(productsToCheck) && 
                                        productsToCheck.length > 0 && 
                                        productsToCheck.some(item => item && item._id);
                      
                      const hasFilteredProducts = filteredProducts.length > 0;
                      
                      if (!hasProducts && !hasFilteredProducts) {
                        return (
                          <div className="col-12 text-center py-5">
                            {filters.selectedSubcategories && filters.selectedSubcategories.length > 0 && (
                              <div className="mb-3">
                                <h5>Selected Subcategories:</h5>
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                  {filters.selectedSubcategories.map(sub => (
                                    <span key={sub} className="badge bg-info">
                                      {sub}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search terms.</p>
                            
                            <button 
                              className="btn btn-primary mt-3"
                              onClick={clearAllFilters}
                            >
                              Clear All Filters
                            </button>
                          </div>
                        );
                      } else if (hasFilteredProducts) {
                        return (
                          <div className={`row ${filters.viewMode === 'list' ? 'gy-4' : 'gy-4'}`}>
                            {productsWithWishlistStatus.map(product => {
                              if (!product || !product._id) return null;
                              
                              return (
                                <div 
                                  key={product._id} 
                                  className={filters.viewMode === 'list' ? 'col-12' : 'col-md-6 col-lg-4'}
                                >
                                  <ProductCard 
                                    product={product} 
                                    viewMode={filters.viewMode}
                                    onWishlistToggle={handleWishlistToggle}
                                    isInWishlist={product.isInWishlist}
                                    wishlistLoading={wishlistLoading}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <div className="col-12 text-center py-5">
                            <h3>No products match your filters</h3>
                            <p>Try adjusting your filters or search terms.</p>
                            
                            <button 
                              className="btn btn-primary mt-3"
                              onClick={clearAllFilters}
                            >
                              Clear All Filters
                            </button>
                          </div>
                        );
                      }
                    })()
                  )}
                </div>
              </section>

              {pagination && pagination.pages > 1 && (
                <section id="category-pagination" className="category-pagination section">
                  <div className="container">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                      disabled={loading}
                    />
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;