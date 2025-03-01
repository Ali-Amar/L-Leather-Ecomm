import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Minus, Plus, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { fetchProductById, selectSelectedProduct, selectProductsLoading, selectProductsError } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import ProductReviews from './ProductReviews';
import { formatPrice } from '../../services/productService';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const product = useSelector(selectSelectedProduct);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setMainImage(product.images[0]);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => navigate('/shop')}
        >
          Return to Shop
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Product not found</p>
        <Button
          variant="outline"
          onClick={() => navigate('/shop')}
        >
          Return to Shop
        </Button>
      </div>
    );
  }

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({
        productId: product._id,
        quantity,
        selectedColor
      })).unwrap();
      toast.success('Added to cart successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const stockStatus = product.stock === 0 
    ? { text: 'Out of Stock', class: 'text-red-600' }
    : product.stock <= 5 
    ? { text: `Only ${product.stock} left`, class: 'text-yellow-600' }
    : { text: 'In Stock', class: 'text-green-600' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(image)}
                className={`aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                  mainImage === image ? 'ring-2 ring-primary' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${idx + 1}`}
                  className="h-full w-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-lg font-medium text-gray-900">
            {formatPrice(product.price)}
          </p>

          {/* Rating */}
          <div className="mt-4">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <Star
                  key={rating}
                  className={`h-5 w-5 flex-shrink-0 ${
                    product.rating > rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <p className="ml-3 text-sm text-gray-500">
                {product.reviews} reviews
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <p className="text-base text-gray-600">
              {product.description}
            </p>
          </div>

          {/* Color Selection */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Color</h3>
            <div className="mt-2 flex space-x-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`relative h-8 w-8 rounded-full border-2 ${
                    selectedColor === color
                      ? 'border-primary'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  <span className="sr-only">{color}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <p className={`mt-4 text-sm ${stockStatus.class}`}>
            {stockStatus.text}
          </p>

          {/* Quantity Selector */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <div className="mt-2 flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="rounded-md p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-gray-900 w-8 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="rounded-md p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Add to Cart & Share Buttons */}
          <div className="mt-8 flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0}
              className="flex-1"
              size="lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              size="lg"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="mt-16 border-t border-gray-200 pt-10">
        <ProductReviews productId={product._id} />
      </div>
    </div>
  );
};

export default ProductDetail;