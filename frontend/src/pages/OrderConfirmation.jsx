import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Download, ArrowLeft, Package } from 'lucide-react';
import { 
  fetchOrderById,
  selectSelectedOrder,
  selectOrdersLoading,
  selectOrdersError 
} from '../features/orders/orderSlice';
import { clearCart } from '../features/cart/cartSlice';
import { formatPrice } from '../utils/helpers';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../utils/api';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const order = useSelector(selectSelectedOrder);
  const isLoading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);

  useEffect(() => {
    // Clear cart after successful order
    dispatch(clearCart());

    // Get order details either from location state or fetch from API
    const orderId = location.state?.orderId;
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    } else if (!order) {
      // If no order details, redirect to shop
      navigate('/shop');
    }
  }, [location.state, dispatch, navigate, order]);

  const handleDownloadReceipt = async () => {
    if (!order?._id) return;

    try {
      const response = await api.get(`/orders/${order._id}/receipt`, { 
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order-${order._id}-receipt.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          View Orders
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Package className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">No order details found</p>
        <Button variant="outline" onClick={() => navigate('/shop')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const { items, shipping, payment, subtotal, shippingFee, total, createdAt } = order;

  const orderDate = new Date(createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Message */}
        <div className="text-center mb-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. We'll send you an email confirmation shortly.
          </p>
        </div>

        {/* Order Receipt */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Order Receipt</h2>
              <span className="text-sm text-gray-500">L'ardene Leather</span>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-6 space-y-6">
            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Order Number</p>
                <p className="font-medium"># {order._id}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Date & Time</p>
                <p className="font-medium">{orderDate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium capitalize">
                  {payment?.method === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Order Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Items List */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Order Items</h3>
              <div className="space-y-4">
                {items?.map((item) => (
                  <div key={`${item._id}-${item.color}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Color: {item.color}</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Customer Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {shipping.firstName} {shipping.lastName}
                  </p>
                  <p>{shipping.address}</p>
                  <p>
                    {shipping.city}, {shipping.state} {shipping.postalCode}
                  </p>
                  <p>{shipping.phone}</p>
                  <p>{shipping.email}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-medium text-base">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      (Including all taxes)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Delivery */}
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Expected Delivery</h4>
                <p className="text-sm text-blue-700">
                  Your order will be delivered within 3-5 business days
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
            <p>Thank you for shopping with L'ardene Leather!</p>
            <p>For any queries, please contact our support team.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
          <Button
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </Button>
        </div>
      </div>
  );
};

export default OrderConfirmation;