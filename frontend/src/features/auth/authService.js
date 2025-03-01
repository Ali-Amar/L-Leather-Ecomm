import api from '../../utils/api';

const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    // Log the response to see what we're getting
    console.log('Login Response:', response);
    
    if (response.success && response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    console.log('Register Response:', response);
    
    if (response.success && response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    console.error('Register Error:', error);
    throw error;
  }
};

const logout = async () => {
  await api.get('/auth/logout');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const updateProfile = async (userData) => {
  const response = await api.put('/users/me', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const resetPassword = async (email) => {
  const response = await api.post('/auth/forgotpassword', { email });
  return response.data;
};

const deleteAccount = async () => {
  const response = await api.delete('/users/me');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  updateProfile,
  resetPassword,
  deleteAccount
};

export default authService;