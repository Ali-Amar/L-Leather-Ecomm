import api from '../../utils/api';

const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const categoryService = {
  getAllCategories,
  getCategoryById
};

export default categoryService;