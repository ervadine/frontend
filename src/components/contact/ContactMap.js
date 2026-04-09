// components/contact/ContactMap.js
import React from 'react';

const ContactMap = ({ address }) => {
  // Default coordinates (New York) if no address is provided
  const defaultCoordinates = "40.710059,-74.006138";
  
  // Function to get map URL based on address
  const getMapUrl = () => {
    if (address) {
      // Encode the address for Google Maps
      const encodedAddress = encodeURIComponent(address);
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBmiDn7wr-zD-7EFUx5WqAKUFgKdaUkols&q=${encodedAddress}`;
    }
    
    
  };

  return (
    <div className="contact-map">
      <iframe 
        src={getMapUrl()}
        frameBorder="0"
        style={{ border: 0, width: '100%', height: '400px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={address ? `Location of ${address}` : "Our Location"}
      ></iframe>
      {address && (
        <div className="mt-2 small text-muted">
          <i className="bi bi-geo-alt me-1"></i>
          {address}
        </div>
      )}
    </div>
  );
};

// Optional: Add default props
ContactMap.defaultProps = {
  address: null
};

export default ContactMap;