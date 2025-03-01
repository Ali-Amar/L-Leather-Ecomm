// Search function
export const searchProducts = async (query) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Case insensitive search across multiple fields
  const searchQuery = query.toLowerCase().trim();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchQuery) ||
    product.description.toLowerCase().includes(searchQuery) ||
    product.category.toLowerCase().includes(searchQuery)
  );
};

// Mock product data
export const products = [
    {
      id: 1,
      name: "Classic Leather Wallet",
      price: 2499,
      description: "Handcrafted genuine leather wallet with multiple card slots",
      category: "Wallets",
      images: ['/images/products/wallet.jpg', '/images/products/wallet-1.jpg', '/images/products/wallet-2.jpg'],
      stock: 15,
      colors: ["Brown", "Black", "Tan"],
      rating: 4.5,
      reviews: 128,
    },
    {
      id: 2,
      name: "Business Card Holder",
      price: 1499,
      description: "Professional leather card holder with magnetic closure",
      category: "Accessories",
      images: ["/images/products/cardholder.jpg"],
      stock: 25,
      colors: ["Black", "Brown"],
      rating: 4.6,
      reviews: 42,
    },
    {
      id: 3,
      name: "Leather Laptop Sleeve",
      price: 4999,
      description: "Protective leather sleeve for laptops up to 15 inches",
      category: "Accessories",
      images: ["/images/products/laptop-sleeve.jpg"],
      stock: 12,
      colors: ["Brown", "Black"],
      rating: 4.9,
      reviews: 37,
    },
    {
      id: 4,
      name: "Travel Duffel Bag",
      price: 12999,
      description: "Spacious leather duffel bag for weekend getaways",
      category: "Bags",
      images: ["/images/products/duffel.jpg"],
      stock: 5,
      colors: ["Brown", "Black"],
      rating: 4.8,
      reviews: 29,
    }
  ];
  
  // Helper function to format price in PKR
  export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };