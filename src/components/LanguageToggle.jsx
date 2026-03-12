import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';
import { Button } from '@/components/ui/button';

export default function LanguageToggle() {
  const { lang, changeLanguage } = useLocale();
  const isHe = lang === 'he';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => changeLanguage(isHe ? 'en' : 'he')}
      className="h-9 px-2.5 gap-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      aria-label="Toggle language"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={lang}
          initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex items-center gap-1"
        >
          <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {isHe ? 'EN' : 'עב'}
          </span>
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}