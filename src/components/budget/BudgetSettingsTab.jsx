import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { motion } from "framer-motion";

const expenseCategories = {
  food: { label: "מזון ופארמה", icon: "🍎" },
  leisure: { label: "פנאי, בילוי ותחביבים", icon: "🎭" },
  clothing: { label: "ביגוד והנעלה", icon: "👕" },
  household_items: { label: "תכולת בית", icon: "🛋️" },
  home_maintenance: { label: "אחזקת בית", icon: "🏠" },
  grooming: { label: "טיפוח", icon: "💇" },
  education: { label: "חינוך", icon: "📚" },
  events: { label: "אירועים, תרומות ודת", icon: "🎉" },
  health: { label: "בריאות", icon: "❤️" },
  transportation: { label: "תחבורה", icon: "🚗" },
  family: { label: "משפחה", icon: "👨‍👩‍👧‍👦" },
  communication: { label: "תקשורת", icon: "📱" },
  housing: { label: "דיור", icon: "🏡" },
  obligations: { label: "התחייבויות", icon: "📋" },
  assets: { label: "נכסים", icon: "💰" },
  finance: { label: "פיננסים", icon: "🏦" }
};

export default function BudgetSettingsTab({ 
  householdId, 
  month, 
  year, 
  existingBudgets = [],
  onSave 
}) {
  const [budgets, setBudgets] = useState({});
  const [customCategories, setCustomCategories] = useState([]);
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing budgets into state
    const budgetMap = {};
    const customCats = [];
    existingBudgets.forEach(budget => {
      if (budget.category === 'custom' && budget.custom_category_name) {
        const customKey = `custom_${budget.custom_category_name}`;
        budgetMap[customKey] = budget.amount;
        customCats.push(budget.custom_category_name);
      } else {
        budgetMap[budget.category] = budget.amount;
      }
    });
    
    // ALWAYS merge with existing - never replace completely
    // This prevents categories from disappearing during data refresh
    setCustomCategories(prev => {
      const allCustom = [...new Set([...prev, ...customCats])];
      return allCustom;
    });
    
    // Merge budgets, don't replace
    setBudgets(prev => ({
      ...prev,
      ...budgetMap
    }));
  }, [existingBudgets]);

  const handleBudgetChange = (category, value) => {
    setBudgets(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleAddCustomCategory = () => {
    if (newCustomCategory.trim() && !customCategories.includes(newCustomCategory.trim())) {
      setCustomCategories([...customCategories, newCustomCategory.trim()]);
      setNewCustomCategory('');
    }
  };

  const handleRemoveCustomCategory = (categoryName) => {
    setCustomCategories(customCategories.filter(c => c !== categoryName));
    const customKey = `custom_${categoryName}`;
    const newBudgets = { ...budgets };
    delete newBudgets[customKey];
    setBudgets(newBudgets);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(budgets, customCategories);
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
          {/* Add Custom Category Section */}
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300">
            <Label className="text-base font-semibold text-blue-900 mb-3 block">
              ✨ הוסף קטגוריה מותאמת אישית
            </Label>
            <div className="flex gap-2">
              <Input
                value={newCustomCategory}
                onChange={(e) => setNewCustomCategory(e.target.value)}
                placeholder="שם הקטגוריה החדשה..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                className="flex-1"
              />
              <Button
                onClick={handleAddCustomCategory}
                disabled={!newCustomCategory.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                הוסף
              </Button>
            </div>
          </div>

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

            {/* Custom Categories */}
            {customCategories.map((categoryName) => {
              const customKey = `custom_${categoryName}`;
              return (
                <motion.div
                  key={customKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 hover:shadow-md transition-shadow relative"
                >
                  <button
                    onClick={() => handleRemoveCustomCategory(categoryName)}
                    className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="מחק קטגוריה"
                  >
                    ×
                  </button>
                  <Label className="flex items-center gap-2 mb-2 font-semibold text-purple-700">
                    <span className="text-2xl">✏️</span>
                    {categoryName}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={budgets[customKey] || ''}
                      onChange={(e) => handleBudgetChange(customKey, e.target.value)}
                      placeholder="הזן תקציב..."
                      className="text-left pr-8"
                      dir="ltr"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₪
                    </span>
                  </div>
                  {budgets[customKey] && (
                    <p className="text-xs text-gray-500 mt-1 text-left" dir="ltr">
                      ₪{parseInt(budgets[customKey]).toLocaleString()}
                    </p>
                  )}
                </motion.div>
              );
            })}
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