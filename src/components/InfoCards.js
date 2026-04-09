// components/InfoCards/InfoCards.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCompany } from '../store/redux/companySlice';

const InfoCards = () => {
  const company = useSelector(selectCompany);
  const [animatedCards, setAnimatedCards] = useState([]);

  // Default info cards with dynamic company name
  const defaultInfoCards = [
    {
      id: 1,
      icon: 'bi-truck',
      title: 'Free Shipping',
      description: `Enjoy free shipping on all orders over $50 across ${company?.name || 'our store'}. Fast delivery with real-time tracking.`,
      color: 'var(--primary-color)',
      stat: '2-5 Days',
      delay: 200
    },
    {
      id: 2,
      icon: 'bi-arrow-counterclockwise',
      title: 'Easy Returns',
      description: '30-day hassle-free return policy. Quality guaranteed or your money back, no questions asked.',
      color: 'var(--success-color)',
      stat: '30 Days',
      delay: 300
    },
    {
      id: 3,
      icon: 'bi-percent',
      title: 'Member Discounts',
      description: 'Exclusive discounts for newsletter subscribers and loyal customers. Join today and save!',
      color: 'var(--warning-color)',
      stat: 'Up to 50%',
      delay: 400
    },
    {
      id: 4,
      icon: 'bi-headset',
      title: '24/7 Support',
      description: `Our customer support team at ${company?.name || 'our store'} is always ready to help you with any questions.`,
      color: 'var(--info-color)',
      stat: 'Always Online',
      delay: 500
    }
  ];

  // Optional: Additional cards from company data
  const companyBenefits = company?.benefits || [
    {
      id: 5,
      icon: 'bi-gift',
      title: 'Gift Packaging',
      description: 'Free gift wrapping and personalized notes for special occasions.',
      color: 'var(--pink)',
      stat: 'Free',
      delay: 600
    },
    {
      id: 6,
      icon: 'bi-shield-check',
      title: 'Secure Payment',
      description: '100% secure payment processing with SSL encryption and fraud protection.',
      color: 'var(--purple)',
      stat: '100% Safe',
      delay: 700
    }
  ];

  // Combine default and company cards
  const infoCards = [...defaultInfoCards, ...companyBenefits];

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedCards(infoCards.map(card => ({ ...card, animated: true })));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Hover effect handler
  const handleMouseEnter = (cardId) => {
    setAnimatedCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, hovered: true } : card
    ));
  };

  const handleMouseLeave = (cardId) => {
    setAnimatedCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, hovered: false } : card
    ));
  };

  return (
    <section id="info-cards" className="info-cards section light-background">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center mb-5" data-aos="fade-up">
          <span className="section-badge">
            <i className="bi bi-star-fill"></i> Why Choose {company?.name || 'Us'}
          </span>
          <h2 className="section-title">Shop With Confidence</h2>
          <p className="section-subtitle">
            Experience premium service and exceptional value with every purchase
          </p>
        </div>

        {/* Cards Grid */}
        <div className="row g-4 justify-content-center">
          {infoCards.map((card, index) => {
            const animatedCard = animatedCards.find(ac => ac.id === card.id);
            
            return (
              <div 
                key={card.id}
                className="col-12 col-sm-6 col-lg-4 col-xl-3"
                data-aos="fade-up"
                data-aos-delay={card.delay}
                onMouseEnter={() => handleMouseEnter(card.id)}
                onMouseLeave={() => handleMouseLeave(card.id)}
              >
                <div 
                  className={`info-card text-center position-relative ${
                    animatedCard?.hovered ? 'hovered' : ''
                  }`}
                  style={{
                    transform: animatedCard?.animated ? 'translateY(0)' : 'translateY(20px)',
                    opacity: animatedCard?.animated ? 1 : 0,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Background Decoration */}
                  <div 
                    className="card-bg"
                    style={{
                      background: `linear-gradient(135deg, ${card.color}15, transparent)`,
                      borderRadius: '16px',
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      zIndex: '-1',
                      opacity: animatedCard?.hovered ? 1 : 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  />

                  {/* Icon Container */}
                  <div className="icon-wrapper mb-4">
                    <div 
                      className="icon-box d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${card.color}, ${card.color}80)`,
                        color: 'white',
                        fontSize: '1.75rem',
                        transform: animatedCard?.hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        boxShadow: animatedCard?.hovered 
                          ? `0 10px 25px ${card.color}40` 
                          : '0 4px 15px rgba(0,0,0,0.1)'
                      }}
                    >
                      <i className={`bi ${card.icon}`}></i>
                    </div>
                    
                    {/* Stat Badge */}
                    <div 
                      className="stat-badge position-absolute"
                      style={{
                        top: '-5px',
                        right: '-5px',
                        background: 'white',
                        color: card.color,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transform: animatedCard?.hovered ? 'translateY(-5px)' : 'translateY(0)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      {card.stat}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 
                    className="h4 mb-3"
                    style={{
                      color: animatedCard?.hovered ? card.color : 'var(--dark-color)',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {card.title}
                  </h3>
                  
                  <p className="mb-0 text-muted">
                    {card.description}
                  </p>

                  {/* Hover Indicator */}
                  <div 
                    className="hover-indicator mt-3"
                    style={{
                      height: '3px',
                      width: animatedCard?.hovered ? '40px' : '0',
                      background: card.color,
                      margin: '0 auto',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional: CTA Section */}
        <div className="row mt-5" data-aos="fade-up" data-aos-delay="600">
          <div className="col-12">
            <div className="text-center p-4 rounded-3" style={{
              background: 'linear-gradient(135deg, var(--light-color), #f8f9fa)',
              border: '1px solid rgba(var(--primary-rgb), 0.1)'
            }}>
              <h4 className="mb-2">Ready to Experience the Difference?</h4>
              <p className="mb-3 text-muted">
                Join thousands of satisfied customers who trust us for quality products and exceptional service.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <a href="/products" className="btn btn-primary">
                  <i className="bi bi-bag me-2"></i> Start Shopping
                </a>
                <a href="/about" className="btn btn-outline-primary">
                  <i className="bi bi-info-circle me-2"></i> Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoCards;