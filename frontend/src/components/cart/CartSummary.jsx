import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { selectCartTotal } from '../../features/cart/cartSlice';
import { formatPrice } from '../../services/productService';
import Button from '../common/Button';

const CartSummary = ({ className = '', deliveryFee = null }) => {
  const navigate = useNavigate();
  const subtotal = useSelector(selectCartTotal);
  
  // Calculate total including delivery fee if provided
  const total = subtotal + (deliveryFee || 0);

  // Helper to determine if free shipping applies
  const isFreeShipping = subtotal >= 10000; // Free shipping over PKR 10,000
  const calculatedDeliveryFee = isFreeShipping ? 0 : (deliveryFee || 500); // Default delivery fee is 500

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
      
      {/* Price Breakdown */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between text-base">
          <p className="text-gray-500">Subtotal</p>
          <p className="font-medium text-gray-900">
            {formatPrice(subtotal)}
          </p>
        </div>

        <div className="flex items-center justify-between text-base">
          <p className="text-gray-500">Shipping</p>
          {deliveryFee === null ? (
            <p className="text-sm text-gray-500 italic">
              Calculated at checkout
            </p>
          ) : (
            <p className="font-medium text-gray-900">
              {isFreeShipping ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(calculatedDeliveryFee)
              )}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-base">
            <p className="font-medium text-gray-900">Order total</p>
            <p className="font-medium text-gray-900">
              {formatPrice(total + (deliveryFee === null ? 0 : calculatedDeliveryFee))}
            </p>
          </div>
          {!isFreeShipping && (
            <p className="mt-1 text-sm text-gray-500">
              Spend {formatPrice(10000 - subtotal)} more for free shipping
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </Button>

        <Button
          fullWidth
          variant="outline"
          onClick={() => navigate('/shop')}
        >
          Continue Shopping
        </Button>
      </div>

      {/* Additional Information */}
      <div className="mt-6 space-y-4 text-sm text-gray-500">
        <div className="flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Secure checkout process
        </div>
        <div className="flex items-center">
          <Truck className="w-4 h-4 mr-2" />
          {isFreeShipping ? 'Free shipping on this order' : 'Free shipping on orders over PKR 10,000'}
        </div>
        <div className="flex items-center">
          <RotateCcw className="w-4 h-4 mr-2" />
          Free returns within 30 days
        </div>
      </div>
    </div>
  );
};

export default CartSummary;