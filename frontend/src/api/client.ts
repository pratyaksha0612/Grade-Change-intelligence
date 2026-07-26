import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { handleApiError } from './errorHandler';

const rawUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = rawUrl ? `${rawUrl}/api/v1` : 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout for all requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Inject auth token if available (placeholder for actual auth system)
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Optionally track active requests for a global loading state here if needed
    // e.g. store.dispatch(incrementLoadingCount())
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Optionally track active requests for global loading state
    // e.g. store.dispatch(decrementLoadingCount())
    return response;
  },
  (error: AxiosError) => {
    // Optionally track active requests for global loading state
    // e.g. store.dispatch(decrementLoadingCount())
    
    // Global Authentication/Authorization handler
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Authentication error - redirecting to login');
      // window.location.href = '/login'; // Or dispatch logout action
    }

    // Format error using centralized error handler before throwing
    const formattedError = handleApiError(error);
    
    // Attach formatted message to the error object for easy access in React Query
    error.message = formattedError;

    return Promise.reject(error);
  }
);
