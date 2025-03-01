import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Eye, Filter, ChevronDown } from 'lucide-react';
import { 
  fetchMyOrders,
  updateFilters,
  clearFilters,
  setPage,
  selectFilteredOrders,
  selectOrdersLoading,
  selectOrderFilters,
  selectOrderPagination
} from '../features/orders/orderSlice';
import { formatPrice } from '../utils/helpers';
import { ORDER_STATUS } from '../utils/constants';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const orderStatuses = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const dateFilters = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

const sortOptions = [
  { value: 'date-desc', label: 'Date (Latest First)' },
  { value: 'date-asc', label: 'Date (Oldest First)' },
  { value: 'amount-desc', label: 'Amount (High to Low)' },
  { value: 'amount-asc', label: 'Amount (Low to High)' }
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const orders = useSelector(selectFilteredOrders);
  const isLoading = useSelector(selectOrdersLoading);
  const filters = useSelector(selectOrderFilters);
  const pagination = useSelector(selectOrderPagination);

  const fetchOrders = useCallback(() => {
    dispatch(fetchMyOrders({
      ...filters,
      page: pagination.currentPage,
      limit: pagination.limit
    }));
  }, [dispatch, filters, pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (filterType, value) => {
    dispatch(updateFilters({ [filterType]: value }));
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

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

  if (isLoading) {
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

        {/* Filters */}
        <div className="mt-4 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:gap-4">
          {/* Status Filter */}
          <div className="relative flex-1 sm:max-w-xs">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            >
              {orderStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative flex-1 sm:max-w-xs">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            >
              {dateFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Sort */}
          <div className="relative flex-1 sm:max-w-xs">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
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
                        onClick={() => navigate(`/order/${order._id}`)}
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
                    {order.items.map((item) => (
                      <div key={`${item._id}-${item.color}`} className="flex items-center gap-4">
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.limit}
            />
          </div>
        )}
      </div>
  );
};

export default OrdersPage;