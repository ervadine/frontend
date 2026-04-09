import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import useSweetAlert from "../../hooks/useSweetAlert";
import { 
  getAllSubcategories, 
  getSubcategorySuggestions,
  isValidSubcategory 
} from '../../helpers/SubcategoryHelper';
import {
  getProduct,
  updateProduct,
  selectCurrentProduct,
  selectLoading,
  selectError,
} from "../../store/redux/productSlice";
import {
  fetchBrands,
  selectBrands,
  selectBrandLoading,
  selectBrandError,
} from "../../store/redux/brandSlice";
import {
  fetchCategories,
  selectCategories,
  selectIsLoading,
  selectCategoryError,
} from "../../store/redux/categorySlice";

const EditProductForm = () => {
  const params = useParams();
  const productId = params?.productId;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    confirm: showConfirm,
    info: showInfo,
  } = useSweetAlert();

  // Product selectors
  const product = useSelector(selectCurrentProduct);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // Categories selectors
  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectIsLoading);
  const categoriesError = useSelector(selectCategoryError);

  // Brands selectors
  const brands = useSelector(selectBrands);
  const brandsLoading = useSelector(selectBrandLoading);
  const brandsError = useSelector(selectBrandError);

  // Initialize form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    sizeConfig: {
      hasSizes: false,
      type: "none",
      availableSizes: [],
      dimensionalConfig: {
        hasDimensions: false,
        dimensionTypes: [],
      },
    },
    colors: {
      hasColors: false,
      availableColors: [],
    },
    price: "",
    comparePrice: "",
    cost: "",
    sku: "",
    barcode: "",
    quantity: 0,
    lowStockThreshold: 5,
    trackQuantity: true,
    allowBackorder: false,
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    category: "",
    subcategory: "",
    brand: "",
    supplier: "",
    tags: [],
    specifications: [],
    isActive: true,
    isFeatured: false,
    isNew: false,
    isBestSeller: false,
    seo: {
      title: "",
      description: "",
      slug: "",
    },
    defaultSize: {
      value: "",
      displayText: "",
    },
    defaultColor: {
      name: "",
      value: "",
      hexCode: "",
    },
    material: "",
    careInstructions: [],
    variants: [],
    shipping: {
      isFree: false,
      weightBasedShipping: false,
      fixedCost: "",
    },
    tax: {
      taxable: true,
      taxCode: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [newColor, setNewColor] = useState({
    name: "",
    value: "",
    hexCode: "",
    price: "",
    comparePrice: "",
    displayOrder: 0,
  });
  const [newSize, setNewSize] = useState({
    value: "",
    type: "numeric",
    displayText: "",
    dimensions: {
      waist: "",
      length: "",
      chest: "",
      sleeve: "",
    },
  });
  const [newTag, setNewTag] = useState("");
  const [newSpecification, setNewSpecification] = useState({
    name: "",
    value: "",
    displayOrder: 0,
  });
  const [newCareInstruction, setNewCareInstruction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Color Images State
  const [colorImages, setColorImages] = useState({});
  const [colorImageFiles, setColorImageFiles] = useState({});
  const [colorImagesMapping, setColorImagesMapping] = useState([]);
  const [uploadingColorImages, setUploadingColorImages] = useState(false);

  // Primary Image Data for API
  const [primaryImageData, setPrimaryImageData] = useState(null);

  // Color-Size Quantities State
  const [colorSizeQuantities, setColorSizeQuantities] = useState({});

  // Subcategory handling states
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);
  const [subcategorySearch, setSubcategorySearch] = useState("");

  // Fetch product data
  useEffect(() => {
    if (productId) {
      dispatch(getProduct(productId));
    }
  }, [dispatch, productId]);

  // Fetch categories and brands
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Load all subcategories on component mount
  useEffect(() => {
    const subcategories = getAllSubcategories();
    setAllSubcategories(subcategories);
    setAvailableSubcategories(subcategories);
  }, []);

  // Initialize form data when product loads
  useEffect(() => {
    if (product) {
      console.log("Product loaded for editing:", product);

      // Helper function to sanitize string fields
      const sanitizeString = (value) => {
        return value === null || value === undefined ? "" : String(value);
      };

      const initialFormData = {
        name: sanitizeString(product.name),
        description: sanitizeString(product.description),
        shortDescription: sanitizeString(product.shortDescription),
        sizeConfig: product.sizeConfig || {
          hasSizes: false,
          type: "none",
          availableSizes: [],
          dimensionalConfig: {
            hasDimensions: false,
            dimensionTypes: [],
          },
        },
        colors: product.colors || {
          hasColors: false,
          availableColors: [],
        },
        price: sanitizeString(product.price),
        comparePrice: sanitizeString(product.comparePrice),
        cost: sanitizeString(product.cost),
        sku: sanitizeString(product.sku),
        barcode: sanitizeString(product.barcode),
        quantity: product.quantity || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        trackQuantity:
          product.trackQuantity !== undefined ? product.trackQuantity : true,
        allowBackorder: product.allowBackorder || false,
        weight: sanitizeString(product.weight),
        dimensions: product.dimensions || {
          length: "",
          width: "",
          height: "",
        },
        category: product.category?._id || sanitizeString(product.category),
        subcategory: sanitizeString(product.subcategory),
        brand: product.brand?._id || sanitizeString(product.brand),
        supplier: product.supplier?._id || sanitizeString(product.supplier),
        tags: product.tags || [],
        specifications: product.specifications || [],
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
        seo: product.seo || {
          title: "",
          description: "",
          slug: "",
        },
        defaultSize: product.defaultSize || {
          value: "",
          displayText: "",
        },
        defaultColor: product.defaultColor || {
          name: "",
          value: "",
          hexCode: "",
        },
        material: sanitizeString(product.material),
        careInstructions: product.careInstructions || [],
        variants: product.variants || [],
        shipping: product.shipping || {
          isFree: false,
          weightBasedShipping: false,
          fixedCost: "",
        },
        tax: product.tax || {
          taxable: true,
          taxCode: "",
        },
      };

      setFormData(initialFormData);
      
      // Set initial subcategory search value
      if (product.subcategory) {
        setSubcategorySearch(product.subcategory);
      }
      
      // Initialize color images
      const initialColorImages = {};
      if (product.colors && product.colors.availableColors) {
        product.colors.availableColors.forEach((color) => {
          if (color.images && color.images.length > 0) {
            initialColorImages[color.value] = color.images.map((img) => ({
              url: img.url,
              public_id: img.public_id,
              alt: img.alt || `Product image for color ${color.name}`,
              isPrimary: img.isPrimary || false,
              displayOrder: img.displayOrder || 0,
              isExisting: true,
              colorValue: color.value,
            }));
          } else {
            initialColorImages[color.value] = [];
          }
        });
      }
      setColorImages(initialColorImages);
      
      // Initialize color-size quantities
      const initialQuantities = {};
      if (product.colors?.hasColors && product.sizeConfig?.hasSizes) {
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((variant) => {
            if (variant.color?.value && variant.size?.value) {
              const key = `${variant.color.value}_${variant.size.value}`;
              initialQuantities[key] = {
                quantity: variant.quantity || 0,
                price: variant.price !== undefined ? variant.price : (variant.color.price || 0),
                comparePrice: variant.comparePrice !== undefined ? variant.comparePrice : (variant.color.comparePrice || null),
                sku: variant.sku || "",
                barcode: variant.barcode || "",
                lowStockThreshold: product.lowStockThreshold || 5,
              };
            }
          });
        } else if (product.colors.availableColors) {
          product.colors.availableColors.forEach((color) => {
            const colorPrice = color.price || 0;
            const colorComparePrice = color.comparePrice || null;

            product.sizeConfig.availableSizes.forEach((size) => {
              const key = `${color.value}_${size.value}`;
              const quantityFromConfig = color.quantityConfig?.quantities?.find(
                (q) => q.size?.value === size.value
              );

              if (quantityFromConfig) {
                initialQuantities[key] = {
                  quantity: quantityFromConfig.quantity || 0,
                  price: quantityFromConfig.price !== undefined ? quantityFromConfig.price : colorPrice,
                  comparePrice: quantityFromConfig.comparePrice !== undefined ? quantityFromConfig.comparePrice : colorComparePrice,
                  sku: quantityFromConfig.sku || "",
                  barcode: quantityFromConfig.barcode || "",
                  lowStockThreshold: quantityFromConfig.lowStockThreshold || product.lowStockThreshold || 5,
                };
              } else {
                initialQuantities[key] = {
                  quantity: 0,
                  price: colorPrice,
                  comparePrice: colorComparePrice,
                  sku: "",
                  barcode: "",
                  lowStockThreshold: product.lowStockThreshold || 5,
                };
              }
            });
          });
        }
      }
      setColorSizeQuantities(initialQuantities);
    }
  }, [product]);

  // Update available subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      setSelectedCategoryInfo(selectedCategory);
      
      if (selectedCategory) {
        const suggestedSubcategories = getSubcategorySuggestions(selectedCategory.name);
        setAvailableSubcategories(suggestedSubcategories);
        
        // Clear subcategory if it's not in the new suggestions
        if (formData.subcategory && !suggestedSubcategories.includes(formData.subcategory)) {
          setFormData(prev => ({ ...prev, subcategory: '' }));
          setSubcategorySearch('');
        }
      }
    } else {
      setSelectedCategoryInfo(null);
      setAvailableSubcategories(allSubcategories);
    }
  }, [formData.category, categories, allSubcategories]);

  // Filter subcategories based on search
  useEffect(() => {
    if (subcategorySearch) {
      const filtered = allSubcategories.filter(subcategory =>
        subcategory.toLowerCase().includes(subcategorySearch.toLowerCase())
      );
      setAvailableSubcategories(filtered);
    } else if (selectedCategoryInfo) {
      const suggestedSubcategories = getSubcategorySuggestions(selectedCategoryInfo.name);
      setAvailableSubcategories(suggestedSubcategories);
    } else {
      setAvailableSubcategories(allSubcategories);
    }
  }, [subcategorySearch, selectedCategoryInfo, allSubcategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const safeValue = value === null || value === undefined ? "" : value;

    if (name.includes(".")) {
      const keys = name.split(".");
      if (keys.length === 2) {
        const [parent, child] = keys;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === "checkbox" ? checked : safeValue,
          },
        }));
      } else if (keys.length === 3) {
        const [parent, child, grandchild] = keys;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: type === "checkbox" ? checked : safeValue,
            },
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : safeValue,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle subcategory search and selection
  const handleSubcategorySearch = (e) => {
    const value = e.target.value;
    setSubcategorySearch(value);
    
    if (!value) {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    } else if (availableSubcategories.includes(value)) {
      setFormData(prev => ({ ...prev, subcategory: value }));
    }
  };

  // Handle subcategory select from dropdown
  const handleSubcategorySelect = (subcategory) => {
    setFormData(prev => ({ ...prev, subcategory }));
    setSubcategorySearch(subcategory);
  };

  // Handle color price change
  const handleColorPriceChange = (colorIndex, field, value) => {
    setFormData((prev) => {
      const updatedColors = [...prev.colors.availableColors];
      const color = updatedColors[colorIndex];
      const newValue = value === "" ? null : parseFloat(value);

      updatedColors[colorIndex] = {
        ...color,
        [field]: newValue,
        quantityConfig: color.quantityConfig
          ? {
              ...color.quantityConfig,
              quantities:
                color.quantityConfig.quantities?.map((q) => ({
                  ...q,
                  [field]: newValue,
                })) || [],
            }
          : undefined,
      };

      // Update color-size quantities for this color
      if (field === "price" || field === "comparePrice") {
        const colorValue = color.value;
        const newQuantities = { ...colorSizeQuantities };

        Object.keys(newQuantities).forEach((key) => {
          if (key.startsWith(`${colorValue}_`)) {
            newQuantities[key] = {
              ...newQuantities[key],
              [field]: newValue,
            };
          }
        });

        setColorSizeQuantities(newQuantities);
      }

      return {
        ...prev,
        colors: {
          ...prev.colors,
          availableColors: updatedColors,
        },
      };
    });
  };

  // Handle color-size quantity/price change
  const handleColorSizeQuantityChange = (
    colorValue,
    sizeValue,
    field,
    value
  ) => {
    const key = `${colorValue}_${sizeValue}`;

    setColorSizeQuantities((prev) => {
      const newQuantities = {
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          [field]:
            field === "quantity"
              ? value === "" ? 0 : parseInt(value) || 0
              : field === "price" || field === "comparePrice"
              ? value === "" ? "" : parseFloat(value)
              : value,
        },
      };
      return newQuantities;
    });
  };

  // Color Images Handling
  const handleColorImageUpload = (e, colorValue) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentImages = colorImages[colorValue] || [];
    const newImages = files.map((file, index) => {
      const url = URL.createObjectURL(file);
      return {
        url,
        file,
        alt: `Image for ${colorValue}`,
        isPrimary: currentImages.length === 0 && index === 0,
        displayOrder: currentImages.length + index,
        isExisting: false,
        colorValue,
        tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    });

    setColorImages((prev) => ({
      ...prev,
      [colorValue]: [...currentImages, ...newImages],
    }));

    const newMappings = files.map(() => colorValue);
    setColorImagesMapping((prev) => [...prev, ...newMappings]);
    e.target.value = "";
  };

  // Enhanced primary image handler
  const handleSetColorPrimaryImage = (colorValue, index) => {
    setColorImages((prev) => {
      const updatedImages = prev[colorValue].map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      
      // Find the new primary image
      const primaryImage = updatedImages.find(img => img.isPrimary);
      
      // Prepare primary image data for backend
      if (primaryImage) {
        setPrimaryImageData({
          colorValue: colorValue,
          public_id: primaryImage.public_id || primaryImage.tempId,
          url: primaryImage.url,
          alt: primaryImage.alt
        });
      }
      
      return {
        ...prev,
        [colorValue]: updatedImages,
      };
    });
  };

  const removeColorImage = (colorValue, index) => {
    const imageToRemove = colorImages[colorValue][index];

    // If it's a temporary image (new upload), remove from mapping
    if (!imageToRemove.isExisting) {
      const tempIdIndex = colorImagesMapping.findIndex((_, i) => i === index);
      if (tempIdIndex > -1) {
        setColorImagesMapping((prev) =>
          prev.filter((_, i) => i !== tempIdIndex)
        );
      }
    }

    // Remove from local state
    const updatedImages = colorImages[colorValue].filter((_, i) => i !== index);

    // If we removed the primary image and there are other images, set the first one as primary
    if (imageToRemove.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
      
      // Update primaryImageData
      const newPrimaryImage = updatedImages[0];
      setPrimaryImageData({
        colorValue: colorValue,
        public_id: newPrimaryImage.public_id || newPrimaryImage.tempId,
        url: newPrimaryImage.url,
        alt: newPrimaryImage.alt
      });
    } else if (imageToRemove.isPrimary && updatedImages.length === 0) {
      // No images left for this color, clear primaryImageData
      setPrimaryImageData(null);
    }

    setColorImages((prev) => ({
      ...prev,
      [colorValue]: updatedImages,
    }));

    // Revoke object URL for temp images
    if (!imageToRemove.isExisting && imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }
  };

  const addColor = () => {
    if (!newColor.name || !newColor.value) {
      setErrors((prev) => ({
        ...prev,
        colors: "Color name and value are required",
      }));
      return;
    }

    if (
      newColor.hexCode &&
      !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor.hexCode)
    ) {
      setErrors((prev) => ({ ...prev, colors: "Invalid hex code format" }));
      return;
    }

    if (
      formData.colors.availableColors.some(
        (color) => color.value === newColor.value
      )
    ) {
      setErrors((prev) => ({ ...prev, colors: "Color value already exists" }));
      return;
    }

    const priceValue = newColor.price ? parseFloat(newColor.price) : null;
    const comparePriceValue = newColor.comparePrice
      ? parseFloat(newColor.comparePrice)
      : null;

    const colorToAdd = {
      name: newColor.name.trim(),
      value: newColor.value.trim(),
      hexCode: newColor.hexCode?.trim() || undefined,
      price: priceValue,
      comparePrice: comparePriceValue,
      displayOrder: formData.colors.availableColors.length,
      quantityConfig: {
        trackQuantity: true,
        allowBackorder: false,
        lowStockThreshold: 5,
        quantities: [],
        totalQuantity: 0,
        availableQuantity: 0,
        inStock: false,
        isLowStock: false,
      },
    };

    setFormData((prev) => ({
      ...prev,
      colors: {
        hasColors: true,
        availableColors: [...prev.colors.availableColors, colorToAdd],
      },
    }));

    // Initialize empty image arrays for new color
    setColorImages((prev) => ({
      ...prev,
      [newColor.value]: [],
    }));

    // Initialize color-size quantities for new color
    if (formData.sizeConfig.hasSizes) {
      const newQuantities = {};
      formData.sizeConfig.availableSizes.forEach((size) => {
        const key = `${newColor.value}_${size.value}`;
        newQuantities[key] = {
          quantity: 0,
          price: priceValue || 0,
          comparePrice: comparePriceValue,
          sku: "",
          barcode: "",
          lowStockThreshold: formData.lowStockThreshold || 5,
        };
      });

      setColorSizeQuantities((prev) => ({
        ...prev,
        ...newQuantities,
      }));
    }

    setNewColor({
      name: "",
      value: "",
      hexCode: "",
      price: "",
      comparePrice: "",
      displayOrder: 0,
    });
    setErrors((prev) => ({ ...prev, colors: "" }));
  };

  const removeColor = (index) => {
    const colorToRemove = formData.colors.availableColors[index];

    setFormData((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        availableColors: prev.colors.availableColors.filter(
          (_, i) => i !== index
        ),
      },
    }));

    // Remove color images when color is removed
    setColorImages((prev) => {
      const newColorImages = { ...prev };
      delete newColorImages[colorToRemove.value];
      return newColorImages;
    });

    // Remove from colorImagesMapping
    setColorImagesMapping((prev) =>
      prev.filter((colorValue) => colorValue !== colorToRemove.value)
    );

    // Remove color-size quantities for removed color
    setColorSizeQuantities((prev) => {
      const newQuantities = { ...prev };
      Object.keys(newQuantities).forEach((key) => {
        if (key.startsWith(`${colorToRemove.value}_`)) {
          delete newQuantities[key];
        }
      });
      return newQuantities;
    });

    // Clear primaryImageData if it was for this color
    if (primaryImageData && primaryImageData.colorValue === colorToRemove.value) {
      setPrimaryImageData(null);
    }
  };

  const addSize = () => {
    if (!newSize.value.trim() || !newSize.displayText.trim()) {
      setErrors((prev) => ({
        ...prev,
        sizes: "Size value and display text are required",
      }));
      return;
    }

    const sizeToAdd = {
      value: newSize.value.trim(),
      type: newSize.type,
      displayText: newSize.displayText.trim(),
      dimensions: newSize.dimensions,
    };

    setFormData((prev) => ({
      ...prev,
      sizeConfig: {
        ...prev.sizeConfig,
        hasSizes: true,
        availableSizes: [...prev.sizeConfig.availableSizes, sizeToAdd],
      },
    }));

    // Initialize color-size quantities for new size
    if (formData.colors.hasColors) {
      const newQuantities = {};
      formData.colors.availableColors.forEach((color) => {
        const key = `${color.value}_${newSize.value}`;
        newQuantities[key] = {
          quantity: 0,
          price: color.price || 0,
          comparePrice: color.comparePrice || null,
          sku: "",
          barcode: "",
          lowStockThreshold: formData.lowStockThreshold || 5,
        };
      });

      setColorSizeQuantities((prev) => ({
        ...prev,
        ...newQuantities,
      }));
    }

    setNewSize({
      value: "",
      type: "numeric",
      displayText: "",
      dimensions: {
        waist: "",
        length: "",
        chest: "",
        sleeve: "",
      },
    });
    setErrors((prev) => ({ ...prev, sizes: "" }));
  };

  const removeSize = (index) => {
    const sizeToRemove = formData.sizeConfig.availableSizes[index];

    setFormData((prev) => ({
      ...prev,
      sizeConfig: {
        ...prev.sizeConfig,
        availableSizes: prev.sizeConfig.availableSizes.filter(
          (_, i) => i !== index
        ),
      },
    }));

    // Remove color-size quantities for removed size
    setColorSizeQuantities((prev) => {
      const newQuantities = { ...prev };
      Object.keys(newQuantities).forEach((key) => {
        if (key.endsWith(`_${sizeToRemove.value}`)) {
          delete newQuantities[key];
        }
      });
      return newQuantities;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Validate subcategory if provided
    if (formData.subcategory && !isValidSubcategory(formData.subcategory)) {
      newErrors.subcategory = "Invalid subcategory selected";
    }

    // Validate brand format if provided
    if (formData.brand && formData.brand.trim() !== "") {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(formData.brand.trim())) {
        newErrors.brand = "Invalid brand ID format";
      }
    }

    // Validate color prices
    if (formData.colors.hasColors) {
      formData.colors.availableColors.forEach((color, index) => {
        if (color.price !== undefined && color.price !== null) {
          if (color.price < 0) {
            newErrors[`colorPrice_${index}`] = `Price cannot be negative for ${color.name}`;
          }

          if (color.comparePrice !== undefined && color.comparePrice !== null) {
            if (color.comparePrice < 0) {
              newErrors[`colorComparePrice_${index}`] = `Compare price cannot be negative for ${color.name}`;
            }
            if (color.comparePrice < color.price) {
              newErrors[`colorComparePrice_${index}`] = `Compare price must be greater than or equal to price for ${color.name}`;
            }
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showWarning("Please fix the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setUploadingColorImages(true);

    let variants = [];
    let totalProductQuantity = 0;

    try {
      // Prepare FormData
      const formDataToSend = new FormData();

      // Prepare colors with quantity configuration
      const updatedColors = formData.colors.hasColors
        ? formData.colors.availableColors.map((color) => {
            const quantities = [];
            let totalQuantity = 0;

            if (formData.sizeConfig.hasSizes) {
              formData.sizeConfig.availableSizes.forEach((size) => {
                const key = `${color.value}_${size.value}`;
                const quantityData = colorSizeQuantities[key] || {};

                const quantity = parseInt(quantityData.quantity) || 0;
                
                const price = 
                  quantityData.price !== undefined && 
                  quantityData.price !== "" && 
                  !isNaN(quantityData.price)
                    ? parseFloat(quantityData.price)
                    : (color.price !== undefined && color.price !== "" && !isNaN(color.price)
                        ? parseFloat(color.price)
                        : null);
                
                const comparePrice = 
                  quantityData.comparePrice !== undefined && 
                  quantityData.comparePrice !== "" && 
                  !isNaN(quantityData.comparePrice)
                    ? parseFloat(quantityData.comparePrice)
                    : (color.comparePrice !== undefined && color.comparePrice !== "" && !isNaN(color.comparePrice)
                        ? parseFloat(color.comparePrice)
                        : null);

                quantities.push({
                  size: { 
                    value: size.value,
                    displayText: size.displayText 
                  },
                  displayText: size.displayText,
                  quantity: quantity,
                  price: price,
                  comparePrice: comparePrice,
                  sku: quantityData.sku || "",
                  barcode: quantityData.barcode || "",
                  lowStockThreshold:
                    quantityData.lowStockThreshold ||
                    formData.lowStockThreshold ||
                    5,
                  isLowStock:
                    quantity > 0 &&
                    quantity <=
                      (quantityData.lowStockThreshold ||
                        formData.lowStockThreshold ||
                        5),
                  inStock: quantity > 0,
                });

                totalQuantity += quantity;
              });
            }

            return {
              ...color,
              quantityConfig: {
                trackQuantity: true,
                allowBackorder: false,
                lowStockThreshold: formData.lowStockThreshold || 5,
                quantities,
                totalQuantity,
                availableQuantity: totalQuantity,
                inStock: totalQuantity > 0,
                isLowStock:
                  totalQuantity > 0 &&
                  totalQuantity <= (formData.lowStockThreshold || 5),
              },
            };
          })
        : [];

      // Prepare variants array
      variants = [];
      totalProductQuantity = 0;
      
      if (formData.colors.hasColors && formData.sizeConfig.hasSizes) {
        formData.colors.availableColors.forEach((color) => {
          formData.sizeConfig.availableSizes.forEach((size) => {
            const key = `${color.value}_${size.value}`;
            const quantityData = colorSizeQuantities[key] || {};

            const quantity = parseInt(quantityData.quantity) || 0;
            
            const price = 
              quantityData.price !== undefined && 
              quantityData.price !== "" && 
              !isNaN(quantityData.price)
                ? parseFloat(quantityData.price)
                : (color.price !== undefined && color.price !== "" && !isNaN(color.price)
                    ? parseFloat(color.price)
                    : null);
            
            const comparePrice = 
              quantityData.comparePrice !== undefined && 
              quantityData.comparePrice !== "" && 
              !isNaN(quantityData.comparePrice)
                ? parseFloat(quantityData.comparePrice)
                : (color.comparePrice !== undefined && color.comparePrice !== "" && !isNaN(color.comparePrice)
                    ? parseFloat(color.comparePrice)
                    : null);

            variants.push({
              size: {
                value: size.value,
                displayText: size.displayText,
              },
              color: {
                name: color.name,
                value: color.value,
                hexCode: color.hexCode,
              },
              price: price,
              comparePrice: comparePrice,
              quantity: quantity,
              sku: quantityData.sku || "",
              barcode: quantityData.barcode || "",
              weight: formData.weight && !isNaN(formData.weight) ? parseFloat(formData.weight) : null,
              dimensions: formData.dimensions,
            });
            
            totalProductQuantity += quantity;
          });
        });
      }

      // Handle defaultSize and defaultColor
      let defaultSizeValue = formData.defaultSize;
      let defaultColorValue = formData.defaultColor;

      if (typeof defaultSizeValue === 'string' && defaultSizeValue.includes('[object Object]')) {
        defaultSizeValue = formData.sizeConfig.availableSizes.length > 0 
          ? formData.sizeConfig.availableSizes[0] 
          : { value: "", displayText: "" };
      }

      if (typeof defaultColorValue === 'string' && defaultColorValue.includes('[object Object]')) {
        defaultColorValue = formData.colors.availableColors.length > 0
          ? formData.colors.availableColors[0]
          : { name: "", value: "", hexCode: "" };
      }

      // Clean form data for sending
      const cleanedFormData = {
        ...formData,
        colors: formData.colors.hasColors
          ? {
              hasColors: true,
              availableColors: updatedColors,
            }
          : { hasColors: false, availableColors: [] },
        variants,
        quantity: totalProductQuantity,
        inStock: totalProductQuantity > 0,
        isLowStock: totalProductQuantity > 0 && totalProductQuantity <= (formData.lowStockThreshold || 5),
        
        // Handle numeric fields
        price: formData.price && !isNaN(formData.price) ? parseFloat(formData.price) : null,
        comparePrice: formData.comparePrice && !isNaN(formData.comparePrice) ? parseFloat(formData.comparePrice) : null,
        cost: formData.cost && !isNaN(formData.cost) ? parseFloat(formData.cost) : null,
        
        // Handle subcategory - keep as string
        subcategory: formData.subcategory || null,
        
        // Handle brand field - convert empty string to null
        brand: formData.brand && formData.brand.trim() !== "" 
          ? formData.brand 
          : null,
        
        // Handle supplier
        supplier: formData.supplier && formData.supplier.trim() !== "" 
          ? formData.supplier 
          : null,
        
        // Use the properly handled defaultSize and defaultColor
        defaultSize: defaultSizeValue,
        defaultColor: defaultColorValue,
        
        // Handle weight
        weight: formData.weight && !isNaN(formData.weight) ? parseFloat(formData.weight) : null,
        
        // Handle dimensions
        dimensions: {
          length: formData.dimensions.length && !isNaN(formData.dimensions.length) 
            ? parseFloat(formData.dimensions.length) 
            : null,
          width: formData.dimensions.width && !isNaN(formData.dimensions.width) 
            ? parseFloat(formData.dimensions.width) 
            : null,
          height: formData.dimensions.height && !isNaN(formData.dimensions.height) 
            ? parseFloat(formData.dimensions.height) 
            : null,
        },
        
        shipping: {
          ...formData.shipping,
          fixedCost: formData.shipping.fixedCost && !isNaN(formData.shipping.fixedCost)
            ? parseFloat(formData.shipping.fixedCost)
            : null,
        },
      };

      // Remove undefined values (but keep null for comparePrice, brand, supplier, subcategory)
      Object.keys(cleanedFormData).forEach((key) => {
        if (cleanedFormData[key] === undefined) {
          delete cleanedFormData[key];
        }
      });

      // Add primary image data if set
      if (primaryImageData) {
        cleanedFormData.primaryImageData = primaryImageData;
      }

      // Add all form data to FormData
      Object.keys(cleanedFormData).forEach((key) => {
        if (
          key === "colors" ||
          key === "sizeConfig" ||
          key === "variants" ||
          key === "specifications" ||
          key === "tags" ||
          key === "careInstructions" ||
          key === "seo" ||
          key === "shipping" ||
          key === "tax" ||
          key === "dimensions" ||
          key === "primaryImageData"
        ) {
          const value = cleanedFormData[key];
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, JSON.stringify(value));
          }
        } else if (key === "category" || key === "brand" || key === "supplier" || key === "subcategory") {
          if (cleanedFormData[key]) {
            formDataToSend.append(key, cleanedFormData[key]);
          }
        } else {
          if (
            cleanedFormData[key] !== null &&
            cleanedFormData[key] !== undefined
          ) {
            formDataToSend.append(key, cleanedFormData[key]);
          }
        }
      });

      // Add color images
      Object.entries(colorImages).forEach(([colorValue, images]) => {
        images.forEach((image) => {
          if (!image.isExisting && image.file) {
            formDataToSend.append("images", image.file);
            formDataToSend.append("colorImages[]", colorValue);
          }
        });
      });

      console.log("Updating product with subcategory:", cleanedFormData.subcategory);
      console.log("Primary image data:", primaryImageData);

      // Send the request
      const result = await dispatch(
        updateProduct({
          id: productId,
          productData: formDataToSend,
        })
      ).unwrap();
      
      if (result) {
        showSuccess("Product updated successfully!");

        // Refresh the product data
        dispatch(getProduct(productId));

        setTimeout(() => {
          navigate("/admin/products");
        }, 2000);
      }
    } catch (error) {
      console.error("Product update error:", error);

      let errorMsg = "Failed to update product";
      if (typeof error === "string") {
        errorMsg = error;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.error) {
        errorMsg = error.error;
      }

      setErrors((prev) => ({ ...prev, submit: errorMsg }));
      showError(errorMsg);
    } finally {
      setIsSubmitting(false);
      setUploadingColorImages(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/products");
  };

  // Helper functions for bulk updates
  const bulkUpdateColorQuantities = (colorValue, quantity) => {
    const qtyNum = parseInt(quantity) || 0;
    const updatedQuantities = { ...colorSizeQuantities };

    formData.sizeConfig.availableSizes.forEach((size) => {
      const key = `${colorValue}_${size.value}`;
      if (updatedQuantities[key]) {
        updatedQuantities[key] = {
          ...updatedQuantities[key],
          quantity: qtyNum,
        };
      }
    });

    setColorSizeQuantities(updatedQuantities);
  };

  const bulkUpdateColorPrices = (colorValue, price) => {
    const priceNum = parseFloat(price) || null;
    const updatedQuantities = { ...colorSizeQuantities };

    formData.sizeConfig.availableSizes.forEach((size) => {
      const key = `${colorValue}_${size.value}`;
      if (updatedQuantities[key]) {
        updatedQuantities[key] = {
          ...updatedQuantities[key],
          price: priceNum,
        };
      }
    });

    setColorSizeQuantities(updatedQuantities);
  };

  // Add dimension type handler
  const handleDimensionTypeChange = (dimensionType, isChecked) => {
    setFormData((prev) => {
      const currentTypes =
        prev.sizeConfig.dimensionalConfig.dimensionTypes || [];
      let newTypes;

      if (isChecked) {
        newTypes = [...currentTypes, dimensionType];
      } else {
        newTypes = currentTypes.filter((type) => type !== dimensionType);
      }

      return {
        ...prev,
        sizeConfig: {
          ...prev.sizeConfig,
          dimensionalConfig: {
            ...prev.sizeConfig.dimensionalConfig,
            dimensionTypes: newTypes,
          },
        },
      };
    });
  };

  // Add specification handlers
  const addSpecification = () => {
    if (!newSpecification.name || !newSpecification.value) {
      setErrors((prev) => ({
        ...prev,
        specifications: "Specification name and value are required",
      }));
      return;
    }

    const specToAdd = {
      ...newSpecification,
      displayOrder: formData.specifications.length,
    };

    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, specToAdd],
    }));

    setNewSpecification({ name: "", value: "", displayOrder: 0 });
    setErrors((prev) => ({ ...prev, specifications: "" }));
  };

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) return;

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));

    setNewTag("");
  };

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const addCareInstruction = () => {
    if (!newCareInstruction.trim()) return;

    setFormData((prev) => ({
      ...prev,
      careInstructions: [...prev.careInstructions, newCareInstruction.trim()],
    }));

    setNewCareInstruction("");
  };

  const removeCareInstruction = (index) => {
    setFormData((prev) => ({
      ...prev,
      careInstructions: prev.careInstructions.filter((_, i) => i !== index),
    }));
  };

  const generateSlug = () => {
    if (!formData.name.trim()) return;

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        slug,
      },
    }));
  };

  // Loading state
  if (loading && !product) {
    return (
      <div className="container-fluid py-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading product data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !product) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h4>Error Loading Product</h4>
          <p>{error}</p>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/products")}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Edit Product: {product?.name}</h4>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
        >
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* Basic Information Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Basic Information</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="category" className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${
                      errors.category ? "is-invalid" : ""
                    }`}
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <div className="invalid-feedback">{errors.category}</div>
                  )}
                </div>

                {/* Subcategory Field */}
                <div className="col-md-6">
                  <label htmlFor="subcategory" className="form-label">
                    Subcategory
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className={`form-control ${errors.subcategory ? "is-invalid" : ""}`}
                      id="subcategory"
                      name="subcategory"
                      value={subcategorySearch}
                      onChange={handleSubcategorySearch}
                      placeholder="Type to search subcategories..."
                      autoComplete="off"
                    />
                    {availableSubcategories.length > 0 && subcategorySearch && (
                      <div className="position-absolute top-100 start-0 end-0 bg-white border rounded shadow-lg z-3 mt-1 max-h-200 overflow-y-auto">
                        {availableSubcategories
                          .filter(subcat => 
                            subcat.toLowerCase().includes(subcategorySearch.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((subcat, index) => (
                            <div
                              key={index}
                              className={`px-3 py-2 cursor-pointer ${formData.subcategory === subcat ? 'bg-primary text-white' : 'hover-bg-light'}`}
                              onClick={() => handleSubcategorySelect(subcat)}
                            >
                              {subcat}
                            </div>
                          ))}
                      </div>
                    )}
                    {formData.subcategory && (
                      <div className="mt-2">
                        <small className="text-success">
                          Selected: <strong>{formData.subcategory}</strong>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger ms-2"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, subcategory: '' }));
                              setSubcategorySearch('');
                            }}
                          >
                            Clear
                          </button>
                        </small>
                      </div>
                    )}
                  </div>
                  {errors.subcategory && <div className="invalid-feedback d-block">{errors.subcategory}</div>}
                  <div className="form-text">
                    {selectedCategoryInfo ? (
                      <span>Suggested for <strong>{selectedCategoryInfo.name}</strong></span>
                    ) : (
                      <span>Select a category first for better suggestions</span>
                    )}
                  </div>
                </div>

                {/* Quick subcategory selection */}
                {selectedCategoryInfo && availableSubcategories.length > 0 && (
                  <div className="col-12">
                    <label className="form-label">Quick Select Subcategory:</label>
                    <div className="d-flex flex-wrap gap-2">
                      {availableSubcategories.slice(0, 6).map((subcat, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`btn btn-sm ${formData.subcategory === subcat ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleSubcategorySelect(subcat)}
                        >
                          {subcat}
                        </button>
                      ))}
                      {availableSubcategories.length > 6 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            showInfo(
                              'Available Subcategories',
                              `Available subcategories for ${selectedCategoryInfo.name}:\n\n${availableSubcategories.map((sc, i) => 
                                `${i + 1}. ${sc}${formData.subcategory === sc ? ' (Selected)' : ''}`
                              ).join('\n')}`
                            );
                          }}
                        >
                          +{availableSubcategories.length - 6} more
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="col-md-6">
                  <label htmlFor="brand" className="form-label">
                    Brand
                  </label>
                  <select
                    className={`form-select ${
                      errors.brand ? "is-invalid" : ""
                    }`}
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  >
                    <option value="">Select Brand (Optional)</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brand && (
                    <div className="invalid-feedback">{errors.brand}</div>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="description" className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${
                      errors.description ? "is-invalid" : ""
                    }`}
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="shortDescription" className="form-label">
                    Short Description
                  </label>
                  <textarea
                    className="form-control"
                    id="shortDescription"
                    name="shortDescription"
                    rows="2"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    maxLength="500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Pricing</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="price" className="form-label">
                    Price <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                    
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label htmlFor="comparePrice" className="form-label">
                    Compare at Price
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      id="comparePrice"
                      name="comparePrice"
                      value={formData.comparePrice}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-text">
                    Original price before discount
                  </div>
                </div>

                <div className="col-md-4">
                  <label htmlFor="cost" className="form-label">
                    Cost per Item
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      id="cost"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-text">Your cost for this product</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Inventory</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="sku" className="form-label">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="barcode" className="form-label">
                    Barcode (ISBN, UPC, GTIN, etc.)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="lowStockThreshold" className="form-label">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                  />
                  <div className="form-text">
                    Get notified when stock is low
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="allowBackorder"
                      name="allowBackorder"
                      checked={formData.allowBackorder}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="allowBackorder">
                      Allow backorders
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Shipping</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="weight" className="form-label">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label htmlFor="dimensions.length" className="form-label">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-control"
                    id="dimensions.length"
                    name="dimensions.length"
                    value={formData.dimensions.length}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label htmlFor="dimensions.width" className="form-label">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-control"
                    id="dimensions.width"
                    name="dimensions.width"
                    value={formData.dimensions.width}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-2">
                  <label htmlFor="dimensions.height" className="form-label">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-control"
                    id="dimensions.height"
                    name="dimensions.height"
                    value={formData.dimensions.height}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="shipping.isFree"
                      name="shipping.isFree"
                      checked={formData.shipping.isFree}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="shipping.isFree">
                      Free shipping
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Size Configuration Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Size Configuration</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="sizeConfig.hasSizes"
                      name="sizeConfig.hasSizes"
                      checked={formData.sizeConfig.hasSizes}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="sizeConfig.hasSizes"
                    >
                      This product has sizes
                    </label>
                  </div>
                </div>

                {formData.sizeConfig.hasSizes && (
                  <>
                    <div className="col-md-3">
                      <label className="form-label">Size Value</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newSize.value}
                        onChange={(e) =>
                          setNewSize({ ...newSize, value: e.target.value })
                        }
                        placeholder="e.g., S, M, L"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Display Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newSize.displayText}
                        onChange={(e) =>
                          setNewSize({
                            ...newSize,
                            displayText: e.target.value,
                          })
                        }
                        placeholder="e.g., Small, Medium, Large"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Size Type</label>
                      <select
                        className="form-select"
                        value={newSize.type}
                        onChange={(e) =>
                          setNewSize({ ...newSize, type: e.target.value })
                        }
                      >
                        <option value="numeric">Numeric</option>
                        <option value="alphabetical">Alphabetical</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <button
                        type="button"
                        className="btn btn-outline-primary mt-4"
                        onClick={addSize}
                      >
                        Add Size
                      </button>
                    </div>

                    {errors.sizes && (
                      <div className="text-danger mt-2">{errors.sizes}</div>
                    )}

                    {/* Existing Sizes */}
                    {formData.sizeConfig.availableSizes.length > 0 && (
                      <div className="col-12 mt-3">
                        <h6>Added Sizes</h6>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th>Value</th>
                                <th>Display Text</th>
                                <th>Type</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData.sizeConfig.availableSizes.map(
                                (size, index) => (
                                  <tr key={index}>
                                    <td>
                                      <code>{size.value}</code>
                                    </td>
                                    <td>{size.displayText}</td>
                                    <td>{size.type}</td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeSize(index)}
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Colors & Pricing Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Colors & Pricing</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="colors.hasColors"
                      name="colors.hasColors"
                      checked={formData.colors.hasColors}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="colors.hasColors"
                    >
                      This product has multiple colors
                    </label>
                  </div>
                </div>

                {formData.colors.hasColors && (
                  <>
                    {/* Add New Color Form */}
                    <div className="col-md-3">
                      <label className="form-label">Color Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newColor.name}
                        onChange={(e) =>
                          setNewColor({ ...newColor, name: e.target.value })
                        }
                        placeholder="e.g., Red"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Color Value</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newColor.value}
                        onChange={(e) =>
                          setNewColor({ ...newColor, value: e.target.value })
                        }
                        placeholder="e.g., red"
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Hex Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newColor.hexCode}
                        onChange={(e) =>
                          setNewColor({ ...newColor, hexCode: e.target.value })
                        }
                        placeholder="#ff0000"
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Base Price</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={newColor.price}
                        onChange={(e) =>
                          setNewColor({ ...newColor, price: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary mt-4"
                        onClick={addColor}
                      >
                        Add Color
                      </button>
                    </div>

                    {errors.colors && (
                      <div className="text-danger mt-2">{errors.colors}</div>
                    )}

                    {/* Existing Colors */}
                    {formData.colors.availableColors.map(
                      (color, colorIndex) => (
                        <div
                          key={color._id || colorIndex}
                          className="col-12 mt-3"
                        >
                          <div className="card">
                            <div className="card-header bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  {color.hexCode && (
                                    <div
                                      className="color-swatch me-2"
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                        backgroundColor: color.hexCode,
                                        border: "1px solid #dee2e6",
                                        borderRadius: "3px",
                                      }}
                                    />
                                  )}
                                  <span className="fw-bold">{color.name}</span>
                                  {color.images && color.images.some(img => img.isPrimary) && (
                                    <span className="badge bg-primary ms-2">Has Primary Image</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeColor(colorIndex)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="card-body">
                              {/* Color Price */}
                              <div className="row mb-3">
                                <div className="col-md-4">
                                  <label className="form-label">
                                    Base Price
                                  </label>
                                  <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      className={`form-control ${
                                        errors[`colorPrice_${colorIndex}`]
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      value={color.price || ""}
                                      onChange={(e) =>
                                        handleColorPriceChange(
                                          colorIndex,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  {errors[`colorPrice_${colorIndex}`] && (
                                    <div className="invalid-feedback d-block">
                                      {errors[`colorPrice_${colorIndex}`]}
                                    </div>
                                  )}
                                </div>

                                <div className="col-md-4">
                                  <label className="form-label">
                                    Compare Price
                                  </label>
                                  <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      className={`form-control ${
                                        errors[
                                          `colorComparePrice_${colorIndex}`
                                        ]
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      value={color.comparePrice || ""}
                                      onChange={(e) =>
                                        handleColorPriceChange(
                                          colorIndex,
                                          "comparePrice",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  {errors[
                                    `colorComparePrice_${colorIndex}`
                                  ] && (
                                    <div className="invalid-feedback d-block">
                                      {
                                        errors[
                                          `colorComparePrice_${colorIndex}`
                                        ]
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Color Images */}
                              <div className="mb-3">
                                <label className="form-label">
                                  Upload Images
                                </label>
                                <input
                                  type="file"
                                  className="form-control"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleColorImageUpload(e, color.value)
                                  }
                                  disabled={uploadingColorImages}
                                />
                                <div className="form-text">
                                  Set primary image by clicking "Set Primary" button on an image
                                </div>
                              </div>

                              {/* Image Previews */}
                              {colorImages[color.value] &&
                                colorImages[color.value].length > 0 && (
                                  <div className="mb-3">
                                    <label className="form-label">Images</label>
                                    <div className="row g-2">
                                      {colorImages[color.value].map(
                                        (image, imgIndex) => (
                                          <div
                                            key={
                                              image._id ||
                                              image.tempId ||
                                              imgIndex
                                            }
                                            className="col-md-3 col-6"
                                          >
                                            <div
                                              className={`card ${
                                                image.isPrimary
                                                  ? "border-primary"
                                                  : ""
                                              }`}
                                            >
                                              <img
                                                src={image.url}
                                                className="card-img-top"
                                                alt={image.alt}
                                                style={{
                                                  height: "150px",
                                                  objectFit: "cover",
                                                }}
                                                crossOrigin="anonymous"
                                              />
                                              <div className="card-body p-2">
                                                <div className="d-flex flex-column gap-1">
                                                  {image.isExisting && (
                                                    <span className="badge bg-info">
                                                      Existing
                                                    </span>
                                                  )}
                                                  {image.isPrimary && (
                                                    <span className="badge bg-primary">
                                                      Primary
                                                    </span>
                                                  )}
                                                  <div className="btn-group w-100">
                                                    <button
                                                      type="button"
                                                      className={`btn btn-sm ${
                                                        image.isPrimary
                                                          ? "btn-primary"
                                                          : "btn-outline-primary"
                                                      }`}
                                                      onClick={() =>
                                                        handleSetColorPrimaryImage(
                                                          color.value,
                                                          imgIndex
                                                        )
                                                      }
                                                      disabled={
                                                        uploadingColorImages ||
                                                        image.isPrimary
                                                      }
                                                    >
                                                      {image.isPrimary
                                                        ? "Primary"
                                                        : "Set Primary"}
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-outline-danger"
                                                      onClick={() =>
                                                        removeColorImage(
                                                          color.value,
                                                          imgIndex
                                                        )
                                                      }
                                                      disabled={
                                                        uploadingColorImages
                                                      }
                                                    >
                                                      Remove
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Size-Specific Pricing */}
                              {formData.sizeConfig.hasSizes &&
                                formData.sizeConfig.availableSizes.length >
                                  0 && (
                                  <div className="mt-3">
                                    <h6>Size-Specific Pricing & Quantities</h6>

                                    {/* Bulk Actions */}
                                    <div className="row mb-3">
                                      <div className="col-md-6">
                                        <label className="form-label">
                                          Bulk Update Quantity
                                        </label>
                                        <div className="input-group">
                                          <input
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            placeholder="Set quantity for all sizes"
                                            onChange={(e) =>
                                              bulkUpdateColorQuantities(
                                                color.value,
                                                e.target.value
                                              )
                                            }
                                          />
                                          <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                              bulkUpdateColorQuantities(
                                                color.value,
                                                0
                                              )
                                            }
                                          >
                                            Set All to 0
                                          </button>
                                        </div>
                                      </div>
                                      <div className="col-md-6">
                                        <label className="form-label">
                                          Bulk Update Price
                                        </label>
                                        <div className="input-group">
                                          <span className="input-group-text">
                                            $
                                          </span>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="form-control"
                                            placeholder="Set price for all sizes"
                                            onChange={(e) =>
                                              bulkUpdateColorPrices(
                                                color.value,
                                                e.target.value
                                              )
                                            }
                                          />
                                          <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                              const basePrice =
                                                color.price || 0;
                                              if (basePrice > 0) {
                                                bulkUpdateColorPrices(
                                                  color.value,
                                                  basePrice
                                                );
                                              }
                                            }}
                                          >
                                            Reset to Base
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Size Table */}
                                    <div className="table-responsive">
                                      <table className="table table-sm table-bordered">
                                        <thead className="table-light">
                                          <tr>
                                            <th>Size</th>
                                            <th>Display</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Compare Price</th>
                                            <th>SKU</th>
                                            <th>Barcode</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {formData.sizeConfig.availableSizes.map(
                                            (size, sizeIndex) => {
                                              const key = `${color.value}_${size.value}`;
                                              const qtyData =
                                                colorSizeQuantities[key] || {};

                                              return (
                                                <tr key={sizeIndex}>
                                                  <td>
                                                    <code>{size.value}</code>
                                                  </td>
                                                  <td>{size.displayText}</td>
                                                  <td>
                                                    <input
                                                      type="number"
                                                      min="0"
                                                      className="form-control form-control-sm"
                                                      value={
                                                        qtyData.quantity || 0
                                                      }
                                                      onChange={(e) =>
                                                        handleColorSizeQuantityChange(
                                                          color.value,
                                                          size.value,
                                                          "quantity",
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <div className="input-group input-group-sm">
                                                      <span className="input-group-text">
                                                        $
                                                      </span>
                                                      <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control"
                                                        value={
                                                          qtyData.price !==
                                                            undefined &&
                                                          qtyData.price !== null
                                                            ? qtyData.price
                                                            : ""
                                                        }
                                                        onChange={(e) =>
                                                          handleColorSizeQuantityChange(
                                                            color.value,
                                                            size.value,
                                                            "price",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  </td>
                                                  <td>
                                                    <div className="input-group input-group-sm">
                                                      <span className="input-group-text">
                                                        $
                                                      </span>
                                                      <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control"
                                                        value={
                                                          qtyData.comparePrice !==
                                                            undefined &&
                                                          qtyData.comparePrice !==
                                                            null
                                                            ? qtyData.comparePrice
                                                            : ""
                                                        }
                                                        onChange={(e) =>
                                                          handleColorSizeQuantityChange(
                                                            color.value,
                                                            size.value,
                                                            "comparePrice",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="text"
                                                      className="form-control form-control-sm"
                                                      value={qtyData.sku || ""}
                                                      onChange={(e) =>
                                                        handleColorSizeQuantityChange(
                                                          color.value,
                                                          size.value,
                                                          "sku",
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <input
                                                      type="text"
                                                      className="form-control form-control-sm"
                                                      value={
                                                        qtyData.barcode || ""
                                                      }
                                                      onChange={(e) =>
                                                        handleColorSizeQuantityChange(
                                                          color.value,
                                                          size.value,
                                                          "barcode",
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                </tr>
                                              );
                                            }
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Specifications</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Specification Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newSpecification.name}
                    onChange={(e) =>
                      setNewSpecification({
                        ...newSpecification,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Material"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Value</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newSpecification.value}
                    onChange={(e) =>
                      setNewSpecification({
                        ...newSpecification,
                        value: e.target.value,
                      })
                    }
                    placeholder="e.g., 100% Cotton"
                  />
                </div>

                <div className="col-md-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary mt-4"
                    onClick={addSpecification}
                  >
                    Add Specification
                  </button>
                </div>

                {errors.specifications && (
                  <div className="text-danger mt-2">{errors.specifications}</div>
                )}

                {/* Existing Specifications */}
                {formData.specifications.length > 0 && (
                  <div className="col-12 mt-3">
                    <h6>Added Specifications</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.specifications.map((spec, index) => (
                            <tr key={index}>
                              <td>{spec.name}</td>
                              <td>{spec.value}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeSpecification(index)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Tags</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Add Tag</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g., summer, new-arrival"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={addTag}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Existing Tags */}
                {formData.tags.length > 0 && (
                  <div className="col-12 mt-3">
                    <h6>Added Tags</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="badge bg-secondary">
                          {tag}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            style={{ fontSize: "0.6rem" }}
                            onClick={() => removeTag(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">SEO Settings</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="seo.title" className="form-label">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="seo.title"
                    name="seo.title"
                    value={formData.seo.title}
                    onChange={handleChange}
                    maxLength="60"
                  />
                  <div className="form-text">
                    Recommended: 50-60 characters
                  </div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="seo.slug" className="form-label">
                    SEO Slug
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="seo.slug"
                      name="seo.slug"
                      value={formData.seo.slug}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={generateSlug}
                    >
                      Generate
                    </button>
                  </div>
                  <div className="form-text">
                    URL-friendly version of the name
                  </div>
                </div>

                <div className="col-12">
                  <label htmlFor="seo.description" className="form-label">
                    SEO Description
                  </label>
                  <textarea
                    className="form-control"
                    id="seo.description"
                    name="seo.description"
                    rows="3"
                    value={formData.seo.description}
                    onChange={handleChange}
                    maxLength="160"
                  />
                  <div className="form-text">
                    Recommended: 150-160 characters
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Status Section */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Product Status</h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="isActive">
                  Active
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="isFeatured">
                  Featured Product
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isNew"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="isNew">
                  New Arrival
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isBestSeller"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="isBestSeller">
                  Best Seller
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Additional Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="material" className="form-label">
                  Material
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="e.g., Cotton, Polyester"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Care Instructions</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={newCareInstruction}
                    onChange={(e) => setNewCareInstruction(e.target.value)}
                    placeholder="e.g., Machine wash cold"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCareInstruction();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addCareInstruction}
                  >
                    Add
                  </button>
                </div>

                {formData.careInstructions.length > 0 && (
                  <div className="mt-2">
                    <ul className="list-group">
                      {formData.careInstructions.map((instruction, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {instruction}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeCareInstruction(index)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tax Section */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Tax Settings</h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="tax.taxable"
                  name="tax.taxable"
                  checked={formData.tax.taxable}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="tax.taxable">
                  Taxable
                </label>
              </div>

              <div className="mb-3">
                <label htmlFor="tax.taxCode" className="form-label">
                  Tax Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="tax.taxCode"
                  name="tax.taxCode"
                  value={formData.tax.taxCode}
                  onChange={handleChange}
                  placeholder="e.g., GST, VAT"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || uploadingColorImages}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Product"
                    )}
                  </button>
                </div>
              </div>

              {errors.submit && (
                <div className="alert alert-danger mt-3">{errors.submit}</div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;