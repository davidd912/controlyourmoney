import React, { useState, useEffect, createContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import LandingPage from '@/pages/LandingPage';
import { base44 } from '@/api/base44Client';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Award,
  Menu,
  X,
  Wallet,
  Users,
  BookOpen,
  Sparkles,
  Plus,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  ArrowRight,
  Moon,
  Sun,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Global QueryClient עם סנכרון אקטיבי בין מכשירים
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // דקה אחת - מאפשר רענון מהיר יותר בין מכשירים
      gcTime: 600000,
      refetchOnWindowFocus: true, // קריטי! גורם לטלפון להתעדכן מיד כשפותחים אותו
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error?.response?.status === 429) return false;
        return failureCount < 3;
      }
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error?.response?.status === 429) {
          if (failureCount === 0) return true;
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (failureCount, error) => {
        if (error?.response?.status === 429 && failureCount === 0) {
          return 2000;
        }
        return Math.min(1000 * Math.pow(2, failureCount), 30000);
      },
    },
  },
});

const navigation = [
  { name: 'דשבורד', page: 'Dashboard', icon: LayoutDashboard },
  { name: 'תכנון AI', page: 'AIPlanning', icon: Sparkles },
  { name: 'הטבות וזכויות', page: 'Benefits', icon: Award },
  { name: 'משתמשים', page: 'UserSettings', icon: Users },
  { name: 'מדריך', page: 'Guide', icon: BookOpen },
];

export const HouseholdContext = createContext(null);

