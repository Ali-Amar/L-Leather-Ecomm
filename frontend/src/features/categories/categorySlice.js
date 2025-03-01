// features/categories/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from './categoryService';
import toast from 'react-hot-toast';

const initialState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAllCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    })
    .addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload.data;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch category');
      });
  }
});

// Export actions
export const { clearCategoryError, setSelectedCategory } = categorySlice.actions;

// Export selectors
export const selectAllCategories = state => state.categories.categories;
export const selectSelectedCategory = state => state.categories.selectedCategory;
export const selectCategoriesLoading = state => state.categories.loading;
export const selectCategoriesError = state => state.categories.error;

export default categorySlice.reducer;