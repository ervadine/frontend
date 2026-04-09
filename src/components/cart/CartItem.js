

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './cart.css';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, animationDelay }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantityInput, setQuantityInput] = useState(item.quantity.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(null);

  const [imageError, setImageError] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const imageRetryCount = useRef(0);
  const maxImageRetries = 2;

  const getProductImage = useCallback((product, selectedColor) => {
    if (!product) return '';
    let imageUrl = '';
    if (product.colors?.availableColors) {
      const colorObj = product.colors.availableColors.find(c => c.value === selectedColor);
      if (colorObj?.images?.length) {
        const primary = colorObj.images.find(i => i.isPrimary) || colorObj.images[0];
        imageUrl = primary?.url || '';
      }
    }
    if (!imageUrl && product.primaryImage?.url) imageUrl = product.primaryImage.url;
    if (!imageUrl && product.images?.length) {
      const primary = product.images.find(i => i.isPrimary) || product.images[0];
      imageUrl = primary?.url || '';
    }
    if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
    return imageUrl;
  }, []);

  const getVariantDetails = useCallback((cartItem) => {
    const product = cartItem.product || {};
    const selectedColor = cartItem.selectedColor;
    const selectedSize = cartItem.selectedSize;
    let variantPrice = cartItem.price || 0;
    let variantStock = 0;
    let comparePrice = null;
    if (product.colors?.availableColors) {
      const colorObj = product.colors.availableColors.find(c => c.value === selectedColor);
      if (colorObj) {
        if (colorObj.price) variantPrice = colorObj.price;
        if (colorObj.quantityConfig?.totalQuantity) variantStock = colorObj.quantityConfig.totalQuantity;
        if (selectedSize && colorObj.quantityConfig?.quantities) {
          const q = colorObj.quantityConfig.quantities.find(s => s.size?.value === selectedSize);
          if (q) {
            variantStock = q.quantity || variantStock;
            comparePrice = q.comparePrice || null;
            if (q.price) variantPrice = q.price;
          }
        }
      }
    }
    if (!variantStock) variantStock = product.totalQuantity || 0;
    return {
      variantPrice,
      variantStock,
      comparePrice,
      primaryImage: getProductImage(product, selectedColor),
      productName: product.name || 'Product',
      productId: product._id || product.id
    };
  }, [getProductImage]);

  const variantDetails = useMemo(() => getVariantDetails(item), [item, getVariantDetails]);

  useEffect(() => {
    setQuantityInput(item.quantity.toString());
    setPendingQuantity(null);
  }, [item.quantity]);

  const maxQuantity = Math.min(variantDetails.variantStock || 0, 99);
  const isOutOfStock = variantDetails.variantStock === 0;

  const updateQuantityOptimistic = (newQuantity) => {
    setPendingQuantity(newQuantity);
    setIsLoading(false);
    onUpdateQuantity(item.id, newQuantity);
  };

  const handleDecrease = () => {
    if (isOutOfStock || item.quantity <= 1) return;
    const newQ = item.quantity - 1;
    updateQuantityOptimistic(newQ);
  };

  const handleIncrease = () => {
    if (isOutOfStock || item.quantity >= maxQuantity) return;
    const newQ = item.quantity + 1;
    updateQuantityOptimistic(newQ);
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setQuantityInput('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= maxQuantity) setQuantityInput(val);
  };

  const handleQuantityBlur = () => {
    if (quantityInput === '') {
      setQuantityInput(item.quantity.toString());
      return;
    }
    const num = parseInt(quantityInput);
    if (num !== item.quantity) updateQuantityOptimistic(num);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleQuantityBlur();
  };

  const handleRemoveWithConfirmation = () => {
    if (window.confirm(`Remove "${variantDetails.productName}" from cart?`)) {
      setIsRemoving(true);
      setTimeout(() => onRemoveItem(item.id), 250);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setCurrentImage('https://via.placeholder.com/150x150/cccccc/ffffff?text=Product');
  };

  const memoizedImageUrl = imageError ? 'https://via.placeholder.com/150x150/cccccc/ffffff?text=Product' : currentImage;

  useEffect(() => {
    if (variantDetails.primaryImage) setCurrentImage(variantDetails.primaryImage);
  }, [variantDetails.primaryImage]);

  return (
    <div className={`cart-item ${isRemoving ? 'removing' : ''}`}> 
      <div className="row align-items-center gy-3">
        <div className="col-lg-6 d-flex">
          <img src={memoizedImageUrl} className="product-image me-3" onError={handleImageError} />
          <div>
            <h6 className="fw-bold">{variantDetails.productName}</h6>
            {!isOutOfStock && <span className="text-success">In stock</span>}
            {isOutOfStock && <span className="text-danger">Out of stock</span>}
            <button className="btn-remove mt-2" onClick={handleRemoveWithConfirmation}>
              Remove
            </button>
          </div>
        </div>

        <div className="col-lg-2">
          <div>${variantDetails.variantPrice.toFixed(2)}</div>
        </div>

        <div className="col-lg-2">
          <div className="quantity-selector-wrapper">
            <button className="quantity-btn decrease" onClick={handleDecrease} disabled={isOutOfStock}>
              -
            </button>

            <input
              type="number"
              className="quantity-input"
              value={quantityInput}
              min="1"
              max={maxQuantity}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              onKeyDown={handleKeyDown}
              disabled={isOutOfStock}
            />

            <button className="quantity-btn increase" onClick={handleIncrease} disabled={isOutOfStock}>
              +
            </button>
          </div>
        </div>

        <div className="col-sm-2">
          <strong>${(variantDetails.variantPrice * item.quantity).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartItem);
