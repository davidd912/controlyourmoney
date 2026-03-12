import React, { useState, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, TrendingUp, TrendingDown, Wallet, PiggyBank,
  MessageCircle, Send, Zap, CheckCircle, Home, Sparkles, ArrowRight, Loader2 } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HouseholdContext } from '../Layout';
import { useTranslation } from 'react-i18next';
import { useLocale, formatCurrency } from '@/components/LocaleContext';
import '@/components/i18n.js';

import SummaryCard from "@/components/budget/SummaryCard";
import CategoryBreakdown from "@/components/budget/CategoryBreakdown";
import IncomeForm from "@/components/budget/IncomeForm";
import ExpenseForm from "@/components/budget/ExpenseForm";
import DebtForm from "@/components/budget/DebtForm";
import DataTable from "@/components/budget/DataTable";
import AlertPanel from "@/components/budget/AlertPanel";
import HouseholdSelector from "@/components/budget/HouseholdSelector";
import MonthYearSelector from "@/components/budget/MonthYearSelector";
import BudgetSettingsTab from "@/components/budget/BudgetSettingsTab";
import AnnouncementTicker from "@/components/announcements/AnnouncementTicker";
import PullToRefresh from "@/components/PullToRefresh";

const incomeLabels = { salary: "שכר", allowance: "קצבאות", other: "הכנסות שונות" };
const expenseLabels = {
  food: "מזון ופארמה", leisure: "פנאי ובילוי", clothing: "ביגוד והנעלה",
  household_items: "תכולת בית", home_maintenance: "אחזקת בית", grooming: "טיפוח",
  education: "חינוך", events: "אירועים ותרומות", health: "בריאות",
  transportation: "תחבורה", family: "משפחה", communication: "תקשורת",
  housing: "דיור", obligations: "התחייבויות", assets: "נכסים", finance: "פיננסים",
  custom: "קטגוריה מותאמת אישית", other: "אחר"
};

