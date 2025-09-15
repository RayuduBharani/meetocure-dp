export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://65.2.176.202:5000';
export const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'https://www.meetocure.com/api/chat';
// Helper function to get API URL with fallback
export const getApiUrl = (endpoint = '') => {
  const base = import.meta.env.VITE_BACKEND_URL || 'http://65.2.176.202:5000';
  return `${base}${endpoint}`;
};

// Helper function to log API calls for debugging
export const logApiCall = (url, method = 'GET') => {
  console.log(`API Call: ${method} ${url}`);
};


