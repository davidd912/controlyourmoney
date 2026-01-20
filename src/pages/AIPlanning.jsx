import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  ArrowDownRight,
  Target,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import moment from 'moment';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GoalForm from "@/components/planning/GoalForm";
import GoalCard from "@/components/planning/GoalCard";

const expenseLabels = {
  food: "מזון ופארמה", leisure: "פנאי ובילוי", clothing: "ביגוד והנעלה",
  household_items: "תכולת בית", home_maintenance: "אחזקת בית", grooming: "טיפוח",
  education: "חינוך", events: "אירועים ותרומות", health: "בריאות",
  transportation: "תחבורה", family: "משפחה", communication: "תקשורת",
  housing: "דיור", obligations: "התחייבויות", assets: "נכסים", finance: "פיננסים", other: "אחר"
};

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

const translateCategory = (category) => {
  return expenseLabels[category] || category;
};

const translateSeverity = (severity) => {
  const translations = {
    'high': 'גבוה',
    'medium': 'בינוני',
    'low': 'נמוך',
    'critical': 'קריטי'
  };
  return translations[severity?.toLowerCase()] || severity;
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

  // Goals state
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);

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

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', selectedHouseholdId],
    queryFn: async () => {
      if (!selectedHouseholdId) return [];
      return base44.entities.Goal.filter({ household_id: selectedHouseholdId }, '-created_date', 100);
    },
    enabled: !!selectedHouseholdId
  });

  const queryClient = useQueryClient();

  // Goal mutations
  const createGoal = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setGoalFormOpen(false);
      setEditGoal(null);
    }
  });

  const updateGoal = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setGoalFormOpen(false);
      setEditGoal(null);
    }
  });

  const deleteGoal = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['goals'])
  });

  const handleSaveGoal = (data) => {
    const goalData = { ...data, household_id: selectedHouseholdId };
    if (editGoal) {
      updateGoal.mutate({ id: editGoal.id, data: goalData });
    } else {
      createGoal.mutate(goalData);
    }
  };

  const getGoalRecommendations = async (goal) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const remaining = goal.target_amount - goal.current_amount;
      const daysUntilTarget = goal.target_date 
        ? moment(goal.target_date).diff(moment(), 'days')
        : null;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const currentMonthIncomes = allIncomes.filter(i => i.month === currentMonth && i.year === currentYear);
      const currentMonthExpenses = allExpenses.filter(e => e.month === currentMonth && e.year === currentYear);
      
      const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);
      const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const monthlyBalance = totalIncome - totalExpenses;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה יועץ פיננסי מומחה. עזור למשתמש להשיג את המטרה הפיננסית שלו.

מידע על המטרה:
- שם: ${goal.title}
- סכום יעד: ₪${goal.target_amount.toLocaleString()}
- סכום נוכחי: ₪${goal.current_amount.toLocaleString()}
- נותר לחסוך: ₪${remaining.toLocaleString()}
- תאריך יעד: ${goal.target_date || 'לא הוגדר'}
- ימים עד היעד: ${daysUntilTarget || 'לא רלוונטי'}
- תרומה חודשית מתוכננת: ${goal.monthly_contribution ? `₪${goal.monthly_contribution.toLocaleString()}` : 'לא הוגדרה'}

מצב פיננסי נוכחי:
- הכנסות חודשיות: ₪${totalIncome.toLocaleString()}
- הוצאות חודשיות: ₪${totalExpenses.toLocaleString()}
- יתרה חודשית: ₪${monthlyBalance.toLocaleString()}

ספק המלצות מפורטות ומעשיות:
1. כמה צריך לחסוך כל חודש כדי להשיג את המטרה בזמן?
2. אילו הוצאות אפשר לצמצם כדי לפנות תקציב למטרה?
3. האם יש דרכים להגדיל הכנסות?
4. האם התאריך היעד ריאלי? אם לא, מה מומלץ?
5. טיפים ספציפיים להשגת המטרה

