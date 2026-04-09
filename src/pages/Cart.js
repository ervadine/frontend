// pages/Cart.js
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CartPage from '../components/cart/CartPage';
import Footer from '../components/Footer';
import {
  fetchCart,
  updateCartItem,
  removeFromCart, 
  clearCart,
  applyCoupon,
  incrementItemQuantity,
  decrementItemQuantity,
  selectCartItems, 
  selectCartItemCount,
  selectCartTotal, 
  selectDiscountedTotal,
  selectDiscountAmount,
  selectCoupon,
  selectCartLoading,
  selectCartError
} from '../store/redux/cartSlice';
import { fetchTaxRate, selectTaxRate, selectTaxLoading } from '../store/redux/companySlice';
import {
  fetchCategories,
  selectCategories,
  selectLoadingStates
} from '../store/redux/categorySlice';

import { 
  selectIsAuthenticated, 
  selectUser,
  selectWishlist,
  selectIsLoading
} from '../store/redux/authSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Select cart data from Redux store
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartItemCount);
  const totalPrice = useSelector(selectCartTotal);
  const discountedTotal = useSelector(selectDiscountedTotal);
  const discountAmount = useSelector(selectDiscountAmount);
  const coupon = useSelector(selectCoupon);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  
  // Select auth state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  
  // Select wishlist state (same as ContactPage)
  const wishlistItems = useSelector(selectWishlist);
  const wishlistLoading = useSelector(selectIsLoading);
  
  // Select categories from Redux store
  const categories = useSelector(selectCategories);
  const loadingStates = useSelector(selectLoadingStates);
  let taxRate = useSelector(selectTaxRate);
  
  const [isProcessing, setIsProcessing] = useState({});
  const [wishlistError, setWishlistError] = useState(null);

  // Fetch cart and categories on component mount
  useEffect(() => {
    console.log('🛒 Cart component mounted, fetching cart...');
    dispatch(fetchCart());
    dispatch(fetchTaxRate());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = useCallback((searchTerm) => {
    console.log('Searching for:', searchTerm);
  }, []);

  // Add checkout navigation handler
  const handleProceedToCheckout = useCallback(() => {
    if (!isAuthenticated) {
      // Save current cart state or redirect URL to return after login
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  }, [isAuthenticated, navigate]);

  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(itemId));
      return;
    }
    
    setIsProcessing(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const currentItem = cartItems.find(item => item._id === itemId);
      if (currentItem) {
        if (newQuantity > currentItem.quantity) {
          dispatch(incrementItemQuantity(itemId));
        } else {
          dispatch(decrementItemQuantity(itemId));
        }
        
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      dispatch(fetchCart());
    } finally {
      setIsProcessing(prev => ({ ...prev, [itemId]: false }));
    }
  }, [cartItems, dispatch]);

  const removeItem = useCallback(async (itemId) => {
    setIsProcessing(prev => ({ ...prev, [itemId]: true }));
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, [itemId]: false }));
    }
  }, [dispatch]);

  const handleClearCart = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  }, [dispatch]);

  const handleApplyCoupon = useCallback(async (couponCode) => {
    try {
      const result = await dispatch(applyCoupon({ code: couponCode })).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      throw error;
    }
  }, [dispatch]);

  // CRITICAL FIX: Improved cart items transformation based on your JSON data structure
  const transformedCartItems = React.useMemo(() => {
    if (!Array.isArray(cartItems)) return [];
    
    console.log('🛒 Transforming cart items:', cartItems);
    
    return cartItems.map((cartItem, index) => {
      const product = cartItem.product || {};
      const selectedColor = cartItem.selectedColor;
      const selectedSize = cartItem.selectedSize;
      
      let itemPrice = cartItem.price || 0;
      let itemQuantity = cartItem.quantity || 1;
      
      let variant = null;
      if (product.variants && Array.isArray(product.variants)) {
        variant = product.variants.find(v => 
          (!selectedColor || v.color?.value === selectedColor) && 
          (!selectedSize || v.size?.value === selectedSize)
        );
        
        if (variant) {
          itemPrice = variant.price || itemPrice;
        }
      }
      
      if (!variant && product.colorsWithPrices && selectedColor) {
        const colorObj = product.colorsWithPrices.find(c => c.value === selectedColor);
        if (colorObj) {
          itemPrice = colorObj.price || itemPrice;
        }
      }
      
      let image = '';
      
      if (cartItem.image) {
        image = cartItem.image;
      }
      else if (product.colorsWithPrices && selectedColor) {
        const colorObj = product.colorsWithPrices.find(c => c.value === selectedColor);
        if (colorObj?.images?.[0]?.url) {
          image = colorObj.images[0].url;
        }
      }
      else if (product.primaryImage?.url) {
        image = product.primaryImage.url;
      }
      else if (product.images?.[0]?.url) {
        image = product.images[0].url;
      }
      else {
        image = '/images/placeholder-product.jpg';
      }
      
      let variantDisplay = '';
      if (selectedColor || selectedSize) {
        const colorName = product.colorsWithPrices?.find(c => c.value === selectedColor)?.name || selectedColor;
        const sizeName = product.sizeConfig?.availableSizes?.find(s => s.value === selectedSize)?.displayText || selectedSize;
        variantDisplay = [colorName, sizeName].filter(Boolean).join(' / ');
      }
      
      return {
        id: cartItem._id || `item-${index}`,
        productId: product._id,
        name: product.name || 'Product',
        price: itemPrice,
        quantity: itemQuantity,
        image: image,
        color: selectedColor || '',
        size: selectedSize || '',
        variantDisplay: variantDisplay,
        product: product,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        variant: variant
      };
    });
  }, [cartItems]);

  const isEmptyCart = !transformedCartItems || transformedCartItems.length === 0;

  console.log('🛒 Transformed cart items:', transformedCartItems);

  const safeTotalPrice = isEmptyCart ? 0 : (totalPrice || 0);
  
  const safeDiscountedTotal = React.useMemo(() => {
    if (isEmptyCart) return 0;
    
    if (discountedTotal !== null && 
        discountedTotal !== undefined && 
        discountedTotal < safeTotalPrice && 
        discountedTotal > 0) {
      return Number(discountedTotal.toFixed(2));
    }
    return safeTotalPrice;
  }, [isEmptyCart, discountedTotal, safeTotalPrice]);

  console.log('🛒 Cart totals:', {
    safeTotalPrice,
    safeDiscountedTotal,
    hasDiscount: safeDiscountedTotal < safeTotalPrice,
    discountAmount: safeTotalPrice - safeDiscountedTotal
  });

  const safeCategories = Array.isArray(categories) ? categories : [];

  // Get wishlist count (same as ContactPage)
  const wishlistCount = wishlistItems.length;

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
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading cart...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message alert alert-danger mx-3 mt-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error: {error}
          </div>
        )}
        
        <CartPage
          cartItems={transformedCartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={handleClearCart}
          onApplyCoupon={handleApplyCoupon}
          onProceedToCheckout={handleProceedToCheckout}
          totalPrice={safeTotalPrice}
          discountedTotal={safeDiscountedTotal}
          coupon={coupon}
          loading={loading}
          taxRate={taxRate}
          isAuthenticated={isAuthenticated}
        />
      </main>
      
      <Footer />
    </div>
  );
}

export default Cart;