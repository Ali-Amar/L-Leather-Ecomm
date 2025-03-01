import api from '../utils/api';

/**
 * Service to handle delivery-related operations
 */
class DeliveryService {
  /**
   * Get shipping fee for a specific city
   * @param {string} city - The delivery city
   * @returns {Promise<number>} - The shipping fee
   */
  async getShippingFee(city) {
    try {
      const response = await api.get(`/delivery/fee/${city}`);
      return response.data.fee;
    } catch (error) {
      throw error?.response?.data || error.message;
    }
  }

  /**
   * Get list of supported cities with their fees
   * @returns {Promise<Array>} - Array of supported cities
   */
  async getSupportedCities() {
    try {
      const response = await api.get('/delivery/cities');
      return response.data;
    } catch (error) {
      throw error?.response?.data || error.message;
    }
  }

  /**
   * Calculate delivery time estimate
   * @param {string} city - The delivery city
   * @returns {Promise<Object>} - Delivery time estimate
   */
  async getDeliveryEstimate(city) {
    try {
      const response = await api.get(`/delivery/estimate/${city}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || error.message;
    }
  }

  /**
   * Validate delivery address
   * @param {Object} address - The delivery address
   * @returns {Promise<Object>} - Validated address
   */
  async validateAddress(address) {
    try {
      const response = await api.post('/delivery/validate-address', address);
      return response.data;
    } catch (error) {
      throw error?.response?.data || error.message;
    }
  }

  /**
   * Check if address is serviceable
   * @param {Object} address - The delivery address
   * @returns {Promise<boolean>} - Whether the address is serviceable
   */
  async checkServiceability(address) {
    try {
      const response = await api.post('/delivery/check-serviceability', address);
      return response.data.isServiceable;
    } catch (error) {
      throw error?.response?.data || error.message;
    }
  }

  /**
   * Calculate shipping fee based on cart total
   * @param {number} cartTotal - The cart total amount
   * @param {string} city - The delivery city
   * @returns {Promise<Object>} - Shipping fee details
   */
  async calculateShippingFee(cartTotal, city) {
    try {
      const response = await api.post('/delivery/calculate-fee', {
        cartTotal,
        city
      });
      return response.data;
    } catch (error) {
      throw error?.response?.data || error.message;
    }
  }

  /**
   * Get delivery zones
   * @returns {Promise<Array>} - Array of delivery zones
   */
  async getDeliveryZones() {
    try {
      const response = await api.get('/delivery/zones');
      return response.data;
    } catch (error) {
      throw error?.response?.data || error.message;
    }
  }
}

export default new DeliveryService();