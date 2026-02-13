import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import MobileSelect from "@/components/budget/MobileSelect";

const debtTypes = {
  gmach: "גמ\"ח",
  friends: "חברים",
  bank_loan: "בנק - הלוואה",
  property_tax: "ארנונה",
  vat: "מע\"מ",
  mortgage_arrears: "משכנתה - פיגורים",
  credit_card: "כרטיס אשראי",
  salary_loan: "משכורת - הלוואה",
  black_market: "שוק אפור",
  arrears: "פיגורים",
  family: "משפחה קרובה / רחוקה",
  bank_overdraft: "בנק - משיכת יתר",
  execution: "הוצאה לפועל",
  institution: "מוסד / חברה",
  alimony: "מזונות",
  national_insurance: "ביטוח לאומי",
  income_tax: "מס הכנסה",
  other: "אחר"
};

export default function DebtForm({ open, onClose, onSave, editItem }) {
  const [formData, setFormData] = useState({
    creditor_name: '',
    debt_type: '',
    total_amount: '',
    as_of_date: '',
    interest_rate: '',
    remaining_payments: '',
    monthly_payment: '',
    remaining_balance: '',
    is_arranged: false,
    notes: '',
    is_recurring: true
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        ...editItem,
        as_of_date: editItem.as_of_date || '',
        is_recurring: editItem.is_recurring !== undefined ? editItem.is_recurring : true
      });
    } else {
      setFormData({
        creditor_name: '',
        debt_type: '',
        total_amount: '',
        as_of_date: '',
        interest_rate: '',
        remaining_payments: '',
        monthly_payment: '',
        remaining_balance: '',
        is_arranged: false,
        notes: '',
        is_recurring: true
      });
    }
  }, [editItem, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      total_amount: parseFloat(formData.total_amount) || 0,
      interest_rate: parseFloat(formData.interest_rate) || 0,
      remaining_payments: parseInt(formData.remaining_payments) || 0,
      monthly_payment: parseFloat(formData.monthly_payment) || 0,
      remaining_balance: parseFloat(formData.remaining_balance) || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {editItem ? 'עריכת חוב' : 'הוספת חוב'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditor-name">שם הנושה</Label>
              <Input
                id="creditor-name"
                value={formData.creditor_name}
                onChange={(e) => setFormData({ ...formData, creditor_name: e.target.value })}
                placeholder="לדוגמה: בנק הפועלים"
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-type">סוג החוב</Label>
              <MobileSelect
                id="debt-type"
                value={formData.debt_type}
                onValueChange={(value) => setFormData({ ...formData, debt_type: value })}
                placeholder="בחר סוג"
                label="סוג החוב"
                options={Object.entries(debtTypes).map(([key, label]) => ({
                  value: key,
                  label: label
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debt-amount">סכום החוב (₪)</Label>
              <Input
                id="debt-amount"
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                placeholder="0"
                dir="ltr"
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-date">נכון ליום</Label>
              <Input
                id="debt-date"
                type="date"
                value={formData.as_of_date}
                onChange={(e) => setFormData({ ...formData, as_of_date: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>אחוז ריבית</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                placeholder="%"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>תשלומים נותרים</Label>
              <Input
                type="number"
                value={formData.remaining_payments}
                onChange={(e) => setFormData({ ...formData, remaining_payments: e.target.value })}
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>החזר חודשי (₪)</Label>
              <Input
                type="number"
                value={formData.monthly_payment}
                onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                placeholder="0"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>נותר לתשלום (₪)</Label>
              <Input
                type="number"
                value={formData.remaining_balance}
                onChange={(e) => setFormData({ ...formData, remaining_balance: e.target.value })}
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div className="space-y-2 flex items-center pt-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_arranged}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_arranged: checked })}
                />
                <Label>חוב בהסדר</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הערות נוספות..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <Checkbox
              id="recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
            <Label htmlFor="recurring" className="cursor-pointer font-normal text-foreground">
              חוב קבוע (רוב החובות קבועים)
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-red-500 hover:bg-red-600">
              {editItem ? 'עדכן' : 'הוסף'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { debtTypes };