const generateGroupId = () => Math.random().toString(36).substring(2, 10);
// הגדלנו את ההשהייה כדי להגן על השרת באופן מוחלט
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function Dashboard() {
  const currentDate = new Date();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [debtFormOpen, setDebtFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [welcomeStep, setWelcomeStep] = useState('intro');
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, households, selectedHouseholdId, setSelectedHouseholdId, loadingHouseholds } = useContext(HouseholdContext);
  const { t } = useTranslation();
  const { currency } = useLocale();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const createHousehold = useMutation({
    mutationFn: async (name) => {
      return base44.entities.Household.create({
        name, owner_email: user.email, members: [user.email],
        subscription_type: 'trial', expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
      if (data?.id) setSelectedHouseholdId(data.id);
      import('canvas-confetti').then((confetti) => confetti.default({ particleCount: 120, spread: 80, origin: { y: 0.6 } }));
      showToast(t('toast_household_created'));
    }
  });

  const { data: incomes = [] } = useQuery({ queryKey: ['incomes', selectedHouseholdId, selectedMonth, selectedYear], queryFn: () => base44.entities.Income.filter({ household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear }), enabled: !!selectedHouseholdId, refetchOnWindowFocus: false, staleTime: 60000 });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses', selectedHouseholdId, selectedMonth, selectedYear], queryFn: () => base44.entities.Expense.filter({ household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear }), enabled: !!selectedHouseholdId, refetchOnWindowFocus: false, staleTime: 60000 });
  const { data: budgetSettings = [] } = useQuery({ queryKey: ['budgetSettings', selectedHouseholdId, selectedMonth, selectedYear], queryFn: () => base44.entities.Expense.filter({ household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear, is_budget: true, is_current: false }), enabled: !!selectedHouseholdId, refetchOnWindowFocus: false, staleTime: 60000 });
  const { data: debts = [] } = useQuery({ queryKey: ['debts', selectedHouseholdId], queryFn: () => base44.entities.Debt.filter({ household_id: selectedHouseholdId }), enabled: !!selectedHouseholdId, refetchOnWindowFocus: false, staleTime: 60000 });
  const { data: alerts = [] } = useQuery({ queryKey: ['alerts', selectedHouseholdId], queryFn: () => base44.entities.Alert.filter({ household_id: selectedHouseholdId }, '-created_date', 50), enabled: !!selectedHouseholdId, refetchOnWindowFocus: false, staleTime: 60000 });
  const { data: systemConfig = [] } = useQuery({ queryKey: ['systemConfig'], queryFn: () => base44.entities.SystemConfig.list(), refetchOnWindowFocus: false, staleTime: Infinity });

  const handleRefresh = async () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    await delay(350);
    queryClient.invalidateQueries({ queryKey: ['incomes'] });
    await delay(350);
    queryClient.invalidateQueries({ queryKey: ['debts'] });
  };

  const handleDeleteItem = async (item, entityType) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const isRecurring = item.is_recurring || item.recurring_group_id;
      
      if (isRecurring) {
        showToast(t('toast_deleting_series'));
        const allItems = await base44.entities[entityType].filter({ household_id: selectedHouseholdId });
        const futureItems = allItems.filter(e => {
          const sameGroup = item.recurring_group_id && e.recurring_group_id === item.recurring_group_id;
          const sameDesc = e.description === item.description && e.category === item.category;
          const eYear = Number(e.year);
          const eMonth = Number(e.month);
          const iYear = Number(item.year);
          const iMonth = Number(item.month);
          return (sameGroup || sameDesc) && (eYear > iYear || (eYear === iYear && eMonth >= iMonth));
        });
        
        for (const fItem of futureItems) {
            await base44.entities[entityType].delete(fItem.id);
            await delay(350); // השהייה ארוכה להגנה מושלמת
        }
        showToast(t('toast_series_deleted'));
      } else {
        await base44.entities[entityType].delete(item.id);
        showToast(t('toast_deleted'));
      }
    } catch (err) { showToast(t('toast_delete_error')); }
    
    if (entityType === 'Expense') queryClient.invalidateQueries({ queryKey: ['expenses'] });
    else if (entityType === 'Income') queryClient.invalidateQueries({ queryKey: ['incomes'] });
    else if (entityType === 'Debt') queryClient.invalidateQueries({ queryKey: ['debts'] });
    
    setIsProcessing(false);
  };

  const handleSaveExpense = async (data) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const isNowRecurring = data.is_recurring;
    const wasRecurring = editItem && editItem.is_recurring;
    const groupId = (editItem && editItem.recurring_group_id) ? editItem.recurring_group_id : generateGroupId();

    try {
      if (editItem) {
        await base44.entities.Expense.update(editItem.id, { 
          ...data, household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear, recurring_group_id: isNowRecurring ? groupId : null 
        });
        
        const allExpenses = await base44.entities.Expense.filter({ household_id: selectedHouseholdId });
        const futureItems = allExpenses.filter(e => e.recurring_group_id === groupId && (Number(e.year) > selectedYear || (Number(e.year) === selectedYear && Number(e.month) > selectedMonth)));

        if (isNowRecurring && wasRecurring) {
          showToast(t('toast_updating_future'));
          for (const fItem of futureItems) {
              await base44.entities.Expense.update(fItem.id, { amount: data.amount, description: data.description, category: data.category });
              await delay(350);
          }
          showToast(t('toast_updated_all_future'));
        } else if (isNowRecurring && !wasRecurring) {
          showToast(t('toast_creating_copies'));
          const monthsLeftThisYear = 12 - selectedMonth;
          for (let i = 1; i <= monthsLeftThisYear; i++) {
            await base44.entities.Expense.create({ ...data, household_id: selectedHouseholdId, month: selectedMonth + i, year: selectedYear, recurring_group_id: groupId });
            await delay(350);
          }
          showToast(t('toast_became_recurring'));
        } else if (!isNowRecurring && wasRecurring) {
          showToast(t('toast_deleting_recurring'));
          for (const fItem of futureItems) {
              await base44.entities.Expense.delete(fItem.id);
              await delay(350);
          }
          showToast(t('toast_recurring_removed'));
        } else {
          showToast(t('toast_updated'));
        }

      } else {
        if (data.is_recurring) {
          showToast(t('toast_saving_year'));
          const monthsLeftThisYear = 12 - selectedMonth + 1;
          for (let i = 0; i < monthsLeftThisYear; i++) {
            await base44.entities.Expense.create({ ...data, household_id: selectedHouseholdId, month: selectedMonth + i, year: selectedYear, recurring_group_id: groupId });
            await delay(350);
          }
          showToast(t('toast_added_recurring'));
        } else {
          await base44.entities.Expense.create({ ...data, household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear });
          showToast(t('toast_added'));
        }
      }

      if (data.category === 'obligations') {
        const matchingDebt = debts.find(d => d.creditor_name === data.description || data.description.includes(d.creditor_name));
        if (matchingDebt) {
           let amountToReduce = Number(data.amount) || 0;
           if (!editItem && data.is_recurring) {
               const monthsLeftThisYear = 12 - selectedMonth + 1;
               amountToReduce = amountToReduce * monthsLeftThisYear;
           }
           const newAmount = Math.max(0, matchingDebt.total_amount - amountToReduce);
           await delay(350);
           await base44.entities.Debt.update(matchingDebt.id, { total_amount: newAmount });
           showToast(`החוב ל-${matchingDebt.creditor_name} צומצם ל-${formatCurrency(newAmount, currency)} 📉`);
           queryClient.invalidateQueries({ queryKey: ['debts'] }); 
        }
      }
    } catch (e) { showToast(t('toast_save_error')); }

    setExpenseFormOpen(false); setEditItem(null); setIsProcessing(false);
    queryClient.invalidateQueries({ queryKey: ['expenses'] }); 
  };

  const handleSaveIncome = async (data) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const isNowRecurring = data.is_recurring;
    const wasRecurring = editItem && editItem.is_recurring;
    const groupId = (editItem && editItem.recurring_group_id) ? editItem.recurring_group_id : generateGroupId();

    try {
      if (editItem) {
        await base44.entities.Income.update(editItem.id, { 
          ...data, household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear, recurring_group_id: isNowRecurring ? groupId : null 
        });

        const allIncomes = await base44.entities.Income.filter({ household_id: selectedHouseholdId });
        const futureItems = allIncomes.filter(i => i.recurring_group_id === groupId && (Number(i.year) > selectedYear || (Number(i.year) === selectedYear && Number(i.month) > selectedMonth)));

        if (isNowRecurring && wasRecurring) {
          showToast(t('toast_updating_future'));
          for (const fItem of futureItems) {
              await base44.entities.Income.update(fItem.id, { amount: data.amount, description: data.description, category: data.category });
              await delay(350);
          }
          showToast(t('income_recurring_updated'));
        } else if (isNowRecurring && !wasRecurring) {
          showToast(t('toast_creating_copies'));
          const monthsLeftThisYear = 12 - selectedMonth;
          for (let i = 1; i <= monthsLeftThisYear; i++) {
            await base44.entities.Income.create({ ...data, household_id: selectedHouseholdId, month: selectedMonth + i, year: selectedYear, recurring_group_id: groupId });
            await delay(350);
          }
          showToast(t('toast_became_recurring'));
        } else if (!isNowRecurring && wasRecurring) {
          showToast(t('toast_deleting_recurring'));
          for (const fItem of futureItems) {
              await base44.entities.Income.delete(fItem.id);
              await delay(350);
          }
          showToast(t('toast_recurring_removed'));
        } else {
          showToast(t('toast_updated'));
        }

      } else {
        if (data.is_recurring) {
          showToast(t('toast_saving_year'));
          const monthsLeftThisYear = 12 - selectedMonth + 1;
          for (let i = 0; i < monthsLeftThisYear; i++) {
             await base44.entities.Income.create({ ...data, household_id: selectedHouseholdId, month: selectedMonth + i, year: selectedYear, recurring_group_id: groupId });
             await delay(350);
          }
          showToast(t('toast_added_recurring_income'));
        } else {
          await base44.entities.Income.create({ ...data, household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear });
          showToast(t('toast_added'));
        }
      }
    } catch (e) { showToast(t('toast_save_error')); }

    setIncomeFormOpen(false); setEditItem(null); setIsProcessing(false);
    queryClient.invalidateQueries({ queryKey: ['incomes'] }); 
  };

  const handleSaveBudgetSettings = async (payload) => {
    try {
      const { budgets } = payload;
      const existing = await base44.entities.Expense.filter({ household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear, is_budget: true, is_current: false });
      for (const b of existing) {
          await base44.entities.Expense.delete(b.id);
          await delay(250); 
      }
      
      const toCreate = Object.entries(budgets).filter(([_, v]) => parseFloat(v) > 0).map(([key, val]) => ({
        household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear,
        category: key.startsWith('custom_') ? 'custom' : key, custom_category_name: key.startsWith('custom_') ? key.replace('custom_', '') : null,
        amount: parseFloat(val), is_budget: true, is_current: false, description: 'תקציב חודשי'
      }));
      
      for (const b of toCreate) {
        await base44.entities.Expense.create(b);
        await delay(250);
      }
      
      queryClient.invalidateQueries({ queryKey: ['budgetSettings'] });
      showToast(t('toast_budget_updated'));
    } catch (e) { showToast(t('toast_budget_error')); }
  };

  const handleWhatsAppConnect = async () => {
    const household = households.find((h) => h.id === selectedHouseholdId);
    if (!household) return;
    const response = await base44.functions.invoke('generateActivationCode', { household_id: household.id });
    const botNum = systemConfig?.find((c) => c.key === 'whatsapp_bot_number')?.value || '972559725996';
    window.open(`https://api.whatsapp.com/send/?phone=${botNum}&text=${encodeURIComponent(response.data.activation_code)}`, '_blank');
  };

  const handleTelegramConnect = async () => {
    const household = households.find((h) => h.id === selectedHouseholdId);
    if (!household) return;
    const response = await base44.functions.invoke('generateActivationCode', { household_id: household.id });
    const botUser = systemConfig?.find((c) => c.key === 'telegram_bot_username')?.value || 'controlyourmoneyy_bot';
    window.open(`https://t.me/${botUser}?text=${encodeURIComponent('קוד הפעלה: ' + response.data.activation_code)}`, '_blank');
  };

  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpenses = expenses.filter((e) => !e.is_budget || e.is_current).reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyBalance = totalIncome - totalExpenses;

  if (loadingHouseholds) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!loadingHouseholds && households.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 p-6 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="max-w-md w-full relative z-10">
          <AnimatePresence mode="wait">
            {welcomeStep === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="text-center space-y-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/30">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('welcome_title')}</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">{t('welcome_subtitle')}</p>
                </div>
                <Button onClick={() => setWelcomeStep('nameInput')} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold gap-2 shadow-lg hover:shadow-xl transition-all">
                  {t('lets_start')} <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
            {welcomeStep === 'nameInput' && (
              <motion.div key="nameInput" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/30">
                <button onClick={() => setWelcomeStep('intro')} className="text-gray-400 hover:text-gray-600 text-sm mb-4 flex items-center gap-1"><ArrowRight className="w-4 h-4" /> {t('back')}</button>
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto"><Home className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('name_your_house')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('name_example')}</p>
                  </div>
                  <div className="space-y-4">
                    <Input autoFocus placeholder={t('name_placeholder')} className="h-14 text-center text-lg font-medium rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 bg-white/70" value={newHouseholdName} onChange={(e) => setNewHouseholdName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newHouseholdName.trim()) createHousehold.mutate(newHouseholdName.trim()); }} />
                    <Button onClick={() => createHousehold.mutate(newHouseholdName.trim())} disabled={!newHouseholdName.trim() || createHousehold.isPending} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-bold gap-2 shadow-lg">
                      {createHousehold.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> מקים משק בית...</> : <><Plus className="w-5 h-5" /> יצירה וסיום</>}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div dir="rtl" className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 relative pb-32">
        <AnnouncementTicker />

        <div className="max-w-7xl mx-auto p-2 md:p-6 space-y-3 md:space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div className="text-right">
                <h1 className="text-gray-900 text-4xl font-black dark:text-white">ניהול תקציב משפחתי</h1>
                <p className="text-gray-950 mt-1 text-2xl dark:text-gray-400">{households.find((h) => h.id === selectedHouseholdId)?.name || 'משק בית'}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleWhatsAppConnect} className="bg-green-500 hover:bg-green-600 text-white h-10 px-4 rounded-lg text-sm font-bold shadow-md flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp</Button>
                <Button onClick={handleTelegramConnect} className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-lg text-sm font-bold shadow-md flex items-center gap-2"><Send className="w-4 h-4" /> Telegram</Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 bg-white dark:bg-gray-900 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
             <HouseholdSelector households={households} selectedId={selectedHouseholdId} onSelect={setSelectedHouseholdId} />
             <MonthYearSelector month={selectedMonth} year={selectedYear} onMonthChange={setSelectedMonth} onYearChange={setSelectedYear} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <SummaryCard title="הכנסות" value={totalIncome} icon={TrendingUp} color="green" />
            <SummaryCard title="הוצאות" value={totalExpenses} icon={TrendingDown} color="orange" />
            <SummaryCard title="יתרה" value={monthlyBalance} icon={Wallet} color={monthlyBalance >= 0 ? "blue" : "red"} />
            <SummaryCard title="נכסים" value={0} icon={PiggyBank} color="purple" />
          </div>

          <Card className="bg-indigo-600 text-white border-none shadow-md">
            <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 shrink-0" />
              <p className="text-xs md:text-sm font-medium">{monthlyBalance >= 0 ? `נשארו לכם ₪${(monthlyBalance || 0).toLocaleString()} לניצול החודש.` : `חרגתם ב-₪${Math.abs(monthlyBalance || 0).toLocaleString()}.`}</p>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 md:space-y-4">
            <div className="sticky top-14 md:top-16 z-30 bg-[#f8fafc]/80 dark:bg-gray-950/80 backdrop-blur-sm py-1.5 md:py-2">
              <TabsList className="w-full justify-start bg-white dark:bg-gray-900 border border-gray-100 rounded-full h-9 md:h-11 overflow-x-auto no-scrollbar px-1">
                <TabsTrigger value="overview" className="rounded-full flex-1 text-xs md:text-sm px-2 md:px-3">סקירה</TabsTrigger>
                <TabsTrigger value="budget" className="rounded-full flex-1 text-xs md:text-sm px-2 md:px-3">תקציב</TabsTrigger>
                <TabsTrigger value="income" className="rounded-full flex-1 text-xs md:text-sm px-2 md:px-3">הכנסות</TabsTrigger>
                <TabsTrigger value="expenses" className="rounded-full flex-1 text-xs md:text-sm px-2 md:px-3">הוצאות</TabsTrigger>
                <TabsTrigger value="debts" className="rounded-full flex-1 text-xs md:text-sm px-2 md:px-3">חובות</TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                
                <TabsContent value="overview" className="space-y-4">
                    <CategoryBreakdown expenses={expenses.filter((e) => !e.is_budget || e.is_current)} budgets={budgetSettings} />
                    <AlertPanel alerts={alerts} onDismiss={() => {}} onMarkRead={() => {}} onRefresh={() => {}} />
                </TabsContent>

                <TabsContent value="budget" className="space-y-4">
                   <BudgetSettingsTab householdId={selectedHouseholdId} month={selectedMonth} year={selectedYear} existingBudgets={budgetSettings} allCustomCategories={[]} onSave={handleSaveBudgetSettings} />
                </TabsContent>

                <TabsContent value="income" className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h2 className="text-base md:text-lg font-bold">פירוט הכנסות</h2>
                    <Button onClick={() => {setEditItem(null);setIncomeFormOpen(true);}} disabled={isProcessing} className="bg-green-600 rounded-lg md:rounded-xl h-9 md:h-10 px-3 md:px-4 gap-1.5 md:gap-2 text-sm md:text-base">
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">הוסף</span> הכנסה
                    </Button>
                  </div>
                  <DataTable data={incomes} columns={[
                    { key: 'category', label: 'קטגוריה', render: (val) => incomeLabels[val] || val },
                    { key: 'description', label: 'תיאור' },
                    { key: 'amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` }
                  ]} onDelete={(i) => handleDeleteItem(i, 'Income')} onEdit={(i) => {setEditItem(i);setIncomeFormOpen(true);}} />
                </TabsContent>

                <TabsContent value="expenses" className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h2 className="text-base md:text-lg font-bold">פירוט הוצאות</h2>
                    <Button onClick={() => {setEditItem(null);setExpenseFormOpen(true);}} disabled={isProcessing} className="bg-orange-500 rounded-lg md:rounded-xl h-9 md:h-10 px-3 md:px-4 gap-1.5 md:gap-2 text-sm md:text-base">
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">הוסף</span> הוצאה
                    </Button>
                  </div>
                  <DataTable data={expenses.filter((e) => !e.is_budget || e.is_current)} columns={[
                    { key: 'category', label: 'קטגוריה', render: (val, item) => item.category === 'custom' ? item.custom_category_name : expenseLabels[val] || val },
                    { key: 'description', label: 'תיאור' },
                    { key: 'amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` }
                  ]} onDelete={(e) => handleDeleteItem(e, 'Expense')} onEdit={(e) => {setEditItem(e);setExpenseFormOpen(true);}} />
                </TabsContent>

                <TabsContent value="debts" className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h2 className="text-base md:text-lg font-bold">פירוט חובות</h2>
                    <Button onClick={() => {setEditItem(null);setDebtFormOpen(true);}} disabled={isProcessing} className="bg-red-500 rounded-lg md:rounded-xl h-9 md:h-10 px-3 md:px-4 gap-1.5 md:gap-2 text-sm md:text-base">
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">חוב</span> הוסף
                    </Button>
                  </div>
                  <DataTable data={debts} columns={[
                    { key: 'creditor_name', label: 'נושה' },
                    { key: 'total_amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` }
                  ]} onDelete={async (d) => { try { await base44.entities.Debt.delete(d.id); showToast('נמחק בהצלחה! 🗑️'); } catch(err) {} queryClient.invalidateQueries({ queryKey: ['debts'] }); }} onEdit={(d) => {setEditItem(d);setDebtFormOpen(true);}} />
                </TabsContent>

              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        <AnimatePresence>
          {toast &&
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 border border-gray-700 pointer-events-none">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium whitespace-nowrap">{toast}</span>
            </motion.div>
          }
        </AnimatePresence>

        <IncomeForm open={incomeFormOpen} onClose={() => { setIncomeFormOpen(false); setEditItem(null); }} onSave={handleSaveIncome} editItem={editItem} />
        <ExpenseForm open={expenseFormOpen} onClose={() => { setExpenseFormOpen(false); setEditItem(null); }} onSave={handleSaveExpense} editItem={editItem} remainingBudgetByCategory={{}} customCategories={[]} />
        <DebtForm open={debtFormOpen} onClose={() => { setDebtFormOpen(false); setEditItem(null); }} onSave={async (data) => {
             try {
               if (editItem) await base44.entities.Debt.update(editItem.id, { ...data, household_id: selectedHouseholdId });
               else await base44.entities.Debt.create({ ...data, household_id: selectedHouseholdId });
               showToast('עודכן בהצלחה! ✨');
             } catch(e) {}
             setDebtFormOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ['debts'] });
          }} editItem={editItem} />
      </div>
    </PullToRefresh>
  );
}