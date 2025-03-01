import { useState } from 'react';
import { CreditCard, Truck, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentFormContent = ({ onSubmit, isProcessing, orderTotal }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardError, setCardError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('PaymentForm - Starting submission with method:', paymentMethod);
    
    if (isSubmitting || isProcessing) {
      console.log('PaymentForm - Already processing, returning');
      return;
    }
    
    setIsSubmitting(true);
    setCardError(null);

    try {
      // Handle Cash on Delivery
      if (paymentMethod === 'cod') {
        try {
          console.log('PaymentForm - Processing COD payment - DIRECT FLOW');
          const result = await onSubmit({
            method: 'cod',
            status: 'pending'
          });
          console.log('PaymentForm - COD order submission result:', result);
          return; // Return early with successful result
        } catch (error) {
          console.error('PaymentForm - COD payment error:', error);
          toast.error(error.message || 'Failed to process order');
          setIsSubmitting(false);
          return; // Return early with error
        }
      }

      // Handle Card Payment
      if (!stripe || !elements) {
        throw new Error('Payment system is not ready');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card information is required');
      }

      // Create payment intent
      console.log('PaymentForm - Creating payment intent');
      const intentResponse = await api.post('/payments/create-intent', {
        amount: orderTotal,
      });

      const { clientSecret } = intentResponse.data;
      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      console.log('PaymentForm - Confirming card payment');
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error('Payment failed');
      }

      console.log('PaymentForm - Payment successful, creating order');
      await onSubmit({
        method: 'card',
        status: 'processing',
        paymentIntentId: paymentIntent.id
      });

    } catch (error) {
      console.error('Payment submission error:', error);
      setCardError(error.message);
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : '');
  };

  const handlePaymentMethodSelect = (method) => {
    if (!isProcessing && !isSubmitting) {
      setPaymentMethod(method);
      setCardError(null);
    }
  };

  const isFormDisabled = isProcessing || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">Payment Method</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={isFormDisabled}
            onClick={() => handlePaymentMethodSelect('card')}
            className={`p-4 border rounded-lg text-left focus:outline-none ${
              paymentMethod === 'card'
                ? 'border-primary ring-1 ring-primary'
                : 'border-gray-200'
            } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className={`w-5 h-5 ${
                paymentMethod === 'card' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div>
                <p className="font-medium text-gray-900">Credit Card</p>
                <p className="text-sm text-gray-500">Pay now with your card</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={isFormDisabled}
            onClick={() => handlePaymentMethodSelect('cod')}
            className={`p-4 border rounded-lg text-left focus:outline-none ${
              paymentMethod === 'cod'
                ? 'border-primary ring-1 ring-primary'
                : 'border-gray-200'
            } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Truck className={`w-5 h-5 ${
                paymentMethod === 'cod' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div>
                <p className="font-medium text-gray-900">Cash on Delivery</p>
                <p className="text-sm text-gray-500">Pay when you receive</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Details
            </label>
            <div className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#32325d',
                      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                      fontSmoothing: 'antialiased',
                      '::placeholder': {
                        color: '#aab7c4'
                      }
                    },
                    invalid: {
                      color: '#fa755a',
                      iconColor: '#fa755a'
                    }
                  },
                  hidePostalCode: true
                }}
                onChange={handleCardChange}
                disabled={isFormDisabled}
              />
            </div>
            {cardError && (
              <p className="mt-2 text-sm text-red-600">{cardError}</p>
            )}
          </div>
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        disabled={isFormDisabled || (paymentMethod === 'card' && !stripe)}
        className="mt-6"
      >
        {isFormDisabled ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner size="sm" className="mr-2" />
            Processing...
          </span>
        ) : (
          paymentMethod === 'cod' ? 'Place Order (Cash on Delivery)' : 'Pay & Place Order'
        )}
      </Button>

      {paymentMethod === 'cod' ? (
        <p className="text-center text-sm text-gray-500 mt-4">
          You will pay Rs. {orderTotal.toLocaleString()} when your order is delivered
        </p>
      ) : (
        <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
          <Lock className="w-4 h-4 mr-1" />
          <p>Secure payment powered by Stripe</p>
        </div>
      )}
    </form>
  );
};

const PaymentForm = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentFormContent {...props} />
  </Elements>
);

export default PaymentForm;