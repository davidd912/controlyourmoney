import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Award,
  FileText,
  Menu,
  X,
  Wallet,
  Users,
  BookOpen,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const navigation = [
  { name: 'דשבורד', page: 'Dashboard', icon: LayoutDashboard },
  { name: 'תכנון AI', page: 'AIPlanning', icon: Sparkles },
  { name: 'הטבות וזכויות', page: 'Benefits', icon: Award },
  { name: 'משקי בית', page: 'HouseholdSettings', icon: Users },
  { name: 'מדריך', page: 'Guide', icon: BookOpen },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50" lang="he">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        דלג לתוכן הראשי
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3" aria-label="דף הבית - ניהול תקציב">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
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
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
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
              className="md:hidden border-t bg-white"
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
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-100'
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
      <main id="main-content" role="main" aria-label="תוכן ראשי" className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 hidden md:block" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} ניהול תקציב משפחתי. כל הזכויות שמורות.
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                🔒 הנתונים שלך מאובטחים ומוצפנים בטכנולוגיית SSL/TLS מתקדמת
              </p>
            </div>
            <div className="flex gap-6">
              <Link 
                to={createPageUrl('TermsOfService')} 
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                תנאי שימוש
              </Link>
              <Link 
                to={createPageUrl('PrivacyPolicy')} 
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                מדיניות פרטיות
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg" role="navigation" aria-label="תפריט ניווט תחתון">
        <div className="flex justify-around h-16 items-center">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <motion.div
                key={item.page}
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 17 }}
                className="flex-1 text-center"
              >
                <Link
                  to={createPageUrl(item.page)}
                  className={`
                    flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors
                    ${isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-500 hover:text-blue-500'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 mb-1" aria-hidden="true" />
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}