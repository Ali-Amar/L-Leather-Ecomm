import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter, ChevronDown, Search, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import OrderDetailModal from './OrderDetailModal'; // Import the new modal component

const orderStatuses = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const paymentStatuses = [
  { value: 'all', label: 'All Payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' }
];

const sortOptions = [
  { value: '-createdAt', label: 'Date (Latest First)' },
  { value: 'createdAt', label: 'Date (Oldest First)' },
  { value: '-total', label: 'Amount (High to Low)' },
  { value: 'total', label: 'Amount (Low to High)' }
];

// Simple Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    
    // Show pages around current page for large paginations
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    return start + i;
  });
  
  return (
    <div className="flex justify-center items-center mt-4 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
      >
        Prev
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md ${
            currentPage === page
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // State for order detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingOrderDetail, setIsLoadingOrderDetail] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    sort: '-createdAt'
  });

  // Function to fetch orders with multiple fallback strategies
  const fetchOrders = async (isRetry = false) => {
    try {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('Starting to fetch admin orders...');
      
      // Build query params
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.paymentStatus !== 'all') {
        params.append('paymentStatus', filters.paymentStatus);
      }
      
      if (filters.sort) {
        params.append('sort', filters.sort);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      console.log('Fetching admin orders with params:', params.toString());
      
      // Log the authorization header for debugging
      const token = localStorage.getItem('token');
      console.log('Using auth token:', token ? 'Token exists' : 'No token found');
      
      // Try multiple approaches to fetch orders
      
      // First try regular orders endpoint
      try {
        console.log('Trying primary orders endpoint...');
        const response = await api.get(`/orders?${params.toString()}`);
        
        console.log('Primary orders endpoint response:', response);
        
        if (response && (response.data || response.success)) {
          // Handle different response structures
          const orderData = response.data?.data || response.data || [];
          const paginationData = response.pagination || response.data?.pagination || {
            current: 1,
            limit: 10,
            total: orderData.length,
            totalPages: 1
          };
          
          setOrders(orderData);
          setPagination({
            page: paginationData.current || 1,
            limit: paginationData.limit || 10,
            total: paginationData.total || 0,
            totalPages: paginationData.totalPages || 1
          });
          
          return; // Exit if successful
        }
      } catch (primaryErr) {
        console.error('Primary orders endpoint failed:', primaryErr);
        // Continue to fallback
      }
      
      // Fallback 1: Try emergency orders endpoint
      try {
        console.log('Trying emergency orders endpoint...');
        const emergencyResponse = await api.get(`/emergency-order?${params.toString()}`);
        
        console.log('Emergency orders endpoint response:', emergencyResponse);
        
        if (emergencyResponse && (emergencyResponse.data || emergencyResponse.success)) {
          const orderData = emergencyResponse.data?.data || emergencyResponse.data || [];
          
          setOrders(orderData);
          setPagination({
            page: 1,
            limit: 10,
            total: orderData.length,
            totalPages: Math.ceil(orderData.length / 10)
          });
          
          toast.success('Orders loaded via emergency endpoint');
          return; // Exit if successful
        }
      } catch (emergencyErr) {
        console.error('Emergency orders endpoint failed:', emergencyErr);
        // Continue to next fallback
      }
      
      // Fallback 2: Try manual fetch with fewer middlewares (direct DB approach would be on backend)
      try {
        console.log('Trying direct orders approach...');
        const directResponse = await api.get(`/orders/direct?${params.toString()}`);
        
        console.log('Direct orders approach response:', directResponse);
        
        if (directResponse && (directResponse.data || directResponse.success)) {
          const orderData = directResponse.data?.data || directResponse.data || [];
          
          setOrders(orderData);
          setPagination({
            page: 1,
            limit: 10,
            total: orderData.length,
            totalPages: Math.ceil(orderData.length / 10)
          });
          
          toast.success('Orders loaded via direct endpoint');
          return; // Exit if successful
        }
      } catch (directErr) {
        console.error('Direct orders approach failed:', directErr);
        // All approaches failed, throw error
        throw new Error('All order fetch methods failed');
      }
    } catch (err) {
      console.error('Final error fetching admin orders:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
        
        if (err.response.status === 401) {
          setError('Authentication error. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (err.response.status === 403) {
          setError('You do not have permission to access orders.');
        } else {
          setError(`Server error: ${err.response.data?.message || err.response.statusText}`);
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Request setup error:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Reset to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset page to 1 and trigger fetch
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    fetchOrders();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      page
    }));
  };

  // IMPROVED: Get detailed order info and open modal
  const viewOrderDetails = async (orderId) => {
    try {
      setIsLoadingOrderDetail(true);
      setIsDetailModalOpen(true);
      
      // First try to find order in current list
      const existingOrder = orders.find(order => order._id === orderId);
      if (existingOrder) {
        setSelectedOrder(existingOrder);
      }
      
      // Then try to get a fresh copy with full details
      console.log(`Fetching detailed info for order ${orderId}`);
      
      try {
        const response = await api.get(`/orders/${orderId}`);
        console.log('Order detail response:', response);
        
        if (response && (response.data || response.success)) {
          const orderData = response.data?.data || response.data;
          setSelectedOrder(orderData);
        }
      } catch (primaryErr) {
        console.error('Primary order detail endpoint failed:', primaryErr);
        
        // Try emergency endpoint
        try {
          const emergencyResponse = await api.get(`/emergency-order/${orderId}`);
          console.log('Emergency order detail response:', emergencyResponse);
          
          if (emergencyResponse && (emergencyResponse.data || emergencyResponse.success)) {
            const orderData = emergencyResponse.data?.data || emergencyResponse.data;
            setSelectedOrder(orderData);
          }
        } catch (emergencyErr) {
          console.error('Emergency order detail endpoint failed:', emergencyErr);
          toast.error('Could not load complete order details');
        }
      }
    } catch (err) {
      console.error('Error loading order details:', err);
      toast.error('Failed to load order details');
    } finally {
      setIsLoadingOrderDetail(false);
    }
  };

  // IMPROVED: Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Show a loading indicator for this specific action
      toast.loading('Updating order status...', { id: `order-status-${orderId}` });
      
      console.log(`Attempting to update order ${orderId} to status: ${newStatus}`);
      
      // Try multiple API endpoints to update the status
      let success = false;
      let response;
      
      // First try the standard endpoint
      try {
        console.log('Trying primary status update endpoint...');
        response = await api.put(`/orders/${orderId}/status`, {
          status: newStatus
        });
        
        console.log('Primary endpoint response:', response);
        if (response && (response.success || response.data)) {
          success = true;
        }
      } catch (primaryErr) {
        console.error('Primary status update failed:', primaryErr);
        // Continue to fallback
      }
      
      // If primary endpoint fails, try emergency endpoint
      if (!success) {
        try {
          console.log('Trying emergency status update endpoint...');
          response = await api.put(`/emergency-order/${orderId}/status`, {
            status: newStatus
          });
          
          console.log('Emergency endpoint response:', response);
          if (response && (response.success || response.data)) {
            success = true;
          }
        } catch (emergencyErr) {
          console.error('Emergency status update failed:', emergencyErr);
        }
      }
      
      // If both fail, try direct API call
      if (!success) {
        try {
          console.log('Trying direct database update...');
          response = await api.post(`/admin/direct-update`, {
            collection: 'orders',
            documentId: orderId,
            update: { status: newStatus }
          });
          
          console.log('Direct update response:', response);
          if (response && (response.success || response.data)) {
            success = true;
          }
        } catch (directErr) {
          console.error('Direct update failed:', directErr);
        }
      }
      
      if (success) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus } 
              : order
          )
        );
        
        // Also update the selectedOrder if it's the same order
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            status: newStatus
          }));
        }
        
        // Success message
        toast.success(`Order status updated to ${newStatus}`, { id: `order-status-${orderId}` });
        
        // Force refresh data after a short delay
        setTimeout(() => {
          fetchOrders(true);
        }, 1000);
      } else {
        toast.error('Status update failed. Please try again.', { id: `order-status-${orderId}` });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status: ' + (err.message || 'Unknown error'), { id: `order-status-${orderId}` });
    }
  };

  // Retry loading orders
  const handleRetry = () => {
    fetchOrders(true);
  };

  // Get status color for the badge
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

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0 && !isRetrying) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        <p className="text-gray-500">View and manage all customer orders</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Status Filter */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <div className="relative">
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
          </div>

          {/* Payment Status Filter */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <div className="relative">
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              >
                {paymentStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
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

          {/* Search */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Orders
            </label>
            <form onSubmit={handleSearch} className="relative">
              <div className="flex">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order ID or customer name"
                  className="block w-full rounded-l-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Error message with retry button */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-md mb-6 flex flex-col items-center">
          <AlertCircle className="h-10 w-10 mb-4 text-red-600" />
          <p className="mb-4 text-center">{error}</p>
          <Button 
            onClick={handleRetry} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      )}

      {/* Loading overlay */}
      {isRetrying && (
        <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-md flex items-center justify-center">
          <LoadingSpinner size="sm" className="mr-2" />
          <p>Retrying to fetch orders...</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {orders.length === 0 && !error && !loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No orders found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user ? (
                        <div>
                          <div>{order.user.firstName} {order.user.lastName}</div>
                          <div className="text-xs text-gray-500">{order.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(order.paymentDetails?.paymentStatus)}`}>
                        {order.paymentDetails?.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="block w-28 rounded-md border-gray-300 py-1 pl-2 pr-6 text-xs focus:border-primary focus:outline-none focus:ring-primary"
                          disabled={loading || isRetrying}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="py-4 px-6 bg-gray-50">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
            <div className="mt-2 text-xs text-center text-gray-500">
              Showing {orders.length} of {pagination.total} orders
            </div>
          </div>
        )}
      </div>
      
      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onStatusUpdate={updateOrderStatus}
        isLoading={isLoadingOrderDetail}
      />
    </div>
  );
};

export default AdminOrders;