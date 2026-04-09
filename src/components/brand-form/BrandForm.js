// components/admin/BrandForm.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSweetAlert from '../../hooks/useSweetAlert';
import {useNavigate} from 'react-router-dom'
import { 
  createBrand, 
  updateBrand, 
  clearMessage, 
  clearError,
  selectIsLoading,
  selectError,
  selectSuccess,
  selectMessage 
} from '../../store/redux/brandSlice';

const BrandForm = ({ brand = null, onSubmit, onCancel, mode = 'create' }) => {
  const dispatch = useDispatch();
  const { success: showSuccess, error: showError, show: showWarning, info: showInfo } = useSweetAlert();
  const navigation=useNavigate()
  // Redux state
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const message = useSelector(selectMessage);

  // Initial form state
  const initialFormData = {
    name: '',
    description: '',
    website: '',
    status: 'active',
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    seoKeywords: [],
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: ''
    },
    contactEmail: '',
    sortOrder: 0
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [keywordInput, setKeywordInput] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  // Initialize form with brand data when in edit mode
  useEffect(() => {
    if (brand && mode === 'edit') {
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        website: brand.website || '',
        status: brand.status || 'active',
        isFeatured: brand.isFeatured || false,
        metaTitle: brand.metaTitle || '',
        metaDescription: brand.metaDescription || '',
        seoKeywords: brand.seoKeywords || [],
        socialMedia: brand.socialMedia || {
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: '',
          linkedin: ''
        },
        contactEmail: brand.contactEmail || '',
        sortOrder: brand.sortOrder || 0
      });

      // Set logo preview if exists
      if (brand.logo?.url) {
        setLogoPreview(brand.logo.url);
      }
    }
  }, [brand, mode]);

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setLogoFile(null);
    setKeywordInput('');
    setLogoPreview('');
    
    // Clear any file inputs
    const fileInput = document.getElementById('logoFile');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle Redux state changes
  useEffect(() => {
    if (success && message) {
      showSuccess(message);
      dispatch(clearMessage());
      
      // Reset form only in create mode
      if (mode === 'create') {
        resetForm();
      }
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }
    }

    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [success, message, error, dispatch, onSubmit, showSuccess, showError, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        // Clear the invalid file input
        e.target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB');
        // Clear the invalid file input
        e.target.value = '';
        return;
      }

      setLogoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seoKeywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter((_, i) => i !== index)
    }));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Brand name must be at least 2 characters long';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title should not exceed 60 characters';
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should not exceed 160 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

