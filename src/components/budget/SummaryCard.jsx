import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useLocale } from '@/hooks/useLocale';
import { useTranslation } from 'react-i18next'; // <-- הוספנו את זה

export default function SummaryCard({ title, amount, icon: Icon, type = 'default', index = 0 }) {
  const { direction } = useLocale();
  const { t } = useTranslation(); // <-- הוספנו את זה
  
  const styles = {
    income: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:to-teal-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-800/50",
      trend: "text-emerald-600",
      trendIcon: ArrowUpRight
    },
    expense: {
      bg: "bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/50 dark:to-red-900/30",
      text: "text-rose-700 dark:text-rose-400",
      iconBg: "bg-rose-100 dark:bg-rose-800/50",
      trend: "text-rose-600",
      trendIcon: ArrowDownRight
    },
    balance: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/30",
      text: "text-blue-700 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-800/50",
      trend: "text-blue-600",
      trendIcon: Activity
    },
    default: {
      bg: "bg-white dark:bg-gray-800 border",
      text: "text-gray-900 dark:text-gray-100",
      iconBg: "bg-gray-100 dark:bg-gray-700",
      trend: "text-gray-500",
      trendIcon: Activity
    }
  };

  const currentStyle = styles[type] || styles.default;
  const TrendIcon = currentStyle.trendIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
      dir={direction}
    >
      <Card className={`h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative ${currentStyle.bg}`}>
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/30 dark:bg-black/10 blur-2xl pointer-events-none" />
        
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
          <CardTitle className={`text-sm md:text-base font-bold ${currentStyle.text}`}>
            {title}
          </CardTitle>
          <div className={`p-2 rounded-xl ${currentStyle.iconBg} shadow-inner`}>
            {Icon && <Icon className={`w-4 h-4 md:w-5 md:h-5 ${currentStyle.text}`} />}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            {amount}
          </div>
          
          <div className={`flex items-center text-xs md:text-sm font-medium opacity-80 ${currentStyle.text}`}>
            <TrendIcon className="w-3 h-3 md:w-4 md:h-4 me-1" />
            <span>{t('monthly_activity')}</span> {/* <-- עכשיו זה נשאב מהתרגום! */}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}