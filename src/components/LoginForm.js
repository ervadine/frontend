// components/LoginForm.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser, clearError, clearMessage } from '../store/redux/authSlice';
import useSweetAlert from '../hooks/useSweetAlert';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success, message, isAuthenticated } = useSelector((state) => state.auth);
  const { success: successAlert, error: errorAlert, loading: loadingAlert, close: closeAlert } = useSweetAlert();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const isLoadingRef = useRef(false);

  // Track loading state with ref to avoid stale closures
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Handle navigation after successful login
  useEffect(() => {
    if (isAuthenticated && success) {
      console.log('Login successful, navigating to home page');
      
      // Close loading alert first
      closeAlert();
      
      // Small delay to ensure loading alert is closed
      setTimeout(() => {
        successAlert('Login Successful!', 'You have been successfully logged in.', {
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Navigate to home page after alert
          navigate("/", { replace: true });
        });
      }, 100);
      
      // Clear any messages 
      dispatch(clearMessage());
    }
  }, [isAuthenticated, success, navigate, successAlert, dispatch, closeAlert]);

  // FIXED: Handle errors - don't clear error immediately
  useEffect(() => {
    if (error && !hasShownError) {
      console.log('Error detected:', error);
      
      // Close loading alert if open
      closeAlert();
      
      // Set flag to prevent multiple alerts for the same error
      setHasShownError(true);
      
      // Show error alert but don't clear error immediately
      errorAlert('Login Failed', error, {
        confirmButtonText: 'Try Again',
        timer: 5000, // Show for 5 seconds
        timerProgressBar: true
      }).then(() => {
        // Clear error only after user acknowledges or timer expires
        dispatch(clearError());
        setHasShownError(false);
      });
    }
  }, [error, errorAlert, dispatch, closeAlert, hasShownError]);

  // Reset error flag when error changes
  useEffect(() => {
    if (error) {
      setHasShownError(false);
    }
  }, [error]);

  // Close loading alert when not loading AND not in success/error state
  useEffect(() => {
    if (!isLoading && !success && !error) {
      console.log('Closing loading alert - normal state');
      closeAlert();
    }
  }, [isLoading, success, error, closeAlert]);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    rememberMe: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        console.log('Submitting login form with values:', values);
        
        // Clear any previous errors and reset error flag
        dispatch(clearError());
        setHasShownError(false);
        
        // Show loading alert when starting login process
        //loadingAlert('Logging in...', 'Please wait while we sign you in.');
        
        const result = await dispatch(loginUser(values));
        
        console.log('Dispatch result:', result);
        
        if (loginUser.fulfilled.match(result)) {
          console.log('Login successful in formik:', result.payload);
          resetForm();
          // Navigation is handled in the useEffect above
        }
        
        if (loginUser.rejected.match(result)) {
          console.log('Login failed in formik:', result);
          // Error is handled in the useEffect above
        }
      } catch (err) {
        console.error('Unexpected error in formik:', err);
        // Close loading alert
        closeAlert();
        errorAlert('Login Failed', 'An unexpected error occurred. Please try again.', {
          timer: 5000,
          timerProgressBar: true
        });
      }
    }
  });

  // Monitor form validity and update local state
  useEffect(() => {
    const checkFormValidity = async () => {
      try {
        await validationSchema.validate(formik.values, { abortEarly: false });
        setIsFormValid(true);
      } catch (error) {
        setIsFormValid(false);
      }
    };

    checkFormValidity();
  }, [formik.values]);

  // Check if form has valid values
  const hasValidFormValues = () => {
    const { email, password } = formik.values;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return email && 
           password && 
           password.length >= 6 && 
           emailRegex.test(email);
  };

  // Helper function to get form control class
  const getFormControlClass = (fieldName) => {
    const isTouched = formik.touched[fieldName];
    const hasError = formik.errors[fieldName];
    
    if (isTouched && hasError) return 'form-control form-control-lg is-invalid';
    if (isTouched && !hasError) return 'form-control form-control-lg is-valid';
    return 'form-control form-control-lg';
  };

  // Helper function to check if field should show error
  const shouldShowError = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  // Check if button should be enabled
  const isSubmitEnabled = () => {
    if (hasValidFormValues()) {
      return true;
    }
    return formik.isValid && formik.dirty;
  };

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      {/* Success Message */}
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success!</strong> {message || 'Login successful!'}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowSuccess(false)}
          ></button>
        </div>
      )}

      <div className="row g-3">
        {/* Email Field */}
        <div className="col-12">
          <div className="mb-4">
            <label htmlFor="login-email" className="form-label">
              Email address *
            </label>
            <input
              type="email"
              className={getFormControlClass('email')}
              id="login-email"
              name="email"
              value={formik.values.email}
              onChange={(e) => {
                formik.handleChange(e);
                formik.validateForm();
              }}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            {shouldShowError('email') && (
              <div className="invalid-feedback">{formik.errors.email}</div>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="col-12">
          <div className="mb-4">
            <label htmlFor="login-password" className="form-label">
              Password *
            </label>
            <input
              type="password"
              className={getFormControlClass('password')}
              id="login-password"
              name="password"
              value={formik.values.password}
              onChange={(e) => {
                formik.handleChange(e);
                formik.validateForm();
              }}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {shouldShowError('password') && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="remember-me"
            name="rememberMe"
            checked={formik.values.rememberMe}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading}
          />
          <label className="form-check-label" htmlFor="remember-me">
            Remember me
          </label>
        </div>
        <Link to="/forgot-password" className="forgot-password text-decoration-none">
          Forgot Password?
        </Link>
      </div>

      <div className="d-grid">
        <button 
          type="submit" 
          className="btn btn-primary btn-lg"
          disabled={isLoading || !isSubmitEnabled()}
        >
          {isLoading ? (
            <>
              <span 
                className="spinner-border spinner-border-sm me-2" 
                role="status" 
                aria-hidden="true"
              ></span>
              Signing in...
            </>
          ) : ( 
            'Login'
          )}
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="mb-0">
          Don't have an account?{' '}
          <Link to="/register" className="text-decoration-none fw-semibold">
            Sign up here
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;