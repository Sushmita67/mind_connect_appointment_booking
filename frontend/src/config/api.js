// API Configuration
const isDevelopment = import.meta.env.DEV;
const isHttps = window.location.protocol === 'https:';

// Determine the appropriate API URL based on current protocol
const getApiBaseUrl = () => {
  if (isDevelopment) {
    // In development, use HTTPS if frontend is on HTTPS, otherwise HTTP
    if (isHttps) {
      return 'https://localhost:4001/api';
    } else {
      return 'http://localhost:4000/api';
    }
  } else {
    // In production, use the same protocol as the frontend
    const protocol = isHttps ? 'https' : 'http';
    const host = import.meta.env.VITE_API_HOST || 'localhost:4000';
    return `${protocol}://${host}/api`;
  }
};

export const API_BASE_URL = getApiBaseUrl();

// Export protocol info for other components
export const isSecure = isHttps;
export const isDev = isDevelopment;

// Debug logging
console.log('API Configuration:', {
  isDevelopment,
  isHttps,
  API_BASE_URL,
  currentProtocol: window.location.protocol
}); 