import React, { useState, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank,
  AlertCircle, MessageCircle, Send, Zap, CheckCircle, Settings, Edit2, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, households, selectedHouseholdId, setSelectedHouseholdId, loadingHouseholds } = useContext(HouseholdContext);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

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

  const { data: systemConfig = [] } = useQuery({
    queryKey: ['systemConfig'],
    queryFn: () => base44.entities.SystemConfig.list()
  });

  const handleSaveBudgetSettings = async (payload) => {
    try {
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
      showToast('התקציב עודכן בהצלחה!');
    } catch (e) { showToast('שגיאה בשמירת התקציב'); }
  };

  const handleWhatsAppConnect = async () => {
    const household = households.find(h => h.id === selectedHouseholdId);
    if (!household) return;
    const response = await base44.functions.invoke('generateActivationCode', { household_id: household.id });
    const botNum = systemConfig?.find(c => c.key === 'whatsapp_bot_number')?.value || '972559725996';
    window.open(`https://api.whatsapp.com/send/?phone=${botNum}&text=${encodeURIComponent(response.data.activation_code)}`, '_blank');
  };

  const handleTelegramConnect = async () => {
    const household = households.find(h => h.id === selectedHouseholdId);
    if (!household) return;
    const response = await base44.functions.invoke('generateActivationCode', { household_id: household.id });
    const botUser = systemConfig?.find(c => c.key === 'telegram_bot_username')?.value || 'controlyourmoneyy_bot';
    window.open(`https://t.me/${botUser}?text=${encodeURIComponent('קוד הפעלה: ' + response.data.activation_code)}`, '_blank');
  };

  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpenses = expenses.filter(e => !e.is_budget || e.is_current).reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyBalance = totalIncome - totalExpenses;

  const handleRefresh = async () => queryClient.invalidateQueries();

  if (loadingHouseholds || !selectedHouseholdId) return <div className="p-10 text-center font-bold">טוען נתונים...</div>;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div dir="rtl" className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 relative">
        <AnnouncementTicker />

        <div className="max-w-7xl mx-auto p-2 md:p-6 space-y-3 md:space-y-6">
          
          {/* כותרת עליונה עם כפתורים */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div className="text-right">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">ניהול תקציב משפחתי</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {households.find(h => h.id === selectedHouseholdId)?.name || 'משק בית'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleWhatsAppConnect} 
                  className="bg-green-500 hover:bg-green-600 text-white h-10 px-4 rounded-lg text-sm font-bold shadow-md flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button 
                  onClick={handleTelegramConnect} 
                  className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-lg text-sm font-bold shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Telegram
                </Button>
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
                    <CategoryBreakdown expenses={expenses.filter(e => !e.is_budget || e.is_current)} budgets={budgetSettings} />
                    <AlertPanel alerts={alerts} onDismiss={() => {}} onMarkRead={() => {}} onRefresh={() => {}} />
                </TabsContent>

                <TabsContent value="budget" className="space-y-4">
                   <BudgetSettingsTab householdId={selectedHouseholdId} month={selectedMonth} year={selectedYear} existingBudgets={budgetSettings} allCustomCategories={[]} onSave={handleSaveBudgetSettings} />
                </TabsContent>

                <TabsContent value="income" className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h2 className="text-base md:text-lg font-bold">פירוט הכנסות</h2>
                    <Button onClick={() => { setEditItem(null); setIncomeFormOpen(true); }} className="bg-green-600 rounded-lg md:rounded-xl h-9 md:h-10 px-3 md:px-4 gap-1.5 md:gap-2 text-sm md:text-base">
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">הוסף</span> הכנסה
                    </Button>
                  </div>
                  <DataTable data={incomes} columns={[
                    { key: 'category', label: 'קטגוריה', render: (val) => incomeLabels[val] || val },
                    { key: 'amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` }
                  ]} onDelete={(i) => base44.entities.Income.delete(i.id).then(handleRefresh)} onEdit={(i) => {setEditItem(i); setIncomeFormOpen(true);}} />
                </TabsContent>

                <TabsContent value="expenses" className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h2 className="text-base md:text-lg font-bold">פירוט הוצאות</h2>
                    <Button onClick={() => { setEditItem(null); setExpenseFormOpen(true); }} className="bg-orange-500 rounded-lg md:rounded-xl h-9 md:h-10 px-3 md:px-4 gap-1.5 md:gap-2 text-sm md:text-base">
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">הוסף</span> הוצאה
                    </Button>
                  </div>
                  <DataTable data={expenses.filter(e => !e.is_budget || e.is_current)} columns={[
                    { key: 'category', label: 'קטגוריה', render: (val, item) => (item.category === 'custom' ? item.custom_category_name : expenseLabels[val] || val) },
                    { key: 'amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` }
                  ]} onDelete={(e) => base44.entities.Expense.delete(e.id).then(handleRefresh)} onEdit={(e) => {setEditItem(e); setExpenseFormOpen(true);}} />
                </TabsContent>

                <TabsContent value="debts" className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h2 className="text-base md:text-lg font-bold">פירוט חובות</h2>
                    <Button onClick={() => { setEditItem(null); setDebtFormOpen(true); }} className="bg-red-500 rounded-lg md:rounded-xl h-9 md:h-10 px-3 md:px-4 gap-1.5 md:gap-2 text-sm md:text-base">
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">הוסף</span> חוב
                    </Button>
                  </div>
                  <DataTable data={debts} columns={[
                    { key: 'creditor_name', label: 'נושה' },
                    { key: 'total_amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` }
                  ]} onDelete={(d) => base44.entities.Debt.delete(d.id).then(handleRefresh)} onEdit={(d) => {setEditItem(d); setDebtFormOpen(true);}} />
                </TabsContent>

              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* הודעות Toast קטנות למעלה */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 border border-gray-700 pointer-events-none">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium whitespace-nowrap">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* טפסים */}
        <IncomeForm open={incomeFormOpen} onClose={() => setIncomeFormOpen(false)} onSave={() => handleRefresh()} editItem={editItem} />
        <ExpenseForm open={expenseFormOpen} onClose={() => setExpenseFormOpen(false)} onSave={() => handleRefresh()} editItem={editItem} remainingBudgetByCategory={{}} customCategories={[]} />
        <DebtForm open={debtFormOpen} onClose={() => setDebtFormOpen(false)} onSave={() => handleRefresh()} editItem={editItem} />
      </div>
    </PullToRefresh>
  );
}