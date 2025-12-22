import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectTheme } from '@/store/uiSlice';
import { fetchCurrentUser } from '@/store/authSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastContainer } from '@/components/common';
import { createLogger } from '@/utils/logger';

const logger = createLogger('MainLayout');

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Apply theme to document
  useEffect(() => {
    logger.debug('Applying theme', { theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      logger.warn('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // Fetch current user if not loaded
    if (!user) {
      logger.info('Fetching current user data');
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
