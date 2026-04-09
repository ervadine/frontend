// pages/ContactPage.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/contact/PageTitle';
import ContactSection from '../components/contact/ContactSection';
import { 
  fetchCompany, 
  selectCompany, 
  selectCompanyAddress, 
  selectCompanyEmail, 
  selectCompanyPhone, 
  selectCompanyLogo,
  selectCompanyBusinessHours
} from '../store/redux/companySlice';
import {
  fetchCategories,
  selectCategories
} from '../store/redux/categorySlice';
import {
  selectCartItemCount,
  fetchCart
} from '../store/redux/cartSlice';
import { 
  getAllProducts, 
  selectProducts, 
} from '../store/redux/productSlice';

import { 
  addToWishlist, 
  removeFromWishlist, 
  selectIsInWishlist, 
  selectWishlist,
  selectIsLoading,
  clearError 
} from '../store/redux/authSlice';

import { sendMessage, selectMessageError } from '../store/redux/messageSlice';

const ContactPage = () => {
  const dispatch = useDispatch();
  
  // Select data from Redux store
  const categories = useSelector(selectCategories);
  const cartCount = useSelector(selectCartItemCount);
  const company = useSelector(selectCompany);
  const companyAddress = useSelector(selectCompanyAddress);
  const companyEmail = useSelector(selectCompanyEmail);
  const companyPhone = useSelector(selectCompanyPhone);
  const companyLogo = useSelector(selectCompanyLogo);

  // Wishlist state
  const wishlistItems = useSelector(selectWishlist);
  const wishlistLoading = useSelector(selectIsLoading);
  const [wishlistError, setWishlistError] = useState(null);
  
  // Get wishlist count
  const wishlistCount = wishlistItems.length;
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCompany());
    dispatch(fetchCart());
    dispatch(getAllProducts());
  }, [dispatch]);
  
  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    // Implement your search logic here
  };

  // Handle wishlist toggle (if needed on contact page)
  const handleToggleWishlist = (product) => {
    setWishlistError(null);
    
    // Check if product is already in wishlist
    const isInWishlist = wishlistItems.some(item => 
      item._id === product._id || item.product?._id === product._id
    );
    
    if (isInWishlist) {
      // Remove from wishlist
      dispatch(removeFromWishlist(product._id))
        .unwrap()
        .catch((error) => {
          setWishlistError(`Failed to remove from wishlist: ${error.message}`);
          console.error('Error removing from wishlist:', error);
        });
    } else {
      // Add to wishlist
      dispatch(addToWishlist(product._id))
        .unwrap()
        .then(() => {
          console.log('✅ Added to wishlist:', product.name);
        })
        .catch((error) => {
          setWishlistError(`Failed to add to wishlist: ${error.message}`);
          console.error('Error adding to wishlist:', error);
        });
    }
  };

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="App">
      {/* Show wishlist error if any */}
      {wishlistError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert" 
             style={{ margin: '10px', position: 'fixed', top: '80px', right: '20px', zIndex: 1000 }}>
          {wishlistError}
          <button type="button" className="btn-close" onClick={() => setWishlistError(null)}></button>
        </div>
      )}
      
      <Header   
        cartCount={cartCount || 0}
        wishlistCount={wishlistCount}
        categories={safeCategories}
        onSearch={handleSearch}
      />
      
      <main className="main">
        <PageTitle 
          title="Contact"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Contact', href: '/contact' }
          ]}
        />
        <ContactSection 
          company={company}
          address={companyAddress}
          email={companyEmail}
          phone={companyPhone}
          logo={companyLogo}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;