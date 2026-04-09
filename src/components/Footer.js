// components/Footer/Footer.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCompany, 
  selectCompanyAddress,
  selectCompanyEmail,
  selectCompanyPhone,
  selectCompanySocialMedia,
  selectCompanyName,
  selectCompanyDescription,
  selectCompany
} from '../store/redux/companySlice';

const Footer = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  // Select company data from Redux store
  const company = useSelector(selectCompany);
  const companyAddress = useSelector(selectCompanyAddress);
  const companyEmail = useSelector(selectCompanyEmail);
  const companyPhone = useSelector(selectCompanyPhone);
  const companyName = useSelector(selectCompanyName);
  const companyDescription = useSelector(selectCompanyDescription);
  const companySocialMedia = useSelector(selectCompanySocialMedia);

  // Fetch company data on component mount
  useEffect(() => {
    dispatch(fetchCompany());
  }, [dispatch]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Simulate newsletter subscription
    setNewsletterStatus('success');
    setEmail('');
    setTimeout(() => setNewsletterStatus(''), 3000);
  };

  // Format address for display
  const formatAddress = () => {
    if (!companyAddress) return '123 Fashion Street, New York, NY 10001';
    
    const { street, city, state, zipCode, country } = companyAddress;
    return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
  };

  // Format phone number
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '+1 (555) 123-4567';
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
  };

  // Dynamic social links based on company data
  const getDynamicSocialLinks = () => {
    const socialLinks = [
      { 
        icon: 'bi-facebook', 
        label: 'Facebook', 
        href: companySocialMedia?.facebook || '#' 
      },
      { 
        icon: 'bi-instagram', 
        label: 'Instagram', 
        href: companySocialMedia?.instagram || '#' 
      },
      { 
        icon: 'bi-twitter-x', 
        label: 'Twitter', 
        href: companySocialMedia?.twitter || '#' 
      },
      { 
        icon: 'bi-linkedin', 
        label: 'LinkedIn', 
        href: companySocialMedia?.linkedin || '#' 
      },
      { 
        icon: 'bi-tiktok', 
        label: 'TikTok', 
        href: '#' // Add tiktok to your company data if needed
      },
      { 
        icon: 'bi-pinterest', 
        label: 'Pinterest', 
        href: '#' // Add pinterest to your company data if needed
      },
      { 
        icon: 'bi-youtube', 
        label: 'YouTube', 
        href: '#' // Add youtube to your company data if needed
      }
    ];

    // Filter out empty social links
    return socialLinks.filter(social => 
      social.icon !== 'bi-linkedin' || companySocialMedia?.linkedin || 
      social.icon !== 'bi-facebook' || companySocialMedia?.facebook ||
      social.icon !== 'bi-instagram' || companySocialMedia?.instagram ||
      social.icon !== 'bi-twitter-x' || companySocialMedia?.twitter
    );
  };

  const footerLinks = {
    shop: [
      { label: 'New Arrivals', href: '/categories' },
      { label: 'Bestsellers', href: '/categories' },
      { label: "Women's Clothing", href: '/categories' },
      { label: "Men's Clothing", href: '/categories' },
      { label: 'Accessories', href: '/categories' },
      { label: 'Sale', href: '/categories' }
    ],
    support: [
      { label: 'Help Center', href: '/contact' },
      { label: 'Order Status', href: '/account' },
      { label: 'Shipping Info', href: '/privacy' },
      { label: 'Returns & Exchanges', href: '/privacy' },
      { label: 'Size Guide', href: '#' },
      { label: 'Contact Us', href: '/contact' }
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Press', href: '/about' },
      { label: 'Affiliates', href: '/about' },
      { label: 'Responsibility', href: '/about' },
      { label: 'Investors', href: '/about' }
    ]
  };

  const paymentMethods = [
    { icon: 'bi-credit-card', label: 'Credit Card' },
    { icon: 'bi-paypal', label: 'PayPal' },
    { icon: 'bi-apple', label: 'Apple Pay' },
    { icon: 'bi-google', label: 'Google Pay' },
    { icon: 'bi-shop', label: 'Shop Pay' },
    { icon: 'bi-cash', label: 'Cash on Delivery' }
  ];

  const dynamicSocialLinks = getDynamicSocialLinks();

  return (
    <footer id="footer" className="footer">
      {/* Newsletter Section */}
      {/* <div className="footer-newsletter">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2>Join Our Newsletter</h2>
              <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
              <form onSubmit={handleNewsletterSubmit} className="php-email-form">
                <div className="newsletter-form d-flex">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Your email address" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit">Subscribe</button>
                </div>
                {newsletterStatus === 'success' && (
                  <div className="sent-message">
                    Your subscription request has been sent. Thank you!
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="row gy-4">
            {/* About Section */}
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="footer-widget footer-about">
                <a href="/" className="logo">
                  <span className="sitename">{companyName || 'eStore'}</span>
                </a>
                <p>{companyDescription || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in nibh vehicula, facilisis magna ut, consectetur lorem.'}</p>
                <div className="footer-contact mt-4">
                  <div className="contact-item">
                    <i className="bi bi-geo-alt"></i>
                    <span>{formatAddress()}</span>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-telephone"></i>
                    <span>{formatPhoneNumber(companyPhone)}</span>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-envelope"></i>
                    <span>{companyEmail || 'hello@example.com'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Links */}
            <div className="col-lg-2 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h4>Shop</h4>
                <ul className="footer-links">
                  {footerLinks.shop.map((link, index) => (
                    <li key={index}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Support Links */}
            <div className="col-lg-2 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h4>Support</h4>
                <ul className="footer-links">
                  {footerLinks.support.map((link, index) => (
                    <li key={index}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Company Links */}
            <div className="col-lg-2 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h4>Company</h4>
                <ul className="footer-links">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* App & Social */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h4>Download Our App</h4>
                <p>Shop on the go with our mobile app</p>
                <div className="app-buttons">
                  <a href="#" className="app-btn">
                    <i className="bi bi-apple"></i>
                    <span>App Store</span>
                  </a>
                  <a href="#" className="app-btn">
                    <i className="bi bi-google-play"></i>
                    <span>Google Play</span>
                  </a>
                </div>
                {dynamicSocialLinks.length > 0 && (
                  <div className="social-links mt-4">
                    <h5>Follow Us</h5>
                    <div className="social-icons">
                      {dynamicSocialLinks.map((social, index) => (
                        <a 
                          key={index}
                          href={social.href} 
                          aria-label={social.label}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className={`bi ${social.icon}`}></i>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          {/* Payment Methods */}
          <div className="payment-methods d-flex align-items-center justify-content-center">
            <span>We Accept:</span>
            <div className="payment-icons">
              {paymentMethods.map((method, index) => (
                <i 
                  key={index}
                  className={`bi ${method.icon}`} 
                  aria-label={method.label}
                ></i>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="legal-links">
            <a href="/tos">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/tos">Cookies Settings</a>
          </div>

          {/* Copyright */}
          <div className="copyright text-center">
            <p>© <span>Copyright</span> <strong className="sitename">{companyName || 'eStore'}</strong>. All Rights Reserved.</p>
            <p className="small text-muted mt-2">
              {company?.isActive ? '' : 'This store is currently inactive.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;