// In BrandForm.js - Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log('Form submitted, validating...');
  
  if (!validateForm()) {
    showWarning('Please fix the form errors before submitting');
    return;
  }

  try {
    // Create a clean data object with proper typing
    const submitData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      website: formData.website?.trim() || '',
      status: formData.status || 'active',
      isFeatured: Boolean(formData.isFeatured),
      metaTitle: formData.metaTitle?.trim() || '',
      metaDescription: formData.metaDescription?.trim() || '',
      contactEmail: formData.contactEmail?.trim() || '',
      sortOrder: Number(formData.sortOrder) || 0
    };

    // Handle socialMedia - create a new clean object
    const cleanSocialMedia = {};
    const socialMediaFields = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin'];
    
    socialMediaFields.forEach(platform => {
      const value = formData.socialMedia?.[platform];
      if (value && value.trim() !== '') {
        cleanSocialMedia[platform] = value.trim();
      }
    });
    submitData.socialMedia = cleanSocialMedia;

    // Handle seoKeywords - ensure it's an array
    submitData.seoKeywords = Array.isArray(formData.seoKeywords) ? formData.seoKeywords : [];

    // Add logo file if exists
    if (logoFile) {
      submitData.logo = logoFile;
    }

    console.log('BrandForm - Final submit data:', {
      ...submitData,
      logo: submitData.logo ? `File: ${submitData.logo.name}` : 'No file',
      seoKeywordsCount: submitData.seoKeywords.length,
      socialMediaCount: Object.keys(submitData.socialMedia).length
    });

    // Dispatch the create action
    if (mode === 'create') {
      console.log('Dispatching createBrand action...');
      await dispatch(createBrand(submitData)).unwrap();
    } else if (mode === 'edit' && brand) {
      console.log('Dispatching updateBrand action...');
      await dispatch(updateBrand({ 
        id: brand._id, 
        brandData: submitData 
      })).unwrap();
    }

    console.log('Form submission successful');
   setTimeout(()=>{
       navigation('/admin/brands')
   },4000)

  } catch (error) {
    console.error('BrandForm - Submission error:', error);
    showError(error.message || 'An error occurred while saving the brand');
  }
};

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    
    // Clear file input
    const fileInput = document.getElementById('logoFile');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // If in edit mode and brand has existing logo, set removeLogo flag
    if (mode === 'edit' && brand?.logo?.public_id) {
      setFormData(prev => ({
        ...prev,
        removeLogo: true
      }));
    }
  };

  const handleCancel = () => {
    // Clear any pending messages/errors
    dispatch(clearMessage());
    dispatch(clearError());
    
    // Reset form if in create mode
    if (mode === 'create') {
      resetForm();
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                {mode === 'edit' ? 'Edit Brand' : 'Add New Brand'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="border-bottom pb-2">Basic Information</h6>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter brand name"
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                    <div className="form-text">
                      Brand name must be at least 2 characters long
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="website" className="form-label">
                      Website
                    </label>
                    <input
                      type="url"
                      className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      disabled={isLoading}
                    />
                    {errors.website && (
                      <div className="invalid-feedback">{errors.website}</div>
                    )}
                  </div>

                  <div className="col-12 mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter brand description"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="contactEmail" className="form-label">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`}
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@brand.com"
                      disabled={isLoading}
                    />
                    {errors.contactEmail && (
                      <div className="invalid-feedback">{errors.contactEmail}</div>
                    )}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={isLoading}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="sortOrder" className="form-label">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="sortOrder"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleChange}
                      min="0"
                      disabled={isLoading}
                    />
                    <div className="form-text">
                      Lower numbers appear first
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <label className="form-check-label" htmlFor="isFeatured">
                        Featured Brand
                      </label>
                    </div>
                    <div className="form-text">
                      Featured brands will be highlighted on the website
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="border-bottom pb-2">Brand Logo</h6>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="logoFile" className="form-label">
                      Upload Logo
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="logoFile"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={isLoading}
                    />
                    <div className="form-text">
                      Recommended size: 300x150 pixels, PNG or JPG format, max 5MB
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Logo Preview</label>
                    <div>
                      {logoPreview ? (
                        <div className="d-flex align-items-center gap-3">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="img-thumbnail"
                            style={{ maxHeight: '80px', maxWidth: '150px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={removeLogo}
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-muted">
                          No logo uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="border-bottom pb-2">Social Media</h6>
                  </div>
                  
                  {['facebook', 'twitter', 'instagram', 'youtube', 'linkedin'].map(platform => (
                    <div className="col-md-6 mb-3" key={platform}>
                      <label htmlFor={`socialMedia.${platform}`} className="form-label">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)} URL
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id={`socialMedia.${platform}`}
                        name={`socialMedia.${platform}`}
                        value={formData.socialMedia[platform]}
                        onChange={handleChange}
                        placeholder={`https://${platform}.com/username`}
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>

                {/* SEO Settings */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="border-bottom pb-2">SEO Settings</h6>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label htmlFor="metaTitle" className="form-label">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.metaTitle ? 'is-invalid' : ''}`}
                      id="metaTitle"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleChange}
                      maxLength={60}
                      disabled={isLoading}
                    />
                    {errors.metaTitle && (
                      <div className="invalid-feedback">{errors.metaTitle}</div>
                    )}
                    <div className="form-text">
                      {formData.metaTitle.length}/60 characters
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <label htmlFor="metaDescription" className="form-label">
                      Meta Description
                    </label>
                    <textarea
                      className={`form-control ${errors.metaDescription ? 'is-invalid' : ''}`}
                      id="metaDescription"
                      name="metaDescription"
                      rows="2"
                      value={formData.metaDescription}
                      onChange={handleChange}
                      maxLength={160}
                      disabled={isLoading}
                    />
                    {errors.metaDescription && (
                      <div className="invalid-feedback">{errors.metaDescription}</div>
                    )}
                    <div className="form-text">
                      {formData.metaDescription.length}/160 characters
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <label htmlFor="keywordInput" className="form-label">
                      SEO Keywords
                    </label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        id="keywordInput"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={handleKeywordKeyPress}
                        placeholder="Enter a keyword and press Enter or Add button"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={addKeyword}
                        disabled={isLoading}
                      >
                        Add
                      </button>
                    </div>
                    
                    {formData.seoKeywords.length > 0 && (
                      <div className="mt-2">
                        <div className="d-flex flex-wrap gap-2">
                          {formData.seoKeywords.map((keyword, index) => (
                            <span key={index} className="badge bg-primary d-flex align-items-center">
                              {keyword}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => removeKeyword(index)}
                                disabled={isLoading}
                                aria-label="Remove keyword"
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {mode === 'edit' ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          mode === 'edit' ? 'Update Brand' : 'Create Brand'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandForm;