import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import bookReducer from './bookSlice';
import loanReducer from './loanSlice';
import uiReducer from './uiSlice';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Store');

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    loans: loanReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Log store initialization
logger.info('Redux store initialized', {
  isDev: import.meta.env.DEV,
});

// Subscribe to store changes for debugging
if (import.meta.env.DEV) {
  store.subscribe(() => {
    const state = store.getState();
    logger.debug('Store state updated', {
      auth: {
        isAuthenticated: state.auth.isAuthenticated,
        hasUser: !!state.auth.user,
        loading: state.auth.loading,
      },
      books: {
        count: state.books.books.length,
        loading: state.books.loading,
      },
      loans: {
        count: state.loans.loanRequests.length,
        loading: state.loans.loading,
      },
      ui: {
        sidebarOpen: state.ui.sidebarOpen,
        theme: state.ui.theme,
        toastsCount: state.ui.toasts.length,
      },
    });
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
