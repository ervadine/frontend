(function() {
  "use strict";

  /**
   * Safe element selector with null check
   */
  function safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element not found: ${selector}`);
    }
    return element;
  }

  /**
   * Safe event listener attachment
   */
  function safeAddEventListener(element, event, handler) {
    if (element && typeof handler === 'function') {
      element.addEventListener(event, handler);
    }
  }

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    
    if (!selectBody || !selectHeader) return;
    
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  // Only add event listeners if we're not in a React environment
  if (!window.React) {
    document.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);
  }

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      if (!swiperElement) return;
      
      const configElement = swiperElement.querySelector(".swiper-config");
      if (!configElement) return;
      
      try {
        let config = JSON.parse(configElement.innerHTML.trim());

        if (swiperElement.classList.contains("swiper-tab")) {
          initSwiperWithCustomPagination(swiperElement, config);
        } else {
          if (typeof Swiper !== 'undefined') {
            new Swiper(swiperElement, config);
          }
        }
      } catch (error) {
        console.warn('Swiper initialization failed:', error);
      }
    });
  }

  // Only initialize if not in React
  if (!window.React) {
    window.addEventListener("load", initSwiper);
  }

  /**
   * Mobile nav toggle - Updated for React compatibility
   */
  function initMobileNav() {
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
    
    function mobileNavToogle() {
      const body = document.querySelector('body');
      if (!body || !mobileNavToggleBtn) return;
      
      body.classList.toggle('mobile-nav-active');
      mobileNavToggleBtn.classList.toggle('bi-list');
      mobileNavToggleBtn.classList.toggle('bi-x');
    }
    
    safeAddEventListener(mobileNavToggleBtn, 'click', mobileNavToogle);

    // Hide mobile nav on same-page/hash links
    document.querySelectorAll('#navmenu a').forEach(navmenu => {
      safeAddEventListener(navmenu, 'click', () => {
        if (document.querySelector('.mobile-nav-active')) {
          mobileNavToogle();
        }
      });
    });

    // Toggle mobile nav dropdowns
    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
      safeAddEventListener(navmenu, 'click', function(e) {
        e.preventDefault();
        if (this.parentNode) {
          this.parentNode.classList.toggle('active');
        }
        if (this.parentNode && this.parentNode.nextElementSibling) {
          this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
        }
        e.stopImmediatePropagation();
      });
    });
  }

  /**
   * Preloader
   */
  function initPreloader() {
    const preloader = document.querySelector('#preloader');
    if (preloader) {
      window.addEventListener('load', () => {
        preloader.remove();
      });
    }
  }

  /**
   * Scroll top button
   */
  function initScrollTop() {
    let scrollTop = document.querySelector('.scroll-top');

    function toggleScrollTop() {
      if (scrollTop) {
        window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
      }
    }
    
    safeAddEventListener(scrollTop, 'click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    if (!window.React) {
      window.addEventListener('load', toggleScrollTop);
      document.addEventListener('scroll', toggleScrollTop);
    }
  }

  /**
   * Animation on scroll function and init
   */
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }

  if (!window.React) {
    window.addEventListener('load', initAOS);
  }

  /**
   * Initialize all functions only if not in React environment
   */
  function initializeAll() {
    if (window.React) {
      console.log('React environment detected - skipping vanilla JS initialization');
      return;
    }

    initMobileNav();
    initPreloader();
    initScrollTop();
    initAOS();
    
    // Only initialize these if you're not using React components
    if (document.querySelector('.isotope-layout')) {
      initIsotope();
    }
    if (document.querySelector('.quantity-btn')) {
      ecommerceCartTools();
    }
    if (document.querySelector('#main-product-image')) {
      productDetailFeatures();
    }
    if (document.querySelector('.price-range-container')) {
      priceRangeWidget();
    }
    if (document.querySelector('.checkout-steps') || document.querySelector('.checkout-section')) {
      initCheckout();
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
  } else {
    initializeAll();
  }

  // Placeholder functions to prevent errors
  function initSwiperWithCustomPagination() {}
  function initIsotope() {}
  function ecommerceCartTools() {}
  function productDetailFeatures() {}
  function priceRangeWidget() {}
  function initCheckout() {}

})();