import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Fallback image
const fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

const CategoryCards = ({ categories }) => {
  // FIX: Extract categories array safely from different possible structures
  const getCategoriesArray = () => {
    if (!categories) return [];
    
    // If categories is already an array
    if (Array.isArray(categories)) {
      return categories;
    }
    
    // If categories has a data property that's an array (API response structure)
    if (categories.data && Array.isArray(categories.data)) {
      return categories.data;
    }
    
    // If categories has a categories property that's an array
    if (categories.categories && Array.isArray(categories.categories)) {
      return categories.categories;
    }
    
    // If categories is an object with numeric keys (array-like)
    if (typeof categories === 'object') {
      const possibleArray = Object.values(categories);
      if (possibleArray.length > 0 && possibleArray[0]?._id) {
        return possibleArray;
      }
    }
    
    return [];
  };
  
  const categoriesArray = getCategoriesArray();
  
  // Filter only parent categories (no parent) for the main display
  const parentCategories = categoriesArray.filter(category => !category.parent || category.parent === null);

  // Enhanced categories with fallback images
  const enhancedCategories = parentCategories.map(category => ({
    ...category,
    image: {
      ...category.image,
      url: category.image?.url || fallbackImage,
      alt: category.image?.alt || category.name
    }
  }));

  // Helper to generate category slug
  const getCategorySlug = (category) => {
    if (category.seo?.slug) return category.seo.slug;
    return category.name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <section id="category-cards" className="category-cards section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="section-title">
          <h2>Shop by Category</h2>
          <p>Explore our wide range of product categories</p>
        </div>
        
        {enhancedCategories.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              576: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              992: {
                slidesPerView: 4,
              },
            }}
            className="category-slider"
          >
            {enhancedCategories.map((category, index) => (
              <SwiperSlide key={category._id}>
                <div 
                  className="category-card" 
                  data-aos="fade-up" 
                  data-aos-delay={100 + (index * 100)}
                >
                  <div className="category-image">
                    <img 
                      src={category.image.url} 
                      alt={category.image.alt} 
                      className="img-fluid" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    /> 
                  </div>
                  <h3 className="category-title">{category.name}</h3>
                  <Link 
                    to={`/products?category=${getCategorySlug(category)}`} 
                    className="stretched-link"
                  ></Link>
                </div>
              </SwiperSlide>
            ))}
            
            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
          </Swiper>
        ) : (
          <div className="no-categories">
            <p>No categories available.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .category-cards {
          padding: 80px 0;
          background: #f8f9fa;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 50px;
        }
        
        .section-title h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #333;
        }
        
        .section-title p {
          color: #666;
          font-size: 16px;
        }
        
        .category-card {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
          position: relative;
        }
        
        .category-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .category-image {
          height: 200px;
          overflow: hidden;
        }
        
        .category-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        
        .category-card:hover .category-image img {
          transform: scale(1.1);
        }
        
        .category-title {
          padding: 20px 20px 10px;
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        
        .category-description {
          padding: 0 20px 20px;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        
        .stretched-link {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 1;
        }
        
        .swiper-button-next,
        .swiper-button-prev {
          color: #333;
          background: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        
        .no-categories {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 10px;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .category-cards {
            padding: 60px 0;
          }
          
          .section-title h2 {
            font-size: 28px;
          }
          
          .category-image {
            height: 180px;
          }
        }
      `}</style>
    </section>
  );
};

export default CategoryCards;