import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Loader } from 'lucide-react';
import { 
  fetchCart,
  clearCart,
  selectCartItems, 
  selectCartLoading,
  selectCartError 
} from '../features/cart/cartSlice';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const isLoading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Failed to clear cart');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => dispatch(fetchCart())}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some items to your cart and they will appear here
          </p>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        {/* Cart Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900">
            Shopping Cart ({cartItems.length})
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCart}
          >
            Clear Cart
          </Button>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <section className="lg:col-span-7">
            <div className="space-y-4 divide-y divide-gray-200">
              {cartItems.map((item) => (
                <CartItem 
                  key={`${item.product}-${item.color}-${item._id}`}
                  item={item} 
                />
              ))}
            </div>
          </section>

          {/* Cart Summary */}
          <section className="lg:col-span-5 mt-8 lg:mt-0">
            <CartSummary />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cart;