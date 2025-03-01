import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, Loader } from 'lucide-react';
import { updateCartItem, removeFromCart } from '../../features/cart/cartSlice';
import { formatPrice } from '../../services/productService';
import toast from 'react-hot-toast';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > item.stock) return;
    
    setIsUpdating(true);
    try {
      await dispatch(updateCartItem({
        productId: item.product,
        data: {
          quantity: newQuantity,
          color: item.color
        }
      })).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async () => {
    setIsRemoving(true);
    try {
      // Just pass the id string directly
      await dispatch(removeFromCart({
        productId: item.product._id || item.product,
        color: item.color
      })).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Failed to remove item');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex py-6 border-b">
      {/* Product Image */}
      <Link 
        to={`/product/${item.product}`}
        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200"
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            e.target.src = '/images/placeholder-product.jpg';
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <div>
            <Link 
              to={`/product/${item.product}`}
              className="font-medium text-gray-700 hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-gray-500">Color: {item.color}</p>
            {item.stock <= 5 && (
              <p className="mt-1 text-sm text-yellow-600">
                Only {item.stock} left in stock
              </p>
            )}
          </div>
          <p className="ml-4">{formatPrice(item.price * item.quantity)}</p>
        </div>

        <div className="flex flex-1 items-end justify-between text-sm">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="text-gray-900 w-8 text-center">
              {isUpdating ? (
                <Loader className="w-4 h-4 mx-auto animate-spin" />
              ) : (
                item.quantity
              )}
            </span>

            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.stock}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemoveItem}
            disabled={isRemoving}
            className="font-medium text-primary hover:text-primary-dark flex items-center gap-1 disabled:opacity-50"
          >
            {isRemoving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Remove
          </button>
        </div>

        {/* Unit Price */}
        <p className="text-sm text-gray-500 mt-2">
          {formatPrice(item.price)} each
        </p>
      </div>
    </div>
  );
};

export default CartItem;