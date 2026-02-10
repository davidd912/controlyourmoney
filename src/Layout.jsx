import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import PWASetup from '@/components/PWASetup';
import InstallPrompt from '@/components/InstallPrompt';
import { 
  LayoutDashboard, 
  Award,
  FileText,
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
  Sun
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const navigation = [
  { name: 'דשבורד', page: 'Dashboard', icon: LayoutDashboard },
  { name: 'תכנון AI', page: 'AIPlanning', icon: Sparkles },
  { name: 'הטבות וזכויות', page: 'Benefits', icon: Award },
  { name: 'משתמשים', page: 'UserSettings', icon: Users },
  { name: 'מדריך', page: 'Guide', icon: BookOpen },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || false;
    }
    return false;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const isRootRoute = currentPageName === 'Dashboard';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Listen for FAB menu open event
  useEffect(() => {
    const handleFABMenu = () => setFabMenuOpen(true);
    window.addEventListener('openFABMenu', handleFABMenu);
    return () => window.removeEventListener('openFABMenu', handleFABMenu);
  }, []);

  // Split navigation for bottom nav (2 items on each side of FAB)
  const leftNavItems = navigation.slice(0, 2);
  const rightNavItems = navigation.slice(2, 4);

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900" lang="he">
      <PWASetup />
      <InstallPrompt />
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        דלג לתוכן הראשי
      </a>

      {/* Header */}
      <header 
        className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50" 
        role="banner"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            {!isRootRoute && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="md:flex text-gray-600 dark:text-gray-300"
                aria-label="חזור"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3" aria-label="דף הבית - ניהול תקציב">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                ניהול תקציב
              </span>
            </Link>

            {/* Home button for mobile - centered */}
            <Link 
              to={createPageUrl('Dashboard')} 
              className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
              aria-label="דף הבית"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="תפריט ראשי">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <motion.div
                    key={item.page}
                    whileHover={prefersReducedMotion ? {} : { y: -2 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Link
                      to={createPageUrl(item.page)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary' 
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
              
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="text-gray-600 dark:text-gray-300"
                aria-label={darkMode ? "מצב בהיר" : "מצב כהה"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </nav>

            {/* Mobile menu button and dark mode */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="text-gray-600 dark:text-gray-300"
                aria-label={darkMode ? "מצב בהיר" : "מצב כהה"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0, height: 'auto' } : { opacity: 0, height: 0 }}
              animate={prefersReducedMotion ? { opacity: 1, height: 'auto' } : { opacity: 1, height: 'auto' }}
              exit={prefersReducedMotion ? { opacity: 0, height: 'auto' } : { opacity: 0, height: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "tween", duration: 0.3 }}
              className="md:hidden border-t bg-white dark:bg-gray-800"
            >
              <nav className="px-4 py-3 space-y-1" role="navigation" aria-label="תפריט ניווט נייד">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <motion.div
                      key={item.page}
                      whileHover={prefersReducedMotion ? {} : { y: -2 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Link
                        to={createPageUrl(item.page)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                          ${isActive 
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary' 
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main id="main-content" role="main" aria-label="תוכן ראשי" className="flex-1 pb-[132px] md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-auto hidden md:block" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ניהול תקציב משפחתי. כל הזכויות שמורות.
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                🔒 הנתונים שלך מאובטחים ומוצפנים בטכנולוגיית SSL/TLS מתקדמת
              </p>
            </div>
            <div className="flex gap-6">
              <Link 
                to={createPageUrl('TermsOfService')} 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                תנאי שימוש
              </Link>
              <Link 
                to={createPageUrl('PrivacyPolicy')} 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                מדיניות פרטיות
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating QuickChat Button */}
      <Link to={createPageUrl('QuickChat')}>
        <motion.button
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 17 }}
          className="fixed left-6 bottom-24 md:bottom-8 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all"
          aria-label="צ'אט חכם"
        >
          <Sparkles className="w-6 h-6" aria-hidden="true" />
        </motion.button>
      </Link>

      {/* Bottom Navigation for Mobile with FAB */}
      <nav 
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-800 border-t shadow-lg" 
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
        role="navigation" 
        aria-label="תפריט ניווט תחתון"
      >
        <div className="relative flex justify-between items-center h-[72px] px-2">
          {/* Right Side Items (2 items) */}
          <div className="flex flex-1 justify-around">
            {leftNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`
                    flex flex-col items-center justify-center p-2 text-[10px] font-medium transition-colors leading-tight min-w-[60px]
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
                  <span className="line-clamp-2 max-w-[70px] text-center">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* FAB Button in Center */}
          <div className="flex items-center justify-center px-4">
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => {
                const event = new CustomEvent('openFABMenu');
                window.dispatchEvent(event);
              }}
              className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg ring-4 ring-white hover:shadow-xl transition-shadow"
              aria-label="הוסף פריט"
            >
              <Plus className="w-7 h-7" aria-hidden="true" />
            </motion.button>
          </div>

          {/* Left Side Items (2 items) */}
          <div className="flex flex-1 justify-around">
            {rightNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`
                    flex flex-col items-center justify-center p-2 text-[10px] font-medium transition-colors leading-tight min-w-[60px]
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
                  <span className="line-clamp-2 max-w-[70px] text-center">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* FAB Quick Actions Menu */}
      <AnimatePresence>
        {fabMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center pb-32"
            onClick={() => setFabMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-bold text-center mb-6 text-foreground">הוסף פריט חדש</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    setFabMenuOpen(false);
                    if (currentPageName === 'Dashboard') {
                      const event = new CustomEvent('fabAction', { detail: { type: 'income' } });
                      window.dispatchEvent(event);
                    } else {
                      navigate(createPageUrl('Dashboard'), { state: { openForm: 'income' } });
                    }
                  }}
                  className="flex flex-col items-center gap-3 h-24 bg-success/10 text-success hover:bg-success/20 border-2 border-success/30"
                  variant="outline"
                >
                  <TrendingUp className="w-8 h-8" />
                  <span className="font-semibold">הכנסה</span>
                </Button>
                <Button
                  onClick={() => {
                    setFabMenuOpen(false);
                    if (currentPageName === 'Dashboard') {
                      const event = new CustomEvent('fabAction', { detail: { type: 'expense' } });
                      window.dispatchEvent(event);
                    } else {
                      navigate(createPageUrl('Dashboard'), { state: { openForm: 'expense' } });
                    }
                  }}
                  className="flex flex-col items-center gap-3 h-24 bg-warning/10 text-warning hover:bg-warning/20 border-2 border-warning/30"
                  variant="outline"
                >
                  <TrendingDown className="w-8 h-8" />
                  <span className="font-semibold">הוצאה</span>
                </Button>
                <Button
                  onClick={() => {
                    setFabMenuOpen(false);
                    if (currentPageName === 'Dashboard') {
                      const event = new CustomEvent('fabAction', { detail: { type: 'debt' } });
                      window.dispatchEvent(event);
                    } else {
                      navigate(createPageUrl('Dashboard'), { state: { openForm: 'debt' } });
                    }
                  }}
                  className="flex flex-col items-center gap-3 h-24 bg-destructive/10 text-destructive hover:bg-destructive/20 border-2 border-destructive/30"
                  variant="outline"
                >
                  <CreditCard className="w-8 h-8" />
                  <span className="font-semibold">חוב</span>
                </Button>
                <Button
                  onClick={() => {
                    setFabMenuOpen(false);
                    if (currentPageName === 'Dashboard') {
                      const event = new CustomEvent('fabAction', { detail: { type: 'asset' } });
                      window.dispatchEvent(event);
                    } else {
                      navigate(createPageUrl('Dashboard'), { state: { openForm: 'asset' } });
                    }
                  }}
                  className="flex flex-col items-center gap-3 h-24 bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary/30"
                  variant="outline"
                >
                  <PiggyBank className="w-8 h-8" />
                  <span className="font-semibold">נכס</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}