// components/checkout/PrivacyModal.js
import React from 'react';

const PrivacyModal = ({ show, onHide }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Privacy Policy</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <h6>Information We Collect</h6> 
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
              Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus
              rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna
              non est bibendum non venenatis nisl tempor.
            </p>
            
            <h6>How We Use Your Information</h6>
            <p>
              Suspendisse in orci enim. Vivamus hendrerit arcu sed erat molestie vehicula.
              Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.
              Phasellus molestie magna non est bibendum non venenatis nisl tempor.
            </p>
            
            <h6>Information Sharing</h6>
            <p>
              We do not sell, trade, or rent your personal identification information to others.
              We may share generic aggregated demographic information not linked to any personal
              identification information regarding visitors and users with our business partners,
              trusted affiliates, and advertisers.
            </p>
            
            <h6>Security</h6>
            <p>
              We adopt appropriate data collection, storage, and processing practices and security
              measures to protect against unauthorized access, alteration, disclosure, or destruction
              of your personal information, username, password, transaction information, and data
              stored on our Site.
            </p>
            
            <h6>Cookies</h6>
            <p>
              Our Site may use "cookies" to enhance User experience. User's web browser places cookies
              on their hard drive for record-keeping purposes and sometimes to track information about them.
              User may choose to set their web browser to refuse cookies, or to alert you when cookies
              are being sent.
            </p>
            
            <h6>Your Rights</h6>
            <p>
              You have the right to access, correct, or delete your personal information. You may also
              object to our processing of your personal information, ask us to restrict processing of
              your personal information, or request portability of your personal information.
            </p>
            
            <h6>Contact Us</h6>
            <p>
              If you have any questions about this Privacy Policy, the practices of this site, or your
              dealings with this site, please contact us at: privacy@estore.com
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onHide}>
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;