import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from './cartService';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  loading: false,
  error: null,
  cartTotal: 0,
  itemCount: 0
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.getCart();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async (cartData, { rejectWithValue }) => {
    try {
      return await cartService.addToCart(cartData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      return await cartService.updateCartItem(productId, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async ({ productId, color }, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(productId, color);
      return { productId, color, response };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const syncCart = createAsyncThunk(
  'cart/sync',
  async (cartItems, { rejectWithValue }) => {
    try {
      return await cartService.syncCart(cartItems);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    calculateTotals: (state) => {
      state.cartTotal = state.items.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      );
      state.itemCount = state.items.reduce(
        (count, item) => count + item.quantity,
        0
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // cartSlice.js
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Handle both possible response structures
        const cartData = action.payload.data || action.payload;
        
        if (cartData) {
          state.items = cartData.items || [];
          state.cartTotal = cartData.total || 0;
          state.itemCount = cartData.items?.length || 0;
        } else {
          state.items = [];
          state.cartTotal = 0;
          state.itemCount = 0;
        }
        
        // Handle optional fields
        state.warnings = action.payload.warnings || [];
        state.invalidItems = action.payload.invalidItems || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to Cart
      // Inside cartSlice.js extraReducers
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Safely access the cart data with proper null checks
        const cartData = action.payload?.data;
        
        if (cartData) {
          // Ensure items is an array, default to empty if undefined
          state.items = (cartData.items || []).map(item => ({
            ...item,
            // Handle both populated and unpopulated product references
            product: typeof item.product === 'object' ? item.product._id : item.product
          }));
          state.cartTotal = cartData.total || 0;
          state.itemCount = cartData.items?.length || 0;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Add to cart error:', action.payload); // Debug log
      })

      // Update Cart Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.cartTotal = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload;
        toast.error('Failed to update cart');
      })

      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const { productId, color } = action.payload;
        state.items = state.items.filter(item => {
          const itemId = item.product._id || item.product;
          return !(itemId === productId && item.color === color)
        });
        toast.success('Item removed from cart');
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
        toast.error('Failed to remove item from cart');
      })

      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.cartTotal = 0;
        state.itemCount = 0;
        toast.success('Cart cleared');
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
        toast.error('Failed to clear cart');
      })

      // Sync Cart
      .addCase(syncCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.cartTotal = action.payload.total;
        state.itemCount = action.payload.itemCount;
      });
  }
});

// Export actions
export const { calculateTotals } = cartSlice.actions;

// Export selectors
export const selectCartItems = state => state.cart.items || [];
export const selectCartLoading = state => state.cart.loading;
export const selectCartError = state => state.cart.error;
export const selectCartTotal = state => state.cart.cartTotal || 0;
export const selectCartCount = state => state.cart.itemCount;

export default cartSlice.reducer;