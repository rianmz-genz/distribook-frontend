import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, ToastMessage } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('UISlice');

// Get initial theme from localStorage or system preference
const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (savedTheme) {
    return savedTheme;
  }
  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

const initialState: UIState = {
  sidebarOpen: true,
  theme: getInitialTheme(),
  toasts: [],
};

logger.debug('UI initial state', initialState);

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      logger.debug('Sidebar toggled', { isOpen: state.sidebarOpen });
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
      logger.debug('Sidebar state set', { isOpen: action.payload });
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      logger.debug('Theme toggled', { theme: state.theme });
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      logger.debug('Theme set', { theme: action.payload });
    },
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const toast: ToastMessage = {
        ...action.payload,
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      state.toasts.push(toast);
      logger.debug('Toast added', { toastId: toast.id, type: toast.type, message: toast.message });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
      logger.debug('Toast removed', { toastId: action.payload });
    },
    clearToasts: (state) => {
      state.toasts = [];
      logger.debug('All toasts cleared');
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;

export default uiSlice.reducer;
