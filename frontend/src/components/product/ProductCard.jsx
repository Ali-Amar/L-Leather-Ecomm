import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { addToCart } from '../../features/cart/cartSlice';
import { formatPrice } from '../../services/productService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { _id, name, price, images, rating, reviews, stock, colors, description, category } = product;
  const dispatch = useDispatch();
  
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleQuickView = () => {
    setIsQuickViewOpen(true);  // Just open the modal instead of dispatching to Redux
  };

  const handleAddToCart = async () => {
    if (stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
  
    // Add this debug check
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }
  
    setIsLoading(true);
    try {
      console.log('Token exists:', token); // Debug log
      const result = await dispatch(addToCart({
        productId: _id,
        quantity: 1,
        selectedColor
      })).unwrap();
      console.log('Add to cart result:', result); // Debug log
    } catch (error) {
      console.error('Add to cart error:', error); // Full error log
      toast.error(error?.message || 'Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = () => {
    if (stock === 0) return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    if (stock <= 5) return { text: `Only ${stock} left`, class: 'bg-yellow-100 text-yellow-800' };
    return null;
  };

  const stockStatus = getStockStatus();

  // Helper function to handle image errors
  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-product.jpg'; // Fallback image
  };

  // Color display helper
  const getColorStyle = (color) => {
    const colorMap = {
      'Brown': '#8B4513',
      'Blue': '#00265C',
      'Red': '#800020'
    };
    return colorMap[color] || color;
  };

  // QuickView Modal Component
  const QuickViewModal = () => (
    <Modal
      open={isQuickViewOpen}
      onClose={() => setIsQuickViewOpen(false)}
      title={name}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={images[currentImageIndex]}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index 
                      ? 'border-primary' 
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${name} - View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{category}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({reviews} reviews)
            </span>
          </div>

          <p className="text-2xl font-medium text-gray-900">
            {formatPrice(price)}
          </p>

          <p className="text-gray-600">{description}</p>

          {/* Color Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Colors</h4>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === color
                      ? 'border-primary scale-110'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleAddToCart}
              disabled={isLoading || stock === 0}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isLoading ? 'Adding...' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            <Link to={`/product/${_id}`}>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsQuickViewOpen(false)}
              >
                View Full Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      <div 
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <Link to={`/product/${_id}`} className="block">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
            <img
              src={images[0]}
              alt={name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Quick view button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleQuickView();
              }}
              className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className="bg-white text-gray-900 px-4 py-2 rounded-md flex items-center gap-2 transform transition-transform duration-300 hover:scale-105">
                <Eye className="w-4 h-4" />
                Quick View
              </span>
            </button>

            {/* Stock badge */}
            {stock <= 5 && (
              <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                {stock === 0 ? 'Out of Stock' : `Only ${stock} left`}
              </span>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="mt-4">
          <h3 className="text-base font-medium text-gray-900 group-hover:text-[#0A4B3B] transition-colors">
            <Link to={`/product/${_id}`}>{name}</Link>
          </h3>
          
          <p className="mt-1 text-sm text-gray-500">{category}</p>
          
          <div className="mt-1 flex items-center gap-2">
            <p className="font-medium text-gray-900">{formatPrice(price)}</p>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-500 ml-1">{rating}</span>
            </div>
          </div>

          {/* Color options */}
          <div className="mt-2 flex gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                  selectedColor === color
                    ? 'border-[#8B4513] scale-110'
                    : 'border-gray-200'
                }`}
                style={{ 
                  backgroundColor: 
                    color === 'Brown' ? '#8B4513' :
                    color === 'Black' ? '#000000' :
                    color === 'Tan' ? '#D2B48C' :
                    color === 'Red' ? '#800020' :
                    color 
                }}
                title={color}
              />
            ))}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading || stock === 0}
            className={`mt-4 w-full py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${
              stock === 0
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-[#0A4B3B] text-white hover:bg-[#0A4B3B]/90 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isLoading ? 'Adding...' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <QuickViewModal />
    </>
  );
};

export default ProductCard;