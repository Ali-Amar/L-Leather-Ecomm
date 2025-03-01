import { useNavigate } from 'react-router-dom';
import { ChevronRight, Package, Briefcase, Wallet, Watch } from 'lucide-react';

const CategoriesPage = () => {
  const navigate = useNavigate();
  
  // Hardcoded categories data
  const categories = [
    {
      _id: 'wallets',
      name: 'Wallets',
      description: 'Handcrafted leather wallets for everyday elegance. Each piece tells a story of craftsmanship and style.',
      image: '/images/categories/wallets.jpg',
      itemCount: 12
    },
    {
      _id: 'cardholders',
      name: 'Cardholders',
      description: 'Slim and sophisticated leather cardholders. Perfect for the modern minimalist.',
      image: '/images/products/cardholder.jpg',
      itemCount: 8
    }
  ];

  // Icon mapping for categories
  const iconMapping = {
    'Wallets': Wallet,
    'Cardholders': Package
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0">
          <img
            src="/images/categories/hero.jpg"
            alt="Leather craftsmanship"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative container mx-auto px-4 py-10 sm:py-14">
          <h1 className="text-4xl sm:text-5xl font-serif mb-4 text-center">
            Shop by Category
          </h1>
          
          {/* Expert Craftsmanship Box */}
          <div className="max-w-3xl mx-auto p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
            <p className="text-gray-600 text-center">
              Each category represents our commitment to quality and authenticity. 
              Our leather goods are crafted with precision and care, ensuring every 
              piece meets our high standards of excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => {
            const Icon = iconMapping[category.name] || Package;
            return (
              <div
                key={category._id}
                onClick={() => navigate(`/shop?category=${category.name.toLowerCase()}`)}
                className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer 
                  transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Main Image */}
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover object-center 
                      transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="relative transform transition-transform duration-300 group-hover:translate-y-0">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-[#0A4B3B] rounded-full flex items-center justify-center mb-4
                      transform transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Text Content */}
                    <h3 className="text-2xl font-serif text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-200 mb-4 opacity-0 transform translate-y-4
                      transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      {category.description}
                    </p>
                    
                    {/* Items Count & CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="flex items-center text-white text-sm font-medium">
                        Shop Now 
                        <ChevronRight className="w-4 h-4 ml-1 transform transition-transform 
                          duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quality Promise Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12">Our Quality Promise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0A4B3B] rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Premium Materials</h3>
              <p className="text-gray-600">
                Only the finest leather is selected for our products
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0A4B3B] rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Expert Craftsmanship</h3>
              <p className="text-gray-600">
                Handcrafted by skilled artisans with years of experience
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0A4B3B] rounded-full flex items-center justify-center mx-auto mb-4">
                <Watch className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Timeless Design</h3>
              <p className="text-gray-600">
                Classic styles that stand the test of time
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;