import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, Star, ArrowRight } from 'lucide-react';
import { fetchProducts, selectAllProducts, selectProductsLoading, selectProductsError } from '../features/products/productSlice';
import { fetchCategories, selectAllCategories, selectCategoriesLoading, selectCategoriesError } from '../features/categories/categorySlice';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');

  // Redux selectors with default empty arrays
  const products = useSelector(selectAllProducts) || [];
  const categories = useSelector(selectAllCategories) || [];
  const isProductsLoading = useSelector(selectProductsLoading);
  const isCategoriesLoading = useSelector(selectCategoriesLoading);
  const productsError = useSelector(selectProductsError);
  const categoriesError = useSelector(selectCategoriesError);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProducts({ featured: true, limit: 4 })).unwrap(),
          dispatch(fetchCategories()).unwrap()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Successfully subscribed to newsletter');
      setEmail('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to subscribe to newsletter');
    }
  };

  // Error states
  if (productsError || categoriesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {productsError || categoriesError}
          </p>
          <Button 
            onClick={() => {
              dispatch(fetchProducts({ featured: true, limit: 4 }));
              dispatch(fetchCategories());
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src="/images/hero.jpg"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
                Timeless Leather Craftsmanship
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Discover our collection of handcrafted leather goods, where tradition meets contemporary design.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/shop')}
                >
                  Shop Collection
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white border-white hover:bg-white/20"
                  onClick={() => navigate('/categories')}
                >
                  Explore Categories
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mt-8 py-16 border-t border-gray-200 bg-[#efdecd]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif">Featured Products</h2>
            <Link 
              to="/shop"
              className="text-[#0A4B3B] hover:text-white hover:bg-[#0A4B3B] flex items-center gap-2 border border-[#0A4B3B] rounded-md px-4 py-2 transition-colors duration-300"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {isProductsLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : products?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-4 shadow-md">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No products available</p>
          )}
        </div>
      </section>

      {/* About/Story Section */}
      <section className="mt-8 py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="shadow-lg rounded-lg overflow-hidden">
              <img
                src="/images/craft.jpg"
                alt="Craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-serif mb-6">Our Craft, Your Story</h2>
              <p className="text-gray-600 mb-6">
                At L'ardene, we believe in the timeless appeal of expertly crafted leather goods. 
                Each piece is carefully handmade by our skilled artisans, combining traditional 
                techniques with contemporary design to create accessories that stand the test of time.
              </p>
              <p className="text-gray-600 mb-8">
                Our commitment to quality means we source only the finest leather and materials, 
                ensuring that every product not only looks beautiful but becomes even more 
                characterful with age.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offer */}
      <section className="relative mt-8 py-16 bg-primary text-white border-t border-primary-dark">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-serif mb-4">Special Offers</h2>
          <p className="text-xl mb-8">Coming Soon</p>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => navigate('/shop')}
          >
            Shop Now
          </Button>
        </div>
      </section>

    </div>
  );
};

export default Home;