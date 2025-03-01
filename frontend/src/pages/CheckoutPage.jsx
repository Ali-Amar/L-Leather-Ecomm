import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag } from 'lucide-react';
import { 
  selectCartItems, 
  selectCartTotal, 
  clearCart 
} from '../features/cart/cartSlice';
import { 
  createOrder,
  selectOrdersLoading,
  selectOrdersError 
} from '../features/orders/orderSlice';
import CheckoutForm from '../components/checkout/CheckoutForm';
import Button from '../components/common/Button';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const isLoading = useSelector(selectOrdersLoading);
  const orderError = useSelector(selectOrdersError);
  const invalidItems = useSelector(state => state.cart.invalidItems);
 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Redirect to cart if it's empty and we're not already navigating
    if ((cartItems?.length || 0) === 0 && !isNavigating) {
      navigate('/cart');
    }
  }, [cartItems, navigate, isNavigating]);

  useEffect(() => {
    if (invalidItems.length > 0) {
      toast.error('Some items in your cart are invalid. Please update your cart.');
      navigate('/cart');
    }
  }, [invalidItems, navigate]);
  
  const handleCheckout = async (orderData) => {
    console.log('CheckoutPage - Starting checkout process:', orderData);
    setIsProcessing(true);
  
    try {
      const formattedOrderData = {
        items: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          color: item.color,
          price: item.price,
          name: item.name,
          image: item.image
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        subtotal: cartTotal,
        shippingFee: orderData.shippingFee,
        total: cartTotal + orderData.shippingFee
      };
  
      console.log('CheckoutPage - Dispatching createOrder with:', formattedOrderData);
      
      const result = await dispatch(createOrder(formattedOrderData)).unwrap();
      console.log('CheckoutPage - Order creation result:', result);
  
      if (!result) {
        throw new Error('No response received from server');
      }
  
      setIsNavigating(true);
      await dispatch(clearCart());
      
      // Navigate to confirmation page
      navigate('/order-confirmation', { 
        state: { orderId: result.data?._id || result._id } 
      });
      toast.success('Order placed successfully!');
      
    } catch (error) {
      console.error('CheckoutPage - Checkout error:', error);
      setIsProcessing(false);
      toast.error(
        error?.message || 
        'Failed to process order. Please try again or contact support.'
      );
    }
  };

  // Show loading state during navigation
  if (isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-primary animate-bounce" />
          <h2 className="mt-4 text-xl font-medium">Processing your order...</h2>
        </div>
      </div>
    );
  }

  // Redirect to cart if it's empty
  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900 mb-8">
        Checkout
      </h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7">
          <CheckoutForm 
            onSubmit={handleCheckout}
            isProcessing={isProcessing}
            orderTotal={cartTotal}
          />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.color}`} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500">
                      {item.color} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-16 max-w-3xl mx-auto text-center">
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Secure Checkout
          </h3>
          <p className="text-gray-500 text-sm">
            Your payment information is processed securely. We do not store credit card details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;