// Product Categories
export const PRODUCT_CATEGORIES = ['Wallets', 'Cardholders'];

// Product Colors with their hex values
export const PRODUCT_COLORS = [
  { name: 'Brown', value: '#8B4513' },
  { name: 'Blue', value: '#00265C' },
  { name: 'Red', value: '#800020' }
];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  COD: 'cod'
};

// Product Sort Options
export const ORDER_FILTERS = {
  DATE_RANGES: {
    ALL: 'all',
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year'
  },
  SORT_OPTIONS: {
    DATE_DESC: 'date-desc',
    DATE_ASC: 'date-asc',
    AMOUNT_DESC: 'amount-desc',
    AMOUNT_ASC: 'amount-asc'
  }
};

// Price Ranges
export const PRICE_RANGES = [
  { label: 'Under ₨2,000', min: 0, max: 2000 },
  { label: '₨2,000 - ₨5,000', min: 2000, max: 5000 },
  { label: '₨5,000 - ₨10,000', min: 5000, max: 10000 },
  { label: 'Over ₨10,000', min: 10000, max: null }
];

export const PAKISTAN_REGIONS = {
  Punjab: [
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 
    'Sialkot', 'Sheikhupura', 'Gujrat', 'Bahawalpur'
  ],
  Sindh: [
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana'
  ],
  AJK: [
    'Mirpur', 'Bhimber', 'Kotli', 'Muzaffarabad', 'Rawalakot'
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar', 'Mardan', 'Mingora', 'Kohat', 'Abbottabad'
  ],
  Balochistan: [
    'Quetta', 'Turbat', 'Khuzdar', 'Gwadar', 'Hub'
  ],
  'Islamabad Capital Territory': [
    'Islamabad'
  ]
};

// Shipping thresholds
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 10000,
  DEFAULT_SHIPPING_FEE: 229
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  DEFAULT_PAGE: 1
};

// Stock thresholds
export const STOCK = {
  LOW_STOCK_THRESHOLD: 5,
  OUT_OF_STOCK: 0
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Form Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^\+?[\d\s-]{10,}$/,
  POSTAL_CODE_REGEX: /^\d{5}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// API Endpoints (if needed)
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  ORDERS: '/orders',
  AUTH: '/auth',
  USERS: '/users',
  CATEGORIES: '/categories',
  CART: '/cart',
  PAYMENTS: '/payments'
};

// Image Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILES: 5
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check your input and try again.',
  FILE_SIZE: 'File size exceeds maximum limit.',
  FILE_TYPE: 'File type not supported.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ITEM_ADDED: 'Item added successfully',
  ITEM_UPDATED: 'Item updated successfully',
  ITEM_DELETED: 'Item deleted successfully',
  ORDER_PLACED: 'Order placed successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};