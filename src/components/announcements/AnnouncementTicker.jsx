import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

export default function AnnouncementTicker() {
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const allAnnouncements = await base44.entities.Announcement.filter({ is_active: true });
      return allAnnouncements;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (!announcements || announcements.length === 0) {
    return null;
  }

  const combinedText = announcements.map(a => a.content).join(' • ');

  return (
    <div className="bg-gradient-to-l from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950 dark:via-indigo-950 dark:to-blue-950 border-b border-blue-200 dark:border-blue-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-wrapper">
            <motion.div
              className="ticker-content text-sm font-medium text-blue-900 dark:text-blue-100 whitespace-nowrap"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {combinedText} • {combinedText}
            </motion.div>
          </div>
        </div>
      </div>
      <style>{`
        .ticker-wrapper {
          overflow: hidden;
          position: relative;
        }
        .ticker-content {
          display: inline-block;
          padding-right: 100%;
        }
      `}</style>
    </div>
  );
}