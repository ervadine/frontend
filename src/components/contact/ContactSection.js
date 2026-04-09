// components/contact/ContactSection.js
import React from 'react';
import ContactInfo from './ContactInfo';
import ContactForm from './ContactForm';
import ContactMap from './ContactMap';

const ContactSection = ({ company, address, email, phone, logo }) => {
  // Format the full address
  const formatFullAddress = () => {
    if (!address) return 'A108 Adam Street, New York, NY 535022';
    
    const { street, city, state, zipCode, country } = address;
    return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
  };

  // Format phone number
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '+1 5589 55488 55';
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
  };

  const contactInfo = [
    {
      icon: 'bi-geo-alt',
      title: 'Address',
      content: formatFullAddress(),
      delay: '200'
    },
    {
      icon: 'bi-telephone',
      title: 'Call Us',
      content: formatPhoneNumber(phone),
      delay: '300'
    },
    {
      icon: 'bi-envelope',
      title: 'Email Us',
      content: email || 'info@example.com',
      delay: '400'
    }
  ];

  return (
    <section id="contact-2" className="contact-2 section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          {contactInfo.map((info, index) => (
            <div key={index} className={`col-lg-${index === 0 ? '6' : '3 col-md-6'}`}>
              <ContactInfo {...info} />
            </div>
          ))}
        </div>

        <div className="row gy-4 mt-1">
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
            <ContactMap 
              address={address ? formatFullAddress() : "A108 Adam Street, New York, NY 535022"}
            />
          </div>
          <div className="col-lg-6">
            <ContactForm 
              companyName={company?.name || 'Your Company'}
              email={email}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;