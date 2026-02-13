import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function SummaryCard({ title, value, subtitle, icon: Icon, color = "blue", trend }) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    orange: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    red: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    purple: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
  };

  const iconBg = {
    blue: "bg-blue-100 dark:bg-blue-900",
    orange: "bg-orange-100 dark:bg-orange-900",
    green: "bg-green-100 dark:bg-green-900",
    red: "bg-red-100 dark:bg-red-900",
    purple: "bg-purple-100 dark:bg-purple-900"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 ${colorClasses[color]} overflow-hidden`} role="article" aria-label={title}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1" id={`summary-${title}`}>{title}</p>
              <p className="text-2xl font-bold text-foreground" aria-labelledby={`summary-${title}`}>
                ₪{value?.toLocaleString() || 0}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
              {trend !== undefined && (
                <p className={`text-sm mt-2 font-medium ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {trend >= 0 ? '+' : ''}{trend.toLocaleString()} ₪ / חודש
                </p>
              )}
            </div>
            {Icon && (
              <div className={`p-3 rounded-xl ${iconBg[color]}`} aria-hidden="true">
                <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}