import axios from 'axios';

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * API service for handling backend requests
 */
const ApiService = {
  /**
   * Generate a quiz based on study content
   * @param {string} studyContent - The study material to generate a quiz from
   * @param {number} numQuestions - Number of questions to generate
   * @returns {Promise} - The API response with quiz questions
   */
  generateQuiz: async (studyContent, numQuestions) => {
    try {
      const response = await axios.post(`${API_URL}/api/generate-quiz`, {
        studyContent,
        numQuestions
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