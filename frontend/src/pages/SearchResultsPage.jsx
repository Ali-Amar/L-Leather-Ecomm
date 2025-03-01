import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts, // Change this from searchProducts
  selectFilteredProducts,
  selectProductsLoading,
  selectProductsError,
  selectProductPagination,
  setPage
} from '../features/products/productSlice';
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SearchResultsPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const results = useSelector(selectFilteredProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  useEffect(() => {
    if (!query.trim()) return;

    dispatch(fetchProducts({
      search: query,
      page: 1,
      limit: 12
    }));
  }, [query, dispatch]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {results.length === 0 
            ? `No results found for "${query}"`
            : `Search results for "${query}"`}
        </h1>
        <p className="mt-2 text-gray-600">
          {results.length} {results.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            We couldn't find any products matching your search.
          </p>
          <p className="text-gray-500">
            Try checking your spelling or using different keywords.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;