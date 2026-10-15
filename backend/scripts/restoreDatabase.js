import prisma from '../config/prisma.js';

// ─── 1. REAL CATEGORIES ────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'd0eeae96-eeda-4c00-aa43-2f2d1746903d',
    name: 'Shirts',
    slug: 'shirts',
    description: 'Curated casual, camp collar, and oxford button downs',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: '209d5bab-ec1d-48d8-90f4-874c2b90c35a',
    name: 'Jackets',
    slug: 'jackets',
    description: 'Structured outerwear, bombers, and winter drop staples',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: '33150d77-3ef5-4063-a01e-68c50aec9018',
    name: 'Tees',
    slug: 'tees',
    description: 'Heavyweight organic cotton staples & boxy cuts',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: '514b828b-77da-4f6b-af12-7e41968dddd6',
    name: 'Tailoring',
    slug: 'tailoring',
    description: 'Bespoke fit suits, blazers, and formal trousers',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: '2ba0976a-4da3-45b8-99ba-b3f551444403',
    name: 'Jeans',
    slug: 'jeans',
    description: 'Selvedge and contemporary denim cuts',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'a3e6e835-c411-4de2-92ca-3f56d8b00d95',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Full-grain leather belts, silk ties, and pocket squares',
    sortOrder: 8,
    isActive: true,
  },
  {
    id: '31dc345a-c6bb-4b51-9b24-fbd6278f47ea',
    name: 'Formals',
    slug: 'formals',
    description: 'Evening shirts, tuxedos, and black-tie essentials',
    sortOrder: 9,
    isActive: true,
  },
];

// ─── 2. REAL USERS (ADMIN & SUPERADMIN) ───────────────────────────────────────
const USERS = [
  {
    id: '5ae2a2f1-0f7a-40a1-891a-7125177f3d1f',
    name: 'Penguin Lead Superadmin',
    email: 'admin@penguin.com',
    password: '$2b$10$H4qhckhCOkpt5Ew3dS8eVeTpFolG519yBBNnbvmevy0mrxRuYWhD2',
    role: 'superadmin',
    mfaSecret: 'KFDFWS3VKEVEUOLBLNJWYZ2YEMVFMKRE',
    mfaEnabled: true,
    backupCodes: [
      '$2b$10$homY7fuIZwJPk20pTfti3eeeMdO0JrpugGiMA9iQlgnm78Zr6KpjS',
      '$2b$10$5GX2BAp1VkILKvcauOtjXeImbbxYu/jyLmjtCqEjCdOSaMgSzvpHO',
      '$2b$10$zfi8vCudZ/xHVSWmiUC4Nu7LqDRq0D6HFaJ5LjGh16lnRmGEymoHu',
      '$2b$10$qgbu0AMSeCZV03qxO0vbkOSzqyt5mTUBY1wQkiyQ5eRtSIHPIu10u',
      '$2b$10$ewwIY.2yTe3gJoWp392wRevt.9vqoze8uyU7K9QZBwp0IAnBa4wF2',
      '$2b$10$jgL/9PsgA/K41QNqMsDFMOuacdDzRIpgcw8A06FVgZlomeRhn0D0S',
      '$2b$10$pa8ITTgocFsgU3I576fN/OFV03Giir3tGXVcId6qk8Sb.eTYZJ9X.',
      '$2b$10$HbddOl8AJ8ztL3oZY.WMA.fOcndX.wDQtgw4.JcrOiA08zSr0b6g.',
    ],
    failedLoginAttempts: 0,
    tempPassword: false,
  },
  {
    id: '4eabe274-d6e2-4dd8-8b1d-cdc06816b6a5',
    name: 'Pavan',
    email: 'storeadmin@gmail.com',
    password: '$2b$12$l2oiMebJ0KEJg/umEOZZkOsXTuAQMk3UR59HE1pCtd0bYKuuPwfMC',
    role: 'admin',
    mfaEnabled: false,
    failedLoginAttempts: 0,
    tempPassword: true,
  },
];

