// dummyData.js

// Generate ObjectId-like strings for frontend use
const generateId = () => `dummy_${Math.random().toString(36).substr(2, 9)}`;

// Slug generation function
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Common color definitions for reuse
const commonColors = {
  black: {
    name: "Black",
    value: "black",
    hexCode: "#000000",
    displayOrder: 1
  },
  white: {
    name: "White",
    value: "white",
    hexCode: "#FFFFFF",
    displayOrder: 2
  },
  navy: {
    name: "Navy Blue",
    value: "navy",
    hexCode: "#001F3F",
    displayOrder: 3
  },
  red: {
    name: "Red",
    value: "red",
    hexCode: "#FF4136",
    displayOrder: 4
  },
  gray: {
    name: "Gray",
    value: "gray",
    hexCode: "#AAAAAA",
    displayOrder: 5
  },
  blue: {
    name: "Blue",
    value: "blue",
    hexCode: "#0074D9",
    displayOrder: 6
  },
  green: {
    name: "Green",
    value: "green",
    hexCode: "#2ECC40",
    displayOrder: 7
  },
  orange: {
    name: "Orange",
    value: "orange",
    hexCode: "#FF851B",
    displayOrder: 8
  },
  purple: {
    name: "Purple",
    value: "purple",
    hexCode: "#B10DC9",
    displayOrder: 9
  },
  pink: {
    name: "Pink",
    value: "pink",
    hexCode: "#F012BE",
    displayOrder: 10
  }
};

// Generate category IDs first to use in parent references
const categoryIds = {
  mensClothing: generateId(),
  womensClothing: generateId(),
  shoes: generateId(),
  tshirts: generateId(),
  pants: generateId(),
  dresses: generateId(),
  accessories: generateId(),
  kids: generateId()
};

