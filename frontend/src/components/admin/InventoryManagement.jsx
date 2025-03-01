import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  Minus, 
  Plus, 
  History,
  Download,
  AlertTriangle,
  Box,
  Package,
  ArrowUpDown,
  X
} from 'lucide-react';
import { 
  fetchProducts,
  updateProduct,
  selectAllProducts,
  selectProductsLoading,
  selectProductsError 
} from '../../features/products/productSlice';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_STATUS } from '../../utils/constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatPrice } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Filter options
const STOCK_FILTERS = [
  { value: 'all', label: 'All Stock Levels' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
  { value: 'overstock', label: 'Overstock' }
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'stock-asc', label: 'Stock (Low to High)' },
  { value: 'stock-desc', label: 'Stock (High to Low)' }
];

// Initial state for stock adjustment form
const initialAdjustmentState = {
  quantity: '',
  reason: '',
  type: 'add'
};

const InventoryManagement = () => {
  const dispatch = useDispatch();

  // Redux selectors
  const products = useSelector(selectAllProducts) || [];
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [stockHistory, setStockHistory] = useState([]);
  const [adjustmentForm, setAdjustmentForm] = useState(initialAdjustmentState);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchInventory();
  }, [dispatch, searchQuery, stockFilter, categoryFilter, sortBy]);

  const fetchInventory = () => {
    dispatch(fetchProducts({
      search: searchQuery,
      stockFilter,
      category: categoryFilter,
      sortBy
    }));
  };

  // Fetch stock history for a product
  const fetchStockHistory = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/stock-history`);
      setStockHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch stock history');
      setStockHistory([]);
    }
  };

  // Handle stock adjustment
  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustmentForm.quantity || !adjustmentForm.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const quantity = parseInt(adjustmentForm.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (adjustmentForm.type === 'remove' && quantity > selectedProduct.stock) {
      toast.error('Cannot remove more than available stock');
      return;
    }

    setIsProcessing(true);
    try {
      const newStock = adjustmentForm.type === 'add' 
        ? selectedProduct.stock + quantity
        : selectedProduct.stock - quantity;

      await dispatch(updateProduct({
        id: selectedProduct._id,
        productData: {
          stock: newStock,
          stockAdjustment: {
            type: adjustmentForm.type,
            quantity,
            reason: adjustmentForm.reason,
            date: new Date().toISOString()
          }
        }
      })).unwrap();

      toast.success('Stock updated successfully');
      setIsAdjustStockModalOpen(false);
      resetAdjustmentForm();
    } catch (error) {
      toast.error(error?.message || 'Failed to update stock');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export inventory report
  const handleExportInventory = async () => {
    try {
      const response = await api.get('/products/export-inventory', {
        params: { stockFilter, categoryFilter },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Inventory report downloaded');
    } catch (error) {
      toast.error('Failed to download inventory report');
    }
  };

  const resetAdjustmentForm = () => {
    setAdjustmentForm(initialAdjustmentState);
    setSelectedProduct(null);
  };

  // Stock level indicators
  const getStockStatus = (stock, threshold) => {
    if (stock === 0) return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    if (stock <= threshold) return { text: `Low Stock (${stock})`, class: 'bg-yellow-100 text-yellow-800' };
    if (stock >= threshold * 3) return { text: 'Overstock', class: 'bg-blue-100 text-blue-800' };
    return { text: 'In Stock', class: 'bg-green-100 text-green-800' };
  };

  // Filter products based on current filters
  const filteredProducts = products?.filter(product => {
    if (stockFilter === 'low') return product.stock <= product.stockThreshold;
    if (stockFilter === 'out') return product.stock === 0;
    if (stockFilter === 'overstock') return product.stock >= product.stockThreshold * 3;
    return true;
  }) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your product stock levels
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={handleExportInventory}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Inventory
          </Button>
        </div>
      </div>
  
      {/* Filters */}
      <div className="mt-8 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Input
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            icon={Search}
          />
        </div>
  
        {/* Stock Level Filter */}
        <div className="relative">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
          >
            {STOCK_FILTERS.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
        </div>
  
        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="all">All Categories</option>
            {PRODUCT_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
  
        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
  
      {/* Inventory Table */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Box className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || stockFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No inventory items available'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Product
                  </th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Stock Level
                  </th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Last Updated
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.stockThreshold);
                  return (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {product.stock} units
                          </div>
                          <div className="text-gray-500">
                            Threshold: {product.stockThreshold}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${stockStatus.class}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsAdjustStockModalOpen(true);
                            }}
                          >
                            Adjust Stock
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              fetchStockHistory(product._id);
                              setIsHistoryModalOpen(true);
                            }}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
  
      {/* Stock Adjustment Modal */}
    <Modal
      open={isAdjustStockModalOpen}
      onClose={() => {
        setIsAdjustStockModalOpen(false);
        resetAdjustmentForm();
      }}
      title="Adjust Stock Level"
    >
      {selectedProduct && (
        <form onSubmit={handleStockAdjustment} className="space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900">{selectedProduct.name}</h4>
            <p className="mt-1 text-sm text-gray-500">Current stock: {selectedProduct.stock} units</p>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAdjustmentForm(prev => ({ ...prev, type: 'add' }))}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-md ${
                  adjustmentForm.type === 'add'
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentForm(prev => ({ ...prev, type: 'remove' }))}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-md ${
                  adjustmentForm.type === 'remove'
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Minus className="w-4 h-4" />
                Remove Stock
              </button>
            </div>
          </div>

          {/* Quantity */}
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={adjustmentForm.quantity}
            onChange={(e) => setAdjustmentForm(prev => ({
              ...prev,
              quantity: e.target.value
            }))}
            required
          />

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Adjustment
            </label>
            <textarea
              value={adjustmentForm.reason}
              onChange={(e) => setAdjustmentForm(prev => ({
                ...prev,
                reason: e.target.value
              }))}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Enter reason for stock adjustment..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAdjustStockModalOpen(false);
                resetAdjustmentForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Adjustment'}
            </Button>
          </div>
        </form>
      )}
    </Modal>

    {/* Stock History Modal */}
    <Modal
      open={isHistoryModalOpen}
      onClose={() => setIsHistoryModalOpen(false)}
      title="Stock History"
    >
      {selectedProduct && (
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-500">Current stock: {selectedProduct.stock} units</p>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          <div className="space-y-6">
            {stockHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No stock history available</p>
            ) : (
              stockHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className={`p-2 rounded-full ${
                    entry.type === 'add' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {entry.type === 'add' ? (
                      <Plus className="w-4 h-4 text-green-600" />
                    ) : (
                      <Minus className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.type === 'add' ? 'Added' : 'Removed'} {entry.quantity} units
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{entry.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsHistoryModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  </div>
);
};

export default InventoryManagement;