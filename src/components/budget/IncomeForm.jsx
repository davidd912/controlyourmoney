import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

const incomeCategories = {
  salary: {
    label: "שכר",
    subcategories: ["שכר עבודה 1", "שכר עבודה 2", "שכר עבודה 3", "שכר עבודה 4"]
  },
  allowance: {
    label: "קצבאות",
    subcategories: ["קצבת זיקנה", "קצבת ילדים", "קצבת נכות", "סיוע בשכר דירה"]
  },
  other: {
    label: "הכנסות שונות",
    subcategories: ["קבלת מזונות", "הכנסה מנכס", "עזרה ממשפחה", "אחר"]
  }
};

export default function IncomeForm({ open, onClose, onSave, editItem }) {
  const [formData, setFormData] = useState(editItem || {
    category: '',
    subcategory: '',
    amount: '',
    description: '',
    is_recurring: false
  });

  React.useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      setFormData({
        category: '',
        subcategory: '',
        amount: '',
        description: '',
        is_recurring: false
      });
    }
  }, [editItem, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {editItem ? 'עריכת הכנסה' : 'הוספת הכנסה'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-category">קטגוריה</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}
            >
              <SelectTrigger id="income-category" aria-label="בחר קטגוריית הכנסה">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(incomeCategories).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.category && (
            <div className="space-y-2">
              <Label htmlFor="income-subcategory">תת-קטגוריה</Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
              >
                <SelectTrigger id="income-subcategory" aria-label="בחר תת-קטגוריה">
                  <SelectValue placeholder="בחר תת-קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {incomeCategories[formData.category]?.subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="income-amount">סכום חודשי (₪)</Label>
            <Input
              id="income-amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              className="text-left"
              dir="ltr"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-description">תיאור (אופציונלי)</Label>
            <Input
              id="income-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="הערות נוספות..."
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Checkbox
              id="recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
            <Label htmlFor="recurring" className="cursor-pointer font-normal">
              הכנסה קבועה (תועתק אוטומטית לחודשים הבאים)
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editItem ? 'עדכן' : 'הוסף'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}