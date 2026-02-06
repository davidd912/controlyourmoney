import React, { useState } from 'react';
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
  Copy
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from 'moment';

import SummaryCard from "@/components/budget/SummaryCard";
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
const assetLabels = {
  savings1: "חיסכון 1", savings2: "חיסכון 2", residential_property: "נדל\"ן למגורים",
  investment_property: "נדל\"ן להשקעה", vehicle: "רכב", pension: "פנסיה",
  education_fund: "קרן השתלמות", other: "אחר"
};
const debtLabels = {
  gmach: "גמ\"ח", friends: "חברים", bank_loan: "בנק הלוואה", property_tax: "ארנונה",
  vat: "מע\"מ", mortgage_arrears: "פיגורי משכנתה", credit_card: "כרטיס אשראי",
  salary_loan: "הלוואת משכורת", black_market: "שוק אפור", arrears: "פיגורים",
  family: "משפחה", bank_overdraft: "משיכת יתר", execution: "הוצאה לפועל",
  institution: "מוסד/חברה", alimony: "מזונות", national_insurance: "ביטוח לאומי",
  income_tax: "מס הכנסה", other: "אחר"
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

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: households = [], isLoading: loadingHouseholds } = useQuery({
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

  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);

  // Auto-select first household
  React.useEffect(() => {
    if (user && households.length > 0 && !selectedHouseholdId) {
      setSelectedHouseholdId(households[0].id);
    }
  }, [user, households, selectedHouseholdId]);

  // Auto-open create household dialog if user has no households
  React.useEffect(() => {
    if (user && !loadingHouseholds && households.length === 0) {
      setCreateHouseholdOpen(true);
    }
  }, [user, households, loadingHouseholds]);

  // Listen for FAB action events
  React.useEffect(() => {
    const handleFABAction = (e) => {
      setEditItem(null);
      switch (e.detail.type) {
        case 'income':
          setIncomeFormOpen(true);
          break;
        case 'expense':
          setExpenseFormOpen(true);
          break;
        case 'debt':
          setDebtFormOpen(true);
          break;
        case 'asset':
          setAssetFormOpen(true);
          break;
      }
    };
    window.addEventListener('fabAction', handleFABAction);
    return () => window.removeEventListener('fabAction', handleFABAction);
  }, []);

  // Handle navigation state for opening forms from other pages
  React.useEffect(() => {
    if (location.state?.openForm) {
      setEditItem(null);
      switch (location.state.openForm) {
        case 'income':
          setIncomeFormOpen(true);
          break;
        case 'expense':
          setExpenseFormOpen(true);
          break;
        case 'debt':
          setDebtFormOpen(true);
          break;
        case 'asset':
          setAssetFormOpen(true);
          break;
      }
      // Clear the state so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);



  const { data: incomes = [], isLoading: loadingIncomes } = useQuery({
    queryKey: ['incomes', selectedHouseholdId, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!user || !selectedHouseholdId) return [];
      return base44.entities.Income.filter({ 
        household_id: selectedHouseholdId,
        month: selectedMonth,
        year: selectedYear
      });
    },
    enabled: !!user && !!selectedHouseholdId
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses', selectedHouseholdId, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!user || !selectedHouseholdId) return [];
      return base44.entities.Expense.filter({ 
        household_id: selectedHouseholdId,
        month: selectedMonth,
        year: selectedYear
      });
    },
    enabled: !!user && !!selectedHouseholdId
  });

  const { data: budgetSettings = [] } = useQuery({
    queryKey: ['budgetSettings', selectedHouseholdId, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!user || !selectedHouseholdId) return [];
      return base44.entities.Expense.filter({ 
        household_id: selectedHouseholdId,
        month: selectedMonth,
        year: selectedYear,
        is_budget: true,
        is_current: false
      });
    },
    enabled: !!user && !!selectedHouseholdId
  });

  // Query for all unique custom categories ever created for the household
  const { data: allCustomBudgetItems = [] } = useQuery({
    queryKey: ['allCustomBudgetItems', selectedHouseholdId],
    queryFn: async () => {
      if (!user || !selectedHouseholdId) return [];
      return base44.entities.Expense.filter({ 
        household_id: selectedHouseholdId,
        category: 'custom',
        is_budget: true
      });
    },
    enabled: !!user && !!selectedHouseholdId
  });

  // Update custom categories cache based on allCustomBudgetItems
  React.useEffect(() => {
    const customCats = allCustomBudgetItems
      .filter(b => b.custom_category_name)
      .map(b => b.custom_category_name)
      .filter((name, index, self) => self.indexOf(name) === index);
    
    setCustomCategoriesCache(customCats); 
  }, [allCustomBudgetItems]);

  const { data: debts = [], isLoading: loadingDebts } = useQuery({
    queryKey: ['debts', selectedHouseholdId],
    queryFn: async () => {
      if (!user || !selectedHouseholdId) return [];
      return base44.entities.Debt.filter({ household_id: selectedHouseholdId });
    },
    enabled: !!user && !!selectedHouseholdId
  });

  const { data: assets = [], isLoading: loadingAssets } = useQuery({
    queryKey: ['assets', selectedHouseholdId],
    queryFn: async () => {
      if (!user || !selectedHouseholdId) return [];
      return base44.entities.Asset.filter({ household_id: selectedHouseholdId });
    },
    enabled: !!user && !!selectedHouseholdId
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', selectedHouseholdId],
    queryFn: async () => {
      if (!user || !selectedHouseholdId) return [];
      return base44.entities.Alert.filter({ household_id: selectedHouseholdId }, '-created_date', 50);
    },
    enabled: !!user && !!selectedHouseholdId
  });

  // Mutations
  const createIncome = useMutation({
    mutationFn: (data) => base44.entities.Income.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['incomes']); setIncomeFormOpen(false); setEditItem(null); }
  });
  const updateIncome = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Income.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['incomes']); setIncomeFormOpen(false); setEditItem(null); }
  });
  const deleteIncome = useMutation({
    mutationFn: (id) => base44.entities.Income.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['incomes'])
  });

  const createExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['expenses']); setExpenseFormOpen(false); setEditItem(null); }
  });
  const updateExpense = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['expenses']); setExpenseFormOpen(false); setEditItem(null); }
  });
  const deleteExpense = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['expenses'])
  });

  const createDebt = useMutation({
    mutationFn: (data) => base44.entities.Debt.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['debts']); setDebtFormOpen(false); setEditItem(null); }
  });
  const updateDebt = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Debt.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['debts']); setDebtFormOpen(false); setEditItem(null); }
  });
  const deleteDebt = useMutation({
    mutationFn: (id) => base44.entities.Debt.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['debts'])
  });

  const createAsset = useMutation({
    mutationFn: (data) => base44.entities.Asset.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['assets']); setAssetFormOpen(false); setEditItem(null); }
  });
  const updateAsset = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Asset.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['assets']); setAssetFormOpen(false); setEditItem(null); }
  });
  const deleteAsset = useMutation({
    mutationFn: (id) => base44.entities.Asset.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['assets'])
  });

  const createHousehold = useMutation({
    mutationFn: (data) => base44.entities.Household.create(data),
    onSuccess: (newHousehold) => {
      queryClient.invalidateQueries(['households']);
      setSelectedHouseholdId(newHousehold.id);
      setCreateHouseholdOpen(false);
      setNewHouseholdName('');
    }
  });

  const updateAlert = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  // Separate actual expenses from budget settings
  const filteredIncomes = incomes;
  const actualExpenses = expenses.filter(e => !e.is_budget || e.is_current);
  const filteredExpenses = actualExpenses;

  // Calculate remaining budget per category
  const remainingBudgetByCategory = {};
  budgetSettings.forEach(budget => {
    let categoryKey = budget.category;
    let categoryExpenses;
    
    if (budget.category === 'custom' && budget.custom_category_name) {
      // For custom categories, match by both category and custom_category_name
      categoryExpenses = filteredExpenses
        .filter(e => e.category === 'custom' && e.custom_category_name === budget.custom_category_name)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      categoryKey = `custom_${budget.custom_category_name}`;
    } else {
      // For regular categories
      categoryExpenses = filteredExpenses
        .filter(e => e.category === budget.category)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
    }
    
    remainingBudgetByCategory[categoryKey] = budget.amount - categoryExpenses;
  });

  // Calculations
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyBalance = totalIncome - totalExpenses;

  // Calculate adjusted debts for the selected month/year
  const currentActualDate = moment();
  const selectedDate = moment([selectedYear, selectedMonth - 1]);

  const adjustedDebts = debts.map(debt => {
    if (!debt.is_recurring || !debt.monthly_payment || debt.monthly_payment <= 0) {
      return { ...debt, adjusted_remaining_balance: debt.remaining_balance || debt.total_amount };
    }

    let referenceDate;
    if (debt.last_deduction_month && debt.last_deduction_year) {
      referenceDate = moment([debt.last_deduction_year, debt.last_deduction_month - 1]);
    } else {
      referenceDate = currentActualDate.clone().startOf('month');
    }

    let calculatedBalance = debt.remaining_balance || debt.total_amount;
    
    if (selectedDate.isBefore(referenceDate, 'month')) {
      const monthsDifference = referenceDate.diff(selectedDate, 'months');
      calculatedBalance = (debt.remaining_balance || debt.total_amount) + (monthsDifference * debt.monthly_payment);
    } else if (selectedDate.isAfter(referenceDate, 'month')) {
      const monthsDifference = selectedDate.diff(referenceDate, 'months');
      calculatedBalance = (debt.remaining_balance || debt.total_amount) - (monthsDifference * debt.monthly_payment);
    }

    const adjusted_remaining_balance = Math.max(0, calculatedBalance);
    return { ...debt, adjusted_remaining_balance };
  });

  const totalDebts = adjustedDebts.reduce((sum, d) => sum + (d.adjusted_remaining_balance || 0), 0);
  const arrangedDebts = adjustedDebts.filter(d => d.is_arranged).reduce((sum, d) => sum + (d.adjusted_remaining_balance || 0), 0);
  const unarrangedDebts = totalDebts - arrangedDebts;
  const totalAssetValue = assets.reduce((sum, a) => sum + (a.current_value || 0), 0);

  const handleSaveIncome = async (data) => {
    const dataWithHousehold = { 
      ...data, 
      household_id: selectedHouseholdId,
      month: selectedMonth,
      year: selectedYear,
      is_budget: false,
      is_current: true
    };
    
    if (editItem) {
      updateIncome.mutate({ id: editItem.id, data: dataWithHousehold });
    } else {
      // Create the income item
      await createIncome.mutateAsync(dataWithHousehold);
      
      // If recurring, copy to next 12 months
      if (data.is_recurring) {
        const futureIncomes = [];
        for (let i = 1; i <= 12; i++) {
          let futureMonth = selectedMonth + i;
          let futureYear = selectedYear;
          
          while (futureMonth > 12) {
            futureMonth -= 12;
            futureYear += 1;
          }
          
          futureIncomes.push({
            ...dataWithHousehold,
            month: futureMonth,
            year: futureYear
          });
        }
        
        if (futureIncomes.length > 0) {
          await base44.entities.Income.bulkCreate(futureIncomes);
          queryClient.invalidateQueries(['incomes']);
        }
      }
    }
  };

  const handleSaveExpense = async (data) => {
    const dataWithHousehold = { 
      ...data, 
      household_id: selectedHouseholdId,
      month: selectedMonth,
      year: selectedYear,
      is_budget: false,
      is_current: true
    };
    
    if (editItem) {
      updateExpense.mutate({ id: editItem.id, data: dataWithHousehold });
    } else {
      // Create the expense item
      await createExpense.mutateAsync(dataWithHousehold);
      
      // If recurring, copy to next 12 months
      if (data.is_recurring) {
        const futureExpenses = [];
        for (let i = 1; i <= 12; i++) {
          let futureMonth = selectedMonth + i;
          let futureYear = selectedYear;
          
          while (futureMonth > 12) {
            futureMonth -= 12;
            futureYear += 1;
          }
          
          futureExpenses.push({
            ...dataWithHousehold,
            month: futureMonth,
            year: futureYear
          });
        }
        
        if (futureExpenses.length > 0) {
          await base44.entities.Expense.bulkCreate(futureExpenses);
          queryClient.invalidateQueries(['expenses']);
        }
      }
    }
  };

  const handleSaveDebt = (data) => {
    const dataWithHousehold = { ...data, household_id: selectedHouseholdId };
    if (editItem) {
      updateDebt.mutate({ id: editItem.id, data: dataWithHousehold });
    } else {
      createDebt.mutate(dataWithHousehold);
    }
  };

  const handleSaveAsset = (data) => {
    const dataWithHousehold = { ...data, household_id: selectedHouseholdId };
    if (editItem) {
      updateAsset.mutate({ id: editItem.id, data: dataWithHousehold });
    } else {
      createAsset.mutate(dataWithHousehold);
    }
  };

  const handleSaveBudgetSettings = async (payload) => {
    const { budgets, customCategories } = payload;

    try {
      // Delete existing budget settings for this month
      const existingBudgetsForMonth = await base44.entities.Expense.filter({
        household_id: selectedHouseholdId,
        month: selectedMonth,
        year: selectedYear,
        is_budget: true,
        is_current: false
      });

      for (const budget of existingBudgetsForMonth) {
        await base44.entities.Expense.delete(budget.id);
      }

      const itemsToBulkCreate = [];
      
      // 1. Create budget records for this month (amount > 0)
      Object.entries(budgets).forEach(([key, value]) => {
        const amount = value ? parseFloat(value) : 0;
        if (amount > 0) {
          if (key.startsWith('custom_')) {
            const categoryName = key.replace('custom_', '');
            itemsToBulkCreate.push({
              household_id: selectedHouseholdId,
              month: selectedMonth,
              year: selectedYear,
              category: 'custom',
              custom_category_name: categoryName,
              amount: amount,
              is_budget: true,
              is_current: false,
              priority: 3,
              description: 'תקציב חודשי'
            });
          } else {
            itemsToBulkCreate.push({
              household_id: selectedHouseholdId,
              month: selectedMonth,
              year: selectedYear,
              category: key,
              amount: amount,
              is_budget: true,
              is_current: false,
              priority: 3,
              description: 'תקציב חודשי'
            });
          }
        }
      });

      // 2. Create registration records for new custom categories (amount: 0)
      const existingCustomCategoryNamesInDb = new Set(
        allCustomBudgetItems
          .filter(item => item.custom_category_name)
          .map(item => item.custom_category_name)
      );

      customCategories.forEach(categoryName => {
        if (!existingCustomCategoryNamesInDb.has(categoryName)) {
          itemsToBulkCreate.push({
            household_id: selectedHouseholdId,
            month: selectedMonth,
            year: selectedYear,
            category: 'custom',
            custom_category_name: categoryName,
            amount: 0,
            is_budget: true,
            is_current: false,
            priority: 3,
            description: 'רישום קטגוריה מותאמת אישית'
          });
          existingCustomCategoryNamesInDb.add(categoryName);
        }
      });

      if (itemsToBulkCreate.length > 0) {
        await base44.entities.Expense.bulkCreate(itemsToBulkCreate);
      }

      // Invalidate queries
      await queryClient.invalidateQueries(['allCustomBudgetItems', selectedHouseholdId]);
      await queryClient.invalidateQueries(['budgetSettings', selectedHouseholdId, selectedMonth, selectedYear]);
      await queryClient.invalidateQueries(['expenses', selectedHouseholdId, selectedMonth, selectedYear]);
    } catch (error) {
      console.error('Error saving budget settings:', error);
    }
  };

  const incomeColumns = [
    { key: 'category', label: 'קטגוריה', render: (val) => incomeLabels[val] || val },
    { key: 'subcategory', label: 'תת-קטגוריה' },
    { key: 'amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` },
    { key: 'description', label: 'תיאור' }
  ];

  const expenseColumns = [
    { key: 'category', label: 'קטגוריה', render: (val, item) => getExpenseLabel(item) },
    { key: 'subcategory', label: 'תת-קטגוריה' },
    { key: 'amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` },
    { key: 'priority', label: 'עדיפות', render: (val) => {
      if (!val) return '-';
      const labels = { 1: 'קל לצמצם', 2: 'קשה אך אפשרי', 3: 'לא נוגעים' };
      const colors = { 1: 'bg-green-100 text-green-700', 2: 'bg-yellow-100 text-yellow-700', 3: 'bg-red-100 text-red-700' };
      return <Badge className={colors[val]}>{labels[val]}</Badge>;
    }}
  ];

  const debtColumns = [
    { key: 'creditor_name', label: 'נושה' },
    { key: 'debt_type', label: 'סוג', render: (val) => debtLabels[val] || val },
    { key: 'total_amount', label: 'סכום', render: (val) => `₪${(val || 0).toLocaleString()}` },
    { key: 'monthly_payment', label: 'החזר חודשי', render: (val) => val ? `₪${val.toLocaleString()}` : '-' },
    { key: 'is_arranged', label: 'סטטוס', render: (val) => (
      <Badge className={val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
        {val ? 'בהסדר' : 'לא בהסדר'}
      </Badge>
    )}
  ];

  const assetColumns = [
    { key: 'asset_type', label: 'סוג', render: (val) => assetLabels[val] || val },
    { key: 'name', label: 'שם' },
    { key: 'monthly_deposit', label: 'הפקדה חודשית', render: (val) => val ? `₪${val.toLocaleString()}` : '-' },
    { key: 'current_value', label: 'שווי נוכחי', render: (val) => `₪${(val || 0).toLocaleString()}` }
  ];

  const generateSmartAlerts = async () => {
    if (!user || isGeneratingAlerts) return;
    
    setIsGeneratingAlerts(true);
    
    try {
      // Prepare financial data for AI analysis
      const financialData = {
        incomes: filteredIncomes.map(i => ({
          category: incomeLabels[i.category] || i.category,
          amount: i.amount,
          subcategory: i.subcategory
        })),
        expenses: filteredExpenses.map(e => ({
          category: getExpenseLabel(e),
          amount: e.amount,
          subcategory: e.subcategory,
          priority: e.priority
        })),
        debts: debts.map(d => ({
          type: debtLabels[d.debt_type] || d.debt_type,
          total: d.total_amount,
          monthly: d.monthly_payment,
          arranged: d.is_arranged,
          creditor: d.creditor_name
        })),
        assets: assets.map(a => ({
          type: assetLabels[a.asset_type] || a.asset_type,
          value: a.current_value,
          monthly: a.monthly_deposit
        })),
        summary: {
          totalIncome,
          totalExpenses,
          monthlyBalance,
          totalDebts,
          unarrangedDebts,
          totalAssetValue
        }
      };

      // Use AI to analyze and generate smart alerts
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה יועץ פיננסי חכם. נתח את הנתונים הפיננסיים הבאים והתרע על בעיות, סיכונים והזדמנויות.

נתונים פיננסיים:
${JSON.stringify(financialData, null, 2)}

צור רשימה של התראות (עד 8 התראות) לפי הקריטריונים הבאים:
1. חריגות תקציביות - הוצאות גבוהות יחסית להכנסות
2. הוצאות גבוהות מהרגיל בקטגוריות ספציפיות
3. תזכורות על חובות, במיוחד לא מוסדרים
4. הזדמנויות לחסכון - הצעות קונקרטיות
5. דפוסים חריגים או חשודים

כל התראה צריכה להיות:
- ספציפית ומבוססת על הנתונים
- עם המלצה ברורה לפעולה
- מדויקת עם סכומים
- בעברית

החזר JSON בלבד עם המבנה הבא (ללא טקסט נוסף):
{
  "alerts": [
    {
      "alert_type": "budget_exceeded" | "high_expense" | "debt_reminder" | "savings_opportunity" | "unusual_pattern",
      "severity": "low" | "medium" | "high" | "critical",
      "category": "שם הקטגוריה הרלוונטית",
      "title": "כותרת קצרה",
      "message": "תיאור מפורט של הבעיה",
      "suggestion": "המלצה קונקרטית לפעולה",
      "amount": מספר (אם רלוונטי)
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  alert_type: { type: "string" },
                  severity: { type: "string" },
                  category: { type: "string" },
                  title: { type: "string" },
                  message: { type: "string" },
                  suggestion: { type: "string" },
                  amount: { type: "number" }
                },
                required: ["alert_type", "severity", "title", "message"]
              }
            }
          }
        }
      });

      // Save alerts to database
      if (result.alerts && result.alerts.length > 0) {
        await base44.entities.Alert.bulkCreate(
          result.alerts.map(alert => ({
            ...alert,
            household_id: selectedHouseholdId,
            is_read: false,
            is_dismissed: false
          }))
        );
        queryClient.invalidateQueries(['alerts']);
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setIsGeneratingAlerts(false);
    }
  };

  const handleDismissAlert = (id) => {
    updateAlert.mutate({ id, data: { is_dismissed: true } });
  };

  const handleMarkAlertRead = (id) => {
    updateAlert.mutate({ id, data: { is_read: true } });
  };



  const handleFABAction = (formType) => {
    setEditItem(null);
    switch (formType) {
      case 'income':
        setIncomeFormOpen(true);
        break;
      case 'expense':
        setExpenseFormOpen(true);
        break;
      case 'debt':
        setDebtFormOpen(true);
        break;
      case 'asset':
        setAssetFormOpen(true);
        break;
    }
  };

  const handleCreateHousehold = () => {
    if (!newHouseholdName.trim()) return;
    createHousehold.mutate({
      name: newHouseholdName.trim(),
      owner_email: user.email,
      members: []
    });
  };

  const handleExportAll = () => {
    if (!filteredIncomes.length && !filteredExpenses.length && !debts.length && !assets.length) {
      alert('אין נתונים לייצוא');
      return;
    }

    // Create a combined CSV with all data
    let allCSV = '';

    // Income section
    if (filteredIncomes.length > 0) {
      allCSV += 'הכנסות\n';
      allCSV += convertToCSV(filteredIncomes, incomeColumns) + '\n\n';
    }

    // Expenses section
    if (filteredExpenses.length > 0) {
      allCSV += 'הוצאות\n';
      // For expenses, we need to handle the priority badge rendering
      const expenseColumnsForCSV = expenseColumns.map(col => {
        if (col.key === 'priority') {
          return {
            ...col,
            render: (val) => {
              if (!val) return '-';
              const labels = { 1: 'קל לצמצם', 2: 'קשה אך אפשרי', 3: 'לא נוגעים' };
              return labels[val];
            }
          };
        }
        return col;
      });
      allCSV += convertToCSV(filteredExpenses, expenseColumnsForCSV) + '\n\n';
    }

    // Debts section
    if (debts.length > 0) {
      allCSV += 'חובות\n';
      const debtColumnsForCSV = debtColumns.map(col => {
        if (col.key === 'is_arranged') {
          return {
            ...col,
            render: (val) => val ? 'בהסדר' : 'לא בהסדר'
          };
        }
        return col;
      });
      allCSV += convertToCSV(debts, debtColumnsForCSV) + '\n\n';
    }

    // Assets section
    if (assets.length > 0) {
      allCSV += 'חסכונות ונכסים\n';
      allCSV += convertToCSV(assets, assetColumns) + '\n\n';
    }

    downloadCSV(allCSV, 'תקציב_משפחתי_מלא');
  };

  // No household selected - show setup screen
  if (!selectedHouseholdId && households.length === 0 && user) {
    return (
      <>
        <div dir="rtl" className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Wallet className="w-6 h-6 text-blue-600" />
                ברוכים הבאים!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">
                כדי להתחיל, צור משק בית ראשון שלך
              </p>
              <Button
                onClick={() => setCreateHouseholdOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                צור משק בית
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <CreateHouseholdDialog
          open={createHouseholdOpen}
          onOpenChange={setCreateHouseholdOpen}
          newHouseholdName={newHouseholdName}
          onNewHouseholdNameChange={setNewHouseholdName}
          onCreateHousehold={handleCreateHousehold}
          isCreating={createHousehold.isPending}
        />
      </>
    );
  }

  const currentHousehold = households.find(h => h.id === selectedHouseholdId);

  return (
    <div dir="rtl" className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                ניהול תקציב משפחתי
              </h1>
              <p className="text-gray-500">
                תכנון ובניית תקציב חודשי מותאם אישית
              </p>
              {currentHousehold && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    {currentHousehold.name}
                  </Badge>
                  {currentHousehold.members && currentHousehold.members.length > 1 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {currentHousehold.members.length} חברים
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={handleExportAll}
              variant="outline"
              className="gap-2 hidden md:flex"
              aria-label="ייצא את כל הנתונים לקובץ CSV"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              ייצא הכל ל-CSV
            </Button>
          </div>
        </motion.div>

        {/* Household Selector */}
        {households.length > 0 && (
          <HouseholdSelector
            households={households}
            selectedId={selectedHouseholdId}
            onSelect={setSelectedHouseholdId}
            currentUserEmail={user?.email}
          />
        )}

        {/* Month Year Selector */}
        <MonthYearSelector
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="סה״כ הכנסות"
            value={totalIncome}
            icon={TrendingUp}
            color="green"
          />
          <SummaryCard
            title="סה״כ הוצאות"
            value={totalExpenses}
            icon={TrendingDown}
            color="orange"
          />
          <SummaryCard
            title="יתרה חודשית"
            value={monthlyBalance}
            icon={Wallet}
            color={monthlyBalance >= 0 ? "blue" : "red"}
            subtitle={`יתרה שנתית: ₪${(monthlyBalance * 12).toLocaleString()}`}
          />
          <SummaryCard
            title="סה״כ נכסים"
            value={totalAssetValue}
            icon={PiggyBank}
            color="purple"
          />
        </div>

        {/* Debt Alert */}
        {unarrangedDebts > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-semibold text-red-700">חובות לא מוסדרים</p>
                  <p className="text-sm text-red-600">
                    סה״כ ₪{unarrangedDebts.toLocaleString()} בחובות שלא בהסדר
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white shadow-sm p-1.5 rounded-xl overflow-x-auto">
            <TabsList className="inline-flex min-w-full sm:min-w-0 gap-1 bg-transparent p-0" role="tablist" aria-label="ניווט בין קטגוריות">
              <TabsTrigger 
                value="overview" 
                className="animated-tab whitespace-nowrap"
              >
                סקירה כללית
              </TabsTrigger>
              <TabsTrigger 
                value="budget" 
                className="animated-tab whitespace-nowrap"
              >
                הגדרת תקציב
              </TabsTrigger>
              <TabsTrigger 
                value="income" 
                className="animated-tab whitespace-nowrap"
              >
                הכנסות
              </TabsTrigger>
              <TabsTrigger 
                value="expenses" 
                className="animated-tab whitespace-nowrap"
              >
                הוצאות
              </TabsTrigger>
              <TabsTrigger 
                value="debts" 
                className="animated-tab whitespace-nowrap"
              >
                חובות
              </TabsTrigger>
              <TabsTrigger 
                value="assets" 
                className="animated-tab whitespace-nowrap"
              >
                חסכונות ונכסים
              </TabsTrigger>
            </TabsList>
          </div>
          
          <style jsx>{`
            .animated-tab {
              position: relative;
              padding: 0.625rem 1.25rem;
              border-radius: 0.5rem;
              font-weight: 500;
              font-size: 0.875rem;
              color: #6b7280;
              background: transparent;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
              border: none;
              outline: none;
            }
            
            .animated-tab::before {
              content: '';
              position: absolute;
              bottom: 0;
              right: 50%;
              left: 50%;
              height: 2px;
              background: linear-gradient(90deg, #3b82f6, #2563eb);
              border-radius: 2px;
              opacity: 0;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .animated-tab:hover:not([data-state="active"]) {
              color: #1f2937;
              background: #f3f4f6;
              transform: translateY(-1px);
            }
            
            .animated-tab:hover:not([data-state="active"])::before {
              right: 0.75rem;
              left: 0.75rem;
              opacity: 0.5;
            }
            
            .animated-tab:active:not([data-state="active"]) {
              transform: translateY(0) scale(0.98);
            }
            
            .animated-tab[data-state="active"] {
              color: #2563eb;
              background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
              font-weight: 600;
              box-shadow: 0 1px 3px rgba(59, 130, 246, 0.12);
            }
            
            .animated-tab[data-state="active"]::before {
              right: 0.75rem;
              left: 0.75rem;
              opacity: 1;
            }
            
            .animated-tab:focus-visible {
              outline: 2px solid #3b82f6;
              outline-offset: 2px;
            }
            
            @media (prefers-reduced-motion: reduce) {
              .animated-tab,
              .animated-tab::before {
                transition: none;
              }
              .animated-tab:hover:not([data-state="active"]) {
                transform: none;
              }
            }
            
            @media (max-width: 640px) {
              .animated-tab {
                padding: 0.5rem 1rem;
                font-size: 0.813rem;
              }
            }
          `}</style>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Smart Alerts */}
            <AlertPanel
              alerts={alerts}
              onDismiss={handleDismissAlert}
              onMarkRead={handleMarkAlertRead}
              onRefresh={generateSmartAlerts}
              isGenerating={isGeneratingAlerts}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryBreakdown expenses={filteredExpenses} budgets={budgetSettings} />
              
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">סיכום חובות</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">חובות בהסדר</span>
                    <span className="font-bold text-green-700">₪{arrangedDebts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">חובות לא בהסדר</span>
                    <span className="font-bold text-red-700">₪{unarrangedDebts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                    <span className="font-semibold">סה״כ חובות</span>
                    <span className="font-bold">₪{totalDebts.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Budget Settings Tab */}
          <TabsContent value="budget" className="space-y-4">
            <BudgetSettingsTab
              householdId={selectedHouseholdId}
              month={selectedMonth}
              year={selectedYear}
              existingBudgets={budgetSettings}
              allCustomCategories={customCategoriesCache}
              onSave={handleSaveBudgetSettings}
            />
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-semibold">הכנסות חודשיות</h2>
              <div className="flex gap-2">
                <ExportButton
                  data={filteredIncomes}
                  columns={incomeColumns}
                  filename="הכנסות"
                />
                <Button onClick={() => { setEditItem(null); setIncomeFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף הכנסה
                </Button>
              </div>
            </div>
            <DataTable
              data={filteredIncomes}
              columns={incomeColumns}
              onEdit={(item) => { setEditItem(item); setIncomeFormOpen(true); }}
              onDelete={(item) => deleteIncome.mutate(item.id)}
              emptyMessage="לא הוזנו הכנסות עדיין"
            />
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-semibold">הוצאות חודשיות</h2>
              <div className="flex gap-2">
                <ExportButton
                  data={filteredExpenses}
                  columns={expenseColumns.map(col => {
                    if (col.key === 'priority') {
                      return {
                        ...col,
                        render: (val) => {
                          if (!val) return '-';
                          const labels = { 1: 'קל לצמצם', 2: 'קשה אך אפשרי', 3: 'לא נוגעים' };
                          return labels[val];
                        }
                      };
                    }
                    return col;
                  })}
                  filename="הוצאות"
                />
                <Button onClick={() => { setEditItem(null); setExpenseFormOpen(true); }} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף הוצאה
                </Button>
              </div>
            </div>
            <DataTable
              data={filteredExpenses}
              columns={expenseColumns}
              onEdit={(item) => { setEditItem(item); setExpenseFormOpen(true); }}
              onDelete={(item) => deleteExpense.mutate(item.id)}
              emptyMessage="לא הוזנו הוצאות עדיין"
            />
          </TabsContent>

          {/* Debts Tab */}
          <TabsContent value="debts" className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-semibold">פירוט חובות</h2>
              <div className="flex gap-2">
                <ExportButton
                  data={debts}
                  columns={debtColumns.map(col => {
                    if (col.key === 'is_arranged') {
                      return {
                        ...col,
                        render: (val) => val ? 'בהסדר' : 'לא בהסדר'
                      };
                    }
                    return col;
                  })}
                  filename="חובות"
                />
                <Button onClick={() => { setEditItem(null); setDebtFormOpen(true); }} className="bg-red-500 hover:bg-red-600">
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף חוב
                </Button>
              </div>
            </div>
            <DataTable
              data={adjustedDebts.map(d => ({ ...d, total_amount: d.adjusted_remaining_balance }))}
              columns={debtColumns}
              onEdit={(item) => { setEditItem(item); setDebtFormOpen(true); }}
              onDelete={(item) => deleteDebt.mutate(item.id)}
              emptyMessage="לא הוזנו חובות"
            />
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-semibold">חסכונות ונכסים</h2>
              <div className="flex gap-2">
                <ExportButton
                  data={assets}
                  columns={assetColumns}
                  filename="חסכונות_ונכסים"
                />
                <Button onClick={() => { setEditItem(null); setAssetFormOpen(true); }} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף נכס
                </Button>
              </div>
            </div>
            <DataTable
              data={assets}
              columns={assetColumns}
              onEdit={(item) => { setEditItem(item); setAssetFormOpen(true); }}
              onDelete={(item) => deleteAsset.mutate(item.id)}
              emptyMessage="לא הוזנו נכסים או חסכונות"
            />
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <IncomeForm
          open={incomeFormOpen}
          onClose={() => { setIncomeFormOpen(false); setEditItem(null); }}
          onSave={handleSaveIncome}
          editItem={editItem}
        />
        <ExpenseForm
          open={expenseFormOpen}
          onClose={() => { setExpenseFormOpen(false); setEditItem(null); }}
          onSave={handleSaveExpense}
          editItem={editItem}
          remainingBudgetByCategory={remainingBudgetByCategory}
          customCategories={customCategoriesCache}
        />
        <DebtForm
          open={debtFormOpen}
          onClose={() => { setDebtFormOpen(false); setEditItem(null); }}
          onSave={handleSaveDebt}
          editItem={editItem}
        />
        <AssetForm
          open={assetFormOpen}
          onClose={() => { setAssetFormOpen(false); setEditItem(null); }}
          onSave={handleSaveAsset}
          editItem={editItem}
        />



        <CreateHouseholdDialog
          open={createHouseholdOpen}
          onOpenChange={setCreateHouseholdOpen}
          newHouseholdName={newHouseholdName}
          onNewHouseholdNameChange={setNewHouseholdName}
          onCreateHousehold={handleCreateHousehold}
          isCreating={createHousehold.isPending}
        />
      </div>
    </div>
  );
}