// ─── 3. REAL STOREFRONT CUSTOMERS ─────────────────────────────────────────────
const CUSTOMERS = [
  {
    id: '1e63bc97-9b1a-4c77-bdce-c52931d0f4b2',
    name: 'Test Customer',
    email: 'tester@penguin.com',
    phone: '9876543210',
    password: '$2b$12$mKMTjiLmn2NnOX3LWxYoSO4vx8OGWBpFEGjOamzFqAYmz/OTnQ2kO',
    emailVerified: false,
    failedLoginAttempts: 0,
  },
  {
    id: 'dd565057-830f-41c5-aaad-fc78fb8232bd',
    name: 'Aiden Croft',
    email: 'aiden@penguin.com',
    phone: '9811223344',
    password: '$2b$12$xRouW2juC7eRmNBaBIUMSODb4VQugjvfwvOrBOq3On9aYj7gvL0Wa',
    emailVerified: true,
    failedLoginAttempts: 0,
  },
  {
    id: '1cf6414e-91eb-4c1d-936c-7a7e0a48a541',
    name: 'Saadhan P',
    email: 'saadhan275@gmail.com',
    phone: '09620937798',
    password: '$2b$12$PV0SoTbYrD.XGNalfE763eqL0JUU3GOLOpOcX8NwLSuWkQ6GmL72O',
    emailVerified: true,
    failedLoginAttempts: 0,
  },
];

// ─── 4. REAL ADDRESSES ─────────────────────────────────────────────────────────
const ADDRESSES = [
  {
    id: 'cbce02c6-d84e-463b-9b2a-ab6c8ccc960b',
    customerId: '1e63bc97-9b1a-4c77-bdce-c52931d0f4b2',
    label: 'Home',
    fullName: 'Saadhan P',
    phone: '09620937798',
    line1: '590/b 1st cross 1st main',
    city: 'MYSURU',
    state: 'Karnataka',
    pincode: '570031',
    isDefault: true,
  },
];

