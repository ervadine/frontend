import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import {
  fetchOrderById,
  updateOrderStatus,
  updateOrderDetails,
  clearError,
  clearSuccess,
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError,
  selectOrderSuccess
} from '../store/redux/orderSlice';

const AdminOrderEdit = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const success = useSelector(selectOrderSuccess);

  // Local state
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [isModified, setIsModified] = useState(false);

  // Fetch order data on mount
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  // Update form when order data changes
  useEffect(() => {
    if (order) {
      setStatus(order.status || '');
      setTrackingNumber(order.trackingNumber || '');
      setAdminNotes(order.notes || '');

      if (order.shippingAddress) {
        setShippingAddress({
          firstName: order.shippingAddress.firstName || '',
          lastName: order.shippingAddress.lastName || '',
          email: order.shippingAddress.email || '',
          phone: order.shippingAddress.phone || '',
          street: order.shippingAddress.street || '',
          apartment: order.shippingAddress.apartment || '',
          city: order.shippingAddress.city || '',
          state: order.shippingAddress.state || '',
          zipCode: order.shippingAddress.zipCode || '',
          country: order.shippingAddress.country || ''
        });
      }
    }
  }, [order]);

  // Clear success/error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        setIsModified(false);
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
  const handleStatusUpdate = (e) => {
    e.preventDefault();
    if (window.confirm(`Update order status to "${status}"?`)) {
      dispatch(updateOrderStatus({
        orderId,
        status,
        trackingNumber: trackingNumber || undefined
      }));
      setIsModified(true);
    }
  };

  // Handle order details update
  const handleUpdateOrderDetails = (e) => {
    e.preventDefault();
    if (window.confirm('Update order details?')) {
      const updates = {
        shippingAddress,
        notes: adminNotes
      };
      dispatch(updateOrderDetails({ orderId, updates }));
      setIsModified(true);
    }
  };

  // Handle shipping address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/admin/orders/${orderId}`);
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

  // Get customer ID - FIXED: Handle both string and object customer
  const getCustomerId = () => {
    if (!order?.customer) return 'N/A';

    // If customer is a string (ID)
    if (typeof order.customer === 'string') {
      return order.customer;
    }

    // If customer is an object with _id
    if (order.customer && typeof order.customer === 'object' && order.customer._id) {
      return order.customer._id;
    }

    // If customer is an object with id
    if (order.customer && typeof order.customer === 'object' && order.customer.id) {
      return order.customer.id;
    }

    return 'N/A';
  };

  // Get customer name - optional display
  const getCustomerName = () => {
    if (!order?.customer) return '';

    // If customer is an object with firstName and lastName
    if (order.customer && typeof order.customer === 'object') {
      const firstName = order.customer.firstName || '';
      const lastName = order.customer.lastName || '';
      return `${firstName} ${lastName}`.trim();
    }

    return '';
  };

  // Render loading state
  if (loading && !order) {
    return (
      <div className="section">
        <AdminHeader />
        <AdminMain pageTitle="Edit Order">
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
        <AdminMain pageTitle="Edit Order">
          <div className="container-fluid">
            <div className="container">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                  <h5>Order not found</h5>
                  <p className="text-muted">The order you're trying to edit doesn't exist or you don't have access.</p>
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
      <AdminMain pageTitle={`Edit Order: ${order?.orderNumber || 'Loading...'}`}>
        <div className="container-fluid">
          <div className="container">
            {/* Success Alert */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                Order updated successfully!
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

            {/* Order Info Card */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Order Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Order Number:</strong> {order?.orderNumber}</p>
                    <p><strong>Date:</strong> {formatDate(order?.createdAt)}</p>
                    <p>
                      <strong>Customer:</strong> {getCustomerId()}
                      {getCustomerName() && (
                        <span className="text-muted ms-2">({getCustomerName()})</span>
                      )}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Current Status:</strong> {getStatusBadge(order?.status)}</p>
                    <p><strong>Shipping Method:</strong> {order?.shippingMethod || 'Standard'}</p>
                    <p><strong>Payment Status:</strong>
                      <span className={`badge ${order?.payment?.status === 'completed' ? 'bg-success' : 'bg-warning'} ms-2`}>
                        {order?.payment?.status || 'Pending'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Left Column - Order Status & Tracking */}
              <div className="col-lg-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-truck me-2"></i>
                      Order Status & Tracking
                    </h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleStatusUpdate}>
                      <div className="mb-3">
                        <label className="form-label">Order Status</label>
                        <select
                          className="form-select"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Tracking Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                        <div className="form-text">
                          Leave empty if not applicable
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Admin Notes</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Internal notes about this order"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-save me-2"></i>
                              Update Status
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setStatus(order?.status || '');
                            setTrackingNumber(order?.trackingNumber || '');
                            setAdminNotes(order?.notes || '');
                          }}
                        >
                          Reset Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Column - Shipping Address */}
              <div className="col-lg-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-geo-alt me-2"></i>
                      Shipping Address
                    </h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleUpdateOrderDetails}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={shippingAddress.firstName}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={shippingAddress.lastName}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={shippingAddress.email}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={shippingAddress.phone}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Street Address</label>
                        <input
                          type="text"
                          className="form-control"
                          name="street"
                          value={shippingAddress.street}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Apartment/Suite</label>
                        <input
                          type="text"
                          className="form-control"
                          name="apartment"
                          value={shippingAddress.apartment}
                          onChange={handleAddressChange}
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            className="form-control"
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">State</label>
                          <input
                            type="text"
                            className="form-control"
                            name="state"
                            value={shippingAddress.state}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ZIP Code</label>
                          <input
                            type="text"
                            className="form-control"
                            name="zipCode"
                            value={shippingAddress.zipCode}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          className="form-control"
                          name="country"
                          value={shippingAddress.country}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-save me-2"></i>
                              Update Address
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            if (order?.shippingAddress) {
                              setShippingAddress({
                                firstName: order.shippingAddress.firstName || '',
                                lastName: order.shippingAddress.lastName || '',
                                email: order.shippingAddress.email || '',
                                phone: order.shippingAddress.phone || '',
                                street: order.shippingAddress.street || '',
                                apartment: order.shippingAddress.apartment || '',
                                city: order.shippingAddress.city || '',
                                state: order.shippingAddress.state || '',
                                zipCode: order.shippingAddress.zipCode || '',
                                country: order.shippingAddress.country || ''
                              });
                            }
                          }}
                        >
                          Reset Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Card */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-cart me-2"></i>
                  Order Items
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Variant</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order?.items?.map((item, index) => {
                        // Find the matching color from the product's available colors
                        const colorInfo = item.product?.colors?.availableColors?.find(
                          color => color.value === item.variant?.colorValue ||
                            color.hexCode === item.variant?.colorValue ||
                            color.name === item.variant?.colorValue
                        );

                        // Find the matching image for the specific color
                        const colorImage = colorInfo?.images?.[0]?.url ||
                          item.product?.colors?.availableColors?.[0]?.images?.[0]?.url;

                        return (
                          <tr key={item.id || index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  {colorImage ? (
                                    <img
                                      src={colorImage}
                                      alt={item.product?.name}
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
                                  <h6 className="mb-0">{item.product?.name}</h6>
                                  <small className="text-muted">SKU: {item.product?.colors?.availableColors?.[0]?.quantityConfig?.quantities?.[0]?.sku || 'N/A'}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                {/* Color display with swatch */}
                                <div className="mb-1">
                                  <strong className="me-1">Color:</strong>
                                  <div className="d-inline-flex align-items-center">
                                    {item.variant?.colorValue && (
                                      <>
                                        {colorInfo?.hexCode || colorInfo?.value ? (
                                          <div
                                            className="color-swatch me-1"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              backgroundColor: colorInfo.hexCode || colorInfo.value,
                                              border: '1px solid #dee2e6',
                                              borderRadius: '3px',
                                              display: 'inline-block'
                                            }}
                                            title={colorInfo?.name || item.variant.colorValue}
                                          ></div>
                                        ) : null}
                                        <span>{colorInfo?.name || item.variant.colorValue}</span>
                                      </>
                                    )}
                                    {!item.variant?.colorValue && <span>N/A</span>}
                                  </div>
                                </div>

                                {/* Size display */}
                                <div>
                                  <strong>Size:</strong> {item.variant?.sizeValue || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{item.quantity}</td>
                            <td className="fw-bold">{formatCurrency(item.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Subtotal:</strong></td>
                        <td className="fw-bold">{formatCurrency(order?.subtotal || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Tax:</strong></td>
                        <td className="fw-bold">{formatCurrency(order?.tax || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Shipping:</strong></td>
                        <td className="fw-bold">{formatCurrency(order?.shipping || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Discount:</strong></td>
                        <td className="fw-bold text-danger">-{formatCurrency(order?.discount || 0)}</td>
                      </tr>
                      <tr className="table-active">
                        <td colSpan="4" className="text-end"><strong>Total:</strong></td>
                        <td className="fw-bold fs-5">{formatCurrency(order?.total || 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Order View
                    </button>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/admin/orders')}
                    >
                      <i className="bi bi-list me-2"></i>
                      All Orders
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => window.print()}
                    >
                      <i className="bi bi-printer me-2"></i>
                      Print Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminMain>
    </div>
  );
};

export default AdminOrderEdit;