import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Calculator, 
  Lightbulb,
  Calendar,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import moment from 'moment';

const expenseLabels = {
  food: "מזון ופארמה", leisure: "פנאי ובילוי", clothing: "ביגוד והנעלה",
  household_items: "תכולת בית", home_maintenance: "אחזקת בית", grooming: "טיפוח",
  education: "חינוך", events: "אירועים ותרומות", health: "בריאות",
  transportation: "תחבורה", family: "משפחה", communication: "תקשורת",
  housing: "דיור", obligations: "התחייבויות", assets: "נכסים", finance: "פיננסים", other: "אחר"
};

export default function AIPlanning() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [whatIfResults, setWhatIfResults] = useState(null);
  
  // What-if scenario inputs
  const [incomeChange, setIncomeChange] = useState('');
  const [expenseChange, setExpenseChange] = useState('');
  const [changeCategory, setChangeCategory] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: households = [] } = useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Household.list();
      return all.filter(h => 
        h.owner_email === user.email || 
        (h.members && h.members.includes(user.email))
      );
    },
    enabled: !!user
  });

  const selectedHouseholdId = households[0]?.id;

  const { data: allIncomes = [] } = useQuery({
    queryKey: ['allIncomes', selectedHouseholdId],
    queryFn: async () => {
      if (!selectedHouseholdId) return [];
      return base44.entities.Income.filter({ household_id: selectedHouseholdId }, '-created_date', 500);
    },
    enabled: !!selectedHouseholdId
  });

  const { data: allExpenses = [] } = useQuery({
    queryKey: ['allExpenses', selectedHouseholdId],
    queryFn: async () => {
      if (!selectedHouseholdId) return [];
      return base44.entities.Expense.filter({ household_id: selectedHouseholdId }, '-created_date', 500);
    },
    enabled: !!selectedHouseholdId
  });

  const generateRecommendations = async () => {
    if (!selectedHouseholdId || isGenerating) return;
    
    setIsGenerating(true);
    try {
      // Group by month/year for analysis
      const monthlyData = {};
      
      allIncomes.forEach(income => {
        const key = `${income.year}-${income.month}`;
        if (!monthlyData[key]) monthlyData[key] = { incomes: [], expenses: [] };
        monthlyData[key].incomes.push(income);
      });
      
      allExpenses.forEach(expense => {
        const key = `${expense.year}-${expense.month}`;
        if (!monthlyData[key]) monthlyData[key] = { incomes: [], expenses: [] };
        monthlyData[key].expenses.push(expense);
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה יועץ פיננסי מומחה. נתח את דפוסי ההוצאה וההכנסה ההיסטוריים והמלץ על שיפורים.

נתונים היסטוריים:
${JSON.stringify(monthlyData, null, 2)}

תייצר המלצות מפורטות שכוללות:
1. זיהוי דפוסים בהוצאות - אילו קטגוריות עולות/יורדות לאורך זמן
2. זיהוי הזדמנויות לחסכון - איפה אפשר לצמצם בלי לפגוע באיכות חיים
3. המלצות ספציפיות לכל קטגוריית הוצאה עם סכומים מוצעים
4. המלצות לאיזון תקציבי - כיצד להגיע ליתרה חיובית
5. דירוג סיכונים - קטגוריות בעייתיות שדורשות תשומת לב
6. הצעות להגדלת הכנסות או אופטימיזציה פיננסית

החזר JSON בעברית:`,
        response_json_schema: {
          type: "object",
          properties: {
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  trend: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            savings_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  current_avg: { type: "number" },
                  suggested_amount: { type: "number" },
                  potential_savings: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            },
            category_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  recommendation: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            budget_balance_tips: {
              type: "array",
              items: { type: "string" }
            },
            risk_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            income_suggestions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('שגיאה ביצירת המלצות');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateForecast = async () => {
    if (!selectedHouseholdId || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה אנליסט פיננסי. על סמך הנתונים ההיסטוריים, תחזה הכנסות והוצאות ל-12 החודשים הקרובים.

נתונים היסטוריים:
הכנסות: ${JSON.stringify(allIncomes.slice(0, 50), null, 2)}
הוצאות: ${JSON.stringify(allExpenses.slice(0, 50), null, 2)}

החזר תחזית חודשית ל-12 חודשים קדימה החל מ-${currentMonth}/${currentYear}.
התחשב במגמות, עונתיות ושינויים היסטוריים.

החזר JSON בפורמט:`,
        response_json_schema: {
          type: "object",
          properties: {
            monthly_forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "number" },
                  year: { type: "number" },
                  predicted_income: { type: "number" },
                  predicted_expenses: { type: "number" },
                  predicted_balance: { type: "number" },
                  confidence: { type: "string" },
                  notes: { type: "string" }
                }
              }
            },
            yearly_summary: {
              type: "object",
              properties: {
                total_income: { type: "number" },
                total_expenses: { type: "number" },
                total_balance: { type: "number" },
                key_insights: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setForecast(result);
    } catch (error) {
      console.error('Error generating forecast:', error);
      alert('שגיאה ביצירת תחזית');
    } finally {
      setIsGenerating(false);
    }
  };

  const runWhatIfScenario = async () => {
    if (!selectedHouseholdId || isGenerating) return;
    if (!incomeChange && !expenseChange) {
      alert('יש להזין לפחות שינוי אחד');
      return;
    }
    
    setIsGenerating(true);
    try {
      const currentMonthIncomes = allIncomes.filter(i => {
        const d = new Date();
        return i.month === d.getMonth() + 1 && i.year === d.getFullYear();
      });
      
      const currentMonthExpenses = allExpenses.filter(e => {
        const d = new Date();
        return e.month === d.getMonth() + 1 && e.year === d.getFullYear();
      });

      const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);
      const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      const scenario = {
        current: {
          income: totalIncome,
          expenses: totalExpenses,
          balance: totalIncome - totalExpenses
        },
        changes: {
          income_change: parseFloat(incomeChange) || 0,
          expense_change: parseFloat(expenseChange) || 0,
          category: changeCategory || 'כללי'
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `נתח תרחיש "מה אם" פיננסי.

מצב נוכחי:
- הכנסות: ₪${scenario.current.income}
- הוצאות: ₪${scenario.current.expenses}
- יתרה: ₪${scenario.current.balance}

שינויים מוצעים:
- שינוי בהכנסות: ₪${scenario.changes.income_change}
- שינוי בהוצאות: ₪${scenario.changes.expense_change}
- קטגוריה: ${scenario.changes.category}

נתח את ההשפעה של השינויים הללו על:
1. יתרה חודשית ושנתית
2. יכולת חסכון
3. רמת סיכון פיננסי
4. המלצות לניהול השינוי
5. השפעה ארוכת טווח

החזר JSON מפורט:`,
        response_json_schema: {
          type: "object",
          properties: {
            projected_state: {
              type: "object",
              properties: {
                new_income: { type: "number" },
                new_expenses: { type: "number" },
                new_balance: { type: "number" },
                monthly_change: { type: "number" },
                yearly_change: { type: "number" }
              }
            },
            impact_analysis: {
              type: "object",
              properties: {
                savings_impact: { type: "string" },
                risk_level: { type: "string" },
                sustainability: { type: "string" }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            long_term_effects: {
              type: "array",
              items: { type: "string" }
            },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            }
          }
        }
      });

      setWhatIfResults(result);
    } catch (error) {
      console.error('Error running what-if scenario:', error);
      alert('שגיאה בניתוח תרחיש');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedHouseholdId) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">נדרש משק בית</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              יש ליצור משק בית כדי להשתמש בכלי תכנון AI
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                תכנון תקציב חכם
              </h1>
              <p className="text-gray-500">
                ניתוח מתקדם והמלצות מבוססות AI
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm p-1 rounded-xl">
            <TabsTrigger value="recommendations" className="rounded-lg">
              <Lightbulb className="w-4 h-4 ml-2" />
              המלצות אדפטיביות
            </TabsTrigger>
            <TabsTrigger value="forecast" className="rounded-lg">
              <TrendingUp className="w-4 h-4 ml-2" />
              תחזית עתידית
            </TabsTrigger>
            <TabsTrigger value="whatif" className="rounded-lg">
              <Calculator className="w-4 h-4 ml-2" />
              תרחישי "מה אם"
            </TabsTrigger>
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  המלצות מותאמות אישית על סמך ההיסטוריה שלך
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  קבל המלצות חכמות לשיפור התקציב שלך על סמך ניתוח דפוסי ההוצאה וההכנסה שלך
                </p>
                <Button
                  onClick={generateRecommendations}
                  disabled={isGenerating || allExpenses.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? 'מייצר המלצות...' : 'צור המלצות חכמות'}
                </Button>

                {recommendations && (
                  <div className="space-y-6 mt-6">
                    {/* Patterns */}
                    {recommendations.patterns && recommendations.patterns.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">דפוסים שזוהו</h3>
                        <div className="grid gap-3">
                          {recommendations.patterns.map((pattern, idx) => (
                            <Card key={idx} className="bg-blue-50 border-blue-200">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
                                  <div>
                                    <p className="font-semibold text-blue-900">
                                      {expenseLabels[pattern.category] || pattern.category}
                                    </p>
                                    <p className="text-sm text-blue-700">{pattern.trend}</p>
                                    <p className="text-sm text-gray-700 mt-1">{pattern.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Savings Opportunities */}
                    {recommendations.savings_opportunities && recommendations.savings_opportunities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">הזדמנויות לחסכון</h3>
                        <div className="grid gap-3">
                          {recommendations.savings_opportunities.map((opp, idx) => (
                            <Card key={idx} className="bg-green-50 border-green-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold text-green-900">
                                      {expenseLabels[opp.category] || opp.category}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1">{opp.explanation}</p>
                                    <div className="flex gap-4 mt-2 text-sm">
                                      <span className="text-gray-600">
                                        ממוצע נוכחי: ₪{opp.current_avg?.toLocaleString()}
                                      </span>
                                      <span className="text-green-700 font-semibold">
                                        מומלץ: ₪{opp.suggested_amount?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge className="bg-green-600 text-white">
                                    חסכון: ₪{opp.potential_savings?.toLocaleString()}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Areas */}
                    {recommendations.risk_areas && recommendations.risk_areas.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          אזורי סיכון
                        </h3>
                        <div className="grid gap-3">
                          {recommendations.risk_areas.map((risk, idx) => (
                            <Card key={idx} className="bg-red-50 border-red-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-red-900">{risk.area}</p>
                                    <p className="text-sm text-gray-700 mt-1">{risk.description}</p>
                                  </div>
                                  <Badge className={
                                    risk.severity === 'high' || risk.severity === 'גבוה' 
                                      ? 'bg-red-600 text-white' 
                                      : 'bg-yellow-600 text-white'
                                  }>
                                    {risk.severity}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Budget Balance Tips */}
                    {recommendations.budget_balance_tips && recommendations.budget_balance_tips.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">טיפים לאיזון תקציבי</h3>
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="p-4">
                            <ul className="space-y-2">
                              {recommendations.budget_balance_tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-purple-600 font-bold">•</span>
                                  <span className="text-gray-700">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  תחזית הכנסות והוצאות ל-12 חודשים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  קבל תחזית מבוססת AI להכנסות והוצאות שלך לשנה הקרובה
                </p>
                <Button
                  onClick={generateForecast}
                  disabled={isGenerating || allExpenses.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? 'מייצר תחזית...' : 'צור תחזית עתידית'}
                </Button>

                {forecast && forecast.monthly_forecast && (
                  <div className="space-y-6 mt-6">
                    <div className="grid gap-3">
                      {forecast.monthly_forecast.map((month, idx) => {
                        const isPositive = month.predicted_balance >= 0;
                        return (
                          <Card key={idx} className="bg-white">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {month.month}/{month.year}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">{month.notes}</p>
                                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                    <div>
                                      <span className="text-gray-500">הכנסות</span>
                                      <p className="font-semibold text-green-700">
                                        ₪{month.predicted_income?.toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">הוצאות</span>
                                      <p className="font-semibold text-orange-700">
                                        ₪{month.predicted_expenses?.toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">יתרה</span>
                                      <p className={`font-semibold ${isPositive ? 'text-blue-700' : 'text-red-700'}`}>
                                        ₪{month.predicted_balance?.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isPositive ? (
                                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                                  )}
                                  <Badge variant="outline">{month.confidence}</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {forecast.yearly_summary && (
                      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                        <CardHeader>
                          <CardTitle>סיכום שנתי</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm text-gray-600">סה״כ הכנסות</span>
                              <p className="text-2xl font-bold text-green-700">
                                ₪{forecast.yearly_summary.total_income?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">סה״כ הוצאות</span>
                              <p className="text-2xl font-bold text-orange-700">
                                ₪{forecast.yearly_summary.total_expenses?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">יתרה שנתית</span>
                              <p className={`text-2xl font-bold ${forecast.yearly_summary.total_balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                ₪{forecast.yearly_summary.total_balance?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {forecast.yearly_summary.key_insights && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2">תובנות מפתח</h4>
                              <ul className="space-y-2">
                                {forecast.yearly_summary.key_insights.map((insight, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span className="text-gray-700">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* What-If Tab */}
          <TabsContent value="whatif" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-orange-600" />
                  ניתוח תרחישים - "מה אם?"
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  בדוק את ההשפעה של שינויים צפויים על התקציב שלך
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income-change">שינוי בהכנסות (₪)</Label>
                    <Input
                      id="income-change"
                      type="number"
                      value={incomeChange}
                      onChange={(e) => setIncomeChange(e.target.value)}
                      placeholder="לדוגמה: 2000 או -1500"
                      className="text-left"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500">מספר חיובי = עלייה, שלילי = ירידה</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense-change">שינוי בהוצאות (₪)</Label>
                    <Input
                      id="expense-change"
                      type="number"
                      value={expenseChange}
                      onChange={(e) => setExpenseChange(e.target.value)}
                      placeholder="לדוגמה: 500 או -300"
                      className="text-left"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500">מספר חיובי = עלייה, שלילי = ירידה</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="category">קטגוריה (אופציונלי)</Label>
                    <Input
                      id="category"
                      value={changeCategory}
                      onChange={(e) => setChangeCategory(e.target.value)}
                      placeholder="לדוגמה: דיור, תחבורה, חינוך"
                    />
                  </div>
                </div>

                <Button
                  onClick={runWhatIfScenario}
                  disabled={isGenerating || (!incomeChange && !expenseChange)}
                  className="bg-orange-600 hover:bg-orange-700 w-full"
                >
                  {isGenerating ? 'מנתח תרחיש...' : 'נתח תרחיש'}
                </Button>

                {whatIfResults && (
                  <div className="space-y-6 mt-6">
                    {/* Projected State */}
                    {whatIfResults.projected_state && (
                      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                        <CardHeader>
                          <CardTitle className="text-lg">מצב צפוי</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm text-gray-600">הכנסות חדשות</span>
                              <p className="text-xl font-bold text-green-700">
                                ₪{whatIfResults.projected_state.new_income?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">הוצאות חדשות</span>
                              <p className="text-xl font-bold text-orange-700">
                                ₪{whatIfResults.projected_state.new_expenses?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">יתרה חדשה</span>
                              <p className={`text-xl font-bold ${whatIfResults.projected_state.new_balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                ₪{whatIfResults.projected_state.new_balance?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">שינוי חודשי</span>
                              <p className={`text-xl font-bold ${whatIfResults.projected_state.monthly_change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                ₪{whatIfResults.projected_state.monthly_change?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">שינוי שנתי</span>
                              <p className={`text-xl font-bold ${whatIfResults.projected_state.yearly_change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                ₪{whatIfResults.projected_state.yearly_change?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Impact Analysis */}
                    {whatIfResults.impact_analysis && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">ניתוח השפעה</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">השפעה על חסכון</span>
                            <span className="font-semibold">{whatIfResults.impact_analysis.savings_impact}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">רמת סיכון</span>
                            <Badge className={
                              whatIfResults.impact_analysis.risk_level?.includes('גבוה') || whatIfResults.impact_analysis.risk_level?.includes('high')
                                ? 'bg-red-600' 
                                : whatIfResults.impact_analysis.risk_level?.includes('בינוני') || whatIfResults.impact_analysis.risk_level?.includes('medium')
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }>
                              {whatIfResults.impact_analysis.risk_level}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">קיימות</span>
                            <span className="font-semibold">{whatIfResults.impact_analysis.sustainability}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {whatIfResults.recommendations && whatIfResults.recommendations.length > 0 && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg">המלצות</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {whatIfResults.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Items */}
                    {whatIfResults.action_items && whatIfResults.action_items.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">פעולות מומלצות</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {whatIfResults.action_items.map((item, idx) => (
                              <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{item.action}</p>
                                  <p className="text-sm text-gray-600 mt-1">זמן ביצוע: {item.timeline}</p>
                                </div>
                                <Badge className={
                                  item.priority?.includes('גבוה') || item.priority?.includes('high')
                                    ? 'bg-red-600' 
                                    : item.priority?.includes('בינוני') || item.priority?.includes('medium')
                                    ? 'bg-yellow-600'
                                    : 'bg-green-600'
                                }>
                                  {item.priority}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}