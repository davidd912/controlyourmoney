import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import MobileSelect from "@/components/budget/MobileSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const expenseCategories = {
  food: {
    label: "מזון ופארמה",
    icon: "🍎",
    subcategories: ["מזון", "פארמה וטואלטיקה", "בר מים", "אוכל מוכן/בעבודה", "עישון", "אחר"]
  },
  leisure: {
    label: "פנאי, בילוי ותחביבים",
    icon: "🎭",
    subcategories: ["מסעדה ואוכל בחוץ", "ספורט", "חופשות", "בילויים ומופעים", "חיות מחמד", "חוגי מבוגרים", "בייביסיטר", "הגרלות", "אחר"]
  },
  clothing: {
    label: "ביגוד והנעלה",
    icon: "👕",
    subcategories: ["ביגוד הורים", "ביגוד ילדים", "נעליים", "אחר"]
  },
  household_items: {
    label: "תכולת בית",
    icon: "🛋️",
    subcategories: ["ריהוט", "מוצרי חשמל ואלקטרוניקה", "משחקים, צעצועים וספרים", "כלי בית", "אחר"]
  },
  home_maintenance: {
    label: "אחזקת בית",
    icon: "🏠",
    subcategories: ["חשמל", "מים וביוב", "גז", "ניקיון", "תיקונים בבית/מכשירים", "גינה", "אחר"]
  },
  grooming: {
    label: "טיפוח",
    icon: "💇",
    subcategories: ["מספרה", "קוסמטיקה", "אחר"]
  },
  education: {
    label: "חינוך",
    icon: "📚",
    subcategories: ["בית ספר", "מסגרות צהריים", "מסגרות יום", "צהרון/מטפלת", "הסעות", "שיעור פרטי", "מסגרות קיץ", "חוגים ותנועות נוער", "לימודים והשתלמות לבוגרים", "אחר"]
  },
  events: {
    label: "אירועים, תרומות ודת",
    icon: "🎉",
    subcategories: ["חגים וצרכי דת", "אירוע בעבודה/לחברים", "תרומות", "אחר"]
  },
  health: {
    label: "בריאות",
    icon: "❤️",
    subcategories: ["קופ\"ח תשלום קבוע", "ביטוח רפואי נוסף", "טיפולים פרטיים", "תרופות", "טיפולי שיניים", "אופטיקה", "אחר"]
  },
  transportation: {
    label: "תחבורה",
    icon: "🚗",
    subcategories: ["דלק", "חנייה", "כבישי אגרה", "ביטוח רכב", "תחזוקת רכב", "תחבורה ציבורית", "רישוי רכב", "תחבורה שיתופית", "ליסינג", "אחר"]
  },
  family: {
    label: "משפחה",
    icon: "👨‍👩‍👧‍👦",
    subcategories: ["אירועי שמחות במשפחה", "דמי כיס", "עזרה למשפחה", "תשלום מזונות", "אחר"]
  },
  communication: {
    label: "תקשורת",
    icon: "📱",
    subcategories: ["טלפון נייד ונייח", "טלוויזיה ואינטרנט", "שירותי תוכן", "אחר"]
  },
  housing: {
    label: "דיור",
    icon: "🏡",
    subcategories: ["משכנתה", "שכר דירה", "מיסי ישוב/ועד בית", "ארנונה", "ביטוח נכס ותכולה", "אחר"]
  },
  obligations: {
    label: "התחייבויות",
    icon: "📋",
    subcategories: ["החזר חובות חודשי (למעט משכנתה)", "ריביות משיכת יתר", "אחר"]
  },
  assets: {
    label: "נכסים",
    icon: "💰",
    subcategories: ["הפקדות לחסכונות", "אחר"]
  },
  finance: {
    label: "פיננסים",
    icon: "🏦",
    subcategories: ["עמלות", "ביטוח חיים", "ביטוח לאומי", "אחר"]
  },
  other: {
    label: "אחר",
    icon: "📝",
    subcategories: []
  }
};

