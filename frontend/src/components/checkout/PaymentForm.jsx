import { useState } from 'react';
import { Truck } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const PaymentForm = ({ onSubmit, isProcessing, orderTotal }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('PaymentForm - Starting submission with COD method');
    
    if (isSubmitting || isProcessing) {
      console.log('PaymentForm - Already processing, returning');
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log('PaymentForm - Processing COD payment');
      await onSubmit({
        method: 'cod',
        status: 'pending'
      });
      console.log('PaymentForm - COD order submission completed');
    } catch (error) {
      console.error('PaymentForm - COD payment error:', error);
      toast.error(error.message || 'Failed to process order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isProcessing || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">Payment Method</label>
        <div className="p-4 border rounded-lg text-left border-primary ring-1 ring-primary">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-gray-900">Cash on Delivery</p>
              <p className="text-sm text-gray-500">Pay when you receive</p>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={isFormDisabled}
        className="mt-6"
      >
        {isFormDisabled ? (
          <span className="flex items-center justify-center">
            Processing...
          </span>
        ) : (
          'Place Order (Cash on Delivery)'
        )}
      </Button>

      <p className="text-center text-sm text-gray-500 mt-4">
        You will pay Rs. {orderTotal.toLocaleString()} when your order is delivered
      </p>
    </form>
  );
};

export default PaymentForm;