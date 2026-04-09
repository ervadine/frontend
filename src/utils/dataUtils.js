// utils/dataUtils.js
import { products, categories, brands } from '../dummy/data';

// Safe data access utilities
export const getProducts = () => {
  return products || [];
};

export const getCategories = () => {
  return categories || [];
};

export const getBrands = () => {
  return brands || [];
};

export const getProductsByCategory = (categorySlug) => {
  const allProducts = getProducts();
  const allCategories = getCategories();
  
  if (!categorySlug) return allProducts;
  
  const category = allCategories.find(cat => cat.seo?.slug === categorySlug);
  if (!category) return allProducts;
  
  return allProducts.filter(product => {
    const productCategory = allCategories.find(cat => cat._id === product.category);
    if (!productCategory) return false;
    
    // Check if product belongs to category or its subcategories
    if (productCategory._id === category._id) return true;
    if (productCategory.parent === category._id) return true;
    
    return false;
  });
};