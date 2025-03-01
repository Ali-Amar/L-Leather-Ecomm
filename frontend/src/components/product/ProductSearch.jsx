import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchProducts, selectFilteredProducts } from '../../features/products/productSlice';

const ProductSearch = ({ onClose, className = '' }) => {
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchResults = useSelector(selectFilteredProducts);

  useEffect(() => {
    const handleSearch = () => {
      if (query.trim().length < 2) {
        dispatch(searchProducts(''));
        return;
      }
      
      dispatch(searchProducts(query));
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onClose) onClose();
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    if (onClose) onClose();
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {query.trim().length >= 2 && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="max-h-96 overflow-auto">
            {searchResults.slice(0, 5).map((product) => (
              <li key={product.id}>
                <button
                  onClick={() => handleResultClick(product.id)}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-gray-900">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {product.category}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {searchResults.length > 5 && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-2 text-sm text-primary hover:bg-gray-50 rounded-md transition-colors text-center"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;