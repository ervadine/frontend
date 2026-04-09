// Account.js - Complete Fixed Version
import React, { useState, useEffect, useMemo, useCallback} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AddressForm from '../components/AddressForm'; 
import { useUserProfile } from '../hooks/useUserProfile';
import { useSweetAlert } from '../hooks/useSweetAlert';
import '../styles/address.css';
import '../styles/profile.css';
import { fetchCategories, selectCategories } from '../store/redux/categorySlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, selectCartItems, selectCartTotal, selectCartLoading, addToCart, removeFromCart, updateCartItem } from '../store/redux/cartSlice';
import { fetchOrders, selectOrders, selectOrderLoading, selectOrderPagination, cancelOrder, selectOrderCancelling } from '../store/redux/orderSlice';
import { sendMessage, selectMessageError, selectMessageLoading, selectMessageSuccess } from '../store/redux/messageSlice';
import AddPaymentCardForm from '../components/checkout/AddPaymentCardForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { removeFromWishlist,getProfile } from '../store/redux/authSlice';



function Account() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get account from URL with error handling
  const account = useMemo(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const section = searchParams.get('section');
      const validSections = ['profile', 'orders', 'complaints', 'wishlist', 'payment', 'addresses', 'settings'];
      return section && validSections.includes(section) ? section : 'orders';
    } catch (error) {
      console.error('Error parsing URL params:', error);
      return 'orders';
    }
  }, [location.search]);

  // Redirect if no section specified
  useEffect(() => {
    if (location.pathname === '/account' && !location.search) {
      navigate('/account?section=orders', { replace: true });
    }
  }, [location, navigate]);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [trackingStates, setTrackingStates] = useState({}); 
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Complaint form state
  const [complaintData, setComplaintData] = useState({
    orderId: '',
    category: 'damaged_item',
    subject: '',
    message: '',
    attachments: [],
    priority: 'medium'
  });
  const [selectedOrderForComplaint, setSelectedOrderForComplaint] = useState(null);

  // Error state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY||'pk_live_51TJeTs4nSzaODMfLMC5uiSiDh9jt2CaKJmfqpVOI4N9Y6okDSlWHpqR9KDKspjj4vh3BFN6ZwZtVn1z9perL12Gb00XSCwXJkQ');
  const dispatch = useDispatch();
  
  // Use the custom hook
  const {
    user,
    isAuthenticated,
    isLoading,
    profile,
    updateProfile,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    addToWishlist,
    removeFrom_Wishlist,
    updateAvatar,
    getFullName,
    getUserActivity,
    addresses,
    wishlist,
     paymentCards,
    fetchPaymentCards,
    deletePaymentCard,
    setDefaultPaymentCard,
    getMaskedCardNumber,
    getCardTypeIcon,
    formatExpiryDate,
    isCardExpired,
    hasPaymentCards,
    selectIsInWishlist
  } = useUserProfile();

  const [localLoading, setLocalLoading] = useState(false);
  const [paymentCardsList, setPaymentCardsList] = useState([]);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);


   const [localPaymentCards, setLocalPaymentCards] = useState([]);





  // SweetAlert hook
