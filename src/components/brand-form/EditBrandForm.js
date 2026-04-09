// components/admin/EditBrandForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import BrandForm from './BrandForm';
import { 
  fetchBrandById, 
  updateBrand, 
  clearError, 
  clearMessage,
  selectCurrentBrand,
  selectIsLoading,
  selectError,
  selectSuccess,
  selectMessage 
} from '../../store/redux/brandSlice';

const EditBrandForm = () => {
  const params = useParams();
  const id = params?.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const brand = useSelector(selectCurrentBrand);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const message = useSelector(selectMessage);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBrand();
    }
  }, [id]);

  const loadBrand = async () => {
    try {
      setLoading(true);
      const result = await dispatch(fetchBrandById(id)).unwrap();
      console.log('Brand API Response:', result);
    } catch (error) {
      console.error('Failed to load brand:', error);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (brandData) => {
  try {
    console.log('EditBrandForm - Raw brand data from form:', brandData);
    
    // Validate brandData before sending
    if (!brandData || typeof brandData !== 'object') {
      console.error('Invalid brand data:', brandData);
      throw new Error('Brand data must be a valid object');
    }

    // Create sanitized data with proper typing
    const sanitizedData = {
      name: brandData.name?.trim() || '',
      description: brandData.description?.trim() || '',
      website: brandData.website?.trim() || '',
      status: brandData.status || 'active',
      isFeatured: Boolean(brandData.isFeatured),
      metaTitle: brandData.metaTitle?.trim() || '',
      metaDescription: brandData.metaDescription?.trim() || '',
      seoKeywords: Array.isArray(brandData.seoKeywords) ? brandData.seoKeywords : [],
      socialMedia: brandData.socialMedia || {},
      contactEmail: brandData.contactEmail?.trim() || '',
      sortOrder: Number(brandData.sortOrder) || 0
    };

    // Handle logo file if it exists
    if (brandData.logo && brandData.logo instanceof File) {
      sanitizedData.logo = brandData.logo;
    }

    // Handle removeLogo flag if present
    if (brandData.removeLogo) {
      sanitizedData.removeLogo = true;
    }

    // Clean up socialMedia - remove empty values
    if (sanitizedData.socialMedia) {
      Object.keys(sanitizedData.socialMedia).forEach(key => {
        if (!sanitizedData.socialMedia[key] || sanitizedData.socialMedia[key].trim() === '') {
          delete sanitizedData.socialMedia[key];
        }
      });
    }

    console.log('EditBrandForm - Sanitized data for API:', {
      ...sanitizedData,
      logo: sanitizedData.logo ? `File: ${sanitizedData.logo.name}` : 'No file',
      removeLogo: sanitizedData.removeLogo || false,
      seoKeywordsCount: sanitizedData.seoKeywords.length,
      socialMediaCount: Object.keys(sanitizedData.socialMedia).length
    });

    // Dispatch the update action
    const result = await dispatch(updateBrand({ 
      id, 
      brandData: sanitizedData 
    })).unwrap();
    
    console.log('EditBrandForm - Update successful:', result);
    
  } catch (error) {
    console.error('EditBrandForm - Failed to update brand:', error);
    // Error will be handled by the BrandForm component through Redux state
  }
};

  const handleCancel = () => {
    dispatch(clearError());
    dispatch(clearMessage());
    navigate('/admin/brands');
  };

  // Handle success redirect
  useEffect(() => {
    if (success && message) {
      const timer = setTimeout(() => {
        navigate('/admin/brands');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [success, message, navigate]);

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 mb-0">Loading brand data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !brand) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="alert alert-danger" role="alert">
                  <h5 className="alert-heading">Error Loading Brand</h5>
                  <p className="mb-0">{error}</p>
                </div>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => {
                    dispatch(clearError());
                    navigate('/admin/brands');
                  }}
                >
                  Back to Brands
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="alert alert-warning" role="alert">
                  <h5 className="alert-heading">Brand Not Found</h5>
                  <p className="mb-0">The brand you're trying to edit doesn't exist.</p>
                </div>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => navigate('/admin/brands')}
                >
                  Back to Brands
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrandForm
      brand={brand}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      mode="edit"
    />
  );
};

export default EditBrandForm;