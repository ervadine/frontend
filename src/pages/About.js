import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  fetchCompany, 
  selectCompany,
  selectCompanyName,
  selectCompanyDescription,
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

const About = () => {
  const dispatch = useDispatch();
  
  // Select data from Redux store
  const categories = useSelector(selectCategories);
  const cartCount = useSelector(selectCartItemCount);
  const company = useSelector(selectCompany);
  const companyName = useSelector(selectCompanyName);
  const companyDescription = useSelector(selectCompanyDescription);
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

  // Format address for display
  const formatAddress = () => {
    if (!companyAddress) return '';
    const { street, city, state, zipCode, country } = companyAddress;
    return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
  };

  return (
    <div className="about-page">
      <Header 
        cartCount={cartCount}
        wishlistCount={0}
        categories={safeCategories}
        onSearch={handleSearch}
      />

      <main className="main">
        {/* Page Title */}
        <div className="page-title light-background">
          <div className="container d-lg-flex justify-content-between align-items-center">
            <h1 className="mb-2 mb-lg-0">About {companyName || 'DAR Collection'}</h1>
            <nav className="breadcrumbs">
              <ol>
                <li><a href="/">Home</a></li>
                <li className="current">About</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* About Section */}
        <section id="about" className="about section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <span className="section-badge"><i className="bi bi-info-circle"></i> Our Story</span>
            
            <div className="row">
              <div className="col-lg-6">
                <h2 className="about-title">Redefining {companyName ? `${companyName.split(' ')[0]}` : 'Fashion'} Excellence</h2>
                <p className="about-description">
                  {companyDescription || `DAR Collection Store represents a fusion of timeless elegance and contemporary style. 
                  We believe that fashion should empower individuals to express their unique personality 
                  while embracing quality and sophistication.`}
                </p>
              </div>
              <div className="col-lg-6">
                <p className="about-text">
                  {company?.mission || `Founded with a vision to transform the fashion landscape, we meticulously curate each 
                  piece in our collection. Our commitment extends beyond trends to deliver enduring style 
                  that transcends seasons.`}
                </p>
                <p className="about-text">
                  {company?.values || `Every garment tells a story of craftsmanship, attention to detail, and passion for 
                  exceptional design. We partner with skilled artisans and reputable manufacturers to 
                  ensure our collections meet the highest standards of quality and sustainability.`}
                </p>
              </div>
            </div>

            <div className="row features-boxes gy-4 mt-3">
              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                <div className="feature-box">
                  <div className="icon-box">
                    <i className="bi bi-gem"></i>
                  </div>
                  <h3>Premium Quality</h3>
                  <p>We source only the finest materials and employ superior craftsmanship to ensure every piece exceeds expectations.</p>
                </div>
              </div>

              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                <div className="feature-box">
                  <div className="icon-box">
                    <i className="bi bi-heart"></i>
                  </div>
                  <h3>Customer First</h3>
                  <p>Your satisfaction is our priority. We provide exceptional service and support throughout your shopping journey.</p>
                </div>
              </div>

              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
                <div className="feature-box">
                  <div className="icon-box">
                    <i className="bi bi-lightning-charge"></i>
                  </div>
                  <h3>Fast Delivery</h3>
                  <p>Experience quick and reliable shipping with real-time tracking for all your orders.</p>
                </div>
              </div>
            </div>

            <div className="row mt-5">
              <div className="col-lg-12" data-aos="zoom-in" data-aos-delay="200">
                <div className="image-box">
                  {company?.logo?.url ? (
                    <img 
                      src={company.logo.url} 
                      className="img-fluid company-logo-large" 
                      alt={companyName || 'Company Logo'}
                      style={{ maxHeight: '400px', width: 'auto', margin: '0 auto', display: 'block' }}
                    />
                  ) : (
                    <img src="/assets/img/about/about-showcase.webp" className="img-fluid" alt={companyName || 'DAR Collection Store'} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Optional: Could be dynamic based on company data */}
        <section id="stats" className="stats section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row align-items-center">
              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                <div className="company-info-card">
                  <h4>Contact Information</h4>
                  <div className="contact-details mt-3">
                    {companyEmail && (
                      <p><i className="bi bi-envelope me-2"></i> {companyEmail}</p>
                    )}
                    {companyPhone && (
                      <p><i className="bi bi-telephone me-2"></i> {companyPhone}</p>
                    )}
                    {formatAddress() && (
                      <p><i className="bi bi-geo-alt me-2"></i> {formatAddress()}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="row counters">
                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                    <h2><span data-purecounter-start="0" data-purecounter-end="50" data-purecounter-duration="1" className="purecounter"></span>+</h2>
                    <p>Brand Partners</p>
                  </div>

                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                    <h2><span data-purecounter-start="0" data-purecounter-end="25" data-purecounter-duration="1" className="purecounter"></span>K</h2>
                    <p>Happy Customers</p>
                  </div>

                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
                    <h2><span data-purecounter-start="0" data-purecounter-end="5" data-purecounter-duration="1" className="purecounter"></span>+</h2>
                    <p>Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Values Section - Dynamic based on company data */}
        {company && (
          <section id="values" className="values section">
            <div className="container" data-aos="fade-up">
              <div className="section-header text-center">
                <h2>Our Values</h2>
                <p>The principles that guide {companyName || 'our company'}</p>
              </div>
              <div className="row">
                <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
                  <div className="value-item">
                    <div className="value-icon">
                      <i className="bi bi-award"></i>
                    </div>
                    <div className="value-content">
                      <h3>Quality Excellence</h3>
                      <p>We maintain the highest standards in every product we offer, ensuring durability, comfort, and style.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
                  <div className="value-item">
                    <div className="value-icon">
                      <i className="bi bi-people"></i>
                    </div>
                    <div className="value-content">
                      <h3>Customer Centric</h3>
                      <p>Your satisfaction is our success. We listen, adapt, and deliver exceptional experiences.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials section">
          <div className="container">
            <div className="section-header text-center">
              <h2>What Our Customers Say</h2>
              <p>Real experiences from our valued customers</p>
            </div>
            
            <div className="testimonial-masonry">
              <div className="testimonial-item" data-aos="fade-up">
                <div className="testimonial-content">
                  <div className="quote-pattern">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p>The quality of {companyName ? `${companyName.split(' ')[0]}` : 'DAR'} Collection's clothing is exceptional. Every piece feels luxurious and lasts through countless wears.</p>
                  <div className="client-info">
                    <div className="client-image">
                      <img src="/assets/img/person/person-f-7.webp" alt="Sarah Johnson" />
                    </div>
                    <div className="client-details">
                      <h3>Sarah Johnson</h3>
                      <span className="position">Fashion Blogger</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="testimonial-item highlight" data-aos="fade-up" data-aos-delay="100">
                <div className="testimonial-content">
                  <div className="quote-pattern">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p>{companyName || 'DAR Collection'} has transformed my wardrobe. Their attention to detail and commitment to sustainable fashion is truly remarkable.</p>
                  <div className="client-info">
                    <div className="client-image">
                      <img src="/assets/img/person/person-m-7.webp" alt="Michael Chen" />
                    </div>
                    <div className="client-details">
                      <h3>Michael Chen</h3>
                      <span className="position">Style Consultant</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="testimonial-item" data-aos="fade-up" data-aos-delay="200">
                <div className="testimonial-content">
                  <div className="quote-pattern">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p>From casual wear to formal attire, {companyName || 'DAR Collection'} delivers consistent quality and style that stands out.</p>
                  <div className="client-info">
                    <div className="client-image">
                      <img src="/assets/img/person/person-f-8.webp" alt="Emily Rodriguez" />
                    </div>
                    <div className="client-details">
                      <h3>Emily Rodriguez</h3>
                      <span className="position">Interior Designer</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="testimonial-item" data-aos="fade-up" data-aos-delay="300">
                <div className="testimonial-content">
                  <div className="quote-pattern">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p>The customer service is outstanding, and the clothing quality exceeds expectations every time.</p>
                  <div className="client-info">
                    <div className="client-image">
                      <img src="/assets/img/person/person-m-8.webp" alt="David Thompson" />
                    </div>
                    <div className="client-details">
                      <h3>David Thompson</h3>
                      <span className="position">Business Executive</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="testimonial-item highlight" data-aos="fade-up" data-aos-delay="400">
                <div className="testimonial-content">
                  <div className="quote-pattern">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p>{companyName || 'DAR Collection'} understands modern fashion needs. Their pieces are versatile, comfortable, and always stylish.</p>
                  <div className="client-info">
                    <div className="client-image">
                      <img src="/assets/img/person/person-f-9.webp" alt="Lisa Wang" />
                    </div>
                    <div className="client-details">
                      <h3>Lisa Wang</h3>
                      <span className="position">Marketing Director</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="testimonial-item" data-aos="fade-up" data-aos-delay="500">
                <div className="testimonial-content">
                  <div className="quote-pattern">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p>I appreciate their commitment to ethical fashion without compromising on style and quality.</p>
                  <div className="client-info">
                    <div className="client-image">
                      <img src="/assets/img/person/person-m-13.webp" alt="James Wilson" />
                    </div>
                    <div className="client-details">
                      <h3>James Wilson</h3>
                      <span className="position">Architect</span>
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

export default About;