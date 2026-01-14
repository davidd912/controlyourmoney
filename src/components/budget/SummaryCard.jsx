import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function SummaryCard({ title, value, subtitle, icon: Icon, color = "blue", trend }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200"
  };

  const iconBg = {
    blue: "bg-blue-100",
    orange: "bg-orange-100",
    green: "bg-green-100",
    red: "bg-red-100",
    purple: "bg-purple-100"
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
              <p className="text-sm font-medium text-gray-500 mb-1" id={`summary-${title}`}>{title}</p>
              <p className="text-2xl font-bold text-gray-900" aria-labelledby={`summary-${title}`}>
                ₪{value?.toLocaleString() || 0}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
              )}
              {trend !== undefined && (
                <p className={`text-sm mt-2 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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