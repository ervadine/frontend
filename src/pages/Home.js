import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Hero from '../components/Hero';
import InfoCards from '../components/InfoCards';
import CategoryCards from '../components/CategoryCards';
import BestSellers from '../components/BestSellers';
import ProductList from '../components/ProductList';
import Footer from '../components/Footer';

import { 
  getAllProducts, 
  selectProducts, 
  selectFeaturedProducts 
} from '../store/redux/productSlice';
import { fetchCategories, selectCategories } from '../store/redux/categorySlice';
import {  
  fetchCart, 
  addToCart, 
  selectCartItemCount, 
  selectCartLoading, 
  selectIsItemInCart, 
  selectCartItems 
} from '../store/redux/cartSlice';

import { 
  addToWishlist, 
  removeFromWishlist, 
  selectIsInWishlist, 
  selectWishlist,
 selectIsLoading,
  clearError 
} from '../store/redux/authSlice';

function Home() {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const featuredProducts = useSelector(selectFeaturedProducts);
  const categories = useSelector(selectCategories);
  
  // Cart state
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartItemCount);
  const cartLoading = useSelector(selectCartLoading);
  
  // Wishlist state from Redux
  const wishlistItems = useSelector(selectWishlist);
  const wishlistLoading = useSelector(selectIsLoading);
  const [wishlistError, setWishlistError] = useState(null);

  // Initialize with computed virtual fields
  const [enhancedProducts, setEnhancedProducts] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(fetchCategories());
    dispatch(fetchCart()); // Fetch cart data on app load
  }, [dispatch]);

  // Enhance products with computed fields and cart/wishlist status
  useEffect(() => {
    const computedProducts = products.map(product => {
      // Calculate inStock based on your product structure
      const inStock = product.inStock !== false && 
                     product.quantity > 0 && 
                     product.totalQuantity > 0;
      
      let discountPercentage = product.discountPercentage || 0;
      
      // Check if product is in cart (for simple products without variants)
      const isInCart = cartItems.some(item => 
        item.product?._id === product._id && 
        !item.selectedColor && 
        !item.selectedSize
      );
      
      // Check if product is in wishlist using Redux selector
      const isInWishlist = wishlistItems.some(item => 
        item._id === product._id || item.product?._id === product._id
      );
      
      return {
        ...product,
        inStock,
        discountPercentage,
        isInCart,
        isInWishlist
      };
    });
    
    setEnhancedProducts(computedProducts);
  }, [products, cartItems, wishlistItems]);

  // Enhanced addToCart function using Redux
  const handleAddToCart = (product, selectedVariant = null, selectedColor = null, selectedSize = null) => {
    const cartData = {
      productId: product._id,
      quantity: 1,
      price: selectedVariant ? selectedVariant.price : product.price,
      selectedColor: selectedColor,
      selectedSize: selectedSize,
      variant: selectedVariant
    };
    
    console.log('🛒 Adding to cart:', cartData);
    dispatch(addToCart(cartData));
  };

  // Enhanced variant addToCart function
  const handleAddVariantToCart = (product, variant, color, size) => {
    const cartData = {
      productId: product._id,
      quantity: 1,
      price: variant.price,
      selectedColor: color,
      selectedSize: size,
      variant: {
        _id: variant._id,
        option: `${color} / ${size}`,
        price: variant.price,
        quantity: variant.quantity
      }
    };
    
    console.log('🛒 Adding variant to cart:', cartData);
    dispatch(addToCart(cartData));
  };

  // Handle wishlist toggle using Redux
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

  // Check if a specific product variant is in cart
  const isVariantInCart = (productId, selectedColor, selectedSize) => {
    return cartItems.some(item => 
      item.product?._id === productId && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize
    );
  };

  // Get wishlist count from Redux state
  const wishlistCount = wishlistItems.length;

  return (
    <div className="App">
      <Header 
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={categories}
      />
      
      <main className="main">
        {/* Show loading state when cart is being fetched */}
        {cartLoading && (
          <div className="loading" style={{ textAlign: 'center', padding: '10px' }}>
            Loading cart...
          </div>
        )}
        
        {/* Show wishlist error if any */}
        {wishlistError && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert" 
               style={{ margin: '10px', position: 'fixed', top: '80px', right: '20px', zIndex: 1000 }}>
            {wishlistError}
            <button type="button" className="btn-close" onClick={() => setWishlistError(null)}></button>
          </div>
        )}
        
        <Hero />
        <CategoryCards categories={categories} />
        
        <ProductList 
          products={enhancedProducts}
          addToCart={handleAddToCart}
          addVariantToCart={handleAddVariantToCart}
          toggleWishlist={handleToggleWishlist} 
          isVariantInCart={isVariantInCart}
          cartLoading={cartLoading}
          wishlistLoading={wishlistLoading}
        />
        
        <BestSellers 
          products={featuredProducts.length > 0 ? featuredProducts.slice(0, 4) : enhancedProducts.slice(0, 4)}
          addToCart={handleAddToCart}
          addVariantToCart={handleAddVariantToCart}
          toggleWishlist={handleToggleWishlist}
          isVariantInCart={isVariantInCart}
          cartLoading={cartLoading}
          wishlistLoading={wishlistLoading}
        />
        
        <InfoCards />
      </main>
      
      <Footer />
    </div>
  );
}

export default Home;