function LayoutContent({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || false;
    }
    return false;
  });
  const [showWhatsappButton, setShowWhatsappButton] = useState(true);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const invalidateTimeoutRef = useRef({});

  const debouncedInvalidate = useRef((queryKeyPrefix) => {
    const key = queryKeyPrefix[0];
    if (invalidateTimeoutRef.current[key]) {
      clearTimeout(invalidateTimeoutRef.current[key]);
    }
    invalidateTimeoutRef.current[key] = setTimeout(async () => {
      await queryClient.cancelQueries({ queryKey: queryKeyPrefix });
      queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
      delete invalidateTimeoutRef.current[key];
    }, 5000);
  }).current;

  const { data: user, isLoading: loadingUser, isError: userError } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: households = [], isLoading: loadingHouseholds } = useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Household.list();
      return all.filter(h =>
        !h.is_deleted &&
        (h.owner_email === user.email ||
        (h.members && h.members.includes(user.email)))
      );
    },
    enabled: !!user,
  });

  // WebSocket Subscriptions עם סנכרון משתמש
  useEffect(() => {
    if (!selectedHouseholdId) return;

    const unsubscribers = [];

    const unsubIncome = base44.entities.Income.subscribe((event) => {
      if (event.data?.household_id === selectedHouseholdId) {
        debouncedInvalidate(['incomes', selectedHouseholdId]);
      }
    });
    unsubscribers.push(unsubIncome);

    const unsubExpense = base44.entities.Expense.subscribe((event) => {
      if (event.data?.household_id === selectedHouseholdId) {
        debouncedInvalidate(['expenses', selectedHouseholdId]);
        debouncedInvalidate(['budgetSettings', selectedHouseholdId]);
      }
    });
    unsubscribers.push(unsubExpense);

    const unsubHousehold = base44.entities.Household.subscribe((event) => {
      if (event.id === selectedHouseholdId || event.data?.owner_email === user?.email) {
        debouncedInvalidate(['households']);
      }
    });
    unsubscribers.push(unsubHousehold);

    return () => {
      unsubscribers.forEach(unsub => unsub());
      Object.values(invalidateTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
      invalidateTimeoutRef.current = {};
    };
  }, [selectedHouseholdId, user?.email]);

  // סנכרון משק הבית הנבחר מול השרת (Cross-Device Sync)
  useEffect(() => {
    if (user && households.length > 0) {
      const serverId = user.last_selected_household_id;
      
      // אם בשרת מוגדר בית אחר ממה שיש לנו כרגע - יישר קו
      if (serverId && serverId !== selectedHouseholdId) {
        const exists = households.find(h => h.id === serverId);
        if (exists) {
          setSelectedHouseholdId(serverId);
          return;
        }
      }
      
      // ברירת מחדל אם אין בחירה בכלל
      if (!selectedHouseholdId) {
        setSelectedHouseholdId(households[0].id);
      }
    }
  }, [user?.last_selected_household_id, households.length]);

  // עדכון השרת בבחירה חדשה
  useEffect(() => {
    if (selectedHouseholdId && user && selectedHouseholdId !== user.last_selected_household_id) {
      base44.auth.updateMe({ last_selected_household_id: selectedHouseholdId });
    }
  }, [selectedHouseholdId, user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!loadingUser) {
      if (isAuthenticated && currentPageName === 'LandingPage') {
        navigate(createPageUrl('Dashboard'), { replace: true });
      } else if (!isAuthenticated && currentPageName !== 'LandingPage') {
        navigate(createPageUrl('LandingPage'), { replace: true });
      }
    }
  }, [isAuthenticated, currentPageName, navigate, loadingUser]);

  if (loadingUser || loadingHouseholds || userError) {
    if (!loadingUser && userError) {
      if (currentPageName !== 'LandingPage') navigate(createPageUrl('LandingPage'), { replace: true });
      return <LandingPage />;
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <LandingPage />;

  const leftNavItems = navigation.slice(0, 2);
  const rightNavItems = navigation.slice(2, 4);

  return (
    <HouseholdContext.Provider value={{ user, households, selectedHouseholdId, setSelectedHouseholdId, loadingHouseholds }}>
      <div dir="rtl" className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900" lang="he">
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">ניהול תקציב</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.page} to={createPageUrl(item.page)} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPageName === item.page ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  {item.name}
                </Link>
              ))}
              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </nav>

            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-[132px] md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={currentPageName} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* WhatsApp Floating Button */}
        {(user?.role === 'admin' || user?.whatsapp_beta_access) && showWhatsappButton && (
          <div className="fixed left-6 bottom-24 md:bottom-8 z-40 flex items-center gap-2">
            <Button onClick={() => navigate(createPageUrl('Dashboard'), { state: { action: 'whatsapp' } })} className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg">
              <MessageCircle className="w-5 h-5 mr-2" /> WHATSAPP
            </Button>
          </div>
        )}

        {/* Bottom Nav for Mobile */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-800 border-t flex justify-around items-center h-[72px]">
          {leftNavItems.map(item => (
            <Link key={item.page} to={createPageUrl(item.page)} className="flex flex-col items-center text-[10px]"><item.icon className="w-5 h-5" />{item.name}</Link>
          ))}
          <Button onClick={() => window.dispatchEvent(new CustomEvent('openFABMenu'))} className="w-14 h-14 rounded-full -mt-8 shadow-xl bg-blue-600 text-white">
            <Plus className="w-7 h-7" />
          </Button>
          {rightNavItems.map(item => (
            <Link key={item.page} to={createPageUrl(item.page)} className="flex flex-col items-center text-[10px]"><item.icon className="w-5 h-5" />{item.name}</Link>
          ))}
        </nav>

        {/* FAB Menu */}
        <AnimatePresence>
          {fabMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center pb-32" onClick={() => setFabMenuOpen(false)}>
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-white dark:bg-gray-800 p-6 w-full max-w-md rounded-t-3xl">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <Button variant="outline" className="h-24 flex-col" onClick={() => navigate(createPageUrl('Dashboard'), { state: { openForm: 'income' } })}><TrendingUp />הכנסה</Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => navigate(createPageUrl('Dashboard'), { state: { openForm: 'expense' } })}><TrendingDown />הוצאה</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </HouseholdContext.Provider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </QueryClientProvider>
  );
}