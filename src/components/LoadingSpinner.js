// components/UI/LoadingSpinner.js (Simple Version)
import React from 'react';
import './loading.css'
const LoadingSpinner = ({ 
  size = 'medium',
  text = 'Loading...'
}) => {
  const sizeStyles = {
    small: { width: '1.5rem', height: '1.5rem' },
    medium: { width: '2.5rem', height: '2.5rem' },
    large: { width: '4rem', height: '4rem' }
  }[size];

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div 
        className="spinner-border text-primary" 
        style={sizeStyles}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-2 text-muted mb-0">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;