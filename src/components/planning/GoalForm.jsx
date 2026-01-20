import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const goalCategories = {
  vehicle: "רכב",
  property: "דירה/נכס",
  vacation: "טיול/חופשה",
  education: "חינוך/השכלה",
  emergency_fund: "קרן חירום",
  wedding: "חתונה",
  other: "אחר"
};

const priorities = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה"
};

export default function GoalForm({ open, onClose, onSave, editItem }) {
  const [formData, setFormData] = useState(editItem || {
    title: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: 'other',
    priority: 'medium',
    monthly_contribution: ''
  });

  React.useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      setFormData({
        title: '',
        description: '',
        target_amount: '',
        current_amount: '',
        target_date: '',
        category: 'other',
        priority: 'medium',
        monthly_contribution: ''
      });
    }
  }, [editItem, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      target_amount: parseFloat(formData.target_amount) || 0,
      current_amount: parseFloat(formData.current_amount) || 0,
      monthly_contribution: formData.monthly_contribution ? parseFloat(formData.monthly_contribution) : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editItem ? 'ערוך מטרה' : 'הוסף מטרה חדשה'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">שם המטרה *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="לדוגמה: רכב חדש, דירה"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">קטגוריה</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({...formData, category: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(goalCategories).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="פרטים נוספים על המטרה"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_amount">סכום יעד *</Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                placeholder="0"
                required
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_amount">סכום נוכחי</Label>
              <Input
                id="current_amount"
                type="number"
                value={formData.current_amount}
                onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                placeholder="0"
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_date">תאריך יעד</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({...formData, target_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">עדיפות</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorities).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_contribution">תרומה חודשית מתוכננת</Label>
            <Input
              id="monthly_contribution"
              type="number"
              value={formData.monthly_contribution}
              onChange={(e) => setFormData({...formData, monthly_contribution: e.target.value})}
              placeholder="0"
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {editItem ? 'עדכן' : 'הוסף'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}