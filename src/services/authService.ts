import api from './api';
import { LoginRequest, LoginResponse, User, ApiResponse } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AuthService');

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    logger.info('Attempting login', { email: credentials.email });
    
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('email', credentials.email);
      formData.append('password', credentials.password);

      const response = await api.post<LoginResponse>('/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      logger.info('Login successful', { 
        userId: response.data.data?.user?.id,
        email: response.data.data?.user?.email,
      });

      // Store auth data
      if (response.data.data) {
        const { token, user, session_id } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        if (session_id) {
          localStorage.setItem('session_id', session_id);
        }
        logger.debug('Auth data stored in localStorage');
      }

      return response.data;
    } catch (error) {
      logger.error('Login failed', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    logger.info('Attempting logout');
    
    try {
      const sessionId = localStorage.getItem('session_id');
      
      if (sessionId) {
        await api.get(`/auth/logout/${sessionId}`);
        logger.info('Logout API call successful');
      } else {
        logger.warn('No session ID found, skipping API logout call');
      }
    } catch (error) {
      logger.error('Logout API call failed', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('session_id');
      logger.debug('Auth data cleared from localStorage');
    }
  },

  async getCurrentUser(): Promise<User> {
    logger.info('Fetching current user');
    
    try {
      const response = await api.get<ApiResponse<User>>('/user');
      logger.info('Current user fetched', { userId: response.data.data?.id });
      
      if (response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data.data as User;
    } catch (error) {
      logger.error('Failed to fetch current user', error);
      throw error;
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAuth = !!token && isLoggedIn;
    
    logger.debug('Checking authentication status', { isAuthenticated: isAuth });
    return isAuth;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      logger.error('Failed to parse user from localStorage', error);
      return null;
    }
  },

  getSessionId(): string | null {
    return localStorage.getItem('session_id');
  },
};

export default authService;