// ─── 5. REAL 12 PRODUCTS (CURATED CATALOG) ────────────────────────────────────
const PRODUCTS = [
  {
    id: '845b40f5-c96a-4c45-b20c-9c4be7d5c27f',
    slug: 'essential-plain-black-poplin-shirt',
    name: 'Essential Plain Black Poplin Shirt',
    category: 'Shirts',
    categoryId: 'd0eeae96-eeda-4c00-aa43-2f2d1746903d',
    color: 'Plain Black',
    price: 1899,
    originalPrice: 2999,
    badge: 'ESSENTIAL',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#111111', name: 'Plain Black' },
      { hex: '#F5F5F0', name: 'Chalk White' },
    ],
    isFeatured: true,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '100% High-Density Poplin Cotton (140 GSM). Smooth matte finish.',
    careInstructions: 'Machine wash delicate at 30°C. Low heat iron.',
    description: 'A timeless basic poplin shirt with clean proportions, tonal matte buttons, and a crisp point collar.',
  },
  {
    id: '160be25a-895c-4787-8622-6e0ce805870d',
    slug: 'minimalist-crisp-white-oxford-shirt',
    name: 'Minimalist Crisp White Oxford Shirt',
    category: 'Shirts',
    categoryId: 'd0eeae96-eeda-4c00-aa43-2f2d1746903d',
    color: 'Crisp White',
    price: 1799,
    originalPrice: 2899,
    badge: 'BESTSELLER',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#FFFFFF', name: 'Crisp White' },
      { hex: '#A8C4D4', name: 'Sky Blue' },
    ],
    isFeatured: true,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '100% Ring-Spun Oxford Cotton (160 GSM). Breathable woven basketweave.',
    careInstructions: 'Machine wash 40°C. Medium iron.',
    description: 'Clean button-down collar Oxford shirt with structured casual drape.',
  },
  {
    id: 'f91f044a-9b76-4b4a-9d72-c2eca2d3c5a6',
    slug: 'classic-charcoal-linen-shirt',
    name: 'Classic Charcoal Linen Shirt',
    category: 'Shirts',
    categoryId: 'd0eeae96-eeda-4c00-aa43-2f2d1746903d',
    color: 'Charcoal Grey',
    price: 2199,
    originalPrice: 3499,
    badge: 'NEW',
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#333333', name: 'Charcoal Grey' },
      { hex: '#111111', name: 'Plain Black' },
    ],
    isFeatured: false,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '100% Pure Washed European Linen (150 GSM).',
    careInstructions: 'Cold hand wash or machine gentle. Line dry.',
    description: 'Breathable washed linen shirt designed for effortless year-round styling.',
  },
  {
    id: '7ca1f64f-b5b8-4ac0-a4b7-4df7f51cde3b',
    slug: 'relaxed-navy-camp-collar-shirt',
    name: 'Relaxed Navy Camp Collar Shirt',
    category: 'Shirts',
    categoryId: 'd0eeae96-eeda-4c00-aa43-2f2d1746903d',
    color: 'Deep Navy',
    price: 1699,
    originalPrice: 2699,
    badge: 'POPULAR',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#1A2040', name: 'Deep Navy' },
      { hex: '#111111', name: 'Plain Black' },
    ],
    isFeatured: false,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '100% Breathable Rayon Poplin (130 GSM). Silky matte drape.',
    careInstructions: 'Machine wash 30°C. Cool iron.',
    description: 'Relaxed camp collar silhouette in deep navy for refined casual wear.',
  },
  {
    id: 'f8b8097a-9bc4-4555-87e9-1220d2f34266',
    slug: 'clean-slate-grey-minimalist-tee',
    name: 'Clean Slate Grey Minimalist Tee',
    category: 'Tees',
    categoryId: '33150d77-3ef5-4063-a01e-68c50aec9018',
    color: 'Slate Grey',
    price: 999,
    originalPrice: 1699,
    badge: 'BASIC',
    images: [
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#6A7079', name: 'Slate Grey' },
      { hex: '#111111', name: 'Plain Black' },
    ],
    isFeatured: false,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '190 GSM 100% Cotton.',
    careInstructions: 'Machine wash 30°C.',
    description: 'Understated slate grey basic tee tailored for everyday comfort.',
  },
  {
    id: '5a7857fd-cc0a-4091-94f0-5f37adcdf9f2',
    slug: 'matte-charcoal-windbreaker-jacket',
    name: 'Matte Charcoal Windbreaker Jacket',
    category: 'Jackets',
    categoryId: '209d5bab-ec1d-48d8-90f4-874c2b90c35a',
    color: 'Charcoal Grey',
    price: 2799,
    originalPrice: 4499,
    badge: 'NEW',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#333333', name: 'Charcoal Grey' },
      { hex: '#111111', name: 'Plain Black' },
    ],
    isFeatured: false,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: 'Lightweight technical microfiber (wind and light drizzle resistant).',
    careInstructions: 'Machine wash cold 30°C.',
    description: 'Ultra-lightweight minimalist windbreaker jacket with concealed hood and bungee hem.',
  },
  {
    id: '88faf289-529d-4989-a229-22737709b5a3',
    slug: 'pleated-plain-black-trousers',
    name: 'Pleated Plain Black Trousers',
    category: 'Tailoring',
    categoryId: '514b828b-77da-4f6b-af12-7e41968dddd6',
    color: 'Plain Black',
    price: 2499,
    originalPrice: 3999,
    badge: 'BESTSELLER',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#111111', name: 'Plain Black' },
      { hex: '#708090', name: 'Slate Grey' },
    ],
    isFeatured: true,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: 'Poly-Viscose Twill with 3% Elastane stretch.',
    careInstructions: 'Dry clean or cold delicate wash.',
    description: 'Relaxed wide-leg trousers with clean double front pleats and draped silhouette.',
  },
  {
    id: 'f29c19c0-1709-4108-bed8-858a01910030',
    slug: 'clean-slate-grey-relaxed-chino',
    name: 'Clean Slate Grey Relaxed Chino',
    category: 'Tailoring',
    categoryId: '514b828b-77da-4f6b-af12-7e41968dddd6',
    color: 'Slate Grey',
    price: 1999,
    originalPrice: 3299,
    badge: 'ESSENTIAL',
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#708090', name: 'Slate Grey' },
      { hex: '#111111', name: 'Plain Black' },
    ],
    isFeatured: false,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '98% Cotton, 2% Spandex stretch twill.',
    careInstructions: 'Machine wash 40°C.',
    description: 'Everyday modern chino with tailored leg taper and clean welt back pockets.',
  },
  {
    id: '008be438-e9c6-4d8e-96ee-8f30db0c5fdb',
    slug: 'minimalist-matte-black-leather-belt',
    name: 'Minimalist Matte Black Leather Belt',
    category: 'Accessories',
    categoryId: 'a3e6e835-c411-4de2-92ca-3f56d8b00d95',
    color: 'Plain Black',
    price: 1299,
    originalPrice: 1999,
    badge: 'CORE',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'Standard', stock: 50, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#111111', name: 'Plain Black' },
    ],
    isFeatured: true,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '100% Full-Grain Vegetable Tanned Leather with gunmetal brushed pin buckle.',
    careInstructions: 'Wipe with dry cloth.',
    description: '30mm clean minimalist leather belt with bevelled edges and unbranded buckle.',
  },
  {
    id: '1538effa-adcc-43c5-8eaf-0d7c37a6f779',
    slug: 'premium-black-ribbed-cotton-socks-3-pack',
    name: 'Premium Black Ribbed Cotton Socks (3-Pack)',
    category: 'Accessories',
    categoryId: 'a3e6e835-c411-4de2-92ca-3f56d8b00d95',
    color: 'Plain Black',
    price: 599,
    originalPrice: 999,
    badge: 'PACK OF 3',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'Standard', stock: 50, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#111111', name: 'Plain Black' },
    ],
    isFeatured: false,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '80% Combed Cotton, 17% Polyamide, 3% Elastane.',
    careInstructions: 'Machine wash 40°C.',
    description: 'Three pairs of cushioned ribbed everyday socks in solid jet black.',
  },
  {
    id: '4ad0637a-def2-4e78-aed1-0b6af1303d04',
    slug: 'classic-deep-navy-slim-fit-blazer',
    name: 'Classic Deep Navy Slim Fit Blazer',
    category: 'Formals',
    categoryId: '31dc345a-c6bb-4b51-9b24-fbd6278f47ea',
    color: 'Deep Navy',
    price: 4599,
    originalPrice: 7299,
    badge: 'CORE',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#1A2040', name: 'Deep Navy' },
    ],
    isFeatured: false,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: 'Italian spun stretch wool-poly blend.',
    careInstructions: 'Dry clean.',
    description: 'Versatile navy blazer with contemporary half-canvas chest construction.',
  },
  {
    id: '0ab11c02-1497-4194-a0b6-5bf111e1af34',
    slug: 'formal-crisp-white-french-cuff-dress-shirt',
    name: 'Formal Crisp White French Cuff Dress Shirt',
    category: 'Formals',
    categoryId: '31dc345a-c6bb-4b51-9b24-fbd6278f47ea',
    color: 'Crisp White',
    price: 2199,
    originalPrice: 3499,
    badge: 'PREMIUM',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 12, isSoldOut: false },
      { size: 'M', stock: 24, isSoldOut: false },
      { size: 'L', stock: 18, isSoldOut: false },
      { size: 'XL', stock: 10, isSoldOut: false },
      { size: 'XXL', stock: 6, isSoldOut: false },
    ],
    colorVariants: [
      { hex: '#FFFFFF', name: 'Crisp White' },
    ],
    isFeatured: true,
    isWinterDrop: false,
    inStock: true,
    stockStatus: 'In Stock',
    stock: 50,
    fabricDetails: '100% 2-Ply Egyptian Giza Cotton (120/2 yarn count).',
    careInstructions: 'Machine wash 40°C. Hot iron with steam.',
    description: 'Luxury white formal dress shirt with stiffened spread collar and double French cuffs.',
  },
];

