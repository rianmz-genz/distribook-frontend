import React from 'react';
import { User, Moon, Sun, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/authSlice';
import { toggleTheme, selectTheme, addToast } from '@/store/uiSlice';
import { Card, Button } from '@/components/common';
import { createLogger } from '@/utils/logger';
import { env } from '@/config/environment';

const logger = createLogger('SettingsPage');

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);
  const user = useAppSelector((state) => state.auth.user);

  const handleToggleTheme = () => {
    logger.debug('Theme toggle clicked');
    dispatch(toggleTheme());
  };

  const handleLogout = async () => {
    logger.info('Logout initiated from settings');
    try {
      await dispatch(logout()).unwrap();
      dispatch(addToast({ type: 'success', message: 'Berhasil logout' }));
      navigate('/login');
    } catch (error) {
      logger.error('Logout failed', error);
      dispatch(addToast({ type: 'error', message: 'Gagal logout' }));
    }
  };

  const settingsSections = [
    {
      title: 'Akun',
      items: [
        {
          icon: <User className="w-5 h-5" />,
          label: 'Profil',
          description: user?.email || 'Kelola informasi profil Anda',
          onClick: () => logger.debug('Profile clicked'),
        },
        {
          icon: <Shield className="w-5 h-5" />,
          label: 'Keamanan',
          description: 'Password dan keamanan akun',
          onClick: () => logger.debug('Security clicked'),
        },
      ],
    },
    {
      title: 'Preferensi',
      items: [
        {
          icon: theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />,
          label: 'Tema',
          description: theme === 'dark' ? 'Mode Gelap' : 'Mode Terang',
          onClick: handleToggleTheme,
          toggle: true,
          toggleValue: theme === 'dark',
        },
        {
          icon: <Bell className="w-5 h-5" />,
          label: 'Notifikasi',
          description: 'Kelola preferensi notifikasi',
          onClick: () => logger.debug('Notifications clicked'),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Pengaturan
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Kelola preferensi dan akun Anda
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
              {user?.role || 'Member'}
            </span>
          </div>
        </div>
      </Card>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
            {section.title}
          </h3>
          <Card padding="none">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.onClick}
                className={`
                  w-full flex items-center gap-4 p-4 text-left
                  hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                  ${itemIndex !== section.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}
                `}
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                {item.toggle ? (
                  <div
                    className={`
                      w-11 h-6 rounded-full transition-colors relative
                      ${item.toggleValue ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${item.toggleValue ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            ))}
          </Card>
        </div>
      ))}

      {/* Logout Button */}
      <Button
        variant="danger"
        fullWidth
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      {/* App Info */}
      <div className="text-center text-sm text-gray-400 dark:text-gray-500">
        <p>{env.appName} v{env.appVersion}</p>
        <p className="mt-1">© 2024 Distribook. All rights reserved.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
