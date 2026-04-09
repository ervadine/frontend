import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import { 
  fetchOrderById,
  updateOrderStatus,
  cancelOrder,
  clearError,
  clearSuccess,
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError,
  selectOrderSuccess,
  selectOrderCancelling
} from '../store/redux/orderSlice';

const AdminOrderView = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux selectors
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const success = useSelector(selectOrderSuccess);
  const cancelling = useSelector(selectOrderCancelling);
  
  // Local state
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  // Fetch order data on mount
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  // Clear success/error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Handle status update
  const handleStatusUpdate = (newStatus) => {
    if (window.confirm(`Change order status to "${newStatus}"?`)) {
      dispatch(updateOrderStatus({ 
        orderId, 
        status: newStatus 
      }));
      setShowStatusDropdown(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = () => {
    const reason = window.prompt('Please enter reason for cancellation:');
    if (reason && reason.trim()) {
      if (window.confirm(`Cancel order? This action cannot be undone.`)) {
        dispatch(cancelOrder({ 
          orderId, 
          reason: reason.trim() 
        }));
      }
    }
  };

  // Handle print
  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrint(false), 1000);
    }, 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date for invoice
  const formatInvoiceDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'warning', text: 'Pending' },
      processing: { class: 'info', text: 'Processing' },
      confirmed: { class: 'primary', text: 'Confirmed' },
      shipped: { class: 'primary', text: 'Shipped' },
      delivered: { class: 'success', text: 'Delivered' },
      completed: { class: 'success', text: 'Completed' },
      cancelled: { class: 'danger', text: 'Cancelled' },
      refunded: { class: 'secondary', text: 'Refunded' }
    };
    const config = statusConfig[status] || { class: 'secondary', text: status };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  // Get customer display name - handle both object and string
  const getCustomerDisplay = () => {
    if (!order) return 'N/A';
    
    // If customer is an object
    if (order.customer && typeof order.customer === 'object') {
      return `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 
             order.customer.email || 
             'N/A';
    }
    
    // If customer is a string ID, use shipping address
    return `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 
           'N/A';
  };

  // Get customer ID for display
  const getCustomerId = () => {
    if (!order) return 'N/A';
    
    if (order.customer && typeof order.customer === 'object') {
      return order.customer._id || order.customer.id || 'N/A';
    }
    
    return order.customer || 'N/A';
  };

  // Render loading state
  if (loading && !order) {
    return (
      <div className="section">
        <AdminHeader />
        <AdminMain pageTitle="Order Details">
          <div className="container-fluid">
            <div className="container">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading order...</span>
                  </div>
                  <p className="mt-3">Loading order details...</p>
                </div>
              </div>
            </div>
          </div>
        </AdminMain>
      </div>
    );
  }

  // Render error state
  if (!order && !loading) {
    return (
      <div className="section">
        <AdminHeader />
        <AdminMain pageTitle="Order Details">
          <div className="container-fluid">
            <div className="container">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                  <h5>Order not found</h5>
                  <p className="text-muted">The order you're looking for doesn't exist or you don't have access.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/orders')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Back to Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AdminMain>
      </div>
    );
  }

  return (
    <div className="section">
      <AdminHeader />
      <AdminMain pageTitle={`Order: ${order?.orderNumber || 'Loading...'}`}>
        <div className="container-fluid">
          <div className="container">
            {/* Success Alert */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {success}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => dispatch(clearSuccess())}
                ></button>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => dispatch(clearError())}
                ></button>
              </div>
            )}

            {/* Action Bar */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/admin/orders')}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Orders
                    </button>
                  </div>
                  <div className="d-flex gap-2">
                    {/* Status Dropdown */}
                    <div className="dropdown">
                      <button 
                        className="btn btn-outline-primary dropdown-toggle"
                        type="button"
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        disabled={loading || cancelling}
                      >
                        <i className="bi bi-gear me-2"></i>
                        Update Status
                      </button>
                      {showStatusDropdown && (
                        <div className="dropdown-menu show" style={{display: 'block'}}>
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'].map(status => (
                            order?.status !== status && (
                              <button 
                                key={status}
                                className="dropdown-item"
                                onClick={() => handleStatusUpdate(status)}
                                disabled={loading || cancelling}
                              >
                                <i className={`bi bi-circle-fill text-${status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'primary'} me-2`}></i>
                                Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            )
                          ))}
                          {order?.status !== 'cancelled' && (
                            <>
                              <div className="dropdown-divider"></div>
                              <button 
                                className="dropdown-item text-danger"
                                onClick={handleCancelOrder}
                                disabled={loading || cancelling}
                              >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancel Order
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/admin/orders/${orderId}/edit`)}
                      disabled={loading || cancelling || order?.status === 'cancelled' || order?.status === 'refunded'}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit Order
                    </button>

                    <button 
                      className="btn btn-primary"
                      onClick={handlePrint}
                      disabled={loading || cancelling}
                    >
                      <i className="bi bi-printer me-2"></i>
                      Print Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-receipt me-2"></i>
                  Order Summary
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="mb-3">
                      <small className="text-muted">Order Number</small>
                      <h6 className="mb-0">{order?.orderNumber}</h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <small className="text-muted">Order Date</small>
                      <h6 className="mb-0">{formatDate(order?.createdAt)}</h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <small className="text-muted">Status</small>
                      <h6 className="mb-0">{getStatusBadge(order?.status)}</h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <small className="text-muted">Total Amount</small>
                      <h6 className="mb-0 text-success">{formatCurrency(order?.total || 0)}</h6>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-3">
                    <div className="mb-3">
                      <small className="text-muted">Customer</small>
                      <h6 className="mb-0">
                        {getCustomerDisplay()}
                      </h6>
                      <small className="text-muted">{order?.shippingAddress?.email}</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <small className="text-muted">Payment Method</small>
                      <h6 className="mb-0 text-capitalize">{order?.payment?.method || 'N/A'}</h6>
                      <small className={`badge ${order?.payment?.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                        {order?.payment?.status || 'Pending'}
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <small className="text-muted">Transaction ID</small>
                      <h6 className="mb-0 small">{order?.payment?.transactionId || 'N/A'}</h6>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <small className="text-muted">Shipping Method</small>
                      <h6 className="mb-0 text-capitalize">{order?.shippingMethod || 'Standard'}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Customer Information */}
              <div className="col-lg-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-person me-2"></i>
                      Customer Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <h6 className="mb-3">Contact Details</h6>
                    <p className="mb-2">
                      <strong>Name:</strong> {getCustomerDisplay()}
                    </p>
                    <p className="mb-2">
                      <strong>Email:</strong> {order?.shippingAddress?.email}
                    </p>
                    <p className="mb-2">
                      <strong>Phone:</strong> {order?.shippingAddress?.phone}
                    </p>
                    <p className="mb-0">
                      <strong>Customer ID:</strong> {getCustomerId()}
                    </p>

                    <hr className="my-4" />

                    <h6 className="mb-3">Shipping Address</h6>
                    <address className="mb-0">
                      {order?.shippingAddress?.street}<br />
                      {order?.shippingAddress?.apartment && (
                        <>
                          {order.shippingAddress.apartment}<br />
                        </>
                      )}
                      {order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zipCode}<br />
                      {order?.shippingAddress?.country}
                    </address>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="col-lg-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-credit-card me-2"></i>
                      Billing Information
                    </h5>
                  </div>
                  <div className="card-body">
                    {order?.billingAddress?.billingSame ? (
                      <div className="alert alert-info mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Billing address is same as shipping address
                      </div>
                    ) : (
                      <>
                        <h6 className="mb-3">Billing Address</h6>
                        <address className="mb-4">
                          {order?.billingAddress?.firstName} {order?.billingAddress?.lastName}<br />
                          {order?.billingAddress?.street}<br />
                          {order?.billingAddress?.apartment && (
                            <>
                              {order.billingAddress.apartment}<br />
                            </>
                          )}
                          {order?.billingAddress?.city}, {order?.billingAddress?.state} {order?.billingAddress?.zipCode}<br />
                          {order?.billingAddress?.country}
                        </address>
                      </>
                    )}

                    <hr className="my-4" />

                    <h6 className="mb-3">Payment Details</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Payment Method:</strong></td>
                            <td className="text-capitalize">{order?.payment?.method || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Payment Status:</strong></td>
                            <td>
                              <span className={`badge ${order?.payment?.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                {order?.payment?.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Transaction ID:</strong></td>
                            <td className="small">{order?.payment?.transactionId || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Payment Date:</strong></td>
                            <td>{formatDate(order?.payment?.paymentDate)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-cart me-2"></i>
                  Order Items ({order?.items?.length || 0})
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Product</th>
                        <th>Variant</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th className="pe-4 text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order?.items?.map((item, index) => {
                        const color = item.product?.colors?.availableColors?.find(
                          c => c.value === item.variant?.colorValue
                        );
                        const size = color?.quantityConfig?.quantities?.find(
                          q => q.size?.value === item.variant?.sizeValue
                        );
                        
                        return (
                          <tr key={item.id || item._id || index}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  {color?.images?.[0]?.url ? (
                                    <img 
                                      src={color.images[0].url} 
                                      alt={item.product.name}
                                      className="img-thumbnail"
                                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <div className="bg-light d-flex align-items-center justify-content-center"
                                         style={{ width: '60px', height: '60px' }}>
                                      <i className="bi bi-image text-muted"></i>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h6 className="mb-1">{item.product?.name}</h6>
                                  <div className="small text-muted">
                                    <div>SKU: {size?.sku || 'N/A'}</div>
                                    <div>Barcode: {size?.barcode || 'N/A'}</div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {color && (
                                  <div 
                                    className="color-swatch me-2"
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      backgroundColor: color.hexCode || color.value,
                                      border: '1px solid #dee2e6',
                                      borderRadius: '4px'
                                    }}
                                    title={color.name}
                                  ></div>
                                )}
                                <div>
                                  <div><strong>Color:</strong> {color?.name || 'N/A'}</div>
                                  <div><strong>Size:</strong> {size?.displayText || item.variant?.sizeValue || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{item.quantity}</td>
                            <td className="pe-4 text-end fw-bold">{formatCurrency(item.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Subtotal:</strong></td>
                        <td className="pe-4 text-end">{formatCurrency(order?.subtotal || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Tax:</strong></td>
                        <td className="pe-4 text-end">{formatCurrency(order?.tax || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Shipping:</strong></td>
                        <td className="pe-4 text-end">{formatCurrency(order?.shipping || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Discount:</strong></td>
                        <td className="pe-4 text-end text-danger">-{formatCurrency(order?.discount || 0)}</td>
                      </tr>
                      <tr className="table-active">
                        <td colSpan="4" className="text-end"><strong>Total:</strong></td>
                        <td className="pe-4 text-end fw-bold fs-5">{formatCurrency(order?.total || 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order?.notes && (
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-chat-left-text me-2"></i>
                    Order Notes
                  </h5>
                </div>
                <div className="card-body">
                  <p className="mb-0">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Print Invoice Section (Hidden except for print) */}
            <div className={`d-none ${showPrint ? 'd-print-block' : ''}`}>
              <div className="invoice-print">
                <div className="text-center mb-4">
                  <h1>INVOICE</h1>
                  <p className="text-muted">Thank you for your business</p>
                </div>
                
                <div className="row mb-4">
                  <div className="col-6">
                    <h5>From:</h5>
                    <p>
                      <strong>Your Store Name</strong><br />
                      123 Business Street<br />
                      City, State 12345<br />
                      Phone: (123) 456-7890<br />
                      Email: info@yourstore.com
                    </p>
                  </div>
                  <div className="col-6 text-end">
                    <h5>To:</h5>
                    <p>
                      <strong>{order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}</strong><br />
                      {order?.shippingAddress?.street}<br />
                      {order?.shippingAddress?.apartment && `${order.shippingAddress.apartment}<br />`}
                      {order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zipCode}<br />
                      {order?.shippingAddress?.country}
                    </p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-6">
                    <p><strong>Invoice #:</strong> {order?.orderNumber}</p>
                  </div>
                  <div className="col-6 text-end">
                    <p><strong>Invoice Date:</strong> {formatInvoiceDate(order?.createdAt)}</p>
                  </div>
                </div>
                
                <div className="table-responsive mb-4">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Variant</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order?.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product?.name}</td>
                          <td>
                            Color: {item.variant?.colorValue}, Size: {item.variant?.sizeValue}
                          </td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Subtotal:</strong></td>
                        <td>{formatCurrency(order?.subtotal || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Tax:</strong></td>
                        <td>{formatCurrency(order?.tax || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Shipping:</strong></td>
                        <td>{formatCurrency(order?.shipping || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Discount:</strong></td>
                        <td className="text-danger">-{formatCurrency(order?.discount || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Total:</strong></td>
                        <td className="fw-bold">{formatCurrency(order?.total || 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="text-muted text-center">
                  <p>Thank you for your business. Please contact us if you have any questions.</p>
                  <p>Invoice was created on a computer and is valid without the signature and seal.</p>
                </div>
              </div>
            </div>

            {/* Print-specific styles */}
            <style jsx="true">{`
              @media print {
                .section {
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .container-fluid, .container {
                  width: 100% !important;
                  max-width: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .card, .card-body, .card-header {
                  border: none !important;
                  box-shadow: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  background: white !important;
                }
                .btn, .dropdown, .alert {
                  display: none !important;
                }
                .d-print-block {
                  display: block !important;
                }
                .invoice-print {
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
              }
            `}</style>
          </div>
        </div>
      </AdminMain>
    </div>
  );
};

export default AdminOrderView;