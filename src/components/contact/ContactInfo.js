// components/Contact/ContactInfo.js
import React from 'react';

const ContactInfo = ({ icon, title, content, delay }) => {
  // Don't render if content is missing
  if (!content) return null;
  
  return (
    <div 
      className="info-item d-flex flex-column justify-content-center align-items-center"
      data-aos="fade-up" 
      data-aos-delay={delay}
    >
      <i className={`bi ${icon}`}></i>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
};

export default ContactInfo;