// Categories Data with unique slugs
export const categories = [
  {
    _id: categoryIds.mensClothing,
    name: "Men's Clothing",
    description: "All men's clothing items including shirts, pants, and accessories",
    sex: "men",
    parent: null,
    image: {
      url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300",
      alt: "Men's Clothing"
    },
    isActive: true,
    sortOrder: 1,
    seo: {
      title: "Men's Clothing | Fashion Store",
      description: "Shop the latest men's clothing trends and styles",
      slug: "mens-clothing"
    },
    customFields: [
      {
        name: "fabricType",
        type: "string",
        required: false,
        options: ["Cotton", "Polyester", "Wool", "Silk"]
      }
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: categoryIds.womensClothing,
    name: "Women's Clothing",
    description: "Women's fashion including dresses, tops, and bottoms",
    sex: "women",
    parent: null,
    image: {
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300",
      alt: "Women's Clothing"
    },
    isActive: true,
    sortOrder: 2,
    seo: {
      title: "Women's Clothing | Fashion Store",
      description: "Discover women's fashion clothing and accessories",
      slug: "womens-clothing"
    },
    customFields: [
      {
        name: "dressLength",
        type: "string",
        required: false,
        options: ["Mini", "Knee", "Midi", "Maxi"]
      }
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: categoryIds.shoes,
    name: "Shoes",
    description: "Footwear for all occasions",
    sex: "unisex",
    parent: null,
    image: {
      url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300",
      alt: "Shoes Collection"
    },
    isActive: true,
    sortOrder: 3,
    seo: {
      title: "Shoes Collection | Fashion Store",
      description: "Comfortable and stylish shoes for every occasion",
      slug: "shoes"
    },
    customFields: [],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: categoryIds.tshirts,
    name: "T-Shirts",
    description: "Casual and comfortable t-shirts",
    sex: "men",
    parent: categoryIds.mensClothing,
    image: {
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
      alt: "T-Shirts"
    },
    isActive: true,
    sortOrder: 1,
    seo: {
      title: "Men's T-Shirts | Fashion Store",
      description: "Comfortable and stylish t-shirts for men",
      slug: "mens-t-shirts"
    },
    customFields: [
      {
        name: "sleeveLength",
        type: "string",
        required: true,
        options: ["Short", "Long"]
      }
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: categoryIds.pants,
    name: "Pants",
    description: "Men's pants and trousers",
    sex: "men",
    parent: categoryIds.mensClothing,
    image: {
      url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300",
      alt: "Men's Pants"
    },
    isActive: true,
    sortOrder: 2,
    seo: {
      title: "Men's Pants | Fashion Store",
      description: "Comfortable and stylish pants for men",
      slug: "mens-pants"
    },
    customFields: [
      {
        name: "fit",
        type: "string",
        required: true,
        options: ["Slim", "Regular", "Relaxed"]
      }
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: categoryIds.dresses,
    name: "Dresses",
    description: "Women's dresses for all occasions",
    sex: "women",
    parent: categoryIds.womensClothing,
    image: {
      url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300",
      alt: "Women's Dresses"
    },
    isActive: true,
    sortOrder: 1,
    seo: {
      title: "Women's Dresses | Fashion Store",
      description: "Beautiful dresses for women",
      slug: "womens-dresses"
    },
    customFields: [
      {
        name: "occasion",
        type: "string",
        required: false,
        options: ["Casual", "Formal", "Party", "Wedding"]
      }
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: categoryIds.accessories,
    name: "Accessories",
    description: "Fashion accessories for everyone",
    sex: "unisex",
    parent: null,
    image: {
      url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=300",
      alt: "Accessories"
    },
    isActive: true,
    sortOrder: 4,
    seo: {
      title: "Accessories | Fashion Store",
      description: "Complete your look with our fashion accessories",
      slug: "accessories"
    },
    customFields: [],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: categoryIds.kids,
    name: "Kids",
    description: "Clothing and accessories for kids",
    sex: "kids",
    parent: null,
    image: {
      url: "https://images.unsplash.com/photo-1503454532315-5535d1f7f5bb?w=300",
      alt: "Kids Clothing"
    },
    isActive: true,
    sortOrder: 5,
    seo: {
      title: "Kids Clothing | Fashion Store",
      description: "Adorable clothing for children",
      slug: "kids-clothing"
    },
    customFields: [
      {
        name: "ageGroup",
        type: "string",
        required: true,
        options: ["0-2 years", "3-6 years", "7-12 years"]
      }
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  }
];

// Brands Data with unique slugs
export const brands = [
  {
    _id: generateId(),
    name: "Nike",
    slug: "nike",
    description: "Just Do It. World's leading athletic brand.",
    logo: {
      url: "https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png",
      alt: "Nike Logo"
    },
    website: "https://nike.com",
    status: "active",
    isFeatured: true,
    metaTitle: "Nike | Athletic Wear & Shoes",
    metaDescription: "Shop Nike products including shoes, clothing and accessories",
    seoKeywords: ["nike", "athletic", "shoes", "sportswear"],
    socialMedia: {
      facebook: "https://facebook.com/nike",
      instagram: "https://instagram.com/nike",
      twitter: "https://twitter.com/nike"
    },
    contactEmail: "info@nike.com",
    sortOrder: 1,
    createdBy: generateId(),
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Adidas",
    slug: "adidas",
    description: "Impossible is Nothing. German sportswear brand.",
    logo: {
      url: "https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png",
      alt: "Adidas Logo"
    },
    website: "https://adidas.com",
    status: "active",
    isFeatured: true,
    metaTitle: "Adidas | Sportswear & Shoes",
    metaDescription: "Official Adidas store for shoes and sportswear",
    seoKeywords: ["adidas", "sportswear", "shoes", "athletic"],
    socialMedia: {
      facebook: "https://facebook.com/adidas",
      instagram: "https://instagram.com/adidas"
    },
    contactEmail: "support@adidas.com",
    sortOrder: 2,
    createdBy: generateId(),
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Zara",
    slug: "zara",
    description: "Fast fashion clothing and accessories",
    logo: {
      url: "https://logos-world.net/wp-content/uploads/2020/04/Zara-Logo.png",
      alt: "Zara Logo"
    },
    website: "https://zara.com",
    status: "active",
    isFeatured: false,
    metaTitle: "Zara | Fashion Clothing",
    metaDescription: "Latest fashion trends from Zara",
    seoKeywords: ["zara", "fashion", "clothing", "trendy"],
    socialMedia: {
      instagram: "https://instagram.com/zara"
    },
    contactEmail: "hello@zara.com",
    sortOrder: 3,
    createdBy: generateId(),
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Levi's",
    slug: "levis",
    description: "Original denim brand since 1853",
    logo: {
      url: "https://logos-world.net/wp-content/uploads/2020/04/Levis-Logo.png",
      alt: "Levi's Logo"
    },
    website: "https://levi.com",
    status: "active",
    isFeatured: true,
    metaTitle: "Levi's | Denim & Clothing",
    metaDescription: "Authentic Levi's denim and clothing",
    seoKeywords: ["levis", "denim", "jeans", "clothing"],
    socialMedia: {
      facebook: "https://facebook.com/levis",
      instagram: "https://instagram.com/levis"
    },
    contactEmail: "contact@levi.com",
    sortOrder: 4,
    createdBy: generateId(),
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "H&M",
    slug: "h-and-m",
    description: "Affordable fashion and quality",
    logo: {
      url: "https://logos-world.net/wp-content/uploads/2020/04/H-M-Logo.png",
      alt: "H&M Logo"
    },
    website: "https://hm.com",
    status: "active",
    isFeatured: false,
    metaTitle: "H&M | Affordable Fashion",
    metaDescription: "Trendy and affordable clothing from H&M",
    seoKeywords: ["h&m", "fashion", "affordable", "clothing"],
    socialMedia: {
      facebook: "https://facebook.com/hm",
      instagram: "https://instagram.com/hm"
    },
    contactEmail: "customerservice@hm.com",
    sortOrder: 5,
    createdBy: generateId(),
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Uniqlo",
    slug: "uniqlo",
    description: "Modern clothing for everyone",
    logo: {
      url: "https://logos-world.net/wp-content/uploads/2020/04/Uniqlo-Logo.png",
      alt: "Uniqlo Logo"
    },
    website: "https://uniqlo.com",
    status: "active",
    isFeatured: true,
    metaTitle: "Uniqlo | Quality Basics",
    metaDescription: "High-quality basic clothing from Uniqlo",
    seoKeywords: ["uniqlo", "basics", "quality", "clothing"],
    socialMedia: {
      facebook: "https://facebook.com/uniqlo",
      instagram: "https://instagram.com/uniqlo"
    },
    contactEmail: "support@uniqlo.com",
    sortOrder: 6,
    createdBy: generateId(),
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  }
];

// Products Data with unique slugs
export const products = [
  {
    _id: generateId(),
    name: "Nike Air Max 270",
    description: "The Nike Air Max 270 delivers a comfortable fit and modern style with its large Air Max unit in the heel. The breathable upper and flexible outsole provide all-day comfort.",
    sizeConfig: {
      hasSizes: true,
      type: "shoes",
      availableSizes: [
        { value: "7", type: "numeric", displayText: "7" },
        { value: "8", type: "numeric", displayText: "8" },
        { value: "9", type: "numeric", displayText: "9" },
        { value: "10", type: "numeric", displayText: "10" },
        { value: "11", type: "numeric", displayText: "11" }
      ]
    },
    colors: {
      hasColors: true,
      availableColors: [
        { ...commonColors.black, displayOrder: 1 },
        { ...commonColors.white, displayOrder: 2 },
        { 
          name: "University Red", 
          value: "university-red", 
          hexCode: "#CE1126",
          displayOrder: 3
        },
        { 
          name: "Royal Blue", 
          value: "royal-blue", 
          hexCode: "#0051BA",
          displayOrder: 4
        }
      ]
    },
    price: 150.00,
    comparePrice: 180.00,
    cost: 75.00,
    sku: "NKAM270001",
    barcode: "194825730194",
    quantity: 0,
    lowStockThreshold: 5,
    weight: 0.8,
    dimensions: {
      length: 30,
      width: 20,
      height: 12
    },
    category: categoryIds.shoes,
    brand: brands[0]._id,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        alt: "Nike Air Max 270 - Front View",
        isPrimary: true,
        color: "black"
      },
      {
        url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500",
        alt: "Nike Air Max 270 - Side View",
        isPrimary: false,
        color: "black"
      }
    ],
    variants: [
      {
        _id: generateId(),
        size: { value: "7", displayText: "7" },
        color: {
          name: "Black",
          value: "black",
          hexCode: "#000000"
        },
        material: "Mesh/Synthetic",
        price: 150.00,
        comparePrice: 180.00,
        quantity: 15,
        sku: "NKAM270001-7-BK",
        images: [
          {
            url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            alt: "Nike Air Max 270 - Size 7 Black"
          }
        ]
      },
      {
        _id: generateId(),
        size: { value: "8", displayText: "8" },
        color: {
          name: "Black",
          value: "black",
          hexCode: "#000000"
        },
        material: "Mesh/Synthetic",
        price: 150.00,
        comparePrice: 180.00,
        quantity: 8,
        sku: "NKAM270001-8-BK",
        images: [
          {
            url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            alt: "Nike Air Max 270 - Size 8 Black"
          }
        ]
      }
    ],
    tags: ["sneakers", "running", "athletic", "casual"],
    specifications: [
      { name: "Material", value: "Mesh Upper, Rubber Sole" },
      { name: "Closure", value: "Lace-Up" },
      { name: "Air Max Unit", value: "270° Visible Air" }
    ],
    ratings: {
      average: 4.5,
      count: 128
    },
    reviews: [generateId(), generateId(), generateId()],
    isActive: true,
    isFeatured: true,
    salesCount: 45,
    viewCount: 320,
    seo: {
      title: "Nike Air Max 270 | Running Shoes",
      description: "Buy Nike Air Max 270 running shoes with comfortable Air Max unit",
      slug: "nike-air-max-270"
    },
    defaultSize: {
      value: "8",
      displayText: "8"
    },
    defaultColor: {
      name: "Black",
      value: "black",
      hexCode: "#000000"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Classic Cotton T-Shirt",
    description: "Our premium cotton t-shirt made from 100% organic cotton. Perfect for everyday wear with a comfortable fit and durable construction.",
    sizeConfig: {
      hasSizes: true,
      type: "clothing",
      availableSizes: [
        { value: "S", type: "alphabetic", displayText: "Small" },
        { value: "M", type: "alphabetic", displayText: "Medium" },
        { value: "L", type: "alphabetic", displayText: "Large" },
        { value: "XL", type: "alphanumeric", displayText: "Extra Large" }
      ]
    },
    colors: {
      hasColors: true,
      availableColors: [
        { ...commonColors.white, displayOrder: 1 },
        { ...commonColors.black, displayOrder: 2 },
        { ...commonColors.navy, displayOrder: 3 },
        { ...commonColors.gray, displayOrder: 4 },
        { ...commonColors.red, displayOrder: 5 }
      ]
    },
    price: 29.99,
    comparePrice: 39.99,
    cost: 12.50,
    sku: "CTS001",
    barcode: "584739201847",
    quantity: 0,
    lowStockThreshold: 5,
    weight: 0.3,
    dimensions: {
      length: 25,
      width: 18,
      height: 2
    },
    category: categoryIds.tshirts,
    brand: brands[2]._id,
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        alt: "Classic Cotton T-Shirt - White",
        isPrimary: true,
        color: "white"
      }
    ],
    variants: [
      {
        _id: generateId(),
        size: { value: "S", displayText: "Small" },
        color: {
          name: "White",
          value: "white",
          hexCode: "#FFFFFF"
        },
        material: "100% Organic Cotton",
        price: 29.99,
        comparePrice: 39.99,
        quantity: 25,
        sku: "CTS001-S-WH",
        images: [
          {
            url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            alt: "Classic Cotton T-Shirt - Small White"
          }
        ]
      }
    ],
    tags: ["t-shirt", "cotton", "casual", "basic"],
    specifications: [
      { name: "Material", value: "100% Organic Cotton" },
      { name: "Fit", value: "Regular" },
      { name: "Care", value: "Machine Washable" }
    ],
    ratings: {
      average: 4.2,
      count: 89
    },
    reviews: [generateId(), generateId()],
    isActive: true,
    isFeatured: false,
    salesCount: 120,
    viewCount: 450,
    seo: {
      title: "Classic Cotton T-Shirt | Men's Basic Tee",
      description: "Comfortable 100% organic cotton t-shirt for everyday wear",
      slug: "classic-cotton-t-shirt"
    },
    defaultSize: {
      value: "M",
      displayText: "Medium"
    },
    defaultColor: {
      name: "White",
      value: "white",
      hexCode: "#FFFFFF"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Adidas Ultraboost 21",
    description: "Experience ultimate energy return with Adidas Ultraboost 21. Features Boost midsole technology and a responsive Primeknit upper for superior comfort.",
    sizeConfig: {
      hasSizes: true,
      type: "shoes",
      availableSizes: [
        { value: "8", type: "numeric", displayText: "8" },
        { value: "9", type: "numeric", displayText: "9" },
        { value: "10", type: "numeric", displayText: "10" },
        { value: "11", type: "numeric", displayText: "11" },
        { value: "12", type: "numeric", displayText: "12" }
      ]
    },
    colors: {
      hasColors: true,
      availableColors: [
        { ...commonColors.black, displayOrder: 1 },
        { ...commonColors.white, displayOrder: 2 },
        { ...commonColors.blue, displayOrder: 3 },
        { 
          name: "Solar Red", 
          value: "solar-red", 
          hexCode: "#E31C23",
          displayOrder: 4
        }
      ]
    },
    price: 180.00,
    comparePrice: 220.00,
    cost: 90.00,
    sku: "ADUB21001",
    barcode: "748392019485",
    quantity: 0,
    lowStockThreshold: 5,
    weight: 0.85,
    dimensions: {
      length: 32,
      width: 22,
      height: 14
    },
    category: categoryIds.shoes,
    brand: brands[1]._id,
    images: [
      {
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
        alt: "Adidas Ultraboost 21 - Running Shoes",
        isPrimary: true,
        color: "black"
      }
    ],
    variants: [
      {
        _id: generateId(),
        size: { value: "9", displayText: "9" },
        color: {
          name: "Black",
          value: "black",
          hexCode: "#000000"
        },
        material: "Primeknit/Rubber",
        price: 180.00,
        comparePrice: 220.00,
        quantity: 12,
        sku: "ADUB21001-9-BK",
        images: [
          {
            url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
            alt: "Adidas Ultraboost 21 - Size 9 Black"
          }
        ]
      }
    ],
    tags: ["running", "boost", "performance", "sneakers"],
    specifications: [
      { name: "Technology", value: "Boost Midsole, Primeknit Upper" },
      { name: "Use", value: "Running & Athletic" },
      { name: "Drop", value: "10mm" }
    ],
    ratings: {
      average: 4.7,
      count: 203
    },
    reviews: [generateId(), generateId(), generateId(), generateId()],
    isActive: true,
    isFeatured: true,
    salesCount: 78,
    viewCount: 560,
    seo: {
      title: "Adidas Ultraboost 21 | Running Shoes",
      description: "High-performance running shoes with Boost technology",
      slug: "adidas-ultraboost-21"
    },
    defaultSize: {
      value: "10",
      displayText: "10"
    },
    defaultColor: {
      name: "Black",
      value: "black",
      hexCode: "#000000"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Women's Floral Summer Dress",
    description: "Beautiful floral print summer dress made from lightweight, breathable fabric. Perfect for warm weather and casual occasions.",
    sizeConfig: {
      hasSizes: true,
      type: "clothing",
      availableSizes: [
        { value: "XS", type: "alphabetic", displayText: "Extra Small" },
        { value: "S", type: "alphabetic", displayText: "Small" },
        { value: "M", type: "alphabetic", displayText: "Medium" },
        { value: "L", type: "alphabetic", displayText: "Large" }
      ]
    },
    colors: {
      hasColors: true,
      availableColors: [
        { 
          name: "Floral Print", 
          value: "floral-print", 
          hexCode: "#FF69B4",
          displayOrder: 1
        },
        { 
          name: "Navy Floral", 
          value: "navy-floral", 
          hexCode: "#191970",
          displayOrder: 2
        },
        { 
          name: "Red Floral", 
          value: "red-floral", 
          hexCode: "#DC143C",
          displayOrder: 3
        }
      ]
    },
    price: 59.99,
    comparePrice: 79.99,
    cost: 25.00,
    sku: "WFSD001",
    barcode: "847392019584",
    quantity: 0,
    lowStockThreshold: 3,
    weight: 0.4,
    dimensions: {
      length: 35,
      width: 20,
      height: 3
    },
    category: categoryIds.dresses,
    brand: brands[2]._id,
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
        alt: "Women's Floral Summer Dress",
        isPrimary: true,
        color: "floral-print"
      }
    ],
    variants: [
      {
        _id: generateId(),
        size: { value: "S", displayText: "Small" },
        color: {
          name: "Floral Print",
          value: "floral-print",
          hexCode: "#FF69B4"
        },
        material: "Polyester/Cotton Blend",
        price: 59.99,
        comparePrice: 79.99,
        quantity: 10,
        sku: "WFSD001-S-FP",
        images: [
          {
            url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
            alt: "Women's Floral Summer Dress - Small"
          }
        ]
      }
    ],
    tags: ["dress", "floral", "summer", "casual", "women"],
    specifications: [
      { name: "Material", value: "Polyester/Cotton Blend" },
      { name: "Length", value: "Knee Length" },
      { name: "Care", value: "Machine Wash Cold" }
    ],
    ratings: {
      average: 4.3,
      count: 67
    },
    reviews: [generateId(), generateId()],
    isActive: true,
    isFeatured: true,
    salesCount: 34,
    viewCount: 210,
    seo: {
      title: "Women's Floral Summer Dress | Fashion Store",
      description: "Lightweight floral print summer dress for women",
      slug: "womens-floral-summer-dress"
    },
    defaultSize: {
      value: "M",
      displayText: "Medium"
    },
    defaultColor: {
      name: "Floral Print",
      value: "floral-print",
      hexCode: "#FF69B4"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Levi's 501 Original Jeans",
    description: "The original button-fly jeans that started it all. Made from premium denim with a straight leg fit that never goes out of style.",
    sizeConfig: {
      hasSizes: true,
      type: "clothing",
      availableSizes: [
        { value: "30x32", type: "alphanumeric", displayText: "30x32" },
        { value: "32x32", type: "alphanumeric", displayText: "32x32" },
        { value: "34x32", type: "alphanumeric", displayText: "34x32" },
        { value: "36x32", type: "alphanumeric", displayText: "36x32" }
      ]
    },
    colors: {
      hasColors: true,
      availableColors: [
        { 
          name: "Dark Wash", 
          value: "dark-wash", 
          hexCode: "#191970",
          displayOrder: 1
        },
        { 
          name: "Medium Wash", 
          value: "medium-wash", 
          hexCode: "#6B8CFF",
          displayOrder: 2
        },
        { 
          name: "Black", 
          value: "black", 
          hexCode: "#000000",
          displayOrder: 3
        }
      ]
    },
    price: 89.99,
    comparePrice: 120.00,
    cost: 45.00,
    sku: "LV501001",
    barcode: "847392019583",
    quantity: 0,
    lowStockThreshold: 5,
    weight: 0.7,
    dimensions: {
      length: 40,
      width: 30,
      height: 5
    },
    category: categoryIds.pants,
    brand: brands[3]._id,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
        alt: "Levi's 501 Original Jeans",
        isPrimary: true,
        color: "dark-wash"
      }
    ],
    variants: [
      {
        _id: generateId(),
        size: { value: "32x32", displayText: "32x32" },
        color: {
          name: "Dark Wash",
          value: "dark-wash",
          hexCode: "#191970"
        },
        material: "100% Cotton Denim",
        price: 89.99,
        comparePrice: 120.00,
        quantity: 20,
        sku: "LV501001-32-DW",
        images: [
          {
            url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
            alt: "Levi's 501 - 32x32 Dark Wash"
          }
        ]
      }
    ],
    tags: ["jeans", "denim", "levis", "classic", "pants"],
    specifications: [
      { name: "Material", value: "100% Cotton Denim" },
      { name: "Fit", value: "Straight" },
      { name: "Closure", value: "Button Fly" },
      { name: "Origin", value: "USA" }
    ],
    ratings: {
      average: 4.6,
      count: 156
    },
    reviews: [generateId(), generateId(), generateId()],
    isActive: true,
    isFeatured: true,
    salesCount: 89,
    viewCount: 340,
    seo: {
      title: "Levi's 501 Original Jeans | Men's Denim",
      description: "Authentic Levi's 501 original button-fly jeans",
      slug: "levis-501-original-jeans"
    },
    defaultSize: {
      value: "32x32",
      displayText: "32x32"
    },
    defaultColor: {
      name: "Dark Wash",
      value: "dark-wash",
      hexCode: "#191970"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  },
  {
    _id: generateId(),
    name: "Uniqlo Airism T-Shirt",
    description: "Ultra-lightweight and breathable AIRism t-shirt that feels incredibly smooth against your skin. Perfect for hot weather and active wear.",
    sizeConfig: {
      hasSizes: true,
      type: "clothing",
      availableSizes: [
        { value: "S", type: "alphabetic", displayText: "Small" },
        { value: "M", type: "alphabetic", displayText: "Medium" },
        { value: "L", type: "alphabetic", displayText: "Large" },
        { value: "XL", type: "alphanumeric", displayText: "Extra Large" }
      ]
    },
    colors: {
      hasColors: true,
      availableColors: [
        { ...commonColors.white, displayOrder: 1 },
        { ...commonColors.black, displayOrder: 2 },
        { ...commonColors.navy, displayOrder: 3 },
        { ...commonColors.gray, displayOrder: 4 }
      ]
    },
    price: 19.90,
    comparePrice: 24.90,
    cost: 8.50,
    sku: "UAT001",
    barcode: "947382019584",
    quantity: 0,
    lowStockThreshold: 5,
    weight: 0.2,
    dimensions: {
      length: 24,
      width: 17,
      height: 2
    },
    category: categoryIds.tshirts,
    brand: brands[5]._id,
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        alt: "Uniqlo Airism T-Shirt",
        isPrimary: true,
        color: "white"
      }
    ],
    variants: [
      {
        _id: generateId(),
        size: { value: "M", displayText: "Medium" },
        color: {
          name: "White",
          value: "white",
          hexCode: "#FFFFFF"
        },
        material: "AIRism Fabric",
        price: 19.90,
        comparePrice: 24.90,
        quantity: 30,
        sku: "UAT001-M-WH",
        images: [
          {
            url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            alt: "Uniqlo Airism T-Shirt - Medium White"
          }
        ]
      }
    ],
    tags: ["t-shirt", "airism", "breathable", "lightweight", "activewear"],
    specifications: [
      { name: "Material", value: "AIRism Special Fabric" },
      { name: "Technology", value: "Quick Dry, Moisture Wicking" },
      { name: "Care", value: "Machine Washable" }
    ],
    ratings: {
      average: 4.4,
      count: 203
    },
    reviews: [generateId(), generateId(), generateId()],
    isActive: true,
    isFeatured: false,
    salesCount: 156,
    viewCount: 420,
    seo: {
      title: "Uniqlo Airism T-Shirt | Breathable Comfort",
      description: "Ultra-lightweight AIRism t-shirt for ultimate comfort",
      slug: "uniqlo-airism-t-shirt"
    },
    defaultSize: {
      value: "M",
      displayText: "Medium"
    },
    defaultColor: {
      name: "White",
      value: "white",
      hexCode: "#FFFFFF"
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z"
  }
];

// Add these functions to your dummy/data.js file

// Category Utility Functions
export const categoryUtils = {
  // Get parent categories (categories without parent)
  getParentCategories: () => {
    return categories.filter(cat => !cat.parent);
  },

  // Get products in a category (including subcategories if recursive = true)
  getProductsInCategory: (categoryId, recursive = false) => {
    if (recursive) {
      // Get all subcategory IDs
      const getSubcategoryIds = (parentId) => {
        const subcategories = categories.filter(cat => cat.parent === parentId);
        let allIds = [parentId];
        subcategories.forEach(subcat => {
          allIds = [...allIds, ...getSubcategoryIds(subcat._id)];
        });
        return allIds;
      };

      const categoryIds = getSubcategoryIds(categoryId);
      return products.filter(product => categoryIds.includes(product.category));
    } else {
      return products.filter(product => product.category === categoryId);
    }
  },

  // Get child categories
  getChildCategories: (parentId) => {
    return categories.filter(cat => cat.parent === parentId);
  },

  // Find category by name
  findCategoryByName: (name) => {
    return categories.find(cat => cat.name.toLowerCase().includes(name.toLowerCase()));
  }
};

// Product Utility Functions
export const productUtils = {
  // Search products by name, description, or tags
  searchProducts: (productsList, searchTerm) => {
    if (!searchTerm) return productsList;
    
    const term = searchTerm.toLowerCase();
    return productsList.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  },

  // Filter by price range
  filterByPrice: (productsList, minPrice, maxPrice) => {
    return productsList.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
  },

  // Filter by color
  filterByColor: (productsList, selectedColors) => {
    return productsList.filter(product => {
      if (!product.colors?.hasColors) return false;
      return product.colors.availableColors.some(color => 
        selectedColors.includes(color.value)
      );
    });
  },

  // Filter by size
  filterBySize: (productsList, selectedSizes) => {
    return productsList.filter(product => {
      if (!product.sizeConfig?.hasSizes) return false;
      return product.sizeConfig.availableSizes.some(size => 
        selectedSizes.includes(size.value)
      );
    });
  },

  // Filter by brand
  filterByBrand: (productsList, selectedBrands) => {
    return productsList.filter(product => 
      selectedBrands.includes(product.brand)
    );
  },

  // Filter by category
  filterByCategory: (productsList, selectedCategories) => {
    return productsList.filter(product => 
      selectedCategories.includes(product.category)
    );
  },

  // Sort products
  sortProducts: (productsList, sortBy) => {
    const sorted = [...productsList];
    
    switch (sortBy) {
      case 'price-low-high':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-a-z':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-z-a':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating':
        return sorted.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'featured':
      default:
        return sorted.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return (b.salesCount || 0) - (a.salesCount || 0);
        });
    }
  }
};

