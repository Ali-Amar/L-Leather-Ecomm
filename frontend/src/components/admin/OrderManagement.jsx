import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  Eye, 
  Package,
  Printer,
  History,
  Download,
  AlertTriangle
} from 'lucide-react';
import { 
  fetchOrders,
  updateOrderStatus,
  updateFilters,
  selectFilteredOrders,
  selectOrdersLoading,
  selectOrderFilters,
  selectOrderPagination,
  selectOrdersError 
} from '../../features/orders/orderSlice';
import { formatPrice } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const OrderManagement = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const orders = useSelector(selectFilteredOrders) || [];
  const isLoading = useSelector(selectOrdersLoading);
  const filters = useSelector(selectOrderFilters);
  const pagination = useSelector(selectOrderPagination);
  const error = useSelector(selectOrdersError);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({ carrier: '', trackingNumber: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial fetch
  useEffect(() => {
    const fetchOrderData = () => {
      dispatch(fetchOrders({
        page: pagination?.currentPage || 1,
        limit: pagination?.limit || 10,
        status: filters?.status || 'all',
        search: searchQuery,
        sortBy: filters?.sortBy || 'date-desc'
      }));
    };
  
    fetchOrderData();
  }, [dispatch, pagination?.currentPage, pagination?.limit, filters?.status, filters?.sortBy, searchQuery]);

  // Status update handler
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsProcessing(true);
    try {
      const updateData = {
        status: newStatus,
        ...(newStatus === 'shipped' && {
          trackingInfo
        })
      };

      await dispatch(updateOrderStatus({ 
        orderId: selectedOrder._id, 
        data: updateData 
      })).unwrap();

      setIsUpdateStatusModalOpen(false);
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to update order status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export handlers
  const handleExportOrders = async () => {
    try {
      const response = await api.get('/orders/export', {
        params: { ...filters },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error('Failed to export orders');
    }
  };

  const handlePrintOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/print`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Order details downloaded');
    } catch (error) {
      toast.error('Failed to download order details');
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

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ORDER_STATUS.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case ORDER_STATUS.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case ORDER_STATUS.DELIVERED:
        return 'bg-green-100 text-green-800';
      case ORDER_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => dispatch(fetchOrders())}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track customer orders
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex sm:gap-3">
            <Button
              variant="outline"
              onClick={handleExportOrders}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              icon={Search}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => dispatch(updateFilters({ status: e.target.value }))}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="all">All Statuses</option>
              {Object.entries(ORDER_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          </div>

{/* Orders Table */}
<div className="mt-8">
  {orders.length === 0 ? (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <Package className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchQuery ? 'Try adjusting your search or filters' : 'No orders available yet.'}
      </p>
    </div>
  ) : (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
              Order Details
            </th>
            <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
              Customer
            </th>
            <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
              Items
            </th>
            <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
              Total
            </th>
            <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">#{order._id}</div>
                  <div className="text-gray-500">{formatDate(order.createdAt)}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </div>
                  <div className="text-gray-500">{order.shippingAddress.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items.map((item, index) => (
                      <img
                        key={`${item._id}-${index}`}
                        src={item.image}
                        alt={item.name}
                        className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {formatPrice(order.total)}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsViewModalOpen(true);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrintOrder(order._id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
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
    <div className="mt-6">
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => dispatch(setPage(page))}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.limit}
      />
    </div>
  )}
</div>

{/* Order Detail Modal */}
<Modal
  open={isViewModalOpen}
  onClose={() => setIsViewModalOpen(false)}
  title="Order Details"
  size="lg"
>
  {selectedOrder && (
    <div className="space-y-6">
      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
          <div className="space-y-1 text-sm">
            <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
            <p>{selectedOrder.shippingAddress.email}</p>
            <p>{selectedOrder.shippingAddress.phone}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
          <div className="space-y-1 text-sm">
            <p>{selectedOrder.shippingAddress.address}</p>
            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
            <p>{selectedOrder.shippingAddress.postalCode}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
          <div className="space-y-1 text-sm">
            <p>Date: {formatDate(selectedOrder.createdAt)}</p>
            <p>Status: 
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </p>
            <p>Payment: {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
        <div className="space-y-4">
          {selectedOrder.items.map((item) => (
            <div key={`${item._id}-${item.color}`} className="flex items-center gap-4 border-b border-gray-200 pb-4 last:border-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder-product.jpg';
                }}
              />
              <div className="flex-1">
                <h5 className="font-medium">{item.name}</h5>
                <p className="text-sm text-gray-500">
                  {item.color} × {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Subtotal</span>
              <span>{formatPrice(selectedOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Shipping</span>
              <span>{formatPrice(selectedOrder.shippingFee)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-lg">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => setIsViewModalOpen(false)}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            setNewStatus(selectedOrder.status);
            setIsUpdateStatusModalOpen(true);
            setIsViewModalOpen(false);
          }}
        >
          Update Status
        </Button>
      </div>
    </div>
  )}
</Modal>

{/* Update Status Modal */}
<Modal
  open={isUpdateStatusModalOpen}
  onClose={() => setIsUpdateStatusModalOpen(false)}
  title="Update Order Status"
>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        New Status
      </label>
      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
      >
        {Object.entries(ORDER_STATUS).map(([key, value]) => (
          <option key={value} value={value}>
            {key.charAt(0) + key.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>

    {/* Tracking Information (for shipped status) */}
    {newStatus === 'shipped' && (
      <div className="space-y-4">
        <Input
          label="Carrier"
          value={trackingInfo.carrier}
          onChange={(e) => setTrackingInfo(prev => ({ ...prev, carrier: e.target.value }))}
          placeholder="Enter carrier name"
        />
        <Input
          label="Tracking Number"
          value={trackingInfo.trackingNumber}
          onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
          placeholder="Enter tracking number"
        />
      </div>
    )}

    <div className="flex justify-end gap-4">
      <Button
        variant="outline"
        onClick={() => setIsUpdateStatusModalOpen(false)}
      >
        Cancel
      </Button>
      <Button 
        onClick={handleStatusUpdate}
        disabled={isProcessing}
      >
        {isProcessing ? 'Updating...' : 'Update Status'}
      </Button>
    </div>
  </div>
</Modal>
</div>
);
};

export default OrderManagement;