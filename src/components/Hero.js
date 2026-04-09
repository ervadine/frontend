// components/Hero/Hero.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCompany, 
  selectCompany,
  selectCompanyName,
  selectCompanyDescription,
  selectCompanyLogo
} from '../store/redux/companySlice';
import { 
  getProductsOnSale, 
  selectLoading, 
  selectError,
  selectProductsOnSale
} from '../store/redux/productSlice';

const Hero = () => {
  const dispatch = useDispatch();
  
  // Select company data from Redux store
  const company = useSelector(selectCompany);
  const companyName = useSelector(selectCompanyName);
  const companyDescription = useSelector(selectCompanyDescription);
  const companyLogo = useSelector(selectCompanyLogo);
  
  // Select product data from Redux store
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const productsOnSale = useSelector(selectProductsOnSale) || [];
  
  // Fetch company and sale products on component mount
  useEffect(() => {
    dispatch(fetchCompany());
    dispatch(getProductsOnSale({ limit: 2 })); // Get only 2 products on sale
  }, [dispatch]);

  // Format company name for display
  const getDisplayName = () => {
    if (!companyName) return 'Dar Collection';
    return companyName.split(' ')[0] || companyName;
  };

  // Get description from Redux or use default
  const getDescription = () => {
    if (companyDescription) {
      return companyDescription;
    }
    return `Discover thoughtfully designed essentials for the conscious modern home. ${getDisplayName()} offers minimalist homeware, sustainable textiles, and carefully curated decor that balances functionality with aesthetic appeal. Our products transform everyday spaces into serene sanctuaries of style and comfort.`;
  };

  // Get company-specific benefits
  const getCompanyBenefits = () => {
    if (company?.benefits) {
      return company.benefits.slice(0, 3); // Show first 3 benefits
    }
    
    // Default benefits
    return [
      { icon: 'bi-shield-check', text: 'Secure Payment', description: 'SSL encrypted' },
      { icon: 'bi-arrow-repeat', text: 'Easy Returns', description: '30-day policy' }
    ];
  };

  // Get hero image from company or use default
  const getHeroImage = () => {
    if (company?.heroImage?.url) {
      return company.heroImage.url;
    }
    if (companyLogo?.url) {
      return companyLogo.url;
    }
    return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop';
  };

  // Get collection theme based on company data
  const getCollectionTheme = () => {
    if (company?.currentCollection) {
      return company.currentCollection;
    }
    return 'New Collection 2025';
  };

  // Format discount percentage - FIXED: Round to whole number and add % sign
  const formatDiscountPercent = (discountPercentage) => {
    if (!discountPercentage && discountPercentage !== 0) return '0%';
    // Round to nearest integer (or you can use toFixed(1) for one decimal)
    const roundedPercent = Math.round(discountPercentage);
    return `${roundedPercent}%`;
  };

  // Get discount info from company or products - FIXED
  const getDiscountInfo = () => {
    if (company?.discountInfo) {
      return { 
        percent: formatDiscountPercent(parseFloat(company.discountInfo.percent)), 
        text: company.discountInfo.text || 'OFF' 
      };
    }
    
    // If we have products on sale, show the highest discount
    if (productsOnSale.length > 0) {
      // Find the highest discount percentage
      const highestDiscountProduct = productsOnSale.reduce((max, product) => {
        const discountPercent = product.discountPercentage || 0;
        return discountPercent > (max.discountPercentage || 0) ? product : max;
      }, productsOnSale[0] || {});
      
      const highestDiscount = highestDiscountProduct.discountPercentage || 0;
      return { percent: formatDiscountPercent(highestDiscount), text: 'OFF' };
    }
    
    return { percent: '30%', text: 'OFF' };
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price not available';
    if (typeof price === 'string') return price;
    return `$${price.toFixed(2)}`;
  };

  // Get original price (if comparePrice exists)
  const getOriginalPrice = (product) => {
    if (product.comparePrice) return formatPrice(product.comparePrice);
    
    // Check variants for compare prices
    if (product.variants && product.variants.length > 0) {
      const variantWithCompare = product.variants.find(v => v.comparePrice);
      if (variantWithCompare) return formatPrice(variantWithCompare.comparePrice);
    }
    
    // Check colors for compare prices
    if (product.colors?.availableColors) {
      const colorWithCompare = product.colors.availableColors.find(c => c.comparePrice);
      if (colorWithCompare) return formatPrice(colorWithCompare.comparePrice);
    }
    
    return null;
  };

  // Get product image URL - FIXED: Properly extract image from data structure
  const getProductImage = (product) => {
    // Try to get from primaryImage array
    if (product.primaryImage && product.primaryImage.length > 0 && product.primaryImage[0].url) {
      return product.primaryImage[0].url;
    }
    
    // Try to get from colors.availableColors
    if (product.colors?.availableColors && product.colors.availableColors.length > 0) {
      const firstColor = product.colors.availableColors[0];
      if (firstColor.images && firstColor.images[0] && firstColor.images[0][0]?.url) {
        return firstColor.images[0][0].url;
      }
      if (firstColor.images && firstColor.images[0] && firstColor.images[0].url) {
        return firstColor.images[0].url;
      }
    }
    
    // Fallback to placeholder
    return 'https://via.placeholder.com/70';
  };

  const benefits = getCompanyBenefits();
  const discountInfo = getDiscountInfo();

  return (
    <section className="ecommerce-hero-1 hero section" id="hero">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Content Column */}
          <div className="col-lg-6 content-col" data-aos="fade-right" data-aos-delay="100">
            <div className="content">
              {/* Collection Badge */}
              <span className="promo-badge">
                <i className="bi bi-star-fill me-1"></i> 
                {getCollectionTheme()}
              </span>
              
              {/* Company Name/Logo */}
              <h1 className="mb-3">
                {companyLogo?.url ? (
                  <div className="d-flex align-items-center gap-3">
                    <img 
                      src={companyLogo.url} 
                      alt={companyName} 
                      style={{ 
                        height: '60px', 
                        width: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                    <span>{companyName}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-primary">{getDisplayName()}</span>
                    <span> Collection</span>
                  </>
                )}
              </h1>
              
              {/* Loading state for products */}
              {loading && productsOnSale.length === 0 && (
                <div className="alert alert-info mb-3" role="alert">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Loading sale products...
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {error && (
                <div className="alert alert-warning mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Could not load sale products. Please try again later.
                </div>
              )}
              
              {/* Special discount announcement if we have products on sale - FIXED: Show formatted percent */}
              {!loading && productsOnSale.length > 0 && (
                <div className="alert alert-success mb-3" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-tag-fill me-2 fs-4"></i>
                    <div>
                      <strong>Limited Time Offer!</strong> Shop our {productsOnSale.length} product{productsOnSale.length > 1 ? 's' : ''} on sale with up to {discountInfo.percent} off.
                    </div>
                  </div>
                </div>
              )}
              
              {/* Company Description */}
              <p className="lead mb-4">
                {getDescription()}
              </p>
              
              {/* CTA Buttons */}
              <div className="hero-cta-buttons mb-4">
                <a href="/products" className="btn btn-primary btn-lg me-3">
                  <i className="bi bi-bag me-2"></i> Shop Now
                </a>
                {!loading && productsOnSale.length > 0 && (
                  <a href="/categories" className="btn btn-danger btn-lg">
                    <i className="bi bi-tag me-2"></i> View Sale
                  </a>
                )}
                <a href="/about" className="btn btn-outline-primary btn-lg ms-2">
                  <i className="bi bi-info-circle me-2"></i> Learn More
                </a>
              </div>
              
              {/* Company Stats (if available) */}
              {company?.stats && (
                <div className="company-stats row mb-4">
                  <div className="col-4 text-center">
                    <div className="stat-number">
                      {company.stats.products || '500+'}
                    </div>
                    <div className="stat-label">Products</div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="stat-number">
                      {company.stats.customers || '10K+'}
                    </div>
                    <div className="stat-label">Customers</div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="stat-number">
                      {company.stats.countries || '50+'}
                    </div>
                    <div className="stat-label">Countries</div>
                  </div>
                </div>
              )}
              
              {/* Benefits/Features */}
              <div className="hero-features">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="feature-item"
                    data-aos="fade-up"
                    data-aos-delay={300 + (index * 100)}
                  >
                    <i className={`bi ${benefit.icon}`}></i>
                    <div>
                      <span className="d-block fw-semibold">{benefit.text}</span>
                      {benefit.description && (
                        <small className="text-muted d-block">{benefit.description}</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Social Proof (if available) */}
              {company?.socialProof && (
                <div className="social-proof mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center">
                    <div className="customer-avatars me-3">
                      <div className="avatar-group">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            className="avatar"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: `var(--gray-${300 + i * 100})`,
                              marginLeft: i > 0 ? '-10px' : '0',
                              border: '2px solid white'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="rating">
                        <i className="bi bi-star-fill text-warning"></i>
                        <i className="bi bi-star-fill text-warning"></i>
                        <i className="bi bi-star-fill text-warning"></i>
                        <i className="bi bi-star-fill text-warning"></i>
                        <i className="bi bi-star-half text-warning"></i>
                        <span className="ms-2 fw-semibold">4.5/5</span>
                      </div>
                      <small className="text-muted">Trusted by {company.socialProof.trustedBy || '10,000+'} customers</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Image Column */}
          <div className="col-lg-6 image-col" data-aos="fade-left" data-aos-delay="200">
            <div className="hero-image position-relative">
              {/* Main Hero Image */}
              <img 
                src={getHeroImage()} 
                alt={companyName || 'Featured Collection'} 
                className="main-product rounded-3 shadow-lg" 
                loading="lazy" 
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'cover'
                }}
              />
              
              {/* Floating Products On Sale - Show only products with discounts - FIXED: Image extraction */}
              {!loading && productsOnSale.map((product, index) => {
                const productImage = getProductImage(product);
                
                const productName = product.name || 'Product';
                const productPrice = product.price || product.firstColorPrice || 0;
                const originalPrice = getOriginalPrice(product);
                
                // Calculate discount percent properly
                let discountPercent = 0;
                if (product.discountPercentage) {
                  discountPercent = Math.round(product.discountPercentage);
                } else if (originalPrice && productPrice) {
                  const originalPriceNum = parseFloat(originalPrice.replace('$', ''));
                  discountPercent = Math.round(((originalPriceNum - productPrice) / originalPriceNum) * 100);
                }
                
                return (
                  <div 
                    key={product._id || product.id}
                    className={`floating-product product-${index + 1}`}
                    data-aos="fade-up"
                    data-aos-delay={300 + (index * 100)}
                    style={{
                      position: 'absolute',
                      background: 'white',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '250px',
                      zIndex: 2,
                      // Positioning for multiple products
                      top: `${30 + (index * 25)}%`,
                      left: index === 0 ? '5%' : 'auto',
                      right: index === 1 ? '5%' : 'auto'
                    }}
                  >
                    <div className="position-relative">
                      <img 
                        src={productImage} 
                        alt={productName}
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.target.src = 'https://via.placeholder.com/70';
                        }}
                      />
                      {/* Discount badge on image */}
                      {discountPercent > 0 && (
                        <div 
                          className="position-absolute top-0 start-0 translate-middle badge bg-danger rounded-pill"
                          style={{
                            fontSize: '0.7rem',
                            padding: '4px 6px'
                          }}
                        >
                          -{discountPercent}%
                        </div>
                      )}
                    </div>
                    <div className="product-info flex-grow-1">
                      <h6 className="mb-1 fw-semibold" style={{ fontSize: '0.9rem' }}>
                        {productName.length > 30 ? productName.substring(0, 30) + '...' : productName}
                      </h6>
                      <div className="d-flex align-items-center">
                        <span className="price text-primary fw-bold">
                          {formatPrice(productPrice)}
                        </span>
                        {originalPrice && (
                          <span className="text-muted text-decoration-line-through ms-2" style={{ fontSize: '0.8rem' }}>
                            {originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="product-tags mt-1">
                        <small className="badge bg-danger text-white me-1">Sale</small>
                        <small className="badge bg-light text-dark">Limited Time</small>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Discount Badge - FIXED: Use formatted percent */}
              <div 
                className="discount-badge"
                data-aos="zoom-in"
                data-aos-delay="500"
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(238, 90, 36, 0.3)',
                  zIndex: 3
                }}
              >
                <span className="percent fw-bold fs-4">{discountInfo.percent}</span>
                <span className="text small">{discountInfo.text}</span>
              </div>
              
              {/* Floating Elements/Patterns */}
              <div className="floating-elements">
                <div 
                  className="floating-element element-1"
                  style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    background: 'var(--primary-color)',
                    borderRadius: '50%',
                    opacity: 0.1,
                    top: '30%',
                    left: '10%',
                    zIndex: 1
                  }}
                />
                <div 
                  className="floating-element element-2"
                  style={{
                    position: 'absolute',
                    width: '60px',
                    height: '60px',
                    border: '2px dashed var(--primary-color)',
                    borderRadius: '50%',
                    opacity: 0.2,
                    bottom: '20%',
                    right: '15%',
                    zIndex: 1
                  }}
                />
              </div>
              
              {/* Message when no products on sale */}
              {!loading && productsOnSale.length === 0 && !error && (
                <div 
                  className="floating-product"
                  style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    padding: '15px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    textAlign: 'center',
                    width: '80%',
                    maxWidth: '300px',
                    zIndex: 2
                  }}
                >
                  <i className="bi bi-tag text-warning fs-1 mb-2 d-block"></i>
                  <h6 className="fw-semibold">No Active Sales</h6>
                  <p className="text-muted small mb-2">
                    Check back soon for special offers and discounts!
                  </p>
                  <a href="/products" className="btn btn-sm btn-outline-primary">
                    Browse All Products
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;