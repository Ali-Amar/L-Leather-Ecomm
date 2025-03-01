import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import productService from './productService';
import toast from 'react-hot-toast';

const initialState = {
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  filters: {
    category: 'all',
    priceRange: null,
    colors: [],
    sortBy: 'popular'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 12
  },
  loading: false,
  error: null
};

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      console.log('Creating product with data:', {
        name: productData.get('name'),
        price: productData.get('price'),
        category: productData.get('category'),
        hasImages: productData.getAll('images').length > 0
      });
      
      const response = await productService.createProduct(productData);
      
      if (!response?.data) {
        throw new Error('No data received from server');
      }
      
      // Refresh the products list
      await dispatch(fetchProducts());
      
      return response.data;
    } catch (error) {
      console.error('Product creation error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to create product'
      );
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getAllProducts(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/search',
  async (searchParams, { rejectWithValue }) => {
    try {
      // Format search params properly
      const queryParams = {
        q: searchParams.q,
        page: searchParams.page || 1,
        limit: searchParams.limit || 12,
        category: searchParams.category,
        sortBy: searchParams.sortBy,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice
      };
      
      const response = await productService.searchProducts(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      // Log the data being sent
      console.log('Updating product:', id);
      console.log('Update data:', Object.fromEntries(productData));
      
      const response = await productService.updateProduct(id, productData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await productService.deleteProduct(productId);
      dispatch(fetchProducts());
      return productId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    refreshProducts: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { data, currentPage, totalPages, total, limit } = action.payload;
        state.products = data;
        state.filteredProducts = data;
        state.pagination = {
          currentPage: currentPage || 1,
          totalPages: totalPages || 1,
          totalItems: total || 0,
          limit: limit || 12
        };
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.data || action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch product');
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Current logic just appends to arrays
        state.products = [...state.products, action.payload.data];
        state.filteredProducts = [...state.filteredProducts, action.payload.data];
        toast.success('Product created successfully');
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload?.message || 'Failed to create product');
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload?.data;
        
        if (updatedProduct && updatedProduct._id) {
          const index = state.products.findIndex(p => p._id === updatedProduct._id);
          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload?.message || 'Failed to update product');
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false;
        toast.success('Product deleted successfully');
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload?.message || 'Failed to delete product');
      })

      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredProducts = action.payload.data;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to search products');
      });
  }
});

// Actions
export const {
  updateFilters,
  clearFilters,
  setPage,
  setSelectedProduct
} = productSlice.actions;

// Base selector
const selectProductsState = state => state.products;

// Memoized selectors
export const selectAllProducts = createSelector(
  [selectProductsState],
  productsState => productsState.products
);

export const selectFilteredProducts = createSelector(
  [selectProductsState],
  productsState => {
    console.log('Selector state:', productsState);
    return productsState.filteredProducts || [];
  }
);

export const selectSelectedProduct = createSelector(
  [selectProductsState],
  productsState => productsState.selectedProduct
);

export const selectProductsLoading = createSelector(
  [selectProductsState],
  productsState => productsState.loading
);

export const selectProductsError = createSelector(
  [selectProductsState],
  productsState => productsState.error
);

export const selectProductFilters = createSelector(
  [selectProductsState],
  productsState => productsState.filters
);

export const selectProductPagination = createSelector(
  [selectProductsState],
  productsState => productsState.pagination
);

// Create a memoized selector for filtered and sorted products
export const selectProcessedProducts = createSelector(
  [selectFilteredProducts, selectProductFilters],
  (products, filters) => {
    if (!products) return [];
    
    let processedProducts = [...products];

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      processedProducts = processedProducts.filter(
        product => product.category === filters.category
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      processedProducts = processedProducts.filter(product => {
        const { min, max } = filters.priceRange;
        if (min && max) return product.price >= min && product.price <= max;
        if (min) return product.price >= min;
        if (max) return product.price <= max;
        return true;
      });
    }

    // Apply color filter
    if (filters.colors && filters.colors.length > 0) {
      processedProducts = processedProducts.filter(product =>
        filters.colors.some(color => product.colors.includes(color))
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        processedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        processedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        processedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        processedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        processedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        processedProducts.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return processedProducts;
  }
);

export default productSlice.reducer;