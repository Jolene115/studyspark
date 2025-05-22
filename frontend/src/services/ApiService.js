import axios from 'axios';

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * API service for handling backend requests
 */
const ApiService = {
  /**
   * Get explanation and quiz for a topic at specified level
   * @param {string} topic - The topic to learn about
   * @param {string} level - The learning level (child, teen, adult)
   * @returns {Promise} - The API response with explanation and quiz questions
   */
  explainTopic: async (topic, level) => {
    try {
      const response = await axios.post(`${API_URL}/api/explain`, {
        topic,
        level
      });
      
      return response.data;
    } catch (error) {
      // Format and rethrow the error
      const errorMessage = error.response?.data?.error || 
                          'Failed to connect to the server. Please check your connection and try again.';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Check if the API is available
   * @returns {Promise} - The health check response
   */
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health`);
      return response.data;
    } catch (error) {
      throw new Error('API server is not reachable');
    }
  }
};

export default ApiService;