import React, { useState, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank,
  AlertCircle, Download, Users, MessageCircle, Send, Zap, Activity,
  ArrowUpRight, ArrowDownLeft, RefreshCw, Copy, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import moment from 'moment';
import { HouseholdContext } from '../Layout';

import SummaryCard from "@/components/budget/SummaryCard";
import CategoryBreakdown from "@/components/budget/CategoryBreakdown";
import IncomeForm from "@/components/budget/IncomeForm";
import ExpenseForm from "@/components/budget/ExpenseForm";
import DebtForm from "@/components/budget/DebtForm";
import AssetForm from "@/components/budget/AssetForm";
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
const debtLabels = { gmach: "גמ\"ח", friends: "חברים", bank_loan: "בנק הלוואה", family: "משפחה", other: "אחר" };

export default function Dashboard() {
  const currentDate = new Date();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [debtFormOpen, setDebtFormOpen] = useState(false);
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  // מערכת הודעות מרחפות (Toast) - חדש!
  const [toast, setToast] = useState(null);
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000); // ההודעה תיעלם אוטומטית אחרי 3 שניות
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, households, selectedHouseholdId, setSelectedHouseholdId, loadingHouseholds } = useContext(HouseholdContext);

  const incomeColumns = [
    { key: 'category', label: 'קטגוריה', render: (val) => incomeLabels[val] || val, minWidth: 120 },
    { key: 'amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}`, minWidth: 100 },
    { key: 'description', label: 'תיאור', minWidth: 150 }
  ];

  const expenseColumns = [
    { key: 'category', label: 'קטגוריה', render: (val, item) => (item.category === 'custom' ? item.custom_category_name : expenseLabels[val] || val), minWidth: 120 },
    { key: 'amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}`, minWidth: 100 },
    { key: 'description', label: 'תיאור', minWidth: 150 }
  ];

  const debtColumns = [
    { key: 'creditor_name', label: 'נושה', minWidth: 100 },
    { key: 'debt_type', label: 'סוג', render: (val) => debtLabels[val] || val, minWidth: 100 },
    { key: 'total_amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}`, minWidth: 100 },
    { key: 'is_arranged', label: 'סטטוס', render: (val) => <Badge className={val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{val ? 'בהסדר' : 'לא בהסדר'}</Badge>, minWidth: 100 }
  ];

  // Queries
  const { data: incomes = [] } = useQuery({
    queryKey: ['incomes', selectedHouseholdId, selectedMonth, selectedYear],
    queryFn: () => base44.entities.Income.filter({ household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear }),
    enabled: !!selectedHouseholdId
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', selectedHouseholdId, selectedMonth, selectedYear],
    queryFn: () => base44.entities.Expense.filter({ household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear }),
    enabled: !!selectedHouseholdId
  });

  const { data: budgetSettings = [] } = useQuery({
    queryKey: ['budgetSettings', selectedHouseholdId, selectedMonth, selectedYear],
    queryFn: () => base44.entities.Expense.filter({ household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear, is_budget: true, is_current: false }),
    enabled: !!selectedHouseholdId
  });

  const { data: debts = [] } = useQuery({
    queryKey: ['debts', selectedHouseholdId],
    queryFn: () => base44.entities.Debt.filter({ household_id: selectedHouseholdId }),
    enabled: !!selectedHouseholdId
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', selectedHouseholdId],
    queryFn: () => base44.entities.Alert.filter({ household_id: selectedHouseholdId }, '-created_date', 50),
    enabled: !!selectedHouseholdId
  });

  // לוגיקת שמירת תקציב מתוקנת עם הודעה מרחפת
  const handleSaveBudgetSettings = async (payload) => {
    const { budgets } = payload;
    const existing = await base44.entities.Expense.filter({ household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear, is_budget: true, is_current: false });
    for (const b of existing) await base44.entities.Expense.delete(b.id);

    const toCreate = Object.entries(budgets).filter(([_, v]) => parseFloat(v) > 0).map(([key, val]) => ({
      household_id: selectedHouseholdId, month: selectedMonth, year: selectedYear,
      category: key.startsWith('custom_') ? 'custom' : key,
      custom_category_name: key.startsWith('custom_') ? key.replace('custom_', '') : null,
      amount: parseFloat(val), is_budget: true, is_current: false, description: 'תקציב חודשי'
    }));

    if (toCreate.length > 0) await base44.entities.Expense.bulkCreate(toCreate);
    queryClient.invalidateQueries({ queryKey: ['budgetSettings'] });
    
    // החלפנו את ה-alert המעצבן בהודעה היוקרתית שלנו
    showToast('התקציב החודשי נשמר ומוכן לעבודה! 🎯', 'success');
  };

  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const actualExpenses = expenses.filter(e => !e.is_budget || e.is_current);
  const totalExpenses = actualExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyBalance = totalIncome - totalExpenses;

  const handleRefresh = async () => queryClient.invalidateQueries();
  const openForm = (type) => { setEditItem(null); setIsFabMenuOpen(false); if (type === 'income') setIncomeFormOpen(true); if (type === 'expense') setExpenseFormOpen(true); if (type === 'debt') setDebtFormOpen(true); };

  if (loadingHouseholds || !selectedHouseholdId) return <div className="p-10 text-center">טוען...</div>;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div dir="rtl" className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 pb-24 relative overflow-hidden">
        <AnnouncementTicker />
        
        {/* Header פרימיום */}
        <div className="bg-white/90 dark:bg-gray-900/90 border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ControlYourMoney</h1>
            <Button onClick={() => navigate('/user-settings')} variant="ghost" size="icon" className="rounded-full"><Users className="w-5 h-5" /></Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
             <HouseholdSelector households={households} selectedId={selectedHouseholdId} onSelect={setSelectedHouseholdId} />
             <MonthYearSelector month={selectedMonth} year={selectedYear} onMonthChange={setSelectedMonth} onYearChange={setSelectedYear} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard title="הכנסות" value={totalIncome} icon={TrendingUp} color="green" />
            <SummaryCard title="הוצאות" value={totalExpenses} icon={TrendingDown} color="orange" />
            <SummaryCard title="יתרה" value={monthlyBalance} icon={Wallet} color={monthlyBalance >= 0 ? "blue" : "red"} />
            <SummaryCard title="נכסים" value={0} icon={PiggyBank} color="purple" />
          </div>

          {/* AI Insight */}
          <Card className="bg-indigo-600 text-white border-none shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-300 shrink-0" />
              <p className="text-sm font-medium">{monthlyBalance >= 0 ? `נשארו לכם ₪${monthlyBalance.toLocaleString()} לניצול החודש.` : `חרגתם ב-₪${Math.abs(monthlyBalance).toLocaleString()}.`}</p>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="sticky top-16 z-30 bg-[#f8fafc]/80 dark:bg-gray-950/80 backdrop-blur-sm py-2">
              <TabsList className="w-full justify-start bg-white dark:bg-gray-900 border border-gray-100 rounded-full h-11 overflow-x-auto no-scrollbar">
                <TabsTrigger value="overview" className="rounded-full flex-1">סקירה</TabsTrigger>
                <TabsTrigger value="budget" className="rounded-full flex-1">תקציב</TabsTrigger>
                <TabsTrigger value="income" className="rounded-full flex-1">הכנסות</TabsTrigger>
                <TabsTrigger value="expenses" className="rounded-full flex-1">הוצאות</TabsTrigger>
                <TabsTrigger value="debts" className="rounded-full flex-1">חובות</TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                
                <TabsContent value="overview" className="space-y-4">
                    <CategoryBreakdown expenses={actualExpenses} budgets={budgetSettings} />
                    <AlertPanel alerts={alerts} onDismiss={() => {}} onMarkRead={() => {}} onRefresh={() => {}} />
                </TabsContent>

                <TabsContent value="budget" className="space-y-4">
                   <BudgetSettingsTab householdId={selectedHouseholdId} month={selectedMonth} year={selectedYear} existingBudgets={budgetSettings} allCustomCategories={[]} onSave={handleSaveBudgetSettings} />
                </TabsContent>

                <TabsContent value="income" className="space-y-4">
                  <div className="flex justify-between items-center"><h2 className="text-lg font-bold">הכנסות</h2><Button onClick={() => openForm('income')} className="bg-blue-600 rounded-full"><Plus className="w-4 h-4 ml-2"/>הוסף</Button></div>
                  <DataTable data={incomes} columns={incomeColumns} onDelete={(i) => base44.entities.Income.delete(i.id).then(() => { handleRefresh(); showToast('הכנסה נמחקה', 'success'); })} />
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                  <div className="flex justify-between items-center"><h2 className="text-lg font-bold">הוצאות</h2><Button onClick={() => openForm('expense')} className="bg-orange-500 rounded-full"><Plus className="w-4 h-4 ml-2"/>הוסף</Button></div>
                  <DataTable data={actualExpenses} columns={expenseColumns} onDelete={(e) => base44.entities.Expense.delete(e.id).then(() => { handleRefresh(); showToast('הוצאה נמחקה', 'success'); })} />
                </TabsContent>

                <TabsContent value="debts" className="space-y-4">
                  <div className="flex justify-between items-center"><h2 className="text-lg font-bold">חובות</h2><Button onClick={() => openForm('debt')} className="bg-red-500 rounded-full"><Plus className="w-4 h-4 ml-2"/>הוסף</Button></div>
                  <DataTable data={debts} columns={debtColumns} onDelete={(d) => base44.entities.Debt.delete(d.id).then(() => { handleRefresh(); showToast('חוב נמחק', 'success'); })} />
                </TabsContent>

              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* FAB Menu במובייל */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <AnimatePresence>
            {isFabMenuOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col gap-3 min-w-[150px]">
                <Button onClick={() => openForm('expense')} className="w-full bg-orange-500 text-white rounded-full shadow-lg gap-2 h-11"><TrendingDown className="w-4 h-4" /> הוצאה</Button>
                <Button onClick={() => openForm('income')} className="w-full bg-green-600 text-white rounded-full shadow-lg gap-2 h-11"><TrendingUp className="w-4 h-4" /> הכנסה</Button>
                <Button onClick={() => openForm('debt')} className="w-full bg-red-600 text-white rounded-full shadow-lg gap-2 h-11"><CreditCard className="w-4 h-4" /> חוב</Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button onClick={() => setIsFabMenuOpen(!isFabMenuOpen)} className={`w-14 h-14 rounded-full shadow-2xl transition-all ${isFabMenuOpen ? 'bg-gray-800 rotate-45' : 'bg-blue-600'}`}><Plus className="w-8 h-8 text-white" /></Button>
        </div>

        {/* הודעות מרחפות (Toast) */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-700 pointer-events-none whitespace-nowrap"
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="font-medium text-sm md:text-base">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* טפסים */}
        <IncomeForm open={incomeFormOpen} onClose={() => setIncomeFormOpen(false)} onSave={() => { handleRefresh(); showToast('ההכנסה נוספה בהצלחה!', 'success'); }} />
        <ExpenseForm open={expenseFormOpen} onClose={() => setExpenseFormOpen(false)} onSave={() => { handleRefresh(); showToast('ההוצאה נוספה בהצלחה!', 'success'); }} remainingBudgetByCategory={{}} customCategories={[]} />
        <DebtForm open={debtFormOpen} onClose={() => setDebtFormOpen(false)} onSave={() => { handleRefresh(); showToast('החוב עודכן בהצלחה!', 'success'); }} />
      </div>
    </PullToRefresh>
  );
}