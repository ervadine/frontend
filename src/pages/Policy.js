import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/policy.css'
import { 
  fetchCompany, 
  selectCompany,
  selectCompanyName,
  selectCompanyEmail,
  selectCompanyPhone
} from '../store/redux/companySlice';
import {
  fetchCategories,
  selectCategories
} from '../store/redux/categorySlice';
import {
  selectCartItemCount
} from '../store/redux/cartSlice';

const Policy = () => {
  const dispatch = useDispatch();
  const [activePolicy, setActivePolicy] = useState('privacy');
  
  // Select data from Redux store
  const categories = useSelector(selectCategories);
  const cartCount = useSelector(selectCartItemCount);
  const company = useSelector(selectCompany);
  const companyName = useSelector(selectCompanyName);
  const companyEmail = useSelector(selectCompanyEmail);
  const companyPhone = useSelector(selectCompanyPhone);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCompany());
  }, [dispatch]);
  
  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
  };

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Policy content from company data or defaults
  const policies = {
    privacy: {
      title: 'Privacy Policy',
      icon: 'bi-shield-check',
      content: company?.policy?.privacyPolicy || `${companyName || 'DAR Collection'} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our products.

Information We Collect

• Personal Data: Name, email address, phone number, shipping/billing address
• Payment Information: Credit/debit card details (processed securely through payment gateways)
• Technical Data: IP address, browser type, device information, browsing patterns
• Purchase History: Products viewed, purchased, wishlisted
• Communications: Customer service inquiries, feedback, reviews

How We Use Your Information

• Process orders and deliver products
• Communicate about orders, promotions, and updates
• Improve website functionality and user experience
• Prevent fraud and ensure security
• Comply with legal obligations
• Personalize marketing communications (with consent)

Information Sharing

We do not sell your personal information. We may share information with:
• Service providers (payment processors, shipping carriers)
• Legal authorities when required by law
• Business partners with your consent
• During business transfers or mergers

Data Security

We implement security measures including:
• SSL encryption for data transmission
• Secure payment processing
• Regular security assessments
• Limited access to personal data

Your Rights

Depending on your location, you may have rights to:
• Access your personal data
• Correct inaccurate data
• Delete your data
• Object to processing
• Data portability
• Withdraw consent

Cookies and Tracking

We use cookies to:
• Remember your preferences
• Analyze site traffic
• Improve user experience
• Enable shopping cart functionality

Third-Party Links

Our site may contain links to third-party sites. We're not responsible for their privacy practices.

Children's Privacy

Our services are not intended for children under 13. We don't knowingly collect data from children.

Policy Updates

We may update this policy. Changes will be posted here with updated effective date.

Contact Us

For privacy questions, contact us at ${companyEmail || 'our support email'}.`
    },
    return: {
      title: 'Return Policy',
      icon: 'bi-arrow-left-right',
      content: company?.policy?.returnPolicy || `Return Window

• 30 Days from delivery date
• Products must be unused, unworn, in original condition
• Original packaging and tags required

Non-Returnable Items

• Custom or personalized products
• Sale/clearance items (unless defective)
• Gift cards
• Intimate items (for hygiene reasons)
• Damaged due to customer misuse

Return Process

1. Contact customer service within 30 days
2. Receive Return Authorization Number
3. Package securely with original materials
4. Ship with tracking (customer pays return shipping)
5. Allow 5-10 business days for processing

Refund Methods

• Original payment method
• Processing time: 5-10 business days
• Excludes original shipping costs
• Restocking fees may apply for certain items

Exchange Policy

• Available for defective/wrong items
• Subject to availability
• Price differences apply
• No additional shipping charges for exchanges due to our error

Defective/Damaged Items

• Contact us within 7 days of delivery
• Provide photos of damage/defect
• We cover return shipping
• Replacement or full refund

International Returns

• Customer responsible for return shipping
• Customs/duties non-refundable
• May take 2-4 weeks for processing
• Check local regulations

Store Credit

• May be offered instead of refund
• No expiration date
• Non-transferable
• For online purchases only

Questions

Contact ${companyEmail || 'customer service'} for return assistance.`
    },
    shipping: {
      title: 'Shipping Policy',
      icon: 'bi-truck',
      content: company?.policy?.shippingPolicy || `Shipping Areas

• Domestic: All 50 US states
• International: Select countries (check website)
• Restricted: Areas with shipping limitations

Processing Time

• Standard: 1-3 business days
• Custom Items: 7-14 business days
• Peak Seasons: Additional 2-3 days
• Order processing begins after payment confirmation

Shipping Methods

• Standard Shipping: 5-7 business days
• Express Shipping: 2-3 business days
• Overnight Shipping: 1 business day
• International: 7-21 business days

Shipping Costs

• Calculated at checkout
• Free shipping on orders over $100 (domestic)
• International shipping varies by destination
• Additional fees for expedited shipping

Order Tracking

• Tracking numbers provided via email
• Real-time tracking available
• Delivery notifications
• Contact carrier for delivery issues

Delivery Issues

• Failed delivery attempts
• Incorrect addresses
• Package damage
• Contact us within 48 hours

International Considerations

• Customs fees customer responsibility
• Delivery times are estimates
• Restricted items vary by country
• Documentation provided

Shipping Restrictions

• Certain items restricted internationally
• Shipping delays possible
• Weather-related delays
• Carrier limitations

Order Changes

• Contact us immediately for changes
• Before shipment only
• Address changes may delay shipping
• Additional charges may apply

Holiday Shipping

• Extended processing times
• Check holiday schedule
• Order early for holidays
• Last-minute orders not guaranteed

Contact

Shipping questions? Email ${companyEmail || 'our support team'}.`
    }
  };

  const formatPolicyContent = (content) => {
    return content.split('\n\n').map((section, index) => {
      const lines = section.split('\n');
      const firstLine = lines[0];
      const isTitle = !firstLine.startsWith('•') && lines.length > 1;
      
      return (
        <div key={index} className="policy-section mb-4">
          {isTitle ? (
            <>
              <h4 className="h5 mb-2">{firstLine}</h4>
              <div className="policy-content">
                {lines.slice(1).map((line, lineIndex) => (
                  <p key={lineIndex} className={line.startsWith('•') ? 'mb-1 ps-3' : 'mb-2'}>
                    {line.startsWith('•') ? line.substring(1).trim() : line}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <div className="policy-content">
              {lines.map((line, lineIndex) => (
                <p key={lineIndex} className={line.startsWith('•') ? 'mb-1 ps-3' : 'mb-2'}>
                  {line.startsWith('•') ? line.substring(1).trim() : line}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="policy-page">
      <Header 
        cartCount={cartCount}
        wishlistCount={0}
        categories={safeCategories}
        onSearch={handleSearch}
      />

      <main className="main">
        {/* Page Title */}
        <div className="page-title light-background">
          <div className="container d-lg-flex justify-content-between align-content-center py-4">
            <h1 className="mb-2 mb-lg-0">Our Policies</h1>
            <nav className="breadcrumbs">
              <ol>
                <li><a href="/">Home</a></li>
                <li className="current">Policies</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Policies Section */}
        <section className="policies-section section">
          <div className="container">
            <div className="row">
              {/* Policy Navigation */}
              <div className="col-lg-3 mb-4 mb-lg-0">
                <div className="policy-nav sticky-top" style={{top: '20px'}}>
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="h5 mb-4">Browse Policies</h3>
                      <div className="nav flex-column">
                        {Object.entries(policies).map(([key, policy]) => (
                          <button
                            key={key}
                            className={`nav-link text-start d-flex align-items-center mb-2 ${activePolicy === key ? 'active' : ''}`}
                            onClick={() => setActivePolicy(key)}
                          >
                            <i className={`bi ${policy.icon} me-2`}></i>
                            {policy.title}
                          </button>
                        ))}
                        <button
                          className="nav-link text-start d-flex align-items-center mb-2"
                          onClick={() => setActivePolicy('terms')}
                        >
                          <i className="bi bi-file-text me-2"></i>
                          Terms of Service
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-3 border-top">
                        <h4 className="h6 mb-2">Need Help?</h4>
                        <p className="small text-muted mb-2">
                          Can't find what you're looking for?
                        </p>
                        <a 
                          href={`mailto:${companyEmail}`} 
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          Contact Support
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Content */}
              <div className="col-lg-9">
                <div className="policy-content-container">
                  {/* Active Policy Header */}
                  <div className="policy-header mb-4" data-aos="fade-up">
                    <div className="d-flex align-items-center mb-3">
                      <div className="policy-icon me-3">
                        <i className={`bi ${policies[activePolicy]?.icon} fs-1 text-primary`}></i>
                      </div>
                      <div>
                        <h2 className="mb-1">{policies[activePolicy]?.title}</h2>
                        <p className="text-muted mb-0">
                          <i className="bi bi-clock-history me-1"></i>
                          Last Updated: {company?.updatedAt ? new Date(company.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="lead">
                      Please review our {policies[activePolicy]?.title.toLowerCase()} to understand our practices and procedures.
                    </p>
                  </div>

                  {/* Policy Content */}
                  <div className="policy-details card border-0 shadow-sm" data-aos="fade-up">
                    <div className="card-body p-4 p-md-5">
                      {formatPolicyContent(policies[activePolicy]?.content)}
                      
                      {/* Contact Information */}
                      <div className="mt-5 pt-4 border-top">
                        <h4 className="h5 mb-3">Questions About This Policy?</h4>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="d-flex align-items-start mb-3">
                              <i className="bi bi-envelope text-primary me-3 mt-1"></i>
                              <div>
                                <h6 className="mb-1">Email Us</h6>
                                <p className="mb-0 text-muted">
                                  <a href={`mailto:${companyEmail}`}>{companyEmail || 'customer service'}</a>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-start mb-3">
                              <i className="bi bi-telephone text-primary me-3 mt-1"></i>
                              <div>
                                <h6 className="mb-1">Call Us</h6>
                                <p className="mb-0 text-muted">
                                  <a href={`tel:${companyPhone}`}>{companyPhone || 'customer service phone'}</a>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Related Policies */}
                  <div className="mt-5">
                    <h4 className="mb-4">Related Policies</h4>
                    <div className="row">
                      {Object.entries(policies)
                        .filter(([key]) => key !== activePolicy)
                        .map(([key, policy], index) => (
                          <div key={key} className="col-md-6 mb-3" data-aos="fade-up" data-aos-delay={index * 100}>
                            <div 
                              className="card border h-100 cursor-pointer hover-shadow"
                              onClick={() => setActivePolicy(key)}
                            >
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    <i className={`bi ${policy.icon} fs-3 text-primary`}></i>
                                  </div>
                                  <div>
                                    <h5 className="h6 mb-1">{policy.title}</h5>
                                    <p className="small text-muted mb-0">
                                      Click to view {policy.title.toLowerCase()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="quick-links-section section bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="mb-3">Quick Policy Links</h2>
              <p className="text-muted">
                Access our most important policies directly
              </p>
            </div>
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-6">
                        <a 
                          href="/terms-of-service" 
                          className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                        >
                          <i className="bi bi-file-text fs-2 mb-2"></i>
                          <span>Terms of Service</span>
                        </a>
                      </div>
                      <div className="col-6">
                        <a 
                          href="/privacy-policy" 
                          className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                        >
                          <i className="bi bi-shield-check fs-2 mb-2"></i>
                          <span>Privacy Policy</span>
                        </a>
                      </div>
                      <div className="col-6">
                        <a 
                          href="/return-policy" 
                          className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                        >
                          <i className="bi bi-arrow-left-right fs-2 mb-2"></i>
                          <span>Return Policy</span>
                        </a>
                      </div>
                      <div className="col-6">
                        <a 
                          href="/shipping-policy" 
                          className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                        >
                          <i className="bi bi-truck fs-2 mb-2"></i>
                          <span>Shipping Policy</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Policy;