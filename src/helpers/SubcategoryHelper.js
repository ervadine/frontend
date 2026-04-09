// SubcategoryHelper.js
import SubcategoryList from './SubcategoryList';

// Helper function to get all subcategory values as a flat array
export const getAllSubcategories = () => {
  const subcategories = [];
  
  // Iterate through each category (SHOES, TOPS, BOTTOMS, etc.)
  for (const category in SubcategoryList) {
    if (typeof SubcategoryList[category] === 'object') {
      // Get all subcategories within this category
      for (const subcategoryKey in SubcategoryList[category]) {
        subcategories.push(SubcategoryList[category][subcategoryKey]);
      }
    }
  }
  
  // Return sorted array (alphabetically)
  return subcategories.sort();
};

// Helper function to get subcategories by main category type
export const getSubcategoriesByCategoryType = (categoryType) => {
  // Convert categoryType to uppercase to match keys
  const upperCaseType = categoryType?.toUpperCase();
  
  if (SubcategoryList[upperCaseType]) {
    return Object.values(SubcategoryList[upperCaseType]).sort();
  }
  
  return [];
};

// Helper function to get category type from subcategory value
export const getCategoryTypeForSubcategory = (subcategory) => {
  for (const categoryType in SubcategoryList) {
    if (typeof SubcategoryList[categoryType] === 'object') {
      for (const subcategoryKey in SubcategoryList[categoryType]) {
        if (SubcategoryList[categoryType][subcategoryKey] === subcategory) {
          return categoryType;
        }
      }
    }
  }
  return null;
};

// Helper function to get subcategory suggestions based on category name
export const getSubcategorySuggestions = (categoryName) => {
  if (!categoryName) {
    return getAllSubcategories();
  }

  // Common mappings from category names to SubcategoryList keys
  const categoryMapping = {
    // Shoes
    'shoes': 'SHOES',
    'shoe': 'SHOES',
    'footwear': 'SHOES',
    
    // Tops
    'tops': 'TOPS',
    'top': 'TOPS',
    't-shirts': 'TOPS',
    't-shirts & tops': 'TOPS',
    'shirts': 'TOPS',
    'blouses': 'TOPS',
    
    // Bottoms
    'bottoms': 'BOTTOMS',
    'bottom': 'BOTTOMS',
    'pants': 'BOTTOMS',
    'trousers': 'BOTTOMS',
    'jeans': 'BOTTOMS',
    'shorts': 'BOTTOMS',
    'skirts': 'BOTTOMS',
    'leggings': 'BOTTOMS',
    
    // Outerwear
    'outerwear': 'OUTERWEAR',
    'jackets': 'OUTERWEAR',
    'coats': 'OUTERWEAR',
    'blazers': 'OUTERWEAR',
    
    // Traditional
    'traditional': 'TRADITIONAL',
    'ethnic': 'TRADITIONAL',
    'sarees': 'TRADITIONAL',
    'lehengas': 'TRADITIONAL',
    'sherwani': 'TRADITIONAL',
    'kurta': 'TRADITIONAL',
    
    // Innerwear
    'innerwear': 'INNERWEAR',
    'underwear': 'INNERWEAR',
    'lingerie': 'INNERWEAR',
    'sleepwear': 'INNERWEAR',
    'pyjamas': 'INNERWEAR',
    
    // Accessories
    'accessories': 'ACCESSORIES',
    'accessory': 'ACCESSORIES',
    'bags': 'ACCESSORIES',
    'wallets': 'ACCESSORIES',
    'belts': 'ACCESSORIES',
    'jewelry': 'ACCESSORIES',
    'watches': 'ACCESSORIES',
    
    // Sportswear
    'sportswear': 'SPORTSWEAR',
    'sports': 'SPORTSWEAR',
    'activewear': 'SPORTSWEAR',
    'gym wear': 'SPORTSWEAR',
    'workout': 'SPORTSWEAR',
    
    // Home
    'home': 'HOME',
    'home & living': 'HOME',
    'bedding': 'HOME',
    'linen': 'HOME',
    
    // Electronics
    'electronics': 'ELECTRONICS',
    'electronic': 'ELECTRONICS',
    'gadgets': 'ELECTRONICS',
    'mobiles': 'ELECTRONICS',
    'laptops': 'ELECTRONICS',
    
    // Beauty
    'beauty': 'BEAUTY',
    'beauty & personal care': 'BEAUTY',
    'skincare': 'BEAUTY',
    'makeup': 'BEAUTY',
    'cosmetics': 'BEAUTY'
  };

  // Clean the category name (lowercase, remove extra spaces)
  const cleanCategoryName = categoryName.toLowerCase().trim();
  
  // Try to find a direct mapping
  let mappedKey = categoryMapping[cleanCategoryName];
  
  // If no direct mapping, try partial matching
  if (!mappedKey) {
    for (const key in categoryMapping) {
      if (cleanCategoryName.includes(key)) {
        mappedKey = categoryMapping[key];
        break;
      }
    }
  }
  
  // If we found a mapping, return subcategories for that type
  if (mappedKey && SubcategoryList[mappedKey]) {
    return Object.values(SubcategoryList[mappedKey]).sort();
  }
  
  // Default: return all subcategories
  return getAllSubcategories();
};

// Helper function to get popular/frequently used subcategories
export const getPopularSubcategories = (limit = 10) => {
  const popularSubcategories = [
    // Clothing
    'T-Shirts',
    'Jeans',
    'Shirts',
    'Dresses',
    'Sweatshirts',
    'Hoodies',
    'Shorts',
    'Jackets',
    
    // Shoes
    'Running Shoes',
    'Sneakers',
    'Casual Shoes',
    'Formal Shoes',
    'Sandals & Flip-Flops',
    
    // Accessories
    'Bags',
    'Watches',
    'Sunglasses',
    'Jewelry',
    
    // Electronics
    'Mobiles',
    'Laptops',
    'Headphones',
    'Smart Watches',
    
    // Others
    'Skincare',
    'Makeup',
    'Home Decor'
  ];
  
  return popularSubcategories.slice(0, limit);
};

// Helper function to check if a subcategory exists
export const isValidSubcategory = (subcategory) => {
  return getAllSubcategories().includes(subcategory);
};

// Helper function to get subcategories grouped by category
export const getSubcategoriesGrouped = () => {
  const grouped = {};
  
  for (const categoryType in SubcategoryList) {
    if (typeof SubcategoryList[categoryType] === 'object') {
      // Convert category type to readable format
      const readableCategory = categoryType
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
      
      grouped[readableCategory] = Object.values(SubcategoryList[categoryType]).sort();
    }
  }
  
  return grouped;
};

// Export the SubcategoryList as well
export { SubcategoryList };

// Default export
const SubcategoryHelper = {
  getAllSubcategories,
  getSubcategoriesByCategoryType,
  getCategoryTypeForSubcategory,
  getSubcategorySuggestions,
  getPopularSubcategories,
  isValidSubcategory,
  getSubcategoriesGrouped,
  SubcategoryList
};

export default SubcategoryHelper;