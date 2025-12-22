import React, { useEffect, useState } from 'react';
import { Bell, Calendar, User } from 'lucide-react';
import { Card, Loading } from '@/components/common';
import { announcementService } from '@/services';
import { Announcement } from '@/types';
import { useAppDispatch } from '@/store';
import { addToast } from '@/store/uiSlice';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AnnouncementsPage');

const AnnouncementsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      logger.info('Fetching announcements');
      try {
        const data = await announcementService.getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        logger.error('Failed to fetch announcements', error);
        dispatch(addToast({
          type: 'error',
          message: 'Gagal memuat pengumuman',
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [dispatch]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <Loading text="Memuat pengumuman..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Pengumuman
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Informasi dan pengumuman terbaru
        </p>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Belum ada pengumuman
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pengumuman baru akan muncul di sini
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, index) => {
            const id = `${announcement.subject}-${index}`;
            const isExpanded = expandedId === id;
            
            return (
              <Card 
                key={id} 
                hoverable 
                onClick={() => toggleExpand(id)}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex-shrink-0">
                    <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {announcement.subject}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {announcementService.getRelativeTime(announcement.date)}
                      </span>
                      {announcement.author_id && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {announcement.author_id}
                        </span>
                      )}
                    </div>
                    
                    <div className={`
                      text-sm text-gray-600 dark:text-gray-300
                      ${isExpanded ? '' : 'line-clamp-2'}
                    `}>
                      {announcement.body}
                    </div>
                    
                    {announcement.body.length > 150 && (
                      <button className="text-sm text-purple-600 dark:text-purple-400 mt-2 hover:underline">
                        {isExpanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
