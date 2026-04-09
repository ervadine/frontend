// components/BestSellers/BestSellers.js
import React from 'react';
import ProductCard from './ProductCard';

const BestSellers = ({ products, addToCart, toggleWishlist, cartLoading, wishlistLoading }) => {
  // Filter featured products or sort by sales count
  const bestSellingProducts = products
    .filter(product => product.isFeatured || product.salesCount > 0)
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 4);

  return (
    <section id="best-sellers" className="best-sellers section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Best Sellers</h2>
        <p>Discover our most popular products loved by customers</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          {bestSellingProducts.map((product, index) => (
            <div 
              key={product._id} 
              className="col-md-6 col-lg-3" 
              data-aos="fade-up"  
              data-aos-delay={100 + (index * 50)}
            >
              <ProductCard 
                product={product}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                cartLoading={cartLoading}
                wishlistLoading={wishlistLoading}
              /> 
            </div>
          ))}
        </div>
      </div>
    </section>
  ); 
};

export default BestSellers;