import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const convertToCSV = (data, columns) => {
  if (!data || data.length === 0) return '';

  // Headers
  const headers = columns.map(col => col.label).join(',');
  
  // Rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      
      // Handle rendering function
      if (col.render && typeof col.render === 'function') {
        const rendered = col.render(value);
        // If rendered is JSX, extract text content
        if (typeof rendered === 'object' && rendered !== null) {
          value = rendered.props?.children || '';
        } else {
          value = rendered;
        }
      }
      
      // Clean value for CSV
      value = value !== undefined && value !== null ? String(value) : '';
      
      // Escape commas and quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',');
  });

  return headers + '\n' + rows.join('\n');
};

const downloadCSV = (csvContent, filename) => {
  // Add BOM for Hebrew support in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ExportButton({ data, columns, filename, variant = "outline", className = "" }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('אין נתונים לייצוא');
      return;
    }

    const csv = convertToCSV(data, columns);
    downloadCSV(csv, `${filename}.csv`);
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size="sm"
      className={`gap-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      ייצא ל-CSV
    </Button>
  );
}

export { convertToCSV, downloadCSV };