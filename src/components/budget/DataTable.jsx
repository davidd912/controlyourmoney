import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DataTable({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  emptyMessage = "אין נתונים להצגה" 
}) {
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-900">
            {columns.map((col) => (
              <TableHead key={col.key} className={`text-right dark:text-gray-300 ${col.className || ''}`}>
                {col.label}
              </TableHead>
            ))}
            <TableHead className="w-24 text-center dark:text-gray-300">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-400 dark:text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={`dark:text-gray-300 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}