const { success, error, info, confirm, loading: sweetLoading } = useSweetAlert();

  // Redux selectors
  const categories = useSelector(selectCategories);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const cartLoading = useSelector(selectCartLoading);
  const orders = useSelector(selectOrders);
  const orderLoading = useSelector(selectOrderLoading);
  const orderCancelling = useSelector(selectOrderCancelling);
  const pagination = useSelector(selectOrderPagination) || { page: 1, limit: 10, total: 0, pages: 1 };
  
  // Message selectors
  const messageLoading = useSelector(selectMessageLoading);
  const messageError = useSelector(selectMessageError);
  const messageSuccess = useSelector(selectMessageSuccess);


  
 useEffect(() => {
    if (account === 'payment' && isAuthenticated) {
      loadPaymentCards();
    }
  }, [account, isAuthenticated]);

  const loadPaymentCards = async () => {
    setLocalLoading(true);
    try {
      await fetchPaymentCards();
      setLocalPaymentCards(paymentCards || []);
    } catch (error) {
      console.error('Failed to load payment cards:', error);
      error('Error', 'Failed to load payment methods');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDeletePayment = async (card) => {
    const result = await confirm(
      'Delete Payment Method',
      `Are you sure you want to delete this ${card.cardType} ending in ${card.lastFourDigits}?`,
      'Yes, Delete',
      'Cancel',
      { dangerMode: true }
    );

    if (result.isConfirmed) {
      setLocalLoading(true);
      try {
        await deletePaymentCard(card._id);
        await loadPaymentCards(); // Refresh the list
        success('Success', 'Payment method deleted successfully');
      } catch (err) {
        error('Error', 'Failed to delete payment method. Please try again.');
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const handleSetDefault = async (card) => {
    if (card.isDefault) {
      info('Already Default', 'This is already your default payment method');
      return;
    }

    setLocalLoading(true);
    try {
      await setDefaultPaymentCard(card._id);
      await loadPaymentCards(); // Refresh the list
      success('Success', 'Default payment method updated');
    } catch (err) {
      error('Error', 'Failed to set default payment method. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const getPaymentIcon = (cardType) => {
    const iconMap = {
      'Visa': 'bi-credit-card-2-front',
      'MasterCard': 'bi-credit-card-2-front',
      'American Express': 'bi-credit-card-2-front',
      'Discover': 'bi-credit-card-2-front',
      'Other': 'bi-credit-card'
    };
    return iconMap[cardType] || 'bi-credit-card';
  };

  const getCardBrandColor = (cardType) => {
    const colors = {
      'Visa': '#1a1f71',
      'MasterCard': '#eb001b',
      'American Express': '#006fcf',
      'Discover': '#ff6000',
      'Other': '#6c757d'
    };
    return colors[cardType] || '#6c757d';
  };





  // Error boundary effect
  useEffect(() => {
    const handleError = (err) => {
      console.error('Component error:', err);
      setHasError(true);
      setErrorMessage(err.message || 'Something went wrong');
    };

    try {
      // Your existing effects
    } catch (err) {
      handleError(err);
    }

    return () => {
      // Cleanup
    };
  }, []);

  // Function to handle account section changes
  const handleAccountChange = (newAccount) => {
    // Prevent unnecessary navigation
    if (newAccount !== account) {
      navigate(`/account?section=${newAccount}`, { replace: true });
      
      // Reset some states when changing sections
      if (newAccount !== 'orders') {
        setExpandedOrderId(null);
        setTrackingStates({});
      }
      if (newAccount !== 'complaints') {
        setSelectedOrderForComplaint(null);
        setComplaintData({
          orderId: '',
          category: 'damaged_item',
          subject: '',
          message: '',
          attachments: [],
          priority: 'medium'
        });
      }
    }
  };

  // Fetch categories, cart, and orders on component mount
  useEffect(() => {
    try {
      dispatch(fetchCategories());
      dispatch(fetchCart());
      
      if (isAuthenticated) {
        dispatch(fetchOrders({ page: currentPage, limit: ordersPerPage }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setHasError(true);
      setErrorMessage('Failed to load data. Please try again.');
    }
  }, [dispatch, isAuthenticated]);

  // Fetch orders when page changes
  useEffect(() => {
    if (isAuthenticated && account === 'orders') {
      try {
        dispatch(fetchOrders({ page: currentPage, limit: ordersPerPage }));
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    }
  }, [dispatch, isAuthenticated, currentPage, ordersPerPage, account]);

  // Helper function to get the correct product image
  const getOrderItemImage = (item) => {
    try {
      if (!item) return "assets/img/product/placeholder.webp";
      
      const variantColorValue = item.variant?.colorValue;
      
      if (!variantColorValue) {
        return item.product?.colors?.availableColors?.[0]?.images?.[0]?.url || 
               item.product?.colorsWithPrice?.[0]?.images?.[0]?.url || 
               "assets/img/product/placeholder.webp";
      }
      
      const foundColor = item.product?.colors?.availableColors?.find(
        color => color.value === variantColorValue || 
                color.hexCode === variantColorValue
      );
      
      if (foundColor) {
        const primaryImage = foundColor.images?.find(img => img.isPrimary);
        return primaryImage?.url || foundColor.images?.[0]?.url;
      }
      
      const foundColorWithPrice = item.product?.colorsWithPrice?.find(
        color => color.value === variantColorValue || 
                color.hexCode === variantColorValue
      );
      
      if (foundColorWithPrice) {
        const primaryImage = foundColorWithPrice.images?.find(img => img.isPrimary);
        return primaryImage?.url || foundColorWithPrice.images?.[0]?.url;
      }
      
      return item.product?.colors?.availableColors?.[0]?.images?.[0]?.url || 
             item.product?.colorsWithPrice?.[0]?.images?.[0]?.url || 
             "assets/img/product/placeholder.webp";
    } catch (err) {
      console.error('Error getting order item image:', err);
      return "assets/img/product/placeholder.webp";
    }
  };

  // Toggle order details
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Toggle order tracking
  const toggleOrderTracking = (orderId) => {
    setTrackingStates(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  // Filter orders based on search and filter
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerFullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  }) : [];

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination?.pages || 1)) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    const totalPages = pagination?.pages || 1;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          type="button"
          className="page-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="page-dots">...</span>);
      }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          type="button"
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="page-dots">...</span>);
      }
      buttons.push(
        <button
          key="last"
          type="button"
          className="page-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      const orderToCancel = orders.find(order => order.id === orderId || order._id === orderId);
      if (!orderToCancel) {
        error('Order Not Found', 'The specified order could not be found.');
        return;
      }
      
      if (orderToCancel.status === 'shipped' || orderToCancel.status === 'delivered') {
        error('Cannot Cancel Order', 'This order has already been shipped and cannot be cancelled.');
        return;
      }
      
      if (orderToCancel.status === 'cancelled') {
        error('Order Already Cancelled', 'This order has already been cancelled.');
        return;
      }
      
      const result = await confirm(
        'Cancel Order',
        'Are you sure you want to cancel this order? This action cannot be undone.',
        'Yes, Cancel',
        'Keep Order',
        {
          icon: 'warning',
          dangerMode: true,
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6'
        }
      );
      
      if (result.isConfirmed) {
        setCancellingOrderId(orderId);
        
        const { value: reason } = await confirm(
          'Cancellation Reason',
          'Please tell us why you\'re cancelling this order (optional):',
          'Submit',
          'Cancel',
          {
            input: 'textarea',
            inputPlaceholder: 'Enter your reason here...',
            inputAttributes: {
              'maxlength': '500'
            },
            showCancelButton: true
          }
        );
        
        await dispatch(cancelOrder({ 
          orderId, 
          reason: reason || 'No reason provided' 
        })).unwrap();
        
        dispatch(fetchOrders({ page: currentPage, limit: ordersPerPage }));
        
        success(
          'Order Cancelled',
          'Your order has been cancelled successfully. Any payment will be refunded according to our refund policy.',
          {
            icon: 'success',
            timer: 3000
          }
        );
      }
    } catch (err) {
      error(
        'Cancellation Failed',
        err.message || 'Failed to cancel the order. Please try again.',
        {
          confirmButtonText: 'Try Again'
        }
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (order) => {
    const cancellableStatuses = ['confirmed', 'processing', 'packaging'];
    return cancellableStatuses.includes(order.status);
  };

  // Cart functionality
  const handleAddToCart = (product, selectedVariant = null) => {
    try {
      const cartItem = {
        id: selectedVariant ? selectedVariant._id : product._id,
        productId: product._id,
        name: product.name,
        price: selectedVariant ? selectedVariant.price : product.price,
        image: product.images[0]?.url,
        variant: selectedVariant,
        quantity: 1
      };
      
      dispatch(addToCart(cartItem));
      success('Added to Cart', `${product.name} has been added to your cart`);
    } catch (err) {
      error('Error', 'Failed to add item to cart.');
    }
  };



  // Wishlist functionality
 const handleToggleWishlist = useCallback(async (product) => {
  if (isAuthenticated) {
    try {
      const productId = product._id || product.id;
      const exists = selectIsInWishlist(productId);
      
      if (exists) {
        await dispatch(removeFromWishlist(productId)).unwrap(); // Add await and use the correct function
        success('Removed from Wishlist', `${product.name} has been removed from your wishlist`);
      } else {
        await addToWishlist(productId); // Add await
        success('Added to Wishlist', `${product.name} has been added to your wishlist`);
      }
      dispatch(getProfile())
    } catch (err) {
      console.error('Wishlist error:', err);
      error('Error', err.message || 'Failed to update wishlist.');
    }
  } else {
    // Optional: Redirect to login or show message
    info('Please Login', 'You need to be logged in to use wishlist');
    navigate('/login');
  }
}, [dispatch,isAuthenticated, selectIsInWishlist, removeFromWishlist, addToWishlist, success, error, info, navigate]);

  // Address management
  const handleAddAddressClick = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleAddAddress = async (newAddress) => {
    try {
      await addAddress({
        id: Date.now().toString(),
        ...newAddress
      });
      success('Address Added', 'Your new address has been added successfully!');
      handleCloseAddressForm();
    } catch (err) {
      error('Error', 'Failed to add address. Please try again.');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleUpdateAddress = async (addressId, updatedAddress) => {
    try {
      await updateAddress(addressId, updatedAddress);
      success('Address Updated', 'Your address has been updated successfully!');
      handleCloseAddressForm();
    } catch (err) {
      error('Error', 'Failed to update address. Please try again.');
    }
  };

  const handleRemoveAddress = async (addressId) => {
    const result = await confirm(
      'Remove Address',
      'Are you sure you want to remove this address? This action cannot be undone.',
      'Yes, Remove',
      'Cancel'
    );
    
    if (result.isConfirmed) {
      try {
        await removeAddress(addressId);
        success('Address Removed', 'The address has been removed successfully.');
      } catch (err) {
        error('Error', 'Failed to remove address. Please try again.');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      success('Default Address Updated', 'Your default address has been updated successfully!');
    } catch (err) {
      error('Error', 'Failed to set default address. Please try again.');
    }
  };

  const handleCloseAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleUpdateProfile = async (updates) => {
    if (isAuthenticated) {
      try {
        const loadingAlert = sweetLoading('Updating Profile...', 'Please wait while we update your information.');
        
        await updateProfile(updates);
        
        loadingAlert.close();
        
        success(
          'Profile Updated Successfully!',
          'Your profile information has been updated successfully.',
          {
            icon: 'success',
            confirmButtonText: 'Great!',
            timer: 3000,
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          }
        );
      } catch (err) {
        sweetLoading.close();
        error(
          'Update Failed',
          'Failed to update your profile. Please try again.',
          {
            confirmButtonText: 'Try Again'
          }
        );
      }
    }
  };

  // Handle complaint form input changes
  const handleComplaintChange = (e) => {
    const { name, value } = e.target;
    setComplaintData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle order selection for complaint
  const handleOrderSelectForComplaint = (order) => {
    setSelectedOrderForComplaint(order);
    setComplaintData(prev => ({
      ...prev,
      orderId: order.id || order._id,
      subject: `Complaint about Order ${order.orderNumber || order.id.slice(-8)}`
    }));
  };

  // Handle file attachment
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setComplaintData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  // Remove attachment
  const handleRemoveAttachment = (index) => {
    setComplaintData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Submit complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    
    if (!complaintData.orderId) {
      error('Error', 'Please select an order for your complaint.');
      return;
    }

    if (!complaintData.message.trim()) {
      error('Error', 'Please provide details about your complaint.');
      return;
    }

    const loadingAlert = sweetLoading('Submitting Complaint...', 'Please wait while we process your complaint.');

    try {
      const complaintMessage = {
        name: getFullName(),
        email: user?.email || '',
        phone: user?.phone || '',
        subject: complaintData.subject || `Complaint - Order ${selectedOrderForComplaint?.orderNumber || 'N/A'}`,
        message: `Order ID: ${complaintData.orderId}\n\nComplaint Category: ${complaintData.category}\n\nDetails:\n${complaintData.message}`,
        category: 'complaint',
        source: 'order_page',
        metadata: {
          orderId: complaintData.orderId,
          priority: complaintData.priority,
          orderNumber: selectedOrderForComplaint?.orderNumber,
          orderTotal: selectedOrderForComplaint?.total,
          orderDate: selectedOrderForComplaint?.createdAt
        }
      };

      await dispatch(sendMessage(complaintMessage)).unwrap();
      
      loadingAlert.close();
      
      success(
        'Complaint Submitted',
        'Your complaint has been submitted successfully. We will review it and get back to you within 24-48 hours.',
        {
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 5000
        }
      );

      // Reset form
      setComplaintData({
        orderId: '',
        category: 'damaged_item',
        subject: '',
        message: '',
        attachments: [],
        priority: 'medium'
      });
      setSelectedOrderForComplaint(null);

    } catch (err) {
      loadingAlert.close();
      error(
        'Submission Failed',
        err || 'Failed to submit your complaint. Please try again.',
        {
          confirmButtonText: 'Try Again'
        }
      );
    }
  };

  // Cart and wishlist counts
  const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  // Get user data for display
  const userDisplayData = {
    name: getFullName(),
    status: user?.isPremium ? "Premium Member" : "Standard Member",
    avatar: user?.avatar || "assets/img/person/person-f-1.webp",
    email: user?.email || "",
    phone: user?.phone || ""
  };

  // Get user activity data
  const userActivity = getUserActivity();

  // Function to render tracking timeline
  const renderTrackingTimeline = (order) => {
    const statusHistory = order.statusHistory || [
      { status: 'confirmed', timestamp: order.createdAt },
      { status: 'processing', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'shipped', timestamp: new Date(Date.now() - 43200000).toISOString() }
    ];
    
    const statusConfig = {
      'confirmed': {
        icon: 'bi-check-circle-fill',
        label: 'Order Confirmed',
        description: 'Your order has been received and confirmed'
      },
      'processing': {
        icon: 'bi-gear-fill',
        label: 'Processing',
        description: 'Your order is being prepared for shipment'
      },
      'packaging': {
        icon: 'bi-box-seam',
        label: 'Packaging',
        description: 'Your items are being packaged for shipping'
      },
      'shipped': {
        icon: 'bi-truck',
        label: 'In Transit',
        description: 'Package in transit with carrier'
      },
      'delivered': {
        icon: 'bi-house-door-fill',
        label: 'Delivered',
        description: 'Package has been delivered'
      }
    };

    const currentStatus = order.status || 'processing';
    const currentIndex = Object.keys(statusConfig).indexOf(currentStatus);
    
    return (
      <div className="tracking-timeline">
        {Object.entries(statusConfig).map(([status, config], index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          const timelineItem = statusHistory.find(item => item.status === status);
          
          return (
            <div key={status} className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              <div className="timeline-icon">
                <i className={`bi ${config.icon}`}></i>
              </div>
              <div className="timeline-content">
                <h5>{config.label}</h5>
                <p>{config.description}</p>
                {timelineItem?.timestamp && (
                  <span className="timeline-date">
                    {new Date(timelineItem.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} - {new Date(timelineItem.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
                {status === 'shipped' && order.trackingNumber && (
                  <div className="shipping-info">
                    <span>Tracking Number: </span>
                    <span className="tracking-number">{order.trackingNumber}</span>
                    <button 
                      className="btn-copy-tracking" 
                      onClick={() => {
                        navigator.clipboard.writeText(order.trackingNumber);
                        success('Copied!', 'Tracking number copied to clipboard');
                      }}
                    >
                      <i className="bi bi-copy"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Function to render order details
  const renderOrderDetails = (order) => {
    const shippingAddress = order.shippingAddress || {};
    const billingAddress = order.billingAddress || shippingAddress;
    const paymentInfo = order.payment || {};
    const canCancel = canCancelOrder(order);
    
    return (
      <div className="details-content">
        <div className="detail-section">
          <h5>Order Information</h5>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Payment Method</span>
              <span className="value">
                {paymentInfo.method === 'stripe' ? 'Credit Card' : paymentInfo.method || 'N/A'}
                {paymentInfo.transactionId && ` (${paymentInfo.transactionId.slice(-4)})`}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Shipping Method</span>
              <span className="value">
                {order.shippingMethod === 'standard' ? 'Standard Shipping (3-5 days)' : 
                 order.shippingMethod === 'express' ? 'Express Delivery (2-3 days)' : 
                 order.shippingMethod || 'Standard Shipping'}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h5>Items ({order.items?.length || 0})</h5>
          <div className="order-items">
            {order.items?.map((item, idx) => {
              const colorInfo = item.product?.colors?.availableColors?.find(
                color => color.value === item.variant?.colorValue || 
                        color.hexCode === item.variant?.colorValue
              );
              
              const displayColor = colorInfo?.name || item.variant?.colorValue;
              const colorHex = colorInfo?.hexCode || colorInfo?.value || item.variant?.colorValue;
              const itemImage = getOrderItemImage(item);
              
              return (
                <div key={idx} className="item">
                  <img 
                    src={itemImage}
                    alt={item.product?.name || `Product ${idx + 1}`} 
                    loading="lazy" 
                  />
                  <div className="item-info">
                    <h6>{item.product?.name || `Product ${idx + 1}`}</h6>
                    <div className="item-meta">
                      <span className="sku">SKU: {item.variant?.sku || `PRD-${idx + 1}`}</span>
                      <span className="qty">Qty: {item.quantity || 1}</span>
                      
                      {item.variant?.colorValue && (
                        <div className="d-flex align-items-center">
                          <span className="color me-1">Color:</span>
                          {colorHex ? (
                            <div 
                              className="color-swatch me-2"
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: colorHex,
                                border: '1px solid #dee2e6',
                                borderRadius: '4px'
                              }}
                              title={displayColor}
                            ></div>
                          ) : null}
                          <span>{displayColor}</span>
                        </div>
                      )}
                      
                      {item.variant?.sizeValue && (
                        <span className="size">Size: {item.variant.sizeValue}</span>
                      )}
                    </div>
                  </div>
                  <div className="item-price">
                    ${(item.price * (item.quantity || 1)).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="detail-section">
          <h5>Price Details</h5>
          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal</span>
              <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span>${order.shipping?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="price-row">
              <span>Tax</span>
              <span>${order.tax?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>${order.total?.toFixed(2) || order.formattedTotal?.replace('$', '') || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h5>Shipping Address</h5>
          <div className="address-info">
            <p>
              {shippingAddress.firstName} {shippingAddress.lastName}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
              {shippingAddress.country}
            </p>
            {shippingAddress.phone && (
              <p className="contact">{shippingAddress.phone}</p>
            )}
            {shippingAddress.email && (
              <p className="contact">{shippingAddress.email}</p>
            )}
          </div>
        </div>

        {canCancel ? (
          <div className="detail-section">
            <h5>Order Actions</h5>
            <div className="order-actions">
              <button
                type="button"
                className="btn-cancel-order"
                onClick={() => handleCancelOrder(order.id || order._id)}
                disabled={orderCancelling && cancellingOrderId === (order.id || order._id)}
              >
                {orderCancelling && cancellingOrderId === (order.id || order._id) ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel Order
                  </>
                )}
              </button>
              <p className="cancel-note text-muted mt-2">
                <small>
                  <i className="bi bi-info-circle me-1"></i>
                  You can cancel this order as it hasn't been shipped yet. Refunds will be processed within 5-7 business days.
                </small>
              </p>
            </div>
          </div>
        ) : order.billingAddress && JSON.stringify(order.billingAddress) !== JSON.stringify(shippingAddress) ? (
          <div className="detail-section">
            <h5>Billing Address</h5>
            <div className="address-info">
              <p>
                {billingAddress.firstName} {billingAddress.lastName}<br />
                {billingAddress.street}<br />
                {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}<br />
                {billingAddress.country}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  // ========== RENDER FUNCTIONS FOR EACH ACCOUNT SECTION ==========

  // Render Profile Tab
  const renderProfileTab = () => {
    return (
      <div className="tab-content">
        <div className="section-header" data-aos="fade-up">
          <h2>My Profile</h2>
          <div className="header-actions">
            <button 
              type="button" 
              className="btn-edit-profile"
              onClick={() => handleAccountChange('settings')}
            >
              <i className="bi bi-pencil-square me-2"></i>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-card" data-aos="fade-up">
            <div className="profile-header">
              <div className="profile-avatar">
                <img 
                  src={userDisplayData.avatar} 
                  alt={userDisplayData.name} 
                  loading="lazy" 
                />
                <button 
                  className="btn-change-avatar"
                  onClick={() => {
                    success('Coming Soon', 'Avatar change feature will be available soon!');
                  }}
                >
                  <i className="bi bi-camera"></i>
                </button>
              </div>
              <div className="profile-info">
                <h3>{userDisplayData.name}</h3>
                <div className="user-status-badge">
                  <i className="bi bi-award"></i>
                  <span>{userDisplayData.status}</span>
                </div>
                <p className="text-muted mb-0">{userDisplayData.email}</p>
              </div>
            </div>
            
            <div className="profile-details">
              <div className="detail-item">
                <i className="bi bi-envelope"></i>
                <div>
                  <span className="label">Email</span>
                  <span className="value">{userDisplayData.email}</span>
                </div>
              </div>
              
              <div className="detail-item">
                <i className="bi bi-telephone"></i>
                <div>
                  <span className="label">Phone</span>
                  <span className="value">{userDisplayData.phone || 'Not set'}</span>
                </div>
              </div>
              
              <div className="detail-item">
                <i className="bi bi-calendar"></i>
                <div>
                  <span className="label">Member Since</span>
                  <span className="value">
                    {userActivity.memberSince 
                      ? new Date(userActivity.memberSince).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="detail-item">
                <i className="bi bi-clock-history"></i>
                <div>
                  <span className="label">Last Login</span>
                  <span className="value">
                    {userActivity.lastLogin 
                      ? new Date(userActivity.lastLogin).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="profile-stats" data-aos="fade-up" data-aos-delay="100">
            <div className="stat-card">
              <i className="bi bi-bag-check"></i>
              <div>
                <span className="number">{pagination.total || 0}</span>
                <span className="label">Total Orders</span>
              </div>
            </div>
            
            <div className="stat-card">
              <i className="bi bi-heart"></i>
              <div>
                <span className="number">{wishlistCount}</span>
                <span className="label">Wishlist Items</span>
              </div>
            </div>
            
            <div className="stat-card">
              <i className="bi bi-geo-alt"></i>
              <div>
                <span className="number">{addresses.length}</span>
                <span className="label">Saved Addresses</span>
              </div>
            </div>
            
            <div className="stat-card">
              <i className="bi bi-credit-card"></i>
              <div>
                <span className="number">{user?.paymentMethods?.length || 0}</span>
                <span className="label">Payment Methods</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Orders Tab
  const renderOrdersTab = () => {
    if (orderLoading) {
      return (
        <div className="tab-content">
          <div className="section-header" data-aos="fade-up">
            <h2>My Orders</h2>
            <div className="header-actions">
              <div className="search-box">
                <i className="bi bi-search"></i>
                <input type="text" placeholder="Search orders..." disabled />
              </div>
              <div className="dropdown">
                <button className="filter-btn" data-bs-toggle="dropdown" disabled>
                  <i className="bi bi-funnel"></i>
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your orders...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="tab-content">
        <div className="section-header" data-aos="fade-up">
          <h2>My Orders</h2>
          <div className="header-actions">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="dropdown">
              <button className="filter-btn" data-bs-toggle="dropdown">
                <i className="bi bi-funnel"></i>
                <span>Filter</span>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button 
                    className={`dropdown-item ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('all')}
                  >
                    All Orders
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item ${statusFilter === 'confirmed' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('confirmed')}
                  >
                    Confirmed
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item ${statusFilter === 'processing' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('processing')}
                  >
                    Processing
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item ${statusFilter === 'shipped' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('shipped')}
                  >
                    Shipped
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item ${statusFilter === 'delivered' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('delivered')}
                  >
                    Delivered
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item ${statusFilter === 'cancelled' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('cancelled')}
                  >
                    Cancelled
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="orders-grid">
          {filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => {
              const orderId = order?.id || order?._id;
              const isTrackingExpanded = trackingStates[orderId];
              const isDetailsExpanded = expandedOrderId === orderId;
              const canCancel = canCancelOrder(order);
              
              const firstItem = order?.items && order?.items[0];
              const productImage = getOrderItemImage(firstItem);
              
              const orderDate = order?.createdAt ? 
                new Date(order?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 
                new Date().toLocaleDateString();
              
              const status = order?.status || 'confirmed';
              const statusText = status.charAt(0).toUpperCase() + status?.slice(1);
              const statusClass = `status ${status.toLowerCase()}`;
              
              return (
                <div key={orderId} className="order-card" data-aos="fade-up" data-aos-delay={100 * (index + 1)}>
                  <div className="order-header">
                    <div className="order-id">
                      <span className="label">Order ID:</span>
                      <span className="value">{order?.orderNumber || `ORD-${orderId?.slice(-8)}`}</span>
                    </div>
                    <div className="order-date">{orderDate}</div>
                    {canCancel && (
                      <button 
                        type="button"
                        className="btn-cancel-quick"
                        onClick={() => handleCancelOrder(orderId)}
                        disabled={orderCancelling && cancellingOrderId === orderId}
                        title="Cancel Order"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    )}
                  </div>
                  
                  <div className="order-content">
                    <div className="product-grid">
                      {order?.items && order?.items?.slice(0, 4).map((item, idx) => {
                        const itemImage = getOrderItemImage(item);
                        return (
                          <img 
                            key={idx} 
                            src={itemImage} 
                            alt={item.product?.name || `Product ${idx + 1}`} 
                            loading="lazy" 
                          />
                        );
                      })}
                      {order?.items && order?.items.length > 4 && (
                        <div className="more-items">+{order?.items.length - 4} more</div>
                      )}
                    </div>
                    
                    <div className="order-info">
                      <div className="info-row">
                        <span>Status</span>
                        <span className={statusClass}>
                          {statusText}
                        </span>
                      </div>
                      <div className="info-row">
                        <span>Items</span>
                        <span>{order?.items?.length || 0} item{order?.items?.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="info-row">
                        <span>Total</span>
                        <span className="price">
                          ${order?.total?.toFixed(2) || order?.formattedTotal?.replace('$', '') || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="order-footer">
                    <button 
                      type="button" 
                      className="btn-track"
                      onClick={() => toggleOrderTracking(orderId)}
                      aria-expanded={isTrackingExpanded}
                    >
                      {isTrackingExpanded ? 'Hide Tracking' : 'Track Order'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-details"
                      onClick={() => toggleOrderDetails(orderId)}
                      aria-expanded={isDetailsExpanded}
                    >
                      {isDetailsExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                    {canCancel && (
                      <button 
                        type="button"
                        className="btn-cancel"
                        onClick={() => handleCancelOrder(orderId)}
                        disabled={orderCancelling && cancellingOrderId === orderId}
                      >
                        {orderCancelling && cancellingOrderId === orderId ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Cancelling
                          </>
                        ) : 'Cancel Order'}
                      </button>
                    )}
                  </div>

                  {/* Order Tracking Dropdown */}
                  {isTrackingExpanded && (
                    <div className="tracking-info show">
                      {renderTrackingTimeline(order)}
                    </div>
                  )}

                  {/* Order Details Dropdown */}
                  {isDetailsExpanded && (
                    <div className="order-details show">
                      {renderOrderDetails(order)}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state" data-aos="fade-up">
              <i className="bi bi-box"></i>
              <h3>No orders found</h3>
              <p>
                {searchQuery || statusFilter !== 'all' 
                  ? 'No orders match your search criteria. Try different keywords or filters.' 
                  : 'When you place orders, they will appear here.'}
              </p>
              {searchQuery || statusFilter !== 'all' ? (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }} 
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              ) : (
                <button onClick={() => window.location.href = '/products'} className="btn btn-primary">Start Shopping</button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > ordersPerPage && (
          <div className="pagination-wrapper" data-aos="fade-up">
            <div className="pagination-info">
              Showing {(currentPage - 1) * ordersPerPage + 1} to {Math.min(currentPage * ordersPerPage, pagination.total)} of {pagination.total} orders
            </div>
            
            <div className="pagination-controls">
              <button 
                type="button" 
                className="btn-prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i>
                <span className="d-none d-md-inline">Previous</span>
              </button>
              
              <div className="page-numbers">
                {generatePaginationButtons()}
              </div>
              
              <button 
                type="button" 
                className="btn-next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                <span className="d-none d-md-inline">Next</span>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Complaint categories
  const complaintCategories = [
    { value: 'damaged_item', label: 'Damaged or Broken Item' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'missing_item', label: 'Missing Item from Order' },
    { value: 'quality_issue', label: 'Poor Quality or Defective' },
    { value: 'late_delivery', label: 'Late Delivery' },
    { value: 'packaging_issue', label: 'Packaging Issue' },
    { value: 'billing_issue', label: 'Billing or Payment Issue' },
    { value: 'customer_service', label: 'Customer Service Issue' },
    { value: 'other', label: 'Other Issue' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#6c757d' },
    { value: 'medium', label: 'Medium', color: '#ffc107' },
    { value: 'high', label: 'High', color: '#fd7e14' },
    { value: 'urgent', label: 'Urgent', color: '#dc3545' }
  ];

  // Render Complaints Tab
  const renderComplaintsTab = () => (
    <div className="tab-content">
      <div className="section-header" data-aos="fade-up">
        <h2>File a Complaint</h2>
        <p className="text-muted">Report any issues with your order</p>
      </div>

      <div className="complaint-form-wrapper">
        {/* Order Selection Section */}
        <div className="complaint-section" data-aos="fade-up">
          <h4>1. Select Order</h4>
          <div className="order-selection-grid">
            {orders && orders.length > 0 ? (
              orders.slice(0, 6).map((order, index) => {
                const orderId = order.id || order._id;
                const isSelected = selectedOrderForComplaint?.id === orderId;
                const firstItem = order.items && order.items[0];
                const productImage = getOrderItemImage(firstItem);
                
                return (
                  <div 
                    key={orderId} 
                    className={`order-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOrderSelectForComplaint(order)}
                    data-aos="fade-up" 
                    data-aos-delay={100 * (index + 1)}
                  >
                    <div className="order-select-image">
                      <img 
                        src={productImage} 
                        alt="Product" 
                        loading="lazy" 
                      />
                    </div>
                    <div className="order-select-info">
                      <div className="order-select-header">
                        <span className="order-id">
                          {order.orderNumber || `ORD-${orderId.slice(-8)}`}
                        </span>
                        <span className="order-date">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="order-select-items">
                        <span className="item-count">{order.items?.length || 0} item(s)</span>
                        <span className="order-total">${order.total?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="order-select-status">
                        <span className={`status-badge ${order.status}`}>
                          {order.status || 'confirmed'}
                        </span>
                      </div>
                    </div>
                    <div className="select-indicator">
                      {isSelected ? (
                        <i className="bi bi-check-circle-fill text-success"></i>
                      ) : (
                        <i className="bi bi-circle"></i>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" data-aos="fade-up">
                <i className="bi bi-box"></i>
                <h5>No orders found</h5>
                <p>You need to have orders to file a complaint.</p>
              </div>
            )}
          </div>
          
          {selectedOrderForComplaint && (
            <div className="selected-order-info" data-aos="fade-up">
              <div className="selected-order-header">
                <h5>Selected Order</h5>
                <button 
                  type="button" 
                  className="btn-change-order"
                  onClick={() => setSelectedOrderForComplaint(null)}
                >
                  Change Order
                </button>
              </div>
              <div className="selected-order-details">
                <div className="detail-row">
                  <span>Order ID:</span>
                  <strong>{selectedOrderForComplaint.orderNumber || `ORD-${(selectedOrderForComplaint.id || selectedOrderForComplaint._id).slice(-8)}`}</strong>
                </div>
                <div className="detail-row">
                  <span>Order Date:</span>
                  <span>{new Date(selectedOrderForComplaint.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`status-badge ${selectedOrderForComplaint.status}`}>
                    {selectedOrderForComplaint.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Total Amount:</span>
                  <strong>${selectedOrderForComplaint.total?.toFixed(2) || '0.00'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complaint Form Section */}
        <div className="complaint-section" data-aos="fade-up" data-aos-delay="100">
          <h4>2. Complaint Details</h4>
          <form onSubmit={handleSubmitComplaint} className="php-email-form complaint-form">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="category" className="form-label">
                  <i className="bi bi-tag me-2"></i>
                  Issue Category *
                </label>
                <select 
                  className="form-select" 
                  id="category" 
                  name="category"
                  value={complaintData.category}
                  onChange={handleComplaintChange}
                  required
                >
                  {complaintCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="priority" className="form-label">
                  <i className="bi bi-flag me-2"></i>
                  Priority Level
                </label>
                <select 
                  className="form-select" 
                  id="priority" 
                  name="priority"
                  value={complaintData.priority}
                  onChange={handleComplaintChange}
                >
                  {priorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ color: opt.color }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <small className="form-text text-muted">
                  Select urgency level. Urgent issues are reviewed first.
                </small>
              </div>
              
              <div className="col-12">
                <label htmlFor="subject" className="form-label">
                  <i className="bi bi-card-heading me-2"></i>
                  Subject *
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="subject" 
                  name="subject"
                  value={complaintData.subject}
                  onChange={handleComplaintChange}
                  placeholder="Brief description of your complaint"
                  required
                />
              </div>
              
              <div className="col-12">
                <label htmlFor="message" className="form-label">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Detailed Description *
                </label>
                <textarea 
                  className="form-control" 
                  id="message" 
                  name="message"
                  value={complaintData.message}
                  onChange={handleComplaintChange}
                  rows="8"
                  placeholder="Please provide detailed information about the issue you're experiencing. Include any relevant details that can help us understand and resolve your complaint."
                  required
                ></textarea>
                <small className="form-text text-muted">
                  Please be as specific as possible. Include dates, times, product details, and any previous communication about this issue.
                </small>
              </div>
              
              <div className="col-12">
                <label className="form-label">
                  <i className="bi bi-paperclip me-2"></i>
                  Attachments (Optional)
                </label>
                <div className="file-upload-area">
                  <input 
                    type="file" 
                    className="form-control" 
                    id="attachments"
                    multiple
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  />
                  <small className="form-text text-muted">
                    You can upload images (JPG, PNG) or documents (PDF, DOC) up to 5MB each. Maximum 5 files.
                  </small>
                </div>
                
                {/* File preview */}
                {complaintData.attachments.length > 0 && (
                  <div className="attachments-preview mt-3">
                    <h6>Attached Files:</h6>
                    <div className="attachments-list">
                      {complaintData.attachments.map((file, index) => (
                        <div key={index} className="attachment-item">
                          <i className="bi bi-paperclip"></i>
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                          <button 
                            type="button" 
                            className="btn-remove-file"
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Information Note */}
              <div className="col-12">
                <div className="info-note">
                  <i className="bi bi-info-circle"></i>
                  <div>
                    <strong>What happens next?</strong>
                    <p className="mb-0">
                      Your complaint will be reviewed by our customer service team within 24-48 hours. 
                      We may contact you for additional information. Please check your email for updates.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="col-12">
                <div className="form-buttons">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary me-3"
                    onClick={() => {
                      setComplaintData({
                        orderId: '',
                        category: 'damaged_item',
                        subject: '',
                        message: '',
                        attachments: [],
                        priority: 'medium'
                      });
                      setSelectedOrderForComplaint(null);
                    }}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Clear Form
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit-complaint"
                    disabled={messageLoading || !complaintData.orderId}
                  >
                    {messageLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Submit Complaint
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Complaint Guidelines */}
        <div className="complaint-section" data-aos="fade-up" data-aos-delay="200">
          <h4>Complaint Guidelines</h4>
          <div className="guidelines-grid">
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="guideline-content">
                <h5>Response Time</h5>
                <p>We aim to respond to all complaints within 24-48 hours during business days.</p>
              </div>
            </div>
            
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="bi bi-shield-check"></i>
              </div>
              <div className="guideline-content">
                <h5>Your Protection</h5>
                <p>All complaints are handled confidentially and in accordance with our privacy policy.</p>
              </div>
            </div>
            
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="bi bi-chat-left-dots"></i>
              </div>
              <div className="guideline-content">
                <h5>Follow-up</h5>
                <p>We'll keep you updated throughout the resolution process via email.</p>
              </div>
            </div>
            
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="bi bi-arrow-clockwise"></i>
              </div>
              <div className="guideline-content">
                <h5>Resolution</h5>
                <p>We strive to resolve all complaints to your satisfaction within 5-7 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

const renderWishlistTab = () => {
  // Use the wishlist from the hook, not user?.wishlist
  // The hook already provides 'wishlist' from useUserProfile()
  
  return (
    <div className="tab-content">
      <div className="section-header" data-aos="fade-up">
        <h2>My Wishlist</h2>
        <div className="header-actions">
          <button 
            type="button" 
            className="btn-add-all" 
            onClick={() => {
              wishlist.forEach(item => {
                handleAddToCart(item);
              });
            }}
          >
            Add All to Cart
          </button>
        </div>
      </div>

      <div className="wishlist-grid">
        {wishlist && wishlist.length > 0 ? (
          wishlist.map((item, index) => {
            // Add null/undefined check for item
            if (!item) return null;
            
            // Get the primary color info
            const primaryColor = item.colors?.availableColors?.[0];
            const primaryImage = primaryColor?.images?.find(img => img.isPrimary) || 
                               primaryColor?.images?.[0];
            
            // Get product price
            const price = primaryColor?.price || item.displayPrice || "$0.00";
            const displayPrice = typeof price === 'number' ? `$${price.toFixed(2)}` : price;
            
            // Check stock from quantityConfig
            const hasStock = primaryColor?.quantityConfig?.inStock || false;
            const isLowStock = primaryColor?.quantityConfig?.isLowStock || false;
            
            // Get color value
            const colorValue = primaryColor?.hexCode || primaryColor?.value;
            
            // Use a stable unique key
            const itemId = item._id || item.id;
            
            return (
              <div 
                key={itemId} 
                className="wishlist-card" 
                data-aos="fade-up" 
                data-aos-delay={100 * (index + 1)}
              >
                <div className="wishlist-image">
                  <img 
                    src={primaryImage?.url || "assets/img/product/placeholder.webp"} 
                    alt={item.name || 'Product'} 
                    loading="lazy" 
                  />
                  <button 
                    className="btn-remove" 
                    type="button" 
                    aria-label="Remove from wishlist"
                    onClick={()=>handleToggleWishlist(item)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                  {item.discountPercentage > 0 && (
                    <div className="sale-badge">-{item.discountPercentage}%</div>
                  )}
                  {!hasStock && (
                    <div className="out-of-stock-badge">Out of Stock</div>
                  )}
                  {hasStock && isLowStock && (
                    <div className="low-stock-badge">Low Stock</div>
                  )}
                </div>
                <div className="wishlist-content">
                  <h4>{item.name}</h4>
                  <div className="product-meta">
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`bi bi-star${
                            star <= Math.floor(item.ratings?.average || 0) ? '-fill' : 
                            star === Math.ceil(item.ratings?.average || 0) && 
                            !Number.isInteger(item.ratings?.average || 0) ? '-half' : ''
                          }`}
                        ></i>
                      ))}
                      <span>({item.ratings?.count || 0})</span>
                    </div>
                    <div className="price">
                      <span className="current">{displayPrice}</span>
                      {item.discountPercentage > 0 && (
                        <span className="original">
                          ${(parseFloat(price) / (1 - item.discountPercentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="color-display">
                    <div className="color-swatch" style={{backgroundColor: colorValue}}></div>
                  </div>
               
                  <button 
                    type="button" 
                    className={hasStock ? "btn-add-cart" : "btn-notify"}
                    onClick={() => hasStock && handleAddToCart(item)}
                  >
                    {hasStock ? "Add to Cart" : "Notify When Available"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state" data-aos="fade-up">
            <i className="bi bi-heart"></i>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love for later.</p>
            <button 
              onClick={() => window.location.href = '/products'} 
              className="btn btn-primary"
            >
              Explore Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


  const renderPaymentMethodsTab = () => {
    // Show loading state
    if (isLoading || localLoading) {
      return (
        <div className="tab-content">
          <div className="section-header" data-aos="fade-up">
            <h2>Payment Methods</h2>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your payment methods...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="tab-content">
        <div className="section-header" data-aos="fade-up">
          <h2>Payment Methods</h2>
          <div className="header-actions">
            <button 
              type="button" 
              className="btn-add-new"
              onClick={() => setShowAddCardForm(true)}
              disabled={localLoading}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add New Card
            </button>
          </div>
        </div>

        {/* Add Card Modal/Form */}
        {showAddCardForm && (
          <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Payment Card</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowAddCardForm(false);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <Elements stripe={stripePromise}>
                    <AddPaymentCardForm 
                      onSuccess={async () => {
                        await loadPaymentCards();
                        setShowAddCardForm(false);
                        success('Success', 'Payment card added successfully');
                      }}
                      onCancel={() => {
                        setShowAddCardForm(false);
                      }}
                    />
                  </Elements>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Cards Grid */}
        {localPaymentCards && localPaymentCards.length > 0 ? (
          <div className="payment-cards-grid">
            {localPaymentCards.map((card, index) => {
              const isExpired = isCardExpired(card.expiryMonth, card.expiryYear);
              const brandColor = getCardBrandColor(card.cardType);
              
              return (
                <div 
                  key={card._id} 
                  className={`payment-card ${card.isDefault ? 'default' : ''} ${isExpired ? 'expired' : ''}`}
                  data-aos="fade-up" 
                  data-aos-delay={100 * (index + 1)}
                  style={{ borderTop: `4px solid ${brandColor}` }}
                >
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="card-type">
                      <i className={`bi ${getPaymentIcon(card.cardType)} me-2`}></i>
                      <span className="card-brand">{card.cardType || 'Credit Card'}</span>
                    </div>
                    <div className="card-badges">
                      {card.isDefault && (
                        <span className="default-badge">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Default
                        </span>
                      )}
                      {isExpired && (
                        <span className="expired-badge">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          Expired
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <div className="card-number-display">
                      <i className="bi bi-wifi"></i>
                      <span className="card-number">
                        {getMaskedCardNumber(card)}
                      </span>
                    </div>
                    
                    <div className="card-details">
                      <div className="cardholder-info">
                        <span className="label">Cardholder Name</span>
                        <span className="value">{card.cardholderName}</span>
                      </div>
                      <div className="expiry-info">
                        <span className="label">Expires</span>
                        <span className={`value ${isExpired ? 'text-danger' : ''}`}>
                          {formatExpiryDate(card.expiryMonth, card.expiryYear)}
                          {isExpired && ' (Expired)'}
                        </span>
                      </div>
                    </div>

                    {/* Billing Address if exists */}
                    {card.billingAddress && Object.keys(card.billingAddress).length > 0 && (
                      <div className="billing-address-info mt-3">
                        <hr />
                        <div className="billing-address">
                          <i className="bi bi-geo-alt me-1"></i>
                          <span className="label">Billing Address:</span>
                          <span className="value">
                            {card.billingAddress.street}
                            {card.billingAddress.apt && `, ${card.billingAddress.apt}`}
                            {card.billingAddress.city && `, ${card.billingAddress.city}`}
                            {card.billingAddress.state && ` ${card.billingAddress.state}`}
                            {card.billingAddress.zipCode && ` ${card.billingAddress.zipCode}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="card-actions">
                    {!card.isDefault && !isExpired && (
                      <button 
                        type="button" 
                        className="btn-make-default"
                        onClick={() => handleSetDefault(card)}
                        disabled={localLoading}
                      >
                        <i className="bi bi-star me-1"></i>
                        Set as Default
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="btn-remove"
                      onClick={() => handleDeletePayment(card)}
                      disabled={localLoading}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" data-aos="fade-up">
            <i className="bi bi-credit-card display-1 text-muted"></i>
            <h3 className="mt-3">No payment methods</h3>
            <p className="text-muted">Add a payment method for faster checkout.</p>
            <button 
              type="button" 
              className="btn btn-primary mt-2"
              onClick={() => setShowAddCardForm(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Payment Method
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render Addresses Tab
  const renderAddressesTab = () => (
    <div className="tab-content">
      <div className="section-header" data-aos="fade-up">
        <h2>My Addresses</h2>
        <div className="header-actions">
          <button 
            type="button" 
            className="btn-add-new"
            onClick={handleAddAddressClick}
          >
            <i className="bi bi-plus-lg"></i>
            Add New Address
          </button>
        </div>
      </div>

      {/* Address Form */}
      {showAddressForm && (
        <div className="address-form-container" data-aos="fade-up">
          <AddressForm
            address={editingAddress}
            contact={userDisplayData}
            onSubmit={editingAddress ? 
              (data) => handleUpdateAddress(editingAddress.id, data) : 
              handleAddAddress
            }
            onCancel={handleCloseAddressForm}
            isEditing={!!editingAddress}
            isOpen={showAddressForm}
          />
        </div>
      )}

      <div className="addresses-grid">
        {addresses.length > 0 ? (
          addresses.map((address, index) => (
            <div key={address._id || address.id} className={`address-card ${address.isDefault ? 'default' : ''}`} data-aos="fade-up" data-aos-delay={100 * (index + 1)}>
              <div className="card-header">
                <h4>{address.title || address.type}</h4>
                {address.isDefault && <span className="default-badge">Default</span>}
              </div>
              <div className="card-body">
                <p className="address-text">
                  {address.street}, {address.apt}<br />
                  {address.city}, {address.state} {address.zipCode}<br />
                  {address.country}
                </p>
                <div className="contact-info">
                  <div><i className="bi bi-person"></i> {userDisplayData.name}</div>
                  <div><i className="bi bi-telephone"></i> {userDisplayData.phone}</div>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  type="button" 
                  className="btn-edit"
                  onClick={() => handleEditAddress(address)}
                >
                  <i className="bi bi-pencil"></i>
                  Edit
                </button>
                <button 
                  type="button" 
                  className="btn-remove"
                  onClick={() => handleRemoveAddress(address._id || address.id)}
                >
                  <i className="bi bi-trash"></i>
                  Remove
                </button>
                {!address.isDefault && (
                  <button 
                    type="button" 
                    className="btn-make-default"
                    onClick={() => handleSetDefaultAddress(address._id || address.id)}
                  >
                    Make Default
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" data-aos="fade-up">
            <i className="bi bi-geo-alt"></i>
            <h3>No addresses saved</h3>
            <p>Add an address for faster checkout.</p>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleAddAddressClick}
            >
              Add Address
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render Settings Tab
  const renderSettingsTab = () => (
    <div className="tab-content">
      <div className="section-header" data-aos="fade-up">
        <h2>Account Settings</h2>
      </div>

      <div className="settings-content">
        {/* Personal Information Section */}
        <div className="settings-section" data-aos="fade-up">
          <h3>Personal Information</h3>
          <form 
            className="php-email-form settings-form" 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateProfile({
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone')
              });
            }}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="firstName" 
                  name="firstName"
                  defaultValue={user?.firstName || ""} 
                  required 
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="lastName" 
                  name="lastName"
                  defaultValue={user?.lastName || ""} 
                  required 
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  name="email"
                  defaultValue={user?.email || ""} 
                  required 
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  id="phone" 
                  name="phone"
                  defaultValue={user?.phone || ""} 
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-save">Save Changes</button>
            </div>
          </form>
        </div>

        {/* Account Activity Section */}
        <div className="settings-section" data-aos="fade-up" data-aos-delay="100">
          <h3>Account Activity</h3>
          <div className="activity-info">
            <div className="activity-item">
              <i className="bi bi-person-check"></i>
              <div>
                <strong>Member Since</strong>
                <p>{userActivity.memberSince ? new Date(userActivity.memberSince).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="activity-item">
              <i className="bi bi-clock-history"></i>
              <div>
                <strong>Last Login</strong>
                <p>{userActivity.lastLogin ? new Date(userActivity.lastLogin).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="activity-item">
              <i className="bi bi-shield-check"></i>
              <div>
                <strong>Account Status</strong>
                <p>{userActivity.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Preferences Section */}
        <div className="settings-section" data-aos="fade-up" data-aos-delay="200">
          <h3>Email Preferences</h3>
          <div className="preferences-list">
            <div className="preference-item">
              <div className="preference-info">
                <h4>Order Updates</h4>
                <p>Receive notifications about your order status</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="orderUpdates" defaultChecked />
              </div>
            </div>
            <div className="preference-item">
              <div className="preference-info">
                <h4>Promotions</h4>
                <p>Receive emails about new promotions and deals</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="promotions" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (account) {
      case 'profile':
        return renderProfileTab();
      case 'orders':
        return renderOrdersTab();
      case 'complaints':
        return renderComplaintsTab();
      case 'wishlist':
        return renderWishlistTab();
      case 'payment':
        return renderPaymentMethodsTab();
      case 'addresses':
        return renderAddressesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOrdersTab();
    }
  };

  // Show error state
  if (hasError) {
    return (
      <div className="error-fallback">
        <div className="container py-5">
          <div className="text-center">
            <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
            <h2 className="mt-4">Something went wrong</h2>
            <p className="text-muted mb-4">{errorMessage}</p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setHasError(false);
                  setErrorMessage('');
                  window.location.reload();
                }}
              >
                Refresh Page
              </button>
              <button 
                className="btn btn-outline-primary" 
                onClick={() => navigate('/')}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading || cartLoading) {
    return (
      <div className="App">
        <Header 
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          categories={categories}
        />
        <main className="main">
          <div className="page-title light-background">
            <div className="container">
              <div className="placeholder-glow">
                <h1 className="placeholder col-6"></h1>
              </div>
            </div>
          </div>
          <section className="account section">
            <div className="container">
              <div className="row">
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading your account...</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="App">
        <Header 
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          categories={categories}
        />
        <main className="main">
          <div className="page-title light-background">
            <div className="container d-lg-flex justify-content-between align-items-center">
              <h1 className="mb-2 mb-lg-0">Account</h1>
              <nav className="breadcrumbs">
                <ol>
                  <li><a href="/">Home</a></li>
                  <li className="current">Account</li>
                </ol>
              </nav>
            </div>
          </div>

          <section className="account section">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-md-6 text-center py-5">
                  <div className="sign-in-prompt" data-aos="fade-up">
                    <i className="bi bi-person-x display-1 text-muted"></i>
                    <h3 className="mt-4">Please Sign In</h3>
                    <p className="text-muted mb-4">
                      You need to be signed in to view your account details and manage your preferences.
                    </p>
                    <button onClick={() => window.location.href = '/login'} className="btn btn-primary me-3">Sign In</button>
                    <button onClick={() => window.location.href = '/register'} className="btn btn-outline-primary">Create Account</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // ========== NAVIGATION MENU ==========
  const renderNavigationMenu = () => {
    const menuItems = [
      { id: 'profile', icon: 'person', label: 'My Profile' },
      { id: 'orders', icon: 'box-seam', label: 'My Orders', badge: pagination.total },
      { id: 'complaints', icon: 'chat-left-text', label: 'Complaints' },
      { id: 'wishlist', icon: 'heart', label: 'My Wishlist', badge: wishlistCount },
      { id: 'payment', icon: 'wallet2', label: 'Payment Methods', badge: user?.paymentMethods?.length || 0 },
      { id: 'addresses', icon: 'geo-alt', label: 'Addresses', badge: addresses.length },
      { id: 'settings', icon: 'gear', label: 'Account Settings' }
    ];

    return (
      <nav className="menu-nav">
        <ul className="nav flex-column" role="tablist">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${account === item.id ? 'active' : ''}`}
                onClick={() => handleAccountChange(item.id)}
                style={{ 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: 'none', 
                  textAlign: 'left', 
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: account === item.id ? '#0d6efd' : '#6c757d'
                }}
              >
                <i className={`bi bi-${item.icon} me-3`}></i>
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="badge bg-primary ms-auto">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="menu-footer">
          <a href="#" className="help-link">
            <i className="bi bi-question-circle me-2"></i>
            <span>Help Center</span>
          </a>
          <a href="/logout" className="logout-link">
            <i className="bi bi-box-arrow-right me-2"></i>
            <span>Log Out</span>
          </a>
        </div>
      </nav>
    );
  };

  return (
    <div className="App">
      <Header 
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={categories}
      />
      
      <main className="main">
        {/* Page Title */}
        <div className="page-title light-background">
          <div className="container d-lg-flex justify-content-between align-items-center">
            <h1 className="mb-2 mb-lg-0">
              {account === 'profile' ? 'My Profile' :
               account === 'orders' ? 'My Orders' :
               account === 'complaints' ? 'File a Complaint' :
               account === 'wishlist' ? 'My Wishlist' :
               account === 'payment' ? 'Payment Methods' :
               account === 'addresses' ? 'Addresses' :
               account === 'settings' ? 'Account Settings' : 'Account'}
            </h1>
            <nav className="breadcrumbs">
              <ol>
                <li><a href="/">Home</a></li>
                <li className="current">
                  {account === 'profile' ? 'My Profile' :
                   account === 'orders' ? 'My Orders' :
                   account === 'complaints' ? 'Complaints' :
                   account === 'wishlist' ? 'Wishlist' :
                   account === 'payment' ? 'Payment Methods' :
                   account === 'addresses' ? 'Addresses' :
                   account === 'settings' ? 'Settings' : 'Account'}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Account Section */}
        <section id="account" className="account section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            {/* Mobile Menu Toggle */}
            <div className="mobile-menu d-lg-none mb-4">
              <button className="mobile-menu-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#profileMenu">
                <i className="bi bi-grid"></i>
                <span>
                  {account === 'profile' ? 'My Profile' :
                   account === 'orders' ? 'My Orders' :
                   account === 'complaints' ? 'Complaints' :
                   account === 'wishlist' ? 'Wishlist' :
                   account === 'payment' ? 'Payment' :
                   account === 'addresses' ? 'Addresses' :
                   account === 'settings' ? 'Settings' : 'Menu'}
                </span>
                <i className="bi bi-chevron-down ms-2"></i>
              </button>
            </div>

            <div className="row g-4">
              {/* Profile Menu */}
              <div className="col-lg-3">
                <div className="profile-menu collapse d-lg-block" id="profileMenu">
                  {/* User Info */}
                  <div className="user-info" data-aos="fade-right">
                    <div className="user-avatar">
                      <img src={userDisplayData.avatar} alt="Profile" loading="lazy" />
                      <span className="status-badge">
                        <i className="bi bi-shield-check"></i>
                      </span>
                    </div>
                    <h4>{userDisplayData.name}</h4>
                    <div className="user-status">
                      <i className="bi bi-award"></i>
                      <span>{userDisplayData.status}</span>
                    </div>
                  </div>

                  {/* Navigation Menu */}
                  {renderNavigationMenu()}
                </div>
              </div>

              {/* Content Area */}
              <div className="col-lg-9">
                <div className="content-area">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default Account;