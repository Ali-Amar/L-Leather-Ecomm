import api from '../../utils/api';

const getAllProducts = async (queryParams = {}) => {
  try {
    // Transform queryParams to match backend expectations
    const params = {
      ...queryParams,
      search: queryParams.search || '', // Make sure search parameter is included
      page: queryParams.page || 1,
      limit: queryParams.limit || 12
    };

    const response = await api.get('/products', { params });
    return response; // api.js handles .data extraction
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const searchProducts = async (searchParams) => {
  try {
    const response = await api.get('/products/search', { 
      params: searchParams 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const createProduct = async (formData) => {
  try {
    if (!(formData instanceof FormData)) {
      throw new Error('Invalid form data');
    }

    // Log the form data being sent
    console.log('Creating product with data:', {
      name: formData.get('name'),
      category: formData.get('category'),
      imageCount: formData.getAll('images').length
    });

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    if (!response?.data) {
      throw new Error('No response data received');
    }

    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Product service error:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to create product',
      response: error.response
    };
  }
};

const updateProduct = async (id, formData) => {
  try {
    console.log('Sending update request for product:', id);
    for (let pair of formData.entries()) {
      console.log('FormData Entry in service:', pair[0], pair[1]);
    }

    // Remove headers configuration
    const response = await api.put(`/products/${id}`, formData);
    return response;
  } catch (error) {
    console.error('Update error in service:', error);
    throw error.response?.data || error.message;
  }
};

const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const productService = {
  getAllProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  formatPrice
};

export default productService;