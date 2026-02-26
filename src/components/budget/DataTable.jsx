import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DataTable({ data, columns, onEdit, onDelete, emptyMessage = "אין נתונים להצגה" }) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 px-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        {emptyMessage}
      </div>
    );
  }

  // תצוגת מובייל - כרטיסיות מונפשות
  if (isMobile) {
    return (
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {data.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -50, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-xl shadow-sm bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">
                      {columns[0] && columns[0].render ? columns[0].render(item[columns[0].key], item) : item[columns[0]?.key]}
                    </div>
                    <div className="text-base font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {columns[1] && columns[1].render ? columns[1].render(item[columns[1].key], item) : item[columns[1]?.key]}
                    </div>
                  </div>
                  {columns.length > 2 && columns[2] && item[columns[2].key] && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {columns[2].render ? columns[2].render(item[columns[2].key], item) : item[columns[2].key]}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 px-3 rounded-lg">
                      <Pencil className="h-3.5 w-3.5 ml-1.5" /> ערוך
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-3 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5 ml-1.5" /> מחק
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // תצוגת דסקטופ - טבלה חלקה ללא שבירת RTL
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300 text-center w-32">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            <AnimatePresence mode="popLayout">
              {data.map((item) => (
                <motion.tr
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -10, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                  exit={{ opacity: 0, x: -50, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group"
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {col.render ? col.render(item[col.key], item) : (item[col.key] || '-')}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-9 w-9 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}