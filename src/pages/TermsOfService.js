import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  fetchCompany, 
  selectCompany,
  selectCompanyName,
  selectCompanyEmail,
  selectCompanyPhone,
  selectCompanyAddress
} from '../store/redux/companySlice';
import {
  fetchCategories,
  selectCategories
} from '../store/redux/categorySlice';
import {
  selectCartItemCount
} from '../store/redux/cartSlice';

const TermsOfService = () => {
  const dispatch = useDispatch();
  
  // Select data from Redux store
  const categories = useSelector(selectCategories);
  const cartCount = useSelector(selectCartItemCount);
  const company = useSelector(selectCompany);
  const companyName = useSelector(selectCompanyName);
  const companyEmail = useSelector(selectCompanyEmail);
  const companyPhone = useSelector(selectCompanyPhone);
  const companyAddress = useSelector(selectCompanyAddress);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCompany());
  }, [dispatch]);
  
  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    // Implement your search logic here
  };

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Get terms from company data or use default
  const termsContent = company?.policy?.termsOfService || `Acceptance of Terms

By accessing and using ${companyName || 'DAR Collection'}'s website, you agree to be bound by these Terms of Service and all applicable laws.

Eligibility

You must be at least 18 years old or have parental consent to make purchases. Users under 13 are prohibited from using the site.

Account Registration

• Provide accurate, complete information
• Maintain account security
• Notify us of unauthorized access
• You are responsible for all account activities

Product Information

• We strive for accurate product descriptions
• Colors may vary due to monitor settings
• Prices subject to change without notice
• Availability may be limited

Order Processing

• Orders processed within 1-3 business days
• Confirmation emails sent upon order placement
• Shipping estimates provided at checkout
• We reserve right to cancel any order

Payment Terms

• All prices in USD
• Accept major credit cards and PayPal
• Payment processed at time of order
• Sales tax applied as required by law

Shipping & Delivery

• Shipping times are estimates only
• International customers responsible for customs fees
• Risk of loss transfers upon delivery
• Signature may be required for delivery

Returns & Refunds

• See our Return Policy for details
• Refunds processed within 5-10 business days
• Store credit may be offered at our discretion
• Return shipping may be customer responsibility

Intellectual Property

• All website content is our property
• Trademarks may not be used without permission
• User-generated content grants us usage rights
• Report copyright infringement to ${companyEmail || 'our support team'}

User Conduct

• No illegal or unauthorized use
• No harassment or abusive behavior
• No attempts to hack or damage site
• No commercial use without permission

Privacy

• See our Privacy Policy for details
• By using site, you accept our privacy practices
• We may update privacy practices as needed

Limitation of Liability

• We're not liable for indirect damages
• Maximum liability is purchase price
• We're not liable for third-party actions
• Some jurisdictions don't allow limitations

Indemnification

• You agree to indemnify us
• Against claims from your violation
• Including reasonable attorney fees
• As permitted by law

Termination

• We may terminate access at any time
• For violation of these terms
• Without notice or liability
• All provisions survive termination

Changes to Terms

• We may update these terms
• Continued use constitutes acceptance
• Check periodically for updates
• Material changes notified via email

Governing Law

• Governed by laws of New Jersey
• Disputes resolved in New Jersey courts
• No waiver of rights by inaction
• Severability of provisions

Contact Information

For questions about these Terms of Service, contact us at:

${companyEmail || 'customer service email'}
${companyPhone || 'customer service phone'}`;

  // Split content into sections for better display
  const sections = termsContent.split('\n\n').filter(section => section.trim());

  return (
    <div className="terms-page">
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
            <h1 className="mb-2 mb-lg-0">Terms of Service</h1>
            <nav className="breadcrumbs">
              <ol>
                <li><a href="/">Home</a></li>
                <li className="current">Terms of Service</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Terms Content Section */}
        <section className="terms-content section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 col-xl-8">
                <div className="terms-container" data-aos="fade-up">
                  {/* Last Updated */}
                  <div className="last-updated mb-4">
                    <p className="text-muted">
                      <i className="bi bi-clock-history me-2"></i>
                      Last Updated: {company?.updatedAt ? new Date(company.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </p>
                  </div>

                  {/* Introduction */}
                  <div className="intro-section mb-5">
                    <h2 className="mb-3">Welcome to {companyName || 'DAR Collection'}</h2>
                    <p className="lead">
                      These Terms of Service govern your use of our website and services. 
                      Please read them carefully before making a purchase.
                    </p>
                  </div>

                  {/* Terms Sections */}
                  <div className="terms-sections">
                    {sections.map((section, index) => {
                      // Extract title from first line
                      const lines = section.split('\n');
                      const firstLine = lines[0];
                      const isTitle = !firstLine.startsWith('•') && !firstLine.startsWith('*') && lines.length > 1;
                      
                      return (
                        <div key={index} className="term-section mb-5" data-aos="fade-up" data-aos-delay={index * 50}>
                          {isTitle ? (
                            <>
                              <h3 className="h4 mb-3">{firstLine}</h3>
                              <div className="term-content">
                                {lines.slice(1).map((line, lineIndex) => (
                                  <p key={lineIndex} className={line.startsWith('•') ? 'term-bullet' : ''}>
                                    {line}
                                  </p>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="term-content">
                              {lines.map((line, lineIndex) => (
                                <p key={lineIndex} className={line.startsWith('•') ? 'term-bullet' : ''}>
                                  {line}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Important Notes */}
                  <div className="alert alert-info mt-5" data-aos="fade-up">
                    <div className="d-flex">
                      <div className="me-3">
                        <i className="bi bi-exclamation-circle-fill fs-4"></i>
                      </div>
                      <div>
                        <h4 className="alert-heading">Important Notes</h4>
                        <p className="mb-0">
                          By using our website and services, you acknowledge that you have read, 
                          understood, and agree to be bound by these Terms of Service. If you do 
                          not agree with any part of these terms, please do not use our services.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact for Questions */}
                  <div className="contact-section mt-5 p-4 bg-light rounded" data-aos="fade-up">
                    <h4 className="mb-3">Questions About Our Terms?</h4>
                    <p>
                      If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <div className="contact-info mt-3">
                      {companyEmail && (
                        <p className="mb-1">
                          <i className="bi bi-envelope me-2"></i>
                          Email: {companyEmail}
                        </p>
                      )}
                      {companyPhone && (
                        <p className="mb-1">
                          <i className="bi bi-telephone me-2"></i>
                          Phone: {companyPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources Section */}
        <section className="resources-section section bg-light">
          <div className="container">
            <h2 className="text-center mb-5">Related Policies</h2>
            <div className="row justify-content-center">
              <div className="col-md-4 mb-4" data-aos="fade-up">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="icon-wrapper mb-3">
                      <i className="bi bi-shield-check fs-1 text-primary"></i>
                    </div>
                    <h4 className="card-title">Privacy Policy</h4>
                    <p className="card-text">
                      Learn how we collect, use, and protect your personal information.
                    </p>
                    <a href="/privacy-policy" className="btn btn-outline-primary">
                      View Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="100">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="icon-wrapper mb-3">
                      <i className="bi bi-arrow-left-right fs-1 text-primary"></i>
                    </div>
                    <h4 className="card-title">Return Policy</h4>
                    <p className="card-text">
                      Understand our return, exchange, and refund procedures.
                    </p>
                    <a href="/return-policy" className="btn btn-outline-primary">
                      View Return Policy
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="200">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="icon-wrapper mb-3">
                      <i className="bi bi-truck fs-1 text-primary"></i>
                    </div>
                    <h4 className="card-title">Shipping Policy</h4>
                    <p className="card-text">
                      Information about shipping methods, times, and costs.
                    </p>
                    <a href="/shipping-policy" className="btn btn-outline-primary">
                      View Shipping Policy
                    </a>
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

export default TermsOfService;