import { isRejectedWithValue } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

// Error handling middleware
export const errorMiddleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    toast.error(action.payload || 'An error occurred');
  }
  return next(action);
};

// Auth token middleware
export const authMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type?.startsWith('auth/')) {
    const token = store.getState().auth.user?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
  }
  return result;
};

export const middleware = [errorMiddleware, authMiddleware];