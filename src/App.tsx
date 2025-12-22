import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { MainLayout } from '@/components/layout';
import {
  LoginPage,
  HomePage,
  BooksPage,
  BookDetailPage,
  LoansPage,
  AttendancePage,
  AnnouncementsPage,
  SettingsPage,
} from '@/pages';
import { ToastContainer } from '@/components/common';
import { createLogger } from '@/utils/logger';

const logger = createLogger('App');

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

logger.info('Application starting', {
  environment: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_BASE_URL,
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<MainLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Redirect root to home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
