import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import { selectCartItems, selectCartTotal } from '../../features/cart/cartSlice';
import { formatPrice } from '../../utils/helpers';
import api from '../../utils/api';

const CheckoutForm = ({ onSubmit, isProcessing }) => {
  const [activeStep, setActiveStep] = useState('shipping');
  const [shippingData, setShippingData] = useState(null);
  const [shippingDetails, setShippingDetails] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  const handleShippingSubmit = async (data) => {
    setIsValidating(true);
    console.log('CheckoutForm - Validating shipping data:', data);

    try {
      const response = await api.post('/shipping/validate', data);
      console.log('CheckoutForm - Shipping validation response:', response);

      if (response.data.validation?.isValid) {
        setShippingData(data);
        setDeliveryFee(response.data.shippingDetails.fee);
        setActiveStep('payment');
      }
    } catch (error) {
      console.error('CheckoutForm - Shipping validation error:', error);
      toast.error(error?.response?.data?.message || 'Failed to validate shipping information');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePaymentSubmit = async (paymentData) => {
    console.log('CheckoutForm - Payment submission started:', paymentData);
    
    if (!shippingData) {
      toast.error('Please complete shipping information first');
      setActiveStep('shipping');
      return;
    }
  
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id || item.product,
          quantity: item.quantity,
          color: item.color,
          price: item.price,
          name: item.name,
          image: item.image,
        })),
        shippingAddress: shippingData,
        paymentMethod: paymentData.method,
        subtotal: cartTotal,
        shippingFee: deliveryFee,
        total: cartTotal + deliveryFee
      };
  
      console.log('CheckoutForm - Submitting order data:', orderData);
      const result = await onSubmit(orderData);
      
      if (!result?.data) {
        throw new Error('Order creation failed');
      }
  
      // Return the result so CheckoutPage can handle navigation
      return result;
  
    } catch (error) {
      console.error('CheckoutForm - Payment submission error:', error);
      toast.error(error?.message || 'Order creation failed. Please try again.');
      throw error; // Re-throw to reset loading state in parent
    }
  };

  return (
    <div className="space-y-8">
      {/* Shipping Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className={`flex items-center justify-between p-4 bg-gray-50 cursor-pointer ${
            activeStep === 'shipping' ? 'border-b border-gray-200' : ''
          }`}
          onClick={() => setActiveStep('shipping')}
        >
          <div className="flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm mr-3">
              1
            </span>
            <span className="font-medium">Shipping Information</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 transform transition-transform ${
              activeStep === 'shipping' ? 'rotate-180' : ''
            }`} 
          />
        </div>
        
        {activeStep === 'shipping' && (
          <div className="p-4">
            <ShippingForm 
              onSubmit={handleShippingSubmit}
              savedData={shippingData}
              isSubmitting={isValidating}
            />
          </div>
        )}
      </div>

      {/* Payment Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className={`flex items-center justify-between p-4 bg-gray-50 ${!shippingData ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
            activeStep === 'payment' ? 'border-b border-gray-200' : ''
          }`}
          onClick={() => shippingData && setActiveStep('payment')}
        >
          <div className="flex items-center">
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm mr-3 ${
              shippingData ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </span>
            <span className={`font-medium ${!shippingData ? 'text-gray-400' : ''}`}>
              Payment Details
            </span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 transform transition-transform ${
              activeStep === 'payment' ? 'rotate-180' : ''
            }`} 
          />
        </div>
        
        {activeStep === 'payment' && shippingData && (
          <div className="p-4">
            <PaymentForm 
              onSubmit={handlePaymentSubmit}
              isProcessing={isProcessing}
              orderTotal={cartTotal + (deliveryFee || 0)}
            />
          </div>
        )}
      </div>

      {/* Order Summary */}
      {shippingData && deliveryFee !== null && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900">Order Summary</h3>
          <dl className="mt-2 space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Subtotal</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatPrice(cartTotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Shipping</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatPrice(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <dt className="text-sm font-medium text-gray-900">Total</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatPrice(cartTotal + deliveryFee)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>All transactions are secure and encrypted</p>
      </div>
    </div>
  );
};

export default CheckoutForm;