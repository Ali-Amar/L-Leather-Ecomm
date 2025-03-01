import api from '../../utils/api';

const createOrder = async (orderData) => {
  try {
    console.log('orderService - Making request with:', orderData);
    
    // Increase timeout to 60 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 60000)
    );

    // Add more detailed error handling
    const response = await Promise.race([
      api.post('/orders', orderData),
      timeoutPromise
    ]);

    // Check response more thoroughly
    if (!response || !response.data) {
      console.error('Invalid response:', response);
      throw new Error('Invalid response from server');
    }

    console.log('orderService - Received response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Order creation error:', error);
    // More specific error handling
    if (error.message === 'Request timeout') {
      throw new Error('Server is taking too long to respond. Please try again.');
    }
    if (error.response?.data) {
      throw error.response.data;
    }
    throw new Error(error.message || 'Failed to create order');
  }
};

const getAllOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const cancelOrder = async (id) => {
  try {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getMyOrders = async () => {
  try {
    const response = await api.get('/orders/myorders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const trackOrder = async (id) => {
  try {
    const response = await api.get(`/orders/${id}/track`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const orderService = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  trackOrder
};

export default orderService;