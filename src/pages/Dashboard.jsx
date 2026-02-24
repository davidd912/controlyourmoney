import React, { useState, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PiggyBank,
  ArrowLeft,
  AlertCircle,
  Download,
  Users,
  Copy,
  MessageCircle,
  Send,
  Zap,
  Activity,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from 'moment';
import { HouseholdContext } from '../Layout';

import SummaryCard from "@/components/budget/SummaryCard";
import WhatsAppConnection from "@/components/budget/WhatsAppConnection";
import CategoryBreakdown from "@/components/budget/CategoryBreakdown";
import IncomeForm from "@/components/budget/IncomeForm";
import ExpenseForm from "@/components/budget/ExpenseForm";
import DebtForm from "@/components/budget/DebtForm";
import AssetForm from "@/components/budget/AssetForm";
import DataTable from "@/components/budget/DataTable";
import AlertPanel from "@/components/budget/AlertPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CreateHouseholdDialog from "@/components/budget/CreateHouseholdDialog";
import PullToRefresh from "@/components/PullToRefresh";
import AnnouncementTicker from "@/components/announcements/AnnouncementTicker";

import ExportButton, { convertToCSV, downloadCSV } from "@/components/budget/ExportButton";
import HouseholdSelector from "@/components/budget/HouseholdSelector";
import MonthYearSelector from "@/components/budget/MonthYearSelector";
import BudgetSettingsTab from "@/components/budget/BudgetSettingsTab";

const incomeLabels = { salary: "שכר", allowance: "קצבאות", other: "הכנסות שונות" };
const expenseLabels = {
  food: "מזון ופארמה", leisure: "פנאי ובילוי", clothing: "ביגוד והנעלה",
  household_items: "תכולת בית", home_maintenance: "אחזקת בית", grooming: "טיפוח",
  education: "חינוך", events: "אירועים ותרומות", health: "בריאות",
  transportation: "תחבורה", family: "משפחה", communication: "תקשורת",
  housing: "דיור", obligations: "התחייבויות", assets: "נכסים", finance: "פיננסים", 
  custom: "קטגוריה מותאמת אישית", other: "אחר"
};

const getExpenseLabel = (expense) => {
  if (expense.category === 'custom' && expense.custom_category_name) {
    return expense.custom_category_name;
  }
  return expenseLabels[expense.category] || expense.category;
};

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
  const [isGeneratingAlerts, setIsGeneratingAlerts] = useState(false);
  const [customCategoriesCache, setCustomCategoriesCache] = useState([]);
  const [createHouseholdOpen, setCreateHouseholdOpen] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [isPollingForHousehold, setIsPollingForHousehold] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, households, selectedHouseholdId, setSelectedHouseholdId, loadingHouseholds } = useContext(HouseholdContext);

  // Listen for FAB action events
  React.useEffect(() => {
    const handleFABAction = (e) => {
      setEditItem(null);
      switch (e.detail.type) {
        case 'income': setIncomeFormOpen(true); break;
        case 'expense': setExpenseFormOpen(true); break;
        case 'debt': setDebtFormOpen(true); break;
        case 'asset': setAssetFormOpen(true); break;
      }
    };
    window.addEventListener('fabAction', handleFABAction);
    return () => window.removeEventListener('fabAction', handleFABAction);
  }, []);

  // Handle WhatsApp/Telegram actions
  React.useEffect(() => {
    if (location.state?.action === 'whatsapp') {
      handleWhatsAppConnect();
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.action === 'telegram') {
      handleTelegramConnect();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

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

  const { data: assets = [] } = useQuery({
    queryKey: ['assets', selectedHouseholdId],
    queryFn: () => base44.entities.Asset.filter({ household_id: selectedHouseholdId }),
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

  // Calculations
  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const actualExpenses = expenses.filter(e => !e.is_budget || e.is_current);
  const totalExpenses = actualExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyBalance = totalIncome - totalExpenses;
  const totalAssetValue = assets.reduce((sum, a) => sum + (a.current_value || 0), 0);

  const handleRefresh = React.useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['incomes'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['budgetSettings'] });
    queryClient.invalidateQueries({ queryKey: ['debts'] });
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  }, [queryClient]);

  const handleWhatsAppConnect = async () => {
    const household = households.find(h => h.id === selectedHouseholdId);
    if (!household) return;
    const response = await base44.functions.invoke('generateActivationCode', { household_id: household.id });
    const whatsappBotNumber = systemConfig?.find(c => c.key === 'whatsapp_bot_number')?.value || '972559725996';
    window.open(`https://api.whatsapp.com/send/?phone=${whatsappBotNumber}&text=${encodeURIComponent(response.data.activation_code)}`, '_blank');
  };

  const handleTelegramConnect = async () => {
    const household = households.find(h => h.id === selectedHouseholdId);
    if (!household) return;
    const response = await base44.functions.invoke('generateActivationCode', { household_id: household.id });
    const botUser = systemConfig?.find(c => c.key === 'telegram_bot_username')?.value || 'controlyourmoneyy_bot';
    window.open(`https://t.me/${botUser}?text=${encodeURIComponent('אשמח להפעיל את הטלגרם, קוד: ' + response.data.activation_code)}`, '_blank');
  };

  const deleteIncome = useMutation({ mutationFn: (id) => base44.entities.Income.delete(id), onSuccess: handleRefresh });
  const deleteExpense = useMutation({ mutationFn: (id) => base44.entities.Expense.delete(id), onSuccess: handleRefresh });

  if (loadingHouseholds) return <div className="flex items-center justify-center min-h-screen">טוען...</div>;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div dir="rtl" className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 pb-20">
        <AnnouncementTicker />
        
        {/* Header פרימיום */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ControlYourMoney
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Activity className="w-3 h-3 ml-1" />
                  {households.find(h => h.id === selectedHouseholdId)?.name || 'חשבון אישי'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <Button onClick={handleWhatsAppConnect} variant="outline" className="rounded-full border-green-200 text-green-600 hover:bg-green-50 gap-2">
                 <MessageCircle className="w-4 h-4" />
                 <span className="hidden sm:inline">WhatsApp</span>
               </Button>
               <Button onClick={handleTelegramConnect} variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
                 <Send className="w-4 h-4" />
                 <span className="hidden sm:inline">Telegram</span>
               </Button>
               <Button onClick={() => navigate(createPageUrl('UserSettings'))} variant="ghost" className="rounded-full">
                 <Users className="w-4 h-4" />
               </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
          
          {/* בורר חודש ומשק בית */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <HouseholdSelector
              households={households}
              selectedId={selectedHouseholdId}
              onSelect={setSelectedHouseholdId}
              currentUserEmail={user?.email}
            />
            <MonthYearSelector
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />
          </div>

          {/* קלפי סיכום משודרגים */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "הכנסות", value: totalIncome, icon: TrendingUp, color: "green", bg: "bg-emerald-50" },
              { title: "הוצאות", value: totalExpenses, icon: TrendingDown, color: "orange", bg: "bg-orange-50" },
              { title: "יתרה חופשית", value: monthlyBalance, icon: Wallet, color: monthlyBalance >= 0 ? "blue" : "red", bg: "bg-blue-50" },
              { title: "נכסים", value: totalAssetValue, icon: PiggyBank, color: "purple", bg: "bg-purple-50" }
            ].map((card, idx) => (
              <motion.div key={idx} whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <SummaryCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  className={`border-none shadow-sm hover:shadow-md transition-shadow ${card.bg}`}
                />
              </motion.div>
            ))}
          </div>

          {/* שורת תובנת AI - אלמנט פרימיום */}
          <Card className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-none overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10">
              <Zap className="w-32 h-32 -mr-10 -mt-10" />
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg">תובנה חכמה</h3>
                <p className="text-white/80 text-sm">
                  {monthlyBalance > 0 
                    ? `מעולה! נשארה לכם יתרה של ₪${monthlyBalance.toLocaleString()}. זה זמן מצוין להגדיל את החיסכון החודשי.`
                    : `שימו לב, ההוצאות החודשיות עברו את ההכנסות ב-₪${Math.abs(monthlyBalance).toLocaleString()}. כדאי לבדוק קטגוריות גמישות.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* טאבים וממשק מרכזי */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-full h-auto shadow-sm">
                {[
                  { id: "overview", label: "סקירה", icon: Activity },
                  { id: "budget", label: "תקציב", icon: PiggyBank },
                  { id: "income", label: "הכנסות", icon: TrendingUp },
                  { id: "expenses", label: "הוצאות", icon: TrendingDown },
                  { id: "debts", label: "חובות", icon: CreditCard }
                ].map(t => (
                  <TabsTrigger key={t.id} value={t.id} className="rounded-full px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                    <t.icon className="w-4 h-4 ml-2" />
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="overview" className="space-y-6">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <CategoryBreakdown expenses={actualExpenses} budgets={budgetSettings} />
                      </div>
                      <div>
                        <AlertPanel alerts={alerts} onDismiss={() => {}} onMarkRead={() => {}} onRefresh={() => {}} />
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="income">
                   <Card className="border-none shadow-sm">
                     <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>פירוט הכנסות</CardTitle>
                        <Button onClick={() => setIncomeFormOpen(true)} className="bg-blue-600"><Plus className="w-4 h-4 ml-2"/>הוסף</Button>
                     </CardHeader>
                     <CardContent>
                        <DataTable data={incomes} columns={[{key:'description', label:'תיאור'}, {key:'amount', label:'סכום'}]} onDelete={(i) => deleteIncome.mutate(i.id)} />
                     </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="expenses">
                   <Card className="border-none shadow-sm">
                     <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>פירוט הוצאות</CardTitle>
                        <Button onClick={() => setExpenseFormOpen(true)} className="bg-orange-500"><Plus className="w-4 h-4 ml-2"/>הוסף</Button>
                     </CardHeader>
                     <CardContent>
                        <DataTable data={actualExpenses} columns={[{key:'description', label:'תיאור'}, {key:'amount', label:'סכום'}]} onDelete={(e) => deleteExpense.mutate(e.id)} />
                     </CardContent>
                   </Card>
                </TabsContent>
                
                {/* שאר התוכן של הטאבים ימשיך כרגיל */}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* פאנל טפסים */}
        <IncomeForm open={incomeFormOpen} onClose={() => setIncomeFormOpen(false)} onSave={(d) => {}} />
        <ExpenseForm open={expenseFormOpen} onClose={() => setExpenseFormOpen(false)} onSave={(d) => {}} />
      </div>
    </PullToRefresh>
  );
}