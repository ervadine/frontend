// components/RegisterForm.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerUser, clearError, clearMessage } from '../store/redux/authSlice';
import useSweetAlert from '../hooks/useSweetAlert';
import '../styles/sweetalert-custom.css';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success, message } = useSelector((state) => state.auth);
  const { success: successAlert, error: errorAlert, loading: loadingAlert, close: closeAlert } = useSweetAlert();
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if token exists and redirect to home page
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  // Handle success state with SweetAlert and redirect
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      
      // Close any loading alerts first
      closeAlert();
      
      successAlert(
        'Registration Successful!',
        message || 'Your account has been created successfully. You will be redirected to login page.',
        {
          confirmButtonText: 'Continue',
          timer: 3000,
          timerProgressBar: true
        }
      ).then(() => {
        // Redirect to login page after successful registration
        navigate('/login');
      });
      
      // Clear success message
      dispatch(clearMessage());
      
      // Alternative: Auto redirect after timer
      const timer = setTimeout(() => {
        setShowSuccess(false);
        navigate('/login');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, message, navigate, successAlert, dispatch, closeAlert]);

  // Handle error state with SweetAlert
  useEffect(() => {
    if (error) {
      // Close loading alert if open
      closeAlert();
      
      errorAlert(
        'Registration Failed',
        error || 'There was an error creating your account. Please try again.',
        {
          confirmButtonText: 'Try Again'
        }
      ).then(() => {
        // Clear error after showing alert
        dispatch(clearError());
      });
    }
  }, [error, errorAlert, dispatch, closeAlert]);

  // Validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .matches(/^[a-zA-Z]+$/, 'First name can only contain letters'),
    lastName: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .matches(/^[a-zA-Z]+$/, 'Last name can only contain letters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
    phone: Yup.string()
      .optional()
      .matches(
        /^\+?[1-9]\d{1,14}$/,
        'Please provide a valid phone number with country code (e.g., +1234567890)'
      )
      .max(20, 'Phone number must be less than 20 characters'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    agreeTerms: Yup.boolean()
      .required('You must accept the terms and conditions')
      .oneOf([true], 'You must accept the terms and conditions') 
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    },
    validationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        // Extract only the agreeTerms field and keep all others including confirmPassword
        const { agreeTerms, ...userData } = values;
        
        // Show loading alert
        loadingAlert('Creating Account...', 'Please wait while we create your account.');
        
        // Remove phone field if empty
        if (!userData.phone || userData.phone === '') {
          delete userData.phone;
        }
        
        // Log userData for debugging
        console.log('Sending registration data:', userData);
        
        // Dispatch registerUser with userData that includes confirmPassword
        const result = await dispatch(registerUser(userData));
        
        if (registerUser.fulfilled.match(result)) {
          console.log('Registration successful:', result.payload);
          resetForm();
        }
        
        if (registerUser.rejected.match(result)) {
          console.log('Registration failed:', result);
          // Error is handled in useEffect
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        closeAlert();
        errorAlert('Registration Failed', 'An unexpected error occurred. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  });

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

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // // Add + if it's the first character and not already present
    // if (value.length > 0 && !value.startsWith('+')) {
    //   value = '+' + value;
    // }
    
    formik.setFieldValue('phone', value);
  };

  // Check if submit button should be enabled
  const isSubmitEnabled = () => {
    return formik.isValid && formik.dirty && !isLoading;
  };

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      {/* Success Message */}
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success!</strong> {message || 'Your account has been created successfully.'}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowSuccess(false)}
          ></button>
        </div>
      )}

      <div className="row g-3">
        {/* First Name */}
        <div className="col-md-6">
          <div className="mb-4">
            <label htmlFor="reg-firstname" className="form-label">
              First name *
            </label>
            <input
              type="text"
              className={getFormControlClass('firstName')}
              id="reg-firstname"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              placeholder="Enter your first name"
            />
            {shouldShowError('firstName') && (
              <div className="invalid-feedback">{formik.errors.firstName}</div>
            )}
          </div>
        </div>

        {/* Last Name */}
        <div className="col-md-6">
          <div className="mb-4">
            <label htmlFor="reg-lastname" className="form-label">
              Last name *
            </label>
            <input
              type="text"
              className={getFormControlClass('lastName')}
              id="reg-lastname"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              placeholder="Enter your last name"
            />
            {shouldShowError('lastName') && (
              <div className="invalid-feedback">{formik.errors.lastName}</div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="col-12">
          <div className="mb-4">
            <label htmlFor="reg-email" className="form-label">
              Email address *
            </label>
            <input
              type="email"
              className={getFormControlClass('email')}
              id="reg-email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              placeholder="Enter your email address"
            />
            {shouldShowError('email') && (
              <div className="invalid-feedback">{formik.errors.email}</div>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="col-12">
          <div className="mb-4">
            <label htmlFor="reg-phone" className="form-label">
              Phone number
            </label>
            <input
              type="tel"
              className={getFormControlClass('phone')}
              id="reg-phone"
              name="phone"
              value={formik.values.phone}
              onChange={handlePhoneChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              placeholder="+1234567890"
            />
            {shouldShowError('phone') && (
              <div className="invalid-feedback">{formik.errors.phone}</div>
            )}
            <div className="form-text">
              Include country code (e.g., +1 for US, +44 for UK). This field is optional.
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="col-md-6">
          <div className="mb-4">
            <label htmlFor="reg-password" className="form-label">
              Password *
            </label>
            <input
              type="password"
              className={getFormControlClass('password')}
              id="reg-password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              placeholder="Create a strong password"
            />
            {shouldShowError('password') && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
            <div className="form-text">
              Password must be at least 8 characters with uppercase, lowercase, and number.
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="col-md-6">
          <div className="mb-4">
            <label htmlFor="reg-confirm-password" className="form-label">
              Confirm password *
            </label>
            <input
              type="password"
              className={getFormControlClass('confirmPassword')}
              id="reg-confirm-password"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              placeholder="Confirm your password"
            />
            {shouldShowError('confirmPassword') && (
              <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
            )}
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="col-12">
          <div className="form-check mb-4">
            <input
              type="checkbox"
              className={`form-check-input ${
                shouldShowError('agreeTerms') ? 'is-invalid' : ''
              }`}
              id="agree-terms"
              name="agreeTerms"
              checked={formik.values.agreeTerms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            <label className="form-check-label" htmlFor="agree-terms">
              I agree to the <a href="/terms" className="text-decoration-none">Terms of Service</a> and <a href="/privacy" className="text-decoration-none">Privacy Policy</a> *
            </label>
            {shouldShowError('agreeTerms') && (
              <div className="invalid-feedback d-block">{formik.errors.agreeTerms}</div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="col-12">
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={!isSubmitEnabled()}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="mb-0">
          Already have an account?{' '}
          <Link to="/login" className="text-decoration-none fw-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;