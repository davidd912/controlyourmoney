import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const assetTypes = {
  savings1: "חיסכון 1",
  savings2: "חיסכון 2",
  residential_property: "נדל\"ן למגורים",
  investment_property: "נדל\"ן להשקעה",
  vehicle: "רכב",
  pension: "פנסיה",
  education_fund: "קרן השתלמות",
  other: "אחר"
};

export default function AssetForm({ open, onClose, onSave, editItem }) {
  const [formData, setFormData] = useState({
    asset_type: '',
    name: '',
    monthly_deposit: '',
    current_value: '',
    notes: '',
    is_recurring: true
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        ...editItem,
        is_recurring: editItem.is_recurring !== undefined ? editItem.is_recurring : true
      });
    } else {
      setFormData({
        asset_type: '',
        name: '',
        monthly_deposit: '',
        current_value: '',
        notes: '',
        is_recurring: true
      });
    }
  }, [editItem, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      monthly_deposit: parseFloat(formData.monthly_deposit) || 0,
      current_value: parseFloat(formData.current_value) || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {editItem ? 'עריכת נכס' : 'הוספת נכס/חיסכון'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-type">סוג הנכס</Label>
            <Select
              value={formData.asset_type}
              onValueChange={(value) => setFormData({ ...formData, asset_type: value })}
            >
              <SelectTrigger id="asset-type" aria-label="בחר סוג נכס">
                <SelectValue placeholder="בחר סוג נכס" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(assetTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-name">שם</Label>
            <Input
              id="asset-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="לדוגמה: חיסכון בבנק לאומי"
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>הפקדה חודשית (₪)</Label>
              <Input
                type="number"
                value={formData.monthly_deposit}
                onChange={(e) => setFormData({ ...formData, monthly_deposit: e.target.value })}
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>שווי כעת (₪)</Label>
              <Input
                type="number"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                placeholder="0"
                dir="ltr"
              />
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

          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Checkbox
              id="recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
            <Label htmlFor="recurring" className="cursor-pointer font-normal">
              הפקדה קבועה (רוב החסכונות קבועים)
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editItem ? 'עדכן' : 'הוסף'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { assetTypes };