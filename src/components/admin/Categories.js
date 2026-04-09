import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useSweetAlert from '../../hooks/useSweetAlert';
import {
  fetchCategories,
  selectCategories,
  selectIsLoading as selectCategoriesLoading,
  selectError as selectCategoriesError,
  selectFilters,
  setFilters,
  clearError as clearCategoriesError,
  deleteCategory,
} from '../../store/redux/categorySlice';
import { 
  getAllProducts,
  selectLoading as selectProductsLoading 
} from '../../store/redux/productSlice';

const Categories = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const isLoading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);
  const filters = useSelector(selectFilters);
  const productsLoading = useSelector(selectProductsLoading);
  const { success: showSuccess, error: showError, confirm: showConfirm } = useSweetAlert();
  
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.search || '');
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [categoryInventory, setCategoryInventory] = useState({});
  const [loadingInventory, setLoadingInventory] = useState({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [inventoryRefreshCounter, setInventoryRefreshCounter] = useState(0);

  // Fetch categories
  useEffect(() => {
    dispatch(fetchCategories({ search: filters.search }));
  }, [dispatch, filters.search]);

  // Set initial load complete
  useEffect(() => {
    if (categories.length > 0 && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [categories, initialLoadComplete]);

  // Fetch inventory for visible categories
  useEffect(() => {
    if (categories.length > 0 && initialLoadComplete) {
      console.log('Fetching inventory for loaded categories');
      fetchInventoryForVisibleCategories();
    }
  }, [categories, initialLoadComplete, inventoryRefreshCounter]);

  // Fetch inventory quantity for a specific category using getAllProducts
  const fetchInventoryQuantity = async (categoryId, categoryName) => {
    if (loadingInventory[categoryId] || categoryInventory[categoryId] !== undefined) {
      return;
    }

    setLoadingInventory(prev => ({ ...prev, [categoryId]: true }));
    
    try {
      console.log(`Fetching inventory for category: ${categoryName} (ID: ${categoryId})`);
      
      // Use getAllProducts with category filter
      const response = await dispatch(getAllProducts({
        category: categoryId,
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        inStock: 'true' // Only get in-stock products
      })).unwrap();
      
      console.log(`API response for category "${categoryName}":`, response);
      
      // Extract data from response structure
      const productsData = response?.data || response?.products || response || [];
      const productCount = response?.pagination?.total || response?.summary?.totalProducts || productsData.length || 0;
      
      let totalInventoryQuantity = 0;
      let productDetails = [];
      
      // Calculate total inventory from products
      if (productsData && Array.isArray(productsData)) {
        console.log(`Processing ${productsData.length} products for inventory calculation`);
        
        productsData.forEach(product => {
          let productInventory = 0;
          
          // Calculate inventory from product variants or colors
          if (product.variants && Array.isArray(product.variants)) {
            // Sum all variant quantities
            productInventory = product.variants.reduce((sum, variant) => {
              return sum + (variant.quantity || 0);
            }, 0);
          }
          // If no variants, check for color-based quantities
          else if (product.colors?.availableColors) {
            // Sum quantities from all color configurations
            productInventory = product.colors.availableColors.reduce((sum, color) => {
              if (color.quantityConfig?.totalQuantity) {
                return sum + color.quantityConfig.totalQuantity;
              }
              return sum;
            }, 0);
          }
          // Fallback to product quantity
          else if (product.quantity !== undefined && product.quantity !== null) {
            productInventory = Number(product.quantity);
          }
          // Fallback to totalQuantity
          else if (product.totalQuantity !== undefined && product.totalQuantity !== null) {
            productInventory = Number(product.totalQuantity);
          }
          
          console.log(`Product "${product.name}" inventory: ${productInventory}`);
          totalInventoryQuantity += productInventory;
          
          productDetails.push({
            name: product.name,
            productId: product._id || product.id,
            inventory: productInventory,
            hasColors: product.colors?.hasColors || false,
            colorCount: product.colors?.availableColors?.length || 0,
            hasVariants: !!(product.variants && product.variants.length > 0)
          });
        });
      }
      
      console.log(`Category "${categoryName}" statistics:`);
      console.log(`- Product count: ${productCount}`);
      console.log(`- Total inventory quantity: ${totalInventoryQuantity}`);
      console.log(`- Product details:`, productDetails);
      
      setCategoryInventory(prev => ({
        ...prev,
        [categoryId]: {
          productCount,
          totalInventoryQuantity,
          productDetails,
          lastUpdated: new Date().toISOString(),
          dataLoaded: true
        }
      }));
      
    } catch (error) {
      console.error(`Error fetching inventory for category ${categoryId} (${categoryName}):`, error);
      
      setCategoryInventory(prev => ({
        ...prev,
        [categoryId]: {
          productCount: -1,
          totalInventoryQuantity: -1,
          productDetails: [],
          error: error.message || 'Failed to load inventory data',
          lastUpdated: new Date().toISOString(),
          dataLoaded: false
        }
      }));
    } finally {
      setLoadingInventory(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Fetch inventory for all visible categories in batches
  const fetchInventoryForVisibleCategories = async () => {
    console.log('Starting to fetch inventory for', categories.length, 'categories');
    
    const batchSize = 3;
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      
      const promises = batch.map(category => {
        const categoryId = getCategoryId(category);
        const inventoryData = categoryInventory[categoryId];
        
        // Only fetch if we haven't loaded data before or if data is stale
        if (!inventoryData?.dataLoaded || 
            (inventoryData.error && inventoryData.productCount === -1) ||
            !inventoryData.lastUpdated ||
            (Date.now() - new Date(inventoryData.lastUpdated).getTime() > 5 * 60 * 1000)) { // 5 minutes
          return fetchInventoryQuantity(categoryId, category.name);
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      
      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < categories.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('Finished fetching inventory for all categories');
  };

  // Refresh all inventory data
  const refreshInventory = async () => {
    console.log('Refreshing all inventory data');
    
    setCategoryInventory({});
    setLoadingInventory({});
    setInventoryRefreshCounter(prev => prev + 1);
    
    showSuccess('Inventory Refresh', 'Inventory data refresh has been initiated.');
  };

  // Handle search input changes with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(() => {
      dispatch(setFilters({ search: value }));
    }, 500);

    setDebounceTimer(newTimer);
  };

  // Manual search trigger
  const handleSearch = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    dispatch(setFilters({ search: localSearchTerm }));
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    dispatch(setFilters({ search: '' }));
  };

  // Helper function to get category ID
  const getCategoryId = (category) => {
    return category._id || category.id;
  };

  // Get inventory data for a category
  const getInventoryData = (category) => {
    const categoryId = getCategoryId(category);
    return categoryInventory[categoryId] || null;
  };

  // Get product count for a category
  const getProductCount = (category) => {
    const data = getInventoryData(category);
    if (data && data.productCount !== undefined) {
      return data.productCount;
    }
    
    if (category.productCount !== undefined) {
      return category.productCount;
    }
    
    return category.products || 0;
  };

  // Get total inventory quantity
  const getTotalInventoryQuantity = (category) => {
    const data = getInventoryData(category);
    return data ? data.totalInventoryQuantity : 0;
  };

  // Check if we have inventory data for a category
  const hasInventoryData = (category) => {
    const categoryId = getCategoryId(category);
    const data = categoryInventory[categoryId];
    return data && data.dataLoaded === true;
  };

  // Check if inventory data is loading for a category
  const isInventoryLoading = (category) => {
    const categoryId = getCategoryId(category);
    return loadingInventory[categoryId] || false;
  };

  // Render inventory display for a category
  const renderInventoryDisplay = (category) => {
    const categoryId = getCategoryId(category);
    const isLoadingData = isInventoryLoading(category);
    const data = getInventoryData(category);
    const hasData = hasInventoryData(category);
    
    if (isLoadingData) {
      return (
        <div className="d-flex align-items-center">
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          <small className="text-muted">Loading...</small>
        </div>
      );
    }
    
    if (!hasData) {
      return (
        <div className="d-flex align-items-center">
          <span className="text-muted" title="Inventory data not loaded">
            <i className="bi bi-question-circle me-2"></i>
          </span>
          <button 
            className="btn btn-link btn-sm p-0"
            onClick={() => fetchInventoryQuantity(categoryId, category.name)}
            disabled={isLoadingData}
            title="Load inventory data"
          >
            <small>Load</small>
          </button>
        </div>
      );
    }
    
    if (data && data.productCount === -1) {
      return (
        <div className="d-flex align-items-center">
          <span className="text-danger" title="Error loading inventory data">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <small>Error</small>
          </span>
          <button 
            className="btn btn-link btn-sm p-0 ms-2"
            onClick={() => fetchInventoryQuantity(categoryId, category.name)}
            title="Retry loading inventory data"
          >
            <small>Retry</small>
          </button>
        </div>
      );
    }
    
    if (data) {
      const productCount = data.productCount;
      const inventoryQuantity = data.totalInventoryQuantity;
      
      return (
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center mb-1">
            <span className="fw-bold" title={`${inventoryQuantity} total inventory items`}>
              {inventoryQuantity.toLocaleString()} item{inventoryQuantity !== 1 ? 's' : ''}
            </span>
            {inventoryQuantity > 0 && (
              <i className="bi bi-exclamation-triangle-fill text-warning ms-2" 
                 style={{ fontSize: '0.75rem' }}
                 title={`Category has ${inventoryQuantity} inventory items - cannot delete`}></i>
            )}
          </div>
          
          <div className="d-flex align-items-center">
            <small className="text-muted" title={`${productCount} distinct product(s)`}>
              ({productCount} product{productCount !== 1 ? 's' : ''})
            </small>
            {data.lastUpdated && (
              <small className="text-muted ms-2" title={`Last updated: ${new Date(data.lastUpdated).toLocaleTimeString()}`}>
                <i className="bi bi-clock-history ms-1" style={{ fontSize: '0.65rem' }}></i>
              </small>
            )}
          </div>
          
          {inventoryQuantity === 0 && productCount === 0 && (
            <small className="text-success mt-1">
              <i className="bi bi-check-circle me-1"></i>
              No products - safe to delete
            </small>
          )}
          
          {inventoryQuantity > 0 && (
            <small className="text-warning mt-1">
              <i className="bi bi-exclamation-triangle me-1"></i>
              Has inventory
            </small>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Handle category deletion
  const handleDeleteCategory = async (category) => {
    const categoryId = getCategoryId(category);
    const categoryName = category.name;
    
    // Load inventory data if not already loaded
    if (!hasInventoryData(category)) {
      await fetchInventoryQuantity(categoryId, categoryName);
      // Wait a bit for data to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const data = getInventoryData(category);
    const inventoryQuantity = getTotalInventoryQuantity(category);
    const productCount = getProductCount(category);
    
    // Check if category has inventory or products
    if (inventoryQuantity > 0 || productCount > 0) {
      showError(
        'Cannot Delete Category',
        `The category "${categoryName}" has ${productCount} product(s) with ${inventoryQuantity} inventory item(s) associated with it. Please remove or reassign these products before deleting the category.`
      );
      return;
    }

    // Check if category has subcategories
    const hasSubcategories = categories.some(cat => 
      cat.parent && (cat.parent._id === categoryId || cat.parent === categoryId)
    );

    if (hasSubcategories) {
      showError(
        'Cannot Delete Category',
        `The category "${categoryName}" has subcategories. Please delete or reassign them first.`
      );
      return;
    }

    // Confirm deletion
    const result = await showConfirm(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      'warning',
      {
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc3545'
      }
    );

    if (result.isConfirmed) {
      setDeletingId(categoryId);
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        showSuccess('Category Deleted', `"${categoryName}" has been deleted successfully.`);
        
        // Remove category from inventory state
        setCategoryInventory(prev => {
          const newData = { ...prev };
          delete newData[categoryId];
          return newData;
        });
        
        // Refresh categories list
        dispatch(fetchCategories({ search: filters.search }));
      } catch (error) {
        console.error('Error deleting category:', error);
        showError('Delete Failed', error.message || 'Failed to delete category.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Check if category has subcategories
  const hasSubcategories = (category) => {
    const categoryId = getCategoryId(category);
    return categories.some(cat => 
      cat.parent && (cat.parent._id === categoryId || cat.parent === categoryId)
    );
  };

  // Get parent category name
  const getParentName = (category) => {
    if (!category.parent) return null;
    
    if (typeof category.parent === 'object') {
      return category.parent.name;
    }
    
    const parentCategory = categories.find(cat => getCategoryId(cat) === category.parent);
    return parentCategory ? parentCategory.name : category.parent;
  };

  // Render status badge
  const renderStatus = (category) => {
    if (category.isActive === false) {
      return <span className="badge bg-danger">Inactive</span>;
    }
    return <span className="badge bg-success">Active</span>;
  };

  // Render category type/sex badge
  const renderCategoryType = (category) => {
    if (category.sex) {
      const sexMap = {
        'women': { label: 'Women', class: 'bg-purple' },
        'men': { label: 'Men', class: 'bg-blue' },
        'unisex': { label: 'Unisex', class: 'bg-info' },
        'kids': { label: 'Kids', class: 'bg-warning' },
        'baby': { label: 'Baby', class: 'bg-pink' },
      };
      
      const type = sexMap[category.sex] || { label: category.sex, class: 'bg-secondary' };
      return <span className={`badge ${type.class} text-white`}>{type.label}</span>;
    }
    return <span className="badge bg-light text-dark">—</span>;
  };

  // Sort categories (parent categories first, then subcategories)
  const sortedCategories = [...categories].sort((a, b) => {
    // Group by parent
    if (a.parent && b.parent) {
      const parentA = getParentName(a);
      const parentB = getParentName(b);
      if (parentA !== parentB) {
        return parentA.localeCompare(parentB);
      }
    }
    // Parent categories before subcategories
    if (a.parent && !b.parent) return 1;
    if (!a.parent && b.parent) return -1;
    
    // Alphabetical within groups
    return a.name.localeCompare(b.name);
  });

  // Calculate totals for display
  const totalInventoryItems = Object.values(categoryInventory).reduce(
    (sum, data) => sum + (data?.totalInventoryQuantity > 0 ? data.totalInventoryQuantity : 0), 0
  );
  
  const totalProducts = Object.values(categoryInventory).reduce(
    (sum, data) => sum + (data?.productCount > 0 ? data.productCount : 0), 0
  );
  
  const categoriesWithData = sortedCategories.filter(hasInventoryData).length;
  const categoriesWithErrors = sortedCategories.filter(cat => {
    const data = getInventoryData(cat);
    return data && data.productCount === -1;
  }).length;
  const categoriesLoading = Object.values(loadingInventory).filter(Boolean).length;

  return (
    <div className='section'>
      <div className="container-fluid">
        <div className="container">
          <div className="row">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0">All Categories</h5>
                  <p className="text-muted mb-0 small">Manage your product categories and subcategories</p>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-info"
                    onClick={refreshInventory}
                    disabled={isLoading || categoriesLoading > 0 || productsLoading}
                    title="Refresh inventory data for all categories"
                  >
                    {categoriesLoading > 0 || productsLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Refresh Inventory
                      </>
                    )}
                  </button>
                  <Link to="/admin/categories/new" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-1"></i> Add Category
                  </Link>
                </div>
              </div>
              
              <div className="card-body border-bottom">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search categories by name, description, or slug..."
                        value={localSearchTerm}
                        onChange={handleSearchChange}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                        disabled={isLoading}
                      />
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={handleSearch}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Searching...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-search me-1"></i> Search
                          </>
                        )}
                      </button>
                      {(localSearchTerm || filters.search) && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={handleClearSearch}
                          disabled={isLoading}
                          title="Clear search"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      )}
                    </div>
                    <small className="form-text text-muted">
                      Search by category name, description, or slug. Press Enter or click Search.
                    </small>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="d-flex flex-column align-items-end">
                      <small className="text-muted">
                        {filters.search ? `Search results for "${filters.search}"` : `Total: ${categories.length} categories`}
                      </small>
                      <small className="text-muted">
                        {sortedCategories.filter(c => !c.parent).length} parent categories
                      </small>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="alert alert-danger mt-3 mb-0" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle me-2 fs-5"></i>
                      <div className="flex-grow-1">{error}</div>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => dispatch(clearCategoriesError())}
                        aria-label="Close"
                      ></button>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-body p-0">
                {isLoading && !categories.length ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">
                      {filters.search ? 'Searching categories...' : 'Loading categories...'}
                    </p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-folder-x display-4 text-muted opacity-50"></i>
                    <h4 className="mt-3">No categories found</h4>
                    <p className="text-muted">
                      {filters.search 
                        ? `No categories match "${filters.search}"` 
                        : 'No categories have been created yet. Start by creating your first category!'}
                    </p>
                    <div className="mt-4">
                      {filters.search && (
                        <button
                          className="btn btn-outline-primary me-2"
                          onClick={handleClearSearch}
                        >
                          <i className="bi bi-x-circle me-1"></i> Clear Search
                        </button>
                      )}
                      {!filters.search && (
                        <Link to="/admin/categories/new" className="btn btn-primary">
                          <i className="bi bi-plus-circle me-1"></i> Create First Category
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th width="25%">Category Name</th>
                          <th width="15%">Type/Sex</th>
                          <th width="15%">Parent</th>
                          <th width="20%">
                            <div className="d-flex align-items-center">
                              <span>Inventory</span>
                              <button 
                                className="btn btn-link btn-sm p-0 ms-1"
                                onClick={refreshInventory}
                                disabled={categoriesLoading > 0 || productsLoading}
                                title="Refresh all inventory data"
                              >
                                <i className="bi bi-arrow-clockwise"></i>
                              </button>
                              <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>
                                {categoriesWithData}/{sortedCategories.length}
                              </span>
                            </div>
                          </th>
                          <th width="10%">Status</th>
                          <th width="15%" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCategories.map(category => {
                          const categoryId = getCategoryId(category);
                          const isDeleting = deletingId === categoryId;
                          const isLoadingData = isInventoryLoading(category);
                          const data = getInventoryData(category);
                          const inventoryQuantity = getTotalInventoryQuantity(category);
                          const productCount = getProductCount(category);
                          const hasInventory = inventoryQuantity > 0;
                          const hasProducts = productCount > 0;
                          const hasChildren = hasSubcategories(category);
                          const canDelete = !hasInventory && !hasProducts && !hasChildren;
                          const parentName = getParentName(category);
                          const isSubcategory = !!parentName;
                          const hasData = hasInventoryData(category);

                          return (
                            <tr key={categoryId} className={isSubcategory ? 'table-light' : ''}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {isSubcategory && (
                                    <i className="bi bi-arrow-return-right me-2 text-muted"></i>
                                  )}
                                  <div>
                                    <div className="fw-bold">
                                      {category.name}
                                      {hasChildren && (
                                        <span className="badge bg-info ms-2" title="Has subcategories">
                                          <i className="bi bi-diagram-2 me-1"></i>Sub
                                        </span>
                                      )}
                                    </div>
                                    {category.seo?.slug && (
                                      <div className="small text-muted">
                                        /{category.seo.slug}
                                      </div>
                                    )}
                                    {category.description && (
                                      <div className="small text-truncate mt-1" style={{ maxWidth: '200px' }}>
                                        {category.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                {renderCategoryType(category)}
                              </td>
                              <td>
                                {parentName ? (
                                  <span className="badge bg-light text-dark p-2">
                                    <i className="bi bi-folder me-1"></i>
                                    {parentName}
                                  </span>
                                ) : (
                                  <span className="text-muted fst-italic">— Root —</span>
                                )}
                              </td>
                              <td>
                                {renderInventoryDisplay(category)}
                              </td>
                              <td>
                                {renderStatus(category)}
                              </td>
                              <td>
                                <div className="d-flex justify-content-center">
                                  <div className="btn-group" role="group">
                                    <Link 
                                      to={`/admin/categories/edit/${categoryId}`}
                                      className="btn btn-outline-primary btn-sm"
                                      title="Edit Category"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </Link>
                                    {category.children && category.children.length > 0 && (
                                      <Link 
                                        to={`/admin/categories/${categoryId}/subcategories`}
                                        className="btn btn-outline-info btn-sm"
                                        title="View Subcategories"
                                      >
                                        <i className="bi bi-diagram-2"></i>
                                      </Link>
                                    )}
                                    <button 
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleDeleteCategory(category)}
                                      disabled={isDeleting || isLoadingData || !canDelete}
                                      title={
                                        isLoadingData
                                          ? "Loading inventory data..."
                                          : !canDelete
                                          ? hasInventory || hasProducts
                                            ? "Cannot delete - has inventory/products" 
                                            : "Cannot delete - has subcategories"
                                          : "Delete Category"
                                      }
                                    >
                                      {isDeleting ? (
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                      ) : (
                                        <i className="bi bi-trash"></i>
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {!canDelete && hasData && (
                                  <div className="text-center mt-1">
                                    <small className="text-danger">
                                      <i className="bi bi-lock me-1"></i>
                                      {(hasInventory || hasProducts) && "Has inventory/products"}
                                      {(hasInventory || hasProducts) && hasChildren && " and "}
                                      {hasChildren && "Has subcategories"}
                                    </small>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <span className="badge bg-primary">
                        <i className="bi bi-folder me-1"></i>
                        {sortedCategories.filter(c => !c.parent).length} Parent Categories
                      </span>
                      <span className="badge bg-secondary">
                        <i className="bi bi-folder2-open me-1"></i>
                        {sortedCategories.filter(c => c.parent).length} Subcategories
                      </span>
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        {sortedCategories.filter(c => c.isActive !== false).length} Active
                      </span>
                      <span className="badge bg-warning">
                        <i className="bi bi-box-seam me-1"></i>
                        {totalProducts} Products
                      </span>
                      <span className="badge bg-info">
                        <i className="bi bi-boxes me-1"></i>
                        {totalInventoryItems} Inventory Items
                      </span>
                      {categoriesLoading > 0 && (
                        <span className="badge bg-warning">
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          {categoriesLoading} Loading
                        </span>
                      )}
                      {categoriesWithErrors > 0 && (
                        <span className="badge bg-danger">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {categoriesWithErrors} Errors
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <div className="text-muted small">
                      <div className="d-flex align-items-center justify-content-end">
                        <i className="bi bi-info-circle me-1"></i>
                        <span className="me-2">Categories with inventory cannot be deleted</span>
                        <span className={`badge ${categoriesWithData === sortedCategories.length ? 'bg-success' : 'bg-warning'} text-white`}>
                          <i className={`bi ${categoriesWithData === sortedCategories.length ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                          {categoriesWithData}/{sortedCategories.length} loaded
                        </span>
                      </div>
                      <div className="mt-1">
                        Showing {sortedCategories.length} categories
                        {filters.search && ` (filtered)`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;