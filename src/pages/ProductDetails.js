import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer'; 
import ProductImages from '../components/ProductImages';
import ProductInfo from '../components/ProductInfo';
import ProductTabs from '../components/ProductTabs';
import { useSweetAlert } from '../hooks/useSweetAlert';
import '../styles/productDetails.css';
import { getProduct, selectCurrentProduct, selectLoading, clearCurrentProduct } from '../store/redux/productSlice';
import { addToCart, selectCartItemCount, fetchCart } from '../store/redux/cartSlice';
import { 
  addToWishlist, 
  removeFromWishlist, 
  selectIsInWishlist, 
  selectWishlist,
  selectIsLoading,
  selectError,
  clearError 
} from '../store/redux/authSlice';
import {
  fetchCategories,
  selectCategories,
  selectLoadingStates
} from '../store/redux/categorySlice';

const ProductDetails = () => {
  const { success: showSuccess, error: showError, warning: showWarning, info: showInfo, confirm: showConfirm } = useSweetAlert();
  const navigate = useNavigate();
  
  const { productId } = useParams();
  const dispatch = useDispatch();
  
  // Redux selectors
  const product = useSelector(selectCurrentProduct);
  const loading = useSelector(selectLoading);
  const cartCount = useSelector(selectCartItemCount);
  
  // Wishlist selectors
  const wishlistItems = useSelector(selectWishlist);
  const wishlistLoading = useSelector(selectIsLoading);
  const wishlistError = useSelector(selectError);
  
  // Select categories from Redux store
  const categories = useSelector(selectCategories);
  const loadingStates = useSelector(selectLoadingStates);
  
  // Local state
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistActionInProgress, setWishlistActionInProgress] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    if (product && wishlistItems.length > 0) {
      const inWishlist = wishlistItems.some(item => 
        item._id === product._id || item.product?._id === product._id
      );
      setIsInWishlist(inWishlist);
    } else {
      setIsInWishlist(false);
    }
  }, [product, wishlistItems]);

  // Fetch product and categories on component mount
  useEffect(() => {
    console.log('🛒 ProductDetails component mounted, fetching product...');
    
    // Fetch product from API
    if (productId) {
      dispatch(getProduct(productId));
    }
    
    // Fetch categories for header
    dispatch(fetchCategories());

    // Cleanup function
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, productId]);

  // Fetch cart and categories on component mount
  useEffect(() => {
    console.log('🛒 Cart component mounted, fetching cart...');
    dispatch(fetchCart());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Set default selections when product loads
  useEffect(() => {
    if (product) {
      console.log('=== PRODUCT DETAILS DEBUG ===');
      console.log('Product:', product.name);
      console.log('Colors config:', product.colors);
      console.log('Size config:', product.sizeConfig);
      console.log('Available colors:', product.colors?.availableColors);
      console.log('Colors with price:', product.colorsWithPrice);
      console.log('Variants:', product.variants);
      console.log('============================');

      // Set default color from available colors
      if (product.colors?.availableColors && product.colors.availableColors.length > 0 && !selectedColor) {
        const defaultColor = product.colors.availableColors[0];
        setSelectedColor(defaultColor);
        
        // Find corresponding variant
        if (product.variants && selectedSize) {
          const variant = product.variants?.find(v => 
            v.color?.name === defaultColor.name && 
            v.size?.value === selectedSize.value
          );
          setSelectedVariant(variant || null);
        }
      }

      // Set default size if available
      if (product.sizeConfig?.availableSizes && product.sizeConfig.availableSizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizeConfig.availableSizes[0]);
      }
    }
  }, [product]);

  // Update variant when color or size changes
  useEffect(() => {
    if (selectedColor && selectedSize && product?.variants) {
      const variant = product.variants.find(v => 
        v.color?.name === selectedColor.name && 
        v.size?.value === selectedSize.value
      );
      setSelectedVariant(variant || null);
      console.log('Selected variant:', variant);
    }
  }, [selectedColor, selectedSize, product]);

  // Handle wishlist errors
  useEffect(() => {
    if (wishlistError) {
      showError('Wishlist Error', wishlistError);
      setWishlistActionInProgress(false);
      // Clear error after showing it
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [wishlistError, showError, dispatch]);

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (newQuantity) => {
    // Get available quantity for selected variant
    let maxQuantity = 1;
    if (selectedVariant?.quantity) {
      maxQuantity = selectedVariant.quantity;
    } else if (selectedColor?.quantityConfig?.availableQuantity) {
      maxQuantity = selectedColor.quantityConfig.availableQuantity;
    } else if (product?.quantity) {
      maxQuantity = product.quantity;
    }
    
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      showError('Error', 'No product selected. Please try again.');
      return;
    }

    // Validate color selection if product has colors
    if (product.colors?.hasColors && !selectedColor) {
      showWarning('Selection Required', 'Please select a color before adding to cart.');
      return;
    }

    // Validate size selection if product has sizes
    if (product.sizeConfig?.hasSizes && !selectedSize) {
      showWarning('Selection Required', 'Please select a size before adding to cart.');
      return;
    }

    // Get price for selected variant
    const price = selectedVariant?.price || selectedColor?.price || product.price || 0;

    // Prepare cart data for Redux
    const cartData = {
      productId: product._id,
      productName: product.name,
      selectedColor: selectedColor ? {
        name: selectedColor.name,
        value: selectedColor.value,
        hexCode: selectedColor.hexCode,
        price: selectedColor.price
      } : null,
      selectedSize: selectedSize ? {
        value: selectedSize.value,
        displayText: selectedSize.displayText
      } : null,
      quantity,
      price: price,
      comparePrice: selectedColor?.comparePrice || product.comparePrice,
      sku: product.sku,
      images: selectedColor?.images || product.images || [],
      productData: product,
      variant: selectedVariant
    };

    try {
      // Dispatch add to cart action
      await dispatch(addToCart(cartData)).unwrap();
      
      // Show success message with SweetAlert
      const colorText = selectedColor ? ` in ${selectedColor.name}` : '';
      const sizeText = selectedSize ? `, Size: ${selectedSize.displayText || selectedSize.value}` : '';
      const successMessage = `Added ${quantity} ${product.name}${colorText}${sizeText} to cart!`;
      
      showSuccess('Success!', successMessage, {
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
        toast: true
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showError('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!product) {
      showError('Error', 'No product selected. Please try again.');
      return;
    }

    // Validate selections if required
    if (product.colors?.hasColors && !selectedColor) {
      showWarning('Selection Required', 'Please select a color before proceeding.');
      return;
    }

    if (product.sizeConfig?.hasSizes && !selectedSize) {
      showWarning('Selection Required', 'Please select a size before proceeding.');
      return;
    }

    // Get price for selected variant
    const price = selectedVariant?.price || selectedColor?.price || product.price || 0;

    // Prepare cart data for Redux
    const cartData = {
      productId: product._id,
      productName: product.name,
      selectedColor: selectedColor ? {
        name: selectedColor.name,
        value: selectedColor.value,
        hexCode: selectedColor.hexCode,
        price: selectedColor.price
      } : null,
      selectedSize: selectedSize ? {
        value: selectedSize.value,
        displayText: selectedSize.displayText
      } : null,
      quantity,
      price: price,
      comparePrice: selectedColor?.comparePrice || product.comparePrice,
      images: selectedColor?.images || product.images || [],
      productData: product,
      variant: selectedVariant
    };

    try {
      // First add to cart, then redirect to checkout
      await dispatch(addToCart(cartData)).unwrap();
      
      // Show confirmation and redirect to checkout
      const result = await showConfirm(
        'Proceed to Checkout?',
        `You've added ${quantity} ${product.name} to your cart. Would you like to proceed to checkout now?`,
        {
          confirmButtonText: 'Yes, Checkout',
          cancelButtonText: 'Continue Shopping',
          showCancelButton: true
        }
      );

      if (result.isConfirmed) {
        // Redirect to checkout page
        showInfo('Redirecting...', 'Taking you to checkout...');
        navigate('/checkout');
      } else {
        // User chose to continue shopping
        showSuccess('Added to Cart!', 'Item has been added to your cart. You can continue shopping.');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showError('Error', 'Failed to proceed to checkout. Please try again.');
    }
  };

  const handleToggleWishlist = async () => {
    if (!product || wishlistLoading || wishlistActionInProgress) {
      return;
    }

    setWishlistActionInProgress(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await dispatch(removeFromWishlist(product._id)).unwrap();
        showSuccess('Removed!', `${product.name} has been removed from your wishlist`, {
          position: 'top-end',
          timer: 2000,
          toast: true
        });
      } else {
        // Add to wishlist
        await dispatch(addToWishlist(product._id)).unwrap();
        showSuccess('Added!', `${product.name} has been added to your wishlist`, {
          position: 'top-end',
          timer: 2000,
          toast: true
        });
      }
    } catch (error) {
      console.error('Wishlist action failed:', error);
      // Error is handled by the useEffect above
    } finally {
      setWishlistActionInProgress(false);
    }
  };

  // Ensure categories is always an array and handle loading state
  const safeCategories = Array.isArray(categories) ? categories : [];
  const categoriesLoading = loadingStates.navigation || false;

  // Get wishlist count from Redux state
  const wishlistCount = wishlistItems.length;

  return (
    <div className="App">
      <Header   
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        categories={safeCategories}
        onSearch={handleSearch}
      />
      
      <main className="main">
        {loading && (
          <div className="container text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading product...</p>
          </div>
        )}

        {!product && !loading && (
          <div className="container text-center py-5">
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Return to Home
            </button>
          </div>
        )}

        {/* Product Details Content */}
        {product && (
          <>
            {/* Page Title */}
            <div className="page-title light-background">
              <div className="container d-lg-flex justify-content-between align-items-center">
                <h1 className="mb-2 mb-lg-0">Product Details</h1>
                <nav className="breadcrumbs">
                  <ol>
                    <li><button className="btn btn-link p-0" onClick={() => navigate('/')}>Home</button></li>
                    <li><button className="btn btn-link p-0" onClick={() => navigate('/products')}>Products</button></li>
                    <li className="current">{product.name}</li>
                  </ol>
                </nav>
              </div>
            </div>

            {/* Product Details Section */}
            <section id="product-details" className="product-details section">
              <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="row">
                  {/* Product Images */}
                  <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right" data-aos-delay="200">
                    <ProductImages 
                      product={product} 
                      selectedColor={selectedColor}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={isInWishlist}
                      wishlistLoading={wishlistLoading || wishlistActionInProgress}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
                    <ProductInfo
                      product={product}
                      selectedColor={selectedColor}
                      selectedSize={selectedSize}
                      selectedVariant={selectedVariant}
                      quantity={quantity}
                      onColorChange={handleColorChange}
                      onSizeChange={handleSizeChange}
                      onQuantityChange={handleQuantityChange}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={isInWishlist}
                      wishlistLoading={wishlistLoading || wishlistActionInProgress}
                    />
                  </div>
                </div>

                {/* Product Details Tabs */}
                <div className="row mt-5" data-aos="fade-up">
                  <div className="col-12">
                    <ProductTabs product={product} />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;