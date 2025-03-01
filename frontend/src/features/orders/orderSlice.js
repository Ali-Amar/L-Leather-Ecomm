import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from './orderService';
import toast from 'react-hot-toast';

const initialState = {
  orders: [],
  selectedOrder: null,
  filters: {
    status: 'all',
    dateRange: 'all',
    sortBy: 'date-desc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  },
  loading: false,
  error: null
};

// Fetch my orders
export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMy',
  async (filters, { rejectWithValue }) => {
    try {
      const { status, dateRange, sortBy, page = 1, limit = 10 } = filters || {};
      const params = {
        ...(status !== 'all' && { status }),
        ...(dateRange !== 'all' && { dateRange }),
        sortBy,
        page,
        limit
      };
      
      return await orderService.getMyOrders(params);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, status, search, sortBy } = params;
      const queryParams = {
        page,
        limit,
        ...(status !== 'all' && { status }),
        ...(search && { search }),
        sortBy
      };
      
      const response = await orderService.getAllOrders(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch orders');
    }
  }
);

// Fetch single order
export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.getOrderById(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      console.log('orderSlice - Starting order creation with data:', orderData);

      // Validate required fields
      if (!orderData.paymentMethod) {
        throw new Error('Payment method is required');
      }
      
      if (!orderData.shippingAddress || !orderData.shippingAddress.address) {
        throw new Error('Complete shipping address is required');
      }
      
      if (!orderData.items || !orderData.items.length) {
        throw new Error('Order items are required');
      }

      // Transform cart items to order items format
      const transformedItems = orderData.items.map(item => ({
        product: item.product, // This should be the MongoDB _id
        quantity: item.quantity,
        color: item.color,
        price: item.price,
        name: item.name,
        image: item.image
      }));

      // Create final order data
      const finalOrderData = {
        ...orderData,
        items: transformedItems,
        paymentDetails: {
          status: orderData.paymentMethod === 'cod' ? 'pending' : 'processing',
          ...(orderData.paymentDetails || {})
        }
      };

      console.log('orderSlice - Making API request with data:', finalOrderData);
      const response = await orderService.createOrder(finalOrderData);
      console.log('orderSlice - Order creation response:', response);

      return response;
    } catch (error) {
      console.error('orderSlice - Order creation error:', error);
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to create order');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderStatus(orderId, data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.cancelOrder(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    clearErrors: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch my orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalItems: action.payload.total,
          limit: action.payload.limit
        };
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch orders');
      })

      // Fetch all orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalItems: action.payload.total,
          limit: action.payload.limit
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch orders');
      })

      // Fetch single order
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.data;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch order details');
      })

      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload.data;
        toast.success('Order created successfully');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to create order');
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data;
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.selectedOrder?._id === updatedOrder._id) {
          state.selectedOrder = updatedOrder;
        }
        toast.success('Order status updated successfully');
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to update order status');
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const cancelledOrder = action.payload.data;
        const index = state.orders.findIndex(order => order._id === cancelledOrder._id);
        if (index !== -1) {
          state.orders[index] = cancelledOrder;
        }
        if (state.selectedOrder?._id === cancelledOrder._id) {
          state.selectedOrder = cancelledOrder;
        }
        toast.success('Order cancelled successfully');
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to cancel order');
      });
  }
});

// Export actions
export const { updateFilters, clearFilters, setPage } = orderSlice.actions;

// Export selectors
export const selectAllOrders = state => state.orders.orders;
export const selectSelectedOrder = state => state.orders.selectedOrder;
export const selectOrdersLoading = state => state.orders.loading;
export const selectOrdersError = state => state.orders.error;
export const selectOrderError = state => state.orders.error; 
export const selectOrderFilters = state => state.orders.filters;
export const selectOrderPagination = state => state.orders.pagination;

// Filtered orders selector
export const selectFilteredOrders = state => {
  return state.orders.orders || [];
};

export default orderSlice.reducer;