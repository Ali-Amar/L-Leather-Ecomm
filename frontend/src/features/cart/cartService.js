import api from '../../utils/api';

const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const addToCart = async (cartData) => {
  try {
    const requestData = {
      productId: cartData.productId,
      quantity: cartData.quantity,
      color: cartData.selectedColor
    };
    
    console.log('DEBUG-CART: Adding product to cart:', {
      requestProductId: cartData.productId,
      requestData
    });

    console.log('Sending cart request:', requestData); 
    const response = await api.post('/cart', requestData);
    console.log('DEBUG-CART: Cart response product IDs:', {
      items: response.data.items.map(item => ({
        productId: item.product,
        name: item.name
      }))
    });
    console.log('Cart response:', response); // Debug log
    return response;
  } catch (error) {
    console.error('Cart error:', error); // Debug log
    throw error.response?.data || error.message;
  }
};

const updateCartItem = async (productId, data) => {
  try {
    const response = await api.put(`/cart/${productId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const removeFromCart = async (productId, color) => {
  try {
    const response = await api.delete(`/cart/${productId}`, { 
      params: { color }  // This is the correct way
    });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Sync cart for logged-in users
const syncCart = async (cartItems) => {
  try {
    const response = await api.post('/cart/sync', { items: cartItems });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};

export default cartService;