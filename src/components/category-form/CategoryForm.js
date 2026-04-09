import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import useSweetAlert from '../../hooks/useSweetAlert';
import {
  createCategory,
  updateCategory,
  fetchCategories,
  fetchCategoryById,
  selectTopLevelCategories,
  selectCurrentCategory,
  selectIsLoading,
  selectError,
  selectCategoryLoading,
  clearError,
  clearMessage,
  clearCurrentCategory
} from '../../store/redux/categorySlice';

const CategoryForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { success: showSuccess, error: showError, warning: showWarning, info: showInfo, confirm: showConfirm } = useSweetAlert();
  const categories = useSelector(selectTopLevelCategories);
  const currentCategory = useSelector(selectCurrentCategory);
  const isLoading = useSelector(selectIsLoading);
  const categoryLoading = useSelector(selectCategoryLoading);
  const error = useSelector(selectError);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sex: 'unisex',
    parent: '',
    image: {
      file: null,
      preview: '',
      alt: ''
    },
    sortOrder: 0,
    isActive: true,
    seo: {
      title: '',
      description: '',
      slug: ''
    },
    customFields: []
  });

  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sex options from controller
  const sexOptions = [
    { value: 'men', label: 'Men', description: 'Products for men' },
    { value: 'women', label: 'Women', description: 'Products for women' },
    { value: 'unisex', label: 'Unisex', description: 'Products for all genders' },
    { value: 'kids', label: 'Kids', description: 'Products for children' },
    { value: 'baby', label: 'Baby', description: 'Products for babies' }
  ];

  // Custom field types
  const customFieldTypes = [
    { value: 'string', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'array', label: 'Multiple Choice' }
  ];

  useEffect(() => {
    // Check if we're in edit mode
    if (categoryId) {
      setIsEditing(true);
      loadCategoryData();
    } else {
      setIsEditing(false);
      // Reset form when not in edit mode
      setFormData({
        name: '',
        description: '',
        sex: 'unisex',
        parent: '',
        image: {
          file: null,
          preview: '',
          alt: ''
        },
        sortOrder: 0,
        isActive: true,
        seo: {
          title: '',
          description: '',
          slug: ''
        },
        customFields: []
      });
    }

    loadParentCategories();

    // Cleanup function
    return () => {
      if (formData.image.preview && formData.image.file) {
        URL.revokeObjectURL(formData.image.preview);
      }
      dispatch(clearError());
      dispatch(clearMessage());
      dispatch(clearCurrentCategory());
    };
  }, [categoryId, dispatch]);

  const loadCategoryData = async () => {
    if (!categoryId) return;

    setLocalLoading(true);
    try {
      // Use the fetchCategoryById action
      await dispatch(fetchCategoryById({ id: categoryId, useCache: true })).unwrap();
      showInfo('Category data loaded successfully!');
    } catch (error) {
      console.error('Error loading category data:', error);
      showError('Failed to load category data. Please try again.');
      setErrors(prev => ({ ...prev, load: 'Failed to load category data' }));
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (currentCategory && isEditing) {
      // Format the data to match form structure
      setFormData({
        name: currentCategory.name || '',
        description: currentCategory.description || '',
        sex: currentCategory.sex || 'unisex',
        parent: currentCategory.parent?._id || currentCategory.parent || '',
        image: {
          file: null,
          preview: currentCategory.image?.url || currentCategory.image || '',
          alt: currentCategory.image?.alt || ''
        },
        sortOrder: currentCategory.sortOrder || 0,
        isActive: currentCategory.isActive !== undefined ? currentCategory.isActive : true,
        seo: currentCategory.seo || { 
          title: currentCategory.seo?.title || '', 
          description: currentCategory.seo?.description || '', 
          slug: currentCategory.seo?.slug || '' 
        },
        customFields: currentCategory.customFields || []
      });
    }
  }, [currentCategory, isEditing]);

  const loadParentCategories = async () => {
    try {
      await dispatch(fetchCategories({ 
        parentOnly: true, 
        includeInactive: false,
        useCache: true 
      })).unwrap();
    } catch (error) {
      console.error('Error loading parent categories:', error);
      showError('Failed to load parent categories. Please refresh the page.');
      setErrors(prev => ({ ...prev, load: 'Failed to load parent categories' }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === 'imageFile' && files && files[0]) {
      const file = files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, imageFile: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' }));
        showError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, imageFile: 'Image size must be less than 5MB' }));
        showError('Image size must be less than 5MB');
        return;
      }
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        image: {
          ...prev.image,
          file: file,
          preview: previewUrl
        }
      }));
      
      // Clear any previous file errors
      if (errors.imageFile) {
        setErrors(prev => ({ ...prev, imageFile: '' }));
      }
      
      showSuccess('Image selected successfully!');
    } else if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else if (name.startsWith('image.')) {
      const imageField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        image: {
          ...prev.image,
          [imageField]: value
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

    // Clear Redux error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updatedCustomFields = [...formData.customFields];
    updatedCustomFields[index] = {
      ...updatedCustomFields[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, customFields: updatedCustomFields }));
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        { name: '', type: 'string', required: false, options: [] }
      ]
    }));
    showInfo('Custom field added. Please configure it.');
  };

  const removeCustomField = async (index) => {
    const fieldName = formData.customFields[index].name || `Field ${index + 1}`;
    
    const result = await showConfirm(
      'Remove Custom Field',
      `Are you sure you want to remove "${fieldName}"?`,
      'warning',
      { confirmButtonText: 'Yes, remove it!', cancelButtonText: 'Cancel' }
    );
    
    if (result.isConfirmed) {
      const updatedCustomFields = formData.customFields.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, customFields: updatedCustomFields }));
      showSuccess('Custom field removed successfully!');
    }
  };

  const handleCustomFieldOptionsChange = (index, optionsString) => {
    const options = optionsString.split(',').map(opt => opt.trim()).filter(opt => opt);
    handleCustomFieldChange(index, 'options', options);
  };

  const removeImage = async () => {
    const result = await showConfirm(
      'Remove Image',
      'Are you sure you want to remove the category image?',
      'warning',
      { confirmButtonText: 'Yes, remove it!', cancelButtonText: 'Cancel' }
    );
    
    if (result.isConfirmed) {
      // If editing and there was a previous image, we need to handle it properly
      if (isEditing && currentCategory?.image) {
        setFormData(prev => ({
          ...prev,
          image: {
            file: null,
            preview: '', // This will remove the image on update
            alt: ''
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          image: {
            file: null,
            preview: '',
            alt: ''
          }
        }));
      }
      showSuccess('Image removed successfully!');
    }
  };

  const generateSlug = () => {
    if (!formData.seo.slug && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          slug
        }
      }));
      showInfo('Slug generated from category name!');
    } else {
      showInfo('Slug already exists or category name is empty.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Category name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.seo.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(formData.seo.slug)) {
        newErrors['seo.slug'] = 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
    }

    // Validate custom fields
    formData.customFields.forEach((field, index) => {
      if (!field.name.trim()) {
        newErrors[`customField_${index}_name`] = 'Field name is required';
      }
      if (field.type === 'array' && (!field.options || field.options.length === 0)) {
        newErrors[`customField_${index}_options`] = 'Options are required for multiple choice fields';
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      showError('Please fix the form errors before submitting.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLocalLoading(true);
    dispatch(clearError());

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append basic fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('sex', formData.sex);
      submitData.append('parent', formData.parent);
      submitData.append('sortOrder', formData.sortOrder);
      submitData.append('isActive', formData.isActive);
      
      // Append SEO fields
      submitData.append('seo[title]', formData.seo.title);
      submitData.append('seo[description]', formData.seo.description);
      submitData.append('seo[slug]', formData.seo.slug);
      
      // Handle image upload
      if (formData.image.file) {
        submitData.append('image', formData.image.file);
      }
      // If editing and image was removed (preview is empty but there was an image before)
      else if (isEditing && !formData.image.preview && currentCategory?.image) {
        submitData.append('removeImage', 'true');
      }
      
      submitData.append('image[alt]', formData.image.alt);
      
      // Append custom fields
      formData.customFields.forEach((field, index) => {
        submitData.append(`customFields[${index}][name]`, field.name);
        submitData.append(`customFields[${index}][type]`, field.type);
        submitData.append(`customFields[${index}][required]`, field.required);
        if (field.options && field.options.length > 0) {
          field.options.forEach(option => {
            submitData.append(`customFields[${index}][options][]`, option);
          });
        }
      });

      let result;
      
      if (isEditing && categoryId) {
        // Update existing category
        result = await dispatch(updateCategory({
          id: categoryId,
          categoryData: submitData
        })).unwrap();
        showSuccess('Category updated successfully!');
      } else {
        // Create new category
        result = await dispatch(createCategory(submitData)).unwrap();
        showSuccess('Category created successfully!');
      }

      // Navigate back to categories list after success
      setTimeout(() => { 
        navigate('/admin/categories'); 
      }, 2000);
      
    } catch (error) {
      console.error('Category form submission error:', error);
      showError(`Error: ${error.message || 'Failed to save category'}`);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCancel = async () => {
    const result = await showConfirm(
      'Cancel Changes',
      'Are you sure you want to cancel? Any unsaved changes will be lost.',
      'warning',
      { 
        confirmButtonText: 'Yes, cancel!', 
        cancelButtonText: 'Continue editing' 
      }
    );
    
    if (result.isConfirmed) {
      navigate('/admin/categories');
    }
  };

  const isSubmitting = localLoading || isLoading || categoryLoading;

  return (
    <div className='section'>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  {isEditing ? 'Edit Category' : 'Add New Category'}
                  {isEditing && currentCategory && (
                    <small className="text-muted ms-2">- {currentCategory.name}</small>
                  )}
                </h5>
              </div>
              <div className="card-body">
                {/* Display Redux error */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Display form-specific errors */}
                {errors.submit && (
                  <div className="alert alert-danger" role="alert">
                    {errors.submit}
                  </div>
                )}

                {errors.load && (
                  <div className="alert alert-warning" role="alert">
                    {errors.load}
                  </div>
                )}

                {(localLoading || categoryLoading) && isEditing && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading category data...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading category data...</p>
                  </div>
                )}

                {(!localLoading && !categoryLoading) && (
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    {/* Basic Information */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="border-bottom pb-2">Basic Information</h6>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          maxLength={100}
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name}</div>
                        )}
                        <div className="form-text">
                          {formData.name.length}/100 characters
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="sex" className="form-label">
                          Target Gender
                        </label>
                        <select
                          className="form-select"
                          id="sex"
                          name="sex"
                          value={formData.sex}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        >
                          {sexOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label} - {option.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="description" className="form-label">
                          Description
                        </label>
                        <textarea
                          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                          id="description"
                          name="description"
                          rows="3"
                          value={formData.description}
                          onChange={handleChange}
                          maxLength={500}
                          disabled={isSubmitting}
                        />
                        {errors.description && (
                          <div className="invalid-feedback">{errors.description}</div>
                        )}
                        <div className="form-text">
                          {formData.description.length}/500 characters
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="parent" className="form-label">
                          Parent Category
                        </label>
                        <select
                          className="form-select"
                          id="parent"
                          name="parent"
                          value={formData.parent}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        >
                          <option value="">No Parent (Top Level)</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
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
                          disabled={isSubmitting}
                        />
                        <div className="form-text">
                          Lower numbers appear first
                        </div>
                      </div>
                    </div>

                    {/* Image Section */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="border-bottom pb-2">
                          {isEditing ? 'Update Category Image' : 'Category Image'}
                        </h6>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="imageFile" className="form-label">
                          {isEditing ? 'Upload New Image' : 'Category Image'}
                        </label>
                        <input
                          type="file"
                          className={`form-control ${errors.imageFile ? 'is-invalid' : ''}`}
                          id="imageFile"
                          name="imageFile"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                        {errors.imageFile && (
                          <div className="invalid-feedback">{errors.imageFile}</div>
                        )}
                        <div className="form-text">
                          Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="image.alt" className="form-label">
                          Image Alt Text
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="image.alt"
                          name="image.alt"
                          value={formData.image.alt}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Image Preview */}
                      {(formData.image.preview || (isEditing && currentCategory?.image)) && (
                        <div className="col-12 mb-3">
                          <label className="form-label">
                            {isEditing ? 'Current Image' : 'Image Preview'}
                          </label>
                          <div className="d-flex align-items-center gap-3">
                            <img 
                              src={formData.image.preview || currentCategory?.image} 
                              alt="Preview" 
                              className="img-thumbnail"
                              style={{ 
                                maxHeight: '150px', 
                                maxWidth: '150px',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={removeImage}
                              disabled={isSubmitting}
                            >
                              Remove Image
                            </button>
                          </div>
                          {isEditing && !formData.image.file && (
                            <div className="form-text text-muted mt-1">
                              Current image will be kept unless you upload a new one or remove it.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SEO Section */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="border-bottom pb-2">SEO Settings</h6>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="seo.slug" className="form-label">
                          URL Slug
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={`form-control ${errors['seo.slug'] ? 'is-invalid' : ''}`}
                            id="seo.slug"
                            name="seo.slug"
                            value={formData.seo.slug}
                            onChange={handleChange}
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={generateSlug}
                            disabled={!formData.name || isSubmitting}
                          >
                            Generate
                          </button>
                        </div>
                        {errors['seo.slug'] && (
                          <div className="invalid-feedback d-block">
                            {errors['seo.slug']}
                          </div>
                        )}
                        <div className="form-text">
                          Leave empty to auto-generate from name
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="seo.title" className="form-label">
                          SEO Title
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="seo.title"
                          name="seo.title"
                          value={formData.seo.title}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="seo.description" className="form-label">
                          SEO Description
                        </label>
                        <textarea
                          className="form-control"
                          id="seo.description"
                          name="seo.description"
                          rows="2"
                          value={formData.seo.description}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Custom Fields */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0">Custom Fields</h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={addCustomField}
                            disabled={isSubmitting}
                          >
                            Add Custom Field
                          </button>
                        </div>
                        
                        {formData.customFields.length === 0 ? (
                          <div className="text-muted text-center py-3">
                            No custom fields added
                          </div>
                        ) : (
                          formData.customFields.map((field, index) => (
                            <div key={index} className="card mb-3">
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-md-3 mb-3">
                                    <label className="form-label">Field Name *</label>
                                    <input
                                      type="text"
                                      className={`form-control ${errors[`customField_${index}_name`] ? 'is-invalid' : ''}`}
                                      value={field.name}
                                      onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                                      disabled={isSubmitting}
                                    />
                                    {errors[`customField_${index}_name`] && (
                                      <div className="invalid-feedback">
                                        {errors[`customField_${index}_name`]}
                                      </div>
                                    )}
                                  </div>

                                  <div className="col-md-2 mb-3">
                                    <label className="form-label">Type</label>
                                    <select
                                      className="form-select"
                                      value={field.type}
                                      onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                                      disabled={isSubmitting}
                                    >
                                      {customFieldTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                          {type.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="col-md-2 mb-3">
                                    <label className="form-label d-block">Required</label>
                                    <div className="form-check form-switch mt-2">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => handleCustomFieldChange(index, 'required', e.target.checked)}
                                        disabled={isSubmitting}
                                      />
                                    </div>
                                  </div>

                                  {field.type === 'array' && (
                                    <div className="col-md-4 mb-3">
                                      <label className="form-label">Options *</label>
                                      <input
                                        type="text"
                                        className={`form-control ${errors[`customField_${index}_options`] ? 'is-invalid' : ''}`}
                                        value={field.options?.join(', ') || ''}
                                        onChange={(e) => handleCustomFieldOptionsChange(index, e.target.value)}
                                        placeholder="Option 1, Option 2, Option 3"
                                        disabled={isSubmitting}
                                      />
                                      {errors[`customField_${index}_options`] && (
                                        <div className="invalid-feedback">
                                          {errors[`customField_${index}_options`]}
                                        </div>
                                      )}
                                      <div className="form-text">
                                        Separate options with commas
                                      </div>
                                    </div>
                                  )}

                                  <div className="col-md-1 mb-3 d-flex align-items-end">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeCustomField(index)}
                                      disabled={isSubmitting}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            disabled={isSubmitting}
                          />
                          <label className="form-check-label" htmlFor="isActive">
                            Category is active
                          </label>
                        </div>
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
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {isEditing ? 'Updating...' : 'Creating...'}
                              </>
                            ) : (
                              isEditing ? 'Update Category' : 'Create Category'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;