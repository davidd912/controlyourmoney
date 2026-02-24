import React, { useState, useEffect, createContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import LandingPage from '@/pages/LandingPage';
import { base44 } from '@/api/base44Client';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, Award, Menu, X, Wallet, Users, BookOpen, Sparkles, 
  Plus, TrendingUp, TrendingDown, Moon, Sun, MessageCircle, Send 
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ... (הגדרת ה-queryClient נשארת ללא שינוי)
const queryClient = new QueryClient({ /* ... defaultOptions ... */ });

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
    if (typeof window !== 'undefined') return localStorage.getItem('darkMode') === 'true' || false;
    return false;
  });
  
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  const navigate = useNavigate();
  const invalidateTimeoutRef = useRef({});

  // --- תיקון לוגיקת ה-FAB ---
  useEffect(() => {
    const handleOpenFAB = () => setFabMenuOpen(true);
    window.addEventListener('openFABMenu', handleOpenFAB);
    return () => window.removeEventListener('openFABMenu', handleOpenFAB);
  }, []);

  // ... (ה-Queries וה-Subscriptions של ה-Incomes/Expenses נשארים ללא שינוי)
  const { data: user, isLoading: loadingUser, isError: userError } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: households = [], isLoading: loadingHouseholds } = useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Household.list();
      return all.filter(h => !h.is_deleted && (h.owner_email === user.email || (h.members && h.members.includes(user.email))));
    },
    enabled: !!user,
    refetchInterval: 2500,
  });

  // סנכרון מצב כהה
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  if (loadingUser || loadingHouseholds || userError) {
     if (!loadingUser && userError) return <LandingPage />;
     return (
       <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
         <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  if (!user) return <LandingPage />;

  const leftNavItems = navigation.slice(0, 2);
  const rightNavItems = navigation.slice(2, 4);

  return (
    <HouseholdContext.Provider value={{ user, households, selectedHouseholdId, setSelectedHouseholdId, loadingHouseholds }}>
      <div dir="rtl" className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden" lang="he">
        
        {/* Header - Desktop & Tablet */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-[60] border-b border-gray-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white hidden sm:block tracking-tight">קונטרול</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.page} to={createPageUrl(item.page)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPageName === item.page ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {item.name}
                </Link>
              ))}
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="rounded-full">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </Button>
            </nav>

            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - שינוי: pb-32 מבטיח שהתוכן לא יתקע מאחורי התפריט */}
        <main className="flex-1 pb-32 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div key={currentPageName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* WhatsApp & Telegram - שינוי: bottom-32 כדי שלא יסתירו את התפריט */}
        <div className="fixed left-4 bottom-32 md:bottom-8 z-[70] flex flex-col gap-3">
            <Button size="icon" onClick={() => navigate(createPageUrl('Dashboard'), { state: { action: 'whatsapp' } })} className="rounded-full w-12 h-12 bg-green-500 hover:bg-green-600 text-white shadow-xl">
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button size="icon" onClick={() => navigate(createPageUrl('Dashboard'), { state: { action: 'telegram' } })} className="rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white shadow-xl">
              <Send className="w-6 h-6" />
            </Button>
        </div>

        {/* Bottom Nav - שינוי: z-[100] ו-h-[85px] לחוויית מובייל נוחה */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-[100] bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-700 flex justify-around items-center h-[85px] pb-5 px-2">
          {leftNavItems.map(item => (
            <Link key={item.page} to={createPageUrl(item.page)} className={`flex flex-col items-center gap-1 transition-colors ${currentPageName === item.page ? 'text-blue-600' : 'text-gray-400'}`}>
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          ))}
          
          <div className="relative -mt-10">
            <Button 
              onClick={() => setFabMenuOpen(true)} 
              className="w-16 h-16 rounded-full shadow-2xl bg-blue-600 text-white hover:bg-blue-700 border-4 border-gray-50 dark:border-gray-900"
            >
              <Plus className={`w-8 h-8 transition-transform duration-300 ${fabMenuOpen ? 'rotate-45' : ''}`} />
            </Button>
          </div>

          {rightNavItems.map(item => (
            <Link key={item.page} to={createPageUrl(item.page)} className={`flex flex-col items-center gap-1 transition-colors ${currentPageName === item.page ? 'text-blue-600' : 'text-gray-400'}`}>
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* FAB Overlay Menu */}
        <AnimatePresence>
          {fabMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                onClick={() => setFabMenuOpen(false)}
              />
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 z-[120] rounded-t-[32px] p-8 pb-12 shadow-2xl"
              >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-8" />
                <h3 className="text-xl font-bold text-center mb-6 dark:text-white">פעולה מהירה</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-28 flex-col gap-3 rounded-2xl border-2 border-green-50 dark:border-green-900/20 hover:bg-green-50" onClick={() => { setFabMenuOpen(false); navigate(createPageUrl('Dashboard'), { state: { openForm: 'income' } }); }}>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="font-bold">הכנסה חדשה</span>
                  </Button>
                  <Button variant="outline" className="h-28 flex-col gap-3 rounded-2xl border-2 border-orange-50 dark:border-orange-900/20 hover:bg-orange-50" onClick={() => { setFabMenuOpen(false); navigate(createPageUrl('Dashboard'), { state: { openForm: 'expense' } }); }}>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <span className="font-bold">הוצאה חדשה</span>
                  </Button>
                </div>
              </motion.div>
            </>
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