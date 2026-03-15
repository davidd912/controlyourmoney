import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Home, TrendingUp, TrendingDown, CreditCard, PiggyBank, Users, Target, AlertCircle, Download, UserPlus, Award, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

export default function Guide() {
  const { t, i18n } = useTranslation();
  const isHe = i18n.language === 'he';

  const content = isHe ? {
    page_title: 'מדריך למשתמש',
    page_subtitle: 'כל מה שצריך לדעת כדי לנהל את התקציב המשפחתי בחכמה',
    about_section: 'על האפליקציה',
    about_p1: 'Controlyourmoney היא מערכת לניהול תקציב משפחתי המאפשרת לך לעקוב אחר הכנסות, הוצאות, חובות ונכסים במקום אחד.',
    about_p2: 'האפליקציה פועלת בשני מצבים:',
    mode_current: 'מצב נוכחי', mode_current_desc: 'מה שבאמת הוצאת/הכנסת החודש',
    mode_budget: 'מצב תקציב', mode_budget_desc: 'כמה תכננת להוציא/להכניס',

    hh_section: 'משק בית',
    hh_desc: 'משק בית הוא היחידה הבסיסית במערכת. כל ההכנסות, ההוצאות והחובות שייכים למשק בית ספציפי.',
    hh_create_title: 'יצירת משק בית',
    hh_create_steps: ['היכנס לדשבורד', 'אם אין לך משק בית, תופיע אשף יצירה אוטומטית', 'הזן שם למשק הבית (לדוגמה: "משפחת ישראלי")', 'לחץ על "יצירה וסיום"'],
    hh_invite_title: 'הזמנת חברים למשק',
    hh_invite_steps: ['לך ל"משתמשים" בתפריט', 'לחץ על "הזמן חבר"', 'הזן את כתובת האימייל', 'החבר יקבל הזמנה ויוכל להצטרף'],
    hh_tip: '💡 ניתן לנהל מספר משקי בית - לדוגמה: "הבית" ו"העסק"',

    income_section: 'הכנסות',
    income_desc: 'רשום את כל מקורות ההכנסה שלך: משכורות, קצבאות, שכר דירה ועוד.',
    income_cats: [
      { title: 'שכר', desc: 'משכורות ממעסיק' },
      { title: 'קצבאות', desc: 'ביטוח לאומי, ילדים, נכות וכו\'' },
      { title: 'הכנסות שונות', desc: 'שכר דירה, ריבית, מתנות ועוד' },
    ],
    income_add_steps: ['לחץ על "הוסף הכנסה" בדשבורד', 'בחר קטגוריה', 'הזן סכום ותיאור', 'סמן "הכנסה קבועה" אם חוזרת כל חודש', 'לחץ שמור'],
    income_tip: '💡 הכנסות קבועות (כמו משכורת) יועתקו אוטומטית לכל שאר חודשי השנה.',

    expenses_section: 'הוצאות',
    expenses_desc: 'תעד את כל ההוצאות שלך לפי קטגוריות. זה עוזר לזהות לאן הולך הכסף.',
    expense_cats: ['מזון ופארמה', 'פנאי ובילוי', 'ביגוד והנעלה', 'תכולת בית', 'אחזקת בית', 'טיפוח', 'חינוך', 'אירועים ותרומות', 'בריאות', 'תחבורה', 'משפחה', 'תקשורת', 'דיור', 'התחייבויות', 'נכסים', 'פיננסים'],
    priority_title: 'עדיפות לצמצום',
    priority_1: '🟢 קל לצמצם', priority_1_desc: 'הוצאות שניתן לבטל בקלות',
    priority_2: '🟡 קשה אך אפשרי', priority_2_desc: 'הוצאות שניתן לצמצם במאמץ',
    priority_3: '🔴 לא נוגעים', priority_3_desc: 'הוצאות הכרחיות',
    expenses_tip: '💡 השתמש בעדיפות לצמצום כדי לדעת היכן להתחיל כשצריך לחסוך.',

    debts_section: 'חובות',
    debts_desc: 'נהל את כל החובות שלך: הלוואות, כרטיסי אשראי, ביטוח לאומי ועוד.',
    debt_types: ['גמ"ח', 'חברים', 'בנק - הלוואה', 'ארנונה', 'כרטיס אשראי', 'משכנתה - פיגורים', 'ביטוח לאומי', 'מס הכנסה', 'הוצאה לפועל', 'מזונות'],
    debt_info: ['סכום החוב הכולל', 'תאריך נכון ל-', 'אחוז ריבית', 'תשלומים נותרים', 'החזר חודשי', 'האם החוב בהסדר'],
    debt_warning: '⚠️ כאשר מוסיפים הוצאה בקטגוריית "התחייבויות" עם שם הנושה, הסכום מופחת אוטומטית מיתרת החוב.',

    assets_section: 'נכסים וחסכונות',
    assets_desc: 'תעד את כל הנכסים שלך: חסכונות, קרנות, נכסי נדל"ן, כלי רכב ועוד.',
    asset_types: ['חסכונות (סוג 1 ו-2)', 'נכס מגורים', 'נכס להשקעה', 'רכב', 'פנסיה', 'קרן השתלמות', 'אחר'],
    asset_record: ['שם הנכס', 'הפקדה חודשית', 'שווי נוכחי', 'תאריך הערכה', 'הערות'],
    assets_tip: '💡 עדכן את שווי הנכסים מדי פעם כדי לקבל תמונה עדכנית של ההון העצמי שלך.',

    ai_section: 'תכנון AI',
    ai_desc: 'הכלי לתכנון AI מנתח את הנתונים שלך ומספק המלצות מותאמות אישית.',
    ai_tools: [
      { title: 'המלצות מותאמות', desc: 'מנתח את דפוסי ההוצאות שלך ומציע דרכים לחסוך', color: 'purple' },
      { title: 'תחזית עתידית', desc: 'מחשב תחזית להכנסות והוצאות ל-12 חודשים קדימה', color: 'blue' },
      { title: 'תרחישי "מה אם"', desc: 'בדוק מה יקרה אם השכר יעלה/ירד, או אם תוסיף הוצאה', color: 'green' },
      { title: 'יעדים פיננסיים', desc: 'הגדר מטרות חיסכון ועקוב אחר ההתקדמות', color: 'orange' },
    ],
    ai_tip: '💡 ככל שיש יותר נתונים במערכת, כך ההמלצות יהיו מדויקות יותר.',
    ai_warning: '⚠️ ההמלצות מבוססות על נתונים היסטוריים ואינן מהוות ייעוץ פיננסי מקצועי.',

    alerts_section: 'התראות חכמות',
    alerts_desc: 'המערכת מייצרת התראות אוטומטיות כשמזוהים דפוסים חריגים.',
    alert_types: [
      { icon: '🚨', title: 'חריגה מתקציב', desc: 'כאשר הוצאות בקטגוריה עוברות את התקציב שהוגדר' },
      { icon: '💰', title: 'הוצאה גבוהה', desc: 'כאשר רושמים הוצאה חריגה לעומת הממוצע' },
      { icon: '📅', title: 'תזכורת חוב', desc: 'תזכורות לתשלומי חובות קרובים' },
      { icon: '✨', title: 'הזדמנות לחיסכון', desc: 'כאשר מזוהה פוטנציאל לצמצום הוצאות' },
    ],
    alerts_steps: ['לך לטאב "סקירה" בדשבורד', 'גלול מטה לאזור "התראות חכמות"', 'לחץ "נתח מחדש" לעדכון', 'קרא את ההמלצות ופעל לפיהן'],
    alerts_tip: '💡 ניתן לסמן התראות כנקראו או לדחות אותן.',

    export_section: 'ייצוא נתונים',
    export_desc: 'ניתן לייצא את הנתונים הפיננסיים שלך לקובץ CSV.',
    export_steps: ['לך לדשבורד', 'לחץ על כפתור ייצוא', 'בחר את הנתונים לייצוא', 'הקובץ יורד אוטומטית'],
    export_tip: '💡 ניתן לפתוח קבצי CSV ב-Excel או Google Sheets לניתוח נוסף.',

    whatsapp_section: 'חיבור WhatsApp / Telegram',
    whatsapp_desc: 'חבר את האפליקציה ל-WhatsApp או Telegram כדי לרשום הוצאות בקלות מכל מקום.',
    whatsapp_connect_steps: ['לחץ על כפתור WhatsApp או Telegram בדשבורד', 'תועבר לשיחה עם הבוט', 'שלח את קוד ההפעלה שמופיע', 'הבוט ישלח אישור חיבור'],
    whatsapp_commands: [
      { title: 'רישום הוצאה', ex: '"שילמתי 50 ש"ח על בנזין"', desc: 'הבוט יזהה אוטומטית ויוסיף להוצאות' },
      { title: 'רישום הכנסה', ex: '"קיבלתי משכורת 8000"', desc: 'הבוט יזהה ויוסיף להכנסות' },
      { title: 'סטטוס חודשי', ex: '"כמה הוצאתי החודש?"', desc: 'הבוט יענה עם סיכום' },
    ],
    whatsapp_tip: '💡 הבוט מבין עברית טבעית - פשוט כתוב מה קרה ויטפל בשאר.',

    benefits_section: 'הטבות וזכויות',
    benefits_desc: 'גלה הטבות וזכויות שמגיעות לך - דיור, תעסוקה, ביטוח לאומי ועוד.',
    benefits_steps: ['לחץ על "הטבות וזכויות" בתפריט', 'עיין בקטגוריות השונות', 'השתמש בחיפוש למציאת הטבה ספציפית', 'לחץ על פריט לפרטים נוספים'],
    benefits_tip: '💡 חזור לדף ההטבות מדי פעם - אנחנו מעדכנים את הרשימה באופן שוטף.',

    tips_section: 'טיפים כלליים',
    tips: [
      { icon: '📅', title: 'עדכון חודשי', desc: 'הקדש 15 דקות בתחילת כל חודש לעדכון הנתונים.' },
      { icon: '📊', title: 'עקוב אחר המגמות', desc: 'השתמש בגרפים לזיהוי תבניות בהוצאות שלך.' },
      { icon: '🎯', title: 'הגדר יעדים', desc: 'יעדים ברורים עוזרים להישאר ממוקד.' },
      { icon: '👨‍👩‍👧', title: 'שתף את המשפחה', desc: 'הזמן בן/בת זוג לניהול משותף של התקציב.' },
      { icon: '🤖', title: 'נצל את ה-AI', desc: 'קבל המלצות מותאמות אישית מהמנוע החכם.' },
    ],
  } : {
    page_title: 'User Guide',
    page_subtitle: 'Everything you need to know to manage your family budget wisely',
    about_section: 'About the App',
    about_p1: 'Controlyourmoney is a family budget management system that lets you track income, expenses, debts and assets in one place.',
    about_p2: 'The app works in two modes:',
    mode_current: 'Current Mode', mode_current_desc: 'What you actually spent/earned this month',
    mode_budget: 'Budget Mode', mode_budget_desc: 'How much you planned to spend/earn',

    hh_section: 'Household',
    hh_desc: 'A household is the basic unit in the system. All income, expenses and debts belong to a specific household.',
    hh_create_title: 'Creating a Household',
    hh_create_steps: ['Go to the Dashboard', 'If you have no household, a creation wizard will appear', 'Enter a name for the household (e.g. "Smith Family")', 'Click "Create & Finish"'],
    hh_invite_title: 'Inviting Members',
    hh_invite_steps: ['Go to "Users" in the menu', 'Click "Invite Member"', 'Enter the email address', 'The member will receive an invitation to join'],
    hh_tip: '💡 You can manage multiple households - e.g. "Home" and "Business"',

    income_section: 'Income',
    income_desc: 'Record all your income sources: salaries, allowances, rent and more.',
    income_cats: [
      { title: 'Salary', desc: 'Wages from employer' },
      { title: 'Allowances', desc: 'National insurance, children, disability etc.' },
      { title: 'Other Income', desc: 'Rent, interest, gifts and more' },
    ],
    income_add_steps: ['Click "Add Income" on the dashboard', 'Select a category', 'Enter amount and description', 'Check "Recurring Income" if it repeats monthly', 'Click Save'],
    income_tip: '💡 Recurring income (like salary) will be automatically copied to the rest of the year.',

    expenses_section: 'Expenses',
    expenses_desc: 'Record all your expenses by category. This helps identify where your money goes.',
    expense_cats: ['Food & Pharmacy', 'Leisure', 'Clothing', 'Household Items', 'Home Maintenance', 'Grooming', 'Education', 'Events & Donations', 'Health', 'Transportation', 'Family', 'Communication', 'Housing', 'Obligations', 'Assets', 'Finance'],
    priority_title: 'Reduction Priority',
    priority_1: '🟢 Easy to cut', priority_1_desc: 'Expenses that can be easily cancelled',
    priority_2: '🟡 Difficult but possible', priority_2_desc: 'Expenses that can be reduced with effort',
    priority_3: '🔴 Don\'t touch', priority_3_desc: 'Essential expenses',
    expenses_tip: '💡 Use reduction priority to know where to start when you need to save.',

    debts_section: 'Debts',
    debts_desc: 'Manage all your debts: loans, credit cards, national insurance and more.',
    debt_types: ['Gmach', 'Friends', 'Bank Loan', 'Property Tax', 'Credit Card', 'Mortgage Arrears', 'National Insurance', 'Income Tax', 'Execution', 'Alimony'],
    debt_info: ['Total debt amount', 'As of date', 'Interest rate', 'Remaining payments', 'Monthly payment', 'Whether debt is in arrangement'],
    debt_warning: '⚠️ When adding an expense in the "Obligations" category with the creditor\'s name, the amount is automatically deducted from the debt balance.',

    assets_section: 'Assets & Savings',
    assets_desc: 'Record all your assets: savings, funds, real estate, vehicles and more.',
    asset_types: ['Savings (type 1 & 2)', 'Residential property', 'Investment property', 'Vehicle', 'Pension', 'Study fund', 'Other'],
    asset_record: ['Asset name', 'Monthly deposit', 'Current value', 'Valuation date', 'Notes'],
    assets_tip: '💡 Update asset values periodically to get an up-to-date picture of your net worth.',

    ai_section: 'AI Planning',
    ai_desc: 'The AI planning tool analyzes your data and provides personalized recommendations.',
    ai_tools: [
      { title: 'Custom Recommendations', desc: 'Analyzes your spending patterns and suggests ways to save', color: 'purple' },
      { title: 'Future Forecast', desc: 'Calculates a forecast for income and expenses 12 months ahead', color: 'blue' },
      { title: '"What If" Scenarios', desc: 'Check what happens if income changes or you add an expense', color: 'green' },
      { title: 'Financial Goals', desc: 'Set savings goals and track progress', color: 'orange' },
    ],
    ai_tip: '💡 The more data in the system, the more accurate the recommendations will be.',
    ai_warning: '⚠️ Recommendations are based on historical data and do not constitute professional financial advice.',

    alerts_section: 'Smart Alerts',
    alerts_desc: 'The system automatically generates alerts when unusual patterns are detected.',
    alert_types: [
      { icon: '🚨', title: 'Budget Exceeded', desc: 'When spending in a category exceeds the set budget' },
      { icon: '💰', title: 'High Expense', desc: 'When an unusual expense is recorded compared to average' },
      { icon: '📅', title: 'Debt Reminder', desc: 'Reminders for upcoming debt payments' },
      { icon: '✨', title: 'Savings Opportunity', desc: 'When potential for expense reduction is identified' },
    ],
    alerts_steps: ['Go to the "Overview" tab on the dashboard', 'Scroll down to the "Smart Alerts" area', 'Click "Re-analyze" to refresh', 'Read the recommendations and act on them'],
    alerts_tip: '💡 You can mark alerts as read or dismiss them.',

    export_section: 'Data Export',
    export_desc: 'You can export your financial data to a CSV file.',
    export_steps: ['Go to the Dashboard', 'Click the export button', 'Choose the data to export', 'The file downloads automatically'],
    export_tip: '💡 CSV files can be opened in Excel or Google Sheets for further analysis.',

    whatsapp_section: 'WhatsApp / Telegram',
    whatsapp_desc: 'Connect the app to WhatsApp or Telegram to easily record expenses from anywhere.',
    whatsapp_connect_steps: ['Click the WhatsApp or Telegram button on the dashboard', 'You will be directed to a chat with the bot', 'Send the activation code shown', 'The bot will send a connection confirmation'],
    whatsapp_commands: [
      { title: 'Record Expense', ex: '"Paid $50 for gas"', desc: 'The bot will automatically identify and add to expenses' },
      { title: 'Record Income', ex: '"Got salary 8000"', desc: 'The bot will identify and add to income' },
      { title: 'Monthly Status', ex: '"How much did I spend this month?"', desc: 'The bot will reply with a summary' },
    ],
    whatsapp_tip: '💡 The bot understands natural language - just write what happened and it handles the rest.',

    benefits_section: 'Benefits & Rights',
    benefits_desc: 'Discover benefits and rights available to you - housing, employment, national insurance and more.',
    benefits_steps: ['Click "Benefits & Rights" in the menu', 'Browse the different categories', 'Use search to find a specific benefit', 'Click an item for more details'],
    benefits_tip: '💡 Check back periodically - we update the list regularly.',

    tips_section: 'General Tips',
    tips: [
      { icon: '📅', title: 'Monthly Update', desc: 'Spend 15 minutes at the start of each month updating your data.' },
      { icon: '📊', title: 'Track Trends', desc: 'Use charts to identify patterns in your spending.' },
      { icon: '🎯', title: 'Set Goals', desc: 'Clear goals help you stay focused.' },
      { icon: '👨‍👩‍👧', title: 'Share with Family', desc: 'Invite your partner for joint budget management.' },
      { icon: '🤖', title: 'Use AI', desc: 'Get personalized recommendations from the smart engine.' },
    ],
  };

  const c = content;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6 pb-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {c.page_title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{c.page_subtitle}</p>
        </motion.div>

        {/* About */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {c.about_section}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-start space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{c.about_p1}</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{c.about_p2}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
              <li><strong>{c.mode_current}</strong> - {c.mode_current_desc}</li>
              <li><strong>{c.mode_budget}</strong> - {c.mode_budget_desc}</li>
            </ul>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">

          {/* Households */}
          <AccordionItem value="households" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">{c.hh_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.hh_desc}</p>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white"><Users className="w-4 h-4" />{c.hh_create_title}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {c.hh_create_steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white"><UserPlus className="w-4 h-4" />{c.hh_invite_title}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {c.hh_invite_steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">{c.hh_tip}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Income */}
          <AccordionItem value="income" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold">{c.income_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.income_desc}</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                {c.income_cats.map((cat, i) => <li key={i}><strong>{cat.title}</strong> - {cat.desc}</li>)}
              </ul>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{isHe ? 'איך מוסיפים הכנסה?' : 'How to add income?'}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {c.income_add_steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">{c.income_tip}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Expenses */}
          <AccordionItem value="expenses" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold">{c.expenses_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.expenses_desc}</p>
              <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 ps-4">
                {c.expense_cats.map((cat, i) => <li key={i}>• {cat}</li>)}
              </ul>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{c.priority_title}</h4>
                <div className="space-y-2">
                  {[
                    { label: c.priority_1, desc: c.priority_1_desc, bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300' },
                    { label: c.priority_2, desc: c.priority_2_desc, bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-300' },
                    { label: c.priority_3, desc: c.priority_3_desc, bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-300' },
                  ].map((p, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 ${p.bg} rounded`}>
                      <span className={`font-semibold ${p.text}`}>{p.label}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">{c.expenses_tip}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Debts */}
          <AccordionItem value="debts" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold">{c.debts_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.debts_desc}</p>
              <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 ps-4">
                {c.debt_types.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{isHe ? 'מה ניתן לתעד?' : 'What can be recorded?'}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                  {c.debt_info.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{c.debt_warning}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Assets */}
          <AccordionItem value="assets" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <PiggyBank className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">{c.assets_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.assets_desc}</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                {c.asset_types.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">{c.assets_tip}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* AI Planning */}
          <AccordionItem value="ai-planning" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <span className="text-xl">✨</span>
                <span className="font-semibold">{c.ai_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.ai_desc}</p>
              <div className="space-y-3">
                {c.ai_tools.map((tool, i) => (
                  <div key={i} className={`p-3 bg-${tool.color}-50 dark:bg-${tool.color}-950 rounded-lg`}>
                    <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{tool.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{tool.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">{c.ai_tip}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{c.ai_warning}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Alerts */}
          <AccordionItem value="alerts" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold">{c.alerts_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.alerts_desc}</p>
              <div className="space-y-2">
                {c.alert_types.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 border dark:border-gray-700 rounded-lg">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                {c.alerts_steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{c.alerts_tip}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Export */}
          <AccordionItem value="export" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold">{c.export_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.export_desc}</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                {c.export_steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">{c.export_tip}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* WhatsApp */}
          <AccordionItem value="whatsapp" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold">{c.whatsapp_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.whatsapp_desc}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{isHe ? 'איך מתחברים?' : 'How to connect?'}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {c.whatsapp_connect_steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="space-y-3">
                {c.whatsapp_commands.map((cmd, i) => (
                  <div key={i} className="p-3 border dark:border-gray-700 rounded-lg">
                    <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{cmd.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">"{cmd.ex}"</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{cmd.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">{c.whatsapp_tip}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Benefits */}
          <AccordionItem value="benefits" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold">{c.benefits_section}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{c.benefits_desc}</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                {c.benefits_steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
                <p className="text-sm text-indigo-800 dark:text-indigo-200">{c.benefits_tip}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* General Tips */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              💡 {c.tips_section}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-start">
            {c.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg">{tip.icon}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>{tip.title}</strong> - {tip.desc}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}