// components/Contact/ContactForm.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  sendMessage,
  clearMessageError,
  clearMessageSuccess,
  selectMessageSending,
  selectMessageError,
  selectMessageSuccess
} from '../../store/redux/messageSlice';

const ContactForm = () => {
  const dispatch = useDispatch();
  
  // Select Redux state
  const sending = useSelector(selectMessageSending);
  const error = useSelector(selectMessageError);
  const success = useSelector(selectMessageSuccess);
  
  // Local form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearMessageError());
    dispatch(clearMessageSuccess());
    
    return () => {
      dispatch(clearMessageError());
      dispatch(clearMessageSuccess());
    };
  }, [dispatch]);

  // Reset form on successful submission
  useEffect(() => {
    if (success) {
      // Clear form data
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Clear touched state
      setTouched({});
      
      // Clear form errors
      setFormErrors({});
      
      // Auto-clear success message after 5 seconds
      const timer = setTimeout(() => {
        dispatch(clearMessageSuccess());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Clear Redux error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearMessageError());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Clear field error if exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear Redux error if user starts typing
    if (error) {
      dispatch(clearMessageError());
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate single field
    const fieldErrors = validateForm();
    if (fieldErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Mark all fields as touched to show errors
      setTouched({
        name: true,
        email: true,
        subject: true,
        message: true
      });
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return;
    }
    
    // Prepare data for submission
    const submissionData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      // You can add additional fields if needed
      status: 'new',
      priority: 'normal', // or calculate based on content
      category: 'contact-form'
    };
    
    // Dispatch sendMessage action
    try {
      await dispatch(sendMessage(submissionData)).unwrap();
      
      // Success is handled by useEffect above
    } catch (error) {
      // Error is already handled by Redux
      console.error('Message submission error:', error);
    }
  };

  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  // Helper function to get field error class
  const getFieldClassName = (fieldName) => {
    const hasError = touched[fieldName] && formErrors[fieldName];
    return `form-control ${hasError ? 'is-invalid' : ''} ${touched[fieldName] && !formErrors[fieldName] ? 'is-valid' : ''}`;
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="php-email-form" 
      data-aos="fade-up" 
      data-aos-delay="400"
      noValidate
    >
      <div className="row gy-4">
        {/* Name Field */}
        <div className="col-md-6">
          <div className="form-group">
            <input
              type="text"
              name="name"
              className={getFieldClassName('name')}
              placeholder="Your Name"
              required
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={sending}
              autoComplete="name"
            />
            {touched.name && formErrors.name && (
              <div className="invalid-feedback d-block">
                {formErrors.name}
              </div>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="col-md-6">
          <div className="form-group">
            <input
              type="email"
              name="email"
              className={getFieldClassName('email')}
              placeholder="Your Email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={sending}
              autoComplete="email"
            />
            {touched.email && formErrors.email && (
              <div className="invalid-feedback d-block">
                {formErrors.email}
              </div>
            )}
          </div>
        </div>

        {/* Subject Field */}
        <div className="col-md-12">
          <div className="form-group">
            <input
              type="text"
              name="subject"
              className={getFieldClassName('subject')}
              placeholder="Subject"
              required
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={sending}
              autoComplete="off"
            />
            {touched.subject && formErrors.subject && (
              <div className="invalid-feedback d-block">
                {formErrors.subject}
              </div>
            )}
          </div>
        </div>

        {/* Message Field */}
        <div className="col-md-12">
          <div className="form-group">
            <textarea
              name="message"
              className={getFieldClassName('message')}
              rows="6"
              placeholder="Your Message"
              required
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={sending}
            ></textarea>
            {touched.message && formErrors.message && (
              <div className="invalid-feedback d-block">
                {formErrors.message}
              </div>
            )}
            <div className="form-text text-end">
              {formData.message.length}/1000 characters
            </div>
          </div>
        </div>

        {/* Status Messages and Submit Button */}
        <div className="col-md-12 text-center">
          {/* Loading State */}
          {sending && (
            <div className="alert alert-info d-inline-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Sending your message...
            </div>
          )}
          
          {/* Error State */}
          {error && !sending && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close float-end" 
                onClick={() => dispatch(clearMessageError())}
                aria-label="Close"
              ></button>
            </div>
          )}
          
          {/* Success State */}
          {success && !sending && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle me-2"></i>
              Your message has been sent successfully! We'll get back to you soon.
              <button 
                type="button" 
                className="btn-close float-end" 
                onClick={() => dispatch(clearMessageSuccess())}
                aria-label="Close"
              ></button>
            </div>
          )}
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            disabled={sending || !isFormValid()}
          >
            {sending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                Send Message
              </>
            )}
          </button>
          
        
        </div>
      </div>
    </form>
  );
};

export default ContactForm;