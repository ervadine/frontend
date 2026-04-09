// components/Settings.js
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCompany,
  updateCompanyWithLogo,
  patchCompany,
  uploadCompanyLogo,
  deleteCompanyLogo,
  selectCompany,
  selectCompanyLogo,
  selectCompanyAddress,
  selectCompanyError,
  clearError,
  clearSuccess,
  selectCompanyUpdating,
  selectCompanyLoading,
  selectCompanySuccess,
  createCompany
} from '../../store/redux/companySlice';

const Settings = () => {
  const dispatch = useDispatch();
  const company = useSelector(selectCompany);
  const companyLogo = useSelector(selectCompanyLogo);
  const companyAddress = useSelector(selectCompanyAddress);
  const error = useSelector(selectCompanyError);
  const updating = useSelector(selectCompanyUpdating);
  const loading = useSelector(selectCompanyLoading);
  const success = useSelector(selectCompanySuccess);
  
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    description: '',
    currency: 'USD',
    policy: {
      privacyPolicy: '',
      termsOfService: '',
      returnPolicy: '',
      shippingPolicy: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    businessHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    taxSettings: {
      taxRate: 0,
      taxNumber: ''
    }
  });
  
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [createMode, setCreateMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);
  
  const tabs = [
    { id: 'general', name: 'General', icon: 'bi-gear' },
    { id: 'address', name: 'Address', icon: 'bi-geo-alt' },
    { id: 'policies', name: 'Policies', icon: 'bi-file-text' },
    { id: 'social', name: 'Social Media', icon: 'bi-share' },
    { id: 'hours', name: 'Business Hours', icon: 'bi-clock' },
    { id: 'tax', name: 'Tax', icon: 'bi-calculator' }
  ];

  useEffect(() => {
    dispatch(fetchCompany());
  }, [dispatch]);

  useEffect(() => {
    if (company) {
      // Map the company data to match our form structure
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: {
          street: company.address?.street || '',
          city: company.address?.city || '',
          state: company.address?.state || '',
          zipCode: company.address?.zipCode || '',
          country: company.address?.country || 'United States'
        },
        description: company.description || '',
        currency: company.currency || 'USD',
        policy: {
          privacyPolicy: company.policy?.privacyPolicy || '',
          termsOfService: company.policy?.termsOfService || '',
          returnPolicy: company.policy?.returnPolicy || '',
          shippingPolicy: company.policy?.shippingPolicy || ''
        },
        socialMedia: {
          facebook: company.socialMedia?.facebook || '',
          twitter: company.socialMedia?.twitter || '',
          instagram: company.socialMedia?.instagram || '',
          linkedin: company.socialMedia?.linkedin || ''
        },
        businessHours: {
          monday: company.businessHours?.monday || '9:00 AM - 6:00 PM',
          tuesday: company.businessHours?.tuesday || '9:00 AM - 6:00 PM',
          wednesday: company.businessHours?.wednesday || '9:00 AM - 6:00 PM',
          thursday: company.businessHours?.thursday || '9:00 AM - 6:00 PM',
          friday: company.businessHours?.friday || '9:00 AM - 6:00 PM',
          saturday: company.businessHours?.saturday || '10:00 AM - 4:00 PM',
          sunday: company.businessHours?.sunday || 'Closed'
        },
        taxSettings: company.taxSettings || {
          taxRate: 0,
          taxNumber: ''
        }
      });
      
      if (company.logo?.url) {
        setLogoPreview(company.logo.url);
      }
      setCreateMode(false);
    } else {
      // If no company exists, show create mode
      setCreateMode(true);
      setActiveTab('general'); // Set to general tab for creation
    }
  }, [company]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
    
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  const handleChange = (e, isAddressField = false) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for create form address fields
    if (isAddressField) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }));
    }
    // If it's an address field (starts with "address.")
    else if (name.startsWith('address.')) {
      const field = name.split('.')[1]; // Get the field name after "address."
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } 
    // If it's a policy field (starts with "policy.")
    else if (name.startsWith('policy.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        policy: {
          ...prev.policy,
          [field]: value
        }
      }));
    }
    // If it's a business hours field (starts with "businessHours.")
    else if (name.startsWith('businessHours.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [field]: value
        }
      }));
    }
    // If it's a social media field (starts with "socialMedia.")
    else if (name.startsWith('socialMedia.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [field]: value
        }
      }));
    }
    // If it's a tax settings field (starts with "taxSettings.")
    else if (name.startsWith('taxSettings.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        taxSettings: {
          ...prev.taxSettings,
          [field]: type === 'checkbox' ? checked : (field === 'taxRate' ? parseFloat(value) : value)
        }
      }));
    }
    // Handle direct fields
    else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      alert('Please select a logo file');
      return;
    }
    
    try {
      await dispatch(uploadCompanyLogo(logoFile)).unwrap();
      alert('Logo uploaded successfully!');
      setLogoFile(null);
      fileInputRef.current.value = '';
    } catch (error) {
      alert(`Failed to upload logo: ${error}`);
    }
  };

  const handleDeleteLogo = async () => {
    if (window.confirm('Are you sure you want to delete the logo?')) {
      try {
        await dispatch(deleteCompanyLogo()).unwrap();
        setLogoPreview('');
        alert('Logo deleted successfully!');
      } catch (error) {
        alert(`Failed to delete logo: ${error}`);
      }
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    
    // Enhanced validation based on error message
    const requiredFields = {
      'Company name': formData.name,
      'Email': formData.email,
      'Phone number': formData.phone,
      'Street address': formData.address.street,
      'City': formData.address.city,
      'State': formData.address.state,
      'Zip code': formData.address.zipCode,
      'Privacy policy': formData.policy.privacyPolicy,
      'Terms of service': formData.policy.termsOfService,
      'Return policy': formData.policy.returnPolicy,
      'Shipping policy': formData.policy.shippingPolicy
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n${missingFields.join(', ')}`);
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Prepare company data for creation with correct structure
      const companyData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          zipCode: formData.address.zipCode.trim(),
          country: formData.address.country || 'United States'
        },
        description: formData.description,
        currency: formData.currency,
        policy: {
          privacyPolicy: formData.policy.privacyPolicy,
          termsOfService: formData.policy.termsOfService,
          returnPolicy: formData.policy.returnPolicy,
          shippingPolicy: formData.policy.shippingPolicy
        },
        socialMedia: formData.socialMedia,
        businessHours: formData.businessHours,
        taxSettings: formData.taxSettings
      };
      
      console.log('Creating company with data:', companyData);
      
      // Create company with or without logo
      if (logoFile) {
        await dispatch(createCompany({
          companyData,
          logoFile
        })).unwrap();
      } else {
        await dispatch(createCompany({
          companyData
        })).unwrap();
      }
      
      alert('Company created successfully!');
      setCreateMode(false);
      setIsCreating(false);
      
      // Refresh company data
      dispatch(fetchCompany());
      
    } catch (error) {
      setIsCreating(false);
      console.error('Create company error:', error);
      alert(`Failed to create company: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSubmitGeneral = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateCompanyWithLogo({
        companyData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
          currency: formData.currency
        },
        logoFile: logoFile || undefined
      })).unwrap();
      alert('General settings updated successfully!');
      setLogoFile(null);
      fileInputRef.current.value = '';
    } catch (error) {
      alert(`Failed to update settings: ${error}`);
    }
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    try {
      await dispatch(patchCompany({
        address: formData.address
      })).unwrap();
      alert('Address updated successfully!');
    } catch (error) {
      alert(`Failed to update address: ${error}`);
    }
  };

  const handleSubmitSocial = async (e) => {
    e.preventDefault();
    try {
      await dispatch(patchCompany({
        socialMedia: formData.socialMedia
      })).unwrap();
      alert('Social media updated successfully!');
    } catch (error) {
      alert(`Failed to update social media: ${error}`);
    }
  };

  const handleSubmitHours = async (e) => {
    e.preventDefault();
    try {
      await dispatch(patchCompany({
        businessHours: formData.businessHours
      })).unwrap();
      alert('Business hours updated successfully!');
    } catch (error) {
      alert(`Failed to update business hours: ${error}`);
    }
  };

  const handleSubmitPolicies = async (e) => {
    e.preventDefault();
    try {
      // Make sure policy object has the correct field names
      const policyData = {
        privacyPolicy: formData.policy.privacyPolicy,
        termsOfService: formData.policy.termsOfService,
        returnPolicy: formData.policy.returnPolicy,
        shippingPolicy: formData.policy.shippingPolicy
      };
      
      await dispatch(patchCompany({
        policy: policyData
      })).unwrap();
      alert('Policies updated successfully!');
    } catch (error) {
      alert(`Failed to update policies: ${error}`);
    }
  };

  const handleSubmitTax = async (e) => {
    e.preventDefault();
    try {
      await dispatch(patchCompany({
        taxSettings: formData.taxSettings
      })).unwrap();
      alert('Tax settings updated successfully!');
    } catch (error) {
      alert(`Failed to update tax settings: ${error}`);
    }
  };

  const renderCreateCompanyForm = () => {
    return (
      <div className="tab-pane active">
        <div className="alert alert-info mb-4">
          <h5 className="alert-heading">Welcome to Dar Collection Setup!</h5>
          <p className="mb-0">
            It looks like this is your first time setting up your store. 
            Please provide your company information to get started.
          </p>
        </div>
        
        <form onSubmit={handleCreateCompany}>
          <div className="row mb-4">
            <div className="col-md-12">
              <h6 className="mb-3">Company Logo</h6>
              <div className="d-flex align-items-center mb-3">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Company Logo" 
                    className="img-thumbnail me-3"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center me-3"
                    style={{ width: '100px', height: '100px' }}>
                    <i className="bi bi-building fs-1 text-secondary"></i>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="form-control mb-2"
                    style={{ width: '300px' }}
                  />
                  <small className="text-muted">Upload your company logo (optional, max 5MB)</small>
                </div>
              </div>
            </div>
          </div>
          
          <h5 className="mb-4">Basic Information</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Company Name *</label>
              <input 
                type="text" 
                className="form-control" 
                name="name"
                value={formData.name}
                onChange={(e) => handleChange(e)}  
                required
                placeholder="Dar Collection"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Company Email *</label>
              <input 
                type="email" 
                className="form-control" 
                name="email"
                value={formData.email}
                onChange={(e) => handleChange(e)}  
                required
                placeholder="info@darcollection.com"
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Company Phone *</label>
              <input 
                type="text" 
                className="form-control" 
                name="phone"
                value={formData.phone}
                onChange={(e) => handleChange(e)}  
                required
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Currency</label>
              <select 
                className="form-select"
                name="currency"
                value={formData.currency}
                onChange={(e) => handleChange(e)}  
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="form-label">Company Description</label>
            <textarea 
              className="form-control" 
              rows="4"
              name="description"
              value={formData.description}
              onChange={(e) => handleChange(e)} 
              placeholder="Describe your company... (e.g., 'Dar Collection - Where Heritage Meets Modern Luxury. We offer curated artisanal home decor, exquisite textiles, and timeless accessories that blend traditional craftsmanship with contemporary design.')"
            ></textarea>
            <small className="text-muted">This will appear on your website and marketing materials</small>
          </div>
          
          <h5 className="mb-4">Company Address</h5>
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Street Address *</label>
              <input 
                type="text" 
                className="form-control" 
                name="street"  
                value={formData.address.street}
                onChange={(e) => handleChange(e, true)}  
                required
                placeholder="123 Artisan Street"
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">City *</label>
              <input 
                type="text" 
                className="form-control" 
                name="city" 
                value={formData.address.city}
                onChange={(e) => handleChange(e, true)}  
                required
                placeholder="New York"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">State/Province *</label>
              <input 
                type="text" 
                className="form-control" 
                name="state"  
                value={formData.address.state}
                onChange={(e) => handleChange(e, true)} 
                required
                placeholder="NY"
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">ZIP/Postal Code *</label>
              <input 
                type="text" 
                className="form-control" 
                name="zipCode" 
                value={formData.address.zipCode}
                onChange={(e) => handleChange(e, true)}  
                required
                placeholder="10001"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Country</label>
              <input 
                type="text" 
                className="form-control" 
                name="country"  
                value={formData.address.country}
                onChange={(e) => handleChange(e, true)}  
                placeholder="United States"
              />
            </div>
          </div>
          
          <h5 className="mb-4">Policies</h5>
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Privacy Policy *</label>
              <textarea 
                className="form-control" 
                rows="4"
                name="policy.privacyPolicy"
                value={formData.policy.privacyPolicy}
                onChange={(e) => handleChange(e)}  
                required
                placeholder="Enter your privacy policy..."
              ></textarea>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Terms of Service *</label>
              <textarea 
                className="form-control" 
                rows="4"
                name="policy.termsOfService"
                value={formData.policy.termsOfService}
                onChange={(e) => handleChange(e)}  
                required
                placeholder="Enter your terms of service..."
              ></textarea>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Return Policy *</label>
              <textarea 
                className="form-control" 
                rows="4"
                name="policy.returnPolicy"
                value={formData.policy.returnPolicy}
                onChange={(e) => handleChange(e)}  
                required
                placeholder="Enter your return policy..."
              ></textarea>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Shipping Policy *</label>
              <textarea 
                className="form-control" 
                rows="4"
                name="policy.shippingPolicy"
                value={formData.policy.shippingPolicy}
                onChange={(e) => handleChange(e)}  
                required
                placeholder="Enter your shipping policy..."
              ></textarea>
            </div>
          </div>
          
          <div className="alert alert-warning mt-4">
            <h6 className="alert-heading">Quick Setup Notice</h6>
            <p className="mb-0">
              You can configure other settings like social media, business hours, 
              and tax after the initial setup.
            </p>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-lg mt-3"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Company...
              </>
            ) : (
              'Create Company & Continue Setup'
            )}
          </button>
        </form>
      </div>
    );
  };

  const renderTabContent = () => {
    // If no company exists, show create form
    if (createMode) {
      return renderCreateCompanyForm();
    }
    
    switch (activeTab) {
      case 'general':
        return (
          <div className="tab-pane active">
            <h5 className="mb-4">General Settings</h5>
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => dispatch(clearError())}></button>
              </div>
            )}
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                Settings updated successfully!
                <button type="button" className="btn-close" onClick={() => dispatch(clearSuccess())}></button>
              </div>
            )}
            <form onSubmit={handleSubmitGeneral}>
              <div className="row mb-4">
                <div className="col-md-12">
                  <h6 className="mb-3">Company Logo</h6>
                  <div className="d-flex align-items-center mb-3">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Company Logo" 
                        className="img-thumbnail me-3"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center me-3"
                        style={{ width: '100px', height: '100px' }}>
                        <i className="bi bi-building fs-1 text-secondary"></i>
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="form-control mb-2"
                        style={{ width: '300px' }}
                      />
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          onClick={handleLogoUpload}
                          disabled={!logoFile || updating}
                          className="btn btn-primary btn-sm"
                        >
                          {updating ? 'Uploading...' : 'Upload Logo'}
                        </button>
                        {companyLogo && (
                          <button
                            type="button"
                            onClick={handleDeleteLogo}
                            disabled={updating}
                            className="btn btn-danger btn-sm"
                          >
                            Delete Logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Company Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}  
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Company Email *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}  
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Company Phone</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange} 
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Currency</label>
                  <select 
                    className="form-select"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}  
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}  
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save General Settings'}
              </button>
            </form>
          </div>
        );

      case 'address':
        return (
          <div className="tab-pane active">
            <h5 className="mb-4">Address Settings</h5>
            <form onSubmit={handleSubmitAddress}>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Street Address *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="address.street" 
                    value={formData.address.street}
                    onChange={handleChange}  
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="address.city"  
                    value={formData.address.city}
                    onChange={handleChange} 
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">State/Province *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="address.state"  
                    value={formData.address.state}
                    onChange={handleChange}  
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ZIP/Postal Code *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="address.zipCode"  
                    value={formData.address.zipCode}
                    onChange={handleChange}  
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Country</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="address.country"  
                    value={formData.address.country}
                    onChange={handleChange}  
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        );

      case 'policies':
        return (
          <div className="tab-pane active">
            <h5 className="mb-4">Policy Settings</h5>
            <form onSubmit={handleSubmitPolicies}>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Privacy Policy *</label>
                  <textarea 
                    className="form-control" 
                    rows="5"
                    name="policy.privacyPolicy"
                    value={formData.policy.privacyPolicy}
                    onChange={handleChange}  
                    required
                  ></textarea>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Terms of Service *</label>
                  <textarea 
                    className="form-control" 
                    rows="5"
                    name="policy.termsOfService"
                    value={formData.policy.termsOfService}
                    onChange={handleChange}  
                    required
                  ></textarea>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Return Policy *</label>
                  <textarea 
                    className="form-control" 
                    rows="5"
                    name="policy.returnPolicy"
                    value={formData.policy.returnPolicy}
                    onChange={handleChange}  
                    required
                  ></textarea>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Shipping Policy *</label>
                  <textarea 
                    className="form-control" 
                    rows="5"
                    name="policy.shippingPolicy"
                    value={formData.policy.shippingPolicy}
                    onChange={handleChange}  
                    required
                  ></textarea>
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Policies'}
              </button>
            </form>
          </div>
        );

      case 'social':
        return (
          <div className="tab-pane active">
            <h5 className="mb-4">Social Media Settings</h5>
            <form onSubmit={handleSubmitSocial}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Facebook URL</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-facebook"></i>
                    </span>
                    <input 
                      type="url" 
                      className="form-control" 
                      name="socialMedia.facebook"
                      value={formData.socialMedia.facebook}
                      onChange={handleChange} 
                      placeholder="https://facebook.com/yourcompany"
                    />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Twitter URL</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-twitter"></i>
                    </span>
                    <input 
                      type="url" 
                      className="form-control" 
                      name="socialMedia.twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleChange}  
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Instagram URL</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-instagram"></i>
                    </span>
                    <input 
                      type="url" 
                      className="form-control" 
                      name="socialMedia.instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleChange}  
                      placeholder="https://instagram.com/yourcompany"
                    />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">LinkedIn URL</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-linkedin"></i>
                    </span>
                    <input 
                      type="url" 
                      className="form-control" 
                      name="socialMedia.linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={handleChange} 
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Social Media'}
              </button>
            </form>
          </div>
        );

      case 'hours':
        return (
          <div className="tab-pane active">
            <h5 className="mb-4">Business Hours</h5>
            <form onSubmit={handleSubmitHours}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div className="row mb-3" key={day}>
                  <div className="col-md-3">
                    <label className="form-label text-capitalize">{day}</label>
                  </div>
                  <div className="col-md-9">
                    <input 
                      type="text" 
                      className="form-control"
                      name={`businessHours.${day}`}
                      value={formData.businessHours[day] || ''}
                      onChange={handleChange}  
                      placeholder="e.g., 9:00 AM - 6:00 PM or Closed"
                    />
                  </div>
                </div>
              ))}
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Business Hours'}
              </button>
            </form>
          </div>
        );

      case 'tax':
        return (
          <div className="tab-pane active">
            <h5 className="mb-4">Tax Settings</h5>
            <form onSubmit={handleSubmitTax}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Tax Rate (%)</label>
                  <div className="input-group">
                    <input 
                      type="number" 
                      className="form-control"
                      name="taxSettings.taxRate"
                      value={formData.taxSettings.taxRate}
                      onChange={handleChange}  
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <span className="input-group-text">%</span>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Tax/VAT Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  name="taxSettings.taxNumber"
                  value={formData.taxSettings.taxNumber}
                  onChange={handleChange} 
                  placeholder="Enter tax/VAT number"
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Tax Settings'}
              </button>
            </form>
          </div>
        );

      default:
        return (
          <div className="tab-pane active">
            <h5 className="mb-4">Settings</h5>
            <p>Select a settings category from the menu.</p>
          </div>
        );
    }
  };

  // If loading and no company exists, show different loading state
  if (loading && !company && !createMode) {
    return (
      <div className="section">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading company settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='section'>
      <div className="container-fluid">
        <div className="container">
          {createMode ? (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-building me-2"></i>
                      Setup Your Company
                    </h5>
                  </div>
                  <div className="card-body">
                    {renderCreateCompanyForm()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-3">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title mb-0">Settings Menu</h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                      {tabs.map(tab => (
                        <button
                          key={tab.id}
                          className={`list-group-item list-group-item-action d-flex align-items-center ${
                            activeTab === tab.id ? 'active' : ''
                          }`}
                          onClick={() => setActiveTab(tab.id)}
                        >
                          <i className={`${tab.icon} me-2`}></i>
                          {tab.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-9">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      {tabs.find(tab => tab.id === activeTab)?.name} Settings
                    </h5>
                  </div>
                  <div className="card-body">
                    {renderTabContent()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;