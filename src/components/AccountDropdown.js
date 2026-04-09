import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';

const AccountDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Use the custom hook
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    getFullName, 
    getUserActivity,
    getEmailVerificationStatus,
    logout
  } = useUserProfile();

  // Account sections for navigation
  const accountSections = [
    { id: 'profile', icon: 'bi-person-circle', label: 'My Profile' },
    { id: 'orders', icon: 'bi-bag-check', label: 'My Orders' },
    { id: 'wishlist', icon: 'bi-heart', label: 'My Wishlist' },
    { id: 'payment', icon: 'bi-credit-card', label: 'Payment Methods' },
    { id: 'addresses', icon: 'bi-geo-alt', label: 'Addresses' },
    { id: 'settings', icon: 'bi-gear', label: 'Settings' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle navigation to account section - UPDATED
  const handleAccountNavigation = (sectionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated) {
      // Use navigate to change the URL
      navigate(`/account?section=${sectionId}`);
    } else {
      navigate('/login');
    }
    
    setIsOpen(false);
  };

  // Handle logout
  const handleLogout = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      setIsLoggingOut(true);
      setIsOpen(false);
      await logout();
      // Reset logging out state after a short delay
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  // Format last login time
  const formatLastLogin = () => {
    const activity = getUserActivity();
    if (!activity.lastLogin) return 'Never';
    
    const now = new Date();
    const diffTime = Math.abs(now - activity.lastLogin);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return activity.lastLogin.toLocaleDateString();
  };

  // Render account links
  const renderAccountLinks = () => {
    return accountSections.map((section, index) => (
      <button 
        key={index}
        className="dropdown-item d-flex align-items-center" 
        onClick={(e) => handleAccountNavigation(section.id, e)}
        style={{
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          width: '100%',
          textAlign: 'left',
          padding: '0.5rem 1rem'
        }}
      >
        <i className={`${section.icon} me-2`}></i>
        <span>{section.label}</span>
      </button>
    ));
  };

  // Render user-specific content when authenticated
  const renderAuthenticatedContent = () => {
    const fullName = getFullName();
    const emailStatus = getEmailVerificationStatus();
    
    return (
      <>
        <div className="dropdown-header p-3">
          <div className="d-flex align-items-center mb-2">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="rounded-circle me-2"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
            ) : (
              <i className="bi bi-person-circle me-2" style={{ fontSize: '2rem' }}></i>
            )}
            <div>
              <h6 className="mb-0">{fullName || 'Welcome Back!'}</h6>
              <small className="text-muted">{user?.email}</small>
            </div>
          </div>
          
          {!emailStatus.isVerified && (
            <div className="alert alert-warning alert-sm mb-0 mt-2 p-2">
              <small>
                <i className="bi bi-exclamation-triangle me-1"></i>
                {emailStatus.isExpired ? 'Verification expired' : 'Email not verified'}
              </small>
            </div>
          )}
          
          <p className="mb-0 mt-2 small text-muted">
            <i className="bi bi-clock-history me-1"></i>
            Last login: {formatLastLogin()}
          </p>
        </div>
        
        <div className="dropdown-divider my-0"></div>
        
        <div className="dropdown-body">
          {renderAccountLinks()}
        </div>
        
        <div className="dropdown-divider my-0"></div>
        
        <div className="dropdown-footer p-3">
          <button 
            className="btn btn-outline-danger w-100" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{ cursor: 'pointer' }}
          >
            {isLoggingOut ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing Out...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-right me-2"></i>
                Sign Out
              </>
            )}
          </button>
        </div>
      </>
    );
  };

  // Render guest content when not authenticated
  const renderGuestContent = () => (
    <>
      <div className="dropdown-header p-3">
        <h6>Welcome to <span className="text-primary">Dar Collection</span></h6>
        <p className="mb-2 small">Access account &amp; manage orders</p>
      </div>
      
      <div className="dropdown-divider my-0"></div>
      
      <div className="dropdown-body">
        {accountSections.slice(0, 2).map((section, index) => (
          <button 
            key={index}
            className="dropdown-item d-flex align-items-center" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
              setIsOpen(false);
            }}
            style={{
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 1rem'
            }}
          >
            <i className={`${section.icon} me-2`}></i>
            <span>{section.label}</span>
          </button>
        ))}
      </div>
      
      <div className="dropdown-divider my-0"></div>
      
      <div className="dropdown-footer p-3">
        <button 
          className="btn btn-primary w-100 mb-2"
          onClick={() => {
            navigate('/login');
            setIsOpen(false);
          }}
          style={{ cursor: 'pointer' }}
        >
          Sign In
        </button>
        <button 
          className="btn btn-outline-primary w-100"
          onClick={() => {
            navigate('/register');
            setIsOpen(false);
          }}
          style={{ cursor: 'pointer' }}
        >
          Register
        </button>
      </div>
    </>
  );

  return (
    <div className="dropdown account-dropdown" ref={dropdownRef}>
      <button 
        className="header-action-btn position-relative" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Account menu"
        disabled={isLoggingOut}
        style={{ 
          cursor: 'pointer',
          background: 'none',
          border: 'none'
        }}
      >
        <i className="bi bi-person"></i>
        {isAuthenticated && user && !isLoggingOut && (
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle">
            <span className="visually-hidden">User logged in</span>
          </span>
        )}
        {isLoggingOut && (
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-secondary border border-light rounded-circle">
            <span className="visually-hidden">Logging out...</span>
          </span>
        )}
      </button>
      
      <div 
        className={`dropdown-menu ${isOpen ? 'show' : ''}`} 
        style={{ 
          position: 'absolute', 
          right: 0, 
          left: 'auto',
          marginTop: '0.5rem',
          minWidth: '280px',
          maxWidth: '320px'
        }}
      >
        {isAuthenticated && user ? renderAuthenticatedContent() : renderGuestContent()}
      </div>
    </div>
  );
};

export default AccountDropdown;