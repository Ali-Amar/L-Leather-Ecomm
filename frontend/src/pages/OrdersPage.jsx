import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../utils/api';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        
        // Log the token we're using
        const token = localStorage.getItem('token');
        console.log('Fetching orders using token:', token ? 'Token exists' : 'No token');
        
        // Make direct API call
        console.log('Fetching orders from /orders/myorders endpoint');
        const response = await api.get('/orders/myorders');
        
        console.log('Order response:', response);
        
        if (response.data && response.data.success) {
          setOrders(response.data.data || []);
        } else {
          setError('Failed to fetch orders: ' + (response.data?.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        
        // More detailed error handling
        if (err.response) {
          console.error('Error status:', err.response.status);
          console.error('Error data:', err.response.data);
          setError(`Error: ${err.response.data?.message || err.response.statusText}`);
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('No response from server. Please check your connection.');
        } else {
          console.error('Request setup error:', err.message);
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    
    // Direct fetch without using the useEffect
    api.get('/orders/myorders')
      .then(response => {
        console.log('Retry response:', response);
        setOrders(response.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Retry error:', err);
        setError(`Error: ${err.message}`);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">My Orders</h1>
      </div>

      {/* Error message with retry button */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 flex flex-col items-center">
          <p className="mb-3">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 && !error ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start shopping and your orders will appear here.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/shop')}>
              Start Shopping
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4 divide-y divide-gray-200">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order placed on {formatDate(order.createdAt)}
                    </p>
                    <p className="font-medium">
                      Order #{order._id}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/order-confirmation?id=${order._id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Order
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.items && order.items.map((item, idx) => (
                    <div key={`${item._id || idx}-${item.color}`} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 h-16">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Color: {item.color} | Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex justify-between w-full max-w-xs">
                      <span className="text-sm text-gray-500">Subtotal:</span>
                      <span className="text-sm font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-xs">
                      <span className="text-sm text-gray-500">Shipping:</span>
                      <span className="text-sm font-medium">{formatPrice(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-xs pt-2 border-t border-gray-200">
                      <span className="text-base font-medium">Total:</span>
                      <span className="text-base font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;