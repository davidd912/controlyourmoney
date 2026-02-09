import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const categoryLabels = {
  food: "מזון ופארמה",
  leisure: "פנאי, בילוי ותחביבים",
  clothing: "ביגוד והנעלה",
  household_items: "תכולת בית",
  home_maintenance: "אחזקת בית",
  grooming: "טיפוח",
  education: "חינוך",
  events: "אירועים, תרומות ודת",
  health: "בריאות",
  transportation: "תחבורה",
  family: "משפחה",
  communication: "תקשורת",
  housing: "דיור",
  obligations: "התחייבויות",
  assets: "נכסים",
  finance: "פיננסים"
};

const categoryColors = {
  food: "bg-amber-500",
  leisure: "bg-pink-500",
  clothing: "bg-purple-500",
  household_items: "bg-indigo-500",
  home_maintenance: "bg-blue-500",
  grooming: "bg-rose-500",
  education: "bg-cyan-500",
  events: "bg-orange-500",
  health: "bg-red-500",
  transportation: "bg-emerald-500",
  family: "bg-violet-500",
  communication: "bg-sky-500",
  housing: "bg-teal-500",
  obligations: "bg-slate-500",
  assets: "bg-lime-500",
  finance: "bg-yellow-500",
  other: "bg-gray-500"
};

export default function CategoryBreakdown({ expenses, budgets = [] }) {
  // Calculate actual expenses per category
  const categoryTotals = expenses.reduce((acc, expense) => {
    let cat = expense.category || 'other';
    // For custom categories, use the custom name as the key
    if (cat === 'custom' && expense.custom_category_name) {
      cat = expense.custom_category_name;
    }
    acc[cat] = (acc[cat] || 0) + (expense.amount || 0);
    return acc;
  }, {});

  // Map budgets by category
  const categoryBudgets = budgets.reduce((acc, budget) => {
    let cat = budget.category;
    // For custom categories, use the custom name as the key
    if (cat === 'custom' && budget.custom_category_name) {
      cat = budget.custom_category_name;
    }
    acc[cat] = (acc[cat] || 0) + (budget.amount || 0);
    return acc;
  }, {});

  // Get all categories that have either actual expenses or budgets
  const allCategories = new Set([
    ...Object.keys(categoryTotals),
    ...Object.keys(categoryBudgets)
  ]);

  const categoryData = Array.from(allCategories).map(category => ({
    category,
    actual: categoryTotals[category] || 0,
    budget: categoryBudgets[category] || 0
  })).sort((a, b) => b.actual - a.actual);

  return (
    <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">פירוט לפי קטגוריה - תקציב מול ביצוע</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryData.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-4">אין נתונים להצגה</p>
        ) : (
          categoryData.map(({ category, actual, budget }) => {
            const percentage = budget > 0 ? (actual / budget) * 100 : 0;
            const remaining = budget - actual;
            const isOverBudget = actual > budget && budget > 0;
            
            return (
              <div key={category} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {categoryLabels[category] || category}
                  </span>
                  <div className="text-left" dir="ltr">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ₪{actual.toLocaleString()}
                      {budget > 0 && (
                        <span className="text-gray-400 dark:text-gray-500 text-xs"> / ₪{budget.toLocaleString()}</span>
                      )}
                    </div>
                    {budget > 0 && (
                      <div className={`text-xs ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {isOverBudget ? 'חריגה: ' : 'נותר: '}
                        ₪{Math.abs(remaining).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                {budget > 0 ? (
                  <>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${isOverBudget ? 'bg-red-500' : categoryColors[category] || 'bg-gray-500'}`}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{percentage.toFixed(0)}% מהתקציב</span>
                      {isOverBudget && percentage > 100 && (
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          חריגה של {(percentage - 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500">לא הוגדר תקציב</p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}