export default function ExpenseForm({ open, onClose, onSave, editItem, remainingBudgetByCategory = {}, customCategories = [] }) {
  const [formData, setFormData] = useState({
    category: '',
    custom_category_name: '',
    subcategory: '',
    amount: '',
    priority: null,
    description: '',
    is_recurring: false
  });

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      setFormData({
        category: '',
        custom_category_name: '',
        subcategory: '',
        amount: '',
        priority: null,
        description: '',
        is_recurring: false
      });
    }
  }, [editItem, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      priority: formData.priority ? parseInt(formData.priority) : null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right dark:text-white">
            {editItem ? 'עריכת הוצאה' : 'הוספת הוצאה'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-category">קטגוריה</Label>
            <Select
              value={formData.category === 'custom' && formData.custom_category_name ? formData.custom_category_name : formData.category}
              onValueChange={(value) => {
                // Check if it's a custom category
                const isCustom = customCategories.includes(value);
                if (isCustom) {
                  setFormData({ ...formData, category: 'custom', custom_category_name: value, subcategory: '' });
                } else {
                  setFormData({ ...formData, category: value, custom_category_name: '', subcategory: '' });
                }
              }}
            >
              <SelectTrigger id="expense-category">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(expenseCategories).map(([key, { label, icon }]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span>{label}</span>
                    </span>
                  </SelectItem>
                ))}
                {customCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100">
                      קטגוריות מותאמות אישית
                    </div>
                    {customCategories.map((categoryName) => (
                      <SelectItem key={`custom_${categoryName}`} value={categoryName}>
                        <span className="flex items-center gap-2">
                          <span>✏️</span>
                          <span>{categoryName}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {formData.category && formData.category !== 'custom' && customCategories.includes(formData.custom_category_name || formData.category) && (
            <>
              {(() => {
                const categoryKey = formData.category === 'custom' && formData.custom_category_name 
                  ? `custom_${formData.custom_category_name}` 
                  : formData.category;
                return remainingBudgetByCategory[categoryKey] !== undefined && (
                  <div className={`p-3 rounded-lg ${
                    remainingBudgetByCategory[categoryKey] >= 0 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      remainingBudgetByCategory[categoryKey] >= 0 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      {remainingBudgetByCategory[categoryKey] >= 0 
                        ? `💰 נותר בתקציב: ₪${remainingBudgetByCategory[categoryKey].toLocaleString()}`
                        : `⚠️ חריגה מהתקציב: ₪${Math.abs(remainingBudgetByCategory[categoryKey]).toLocaleString()}`
                      }
                    </p>
                  </div>
                );
              })()}
            </>
          )}

          {formData.category && formData.category !== 'custom' && (
            <>
              {remainingBudgetByCategory[formData.category] !== undefined && (
                <div className={`p-3 rounded-lg ${
                  remainingBudgetByCategory[formData.category] >= 0 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    remainingBudgetByCategory[formData.category] >= 0 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {remainingBudgetByCategory[formData.category] >= 0 
                      ? `💰 נותר בתקציב: ₪${remainingBudgetByCategory[formData.category].toLocaleString()}`
                      : `⚠️ חריגה מהתקציב: ₪${Math.abs(remainingBudgetByCategory[formData.category]).toLocaleString()}`
                    }
                  </p>
                </div>
              )}
              {expenseCategories[formData.category]?.subcategories?.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="expense-subcategory">תת-קטגוריה</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                  >
                    <SelectTrigger id="expense-subcategory">
                      <SelectValue placeholder="בחר תת-קטגוריה" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories[formData.category].subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="expense-amount">סכום חודשי (₪)</Label>
            <Input
              id="expense-amount"
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
            <Label>עדיפות לצמצום</Label>
            <RadioGroup
              value={formData.priority?.toString()}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1" id="p1" />
                <Label htmlFor="p1" className="text-sm cursor-pointer">קל לצמצם</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="2" id="p2" />
                <Label htmlFor="p2" className="text-sm cursor-pointer">קשה אך אפשרי</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="3" id="p3" />
                <Label htmlFor="p3" className="text-sm cursor-pointer">לא נוגעים</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-description">תיאור (אופציונלי)</Label>
            <Input
              id="expense-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="הערות נוספות..."
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <Checkbox
              id="recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
            <Label htmlFor="recurring" className="cursor-pointer font-normal dark:text-gray-300">
              הוצאה קבועה (תועתק אוטומטית לחודשים הבאים)
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              {editItem ? 'עדכן' : 'הוסף'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { expenseCategories };