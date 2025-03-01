import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import Button from '../common/Button';
import _ from 'lodash';
import { 
  fetchProducts, 
  updateFilters,
  clearFilters,
  setPage,
  selectFilteredProducts, 
  selectProductsLoading,
  selectProductFilters,
  selectProductPagination,
  selectProductsError
} from '../../features/products/productSlice';
import { fetchCategories } from '../../features/categories/categorySlice';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS } from '../../utils/constants';

const PRICE_RANGES = [
  { label: 'Under ₨2,000', min: 0, max: 2000 },
  { label: '₨2,000 - ₨5,000', min: 2000, max: 5000 },
  { label: '₨5,000 - ₨10,000', min: 5000, max: 10000 },
  { label: 'Over ₨10,000', min: 10000, max: null }
];

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' }
];

const ProductList = ({ isFilterOpen, onFilterClose, selectedCategory, categoryFilter }) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const products = useSelector(selectFilteredProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const currentFilters = useSelector(selectProductFilters);
  const pagination = useSelector(selectProductPagination);

  // Local state
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  // Create a debounced fetch function
  const debouncedFetch = useCallback(
    _.debounce((filters) => {
      dispatch(fetchProducts(filters))
        .unwrap()
        .catch(error => {
          console.error('Error fetching products:', error);
        });
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    if (!hasInitialFetch) {
      // Fetch categories only once
      dispatch(fetchCategories());
      setHasInitialFetch(true);
    }

    const filters = {
      category: selectedCategory || currentFilters.category,
      colors: currentFilters.colors.join(','),
      sortBy: currentFilters.sortBy,
      page: pagination.currentPage,
      limit: pagination.limit,
      minPrice: currentFilters.priceRange?.min,
      maxPrice: currentFilters.priceRange?.max
    };

    debouncedFetch(filters);

    // Cleanup
    return () => {
      debouncedFetch.cancel();
    };
  }, [
    hasInitialFetch,
    selectedCategory,
    categoryFilter,
    currentFilters.category,
    currentFilters.colors,
    currentFilters.sortBy,
    currentFilters.priceRange,
    pagination.currentPage,
    pagination.limit,
    debouncedFetch
  ]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(updateFilters({ [filterType]: value }));
    dispatch(setPage(1)); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(setPage(1));
  };

  // Filter sidebar content
  const FilterPanel = () => (
    <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
      isFilterOpen ? 'translate-x-0' : 'translate-x-full'
    } z-50`}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Filters</h3>
          <button onClick={onFilterClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Categories */}
          <div>
            <h4 className="font-medium mb-3">Category</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className={`block w-full text-left px-3 py-2 rounded-md ${
                  currentFilters.category === 'all'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {PRODUCT_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange('category', category)}
                  className={`block w-full text-left px-3 py-2 rounded-md ${
                    currentFilters.category === category
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Ranges */}
          <div>
            <h4 className="font-medium mb-3">Price Range</h4>
            <div className="space-y-2">
              {PRICE_RANGES.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterChange('priceRange', range)}
                  className={`block w-full text-left px-3 py-2 rounded-md ${
                    JSON.stringify(currentFilters.priceRange) === JSON.stringify(range)
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h4 className="font-medium mb-3">Colors</h4>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => {
                    const newColors = currentFilters.colors.includes(color.name)
                      ? currentFilters.colors.filter(c => c !== color.name)
                      : [...currentFilters.colors, color.name];
                    handleFilterChange('colors', newColors);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentFilters.colors.includes(color.name)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-white hover:bg-gray-200 shadow-sm'
                  }`}
                  style={{
                    backgroundColor: currentFilters.colors.includes(color.name) 
                      ? undefined 
                      : color.value
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h4 className="font-medium mb-3">Sort By</h4>
            <select
              value={currentFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            fullWidth
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          variant="outline"
          onClick={() => dispatch(fetchProducts())}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <FilterPanel />
      {/* Products Grid with enhanced styling */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm"> {/* Added styling */}
          <p className="text-gray-500 mb-4">No products match your selected filters.</p>
          <Button 
            variant="outline"
            onClick={handleClearFilters}
            className="hover:bg-[#0A4B3B] hover:text-white transition-colors"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products
              .filter(product => !categoryFilter || product.category === categoryFilter)
              .map((product) => (
                <div key={product._id} className="bg-[#d8f3dc] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"> {/* Added card styling */}
                  <ProductCard product={product} />
                </div>
              ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.limit}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ProductList;