// Helper function to compute virtual fields based on Mongoose schema
export const computeVirtualFields = (product) => {
  // Compute inStock based on variants or quantity
  const inStock = product.variants?.some(variant => variant.quantity > 0) || product.quantity > 0;
  
  // Compute discount percentage
  let discountPercentage = 0;
  if (product.comparePrice && product.comparePrice > product.price) {
    discountPercentage = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  }

  // Compute available colors with stock information
  const availableColors = [];
  if (product.colors?.hasColors && product.variants) {
    const colorStockMap = new Map();
    
    product.variants.forEach(variant => {
      if (variant.color && variant.color.value) {
        const colorKey = variant.color.value;
        if (!colorStockMap.has(colorKey)) {
          colorStockMap.set(colorKey, {
            name: variant.color.name,
            value: variant.color.value,
            hexCode: variant.color.hexCode,
            inStock: false,
            variants: []
          });
        }
        
        const colorData = colorStockMap.get(colorKey);
        if (variant.quantity > 0) {
          colorData.inStock = true;
        }
        colorData.variants.push({
          size: variant.size,
          quantity: variant.quantity,
          price: variant.price
        });
      }
    });
    
    availableColors.push(...Array.from(colorStockMap.values()));
  }

  // Compute available sizes with stock information
  const availableSizes = [];
  if (product.sizeConfig?.hasSizes && product.variants) {
    const sizeMap = new Map();
    
    product.variants.forEach(variant => {
      if (variant.size && variant.size.value && variant.quantity > 0) {
        const sizeKey = variant.size.value;
        if (!sizeMap.has(sizeKey)) {
          sizeMap.set(sizeKey, {
            value: variant.size.value,
            displayText: variant.size.displayText,
            inStock: true
          });
        }
      }
    });
    
    availableSizes.push(...Array.from(sizeMap.values()));
  }

  return {
    ...product,
    inStock,
    discountPercentage,
    availableColors,
    availableSizes
  };
};

