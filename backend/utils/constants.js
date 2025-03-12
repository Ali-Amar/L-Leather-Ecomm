// Cities for Delivery
exports.PAKISTAN_REGIONS = {
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

exports.CITIES = Object.values(exports.PAKISTAN_REGIONS).flat();

  // Shipping Configuration
  exports.SHIPPING = {
    FREE_SHIPPING_THRESHOLD: 10000, // Free shipping for orders above 10,000 PKR
    DEFAULT_SHIPPING_FEE: 229 // Default shipping fee is 500 PKR
  };
  
  // Other necessary constants can be added here later