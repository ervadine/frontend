import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getAllSubcategories, 
  getSubcategorySuggestions 
} from '../../helpers/SubcategoryHelper';
import {
  createProduct,
  selectLoading,
  selectError,
  selectSuccess,
  clearError,
  clearSuccess
} from '../../store/redux/productSlice';
import { 
  fetchCategories, 
  selectCategories,  
  selectCategoryLoading,
  selectCategoryError,
} from '../../store/redux/categorySlice';
import {
  fetchBrands,
  selectBrands,
  selectBrandLoading,
  selectBrandError,
} from '../../store/redux/brandSlice';
import useSweetAlert from '../../hooks/useSweetAlert';

const ProductForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux selectors
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  
  // Categories selectors
  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectCategoryLoading);
  const categoriesError = useSelector(selectCategoryError);
  
  // Brands selectors
  const brands = useSelector(selectBrands);
  const brandsLoading = useSelector(selectBrandLoading);
  const brandsError = useSelector(selectBrandError);
  
  const { 
    success: showSuccess, 
    error: showError, 
    warning: showWarning, 
    info: showInfo, 
    confirm: showConfirm 
  } = useSweetAlert();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    sizeConfig: {
      hasSizes: false,
      type: 'clothing',
      availableSizes: [],
      dimensionalConfig: {
        hasDimensions: false,
        dimensionTypes: []
      }
    },
    colors: {
      hasColors: false,
      availableColors: []
    },
    sku: '',
    barcode: '',
    quantity: 0,
    lowStockThreshold: 5,
    trackQuantity: true,
    allowBackorder: false,
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    category: '',
    subcategory: '',
    brand: '',
    variants: [],
    tags: [],
    specifications: [],
    isFeatured: false,
    isActive: true,
    seo: {
      title: '',
      description: '',
      slug: ''
    },
    defaultSize: '',
    defaultColor: '',
    material: '',
    careInstructions: [],
    shipping: {
      isFree: false,
      weightBasedShipping: false,
      fixedCost: ''
    },
    tax: {
      taxable: true,
      taxCode: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [newColor, setNewColor] = useState({ 
    name: '', 
    value: '', 
    hexCode: '',
    price: '',
    comparePrice: '',
    displayOrder: 0,
    quantityConfig: {
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 5,
      quantities: [],
      totalQuantity: 0,
      availableQuantity: 0,
      inStock: false,
      isLowStock: false
    }
  });
  const [newSize, setNewSize] = useState({ 
    value: '', 
    displayText: '', 
    type: 'alphabetic',
    dimensions: {
      waist: '',
      length: '',
      chest: '',
      sleeve: '',
      hip: '',
      inseam: ''
    }
  });
  const [newTag, setNewTag] = useState('');
  const [newSpecification, setNewSpecification] = useState({ name: '', value: '' });
  const [newCareInstruction, setNewCareInstruction] = useState('');
  
  // Color Images State
  const [colorImages, setColorImages] = useState({});
  const [colorImageFiles, setColorImageFiles] = useState({});
  
  // Color-Size Quantities State
  const [colorSizeQuantities, setColorSizeQuantities] = useState({});
  
  const [dimensionalConfig, setDimensionalConfig] = useState({
    hasDimensions: false,
    dimensionTypes: ['waist', 'length']
  });

  // Subcategory handling
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);
  const [subcategorySearch, setSubcategorySearch] = useState('');

  // Load categories and brands
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

  // Update available subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      setSelectedCategoryInfo(selectedCategory);
      
      if (selectedCategory) {
        const suggestedSubcategories = getSubcategorySuggestions(selectedCategory.name);
        setAvailableSubcategories(suggestedSubcategories);
        
        if (formData.subcategory && !suggestedSubcategories.includes(formData.subcategory)) {
          setFormData(prev => ({ ...prev, subcategory: '' }));
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

  // Handle success
  useEffect(() => {
    if (success) {
      showSuccess('Product created successfully!');
      dispatch(clearSuccess());
      
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    }
  }, [success, dispatch, showSuccess, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch, showError]);

  // Handle categories loading error
  useEffect(() => {
    if (categoriesError) {
      showError(`Failed to load categories: ${categoriesError}`);
    }
  }, [categoriesError, showError]);

  // Handle brands loading error
  useEffect(() => {
    if (brandsError) {
      showError(`Failed to load brands: ${brandsError}`);
    }
  }, [brandsError, showError]);

  // Initialize color-size quantities when colors or sizes change
  useEffect(() => {
    if (formData.colors.hasColors && formData.sizeConfig.hasSizes) {
      const initialQuantities = {};
      
      formData.colors.availableColors.forEach(color => {
        formData.sizeConfig.availableSizes.forEach(size => {
          const key = `${color.value}_${size.value}`;
          if (!colorSizeQuantities[key]) {
            initialQuantities[key] = {
              quantity: 0,
              price: color.price || 0,
              comparePrice: color.comparePrice || null,
              sku: '',
              barcode: '',
              lowStockThreshold: formData.lowStockThreshold || 5
            };
          }
        });
      });
      
      setColorSizeQuantities(prev => ({
        ...prev,
        ...initialQuantities
      }));
    }
  }, [formData.colors.availableColors, formData.sizeConfig.availableSizes]);

  // Update product type when size type changes
  useEffect(() => {
    if (formData.sizeConfig.type === 'pants') {
      setFormData(prev => ({
        ...prev,
        sizeConfig: {
          ...prev.sizeConfig,
          dimensionalConfig: {
            hasDimensions: true,
            dimensionTypes: ['waist', 'length']
          }
        }
      }));
      setDimensionalConfig({
        hasDimensions: true,
        dimensionTypes: ['waist', 'length']
      });
    } else {
      setFormData(prev => ({
        ...prev,
        sizeConfig: {
          ...prev.sizeConfig,
          dimensionalConfig: {
            hasDimensions: false,
            dimensionTypes: []
          }
        }
      }));
      setDimensionalConfig({
        hasDimensions: false,
        dimensionTypes: []
      });
    }
  }, [formData.sizeConfig.type]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else if (name.includes('dimensions.')) {
      const dimensionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionField]: value
        }
      }));
    } else {
      let processedValue = type === 'checkbox' ? checked : value;
      
      if (type === 'number') {
        processedValue = value === '' ? '' : parseFloat(value);
      }
      
      if (name === 'quantity') {
        processedValue = value === '' ? 0 : parseInt(value) || 0;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle subcategory search
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
    setSubcategorySearch('');
  };

  // Color Images Handling
  const handleColorImageUpload = (e, colorValue) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const newPreviews = files.map((file, index) => ({
      url: URL.createObjectURL(file),
      file: file,
      isPrimary: (colorImages[colorValue] ? colorImages[colorValue].length === 0 : true) && index === 0,
      displayOrder: (colorImages[colorValue]?.length || 0) + index
    }));

    setColorImages(prev => ({
      ...prev,
      [colorValue]: [...(prev[colorValue] || []), ...newPreviews]
    }));

    setColorImageFiles(prev => ({
      ...prev,
      [colorValue]: [...(prev[colorValue] || []), ...files]
    }));

    e.target.value = '';
  };

  const removeColorImage = (colorValue, index) => {
    setColorImages(prev => ({
      ...prev,
      [colorValue]: prev[colorValue].filter((_, i) => i !== index)
    }));

    setColorImageFiles(prev => ({
      ...prev,
      [colorValue]: prev[colorValue].filter((_, i) => i !== index)
    }));
  };

  const setColorPrimaryImage = (colorValue, index) => {
    setColorImages(prev => ({
      ...prev,
      [colorValue]: prev[colorValue].map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  // Color-Size Quantity Handling
  const handleColorSizeQuantityChange = (colorValue, sizeValue, field, value) => {
    const key = `${colorValue}_${sizeValue}`;
    let processedValue = value;
    
    if (field === 'quantity') {
      processedValue = value === '' ? 0 : parseInt(value) || 0;
    } else if (field === 'price' || field === 'comparePrice') {
      if (value === '' || value === null || value === undefined) {
        processedValue = '';
      } else {
        const num = parseFloat(value);
        processedValue = isNaN(num) ? '' : num;
      }
    } else {
      processedValue = value;
    }
    
    setColorSizeQuantities(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: processedValue
      }
    }));
  };

  const calculateColorTotalQuantity = (colorValue) => {
    if (!formData.sizeConfig.hasSizes || !formData.colors.hasColors) {
      return 0;
    }
    
    let total = 0;
    
    formData.sizeConfig.availableSizes.forEach(size => {
      const key = `${colorValue}_${size.value}`;
      const quantityData = colorSizeQuantities[key];
      
      if (quantityData && quantityData.quantity !== undefined) {
        const qty = Number(quantityData.quantity);
        total += isNaN(qty) ? 0 : qty;
      }
    });
    
    return total;
  };

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setNewColor(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (e) => {
    const { name, value } = e.target;
    setNewSize(prev => ({ ...prev, [name]: value }));
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    const dimensionField = name.replace('dimension-', '');
    
    setNewSize(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimensionField]: value
      }
    }));
  };

  const handleSizeTypeChange = (e) => {
    const { value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      sizeConfig: {
        ...prev.sizeConfig,
        type: value
      }
    }));

    if (value === 'pants') {
      setDimensionalConfig({
        hasDimensions: true,
        dimensionTypes: ['waist', 'length']
      });
      setNewSize(prev => ({ ...prev, type: 'composite' }));
    } else {
      setDimensionalConfig({
        hasDimensions: false,
        dimensionTypes: []
      });
      setNewSize(prev => ({ ...prev, type: 'alphabetic' }));
    }
  };

  const handleDimensionTypeChange = (dimensionType, isChecked) => {
    setDimensionalConfig(prev => {
      const newDimensionTypes = isChecked 
        ? [...prev.dimensionTypes, dimensionType]
        : prev.dimensionTypes.filter(type => type !== dimensionType);
      
      setFormData(prev => ({
        ...prev,
        sizeConfig: {
          ...prev.sizeConfig,
          dimensionalConfig: {
            hasDimensions: newDimensionTypes.length > 0,
            dimensionTypes: newDimensionTypes
          }
        }
      }));
      
      return {
        ...prev,
        hasDimensions: newDimensionTypes.length > 0,
        dimensionTypes: newDimensionTypes
      };
    });
  };

  // Auto-generate value and display text when dimensions change
  useEffect(() => {
    if (newSize.type === 'composite' && dimensionalConfig.hasDimensions) {
      const dimensions = [];
      const displayParts = [];
      
      if (newSize.dimensions.waist && dimensionalConfig.dimensionTypes.includes('waist')) {
        dimensions.push(newSize.dimensions.waist);
        displayParts.push(`${newSize.dimensions.waist}W`);
      }
      if (newSize.dimensions.length && dimensionalConfig.dimensionTypes.includes('length')) {
        dimensions.push(newSize.dimensions.length);
        displayParts.push(`${newSize.dimensions.length}L`);
      }
      if (newSize.dimensions.chest && dimensionalConfig.dimensionTypes.includes('chest')) {
        dimensions.push(newSize.dimensions.chest);
        displayParts.push(`${newSize.dimensions.chest}C`);
      }
      if (newSize.dimensions.sleeve && dimensionalConfig.dimensionTypes.includes('sleeve')) {
        dimensions.push(newSize.dimensions.sleeve);
        displayParts.push(`${newSize.dimensions.sleeve}S`);
      }
      if (newSize.dimensions.hip && dimensionalConfig.dimensionTypes.includes('hip')) {
        dimensions.push(newSize.dimensions.hip);
        displayParts.push(`${newSize.dimensions.hip}H`);
      }
      if (newSize.dimensions.inseam && dimensionalConfig.dimensionTypes.includes('inseam')) {
        dimensions.push(newSize.dimensions.inseam);
        displayParts.push(`${newSize.dimensions.inseam}I`);
      }
      
      if (dimensions.length > 0) {
        const generatedValue = dimensions.join('x');
        const generatedDisplayText = displayParts.join(' x ');
        
        setNewSize(prev => ({
          ...prev,
          value: generatedValue,
          displayText: generatedDisplayText
        }));
      } else {
        setNewSize(prev => ({
          ...prev,
          value: '',
          displayText: ''
        }));
      }
    }
  }, [newSize.dimensions, newSize.type, dimensionalConfig]);

  const addColor = () => {
    if (!newColor.name || !newColor.value) {
      setErrors(prev => ({ ...prev, colors: 'Color name and value are required' }));
      return;
    }

    if (!newColor.price || parseFloat(newColor.price) <= 0) {
      setErrors(prev => ({ ...prev, colors: 'Valid price is required for each color' }));
      return;
    }

    if (newColor.comparePrice && parseFloat(newColor.comparePrice) < parseFloat(newColor.price)) {
      setErrors(prev => ({ ...prev, colors: 'Compare price must be greater than or equal to price' }));
      return;
    }

    if (newColor.hexCode && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor.hexCode)) {
      setErrors(prev => ({ ...prev, colors: 'Invalid hex code format' }));
      return;
    }

    const isDuplicate = formData.colors.availableColors.some(
      color => color.value.toLowerCase() === newColor.value.toLowerCase()
    );

    if (isDuplicate) {
      setErrors(prev => ({ ...prev, colors: 'Color value already exists' }));
      return;
    }

    const colorWithDisplayOrder = {
      ...newColor,
      price: parseFloat(newColor.price),
      comparePrice: newColor.comparePrice ? parseFloat(newColor.comparePrice) : null,
      displayOrder: formData.colors.availableColors.length,
      images: []
    };

    setFormData(prev => ({
      ...prev,
      colors: {
        hasColors: true,
        availableColors: [...prev.colors.availableColors, colorWithDisplayOrder]
      }
    }));

    setColorImages(prev => ({
      ...prev,
      [newColor.value]: []
    }));

    setColorImageFiles(prev => ({
      ...prev,
      [newColor.value]: []
    }));

    if (formData.sizeConfig.hasSizes) {
      const newQuantities = {};
      formData.sizeConfig.availableSizes.forEach(size => {
        const key = `${newColor.value}_${size.value}`;
        newQuantities[key] = {
          quantity: 0,
          price: parseFloat(newColor.price),
          comparePrice: newColor.comparePrice ? parseFloat(newColor.comparePrice) : null,
          sku: '',
          barcode: '',
          lowStockThreshold: formData.lowStockThreshold || 5
        };
      });
      
      setColorSizeQuantities(prev => ({
        ...prev,
        ...newQuantities
      }));
    }

    setNewColor({ 
      name: '', 
      value: '', 
      hexCode: '',
      price: '',
      comparePrice: '',
      displayOrder: 0,
      quantityConfig: {
        trackQuantity: true,
        allowBackorder: false,
        lowStockThreshold: 5,
        quantities: [],
        totalQuantity: 0,
        availableQuantity: 0,
        inStock: false,
        isLowStock: false
      }
    });
    setErrors(prev => ({ ...prev, colors: '' }));
  };

  const removeColor = (index) => {
    const colorToRemove = formData.colors.availableColors[index];
    
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        availableColors: prev.colors.availableColors.filter((_, i) => i !== index)
      }
    }));

    setColorImages(prev => {
      const newColorImages = { ...prev };
      delete newColorImages[colorToRemove.value];
      return newColorImages;
    });

    setColorImageFiles(prev => {
      const newColorImageFiles = { ...prev };
      delete newColorImageFiles[colorToRemove.value];
      return newColorImageFiles;
    });

    setColorSizeQuantities(prev => {
      const newQuantities = { ...prev };
      Object.keys(newQuantities).forEach(key => {
        if (key.startsWith(`${colorToRemove.value}_`)) {
          delete newQuantities[key];
        }
      });
      return newQuantities;
    });
  };

  const addSize = () => {
    if (!newSize.value.trim() || !newSize.displayText.trim()) {
      setErrors(prev => ({ ...prev, sizes: 'Size value and display text are required' }));
      return;
    }

    if (newSize.type === 'composite') {
      const hasValidDimensions = dimensionalConfig.dimensionTypes.some(
        dimType => newSize.dimensions[dimType] && newSize.dimensions[dimType].trim() !== ''
      );
      if (!hasValidDimensions) {
        setErrors(prev => ({ ...prev, sizes: 'At least one dimension is required for composite sizes' }));
        return;
      }
    }

    const isDuplicate = formData.sizeConfig.availableSizes.some(
      size => size.value.toLowerCase() === newSize.value.toLowerCase()
    );

    if (isDuplicate) {
      setErrors(prev => ({ ...prev, sizes: 'Size value already exists' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      sizeConfig: {
        ...prev.sizeConfig,
        hasSizes: true,
        availableSizes: [...prev.sizeConfig.availableSizes, { ...newSize }],
        dimensionalConfig: dimensionalConfig
      }
    }));

    if (formData.colors.hasColors) {
      const newQuantities = {};
      formData.colors.availableColors.forEach(color => {
        const key = `${color.value}_${newSize.value}`;
        newQuantities[key] = {
          quantity: 0,
          price: color.price || 0,
          comparePrice: color.comparePrice || null,
          sku: '',
          barcode: '',
          lowStockThreshold: formData.lowStockThreshold || 5
        };
      });
      
      setColorSizeQuantities(prev => ({
        ...prev,
        ...newQuantities
      }));
    }

    setNewSize({ 
      value: '', 
      displayText: '', 
      type: dimensionalConfig.hasDimensions ? 'composite' : 'alphabetic',
      dimensions: {
        waist: '',
        length: '',
        chest: '',
        sleeve: '',
        hip: '',
        inseam: ''
      }
    });
    setErrors(prev => ({ ...prev, sizes: '' }));
  };

  const removeSize = (index) => {
    const sizeToRemove = formData.sizeConfig.availableSizes[index];
    
    setFormData(prev => ({
      ...prev,
      sizeConfig: {
        ...prev.sizeConfig,
        availableSizes: prev.sizeConfig.availableSizes.filter((_, i) => i !== index)
      }
    }));

    setColorSizeQuantities(prev => {
      const newQuantities = { ...prev };
      Object.keys(newQuantities).forEach(key => {
        if (key.endsWith(`_${sizeToRemove.value}`)) {
          delete newQuantities[key];
        }
      });
      return newQuantities;
    });
  };

  const addTag = () => {
    if (!newTag.trim()) return;

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));

    setNewTag('');
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addCareInstruction = () => {
    if (!newCareInstruction.trim()) return;

    setFormData(prev => ({
      ...prev,
      careInstructions: [...prev.careInstructions, newCareInstruction.trim()]
    }));

    setNewCareInstruction('');
  };

  const removeCareInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      careInstructions: prev.careInstructions.filter((_, i) => i !== index)
    }));
  };

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;
    setNewSpecification(prev => ({ ...prev, [name]: value }));
  };

  const addSpecification = () => {
    if (!newSpecification.name || !newSpecification.value) return;

    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { ...newSpecification }]
    }));

    setNewSpecification({ name: '', value: '' });
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.subcategory && !allSubcategories.includes(formData.subcategory)) {
      newErrors.subcategory = 'Invalid subcategory selected';
    }

    if (formData.colors.hasColors && formData.colors.availableColors.length === 0) {
      newErrors.colors = 'At least one color is required when colors are enabled';
    }

    if (formData.colors.hasColors) {
      formData.colors.availableColors.forEach((color, index) => {
        if (!color.price || isNaN(color.price) || color.price <= 0) {
          newErrors[`colorPrice_${index}`] = `Valid price is required for ${color.name}`;
        }
        if (color.comparePrice && color.comparePrice < color.price) {
          newErrors[`colorComparePrice_${index}`] = `Compare price must be greater than or equal to price for ${color.name}`;
        }
      });
    }

    if (formData.sizeConfig.hasSizes && formData.sizeConfig.availableSizes.length === 0) {
      newErrors.sizes = 'At least one size is required when sizes are enabled';
    }

    if (formData.colors.hasColors && formData.sizeConfig.hasSizes) {
      let hasQuantityError = false;
      let hasPriceError = false;
      const colorSizeErrors = [];
      const priceErrors = [];
      
      formData.colors.availableColors.forEach((color, colorIndex) => {
        formData.sizeConfig.availableSizes.forEach((size, sizeIndex) => {
          const key = `${color.value}_${size.value}`;
          const quantity = colorSizeQuantities[key]?.quantity || 0;
          const price = colorSizeQuantities[key]?.price;
          
          if (quantity < 0) {
            hasQuantityError = true;
            colorSizeErrors.push(`${color.name} - ${size.displayText}: Quantity cannot be negative`);
          }
          
          if (price !== undefined && price !== null && price !== '') {
            const priceNum = parseFloat(price);
            if (isNaN(priceNum) || priceNum <= 0) {
              hasPriceError = true;
              priceErrors.push(`${color.name} - ${size.displayText}: Price must be greater than 0`);
            }
          }
        });
      });
      
      if (hasQuantityError) {
        newErrors.colorSizeQuantities = colorSizeErrors.join(', ');
      }
      if (hasPriceError) {
        newErrors.colorSizePrices = priceErrors.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareFormData = () => {
    const submitData = new FormData();
    
    submitData.append('name', formData.name.trim());
    submitData.append('description', formData.description.trim());
    if (formData.shortDescription) {
      submitData.append('shortDescription', formData.shortDescription.trim());
    }
    submitData.append('category', formData.category);
    
    // ADDED: Append subcategory if provided
    if (formData.subcategory) {
      submitData.append('subcategory', formData.subcategory);
    }
    
    const quantityValue = formData.quantity === '' ? 0 : parseInt(formData.quantity);
    submitData.append('quantity', quantityValue);
    
    submitData.append('lowStockThreshold', parseInt(formData.lowStockThreshold) || 5);
    submitData.append('trackQuantity', formData.trackQuantity);
    submitData.append('allowBackorder', formData.allowBackorder);
    submitData.append('isFeatured', formData.isFeatured);
    submitData.append('isActive', formData.isActive);
    
    if (formData.brand) {
      submitData.append('brand', formData.brand);
    }
    if (formData.sku) {
      submitData.append('sku', formData.sku.trim());
    }
    if (formData.barcode) {
      submitData.append('barcode', formData.barcode.trim());
    }
    if (formData.material) {
      submitData.append('material', formData.material);
    }
    
    const colorsWithQuantities = formData.colors.availableColors.map(color => {
      const colorTotalQuantity = calculateColorTotalQuantity(color.value);
      const colorQuantityConfig = {
        ...color.quantityConfig,
        quantities: [],
        totalQuantity: colorTotalQuantity,
        availableQuantity: colorTotalQuantity,
        inStock: colorTotalQuantity > 0,
        isLowStock: colorTotalQuantity > 0 && colorTotalQuantity <= color.quantityConfig.lowStockThreshold
      };

      if (formData.sizeConfig.hasSizes) {
        formData.sizeConfig.availableSizes.forEach(size => {
          const key = `${color.value}_${size.value}`;
          const sizeQuantity = colorSizeQuantities[key];
          if (sizeQuantity) {
            const sizePrice = sizeQuantity.price !== '' && sizeQuantity.price !== null 
              ? parseFloat(sizeQuantity.price) 
              : color.price;
            const sizeComparePrice = sizeQuantity.comparePrice !== '' && sizeQuantity.comparePrice !== null 
              ? parseFloat(sizeQuantity.comparePrice) 
              : color.comparePrice;
            
            colorQuantityConfig.quantities.push({
              size: { value: size.value, displayText: size.displayText },
              displayText: size.displayText,
              quantity: sizeQuantity.quantity || 0,
              price: sizePrice,
              comparePrice: sizeComparePrice,
              sku: sizeQuantity.sku || '',
              barcode: sizeQuantity.barcode || '',
              lowStockThreshold: sizeQuantity.lowStockThreshold || formData.lowStockThreshold,
              isLowStock: (sizeQuantity.quantity || 0) > 0 && (sizeQuantity.quantity || 0) <= (sizeQuantity.lowStockThreshold || formData.lowStockThreshold),
              inStock: (sizeQuantity.quantity || 0) > 0
            });
          }
        });
      }

      return {
        ...color,
        price: typeof color.price === 'number' ? color.price : parseFloat(color.price),
        comparePrice: color.comparePrice ? (typeof color.comparePrice === 'number' ? color.comparePrice : parseFloat(color.comparePrice)) : null,
        quantityConfig: colorQuantityConfig,
        images: []
      };
    });

    const variants = [];
    if (formData.colors.hasColors && formData.sizeConfig.hasSizes) {
      formData.colors.availableColors.forEach(color => {
        formData.sizeConfig.availableSizes.forEach(size => {
          const key = `${color.value}_${size.value}`;
          const quantityData = colorSizeQuantities[key];
          if (quantityData) {
            const sizePrice = quantityData.price !== '' && quantityData.price !== null 
              ? parseFloat(quantityData.price) 
              : color.price;
            const sizeComparePrice = quantityData.comparePrice !== '' && quantityData.comparePrice !== null 
              ? parseFloat(quantityData.comparePrice) 
              : color.comparePrice;
            
            variants.push({
              size: {
                value: size.value,
                displayText: size.displayText
              },
              color: {
                name: color.name,
                value: color.value,
                hexCode: color.hexCode
              },
              price: sizePrice,
              comparePrice: sizeComparePrice,
              quantity: quantityData.quantity || 0,
              sku: quantityData.sku || '',
              barcode: quantityData.barcode || '',
              weight: formData.weight,
              dimensions: formData.dimensions
            });
          }
        });
      });
    }

    submitData.append('sizeConfig', JSON.stringify(formData.sizeConfig));
    submitData.append('colors', JSON.stringify({
      hasColors: formData.colors.hasColors,
      availableColors: colorsWithQuantities
    }));
    submitData.append('variants', JSON.stringify(variants));
    
    submitData.append('tags', JSON.stringify(formData.tags));
    submitData.append('specifications', JSON.stringify(formData.specifications));
    submitData.append('careInstructions', JSON.stringify(formData.careInstructions));
    
    submitData.append('seo', JSON.stringify(formData.seo));
    submitData.append('shipping', JSON.stringify(formData.shipping));
    submitData.append('tax', JSON.stringify(formData.tax));
    
    if (formData.weight) {
      submitData.append('weight', parseFloat(formData.weight));
    }
    if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
      submitData.append('dimensions', JSON.stringify({
        length: parseFloat(formData.dimensions.length) || 0,
        width: parseFloat(formData.dimensions.width) || 0,
        height: parseFloat(formData.dimensions.height) || 0
      }));
    }
    if (formData.defaultSize) {
      submitData.append('defaultSize', formData.defaultSize);
    }
    if (formData.defaultColor) {
      submitData.append('defaultColor', formData.defaultColor);
    }

    const colorImagesMapping = [];
    let allImageFiles = [];
    
    Object.entries(colorImageFiles).forEach(([colorValue, files]) => {
      if (files && files.length > 0) {
        allImageFiles.push(...files);
        
        files.forEach(() => {
          colorImagesMapping.push(colorValue);
        });
      }
    });

    allImageFiles.forEach(file => {
      submitData.append('images', file);
    });

    if (colorImagesMapping.length > 0) {
      submitData.append('colorImages', JSON.stringify(colorImagesMapping));
    }

    return submitData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showWarning('Please fix the form errors before submitting.');
      return;
    }

    try {
      const submitData = prepareFormData();
      
      await dispatch(createProduct(submitData)).unwrap();

    } catch (error) {
      console.error('Form submission error:', error);
      showError(error.message || 'Failed to create product');
    }
  };

  const generateSlug = () => {
    if (!formData.name.trim()) {
      showWarning('Please enter a product name first');
      return;
    }

    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        slug
      }
    }));
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const bulkUpdateColorQuantities = (colorValue, quantity) => {
    const updatedQuantities = { ...colorSizeQuantities };
    const qtyNum = parseInt(quantity) || 0;
    
    formData.sizeConfig.availableSizes.forEach(size => {
      const key = `${colorValue}_${size.value}`;
      if (updatedQuantities[key]) {
        updatedQuantities[key] = {
          ...updatedQuantities[key],
          quantity: qtyNum
        };
      }
    });
    
    setColorSizeQuantities(updatedQuantities);
  };

  const bulkUpdateColorPrices = (colorValue, price) => {
    const updatedQuantities = { ...colorSizeQuantities };
    const priceNum = parseFloat(price) || '';
    
    if (priceNum !== '' && priceNum <= 0) {
      showWarning('Please enter a valid price greater than 0');
      return;
    }
    
    formData.sizeConfig.availableSizes.forEach(size => {
      const key = `${colorValue}_${size.value}`;
      if (updatedQuantities[key]) {
        updatedQuantities[key] = {
          ...updatedQuantities[key],
          price: priceNum
        };
      }
    });
    
    setColorSizeQuantities(updatedQuantities);
  };

  return (
    <div className='section'>
      <div className="container-fluid">
        <form onSubmit={handleSubmit} className="row g-4" encType="multipart/form-data">
          {/* Basic Information */}
          <div className="col-12">
            <div className="card">
              <div className="card-header">
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
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">Select Category</option>
                      {categoriesLoading ? (
                        <option value="" disabled>Loading categories...</option>
                      ) : (
                        categories.map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name} {cat.sex ? `(${cat.sex})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                    {categoriesLoading && <div className="form-text">Loading categories...</div>}
                  </div>

                  {/* Subcategory Field */}
                  <div className="col-md-6">
                    <label htmlFor="subcategory" className="form-label">
                      Subcategory
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className={`form-control ${errors.subcategory ? 'is-invalid' : ''}`}
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
                      <label className="form-label">Quick Select:</label>
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
                              const subcatList = availableSubcategories.join('\n');
                              showInfo(
                                'Available Subcategories',
                                `<div class="text-start"><small>${availableSubcategories.map((sc, i) => 
                                  `<div class="mb-1 ${formData.subcategory === sc ? 'text-primary fw-bold' : ''}">${i + 1}. ${sc}</div>`
                                ).join('')}</small></div>`,
                                'info'
                              );
                            }}
                          >
                            +{availableSubcategories.length - 6} more
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <label htmlFor="description" className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
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
                      placeholder="Brief description for product listings"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colors Configuration with Image Upload */}
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Colors Configuration</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="colors.hasColors"
                        name="colors.hasColors"
                        checked={formData.colors.hasColors}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="colors.hasColors">
                        This product has colors
                      </label>
                    </div>
                  </div>

                  {formData.colors.hasColors && (
                    <>
                      <div className="col-12">
                        <h6>Add New Color</h6>
                        <div className="row g-2 align-items-end">
                          <div className="col-md-2">
                            <label htmlFor="colorName" className="form-label">Color Name</label>
                            <input
                              type="text"
                              className="form-control"
                              id="colorName"
                              name="name"
                              value={newColor.name}
                              onChange={handleColorChange}
                              placeholder="e.g., Red, Blue, Black"
                            />
                          </div>
                          <div className="col-md-2">
                            <label htmlFor="colorValue" className="form-label">Color Value</label>
                            <input
                              type="text"
                              className="form-control"
                              id="colorValue"
                              name="value"
                              value={newColor.value}
                              onChange={handleColorChange}
                              placeholder="e.g., red, blue, black"
                            />
                          </div>
                          <div className="col-md-2">
                            <label htmlFor="hexCode" className="form-label">Hex Code</label>
                            <input
                              type="text"
                              className="form-control"
                              id="hexCode"
                              name="hexCode"
                              value={newColor.hexCode}
                              onChange={handleColorChange}
                              placeholder="#ff0000"
                            />
                          </div>
                          <div className="col-md-2">
                            <label htmlFor="colorPrice" className="form-label">
                              Price <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                id="colorPrice"
                                name="price"
                                value={newColor.price}
                                onChange={handleColorChange}
                                min="0.01"
                              />
                            </div>
                          </div>
                          <div className="col-md-2">
                            <label htmlFor="colorComparePrice" className="form-label">Compare Price</label>
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                id="colorComparePrice"
                                name="comparePrice"
                                value={newColor.comparePrice}
                                onChange={handleColorChange}
                                min="0.01"
                              />
                            </div>
                          </div>
                          <div className="col-md-2">
                            <button
                              type="button"
                              className="btn btn-primary w-100"
                              onClick={addColor}
                            >
                              Add Color
                            </button>
                          </div>
                        </div>
                        {errors.colors && <div className="text-danger mt-2">{errors.colors}</div>}
                      </div>

                      {formData.colors.availableColors.length > 0 && (
                        <div className="col-12">
                          <h6>Available Colors & Images</h6>
                          <div className="row g-3">
                            {formData.colors.availableColors.map((color, index) => (
                              <div key={index} className="col-12">
                                <div className="card">
                                  <div className="card-header bg-light">
                                    <div className="d-flex align-items-center justify-content-between">
                                      <div className="d-flex align-items-center">
                                        {color.hexCode && (
                                          <div 
                                            className="color-swatch me-2"
                                            style={{
                                              width: '20px',
                                              height: '20px',
                                              backgroundColor: color.hexCode,
                                              border: '1px solid #dee2e6',
                                              borderRadius: '3px'
                                            }}
                                            title={color.hexCode}
                                          />
                                        )}
                                        <div>
                                          <div className="fw-bold">{color.name}</div>
                                          <div className="text-muted small">{color.value}</div>
                                          <div className="small">
                                            <strong>Price:</strong> ${typeof color.price === 'number' ? color.price.toFixed(2) : parseFloat(color.price).toFixed(2)}
                                            {color.comparePrice && (
                                              <span className="text-muted ms-2">
                                                <s>${typeof color.comparePrice === 'number' ? color.comparePrice.toFixed(2) : parseFloat(color.comparePrice).toFixed(2)}</s>
                                              </span>
                                            )}
                                            {errors[`colorPrice_${index}`] && (
                                              <div className="text-danger small">{errors[`colorPrice_${index}`]}</div>
                                            )}
                                            {errors[`colorComparePrice_${index}`] && (
                                              <div className="text-danger small">{errors[`colorComparePrice_${index}`]}</div>
                                            )}
                                          </div>
                                          <div className="small">
                                            Total Quantity: {calculateColorTotalQuantity(color.value)}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeColor(index)}
                                      >
                                        Remove Color
                                      </button>
                                    </div>
                                  </div>
                                  <div className="card-body">
                                    <div className="mb-3">
                                      <label htmlFor={`color-images-${color.value}`} className="form-label">
                                        Upload Images for {color.name}
                                      </label>
                                      <input
                                        type="file"
                                        className="form-control"
                                        id={`color-images-${color.value}`}
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleColorImageUpload(e, color.value)}
                                      />
                                      <div className="form-text">
                                        Upload images specifically for {color.name} color variant
                                      </div>
                                    </div>

                                    {colorImages[color.value] && colorImages[color.value].length > 0 && (
                                      <div>
                                        <h6 className="mb-2">Images for {color.name}:</h6>
                                        <div className="row g-2">
                                          {colorImages[color.value].map((preview, imgIndex) => (
                                            <div key={imgIndex} className="col-md-3 col-6">
                                              <div className={`card ${preview.isPrimary ? 'border-primary' : ''}`}>
                                                <img
                                                  src={preview.url}
                                                  className="card-img-top"
                                                  alt={`${color.name} - Image ${imgIndex + 1}`}
                                                  style={{ height: '150px', objectFit: 'cover' }}
                                                />
                                                <div className="card-body p-2">
                                                  <div className="btn-group w-100">
                                                    <button
                                                      type="button"
                                                      className={`btn btn-sm ${preview.isPrimary ? 'btn-primary' : 'btn-outline-primary'}`}
                                                      onClick={() => setColorPrimaryImage(color.value, imgIndex)}
                                                    >
                                                      {preview.isPrimary ? 'Primary' : 'Set Primary'}
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-outline-danger"
                                                      onClick={() => removeColorImage(color.value, imgIndex)}
                                                    >
                                                      Remove
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="mt-2 text-muted small">
                                          {colorImages[color.value].length} image(s) uploaded for {color.name}
                                        </div>
                                      </div>
                                    )}

                                    {formData.sizeConfig.hasSizes && (
                                      <div className="mt-4">
                                        <h6>Quantity & Pricing by Size for {color.name}</h6>
                                        <p className="text-muted small mb-3">
                                          You can set different prices for each size. Prices can override the base color price.
                                        </p>
                                        
                                        <div className="row mb-3">
                                          <div className="col-md-6">
                                            <label className="form-label">Bulk Update Quantity</label>
                                            <div className="input-group">
                                              <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                placeholder="Set quantity for all sizes"
                                                onChange={(e) => bulkUpdateColorQuantities(color.value, e.target.value)}
                                              />
                                              <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => bulkUpdateColorQuantities(color.value, 0)}
                                              >
                                                Set All to 0
                                              </button>
                                            </div>
                                          </div>
                                          <div className="col-md-6">
                                            <label className="form-label">Bulk Update Price</label>
                                            <div className="input-group">
                                              <span className="input-group-text">$</span>
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                className="form-control"
                                                placeholder="Set price for all sizes"
                                                onChange={(e) => bulkUpdateColorPrices(color.value, e.target.value)}
                                              />
                                              <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => {
                                                  const basePrice = color.price || 0;
                                                  if (basePrice > 0) {
                                                    bulkUpdateColorPrices(color.value, basePrice);
                                                  }
                                                }}
                                              >
                                                Reset to Base
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {errors.colorSizeQuantities && (
                                          <div className="alert alert-danger small mb-3">
                                            {errors.colorSizeQuantities}
                                          </div>
                                        )}
                                        {errors.colorSizePrices && (
                                          <div className="alert alert-danger small mb-3">
                                            {errors.colorSizePrices}
                                          </div>
                                        )}
                                        
                                        <div className="table-responsive">
                                          <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                              <tr>
                                                <th>Size</th>
                                                <th>Display</th>
                                                <th>Quantity</th>
                                                <th>Price (Size-specific)</th>
                                                <th>Compare Price</th>
                                                <th>SKU</th>
                                                <th>Barcode</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {formData.sizeConfig.availableSizes.map((size, sizeIndex) => {
                                                const key = `${color.value}_${size.value}`;
                                                const quantityData = colorSizeQuantities[key];
                                                const sizePrice = quantityData?.price !== undefined && quantityData?.price !== null 
                                                  ? quantityData.price 
                                                  : color.price || '';
                                                const sizeComparePrice = quantityData?.comparePrice !== undefined && quantityData?.comparePrice !== null 
                                                  ? quantityData.comparePrice 
                                                  : color.comparePrice || '';
                                                
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
                                                        value={quantityData?.quantity || 0}
                                                        onChange={(e) => handleColorSizeQuantityChange(
                                                          color.value,
                                                          size.value,
                                                          'quantity',
                                                          e.target.value
                                                        )}
                                                      />
                                                    </td>
                                                    <td>
                                                      <div className="input-group input-group-sm">
                                                        <span className="input-group-text">$</span>
                                                        <input
                                                          type="number"
                                                          step="0.01"
                                                          className="form-control"
                                                          value={sizePrice}
                                                          onChange={(e) => handleColorSizeQuantityChange(
                                                            color.value,
                                                            size.value,
                                                            'price',
                                                            e.target.value
                                                          )}
                                                          placeholder={typeof color.price === 'number' ? color.price.toFixed(2) : ''}
                                                        />
                                                      </div>
                                                      <div className="form-text small">
                                                        {sizePrice !== '' && sizePrice !== color.price ? (
                                                          <span className="text-warning">Overrides base price</span>
                                                        ) : (
                                                          <span className="text-muted">Using base price</span>
                                                        )}
                                                      </div>
                                                    </td>
                                                    <td>
                                                      <div className="input-group input-group-sm">
                                                        <span className="input-group-text">$</span>
                                                        <input
                                                          type="number"
                                                          step="0.01"
                                                          className="form-control"
                                                          value={sizeComparePrice}
                                                          onChange={(e) => handleColorSizeQuantityChange(
                                                            color.value,
                                                            size.value,
                                                            'comparePrice',
                                                            e.target.value
                                                          )}
                                                          placeholder={color.comparePrice ? parseFloat(color.comparePrice).toFixed(2) : ''}
                                                        />
                                                      </div>
                                                    </td>
                                                    <td>
                                                      <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={quantityData?.sku || ''}
                                                        onChange={(e) => handleColorSizeQuantityChange(
                                                          color.value,
                                                          size.value,
                                                          'sku',
                                                          e.target.value
                                                        )}
                                                        placeholder="Size-specific SKU"
                                                      />
                                                    </td>
                                                    <td>
                                                      <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={quantityData?.barcode || ''}
                                                        onChange={(e) => handleColorSizeQuantityChange(
                                                          color.value,
                                                          size.value,
                                                          'barcode',
                                                          e.target.value
                                                        )}
                                                        placeholder="Size-specific barcode"
                                                      />
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                            <tfoot className="table-light">
                                              <tr>
                                                <td colSpan="2" className="text-end">
                                                  <strong>Total:</strong>
                                                </td>
                                                <td>
                                                  <strong>{calculateColorTotalQuantity(color.value)}</strong>
                                                </td>
                                                <td colSpan="4"></td>
                                              </tr>
                                            </tfoot>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sizes Configuration */}
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Sizes Configuration</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="sizeConfig.hasSizes"
                        name="sizeConfig.hasSizes"
                        checked={formData.sizeConfig.hasSizes}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="sizeConfig.hasSizes">
                        This product has sizes
                      </label>
                    </div>
                  </div>

                  {formData.sizeConfig.hasSizes && (
                    <>
                      <div className="col-md-6">
                        <label htmlFor="sizeConfig.type" className="form-label">Product Type</label>
                        <select
                          className="form-select"
                          id="sizeConfig.type"
                          name="sizeConfig.type"
                          value={formData.sizeConfig.type}
                          onChange={handleSizeTypeChange}
                        >
                          <option value="clothing">Clothing (Shirts, Tops)</option>
                          <option value="pants">Pants & Bottoms</option>
                          <option value="shoes">Shoes</option>
                          <option value="universal">Universal</option>
                          <option value="none">None</option>
                        </select>
                      </div>

                      {formData.sizeConfig.type === 'pants' && (
                        <div className="col-12">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6 className="card-title">Pants Size Configuration</h6>
                              <p className="text-muted mb-3">
                                Configure dimensional sizes for pants (e.g., 34x30 for Waist x Length)
                              </p>
                              
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label">Dimension Types</label>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="dim-waist"
                                      checked={dimensionalConfig.dimensionTypes.includes('waist')}
                                      onChange={(e) => handleDimensionTypeChange('waist', e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="dim-waist">
                                      Waist (W)
                                    </label>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="dim-length"
                                      checked={dimensionalConfig.dimensionTypes.includes('length')}
                                      onChange={(e) => handleDimensionTypeChange('length', e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="dim-length">
                                      Length (L)
                                    </label>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="dim-hip"
                                      checked={dimensionalConfig.dimensionTypes.includes('hip')}
                                      onChange={(e) => handleDimensionTypeChange('hip', e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="dim-hip">
                                      Hip (H)
                                    </label>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="dim-inseam"
                                      checked={dimensionalConfig.dimensionTypes.includes('inseam')}
                                      onChange={(e) => handleDimensionTypeChange('inseam', e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="dim-inseam">
                                      Inseam (I)
                                    </label>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="dim-chest"
                                      checked={dimensionalConfig.dimensionTypes.includes('chest')}
                                      onChange={(e) => handleDimensionTypeChange('chest', e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="dim-chest">
                                      Chest (C) - for overalls
                                    </label>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="dim-sleeve"
                                      checked={dimensionalConfig.dimensionTypes.includes('sleeve')}
                                      onChange={(e) => handleDimensionTypeChange('sleeve', e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="dim-sleeve">
                                      Sleeve (S) - for overalls
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="col-12">
                        <h6>Add New Size</h6>
                        
                        {formData.sizeConfig.type === 'pants' ? (
                          <div className="card">
                            <div className="card-body">
                              <div className="row g-2 align-items-end">
                                {dimensionalConfig.dimensionTypes.includes('waist') && (
                                  <div className="col-md-3">
                                    <label htmlFor="dimension-waist" className="form-label">Waist</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      id="dimension-waist"
                                      name="dimension-waist"
                                      value={newSize.dimensions.waist}
                                      onChange={handleDimensionChange}
                                      placeholder="e.g., 34"
                                    />
                                  </div>
                                )}
                                
                                {dimensionalConfig.dimensionTypes.includes('length') && (
                                  <div className="col-md-3">
                                    <label htmlFor="dimension-length" className="form-label">Length</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      id="dimension-length"
                                      name="dimension-length"
                                      value={newSize.dimensions.length}
                                      onChange={handleDimensionChange}
                                      placeholder="e.g., 30"
                                    />
                                  </div>
                                )}
                                
                                {dimensionalConfig.dimensionTypes.includes('hip') && (
                                  <div className="col-md-3">
                                    <label htmlFor="dimension-hip" className="form-label">Hip</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        id="dimension-hip"
                                        name="dimension-hip"
                                        value={newSize.dimensions.hip}
                                        onChange={handleDimensionChange}
                                        placeholder="e.g., 40"
                                      />
                                    </div>
                                  )}
                                  
                                  {dimensionalConfig.dimensionTypes.includes('inseam') && (
                                    <div className="col-md-3">
                                      <label htmlFor="dimension-inseam" className="form-label">Inseam</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        id="dimension-inseam"
                                        name="dimension-inseam"
                                        value={newSize.dimensions.inseam}
                                        onChange={handleDimensionChange}
                                        placeholder="e.g., 32"
                                      />
                                    </div>
                                  )}
                                  
                                  {dimensionalConfig.dimensionTypes.includes('chest') && (
                                    <div className="col-md-3">
                                      <label htmlFor="dimension-chest" className="form-label">Chest</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        id="dimension-chest"
                                        name="dimension-chest"
                                        value={newSize.dimensions.chest}
                                        onChange={handleDimensionChange}
                                        placeholder="e.g., 42"
                                      />
                                    </div>
                                  )}
                                  
                                  {dimensionalConfig.dimensionTypes.includes('sleeve') && (
                                    <div className="col-md-3">
                                      <label htmlFor="dimension-sleeve" className="form-label">Sleeve</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        id="dimension-sleeve"
                                        name="dimension-sleeve"
                                        value={newSize.dimensions.sleeve}
                                        onChange={handleDimensionChange}
                                        placeholder="e.g., 34"
                                      />
                                    </div>
                                  )}
                                  
                                  <div className="col-12 mt-2">
                                    <div className="card bg-light">
                                      <div className="card-body py-2">
                                        <small className="text-muted">Auto-generated:</small>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div>
                                            <strong>Value:</strong> {newSize.value || '--'}
                                          </div>
                                          <div>
                                            <strong>Display:</strong> {newSize.displayText || '--'}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="col-12 mt-2">
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      onClick={addSize}
                                      disabled={!newSize.value}
                                    >
                                      Add Size
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="row g-2 align-items-end">
                              <div className="col-md-3">
                                <label htmlFor="sizeValue" className="form-label">Size Value</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="sizeValue"
                                  name="value"
                                  value={newSize.value}
                                  onChange={handleSizeChange}
                                  placeholder="e.g., M, 10, 42"
                                />
                              </div>
                              <div className="col-md-4">
                                <label htmlFor="displayText" className="form-label">Display Text</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="displayText"
                                  name="displayText"
                                  value={newSize.displayText}
                                  onChange={handleSizeChange}
                                  placeholder="e.g., Medium, Size 10, 42 EU"
                                />
                              </div>
                              <div className="col-md-3">
                                <label htmlFor="sizeType" className="form-label">Size Type</label>
                                <select
                                  className="form-select"
                                  id="sizeType"
                                  name="type"
                                  value={newSize.type}
                                  onChange={handleSizeChange}
                                >
                                  <option value="alphabetic">Alphabetic</option>
                                  <option value="numeric">Numeric</option>
                                  <option value="alphanumeric">Alphanumeric</option>
                                  <option value="composite">Composite</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn btn-primary w-100"
                                  onClick={addSize}
                                >
                                  Add Size
                                </button>
                              </div>
                            </div>
                          )}
                          {errors.sizes && <div className="text-danger mt-2">{errors.sizes}</div>}
                        </div>

                        {formData.sizeConfig.availableSizes.length > 0 && (
                          <div className="col-12">
                            <h6>Available Sizes</h6>
                            <div className="table-responsive">
                              <table className="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Value</th>
                                    <th>Display Text</th>
                                    <th>Type</th>
                                    <th>Dimensions</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {formData.sizeConfig.availableSizes.map((size, index) => (
                                    <tr key={index}>
                                      <td>
                                        <code>{size.value}</code>
                                      </td>
                                      <td>{size.displayText}</td>
                                      <td>
                                        <span className={`badge ${
                                          size.type === 'numeric' ? 'bg-primary' : 
                                          size.type === 'alphabetic' ? 'bg-success' : 
                                          size.type === 'composite' ? 'bg-info' : 'bg-warning'
                                        }`}>
                                          {size.type}
                                        </span>
                                      </td>
                                      <td>
                                        {size.type === 'composite' && size.dimensions && (
                                          <small className="text-muted">
                                            {Object.entries(size.dimensions)
                                              .filter(([key, value]) => value && value.trim() !== '')
                                              .map(([key, value]) => `${key}: ${value}`)
                                              .join(', ')}
                                          </small>
                                        )}
                                      </td>
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
                                  ))}
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

            {/* Product Identifiers */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Product Identifiers</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="sku" className="form-label">Base SKU</label>
                      <input
                        type="text"
                        className="form-control"
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                      />
                      <div className="form-text">
                        Stock Keeping Unit (base for color-size combinations)
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="barcode" className="form-label">Base Barcode</label>
                      <input
                        type="text"
                        className="form-control"
                        id="barcode"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="brand" className="form-label">Brand</label>
                      <select
                        className="form-select"
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        disabled={brandsLoading}
                      >
                        <option value="">Select Brand</option>
                        {brandsLoading ? (
                          <option value="" disabled>Loading brands...</option>
                        ) : (
                          brands.map(brand => (
                            <option key={brand._id} value={brand._id}>
                              {brand.name}
                            </option>
                          ))
                        )}
                      </select>
                      {brandsLoading && <div className="form-text">Loading brands...</div>}
                    </div>

                    <div className="col-12">
                      <label htmlFor="material" className="form-label">Material</label>
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

                    <div className="col-12">
                      <div className="form-check">
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
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active Product
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Settings */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Inventory Settings</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="quantity" className="form-label">
                        Base Quantity <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                      {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                      <div className="form-text">
                        Base available quantity (will be overridden by color-size quantities if enabled)
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="lowStockThreshold" className="form-label">Low Stock Threshold</label>
                      <input
                        type="number"
                        className="form-control"
                        id="lowStockThreshold"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={handleChange}
                      />
                      <div className="form-text">
                        Get alerts when stock falls below this number
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="trackQuantity"
                          name="trackQuantity"
                          checked={formData.trackQuantity}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="trackQuantity">
                          Track Quantity
                        </label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="allowBackorder"
                          name="allowBackorder"
                          checked={formData.allowBackorder}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="allowBackorder">
                          Allow Backorder
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Shipping Information</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="weight" className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="dimensions.length" className="form-label">Length (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="dimensions.length"
                        name="dimensions.length"
                        value={formData.dimensions.length}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="dimensions.width" className="form-label">Width (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="dimensions.width"
                        name="dimensions.width"
                        value={formData.dimensions.width}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="dimensions.height" className="form-label">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="dimensions.height"
                        name="dimensions.height"
                        value={formData.dimensions.height}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="col-12">
                      <h6>Shipping Options</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
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
                              Free Shipping
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="shipping.weightBasedShipping"
                              name="shipping.weightBasedShipping"
                              checked={formData.shipping.weightBasedShipping}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="shipping.weightBasedShipping">
                              Weight-Based Shipping
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="shipping.fixedCost" className="form-label">Fixed Shipping Cost</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="shipping.fixedCost"
                            name="shipping.fixedCost"
                            value={formData.shipping.fixedCost}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <h6>Tax Options</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="tax.taxable"
                              name="tax.taxable"
                              checked={formData.tax.taxable}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="tax.taxable">
                              Taxable Product
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="tax.taxCode" className="form-label">Tax Code</label>
                          <input
                            type="text"
                            className="form-control"
                            id="tax.taxCode"
                            name="tax.taxCode"
                            value={formData.tax.taxCode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Care Instructions */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Care Instructions</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter care instruction"
                          value={newCareInstruction}
                          onChange={(e) => setNewCareInstruction(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCareInstruction();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addCareInstruction}
                        >
                          Add Instruction
                        </button>
                      </div>
                    </div>

                    {formData.careInstructions.length > 0 && (
                      <div className="col-12">
                        <h6>Care Instructions</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {formData.careInstructions.map((instruction, index) => (
                            <span key={index} className="badge bg-info d-flex align-items-center">
                              {instruction}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => removeCareInstruction(index)}
                                aria-label="Remove instruction"
                              />
                            </span>
                          ))}
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
                <div className="card-header">
                  <h5 className="card-title mb-0">Product Tags</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addTag}
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="col-12">
                        <div className="d-flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span key={index} className="badge bg-primary d-flex align-items-center">
                              {tag}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => removeTag(index)}
                                aria-label="Remove tag"
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Product Specifications</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-5">
                      <label htmlFor="specName" className="form-label">Specification Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="specName"
                        name="name"
                        value={newSpecification.name}
                        onChange={handleSpecificationChange}
                        placeholder="e.g., Material, Weight"
                      />
                    </div>
                    <div className="col-md-5">
                      <label htmlFor="specValue" className="form-label">Value</label>
                      <input
                        type="text"
                        className="form-control"
                        id="specValue"
                        name="value"
                        value={newSpecification.value}
                        onChange={handleSpecificationChange}
                        placeholder="e.g., Cotton, 500g"
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={addSpecification}
                      >
                        Add
                      </button>
                    </div>

                    {formData.specifications.length > 0 && (
                      <div className="col-12">
                        <h6>Specifications</h6>
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Value</th>
                                <th>Action</th>
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

            {/* SEO Section */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">SEO Settings</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="seo.slug" className="form-label">Slug</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="seo.slug"
                          name="seo.slug"
                          value={formData.seo.slug}
                          onChange={handleChange}
                          placeholder="product-url-slug"
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
                      <label htmlFor="seo.title" className="form-label">SEO Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="seo.title"
                        name="seo.title"
                        value={formData.seo.title}
                        onChange={handleChange}
                        placeholder="SEO title for search engines"
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="seo.description" className="form-label">SEO Description</label>
                      <textarea
                        className="form-control"
                        id="seo.description"
                        name="seo.description"
                        rows="3"
                        value={formData.seo.description}
                        onChange={handleChange}
                        placeholder="Meta description for search engines"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="col-12">
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default ProductForm;