// components/SearchResults/SearchProductList.js
import React from 'react';
import ProductCard from './ProductCard';

const SearchProductList = ({ products }) => {
  const getAnimationDelay = (index) => {
    return index * 100;
  };

  return (
    <section id="search-product-list" className="search-product-list section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-4">
          {products.map((product, index) => (
            <div key={product._id} className="col-6 col-lg-3">
              <ProductCard 
                product={product}
                animation="zoom-in"
                delay={getAnimationDelay(index)}
              />
            </div>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-5">
            <h3>No products found</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchProductList;