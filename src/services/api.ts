import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@/config/environment';
import { createLogger } from '@/utils/logger';
import { ApiError } from '@/types';

const logger = createLogger('ApiClient');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request ID generator for tracking
let requestId = 0;
const generateRequestId = (): string => {
  requestId += 1;
  return `req_${Date.now()}_${requestId}`;
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const reqId = generateRequestId();
    config.headers['X-Request-ID'] = reqId;

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.debug(`[${reqId}] Request started`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: {
        ...config.headers,
        Authorization: token ? 'Bearer [REDACTED]' : undefined,
      },
      params: config.params,
      data: config.data,
    });

    logger.time(`[${reqId}] Request duration`);

    return config;
  },
  (error: AxiosError) => {
    logger.error('Request interceptor error', error, {
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const reqId = response.config.headers['X-Request-ID'];
    
    logger.timeEnd(`[${reqId}] Request duration`);
    logger.debug(`[${reqId}] Response received`, {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });

    return response;
  },
  (error: AxiosError<ApiError>) => {
    const reqId = error.config?.headers?.['X-Request-ID'];
    
    if (reqId) {
      logger.timeEnd(`[${reqId}] Request duration`);
    }

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      logger.error(`[${reqId}] Response error`, undefined, {
        status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data,
      });

      // Handle 401 Unauthorized
      if (status === 401) {
        logger.warn('Unauthorized access, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('session_id');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Create a more descriptive error message
      const errorMessage = data?.message || getErrorMessage(status);
      error.message = errorMessage;
    } else if (error.request) {
      // Request was made but no response received
      logger.error(`[${reqId}] Network error - no response received`, error, {
        url: error.config?.url,
      });
      error.message = 'Network error. Please check your connection.';
    } else {
      // Something else happened
      logger.error(`[${reqId}] Request setup error`, error);
    }

    return Promise.reject(error);
  }
);

// Helper function to get error message based on status code
const getErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'Forbidden. You do not have permission.';
    case 404:
      return 'Resource not found.';
    case 422:
      return 'Validation error. Please check your input.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return `Request failed with status ${status}`;
  }
};

export default api;