// ─── 6. REAL ORDERS ───────────────────────────────────────────────────────────
const ORDERS = [
  {
    id: '67fad4bc-0ef6-431c-90d8-c0169cb26035',
    orderNumber: 'PGN-829991-902',
    customerName: 'Test User',
    email: 'tester@penguin.com',
    phone: '9876543210',
    shippingAddress: {
      city: 'Mumbai',
      name: 'Test User',
      email: 'tester@penguin.com',
      line1: '123 Fashion Blvd',
      phone: '9876543210',
      state: 'Maharashtra',
      pincode: '400050',
    },
    subtotal: 1999,
    shippingFee: 0,
    discount: 0,
    total: 1999,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'Processing',
    trackingNumber: 'EXP-19616806',
    status: 'pending',
  },
];

const ORDER_ITEMS = [
  {
    id: '14789812-da0d-41b2-bb2c-503e1c6adb86',
    orderId: '67fad4bc-0ef6-431c-90d8-c0169cb26035',
    productId: 'prod_1791293829990',
    name: 'Structured Poplin Shirt',
    price: 1999,
    size: 'M',
    color: 'Default',
    quantity: 1,
  },
];

// ─── 7. REAL SITE CONFIG ──────────────────────────────────────────────────────
const SITE_CONFIG = {
  id: '8dea67b7-b856-49e7-a9c2-7ccc3dc6799c',
  marqueeText: 'COMPLIMENTARY EXPRESS WORLDWIDE SHIPPING ON ALL ORDERS OVER ₹5,000 — 100% HANDCRAFTED ATELIER TAILORING',
  heroHeadline: 'ATELIER PRECISION. TIMELESS SILHOUETTES.',
  heroSubheadline: 'Handcrafted menswear engineered for contemporary elegance and effortless structure.',
  heroDropTag: 'WINTER CAPSULE 2026',
  showWinterDrop: true,
  winterDropTitle: 'WINTER DROP 01',
  winterDropSubtitle: 'Limited capsule — Structured outerwear, heavyweight knitwear & tech bombers. Only 100 units per style.',
  winterDropCta: 'Explore Winter Capsule',
  enableCod: true,
};

