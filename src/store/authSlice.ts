import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginRequest, User } from '@/types';
import { authService } from '@/services';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AuthSlice');

const initialState: AuthState = {
  isAuthenticated: authService.isAuthenticated(),
  user: authService.getUser(),
  token: authService.getToken(),
  sessionId: authService.getSessionId(),
  loading: false,
  error: null,
};

logger.debug('Auth initial state', { 
  isAuthenticated: initialState.isAuthenticated,
  hasUser: !!initialState.user,
  hasToken: !!initialState.token,
});

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      logger.info('Login thunk started');
      const response = await authService.login(credentials);
      return response.data;
    } catch (error) {
      logger.error('Login thunk failed', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      logger.info('Logout thunk started');
      await authService.logout();
      logger.info('Logout thunk completed');
    } catch (error) {
      logger.error('Logout thunk failed', error);
      const message = error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      logger.info('Fetch current user thunk started');
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      logger.error('Fetch current user thunk failed', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      logger.debug('Auth error cleared');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      logger.debug('User set', { userId: action.payload.id });
    },
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.sessionId = null;
      state.loading = false;
      state.error = null;
      logger.info('Auth state reset');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        logger.debug('Login pending');
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessionId = action.payload.session_id || null;
        state.loading = false;
        state.error = null;
        logger.info('Login fulfilled', { userId: action.payload.user.id });
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        logger.error('Login rejected', undefined, { error: action.payload });
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        logger.debug('Logout pending');
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.sessionId = null;
        state.loading = false;
        state.error = null;
        logger.info('Logout fulfilled');
      })
      .addCase(logout.rejected, (state, action) => {
        // Still clear auth state even if logout API fails
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.sessionId = null;
        state.loading = false;
        state.error = action.payload as string;
        logger.warn('Logout rejected but state cleared', { error: action.payload });
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        logger.debug('Fetch current user pending');
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        logger.info('Fetch current user fulfilled', { userId: action.payload.id });
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        logger.error('Fetch current user rejected', undefined, { error: action.payload });
      });
  },
});

export const { clearError, setUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;
