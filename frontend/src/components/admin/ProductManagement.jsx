import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  Plus,
  X,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { 
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  selectAllProducts,
  selectProductsLoading,
  selectProductsError
} from '../../features/products/productSlice';
import { fetchCategories } from '../../features/categories/categorySlice';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatPrice } from '../../utils/helpers';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const initialProductState = {
  name: '',
  description: '',
  price: '',
  category: '',
  colors: [],
  images: [],
  stock: '',
  stockThreshold: '',
  status: 'active'
};

const ProductManagement = () => {
  console.log("Component starting to render");
  
  const dispatch = useDispatch();
  console.log("Dispatch obtained");
  
  try {
    // Redux selectors
    const products = useSelector(selectAllProducts);
    console.log("Products obtained:", products);
    
    const isLoading = useSelector(selectProductsLoading);
    console.log("Loading state obtained:", isLoading);
    
    const error = useSelector(selectProductsError);
    console.log("Error state obtained:", error);

    // ... rest of your component code
  } catch (err) {
    console.error("Error in selector block:", err);
    throw err;
  }

  // Redux selectors
  const products = useSelector(selectAllProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  // Local state
  const [productForm, setProductForm] = useState(initialProductState);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchProducts({
      search: searchQuery,
      category: filterCategory,
      sortBy,
    }));
    dispatch(fetchCategories());
  }, [dispatch, searchQuery, filterCategory, sortBy]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!productForm.name.trim()) newErrors.name = 'Product name is required';
    if (!productForm.description.trim()) newErrors.description = 'Description is required';
    
    if (!productForm.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(productForm.price) || Number(productForm.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    if (!productForm.category) newErrors.category = 'Category is required';
    
    if (!productForm.colors || productForm.colors.length === 0) {
      newErrors.colors = 'At least one color must be selected';
    }
    
    if (!productForm.stock) {
      newErrors.stock = 'Stock quantity is required';
    } else if (isNaN(productForm.stock) || Number(productForm.stock) < 0) {
      newErrors.stock = 'Stock must be a valid non-negative number';
    }
    
    if (!productForm.stockThreshold) {
      newErrors.stockThreshold = 'Stock threshold is required';
    } else if (isNaN(productForm.stockThreshold) || Number(productForm.stockThreshold) < 0) {
      newErrors.stockThreshold = 'Stock threshold must be a valid non-negative number';
    }
  
    if (!isEditModalOpen && (!imageFiles || imageFiles.length === 0)) {
      newErrors.images = 'At least one product image is required';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleColorToggle = (color) => {
    setProductForm(prev => {
      const colors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors };
    });
    if (errors.colors && productForm.colors.length > 0) {
      setErrors(prev => ({ ...prev, colors: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) toast.error(`${file.name} is not a supported image type`);
      if (!isValidSize) toast.error(`${file.name} is too large (max 5MB)`);
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviewURLs = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewURLs]);
    setImageFiles(prev => [...prev, ...validFiles]);

    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // In ProductManagement.jsx
const handleAddProduct = async () => {
  if (!validateForm()) return;

  setIsProcessing(true);
  try {
    const formData = new FormData();
    
    // Basic validation
    if (!productForm.name || !productForm.price || !productForm.category) {
      throw new Error('Please fill all required fields');
    }

    // Append all form fields
    formData.append('name', productForm.name.trim());
    formData.append('description', productForm.description.trim());
    formData.append('price', parseFloat(productForm.price));
    formData.append('category', productForm.category);
    formData.append('stock', parseInt(productForm.stock));
    formData.append('stockThreshold', parseInt(productForm.stockThreshold));
    formData.append('status', productForm.status);
    formData.append('colors', JSON.stringify(productForm.colors));

    // Validate and append images
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error('Please add at least one product image');
    }

    // Append each image file
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    // Debug log
    console.log('Submitting product with data:', {
      name: formData.get('name'),
      price: formData.get('price'),
      category: formData.get('category'),
      imageCount: imageFiles.length
    });

    const result = await dispatch(createProduct(formData)).unwrap();
    
    if (!result) {
      throw new Error('Failed to create product');
    }

    toast.success('Product added successfully');
    setIsAddModalOpen(false);
    resetForm();
    setImageFiles([]);
    setPreviewImages([]);
    
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error(error.message || 'Failed to create product');
  } finally {
    setIsProcessing(false);
  }
};

  const handleEditProduct = async () => {
    if (!validateForm()) return;
  
    setIsProcessing(true);
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      formData.append('stockThreshold', productForm.stockThreshold);
      formData.append('status', productForm.status);
      formData.append('colors', JSON.stringify(productForm.colors));
  
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => formData.append('images', file));
      } else if (productForm.images?.length > 0) {
        formData.append('existingImages', JSON.stringify(productForm.images));
      }
  
      await dispatch(updateProduct({
        id: selectedProduct._id,
        productData: formData
      })).unwrap();
  
      toast.success('Product updated successfully');
      await dispatch(fetchProducts());
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setIsProcessing(true);
    try {
      await dispatch(deleteProduct(selectedProduct._id)).unwrap();
      
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);

    } catch (error) {
      toast.error(error?.message || 'Failed to delete product');
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      colors: [...product.colors],
      images: [...product.images],
      stock: product.stock.toString(),
      stockThreshold: product.stockThreshold.toString(),
      status: product.status
    });
    setPreviewImages([...product.images]);
    setIsEditModalOpen(true);
  };

  const handleBulkImageUpload = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/multiple', formData);
      return response.data.urls;
    } catch (error) {
      throw new Error('Failed to upload images');
    }
  };

  const resetForm = () => {
    setProductForm(initialProductState);
    setPreviewImages([]);
    setImageFiles([]);
    setErrors({});
    setSelectedProduct(null);
  };
  
  const [stockFilter, setStockFilter] = useState('all');
  
  const filteredProducts = products?.filter(product => {
    if (!product) return false;
    if (stockFilter === 'low') return product.stock <= product.stockThreshold;
    if (stockFilter === 'out') return product.stock === 0;
    if (stockFilter === 'overstock') return product.stock >= product.stockThreshold * 3;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => dispatch(fetchProducts())}>
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>
  
      {/* Filters */}
      <div className="mt-8 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            icon={Search}
          />
        </div>
  
        {/* Category Filter */}
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="all">All Categories</option>
            {PRODUCT_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
        </div>
  
        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="stock-asc">Stock (Low to High)</option>
            <option value="stock-desc">Stock (High to Low)</option>
          </select>
        </div>
      </div>
  
      {/* Products Table */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new product.
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
                    Price
                  </th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Stock
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
              {products?.filter(product => product && product.images)?.map((product) => (
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
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock} units</div>
                      {product.stock <= product.stockThreshold && (
                        <div className="text-xs text-red-600">Low stock alert</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                        ${product.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-primary hover:text-primary-dark"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  
      {/* Add/Edit Product Modal */}
    <Modal
      open={isAddModalOpen || isEditModalOpen}
      onClose={() => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
      }}
      title={`${isEditModalOpen ? 'Edit' : 'Add'} Product`}
      size="lg"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        isEditModalOpen ? handleEditProduct() : handleAddProduct();
      }} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Product Name"
            name="name"
            value={productForm.name}
            onChange={handleInputChange}
            error={errors.name}
            required
          />

          <Input
            label="Price (PKR)"
            name="price"
            type="number"
            value={productForm.price}
            onChange={handleInputChange}
            error={errors.price}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            value={productForm.description}
            onChange={handleInputChange}
            className={`w-full rounded-md shadow-sm ${
              errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary focus:ring-primary'
            }`}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={productForm.category}
              onChange={handleInputChange}
              className={`w-full rounded-md shadow-sm ${
                errors.category
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary focus:ring-primary'
              }`}
              required
            >
              <option value="">Select Category</option>
              {PRODUCT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={productForm.status}
              onChange={handleInputChange}
              className="w-full rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
            >
              {Object.entries(PRODUCT_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Stock Quantity"
            name="stock"
            type="number"
            value={productForm.stock}
            onChange={handleInputChange}
            error={errors.stock}
            required
          />

          <Input
            label="Low Stock Alert Threshold"
            name="stockThreshold"
            type="number"
            value={productForm.stockThreshold}
            onChange={handleInputChange}
            error={errors.stockThreshold}
            required
          />
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Colors
          </label>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => handleColorToggle(color.name)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  productForm.colors.includes(color.name)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-white hover:bg-gray-200 shadow-sm'
                }`}
                style={{
                  backgroundColor: productForm.colors.includes(color.name) 
                    ? undefined 
                    : color.value
                }}
              >
                {color.name}
              </button>
            ))}
          </div>
          {errors.colors && (
            <p className="mt-1 text-sm text-red-500">{errors.colors}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          
          {/* Image Preview Grid */}
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {previewImages.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img
                    src={imageUrl}
                    alt={`Product preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image Upload Area */}
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
            <div className="space-y-1 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="product-images"
                  className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                >
                  <span>Upload images</span>
                  <input
                    id="product-images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
          {errors.images && (
            <p className="mt-1 text-sm text-red-500">{errors.images}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing
              ? 'Processing...'
              : isEditModalOpen
              ? 'Update Product'
              : 'Add Product'
            }
          </Button>
        </div>
      </form>
    </Modal>

    {/* Delete Confirmation Modal */}
    <Modal
      open={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      title="Delete Product"
    >
      <div className="space-y-4">
        <p className="text-gray-500">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>

        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <img
              src={selectedProduct?.images[0]}
              alt={selectedProduct?.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <h4 className="font-medium text-gray-900">{selectedProduct?.name}</h4>
              <p className="text-sm text-gray-500">{selectedProduct?.category}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
            onClick={handleDeleteProduct}
            disabled={isProcessing}
          >
            {isProcessing ? 'Deleting...' : 'Delete Product'}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
);
};

export default ProductManagement;