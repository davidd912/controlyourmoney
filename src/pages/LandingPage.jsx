import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from '@/api/base44Client';
import {
  Wallet,
  LineChart,
  Sparkles,
  Users,
  Download,
  MessageCircle,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Moon,
  Sun
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || false;
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleLogin = async () => {
    try {
      // First check if already authenticated
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        window.location.href = '/';
        return;
      }
      // Trigger login redirect
      base44.auth.redirectToLogin(window.location.origin);
    } catch (error) {
      console.error('Login error:', error);
      // Fallback: force redirect to login
      window.location.href = '/api/auth/login?redirect=' + encodeURIComponent(window.location.origin);
    }
  };

  const features = [
    {
      icon: Wallet,
      title: "מעקב פיננסי מקיף",
      description: "עקוב אחר הכנסות, הוצאות, חובות וחסכונות במקום אחד. צפייה ברורה ומסודרת של כל התנועות הכספיות שלך."
    },
    {
      icon: Sparkles,
      title: "תקציב חכם ותובנות AI",
      description: "הגדר תקציבים מותאמים אישית לכל קטגוריה, קבל התראות אוטומטיות על חריגות והמלצות AI מתקדמות לחיסכון."
    },
    {
      icon: Users,
      title: "ניהול משק בית שיתופי",
      description: "נהל את התקציב המשפחתי יחד עם שותפים. שתף גישה, צפייה ועדכונים בזמן אמת לכל חברי המשק."
    },
    {
      icon: CreditCard,
      title: "ניהול חובות מתקדם",
      description: "עקוב אחר כל החובות, החזרים חודשיים, תאריכי פירעון וסטטוס הסדרים. שליטה מלאה על ההתחייבויות הכספיות."
    },
    {
      icon: PiggyBank,
      title: "מעקב נכסים וחסכונות",
      description: "רשום את כל הנכסים שלך - חסכונות, קרנות, רכוש ועוד. עקוב אחר הפקדות שוטפות והשווי המעודכן."
    },
    {
      icon: Target,
      title: "תכנון יעדים פיננסיים",
      description: "הגדר יעדים כספיים לטווח קצר וארוך, עקוב אחר ההתקדמות וקבל המלצות להשגתם מהר יותר."
    },
    {
      icon: MessageCircle,
      title: "ניהול דרך WhatsApp",
      description: "רשום הוצאות והכנסות במהירות ובנוחות ישירות דרך WhatsApp. אין צורך להיכנס לאפליקציה בכל פעם."
    },
    {
      icon: Download,
      title: "דוחות וייצוא נתונים",
      description: "ייצא את כל הנתונים הפיננסיים שלך בפורמט CSV לניתוח מעמיק או לשיתוף עם יועצים פיננסיים."
    },
    {
      icon: LineChart,
      title: "ניתוח מגמות וסטטיסטיקות",
      description: "גרפים ותרשימים מתקדמים שמציגים את ההתפתחות הפיננסית שלך לאורך זמן ומאפשרים קבלת החלטות מושכלת."
    }
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                controlyourmoney
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="text-gray-600 dark:text-gray-300"
                aria-label={darkMode ? "מצב בהיר" : "מצב כהה"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button onClick={handleLogin} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                התחברות
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                ניהול פיננסי חכם
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  למשק הבית שלך
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                קח שליטה מלאה על הכסף שלך עם הפלטפורמה המקיפה ביותר. 
                עקוב אחר הכנסות והוצאות, נהל חובות ונכסים, הגדר תקציבים חכמים 
                וקבל תובנות מבוססות AI – הכל במקום אחד.
              </p>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-8 italic" lang="en">
                controlyourmoney is a comprehensive household budget management platform that helps you track income, expenses, debts, and assets. Set smart budgets, get AI-powered insights, and take full control of your family finances in one secure place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLogin}
                  size="lg" 
                  className="text-lg h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="w-5 h-5 ml-2" />
                  התחל לנהל את הכסף שלך עכשיו
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">חינם לשימוש</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">🔒</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">מאובטח ומוצפן</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">AI</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">תובנות חכמות</div>
                </div>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Main Card */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-2 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-2xl">סיכום חודשי</CardTitle>
                    <CardDescription>פברואר 2026</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Income */}
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">הכנסות</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">₪15,000</div>
                        </div>
                      </div>
                    </div>

                    {/* Expenses */}
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                          <TrendingDown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">הוצאות</div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">₪12,500</div>
                        </div>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">יתרה</div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₪2,500</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="absolute -top-4 -left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-xl font-bold"
                >
                  <Sparkles className="w-5 h-5 inline-block ml-2" />
                  מופעל ע"י AI
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              הכלים שאתה צריך
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              כל מה שצריך לניהול פיננסי מושלם, באפליקציה אחת פשוטה ונוחה
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                  <CardHeader>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl"
          >
            <Shield className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              מוכן להתחיל?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              הצטרף עכשיו והתחל לשלוט בכסף שלך בצורה חכמה יותר
            </p>
            <Button
              onClick={handleLogin}
              size="lg"
              className="text-lg h-14 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              התחל עכשיו - חינם לחלוטין
            </Button>
            <p className="text-sm text-blue-100 mt-4">
              🔒 הנתונים שלך מאובטחים ומוצפנים בטכנולוגיית SSL/TLS מתקדמת
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">controlyourmoney</span>
              </div>
              <p className="text-gray-400 mb-3">
                הפלטפורמה המקיפה ביותר לניהול פיננסי חכם של משק הבית
              </p>
              <p className="text-xs text-gray-500" lang="en">
                controlyourmoney - Smart household budget management platform
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">קישורים מהירים</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">אודות</a></li>
                <li><a href="#" className="hover:text-white transition-colors">תמיכה</a></li>
                <li><a href="#" className="hover:text-white transition-colors">בלוג</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">משפטי</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/TermsOfService" className="hover:text-white transition-colors">תנאי שימוש</a></li>
                <li><a href="/PrivacyPolicy" className="hover:text-white transition-colors">מדיניות פרטיות</a></li>
                <li><a href="/AccessibilityStatement" className="hover:text-white transition-colors">הצהרת נגישות</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} ניהול תקציב משפחתי. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}