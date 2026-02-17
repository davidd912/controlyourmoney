import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DataTable({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  emptyMessage = "אין נתונים להצגה" 
}) {
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce((acc, col) => ({
      ...acc,
      [col.key]: col.width || 150
    }), {})
  );
  const [resizing, setResizing] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleMouseDown = (e, key) => {
    e.preventDefault();
    setResizing({ key, startX: e.clientX, startWidth: columnWidths[key] });
  };

  React.useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(80, resizing.startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [resizing.key]: newWidth }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground px-4">
        {emptyMessage}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-3 px-4">
        <AnimatePresence>
          {data.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <Card className="rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-lg font-bold text-primary">
                      {columns[2] && columns[2].render ? columns[2].render(item[columns[2].key], item) : item[columns[2].key]}
                    </div>
                    <div className="text-base font-semibold text-foreground">
                      {columns[0] && columns[0].render ? columns[0].render(item[columns[0].key], item) : item[columns[0].key]}
                    </div>
                  </div>
                  {columns[1] && item[columns[1].key] && (
                    <div className="text-sm text-muted-foreground mb-2">
                      {columns[1].label}: {columns[1].render ? columns[1].render(item[columns[1].key], item) : item[columns[1].key]}
                    </div>
                  )}
                  {columns[3] && item[columns[3].key] && (
                    <div className="text-sm text-muted-foreground mb-2">
                      {columns[3].render ? columns[3].render(item[columns[3].key], item) : item[columns[3].key]}
                    </div>
                  )}
                  {columns[4] && item[columns[4].key] && (
                    <div className="mb-2">
                      {columns[4].render ? columns[4].render(item[columns[4].key], item) : item[columns[4].key]}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end mt-3 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Pencil className="h-4 w-4 ml-1" />
                      ערוך
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await onDelete(item);
                        await new Promise(resolve => setTimeout(resolve, 200));
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      מחק
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

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={`text-right text-foreground font-semibold px-4 py-3 relative group ${col.className || ''}`}
                  style={{ width: `${columnWidths[col.key]}px` }}
                >
                  <div className="flex items-center justify-between">
                    <span>{col.label}</span>
                  </div>
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary group-hover:bg-primary/50 transition-colors"
                    onMouseDown={(e) => handleMouseDown(e, col.key)}
                    style={{ 
                      background: resizing?.key === col.key ? 'hsl(var(--primary))' : 'transparent'
                    }}
                  />
                </th>
              ))}
              <th className="w-24 text-center text-foreground font-semibold px-4 py-3">פעולות</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {data.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      className={`text-foreground px-4 py-3 overflow-hidden text-ellipsis ${col.cellClassName || ''}`}
                      style={{ width: `${columnWidths[col.key]}px` }}
                      title={typeof item[col.key] === 'string' ? item[col.key] : ''}
                    >
                      {col.render ? col.render(item[col.key], item) : (item[col.key] || '-')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          await onDelete(item);
                          await new Promise(resolve => setTimeout(resolve, 200));
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
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