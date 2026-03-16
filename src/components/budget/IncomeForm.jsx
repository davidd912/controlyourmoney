import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import MobileSelect from "@/components/budget/MobileSelect";
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/components/LocaleContext';
import '@/components/i18n';

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
  const { t } = useTranslation();
  const { direction } = useLocale();
  const [formData, setFormData] = useState(editItem || {
    category: '',
    subcategory: '',
    amount: '',
    income_date: new Date().toISOString().split('T')[0],
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
        income_date: new Date().toISOString().split('T')[0],
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
      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700" dir={direction}>
        <DialogHeader>
          <DialogTitle className="text-right">
            {editItem ? t('edit_income') : t('add_income_title')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-category">{t('category')}</Label>
            <MobileSelect
              id="income-category"
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}
              placeholder={t('select_category')}
              label={t('select_category')}
              options={Object.entries(incomeCategories).map(([key]) => ({
                value: key,
                label: t(`income_cat.${key}`)
              }))}
            />
          </div>

          {formData.category && (
            <div className="space-y-2">
              <Label htmlFor="income-subcategory">{t('subcategory')}</Label>
              <MobileSelect
                id="income-subcategory"
                value={formData.subcategory}
                onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                placeholder={t('select_subcategory')}
                label={t('select_subcategory')}
                options={incomeCategories[formData.category]?.subcategories.map((sub) => ({
                  value: sub,
                  label: sub
                })) || []}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="income-amount">{t('monthly_amount')}</Label>
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
            <Label htmlFor="income-description">{t('description_optional')}</Label>
            <Input
              id="income-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('notes_placeholder')}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Checkbox
              id="recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
            <Label htmlFor="recurring" className="cursor-pointer font-normal text-foreground">
              {t('recurring_income')}
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editItem ? t('update') : t('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}