import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  ClipboardList, 
  Settings, 
  X,
  Home,
  Bell,
  Clock
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectSidebarOpen, setSidebarOpen } from '@/store/uiSlice';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Sidebar');

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/home', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
  { path: '/books', label: 'Buku', icon: <BookOpen className="w-5 h-5" /> },
  { path: '/loans', label: 'Peminjaman', icon: <ClipboardList className="w-5 h-5" /> },
  { path: '/attendance', label: 'Absensi', icon: <Clock className="w-5 h-5" /> },
  { path: '/announcements', label: 'Pengumuman', icon: <Bell className="w-5 h-5" /> },
  { path: '/settings', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
];

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectSidebarOpen);

  const handleClose = () => {
    logger.debug('Sidebar closed');
    dispatch(setSidebarOpen(false));
  };

  const handleNavClick = (path: string) => {
    logger.debug('Navigation clicked', { path });
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Distribook
            </span>
          </div>
          <button
            onClick={handleClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => handleNavClick(item.path)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
