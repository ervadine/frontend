// components/Cart/CouponForm.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { applyCoupon, removeCoupon } from '../../store/redux/cartSlice';

const CouponForm = ({ onApplyCoupon, coupon }) => {
  const dispatch = useDispatch();
  
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Reset form when coupon changes
  useEffect(() => {
    if (coupon && coupon.code) {
      setCouponCode(coupon.code);
      setSuccessMessage(`Coupon "${coupon.code}" applied successfully!`);
      setError('');
    } else {
      setSuccessMessage('');
      setError('');
      setCouponCode('');
    }
  }, [coupon]);
  
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    const code = couponCode.trim().toUpperCase();
    
    if (!code) {
      setError('Please enter a coupon code');
      return;
    }
    
    // Check if already applied
    if (coupon && coupon.code === code) {
      setError('This coupon is already applied');
      return;
    }
    
    // Clear previous messages
    setError('');
    setSuccessMessage('');
    
    setIsApplying(true);
    
    try {
      // If onApplyCoupon is provided, use it (from props)
      if (onApplyCoupon) {
        await onApplyCoupon(code);
        setSuccessMessage(`Coupon "${code}" applied successfully!`);
      } else {
        // Otherwise use Redux directly
        const result = await dispatch(applyCoupon({ code })).unwrap();
        
        if (result.success) {
          setSuccessMessage(`Coupon "${code}" applied successfully!`);
          setCouponCode(code); // Show applied coupon in input
        } else {
          setError(result.message || 'Invalid coupon code');
        }
      }
    } catch (err) {
      console.error('Coupon apply error:', err);
      setError(err.message || 'Failed to apply coupon. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleRemoveCoupon = async () => {
    if (!coupon || !coupon.code) return;
    
    setIsRemoving(true);
    setError('');
    
    try {
      // If onApplyCoupon was provided via props, we need a way to remove
      // For now, just dispatch removeCoupon
      await dispatch(removeCoupon()).unwrap();
      setSuccessMessage('');
      setCouponCode('');
    } catch (err) {
      setError(err.message || 'Failed to remove coupon');
    } finally {
      setIsRemoving(false);
    }
  };
  
  // Check if coupon is actually valid
  const isCouponValid = coupon && coupon.code && (coupon.discount || coupon.discountPercentage);
  
  const getDiscountText = () => {
    if (!coupon) return '';
    
    if (coupon.discountType === 'percentage') {
      return `${coupon.discount}% off`;
    } else if (coupon.discount) {
      return `$${coupon.discount} off`;
    } else if (coupon.discountPercentage) {
      return `${coupon.discountPercentage}% off`;
    }
    return '';
  };
  
  return (
    <div className="coupon-form card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="bi bi-tag me-2"></i>
          Apply Coupon
        </h5>
        
        {/* Success Message */}
        {successMessage && !isCouponValid && (
          <div className="alert alert-info mb-3">
            <i className="bi bi-info-circle me-2"></i>
            {successMessage}
          </div>
        )}
        
        {/* Applied Coupon Display */}
        {isCouponValid && (
          <div className="applied-coupon alert alert-success mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <i className="bi bi-check-circle me-2"></i>
                <strong>{coupon.code}</strong> applied successfully!
                {getDiscountText() && (
                  <span className="ms-2 badge bg-success">
                    {getDiscountText()}
                  </span>
                )}
              </div>
              <button 
                type="button" 
                className="btn-close"
                onClick={handleRemoveCoupon}
                disabled={isRemoving}
                aria-label="Remove coupon"
              ></button>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-danger mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        
        {/* Coupon Input Form */}
        <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
          <div className="flex-grow-1">
            <input
              type="text"
              className={`form-control ${error ? 'is-invalid' : ''} ${isCouponValid ? 'is-valid' : ''}`}
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setError('');
              }}
              disabled={isApplying || isRemoving || isCouponValid}
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn ${isCouponValid ? 'btn-success' : 'btn-primary'}`}
            disabled={isApplying || isRemoving || (isCouponValid && couponCode === coupon?.code)}
          >
            {isApplying ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Applying...
              </>
            ) : isCouponValid ? (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Applied
              </>
            ) : (
              'Apply'
            )}
          </button>
        </form>
        
        {/* Remove Coupon Link */}
        {isCouponValid && (
          <div className="mt-2 text-end">
            <button 
              className="btn btn-link btn-sm text-danger p-0"
              onClick={handleRemoveCoupon}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Removing...
                </>
              ) : (
                <>
                  <i className="bi bi-x-circle me-1"></i>
                  Remove coupon
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Coupon Info */}
        {!isCouponValid && (
          <div className="coupon-info mt-3">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Enter your coupon code to save on your order.
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponForm;