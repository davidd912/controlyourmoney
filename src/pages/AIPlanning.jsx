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
  Brain, TrendingUp, Calculator, Lightbulb, Calendar,
  DollarSign, AlertTriangle, Sparkles, ArrowUpRight, ArrowDownRight, Target, Plus
} from "lucide-react";
import { motion } from "framer-motion";
import moment from 'moment';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GoalForm from "@/components/planning/GoalForm";
import GoalCard from "@/components/planning/GoalCard";
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/components/LocaleContext';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function AIPlanning() {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const isRTL = lang === 'he';

  const [activeTab, setActiveTab] = useState("recommendations");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [whatIfResults, setWhatIfResults] = useState(null);
  const [incomeChange, setIncomeChange] = useState('');
  const [expenseChange, setExpenseChange] = useState('');
  const [changeCategory, setChangeCategory] = useState('');
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });

  const { data: households = [] } = useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Household.list();
      return all.filter(h => h.owner_email === user.email || (h.members && h.members.includes(user.email)));
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

  const createGoal = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['goals']); setGoalFormOpen(false); setEditGoal(null); }
  });

  const updateGoal = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['goals']); setGoalFormOpen(false); setEditGoal(null); }
  });

  const deleteGoal = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['goals'])
  });

  const handleSaveGoal = (data) => {
    const goalData = { ...data, household_id: selectedHouseholdId };
    if (editGoal) updateGoal.mutate({ id: editGoal.id, data: goalData });
    else createGoal.mutate(goalData);
  };

  const getGoalRecommendations = async (goal) => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const remaining = goal.target_amount - goal.current_amount;
      const daysUntilTarget = goal.target_date ? moment(goal.target_date).diff(moment(), 'days') : null;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentMonthIncomes = allIncomes.filter(i => i.month === currentMonth && i.year === currentYear);
      const currentMonthExpenses = allExpenses.filter(e => e.month === currentMonth && e.year === currentYear);
      const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);
      const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const monthlyBalance = totalIncome - totalExpenses;

      const prompt = isRTL
        ? `אתה יועץ פיננסי מומחה. עזור למשתמש להשיג את המטרה הפיננסית שלו.
מטרה: ${goal.title}, יעד: ₪${goal.target_amount.toLocaleString()}, נוכחי: ₪${goal.current_amount.toLocaleString()}, נותר: ₪${remaining.toLocaleString()}
תאריך יעד: ${goal.target_date || 'לא הוגדר'}, ימים עד היעד: ${daysUntilTarget || 'לא רלוונטי'}
הכנסות חודשיות: ₪${totalIncome.toLocaleString()}, הוצאות: ₪${totalExpenses.toLocaleString()}, יתרה: ₪${monthlyBalance.toLocaleString()}
ספק המלצות מפורטות בעברית - כמה לחסוך, מה לצמצם, האם היעד ריאלי, טיפים להשגת המטרה. עד 500 מילים.`
        : `You are an expert financial advisor. Help the user achieve their financial goal.
Goal: ${goal.title}, Target: $${goal.target_amount.toLocaleString()}, Current: $${goal.current_amount.toLocaleString()}, Remaining: $${remaining.toLocaleString()}
Target date: ${goal.target_date || 'not set'}, Days until target: ${daysUntilTarget || 'not relevant'}
Monthly income: $${totalIncome.toLocaleString()}, Expenses: $${totalExpenses.toLocaleString()}, Balance: $${monthlyBalance.toLocaleString()}
Provide detailed recommendations in English - how much to save monthly, what to cut, is the target realistic, tips to achieve the goal. Up to 500 words.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { recommendations: { type: "string" } } }
      });
      await updateGoal.mutateAsync({ id: goal.id, data: { ...goal, ai_recommendations: result.recommendations } });
    } catch (error) {
      console.error('Error generating goal recommendations:', error);
      alert(t('ai_error_goal_recs'));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedHouseholdId || isGenerating) return;
    setIsGenerating(true);
    try {
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

      const prompt = isRTL
        ? `אתה יועץ פיננסי מומחה. נתח את דפוסי ההוצאה וההכנסה ההיסטוריים והמלץ על שיפורים.
נתונים היסטוריים: ${JSON.stringify(monthlyData, null, 2)}
תייצר המלצות מפורטות שכוללות: זיהוי דפוסים, הזדמנויות לחסכון, המלצות לכל קטגוריה, איזון תקציבי, דירוג סיכונים, הצעות להגדלת הכנסות.
החזר JSON בעברית:`
        : `You are an expert financial advisor. Analyze historical spending and income patterns and recommend improvements.
Historical data: ${JSON.stringify(monthlyData, null, 2)}
Generate detailed recommendations including: pattern identification, savings opportunities, per-category recommendations, budget balance tips, risk areas, income increase suggestions.
Return JSON in English:`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            patterns: { type: "array", items: { type: "object", properties: { category: { type: "string" }, trend: { type: "string" }, description: { type: "string" } } } },
            savings_opportunities: { type: "array", items: { type: "object", properties: { category: { type: "string" }, current_avg: { type: "number" }, suggested_amount: { type: "number" }, potential_savings: { type: "number" }, explanation: { type: "string" } } } },
            category_recommendations: { type: "array", items: { type: "object", properties: { category: { type: "string" }, recommendation: { type: "string" }, priority: { type: "string" } } } },
            budget_balance_tips: { type: "array", items: { type: "string" } },
            risk_areas: { type: "array", items: { type: "object", properties: { area: { type: "string" }, severity: { type: "string" }, description: { type: "string" } } } },
            income_suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });
      setRecommendations(result);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert(t('ai_error_recs'));
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

      const prompt = isRTL
        ? `אתה אנליסט פיננסי. על סמך הנתונים ההיסטוריים, תחזה הכנסות והוצאות ל-12 החודשים הקרובים.
הכנסות: ${JSON.stringify(allIncomes.slice(0, 50), null, 2)}
הוצאות: ${JSON.stringify(allExpenses.slice(0, 50), null, 2)}
החזר תחזית חודשית ל-12 חודשים קדימה החל מ-${currentMonth}/${currentYear}. התחשב במגמות, עונתיות ושינויים היסטוריים.
החזר JSON בפורמט:`
        : `You are a financial analyst. Based on the historical data, forecast income and expenses for the next 12 months.
Income: ${JSON.stringify(allIncomes.slice(0, 50), null, 2)}
Expenses: ${JSON.stringify(allExpenses.slice(0, 50), null, 2)}
Return a monthly forecast for 12 months starting from ${currentMonth}/${currentYear}. Consider trends, seasonality, and historical patterns.
Return JSON in format:`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            monthly_forecast: { type: "array", items: { type: "object", properties: { month: { type: "number" }, year: { type: "number" }, predicted_income: { type: "number" }, predicted_expenses: { type: "number" }, predicted_balance: { type: "number" }, confidence: { type: "string" }, notes: { type: "string" } } } },
            yearly_summary: { type: "object", properties: { total_income: { type: "number" }, total_expenses: { type: "number" }, total_balance: { type: "number" }, key_insights: { type: "array", items: { type: "string" } } } }
          }
        }
      });
      setForecast(result);
    } catch (error) {
      console.error('Error generating forecast:', error);
      alert(t('ai_error_forecast'));
    } finally {
      setIsGenerating(false);
    }
  };

  const runWhatIfScenario = async () => {
    if (!selectedHouseholdId || isGenerating) return;
    if (!incomeChange && !expenseChange) { alert(t('ai_error_input')); return; }
    setIsGenerating(true);
    try {
      const d = new Date();
      const currentMonthIncomes = allIncomes.filter(i => i.month === d.getMonth() + 1 && i.year === d.getFullYear());
      const currentMonthExpenses = allExpenses.filter(e => e.month === d.getMonth() + 1 && e.year === d.getFullYear());
      const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);
      const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const currency = isRTL ? '₪' : '$';

      const prompt = isRTL
        ? `נתח תרחיש "מה אם" פיננסי.
מצב נוכחי: הכנסות: ${currency}${totalIncome}, הוצאות: ${currency}${totalExpenses}, יתרה: ${currency}${totalIncome - totalExpenses}
שינויים מוצעים: שינוי בהכנסות: ${currency}${parseFloat(incomeChange) || 0}, שינוי בהוצאות: ${currency}${parseFloat(expenseChange) || 0}, קטגוריה: ${changeCategory || 'כללי'}
נתח את ההשפעה על: יתרה חודשית ושנתית, יכולת חסכון, רמת סיכון, המלצות לניהול השינוי, השפעה ארוכת טווח.
החזר JSON מפורט בעברית:`
        : `Analyze a financial "what if" scenario.
Current state: Income: ${currency}${totalIncome}, Expenses: ${currency}${totalExpenses}, Balance: ${currency}${totalIncome - totalExpenses}
Proposed changes: Income change: ${currency}${parseFloat(incomeChange) || 0}, Expense change: ${currency}${parseFloat(expenseChange) || 0}, Category: ${changeCategory || 'General'}
Analyze the impact on: monthly/yearly balance, savings capacity, risk level, management recommendations, long-term effects.
Return detailed JSON in English:`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            projected_state: { type: "object", properties: { new_income: { type: "number" }, new_expenses: { type: "number" }, new_balance: { type: "number" }, monthly_change: { type: "number" }, yearly_change: { type: "number" } } },
            impact_analysis: { type: "object", properties: { savings_impact: { type: "string" }, risk_level: { type: "string" }, sustainability: { type: "string" } } },
            recommendations: { type: "array", items: { type: "string" } },
            long_term_effects: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "object", properties: { action: { type: "string" }, priority: { type: "string" }, timeline: { type: "string" } } } }
          }
        }
      });
      setWhatIfResults(result);
    } catch (error) {
      console.error('Error running what-if scenario:', error);
      alert(t('ai_error_whatif'));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedHouseholdId) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 min-h-[60vh]">
        <Card className="max-w-md w-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader><CardTitle className="text-center dark:text-white">{t('ai_household_required')}</CardTitle></CardHeader>
          <CardContent><p className="text-center text-gray-600 dark:text-gray-400">{t('ai_household_required_msg')}</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-8">
        {/* Security Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{t('ai_data_secure')}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">{t('ai_data_secure_desc')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('ai_title')}</h1>
              <p className="text-gray-500 dark:text-gray-400">{t('ai_subtitle')}</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm p-1.5 rounded-xl overflow-x-auto">
            <TabsList className="inline-flex min-w-full sm:min-w-0 gap-1 bg-transparent p-0">
              <TabsTrigger value="recommendations" className="rounded-lg whitespace-nowrap text-xs sm:text-sm">
                <Lightbulb className="w-4 h-4 me-1 sm:me-2" />
                <span className="hidden sm:inline">{t('ai_tab_recommendations')}</span>
                <span className="sm:hidden">{t('ai_tab_recommendations_short')}</span>
              </TabsTrigger>
              <TabsTrigger value="forecast" className="rounded-lg whitespace-nowrap text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 me-1 sm:me-2" />
                <span className="hidden sm:inline">{t('ai_tab_forecast')}</span>
                <span className="sm:hidden">{t('ai_tab_forecast_short')}</span>
              </TabsTrigger>
              <TabsTrigger value="whatif" className="rounded-lg whitespace-nowrap text-xs sm:text-sm">
                <Calculator className="w-4 h-4 me-1 sm:me-2" />
                <span className="hidden sm:inline">{t('ai_tab_whatif')}</span>
                <span className="sm:hidden">{t('ai_tab_whatif_short')}</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="rounded-lg whitespace-nowrap text-xs sm:text-sm">
                <Target className="w-4 h-4 me-1 sm:me-2" />
                <span className="hidden sm:inline">{t('ai_tab_goals')}</span>
                <span className="sm:hidden">{t('ai_tab_goals_short')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  {t('ai_rec_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">{t('ai_rec_desc')}</p>
                <Button onClick={generateRecommendations} disabled={isGenerating || allExpenses.length === 0} className="bg-purple-600 hover:bg-purple-700">
                  {isGenerating ? t('ai_rec_generating') : t('ai_rec_btn')}
                </Button>

                {recommendations && (
                  <div className="space-y-6 mt-6">
                    {recommendations.patterns && recommendations.patterns.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 dark:text-white">{t('ai_patterns_title')}</h3>
                        <div className="grid gap-3">
                          {recommendations.patterns.map((pattern, idx) => (
                            <Card key={idx} className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-blue-900 dark:text-blue-100">{pattern.category}</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">{pattern.trend}</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{pattern.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {recommendations.savings_opportunities && recommendations.savings_opportunities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 dark:text-white">{t('ai_savings_title')}</h3>
                        <div className="grid gap-3">
                          {recommendations.savings_opportunities.map((opp, idx) => (
                            <Card key={idx} className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="font-semibold text-green-900 dark:text-green-100">{opp.category}</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{opp.explanation}</p>
                                    <div className="flex gap-4 mt-2 text-sm flex-wrap">
                                      <span className="text-gray-600 dark:text-gray-400">{t('ai_savings_current_avg')}: {opp.current_avg?.toLocaleString()}</span>
                                      <span className="text-green-700 dark:text-green-300 font-semibold">{t('ai_savings_suggested')}: {opp.suggested_amount?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <Badge className="bg-green-600 dark:bg-green-700 text-white shrink-0">
                                    {t('ai_savings_badge')}: {opp.potential_savings?.toLocaleString()}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {recommendations.risk_areas && recommendations.risk_areas.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 dark:text-white">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          {t('ai_risk_areas_title')}
                        </h3>
                        <div className="grid gap-3">
                          {recommendations.risk_areas.map((risk, idx) => (
                            <Card key={idx} className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="font-semibold text-red-900 dark:text-red-100">{risk.area}</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{risk.description}</p>
                                  </div>
                                  <Badge className={risk.severity === 'high' || risk.severity === 'גבוה' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}>
                                    {risk.severity}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {recommendations.budget_balance_tips && recommendations.budget_balance_tips.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 dark:text-white">{t('ai_budget_tips_title')}</h3>
                        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                          <CardContent className="p-4">
                            <ul className="space-y-2">
                              {recommendations.budget_balance_tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                                  <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {recommendations.savings_opportunities && recommendations.savings_opportunities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 dark:text-white">{t('ai_expense_dist_title')}</h3>
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                          <CardContent className="p-6">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie data={recommendations.savings_opportunities.map(opp => ({ name: opp.category, value: opp.current_avg }))} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                                  {recommendations.savings_opportunities.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => value.toLocaleString()} />
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
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {t('ai_forecast_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">{t('ai_forecast_desc')}</p>
                <Button onClick={generateForecast} disabled={isGenerating || allExpenses.length === 0} className="bg-blue-600 hover:bg-blue-700">
                  {isGenerating ? t('ai_forecast_generating') : t('ai_forecast_btn')}
                </Button>

                {forecast && forecast.monthly_forecast && (
                  <div className="space-y-6 mt-6">
                    <div className="grid gap-3">
                      {forecast.monthly_forecast.map((month, idx) => {
                        const isPositive = month.predicted_balance >= 0;
                        return (
                          <Card key={idx} className="bg-white dark:bg-gray-800 dark:border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 dark:text-white">{month.month}/{month.year}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{month.notes}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">{t('ai_income_label')}</span>
                                      <p className="font-semibold text-green-700 dark:text-green-400">{month.predicted_income?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">{t('ai_expenses_label')}</span>
                                      <p className="font-semibold text-orange-700 dark:text-orange-400">{month.predicted_expenses?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">{t('ai_balance_label')}</span>
                                      <p className={`font-semibold ${isPositive ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>{month.predicted_balance?.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isPositive ? <ArrowUpRight className="w-5 h-5 text-green-600" /> : <ArrowDownRight className="w-5 h-5 text-red-600" />}
                                  <Badge variant="outline">{month.confidence}</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {forecast.yearly_summary && (
                      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
                        <CardHeader><CardTitle className="dark:text-white">{t('ai_yearly_summary')}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_total_income')}</span>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{forecast.yearly_summary.total_income?.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_total_expenses')}</span>
                              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{forecast.yearly_summary.total_expenses?.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_yearly_balance')}</span>
                              <p className={`text-2xl font-bold ${forecast.yearly_summary.total_balance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>{forecast.yearly_summary.total_balance?.toLocaleString()}</p>
                            </div>
                          </div>
                          {forecast.yearly_summary.key_insights && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2 dark:text-white">{t('ai_key_insights')}</h4>
                              <ul className="space-y-2">
                                {forecast.yearly_summary.key_insights.map((insight, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                                    <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div>
                      <h3 className="text-lg font-bold mb-3 dark:text-white">{t('ai_forecast_chart_title')}</h3>
                      <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardContent className="p-6">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={forecast.monthly_forecast}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" tickFormatter={(value, index) => `${value}/${forecast.monthly_forecast[index]?.year}`} />
                              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                              <Tooltip formatter={(value) => value.toLocaleString()} labelFormatter={(label, payload) => { if (payload && payload[0]) return `${payload[0].payload.month}/${payload[0].payload.year}`; return label; }} />
                              <Legend />
                              <Line type="monotone" dataKey="predicted_income" stroke="#10b981" strokeWidth={2} name={t('ai_forecast_line_income')} />
                              <Line type="monotone" dataKey="predicted_expenses" stroke="#f59e0b" strokeWidth={2} name={t('ai_forecast_line_expenses')} />
                              <Line type="monotone" dataKey="predicted_balance" stroke="#3b82f6" strokeWidth={2} name={t('ai_forecast_line_balance')} />
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
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Calculator className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  {t('ai_whatif_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">{t('ai_whatif_desc')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income-change" className="dark:text-gray-200">{t('ai_income_change_label')}</Label>
                    <Input id="income-change" type="number" value={incomeChange} onChange={(e) => setIncomeChange(e.target.value)} placeholder={t('ai_income_change_placeholder')} className="text-left" dir="ltr" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('ai_income_direction_hint')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-change" className="dark:text-gray-200">{t('ai_expense_change_label')}</Label>
                    <Input id="expense-change" type="number" value={expenseChange} onChange={(e) => setExpenseChange(e.target.value)} placeholder={t('ai_expense_change_placeholder')} className="text-left" dir="ltr" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('ai_income_direction_hint')}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="category" className="dark:text-gray-200">{t('ai_category_label')}</Label>
                    <Input id="category" value={changeCategory} onChange={(e) => setChangeCategory(e.target.value)} placeholder={t('ai_category_placeholder')} />
                  </div>
                </div>

                <Button onClick={runWhatIfScenario} disabled={isGenerating || (!incomeChange && !expenseChange)} className="bg-orange-600 hover:bg-orange-700 w-full">
                  {isGenerating ? t('ai_analyze_generating') : t('ai_analyze_btn')}
                </Button>

                {whatIfResults && (
                  <div className="space-y-6 mt-6">
                    {whatIfResults.projected_state && (
                      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800">
                        <CardHeader><CardTitle className="text-lg dark:text-white">{t('ai_projected_state_title')}</CardTitle></CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div><span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_new_income')}</span><p className="text-xl font-bold text-green-700 dark:text-green-400">{whatIfResults.projected_state.new_income?.toLocaleString()}</p></div>
                            <div><span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_new_expenses')}</span><p className="text-xl font-bold text-orange-700 dark:text-orange-400">{whatIfResults.projected_state.new_expenses?.toLocaleString()}</p></div>
                            <div><span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_new_balance')}</span><p className={`text-xl font-bold ${whatIfResults.projected_state.new_balance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>{whatIfResults.projected_state.new_balance?.toLocaleString()}</p></div>
                            <div><span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_monthly_change')}</span><p className={`text-xl font-bold ${whatIfResults.projected_state.monthly_change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{whatIfResults.projected_state.monthly_change?.toLocaleString()}</p></div>
                            <div><span className="text-sm text-gray-600 dark:text-gray-400">{t('ai_yearly_change')}</span><p className={`text-xl font-bold ${whatIfResults.projected_state.yearly_change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{whatIfResults.projected_state.yearly_change?.toLocaleString()}</p></div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {whatIfResults.impact_analysis && (
                      <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader><CardTitle className="text-lg dark:text-white">{t('ai_impact_title')}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-300">{t('ai_savings_impact')}</span>
                            <span className="font-semibold dark:text-white">{whatIfResults.impact_analysis.savings_impact}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-300">{t('ai_risk_level')}</span>
                            <Badge className={whatIfResults.impact_analysis.risk_level?.match(/high|גבוה/i) ? 'bg-red-600' : whatIfResults.impact_analysis.risk_level?.match(/medium|בינוני/i) ? 'bg-yellow-600' : 'bg-green-600'}>
                              {whatIfResults.impact_analysis.risk_level}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-300">{t('ai_sustainability')}</span>
                            <span className="font-semibold dark:text-white">{whatIfResults.impact_analysis.sustainability}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {whatIfResults.recommendations && whatIfResults.recommendations.length > 0 && (
                      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <CardHeader><CardTitle className="text-lg dark:text-white">{t('ai_whatif_recs_title')}</CardTitle></CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {whatIfResults.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {whatIfResults.action_items && whatIfResults.action_items.length > 0 && (
                      <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader><CardTitle className="text-lg dark:text-white">{t('ai_action_items_title')}</CardTitle></CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {whatIfResults.action_items.map((item, idx) => (
                              <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 dark:text-white">{item.action}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('ai_execution_time', { time: item.timeline })}</p>
                                </div>
                                <Badge className={item.priority?.match(/high|גבוה/i) ? 'bg-red-600' : item.priority?.match(/medium|בינוני/i) ? 'bg-yellow-600' : 'bg-green-600'}>
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
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    {t('ai_goals_title')}
                  </CardTitle>
                  <Button onClick={() => { setEditGoal(null); setGoalFormOpen(true); }} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 me-2" />
                    {t('ai_add_goal')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{t('ai_no_goals')}</p>
                    <Button onClick={() => setGoalFormOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 me-2" />
                      {t('ai_add_first_goal')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {goals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} onEdit={(g) => { setEditGoal(g); setGoalFormOpen(true); }} onDelete={(id) => deleteGoal.mutate(id)} onGetRecommendations={getGoalRecommendations} isGenerating={isGenerating} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <GoalForm open={goalFormOpen} onClose={() => { setGoalFormOpen(false); setEditGoal(null); }} onSave={handleSaveGoal} editItem={editGoal} />
      </div>
    </div>
  );
}