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
  finance: "פיננסים",
  other: "אחר"
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

export default function CategoryBreakdown({ expenses, totalBudget }) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const cat = expense.category || 'other';
    acc[cat] = (acc[cat] || 0) + (expense.amount || 0);
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  const maxAmount = Math.max(...Object.values(categoryTotals), 1);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">פירוט לפי קטגוריה</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedCategories.length === 0 ? (
          <p className="text-gray-400 text-center py-4">אין נתונים להצגה</p>
        ) : (
          sortedCategories.map(([category, amount]) => (
            <div key={category} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {categoryLabels[category] || category}
                </span>
                <span className="text-gray-600">₪{amount.toLocaleString()}</span>
              </div>
              <Progress 
                value={(amount / maxAmount) * 100} 
                className={`h-2 ${categoryColors[category] || 'bg-gray-500'}`}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}