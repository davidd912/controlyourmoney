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
    refetchInterval: 60000,
  });

  if (!announcements || announcements.length === 0) {
    return null;
  }

  const combinedText = announcements.map(a => a.content).join(' • ');
  const direction = announcements[0]?.direction || 'ltr';
  const speed = announcements[0]?.speed || 3;
  
  // Calculate duration based on speed: 1 (slowest) to 5 (fastest)
  // Speed 1 = 100s, Speed 2 = 70s, Speed 3 = 50s, Speed 4 = 35s, Speed 5 = 25s
  const speedToDuration = { 1: 100, 2: 70, 3: 50, 4: 35, 5: 25 };
  const duration = speedToDuration[speed] || 50;

  // Repeat text many times to ensure it's always visible
  const repeatedText = Array(8).fill(combinedText).join(' • ');

  return (
    <div className="bg-gradient-to-l from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950 dark:via-indigo-950 dark:to-blue-950 border-b border-blue-200 dark:border-blue-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
        <div className="flex-1 relative overflow-hidden h-6">
          <motion.div
            className="absolute top-0 left-0 text-sm font-medium text-blue-900 dark:text-blue-100 whitespace-nowrap"
            animate={{ x: direction === 'ltr' ? ['-100%', '100%'] : ['100%', '-100%'] }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'linear',
              repeatType: 'loop',
            }}
          >
            {repeatedText}
          </motion.div>
        </div>
      </div>
    </div>
  );
}