תן תשובה מפורטת ומעשית בעברית, עד 500 מילים.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: { type: "string" }
          }
        }
      });

      await updateGoal.mutateAsync({
        id: goal.id,
        data: { ...goal, ai_recommendations: result.recommendations }
      });
    } catch (error) {
      console.error('Error generating goal recommendations:', error);
      alert('שגיאה ביצירת המלצות למטרה');
    } finally {
      setIsGenerating(false);
    }
  };

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
        {/* Security Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="flex-1 text-right">
                <p className="font-semibold text-gray-900">הנתונים שלך מאובטחים ומוצפנים</p>
                <p className="text-gray-600 text-xs mt-0.5">
                  הניתוח מתבצע תוך שמירה קפדנית על פרטיותך. כל המידע מוצפן ונשמר בסודיות מוחלטת.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

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
            <TabsTrigger value="goals" className="rounded-lg">
              <Target className="w-4 h-4 ml-2" />
              מטרות פיננסיות
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
                <p className="text-gray-600 text-right">
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
                                  <div className="text-right flex-1">
                                    <p className="font-semibold text-blue-900">
                                      {translateCategory(pattern.category)}
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
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 text-right">
                                    <p className="font-semibold text-green-900">
                                      {translateCategory(opp.category)}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1">{opp.explanation}</p>
                                    <div className="flex gap-4 mt-2 text-sm flex-wrap">
                                      <span className="text-gray-600">
                                        ממוצע נוכחי: ₪{opp.current_avg?.toLocaleString()}
                                      </span>
                                      <span className="text-green-700 font-semibold">
                                        מומלץ: ₪{opp.suggested_amount?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge className="bg-green-600 text-white shrink-0">
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
                                <div className="flex items-start justify-between gap-3">
                                  <div className="text-right flex-1">
                                    <p className="font-semibold text-red-900">{risk.area}</p>
                                    <p className="text-sm text-gray-700 mt-1">{risk.description}</p>
                                  </div>
                                  <Badge className={
                                    risk.severity === 'high' || risk.severity === 'גבוה' 
                                      ? 'bg-red-600 text-white' 
                                      : 'bg-yellow-600 text-white'
                                  } dir="rtl">
                                    {translateSeverity(risk.severity)}
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
                            <ul className="space-y-2 text-right">
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

                    {/* Expense by Category Chart */}
                    {recommendations.savings_opportunities && recommendations.savings_opportunities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">התפלגות הוצאות לפי קטגוריה</h3>
                        <Card>
                          <CardContent className="p-6">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={recommendations.savings_opportunities.map(opp => ({
                                    name: translateCategory(opp.category),
                                    value: opp.current_avg
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {recommendations.savings_opportunities.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₪${value.toLocaleString()}`} />
                              </PieChart>
                            </ResponsiveContainer>
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
                <p className="text-gray-600 text-right">
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
                                <div className="flex-1 text-right">
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
                            <div className="mt-4 text-right">
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

                    {/* Forecast Line Chart */}
                    <div>
                      <h3 className="text-lg font-bold mb-3">גרף תחזית - הכנסות מול הוצאות</h3>
                      <Card>
                        <CardContent className="p-6">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={forecast.monthly_forecast}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="month" 
                                tickFormatter={(value, index) => `${value}/${forecast.monthly_forecast[index]?.year}`}
                              />
                              <YAxis tickFormatter={(value) => `₪${(value / 1000).toFixed(0)}K`} />
                              <Tooltip 
                                formatter={(value) => `₪${value.toLocaleString()}`}
                                labelFormatter={(label, payload) => {
                                  if (payload && payload[0]) {
                                    return `${payload[0].payload.month}/${payload[0].payload.year}`;
                                  }
                                  return label;
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="predicted_income" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="הכנסות צפויות"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="predicted_expenses" 
                                stroke="#f59e0b" 
                                strokeWidth={2}
                                name="הוצאות צפויות"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="predicted_balance" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                name="יתרה צפויה"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
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
                <p className="text-gray-600 text-right">
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
                          <ul className="space-y-2 text-right">
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
                                <div className="flex-1 text-right">
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

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    המטרות הפיננסיות שלי
                  </CardTitle>
                  <Button
                    onClick={() => { setEditGoal(null); setGoalFormOpen(true); }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    הוסף מטרה
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">טרם הגדרת מטרות פיננסיות</p>
                    <Button
                      onClick={() => setGoalFormOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      הוסף מטרה ראשונה
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {goals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onEdit={(g) => { setEditGoal(g); setGoalFormOpen(true); }}
                        onDelete={(id) => deleteGoal.mutate(id)}
                        onGetRecommendations={getGoalRecommendations}
                        isGenerating={isGenerating}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <GoalForm
          open={goalFormOpen}
          onClose={() => { setGoalFormOpen(false); setEditGoal(null); }}
          onSave={handleSaveGoal}
          editItem={editGoal}
        />
      </div>
    </div>
  );
}