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
  MessageCircle,
  LogOut,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { LocaleProvider, useLocale } from '@/components/LocaleContext';
import '@/components/i18n';
import LanguageToggle from '@/components/LanguageToggle';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, gcTime: 600000, refetchOnWindowFocus: false, retry: 1 },
  }
});

const navigation = [
  { page: 'Dashboard', icon: LayoutDashboard },
  { page: 'AIPlanning', icon: Sparkles },
  { page: 'Benefits', icon: Award },
  { page: 'UserSettings', icon: Users },
  { page: 'Guide', icon: BookOpen }
];

export const HouseholdContext = createContext(null);

function LayoutContent({ children, currentPageName }) {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true' || false);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(localStorage.getItem('selectedHouseholdId') || null);
  const navigate = useNavigate();

  // === התחלת התוספת של טלגרם ===
  const isTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp?.initData;

  useEffect(() => {
    if (isTelegram) {
      const tg = window.Telegram.WebApp;
      tg.ready(); // מודיע לטלגרם שהאפליקציה מוכנה
      tg.expand(); // פותח את האפליקציה על מסך מלא
      
      // התאמת צבע הרקע של האתר לצבע הנושא של טלגרם
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
    }
  }, [isTelegram]);
  // === סוף התוספת של טלגרם ===

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
      return all.filter((h) => !h.is_deleted && (h.owner_email === user.email || (h.members && h.members.includes(user.email))));
    },
    enabled: !!user
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (selectedHouseholdId) localStorage.setItem('selectedHouseholdId', selectedHouseholdId);
  }, [selectedHouseholdId]);

  if (loadingUser || loadingHouseholds) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user && currentPageName !== 'LandingPage') return <LandingPage />;

  return (
    <HouseholdContext.Provider value={{ user, households, selectedHouseholdId, setSelectedHouseholdId }}>
      <div dir={lang === 'he' ? 'rtl' : 'ltr'} className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" lang={lang}>
        
        {/* Header - מוסתר אם אנחנו בתוך טלגרם כדי לחסוך מקום וכותרת כפולה */}
        {!isTelegram && (
          <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
              <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">ControlYourMoney</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => (
                  <Link key={item.page} to={createPageUrl(item.page)}>
                    <Button variant={currentPageName === item.page ? "secondary" : "ghost"} className="font-bold">
                      {t(`nav.${item.page}`)}
                    </Button>
                  </Link>
                ))}
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
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={currentPageName} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-16 shadow-lg">
          <div className="flex justify-around items-center h-full">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link key={item.page} to={createPageUrl(item.page)} className={`flex flex-col items-center gap-1 flex-1 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] font-black">{t(`nav.${item.page}`)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </HouseholdContext.Provider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </LocaleProvider>
    </QueryClientProvider>
  );
}