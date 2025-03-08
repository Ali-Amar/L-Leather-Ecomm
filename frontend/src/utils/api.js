// Updated api.js with better error handling and clearer logging
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 60000, // Extended timeout (60 seconds)
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    // More detailed request logging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: {
        Authorization: config.headers.Authorization ? 'Bearer Token exists' : 'No Bearer Token',
        'Content-Type': config.headers['Content-Type']
      },
      data: config.data,
      params: config.params
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ensure Content-Type is set unless it's FormData
    if (!config.headers['Content-Type'] && config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Configuration Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Log success response with more details
    console.log(`API Response Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data ? 'Data received' : 'No data',
      dataStructure: response.data ? Object.keys(response.data) : 'N/A'
    });
    
    // Handle different response structures consistently
    if (response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Log error response with detailed information
    console.error(`API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.toJSON()
    });
    
    // Handle different error types
    if (error.response) {
      // Server responded with an error status code
      const status = error.response.status;
      const errorMsg = error.response.data?.message || error.response.data?.error || error.message;
      
      switch (status) {
        case 401:
          toast.error('Your session has expired. Please log in again.');
          // Consider auto-redirecting to login page
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          break;
        case 403:
          toast.error('You do not have permission to access this resource');
          break;
        case 404:
          console.warn(`Resource not found: ${error.config.url}`);
          // Don't toast on 404 as it might be a valid check
          break;
        case 500:
          toast.error(`Server error: ${errorMsg || 'Something went wrong'}`);
          break;
        default:
          toast.error(`Error: ${errorMsg || 'Something went wrong'}`);
      }
      
      return Promise.reject({
        status: error.response.status,
        message: errorMsg,
        data: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received (network error)
      toast.error('Network error. Please check your connection and try again.');
      return Promise.reject({
        status: 0,
        message: 'Network error. No response received.',
        data: null
      });
    } else {
      // Something else caused the error
      toast.error(`Error: ${error.message}`);
      return Promise.reject({
        status: 0,
        message: error.message,
        data: null
      });
    }
  }
);

// Utility methods
const apiHelper = {
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  }
};

export { apiHelper };
export default api;