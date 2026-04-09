import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBrands,
  deleteBrand,
  updateBrand,
  selectBrands,
  selectIsLoading,
  selectError,
  selectPagination,
  clearError,
  clearMessage,
  setFilters
} from '../../store/redux/brandSlice';
import useSweetAlert from '../../hooks/useSweetAlert';
const Brands = () => {
  const dispatch = useDispatch();
  const brands = useSelector(selectBrands);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);
  
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Enhanced fetch function with proper error handling
  const fetchBrandsData = useCallback(async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filterText,
        status: statusFilter,
        sortBy: 'name',
        sortOrder: 'asc'
      };
      
      const result = await dispatch(fetchBrands(params)).unwrap();
      console.log('Fetched brands:', result);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  }, [dispatch, pagination.page, pagination.limit, filterText, statusFilter]);

  useEffect(() => {
    fetchBrandsData();
  }, [fetchBrandsData]);

  useEffect(() => {
    if (error) {
      console.error('Brand Error:', error);
      const errorTimer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(errorTimer);
    }
  }, [error, dispatch]);

  // Enhanced delete handler
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await dispatch(deleteBrand(id)).unwrap();
        await fetchBrandsData();
      } catch (error) {
        console.error('Failed to delete brand:', error);
      }
    }
  }, [dispatch, fetchBrandsData]);

  // Enhanced bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} brand(s)?`)) {
      try {
        const deletePromises = selectedRows.map(brand => 
          dispatch(deleteBrand(brand?._id)).unwrap()
        );
        
        await Promise.all(deletePromises);
        await fetchBrandsData();
        setSelectedRows([]);
      } catch (error) {
        console.error('Failed to delete brands:', error);
      }
    }
  }, [selectedRows, dispatch, fetchBrandsData]);

  // Enhanced status update
  const handleStatusUpdate = useCallback(async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await dispatch(updateBrand({ 
        id, 
        brandData: { status: newStatus } 
      })).unwrap();
      
      await fetchBrandsData();
    } catch (error) {
      console.error('Failed to update brand status:', error);
    }
  }, [dispatch, fetchBrandsData]);

  const handlePageChange = useCallback((page) => {
    dispatch(setFilters({ page }));
  }, [dispatch]);

  const handlePerRowsChange = useCallback((newPerPage, page) => {
    dispatch(setFilters({ limit: newPerPage, page }));
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    setFilterText('');
    setStatusFilter('');
  }, []);

  // Safe data access helper functions
  const getBrandLogo = (brand) => {
    return brand?.logo?.url || brand?.logoUrl || '/images/brands/default.png';
  };

  const getBrandName = (brand) => {
    return brand?.name || 'Unnamed Brand';
  };

  const getBrandDescription = (brand) => {
    return brand?.description || 'No description available';
  };

  const getBrandSlug = (brand) => {
    return brand?.slug || 'no-slug';
  };

  const getBrandStatus = (brand) => {
    return brand?.status || 'inactive';
  };

  // Custom table rendering
  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    // Handle case where brands might be null or undefined
    if (!brands || brands.length === 0) {
      return (
        <div className="text-center py-4">
          <i className="bi bi-inbox display-4 text-muted"></i>
          <p className="mt-2 text-muted">No brands found</p>
          {(filterText || statusFilter) && (
            <button className="btn btn-primary mt-2" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      );
    }

    return (
      <table className="table table-hover brands-table w-100">
        <thead className="table-light">
          <tr>
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={selectedRows.length === brands.length && brands.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows([...brands]);
                  } else {
                    setSelectedRows([]);
                  }
                }}
              />
            </th>
            <th style={{ width: '250px' }}>Brand</th>
            <th style={{ width: '80px' }}>Logo</th>
            <th style={{ width: '120px' }}>Slug</th>
            <th style={{ width: '100px' }}>Products</th>
            <th style={{ width: '100px' }}>Featured</th>
            <th style={{ width: '100px' }}>Status</th>
            <th style={{ width: '150px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr 
              key={brand?._id || brand?.id} 
              className={selectedRows.some(row => row?._id === brand?._id) ? 'table-active' : ''}
            >
              <td>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedRows.some(row => row?._id === brand?._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(prev => [...prev, brand]);
                    } else {
                      setSelectedRows(prev => prev.filter(row => row?._id !== brand?._id));
                    }
                  }}
                />
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                  
                 
                    {getBrandName(brand)}
                    
                  </div>
                 
                </div>
              </td>
              <td>
                <img 
                  src={getBrandLogo(brand)}
                  alt={getBrandName(brand)}
                  className="brand-thumbnail"
                  style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain',
                    backgroundColor: '#f8f9fa',
                    padding: '2px',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    e.target.src = '/images/brands/default.png';
                  }}
                />
              </td>
              <td>
                <span className="text-truncate d-block" style={{ maxWidth: '120px' }} title={getBrandSlug(brand)}>
                  {getBrandSlug(brand)}
                </span>
              </td>
              <td>
                <span className="badge bg-primary">{brand?.productCount || 0}</span>
              </td>
              <td>
                <span className={`badge ${brand?.isFeatured ? 'bg-warning' : 'bg-secondary'}`}>
                  {brand?.isFeatured ? 'Yes' : 'No'}
                </span>
              </td>
              <td>
                <span 
                  className={`badge ${getBrandStatus(brand) === 'active' ? 'bg-success' : 'bg-secondary'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleStatusUpdate(brand?._id || brand?.id, getBrandStatus(brand))}
                  title="Click to toggle status"
                >
                  {getBrandStatus(brand).charAt(0).toUpperCase() + getBrandStatus(brand).slice(1)}
                </span>
              </td>
              <td>
                <div className="btn-group btn-group-sm">
                  {/* <button 
                    className="btn btn-outline-primary" 
                    title="View"
                    onClick={() => window.location.href = `/brands/${getBrandSlug(brand)}`}
                  >
                    <i className="bi bi-eye"></i>
                  </button> */}
                  <button 
                    className="btn btn-outline-secondary" 
                    title="Edit"
                    onClick={() => window.location.href = `/admin/brands/edit/${brand?._id || brand?.id}`}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="btn btn-outline-danger" 
                    title="Delete"
                    onClick={() => handleDelete(brand?._id || brand?.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderPagination = () => {
    const totalPages = pagination?.pages || 1;
    const currentPage = pagination?.page || 1;
    const totalItems = pagination?.total || 0;
    
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
        <div className="text-muted">
          Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, totalItems)} of {totalItems} entries
        </div>
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              // Show first page, last page, and pages around current page
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
              }
              return null;
            })}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="d-flex align-items-center">
          <label className="me-2 mb-0 text-muted">Show:</label>
          <select 
            className="form-select form-select-sm" 
            style={{ width: '80px' }}
            value={pagination.limit}
            onChange={(e) => handlePerRowsChange(parseInt(e.target.value), 1)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className='section'>
      <div className="container-fluid">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">All Brands</h5>
                  <a href="/admin/brands/new" className="btn btn-primary btn-sm">
                    <i className="bi bi-plus-circle me-1"></i> Add Brand
                  </a>
                </div>
                <div className="card-body p-0">
                  {error && (
                    <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
                      <strong>Error:</strong> {error}
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => dispatch(clearError())}
                      ></button>
                    </div>
                  )}
                  
                  {/* Filters */}
                  <div className="d-flex justify-content-between align-items-center p-3 border-bottom flex-wrap gap-3">
                    <div className="d-flex gap-2 flex-wrap">
                      <div className="input-group" style={{ width: '300px' }}>
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name, slug, or description..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                        />
                      </div>
                      
                      <select 
                        className="form-select" 
                        style={{ width: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>

                      {(filterText || statusFilter) && (
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={clearFilters}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Clear
                        </button>
                      )}
                    </div>
                    
                    {selectedRows.length > 0 && (
                      <div className="btn-group">
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={handleBulkDelete}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Delete Selected ({selectedRows.length})
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Table */}
                  <div className="p-3">
                    {renderTable()}
                  </div>

                  {/* Pagination */}
                  <div className="p-3 border-top">
                    {renderPagination()}
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

export default Brands;