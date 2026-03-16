import React, { useState, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, TrendingUp, TrendingDown, Wallet, PiggyBank,
  MessageCircle, Send, Zap, CheckCircle, Home, Sparkles, ArrowRight, Loader2, ArrowUpRight, ArrowDownRight, CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HouseholdContext } from '../Layout';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale'; // תוקן הנתיב
import { formatCurrency } from '@/components/LocaleContext'; // מניח שזה נשאר ב-LocaleContext הישן אם יש שם פונקציית עזר, אם לא - צריך להוציא
import '@/components/i18n';

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



const generateGroupId = () => Math.random().toString(36).substring(2, 10);
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
  const { currency, direction } = useLocale();

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
            await delay(350);
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
           // כאן השארתי עברית כברירת מחדל עד שנוסיף את זה לתרגום מורכב
           showToast(`החוב צומצם ל-${newAmount} 📉`);
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

  // פונקציית עזר לפורמט כסף (במקרה שלא הבאת אותה מ-LocaleContext)
  const formatMoney = (amount) => {
    return new Intl.NumberFormat(direction === 'rtl' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency || 'ILS',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loadingHouseholds) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!loadingHouseholds && households.length === 0) {
    return (
      <div dir={direction} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 p-6 relative overflow-hidden">
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
                <button onClick={() => setWelcomeStep('intro')} className="text-gray-400 hover:text-gray-600 text-sm mb-4 flex items-center gap-1"><ArrowRight className="w-4 h-4 rtl:rotate-180" /> {t('back')}</button>
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto"><Home className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('name_your_house')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('name_example')}</p>
                  </div>
                  <div className="space-y-4">
                    <Input autoFocus placeholder={t('name_placeholder')} className="h-14 text-center text-lg font-medium rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 bg-white/70" value={newHouseholdName} onChange={(e) => setNewHouseholdName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newHouseholdName.trim()) createHousehold.mutate(newHouseholdName.trim()); }} />
                    <Button onClick={() => createHousehold.mutate(newHouseholdName.trim())} disabled={!newHouseholdName.trim() || createHousehold.isPending} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-bold gap-2 shadow-lg">
                      {createHousehold.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('creating')}</> : <><Plus className="w-5 h-5" /> {t('create_finish')}</>}
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
      <div dir={direction} className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 relative pb-32">
        <AnnouncementTicker />

        <div className="max-w-7xl mx-auto p-2 md:p-6 space-y-4 md:space-y-6">
          {/* כותרת עליונה */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-gray-900 text-3xl md:text-4xl font-black dark:text-white tracking-tight">{t('app_title')}</h1>
                <p className="text-gray-500 mt-1 text-lg font-medium dark:text-gray-400">
                  {households.find((h) => h.id === selectedHouseholdId)?.name || t('household')}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={handleWhatsAppConnect} className="flex-1 sm:flex-none bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl shadow-md gap-2 h-11">
                  <MessageCircle className="w-5 h-5" /> <span className="hidden sm:inline">WhatsApp</span>
                </Button>
                <Button onClick={handleTelegramConnect} className="flex-1 sm:flex-none bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl shadow-md gap-2 h-11">
                  <Send className="w-5 h-5" /> <span className="hidden sm:inline">Telegram</span>
                </Button>
              </div>
            </div>
          </div>

          {/* בחירת חודש ומשק בית */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
             <div className="flex-1"><HouseholdSelector households={households} selectedId={selectedHouseholdId} onSelect={setSelectedHouseholdId} /></div>
             <div className="flex-1"><MonthYearSelector month={selectedMonth} year={selectedYear} onMonthChange={setSelectedMonth} onYearChange={setSelectedYear} /></div>
          </div>

          {/* שורת פעולות מהירות (Quick Actions) החדשה */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => {setEditItem(null);setIncomeFormOpen(true);}} className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400 rounded-2xl shadow-sm">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full"><ArrowUpRight className="w-6 h-6" /></div>
                <span className="font-bold text-sm">{t('add_income')}</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => {setEditItem(null);setExpenseFormOpen(true);}} className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 rounded-2xl shadow-sm">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full"><ArrowDownRight className="w-6 h-6" /></div>
                <span className="font-bold text-sm">{t('add_expense')}</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => {setEditItem(null);setDebtFormOpen(true);}} className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300 rounded-2xl shadow-sm">
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full"><CreditCard className="w-6 h-6" /></div>
                <span className="font-bold text-sm">{t('add_debt')}</span>
              </Button>
            </motion.div>
          </div>

          {/* כרטיסיות סיכום שמשתמשות ב-SummaryCard המשודרג */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <SummaryCard title={t('income')} amount={formatMoney(totalIncome)} type="income" index={0} />
            <SummaryCard title={t('expenses')} amount={formatMoney(totalExpenses)} type="expense" index={1} />
            <SummaryCard title={t('balance')} amount={formatMoney(monthlyBalance)} type="balance" index={2} />
          </div>

          {/* באנר היתרה (נשאר קומפקטי וברור) */}
          <Card className={`border-none shadow-md bg-gradient-to-r ${monthlyBalance >= 0 ? 'from-blue-600 to-indigo-600' : 'from-rose-500 to-red-600'} text-white rounded-2xl`}>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full"><Zap className="w-5 h-5 text-yellow-300" /></div>
                <p className="text-sm md:text-base font-bold">
                  {monthlyBalance >= 0 ? t('balance_positive', { amount: formatMoney(monthlyBalance) }) : t('balance_negative', { amount: formatMoney(Math.abs(monthlyBalance)) })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 pt-2">
            <div className="sticky top-14 md:top-16 z-30 bg-[#f8fafc]/80 dark:bg-gray-950/80 backdrop-blur-md py-2">
              <TabsList className="w-full justify-start bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full h-12 overflow-x-auto no-scrollbar px-1 shadow-sm">
                <TabsTrigger value="overview" className="rounded-full flex-1 text-sm font-medium h-9 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">{t('overview')}</TabsTrigger>
                <TabsTrigger value="budget" className="rounded-full flex-1 text-sm font-medium h-9 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">{t('budget')}</TabsTrigger>
                <TabsTrigger value="income" className="rounded-full flex-1 text-sm font-medium h-9 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">{t('income')}</TabsTrigger>
                <TabsTrigger value="expenses" className="rounded-full flex-1 text-sm font-medium h-9 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">{t('expenses')}</TabsTrigger>
                <TabsTrigger value="debts" className="rounded-full flex-1 text-sm font-medium h-9 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">{t('debts')}</TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                <TabsContent value="overview" className="space-y-4 outline-none">
                    <CategoryBreakdown expenses={expenses.filter((e) => !e.is_budget || e.is_current)} budgets={budgetSettings} />
                    <AlertPanel alerts={alerts} onDismiss={() => {}} onMarkRead={() => {}} onRefresh={() => {}} />
                </TabsContent>

                <TabsContent value="budget" className="space-y-4 outline-none">
                   <BudgetSettingsTab householdId={selectedHouseholdId} month={selectedMonth} year={selectedYear} existingBudgets={budgetSettings} allCustomCategories={[]} onSave={handleSaveBudgetSettings} />
                </TabsContent>

                <TabsContent value="income" className="space-y-4 outline-none">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('income_details')}</h2>
                    <Button onClick={() => {setEditItem(null);setIncomeFormOpen(true);}} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10 px-4 gap-2">
                      <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('add_income')}</span>
                    </Button>
                  </div>
                  <DataTable data={incomes} columns={[
                    { key: 'category', label: t('category'), render: (val) => t(`income_cat.${val}`, incomeLabels[val] || val) },
                    { key: 'description', label: t('description') },
                    { key: 'amount', label: t('amount'), render: (val) => formatMoney(val) }
                  ]} onDelete={(i) => handleDeleteItem(i, 'Income')} onEdit={(i) => {setEditItem(i);setIncomeFormOpen(true);}} />
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4 outline-none">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('expense_details')}</h2>
                    <Button onClick={() => {setEditItem(null);setExpenseFormOpen(true);}} disabled={isProcessing} className="bg-rose-600 hover:bg-rose-700 rounded-xl h-10 px-4 gap-2">
                      <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('add_expense')}</span>
                    </Button>
                  </div>
                  <DataTable data={expenses.filter((e) => !e.is_budget || e.is_current)} columns={[
                    { key: 'category', label: t('category'), render: (val, item) => item.category === 'custom' ? item.custom_category_name : t(`exp_cat.${val}`, expenseLabels[val] || val) },
                    { key: 'description', label: t('description') },
                    { key: 'amount', label: t('amount'), render: (val) => formatMoney(val) }
                  ]} onDelete={(e) => handleDeleteItem(e, 'Expense')} onEdit={(e) => {setEditItem(e);setExpenseFormOpen(true);}} />
                </TabsContent>

                <TabsContent value="debts" className="space-y-4 outline-none">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('debt_details', 'פירוט חובות')}</h2>
                    <Button onClick={() => {setEditItem(null);setDebtFormOpen(true);}} disabled={isProcessing} className="bg-slate-700 hover:bg-slate-800 rounded-xl h-10 px-4 gap-2">
                      <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('add_debt')}</span>
                    </Button>
                  </div>
                  <DataTable data={debts} columns={[
                    { key: 'creditor_name', label: t('creditor') },
                    { key: 'total_amount', label: t('amount'), render: (val) => formatMoney(val) }
                  ]} onDelete={async (d) => { try { await base44.entities.Debt.delete(d.id); showToast(t('toast_deleted')); } catch(err) {} queryClient.invalidateQueries({ queryKey: ['debts'] }); }} onEdit={(d) => {setEditItem(d);setDebtFormOpen(true);}} />
                </TabsContent>

              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        <AnimatePresence>
          {toast &&
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/95 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700/50 pointer-events-none">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
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
               showToast(t('toast_updated', 'עודכן בהצלחה! ✨'));
             } catch(e) {}
             setDebtFormOpen(false); setEditItem(null); queryClient.invalidateQueries({ queryKey: ['debts'] });
          }} editItem={editItem} />
      </div>
    </PullToRefresh>
  );
}