// Utility functions for finding entities by slug
export const findCategoryBySlug = (slug) => {
  return categories.find(category => category.seo.slug === slug);
};

export const findBrandBySlug = (slug) => {
  return brands.find(brand => brand.slug === slug);
};

export const findProductBySlug = (slug) => {
  return products.find(product => product.seo.slug === slug);
};

// Get products by category slug
export const getProductsByCategorySlug = (categorySlug) => {
  const category = findCategoryBySlug(categorySlug);
  if (!category) return [];
  
  return products.filter(product => product.category === category._id);
};

// Get products by brand slug
export const getProductsByBrandSlug = (brandSlug) => {
  const brand = findBrandBySlug(brandSlug);
  if (!brand) return [];
  
  return products.filter(product => product.brand === brand._id);
};

// Generate URL paths using slugs
export const generateCategoryUrl = (categorySlug) => {
  return `/categories/${categorySlug}`;
};

export const generateBrandUrl = (brandSlug) => {
  return `/brands/${brandSlug}`;
};

export const generateProductUrl = (productSlug) => {
  return `/products/${productSlug}`;
};

// Get full product URL with category context
export const generateFullProductUrl = (product) => {
  const category = categories.find(cat => cat._id === product.category);
  if (category) {
    return `/categories/${category.seo.slug}/products/${product.seo.slug}`;
  }
  return `/products/${product.seo.slug}`;
};

