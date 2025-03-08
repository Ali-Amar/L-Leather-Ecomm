import React from 'react';
import { formatPrice } from '../../utils/helpers';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { X, Download, Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const OrderDetailModal = ({ order, isOpen, onClose, onStatusUpdate, isLoading }) => {
  if (!isOpen || !order) return null;

  // Replace the receipt download function in your frontend components

const handleDownloadReceipt = async () => {
  try {
    toast.loading('Preparing receipt...', { id: 'receipt-download' });
    
    // Use XMLHttpRequest instead of axios for better binary data handling
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/orders/${order._id}/receipt`, true);
    xhr.responseType = 'blob';
    
    // Set authorization header
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.onload = function() {
      if (this.status === 200) {
        // Create blob and download
        const blob = new Blob([this.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `order-${order._id}-receipt.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        
        toast.dismiss('receipt-download');
        toast.success('Receipt downloaded successfully');
      } else {
        console.error('Download failed with status:', this.status);
        toast.dismiss('receipt-download');
        toast.error('Failed to download receipt');
      }
    };
    
    xhr.onerror = function() {
      console.error('XHR error during download');
      toast.dismiss('receipt-download');
      toast.error('Network error while downloading receipt');
    };
    
    xhr.send();
  } catch (error) {
    console.error('Receipt download error:', error);
    toast.dismiss('receipt-download');
    toast.error('Failed to download receipt');
  }
};
  
  const updateStatus = (newStatus) => {
    if (order.status === newStatus) return;
    onStatusUpdate(order._id, newStatus);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge color
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
  
  // Safely extract properties with fallbacks
  const { 
    items = [], 
    shippingAddress = {}, 
    paymentMethod = 'cod',
    paymentDetails = {},
    subtotal = 0, 
    shippingFee = 0, 
    total = 0, 
    createdAt = new Date(),
    status = 'pending',
    user = { firstName: '', lastName: '', email: '' }
  } = order;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl overflow-y-auto max-h-[90vh] w-full max-w-4xl">
        {/* Modal Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Order Number</p>
                <p className="font-medium"># {order._id}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Date & Time</p>
                <p className="font-medium">{formatDate(createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Customer</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            
            {/* Status and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 mb-2">Order Status</p>
                <div className="flex flex-col gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}>
                    {status}
                  </span>
                  
                  <select
                    value={status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="mt-2 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-primary"
                    disabled={isLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 mb-2">Payment Method</p>
                <div className="flex flex-col gap-2">
                  <p className="font-medium capitalize">
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(paymentDetails?.paymentStatus || 'pending')}`}>
                    {paymentDetails?.paymentStatus || 'pending'}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 mb-2">Actions</p>
                <div className="space-y-2">
                  <Button
                    onClick={handleDownloadReceipt}
                    className="w-full flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200"></div>
            
            {/* Items List */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Order Items</h3>
              <div className="space-y-4">
                {items && items.length > 0 ? (
                  items.map((item, index) => (
                    <div key={`${item._id || index}-${item.color}`} className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                          <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">Color: {item.color}</p>
                          <p className="text-sm text-gray-500">Unit Price: {formatPrice(item.price)}</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No items in this order</p>
                )}
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
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                  <p>{shippingAddress.address}</p>
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.phone}</p>
                  <p>{shippingAddress.email}</p>
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
            
            {/* Order Timeline */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Order Status Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  <div className="relative flex items-start">
                    <div className={`absolute left-0 rounded-full flex items-center justify-center w-8 h-8 
                      ${status !== 'cancelled' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="ml-12">
                      <h4 className="font-medium text-gray-900">Order Placed</h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className={`absolute left-0 rounded-full flex items-center justify-center w-8 h-8 
                      ${status === 'processing' || status === 'shipped' || status === 'delivered' 
                        ? 'bg-blue-100 text-blue-600'
                        : status === 'cancelled' 
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-gray-100 text-gray-400'}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="ml-12">
                      <h4 className="font-medium text-gray-900">Processing</h4>
                      <p className="text-sm text-gray-500">
                        {status === 'processing' || status === 'shipped' || status === 'delivered'
                          ? 'Order is being processed'
                          : status === 'cancelled'
                            ? 'Order was cancelled'
                            : 'Pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className={`absolute left-0 rounded-full flex items-center justify-center w-8 h-8 
                      ${status === 'shipped' || status === 'delivered' 
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-400'}`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="ml-12">
                      <h4 className="font-medium text-gray-900">Shipped</h4>
                      <p className="text-sm text-gray-500">
                        {status === 'shipped' || status === 'delivered'
                          ? 'Your order has been shipped'
                          : 'Not shipped yet'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className={`absolute left-0 rounded-full flex items-center justify-center w-8 h-8 
                      ${status === 'delivered' 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="ml-12">
                      <h4 className="font-medium text-gray-900">Delivered</h4>
                      <p className="text-sm text-gray-500">
                        {status === 'delivered'
                          ? 'Your order has been delivered'
                          : 'Not delivered yet'}
                      </p>
                    </div>
                  </div>
                  
                  {status === 'cancelled' && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 rounded-full flex items-center justify-center w-8 h-8 bg-red-100 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="ml-12">
                        <h4 className="font-medium text-gray-900">Order Cancelled</h4>
                        <p className="text-sm text-gray-500">
                          This order has been cancelled
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 sticky bottom-0">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;