// components/ProductImages.js
import React, { useState, useEffect, useRef } from 'react';


const ProductImages = ({ product, selectedVariant, selectedColor }) => {
  const [allImages, setAllImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const thumbsContainerRef = useRef(null);

  // Get images based on selected color
  useEffect(() => {
    let images = [];
    
    if (product && selectedColor) {
      console.log('Selected Color:', selectedColor);
      console.log('Product colorVariants:', product.colorVariants);
      
      // Find images for selected color
      const colorVariant = product.colorVariants?.find(
        variant => variant.color?.name === selectedColor.name
      );
      
      console.log('Found color variant:', colorVariant);
      
      if (colorVariant?.images && colorVariant.images.length > 0) {
        images = colorVariant.images;
      } 
      // Fallback to selectedColor.images
      else if (selectedColor.images && selectedColor.images.length > 0) {
        images = selectedColor.images;
      }
      // Fallback to availableColors images
      else if (product.availableColors) {
        const availableColor = product.availableColors.find(
          color => color.name === selectedColor.name
        );
        if (availableColor?.images && availableColor.images.length > 0) {
          images = availableColor.images;
        }
      }
      // Fallback to product images
      else if (product.images && product.images.length > 0) {
        images = product.images;
      }
      // Final fallback
      else if (product.primaryImage) {
        images = [product.primaryImage];
      }
    } else if (product) {
      // If no color selected, use primary image or first available
      if (product.primaryImage) {
        images = [product.primaryImage];
      } else if (product.images && product.images.length > 0) {
        images = product.images;
      }
    }
    
    // Ensure we have at least one image
    if (images.length === 0) {
      images = [{
        url: '/images/placeholder-product.jpg',
        alt: product?.name || 'Product image',
        isPrimary: true
      }];
    }
    
    console.log('Setting images:', images);
    setAllImages(images);
    setCurrentIndex(0);
    setModalIndex(0);
  }, [product, selectedColor]);

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const handleMainImageClick = () => {
    if (allImages.length > 0) {
      setModalIndex(currentIndex);
      setShowModal(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const handleNextImage = () => {
    if (allImages.length === 0) return;
    const nextIndex = (currentIndex + 1) % allImages.length;
    setCurrentIndex(nextIndex);
  };

  const handlePrevImage = () => {
    if (allImages.length === 0) return;
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentIndex(prevIndex);
  };

  const handleModalNext = () => {
    if (allImages.length === 0) return;
    const nextIndex = (modalIndex + 1) % allImages.length;
    setModalIndex(nextIndex);
  };

  const handleModalPrev = () => {
    if (allImages.length === 0) return;
    const prevIndex = (modalIndex - 1 + allImages.length) % allImages.length;
    setModalIndex(prevIndex);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  // Scroll thumbnails
  const scrollThumbnails = (direction) => {
    if (!thumbsContainerRef.current) return;
    
    const scrollAmount = 100;
    thumbsContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showModal) return;
      
      switch(e.key) {
        case 'Escape':
          handleCloseModal();
          break;
        case 'ArrowLeft':
          handleModalPrev();
          break;
        case 'ArrowRight':
          handleModalNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, modalIndex]);

  if (!product) {
    return (
      <div className="product-images">
        <div className="image-placeholder">
          <i className="bi bi-image text-muted"></i>
          <p>Loading product images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-images">
      {/* Color Indicator */}
      {selectedColor && (
        <div className="color-indicator">
          <span>Viewing:</span>
          <div className="color-preview" style={{ backgroundColor: selectedColor.hexCode || '#ccc' }}></div>
          <span className="color-name">{selectedColor.name}</span>
        </div>
      )}

      {/* Main Image */}
      <div className="main-image-section">
        <div className="main-image-container" onClick={handleMainImageClick}>
          {allImages.length > 0 ? (
            <img
              src={allImages[currentIndex]?.url}
              alt={allImages[currentIndex]?.alt || product.name}
              className="main-image"
              loading="lazy"
              onError={(e) => {
                e.target.src = '/images/placeholder-product.jpg';
                e.target.alt = 'Image not available';
              }}
            />
          ) : (
            <div className="image-placeholder">
              <i className="bi bi-image text-muted"></i>
              <p>No images available</p>
            </div>
          )}
          
          {allImages.length > 1 && (
            <>
              <div className="image-counter">
                {currentIndex + 1} / {allImages.length}
              </div>
              <div className="zoom-hint">
                <i className="bi bi-zoom-in"></i> Click to zoom
              </div>
            </>
          )}
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button 
              className="nav-btn prev-btn"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              aria-label="Previous image"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button 
              className="nav-btn next-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              aria-label="Next image"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="thumbnails-section">
          {allImages.length > 4 && (
            <button 
              className="thumb-nav-btn prev-thumb-btn"
              onClick={() => scrollThumbnails('left')}
              aria-label="Scroll thumbnails left"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          )}

          <div 
            className="thumbnails-container"
            ref={thumbsContainerRef}
          >
            {allImages.map((image, index) => (
              <div
                key={index}
                className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-product.jpg';
                    e.target.alt = 'Thumbnail not available';
                  }}
                />
              </div>
            ))}
          </div>

          {allImages.length > 4 && (
            <button 
              className="thumb-nav-btn next-thumb-btn"
              onClick={() => scrollThumbnails('right')}
              aria-label="Scroll thumbnails right"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          )}
        </div>
      )}

      {/* Image Modal */}
      {showModal && (
        <div className="image-modal-overlay" onClick={handleCloseModal}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-counter">{modalIndex + 1} / {allImages.length}</span>
                {selectedColor && (
                  <span className="modal-color">
                    Color: {selectedColor.name}
                  </span>
                )}
              </div>
              <button 
                className="modal-close"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body">
              <button 
                className="modal-nav-btn modal-prev"
                onClick={handleModalPrev}
                aria-label="Previous image"
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              <div className="modal-image-container">
                <img
                  src={allImages[modalIndex]?.url}
                  alt={allImages[modalIndex]?.alt || product.name}
                  className="modal-image"
                />
              </div>

              <button 
                className="modal-nav-btn modal-next"
                onClick={handleModalNext}
                aria-label="Next image"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

            <div className="modal-thumbnails">
              {allImages.map((image, index) => (
                <div
                  key={index}
                  className={`modal-thumbnail ${index === modalIndex ? 'active' : ''}`}
                  onClick={() => setModalIndex(index)}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImages;