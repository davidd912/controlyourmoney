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
  LogOut
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { LocaleProvider, useLocale } from '@/components/LocaleContext';
import '@/components/i18n';
import LanguageToggle from '@/components/LanguageToggle';

// Global QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 600000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
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

// שיניתי את המפתחות שיתאימו בדיוק לקובץ i18n
const navigation = [
  { page: 'Dashboard', icon: LayoutDashboard },
  { page: 'AIPlanning', icon: Sparkles },
  { page: 'Benefits', icon: Award },
  { page: 'UserSettings', icon: Users },
  { page: 'Guide', icon: BookOpen }
];

export const HouseholdContext = createContext(null);

function LayoutContent({ children, currentPageName }) {
  const { t, i18n } = useTranslation();
  const { lang } = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || false;
    }
    return false;
  });
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);

  // הזרקת תגיות PWA
  useEffect(() => {
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'FamWiz' },
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
  }, []);

  const navigate = useNavigate();
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

  // סנכרון משק הבית הנבחר
  useEffect(() => {
    if (user && households.length > 0) {
      const serverId = user.last_selected_household_id;
      if (serverId && serverId !== selectedHouseholdId) {
        const exists = households.find((h) => h.id === serverId);
        if (exists) {
          setSelectedHouseholdId(serverId);
          return;
        }
      }
      if (!selectedHouseholdId) {
        setSelectedHouseholdId(households[0].id);
      }
    }
  }, [user?.last_selected_household_id, households.length]);

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

  return (
    <HouseholdContext.Provider value={{ user, households, selectedHouseholdId, setSelectedHouseholdId, loadingHouseholds }}>
      <div dir={lang === 'he' ? 'rtl' : 'ltr'} className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900" lang={lang}>
        
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">FamWiz</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.page} to={createPageUrl(item.page)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${currentPageName === item.page ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`}>
                  {t(`nav.${item.page}`)}
                </Link>
              ))}
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
              <LanguageToggle />
              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="rounded-xl">
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
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

        <main className="flex-1 pb-[80px] md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={currentPageName} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation - FIXED TRANSLATION */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-16 px-2">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-300 ${
                  isActive ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
                >
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  </div>
                  {/* השתמשתי ב-t כדי לתרגם את השם לפי ה-page */}
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {t(`nav.${item.page}`)}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer - FIXED TRANSLATIONS */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-auto hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span className="font-black italic text-gray-900 dark:text-white">FamWiz</span>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-bold text-gray-500">
                <Link to={createPageUrl('TermsOfService')} className="hover:text-blue-600 transition-colors">
                  {t('terms')}
                </Link>
                <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-blue-600 transition-colors">
                  {t('privacy')}
                </Link>
                <Link to={createPageUrl('AccessibilityStatement')} className="hover:text-blue-600 transition-colors">
                  {t('accessibility')}
                </Link>
              </div>

              <div className="text-xs font-medium text-gray-400">
                {t('landing_footer_copyright', { year: new Date().getFullYear() })}
              </div>
            </div>
          </div>
        </footer>
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