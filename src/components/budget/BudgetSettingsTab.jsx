import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { motion } from "framer-motion";

const expenseCategories = {
  food: { label: "מזון ופארמה", icon: "🍽️" },
  leisure: { label: "פנאי ובילוי", icon: "🎭" },
  clothing: { label: "ביגוד והנעלה", icon: "👔" },
  household_items: { label: "תכולת בית", icon: "🛋️" },
  home_maintenance: { label: "אחזקת בית", icon: "🔧" },
  grooming: { label: "טיפוח", icon: "💅" },
  education: { label: "חינוך", icon: "📚" },
  events: { label: "אירועים ותרומות", icon: "🎉" },
  health: { label: "בריאות", icon: "⚕️" },
  transportation: { label: "תחבורה", icon: "🚗" },
  family: { label: "משפחה", icon: "👨‍👩‍👧‍👦" },
  communication: { label: "תקשורת", icon: "📱" },
  housing: { label: "דיור", icon: "🏠" },
  obligations: { label: "התחייבויות", icon: "📋" },
  assets: { label: "נכסים", icon: "💎" },
  finance: { label: "פיננסים", icon: "💰" },
  other: { label: "אחר", icon: "📦" }
};

export default function BudgetSettingsTab({ 
  householdId, 
  month, 
  year, 
  existingBudgets = [],
  onSave 
}) {
  const [budgets, setBudgets] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing budgets into state
    const budgetMap = {};
    existingBudgets.forEach(budget => {
      budgetMap[budget.category] = budget.amount;
    });
    setBudgets(budgetMap);
  }, [existingBudgets]);

  const handleBudgetChange = (category, value) => {
    setBudgets(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(budgets);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>הגדרת תקציב חודשי לפי קטגוריות</span>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 ml-2" />
              {isSaving ? 'שומר...' : 'שמור תקציב'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(expenseCategories).map(([key, { label, icon }]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <Label className="flex items-center gap-2 mb-2 font-semibold text-gray-700">
                  <span className="text-2xl">{icon}</span>
                  {label}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={budgets[key] || ''}
                    onChange={(e) => handleBudgetChange(key, e.target.value)}
                    placeholder="הזן תקציב..."
                    className="text-left pr-8"
                    dir="ltr"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ₪
                  </span>
                </div>
                {budgets[key] && (
                  <p className="text-xs text-gray-500 mt-1 text-left" dir="ltr">
                    ₪{parseInt(budgets[key]).toLocaleString()}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">טיפ להגדרת תקציב</h4>
              <p className="text-sm text-blue-800">
                הגדר תקציב ריאלי לכל קטגוריה בהתאם להוצאות החודשיות שלך. 
                בסקירה הכללית תוכל לראות את ההתקדמות שלך ביחס לתקציב שהגדרת.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}