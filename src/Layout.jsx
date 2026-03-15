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
  MessageCircle } from
"lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslation, I18nextProvider } from 'react-i18next';
import { LocaleProvider, useLocale } from '@/components/LocaleContext';
import '@/components/i18n';
import LanguageToggle from '@/components/LanguageToggle';

// Global QueryClient עם סנכרון אקטיבי בין מכשירים
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 שניות - מונע בקשות חוזרות מיותרות
      gcTime: 600000,
      refetchOnWindowFocus: false, // מונע הצפת שרת כשמשתמש עובר בין אפליקציות בטלפון
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1, // ניסיון אחד בלבד - מונע הצפת שרת בשגיאות
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
      }
    }
  }
});

const navigation = [
{ name: 'דשבורד', page: 'Dashboard', icon: LayoutDashboard },
{ name: 'תכנון AI', page: 'AIPlanning', icon: Sparkles },
{ name: 'הטבות וזכויות', page: 'Benefits', icon: Award },
{ name: 'משתמשים', page: 'UserSettings', icon: Users },
{ name: 'מדריך', page: 'Guide', icon: BookOpen }];


export const HouseholdContext = createContext(null);

function LayoutContent({ children, currentPageName }) {
  const { t } = useTranslation();
  const { lang, changeLanguage } = useLocale();
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

  // הזרקת תגיות PWA ל-iOS בזמן אמת
  useEffect(() => {
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'קונטרול' },
      { name: 'theme-color', content: '#2563eb' }
    ];

    metaTags.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });

    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = '/favicon.ico';
      document.head.appendChild(link);
    }
  }, []);

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
    retry: false,
  });

  const { data: households = [], isLoading: loadingHouseholds } = useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Household.list();
      return all.filter((h) =>
      !h.is_deleted && (
      h.owner_email === user.email ||
      h.members && h.members.includes(user.email))
      );
    },
    enabled: !!user
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
      unsubscribers.forEach((unsub) => unsub());
      Object.values(invalidateTimeoutRef.current).forEach((timeout) => clearTimeout(timeout));
      invalidateTimeoutRef.current = {};
    };
  }, [selectedHouseholdId, user?.email]);

  // סנכרון משק הבית הנבחר מול השרת (Cross-Device Sync)
  useEffect(() => {
    if (user && households.length > 0) {
      const serverId = user.last_selected_household_id;

      // אם בשרת מוגדר בית אחר ממה שיש לנו כרגע - יישר קו
      if (serverId && serverId !== selectedHouseholdId) {
        const exists = households.find((h) => h.id === serverId);
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
      </div>);

  }

  if (!isAuthenticated) return <LandingPage />;



  return (
    <HouseholdContext.Provider value={{ user, households, selectedHouseholdId, setSelectedHouseholdId, loadingHouseholds }}>
      <div dir={lang === 'he' ? 'rtl' : 'ltr'} className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900" lang={lang}>
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">{t('app_title')}</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) =>
              <Link key={item.page} to={createPageUrl(item.page)} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPageName === item.page ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  {t(`nav.${item.page}`)}
                </Link>
              )}
              <LanguageToggle />
              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </nav>

            <div className="flex items-center gap-1 md:hidden">
              <LanguageToggle />
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

        {/* Bottom Nav for Mobile */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-800 border-t shadow-lg">
          <div className="flex justify-around items-center h-16 px-2">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`
                  }>

                  <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>);

            })}
          </div>
        </nav>



        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-muted-foreground">
              <Link to={createPageUrl('TermsOfService')} className="hover:text-primary transition-colors">
                תנאי שימוש
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-primary transition-colors">
                מדיניות פרטיות
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to={createPageUrl('AccessibilityStatement')} className="hover:text-primary transition-colors">
                הצהרת נגישות
              </Link>
            </div>
            <div className="text-center mt-4 text-xs text-muted-foreground">
              © {new Date().getFullYear()} ניהול תקציב משפחתי. כל הזכויות שמורות.
            </div>
          </div>
        </footer>
        </div>
        </HouseholdContext.Provider>);

}

export default function Layout({ children, currentPageName }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </LocaleProvider>
    </QueryClientProvider>);

}