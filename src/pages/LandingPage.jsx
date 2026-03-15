import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Wallet, Sparkles, Users, CreditCard, PiggyBank, 
  Target, MessageCircle, Download, LineChart, ShieldCheck, 
  Globe, ArrowLeft, ArrowRight 
} from "lucide-react";
import LanguageToggle from '@/components/LanguageToggle';
import { useLocale } from '@/hooks/useLocale';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const { direction } = useLocale();
  const navigate = useNavigate();

  // לוגיקת זיהוי שפה אוטומטית
  useEffect(() => {
    const savedLanguage = localStorage.getItem('appLang');
    
    if (!savedLanguage) {
      const browserLang = navigator.language || navigator.userLanguage;
      const detectedLang = browserLang.startsWith('he') ? 'he' : 'en';
      
      if (i18n.language !== detectedLang) {
        i18n.changeLanguage(detectedLang);
      }
    }
  }, [i18n]);

  const features = t('landing_features', { returnObjects: true }) || [];

  const handleAuthClick = () => {
    base44.auth.redirectToLogin(`${window.location.origin}${createPageUrl('Dashboard')}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" dir={direction}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight italic text-indigo-600 dark:text-indigo-400">Controlyourmoney</span>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Button variant="ghost" className="font-bold" onClick={handleAuthClick}>
              {t('landing_login')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
              {t('landing_hero_title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {t('landing_hero_title2')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
              {t('landing_hero_p1')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button 
              size="lg" 
              className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
              onClick={handleAuthClick}
            >
              {isAuthenticated ? t('nav.Dashboard') : t('landing_hero_cta')}
              {direction === 'rtl' ? <ArrowLeft className="ms-2 w-5 h-5" /> : <ArrowRight className="ms-2 w-5 h-5" />}
            </Button>
          </motion.div>

          {/* Stats/Badges */}
          <div className="flex flex-wrap justify-center gap-6 pt-12">
            {[
              { icon: ShieldCheck, text: t('landing_stat_secure') },
              { icon: Sparkles, text: t('landing_stat_ai') },
              { icon: Globe, text: t('landing_stat_free') }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400">
                <stat.icon className="w-4 h-4 text-indigo-500" />
                {stat.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t('landing_features_title')}</h2>
            <p className="text-slate-500 font-medium text-lg">{t('landing_features_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = {
                Wallet, Sparkles, Users, CreditCard, PiggyBank, Target, MessageCircle, Download, LineChart
              }[feature.icon] || Wallet;

              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <IconComponent className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black">{t('landing_cta_title')}</h2>
            <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              {t('landing_cta_desc')}
            </p>
            <div className="inline-block pt-4">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-10 rounded-2xl font-black text-lg shadow-lg transition-transform hover:scale-105"
                onClick={handleAuthClick}
              >
                {isAuthenticated ? t('nav.Dashboard') : t('landing_cta_btn')}
              </Button>
            </div>
            <p className="text-indigo-200 text-sm font-medium pt-4 opacity-80">
              {t('landing_cta_security')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg italic text-indigo-600">Controlyourmoney</span>
          </div>
          <p className="text-slate-500 font-medium mb-8">
            {t('landing_footer_copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex justify-center gap-6">
            <Button variant="link" onClick={() => navigate('/privacy')} className="text-slate-400 hover:text-indigo-600 text-sm font-bold">{t('privacy')}</Button>
            <Button variant="link" onClick={() => navigate('/terms')} className="text-slate-400 hover:text-indigo-600 text-sm font-bold">{t('terms')}</Button>
            <Button variant="link" onClick={() => navigate('/guide')} className="text-slate-400 hover:text-indigo-600 text-sm font-bold">{t('nav.Guide')}</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}