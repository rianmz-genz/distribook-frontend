import api from './api';
import { Announcement, ApiResponse } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AnnouncementService');

export const announcementService = {
  async getAnnouncements(): Promise<Announcement[]> {
    logger.info('Fetching announcements');
    logger.time('getAnnouncements');
    
    try {
      const response = await api.post<ApiResponse<Announcement[]>>('/pengumuman');
      const announcements = response.data.data || [];
      
      logger.timeEnd('getAnnouncements');
      logger.info('Announcements fetched successfully', { 
        count: announcements.length 
      });
      
      return announcements;
    } catch (error) {
      logger.timeEnd('getAnnouncements');
      logger.error('Failed to fetch announcements', error);
      throw error;
    }
  },

  // Format date for display
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      logger.error('Failed to format date', error, { dateString });
      return dateString;
    }
  },

  // Get relative time (e.g., "2 days ago")
  getRelativeTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Hari ini';
      } else if (diffDays === 1) {
        return 'Kemarin';
      } else if (diffDays < 7) {
        return `${diffDays} hari yang lalu`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} minggu yang lalu`;
      } else {
        return this.formatDate(dateString);
      }
    } catch (error) {
      logger.error('Failed to get relative time', error, { dateString });
      return dateString;
    }
  },
};

export default announcementService;
