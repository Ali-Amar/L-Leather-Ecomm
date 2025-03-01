import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import ProductList from '../components/product/ProductList';
import Button from '../components/common/Button';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const selectedCategory = searchParams.get('category');

  return (
    <div className="min-h-screen bg-gray-50"> {/* Changed background */}
      {/* Shop Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm"> {/* Added shadow */}
        <div className="container mx-auto px-4 py-8"> {/* Increased padding */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900"> {/* Increased size */}
                {selectedCategory ? 
                  `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` : 
                  'Our Collection'
                }
              </h1>
              {selectedCategory && (
                <p className="mt-2 text-gray-600"> {/* Changed color and increased margin */}
                  Browse our selection of {selectedCategory.toLowerCase()}
                </p>
              )}
            </div>
            <Button
              onClick={() => setIsFilterOpen(true)}
              variant="outline"
              className="flex items-center gap-2 border-[#0A4B3B] text-[#0A4B3B] hover:bg-[#0A4B3B] hover:text-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter & Sort
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!selectedCategory && (
          <div className="grid grid-cols-1 gap-8 mb-12">
            {/* Wallets Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Wallets</h2>
                <Button 
                  variant="link" 
                  href="/shop?category=wallets"
                  className="text-[#0A4B3B] hover:text-[#0A4B3B]/80"
                >
                  View All Wallets
                </Button>
              </div>
              <ProductList 
                isFilterOpen={isFilterOpen} 
                onFilterClose={() => setIsFilterOpen(false)}
                categoryFilter="Wallets"
              />
            </div>

            {/* Cardholders Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Cardholders</h2>
                <Button 
                  variant="link" 
                  href="/shop?category=cardholders"
                  className="text-[#0A4B3B] hover:text-[#0A4B3B]/80"
                >
                  View All Cardholders
                </Button>
              </div>
              <ProductList 
                isFilterOpen={isFilterOpen} 
                onFilterClose={() => setIsFilterOpen(false)}
                categoryFilter="Cardholders"
              />
            </div>
          </div>
        )}

        {selectedCategory && (
          <ProductList 
            isFilterOpen={isFilterOpen} 
            onFilterClose={() => setIsFilterOpen(false)}
            categoryFilter={selectedCategory}
          />
        )}
      </div>

      {/* Additional Info */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"> 
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-gray-600">
                On orders over Rs. 10,000
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Quality Guarantee
              </h3>
              <p className="text-gray-600">
                100% genuine leather products
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"> 
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Easy Returns
              </h3>
              <p className="text-gray-600">
                30-day return policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;