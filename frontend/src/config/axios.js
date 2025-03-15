import axios from 'axios';
import toast from 'react-hot-toast';

// Define the API base URL with clearer fallback
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api/v1';
  }
  
  // Safe production fallback
  return 'https://api.lardeneleather.com/api/v1';
};

// Create an axios instance with custom config
const instance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx
    return response.data;
  },
  (error) => {
    // Any status codes outside the range of 2xx
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    // Handle different error scenarios
    switch (error.response?.status) {
      case 401:
        // Unauthorized - clear user data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        break;

      case 403:
        // Forbidden
        toast.error('You do not have permission to perform this action');
        break;

      case 404:
        // Not found
        toast.error('Resource not found');
        break;

      case 422:
        // Validation errors
        if (error.response.data.errors) {
          Object.values(error.response.data.errors).forEach(err => {
            toast.error(err);
          });
        } else {
          toast.error(message);
        }
        break;

      case 429:
        // Too many requests
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        // Server error
        toast.error('Internal server error. Please try again later.');
        break;

      default:
        // Other errors
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Helper functions for common HTTP methods
export const http = {
  get: (url, config = {}) => instance.get(url, config),
  post: (url, data = {}, config = {}) => instance.post(url, data, config),
  put: (url, data = {}, config = {}) => instance.put(url, data, config),
  delete: (url, config = {}) => instance.delete(url, config),
  patch: (url, data = {}, config = {}) => instance.patch(url, data, config)
};

export default instance;