// Cart management functions (unchanged from your original)
export const createCartItemFromProduct = (product, variant, quantity = 1) => {
  const selectedVariant = variant || product.variants?.[0];
  const selectedColor = selectedVariant?.color || product.defaultColor;
  const selectedSize = selectedVariant?.size || product.defaultSize;
  
  return {
    id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    productId: product._id,
    variantId: selectedVariant?._id,
    name: product.name,
    price: selectedVariant?.price || product.price,
    comparePrice: selectedVariant?.comparePrice || product.comparePrice,
    quantity: quantity,
    image: selectedVariant?.images?.[0]?.url || product.images?.[0]?.url,
    color: selectedColor?.name || 'Default',
    colorValue: selectedColor?.value,
    size: selectedSize?.displayText || selectedSize?.value || 'One Size',
    sizeValue: selectedSize?.value,
    sku: selectedVariant?.sku || product.sku,
    maxQuantity: selectedVariant?.quantity || product.quantity,
    inStock: (selectedVariant?.quantity || product.quantity) > 0
  };
};

export const calculateCartTotals = (cartItems) => {
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 300 ? 0 : 4.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return { 
    subtotal: Number(subtotal.toFixed(2)), 
    shipping: Number(shipping.toFixed(2)), 
    tax: Number(tax.toFixed(2)), 
    total: Number(total.toFixed(2))
  };
};

// Export all data with computed virtual fields and slug utilities
export default {
  categories,
  brands,
  products: products.map(computeVirtualFields),
  // Slug utilities
  findCategoryBySlug,
  findBrandBySlug,
  findProductBySlug, 
  getProductsByCategorySlug,
  getProductsByBrandSlug,
  generateCategoryUrl,
  generateBrandUrl,
  generateProductUrl,
  generateFullProductUrl,
  // Original utilities
  createCartItemFromProduct,
  calculateCartTotals,
  getProductById: (productId) => products.find(product => product._id === productId),
  getVariantById: (product, variantId) => product.variants?.find(variant => variant._id === variantId),
  findVariantByAttributes: (product, sizeValue, colorValue) => {
    return product.variants?.find(variant => 
      variant.size?.value === sizeValue && variant.color?.value === colorValue
    );
  }
};