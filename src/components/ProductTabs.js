// components/ProductTabs.js
import React, { useState } from 'react';
import '../styles/productDetails.css';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: `Reviews (${product.ratings?.count || 0})` },
    { id: 'shipping', label: 'Shipping & Returns' }
  ]; 

  return (
    <div className="product-details-tabs">
      <div className="tabs-header">
        <ul className="nav nav-tabs" id="productTabs" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                role="tab"
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul> 
      </div>

      <div className="tabs-content">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="tab-pane fade show active">
            <ProductDescription product={product} />
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specifications' && (
          <div className="tab-pane fade show active">
            <ProductSpecifications product={product} />
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="tab-pane fade show active">
            <ProductReviews product={product} />
          </div>
        )}

        {/* Shipping & Returns Tab */}
        {activeTab === 'shipping' && (
          <div className="tab-pane fade show active">
            <ShippingReturns product={product} />
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDescription = ({ product }) => (
  <div className="product-description">
    <div className="description-section">
      <h4 className="section-title">Product Overview</h4>
      <div className="description-content">
        <p className="description-text">{product.description}</p>
      </div>
    </div>

    {product.specifications && product.specifications.length > 0 && (
      <div className="description-section">
        <h4 className="section-title">Key Features</h4>
        <ul className="features-list">
          {product.specifications.slice(0, 6).map((spec, index) => (
            <li key={index} className="feature-item">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              <span>{spec.value}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="description-section">
      <h4 className="section-title">What's in the Box</h4>
      <ul className="included-items">
        <li className="included-item">
          <i className="bi bi-check-lg text-primary me-2"></i>
          {product.name}
        </li>
        <li className="included-item">
          <i className="bi bi-check-lg text-primary me-2"></i>
          User Manual
        </li>
        <li className="included-item">
          <i className="bi bi-check-lg text-primary me-2"></i>
          Warranty Card
        </li>
        {product.tags?.includes('electronics') && (
          <li className="included-item">
            <i className="bi bi-check-lg text-primary me-2"></i>
            Charging Cable
          </li>
        )}
        {product.tags?.includes('clothing') && (
          <li className="included-item">
            <i className="bi bi-check-lg text-primary me-2"></i>
            Care Instructions
          </li>
        )}
      </ul>
    </div>

    {product.careInstructions && product.careInstructions.length > 0 && (
      <div className="description-section">
        <h4 className="section-title">Care Instructions</h4>
        <div className="care-instructions">
          {product.careInstructions.map((instruction, index) => (
            <div key={index} className="care-item">
              <i className="bi bi-info-circle text-info me-2"></i>
              <span>{instruction}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ProductSpecifications = ({ product }) => {
  const specifications = [
    { name: 'Brand', value: product.brand?.name || 'Generic' },
    { name: 'SKU', value: product.sku || 'N/A' },
    { name: 'Category', value: product.category?.name || 'Uncategorized' },
    { name: 'Material', value: 'Premium Quality' },
    { name: 'Weight', value: '0.5 kg' },
    { name: 'Dimensions', value: '10 x 5 x 3 cm' },
    ...(product.specifications || [])
  ];

  return (
    <div className="product-specifications">
      <div className="specs-group">
        <h4 className="section-title">Product Specifications</h4>
        <div className="specs-table">
          {specifications.map((spec, index) => (
            <div key={index} className="specs-row">
              <div className="specs-label">{spec.name}</div>
              <div className="specs-value">{spec.value}</div>
            </div>
          ))}
        </div>
      </div>

      {product.sizeConfig?.dimensionalConfig?.hasDimensions && (
        <div className="specs-group">
          <h4 className="section-title">Dimensions</h4>
          <div className="dimensions-info">
            <div className="dimension-item">
              <span className="dimension-label">Height:</span>
              <span className="dimension-value">24 cm</span>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">Width:</span>
              <span className="dimension-value">18 cm</span>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">Depth:</span>
              <span className="dimension-value">8 cm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductReviews = ({ product }) => {
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    name: '',
    email: '',
    title: '',
    content: ''
  });

  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    console.log('Review submitted:', reviewForm);
    
    // Show success message
    alert('Thank you for your review! It will be published after verification.');
    
    // Reset form
    setReviewForm({
      rating: 0,
      name: '',
      email: '',
      title: '',
      content: ''
    });
    setShowReviewForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setReviewForm(prev => ({
      ...prev,
      rating
    }));
  };

  const ratingAverage = product.ratings?.average || 4.2;
  const ratingCount = product.ratings?.count || 28;

  // Calculate rating breakdown from actual data if available
  const ratingBreakdown = product.ratings?.distribution ? 
    Object.entries(product.ratings.distribution).map(([stars, count]) => ({
      stars: parseInt(stars),
      count,
      percentage: (count / ratingCount) * 100
    })).reverse() : [
      { stars: 5, count: 15, percentage: 54 },
      { stars: 4, count: 8, percentage: 29 },
      { stars: 3, count: 3, percentage: 11 },
      { stars: 2, count: 1, percentage: 4 },
      { stars: 1, count: 1, percentage: 4 }
    ];

  // Sample reviews data - in real app, this would come from API
  const sampleReviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      date: "2 days ago",
      rating: 5,
      title: "Absolutely love this product!",
      content: "The quality exceeded my expectations. The material feels premium and it's very comfortable to use. Would definitely recommend to others looking for a reliable product.",
      verified: true
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      date: "1 week ago",
      rating: 4,
      title: "Great value for money",
      content: "Good product overall. The shipping was fast and the item arrived in perfect condition. The only minor issue was the sizing, but it's manageable.",
      verified: true
    },
    {
      id: 3,
      name: "Emily Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      date: "2 weeks ago",
      rating: 5,
      title: "Perfect for daily use",
      content: "I've been using this every day and it's held up really well. The design is stylish and functional. Very happy with my purchase!",
      verified: false
    }
  ];

  // Function to render stars based on rating
  const renderStars = (rating, size = 'md') => {
    const sizeClass = size === 'lg' ? 'star-lg' : 'star-md';
    
    return (
      <div className={`star-rating-display ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i 
            key={star}
            className={`bi bi-star${star <= rating ? '-fill' : ''} ${star === Math.ceil(rating) && rating % 1 !== 0 ? 'bi-star-half' : ''}`}
          ></i>
        ))}
        <span className="rating-text">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="product-reviews">
      {/* Reviews Summary */}
      <div className="reviews-summary">
        <div className="overall-rating">
          <div className="rating-number">{ratingAverage.toFixed(1)}</div>
          {renderStars(ratingAverage, 'lg')}
          <div className="rating-count">{ratingCount} reviews</div>
        </div>

        <div className="rating-breakdown">
          {ratingBreakdown.map((item) => (
            <div key={item.stars} className="rating-bar">
              <div className="rating-label">
                <span>{item.stars}</span>
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${item.percentage}%` }}
                  aria-valuenow={item.percentage} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="rating-count">{item.count}</div>
            </div>
          ))}
        </div>

        <div className="write-review-btn-container">
          <button 
            className="btn btn-primary write-review-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            <i className="bi bi-pencil me-2"></i>
            Write a Review
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="review-form-container">
          <h4 className="section-title">Write a Review</h4>
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <div className="rating-select mb-4">
              <label className="form-label">Your Rating *</label>
              <div className="star-rating-input">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <React.Fragment key={rating}>
                    <input 
                      type="radio" 
                      id={`star${rating}`} 
                      name="rating" 
                      value={rating}
                      checked={reviewForm.rating === rating}
                      onChange={() => handleRatingChange(rating)}
                      className="visually-hidden"
                    />
                    <label 
                      htmlFor={`star${rating}`} 
                      title={`${rating} stars`}
                      className={`star-label ${reviewForm.rating >= rating ? 'active' : ''}`}
                    >
                      <i className="bi bi-star-fill"></i>
                    </label>
                  </React.Fragment>
                ))}
                <span className="rating-text ms-2">
                  {reviewForm.rating > 0 ? `${reviewForm.rating} stars` : 'Select rating'}
                </span>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="review-name" className="form-label">Your Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="review-name" 
                  name="name"
                  value={reviewForm.name}
                  onChange={handleInputChange}
                  required 
                  placeholder="Enter your name"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="review-email" className="form-label">Your Email *</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="review-email" 
                  name="email"
                  value={reviewForm.email}
                  onChange={handleInputChange}
                  required 
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="review-title" className="form-label">Review Title *</label>
              <input 
                type="text" 
                className="form-control" 
                id="review-title" 
                name="title"
                value={reviewForm.title}
                onChange={handleInputChange}
                required 
                placeholder="Summarize your experience"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="review-content" className="form-label">Your Review *</label>
              <textarea 
                className="form-control" 
                id="review-content" 
                rows="5" 
                name="content"
                value={reviewForm.content}
                onChange={handleInputChange}
                required
                placeholder="Share your thoughts about the product..."
              ></textarea>
              <div className="form-text">
                Be specific about what you liked, disliked, or how you use the product.
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!reviewForm.rating || !reviewForm.name || !reviewForm.email || !reviewForm.title || !reviewForm.content}
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        <h4 className="section-title">Customer Reviews ({sampleReviews.length})</h4>

        {sampleReviews.length === 0 ? (
          <div className="no-reviews">
            <i className="bi bi-chat-square-text display-4 text-muted"></i>
            <h5>No reviews yet</h5>
            <p>Be the first to share your thoughts about this product!</p>
          </div>
        ) : (
          <>
            {sampleReviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img 
                      src={review.avatar} 
                      alt={review.name} 
                      className="reviewer-avatar" 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=User';
                      }}
                    />
                    <div className="reviewer-details">
                      <h5 className="reviewer-name">{review.name}</h5>
                      <div className="review-meta">
                        <span className="review-date">{review.date}</span>
                        {review.verified && (
                          <span className="verified-badge">
                            <i className="bi bi-patch-check-fill text-primary"></i>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                <h5 className="review-title">{review.title}</h5>
                
                <div className="review-content">
                  <p>{review.content}</p>
                </div>

                <div className="review-actions">
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-hand-thumbs-up me-1"></i>
                    Helpful (12)
                  </button>
                  <button className="btn btn-sm btn-outline-secondary ms-2">
                    <i className="bi bi-flag me-1"></i>
                    Report
                  </button>
                </div>
              </div>
            ))}

            <div className="reviews-footer">
              <button className="btn btn-outline-primary load-more-btn">
                <i className="bi bi-arrow-down me-2"></i>
                Load More Reviews
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ShippingReturns = ({ product }) => (
  <div className="shipping-returns">
    <div className="shipping-section">
      <h4 className="section-title">
        <i className="bi bi-truck me-2"></i>
        Shipping Information
      </h4>
      <div className="shipping-details">
        <div className="shipping-item">
          <i className="bi bi-clock text-primary me-3"></i>
          <div>
            <h6>Delivery Time</h6>
            <p className="mb-0">3-5 business days</p>
          </div>
        </div>
        <div className="shipping-item">
          <i className="bi bi-geo-alt text-primary me-3"></i>
          <div>
            <h6>Shipping Areas</h6>
            <p className="mb-0">Worldwide shipping available</p>
          </div>
        </div>
        <div className="shipping-item">
          <i className="bi bi-currency-dollar text-primary me-3"></i>
          <div>
            <h6>Shipping Cost</h6>
            <p className="mb-0">
              {product.shipping?.isFree ? 
                'Free shipping on all orders' : 
                'Calculated at checkout'
              }
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="returns-section">
      <h4 className="section-title">
        <i className="bi bi-arrow-left-right me-2"></i>
        Return Policy
      </h4>
      <div className="returns-policy">
        <div className="policy-item">
          <i className="bi bi-calendar-check text-success me-3"></i>
          <div>
            <h6>30-Day Return Policy</h6>
            <p className="mb-2">Easy returns within 30 days of purchase</p>
            <small className="text-muted">Items must be in original condition with tags attached</small>
          </div>
        </div>
        <div className="policy-item">
          <i className="bi bi-credit-card text-success me-3"></i>
          <div>
            <h6>Free Returns</h6>
            <p className="mb-0">Free return shipping for all orders</p>
          </div>
        </div>
        <div className="policy-item">
          <i className="bi bi-shield-check text-success me-3"></i>
          <div>
            <h6>Warranty</h6>
            <p className="mb-0">2-year manufacturer warranty included</p>
          </div>
        </div>
      </div>
    </div>

    <div className="support-section">
      <h4 className="section-title">
        <i className="bi bi-headset me-2"></i>
        Customer Support
      </h4>
      <div className="support-info">
        <p>Need help with your order or have questions about this product?</p>
        <div className="support-contacts">
          <div className="contact-item">
            <i className="bi bi-envelope me-2"></i>
            support@example.com
          </div>
          <div className="contact-item">
            <i className="bi bi-telephone me-2"></i>
            1-800-123-4567
          </div>
          <div className="contact-item">
            <i className="bi bi-clock me-2"></i>
            Mon-Fri 9AM-6PM EST
          </div> 
        </div>
      </div>
    </div>
  </div>
);

export default ProductTabs;