async function restoreActualDatabase() {
  console.log('🔄 Restoring curated store database into PostgreSQL...');

  // 1. Wipe mock / temporary data in reverse dependency order
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.siteConfig.deleteMany({});

  // 2. Insert Categories
  for (const c of CATEGORIES) {
    await prisma.category.create({ data: c });
  }
  console.log(`✅ Restored ${CATEGORIES.length} Categories`);

  // 3. Insert Users (Admin & SuperAdmin)
  for (const u of USERS) {
    await prisma.user.create({ data: u });
  }
  console.log(`✅ Restored ${USERS.length} Admin Users`);

  // 4. Insert Customers
  for (const cust of CUSTOMERS) {
    await prisma.customer.create({ data: cust });
  }
  console.log(`✅ Restored ${CUSTOMERS.length} Customers`);

  // 5. Insert Addresses
  for (const a of ADDRESSES) {
    await prisma.address.create({ data: a });
  }
  console.log(`✅ Restored ${ADDRESSES.length} Customer Addresses`);

  // 6. Insert Products
  for (const p of PRODUCTS) {
    await prisma.product.create({ data: p });
  }
  console.log(`✅ Restored ${PRODUCTS.length} Curated Products`);

  // 7. Insert Orders & OrderItems
  for (const o of ORDERS) {
    await prisma.order.create({ data: o });
  }
  for (const oi of ORDER_ITEMS) {
    await prisma.orderItem.create({ data: oi });
  }
  console.log(`✅ Restored ${ORDERS.length} Orders with OrderItems`);

  // 8. Insert Site Config
  await prisma.siteConfig.create({ data: SITE_CONFIG });
  console.log('✅ Restored Site Configuration');

  console.log('\n🎉 DATABASE RESTORATION COMPLETE: All curated data is live in Supabase!');
}

restoreActualDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error restoring database:', err);
    process.exit(1);
  });
