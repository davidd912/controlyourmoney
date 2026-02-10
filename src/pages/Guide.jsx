import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen,
  Home,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  Users,
  Target,
  AlertCircle,
  Download,
  UserPlus,
  Award } from
"lucide-react";
import { motion } from "framer-motion";

export default function Guide() {
  return (
    <div dir="rtl" className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6 pb-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            מדריך למשתמש
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            כל מה שאתם צריכים לדעת על ניהול תקציב משפחתי חכם
          </p>
        </motion.div>

        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              על האפליקציה
            </CardTitle>
          </CardHeader>
          <CardContent className="text-right space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              אפליקציית ניהול התקציב המשפחתי נועדה לעזור לכם לקבל שליטה מלאה על המצב הכלכלי שלכם. 
              המערכת מאפשרת לכם לעקוב אחר הכנסות והוצאות, לנהל חובות ונכסים, ולקבל התראות חכמות 
              שיעזרו לכם לשפר את המצב הפיננסי שלכם.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              האפליקציה פועלת בשני מצבים עיקריים:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
              <li><strong>שיקוף מצב נוכחי</strong> - תיעוד ההכנסות וההוצאות בפועל</li>
              <li><strong>בניית תקציב</strong> - תכנון תקציב עתידי והגדרת יעדים</li>
            </ul>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">
          {/* משקי בית */}
          <AccordionItem value="households" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">משקי בית - ניהול משותף</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                  <Users className="w-4 h-4" />
                  מה זה משק בית?
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  משק בית הוא יחידה תקציבית משותפת. כאשר אתם יוצרים משק בית, אתם יכולים להזמין 
                  בן/בת זוג או שותפים אחרים לנהל את התקציב ביחד. כל הנתונים (הכנסות, הוצאות, חובות, נכסים) 
                  שייכים למשק הבית ונגישים לכל החברים.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">איך ליצור משק בית?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
                  <li>היכנסו לעמוד "משקי בית" דרך התפריט</li>
                  <li>לחצו על "צור משק בית חדש"</li>
                  <li>הזינו שם למשק הבית (לדוגמה: "משפחת כהן")</li>
                  <li>לחצו "צור משק בית"</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                  <UserPlus className="w-4 h-4" />
                  איך להזמין חברים למשק בית?
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
                  <li>בעמוד "משקי בית", בחרו את משק הבית הרצוי</li>
                  <li>בחלק "הזמן חבר חדש", הזינו את כתובת האימייל של השותף</li>
                  <li>לחצו "שלח הזמנה"</li>
                  <li>אם המשתמש עדיין לא רשום למערכת, הוא יקבל הזמנה להרשם</li>
                  <li>לאחר ההרשמה, השותף יראה את משק הבית המשותף בדשבורד שלו</li>
                </ol>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 טיפ:</strong> אם אתם חברים במספר משקי בית (למשל, תקציב משפחתי ותקציב עסקי), 
                  תוכלו לעבור ביניהם בדשבורד דרך התפריט הנפתח.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* הכנסות */}
          <AccordionItem value="income" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold">ניהול הכנסות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700 dark:text-gray-300">
                עקבו אחר כל מקורות ההכנסה החודשיים שלכם - משכורות, קצבאות, והכנסות נוספות.
              </p>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">קטגוריות הכנסה:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mr-4">
                  <li><strong>שכר</strong> - משכורת מעבודה</li>
                  <li><strong>קצבאות</strong> - קצבת זקנה, נכות, אבטלה וכד'</li>
                  <li><strong>הכנסות שונות</strong> - השכרת דירה, השקעות, הכנסות נוספות</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">איך להוסיף הכנסה?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
                  <li>בדשבורד, עברו ללשונית "הכנסות"</li>
                  <li>לחצו על "הוסף הכנסה"</li>
                  <li>בחרו קטגוריה ותת-קטגוריה</li>
                  <li>הזינו את הסכום החודשי</li>
                  <li>הוסיפו תיאור (אופציונלי)</li>
                  <li>לחצו "שמור"</li>
                </ol>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>💡 טיפ:</strong> השתמשו בתת-קטגוריות כדי לזהות במדויק את מקור ההכנסה 
                  (למשל: "משכורת - חברה X", "קצבת זקנה - ביטוח לאומי").
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* הוצאות */}
          <AccordionItem value="expenses" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold">ניהול הוצאות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700 dark:text-gray-300">
                תעדו את כל ההוצאות החודשיות שלכם בחלוקה לקטגוריות מפורטות.
              </p>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">קטגוריות הוצאות עיקריות:</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mr-4">
                  <li>🍽️ מזון ופארמה</li>
                  <li>🎭 פנאי ובילוי</li>
                  <li>👕 ביגוד והנעלה</li>
                  <li>🏠 תכולת בית</li>
                  <li>🔧 אחזקת בית</li>
                  <li>💇 טיפוח</li>
                  <li>📚 חינוך</li>
                  <li>🎉 אירועים ותרומות</li>
                  <li>⚕️ בריאות</li>
                  <li>🚗 תחבורה</li>
                  <li>👨‍👩‍👧 משפחה</li>
                  <li>📱 תקשורת</li>
                  <li>🏡 דיור</li>
                  <li>📋 התחייבויות</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">סולם עדיפויות:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                    <span className="font-semibold text-green-700 dark:text-green-300">1 - קל לצמצם</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">הוצאות שניתן בקלות לוותר עליהן</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                    <span className="font-semibold text-yellow-700 dark:text-yellow-300">2 - קשה אך אפשרי</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">הוצאות שדורשות מאמץ לצמצם</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                    <span className="font-semibold text-red-700 dark:text-red-300">3 - לא נוגעים</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">הוצאות חיוניות שאי אפשר לצמצם</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>💡 טיפ:</strong> הגדירו עדיפות נכונה לכל הוצאה - זה יעזור למערכת לזהות 
                  הזדמנויות לחיסכון ולהמליץ על אופטימיזציה של התקציב.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* חובות */}
          <AccordionItem value="debts" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold">ניהול חובות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700 dark:text-gray-300">
                נהלו את כל החובות שלכם במקום אחד - בנקים, כרטיסי אשראי, הלוואות ועוד.
              </p>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">סוגי חובות במערכת:</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mr-4">
                  <li>💳 כרטיס אשראי</li>
                  <li>🏦 בנק - הלוואה</li>
                  <li>🏦 משיכת יתר</li>
                  <li>🏠 פיגורי משכנתה</li>
                  <li>📋 ארנונה</li>
                  <li>💰 מע"ם</li>
                  <li>💼 מס הכנסה</li>
                  <li>👥 ביטוח לאומי</li>
                  <li>🤝 גמ"ח</li>
                  <li>👨‍👩‍👧 משפחה/חברים</li>
                  <li>⚖️ הוצאה לפועל</li>
                  <li>📄 אחר</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">מידע חשוב לתעד:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mr-4">
                  <li>שם הנושה (הגוף שלקחתם ממנו הלוואה)</li>
                  <li>סכום החוב המקורי</li>
                  <li>יתרת החוב הנוכחית</li>
                  <li>החזר חודשי</li>
                  <li>אחוז ריבית (אם רלוונטי)</li>
                  <li>האם החוב בהסדר</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>⚠️ חשוב:</strong> סמנו "בהסדר" רק אם החוב מוסדר רשמית עם הנושה. 
                  המערכת תזהה חובות לא מוסדרים ותתריע עליהם.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* נכסים */}
          <AccordionItem value="assets" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <PiggyBank className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">חסכונות ונכסים</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700 dark:text-gray-300">
                תעדו את כל הנכסים והחסכונות שלכם כדי לקבל תמונה מלאה על המצב הפיננסי.
              </p>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">סוגי נכסים:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mr-4">
                  <li><strong>חיסכון 1 וחיסכון 2</strong> - חשבונות חיסכון, פיקדונות</li>
                  <li><strong>נדל"ן למגורים</strong> - דירה או בית בבעלותכם</li>
                  <li><strong>נדל"ן להשקעה</strong> - נכס שמניב הכנסה</li>
                  <li><strong>רכב</strong> - רכב פרטי או מסחרי</li>
                  <li><strong>פנסיה</strong> - קרן פנסיה או גמל</li>
                  <li><strong>קרן השתלמות</strong> - קרן להשתלמות</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">מה לתעד?</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mr-4">
                  <li>שם הנכס או החיסכון</li>
                  <li>שווי נוכחי (ערך משוער)</li>
                  <li>הפקדה חודשית (אם רלוונטי)</li>
                  <li>הערות נוספות</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>💡 טיפ:</strong> עדכנו את שווי הנכסים באופן תקופתי (כל 6-12 חודשים) 
                  כדי לקבל תמונה מדויקת של המצב הפיננסי שלכם.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* תכנון AI */}
          <AccordionItem value="ai-planning" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-purple-600 dark:text-purple-400">✨</div>
                <span className="font-semibold">תכנון AI חכם</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700 dark:text-gray-300">
                כלי התכנון החכם משתמש בבינה מלאכותית כדי לספק לכם המלצות פיננסיות מותאמות אישית, 
                תחזיות עתידיות וניתוח תרחישים.
              </p>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">3 כלים עוצמתיים:</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="font-semibold text-sm mb-1 dark:text-white">💡 המלצות פיננסיות</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">המערכת מנתחת את התקציב שלכם ומציעה המלצות קונקרטיות לשיפור</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="font-semibold text-sm mb-1 dark:text-white">📈 תחזית פיננסית</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">תחזית חכמה להכנסות והוצאות ל-12 החודשים הקרובים</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="font-semibold text-sm mb-1 dark:text-white">🔮 ניתוח תרחישים</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">בדקו מראש מה יקרה אם תשנו הכנסות או הוצאות</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">איך להשתמש בהמלצות פיננסיות?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
                  <li>עברו לעמוד "תכנון AI" דרך התפריט</li>
                  <li>וודאו שיש לכם נתונים עדכניים של הכנסות והוצאות</li>
                  <li>לחצו על "צור המלצות חכמות"</li>
                  <li>המערכת תנתח את המצב ותציע המלצות מותאמות אישית</li>
                  <li>כל המלצה כוללת הסבר ופעולות מומלצות</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">איך להשתמש בתחזית פיננסית?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
                  <li>בעמוד "תכנון AI", עברו ללשונית "תחזית עתידית"</li>
                  <li>לחצו על "צור תחזית"</li>
                  <li>המערכת תנתח את ההכנסות וההוצאות ההיסטוריות שלכם</li>
                  <li>תקבלו תחזית חודשית ל-12 חודשים קדימה</li>
                  <li>התחזית כוללת הכנסות צפויות, הוצאות צפויות ויתרה חודשית</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">איך להשתמש בניתוח תרחישים?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
                  <li>בעמוד "תכנון AI", עברו ללשונית "ניתוח תרחישים"</li>
                  <li>הזינו שינוי צפוי (למשל: "העלאת שכר של 2000 ש״ח")</li>
                  <li>לחצו על "נתח תרחיש"</li>
                  <li>המערכת תראה לכם את ההשפעה על התקציב החודשי והשנתי</li>
                  <li>השתמשו בכך לקבלת החלטות מושכלות לפני שינויים גדולים</li>
                </ol>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>💡 טיפ:</strong> ככל שיש יותר נתונים היסטוריים במערכת (לפחות 2-3 חודשים), 
                  כך התחזיות וההמלצות יהיו מדויקות ורלוונטיות יותר. עדכנו באופן קבוע!
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ חשוב לזכור:</strong> המלצות ה-AI הן כלי עזר בלבד. השתמשו בשיקול דעת אישי 
                  ובהתייעצות עם יועץ פיננסי מוסמך לפני קבלת החלטות פיננסיות משמעותיות.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* התראות חכמות */}
          <AccordionItem value="alerts" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold">התראות חכמות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700 dark:text-gray-300">
                המערכת מנתחת את הנתונים שלכם באופן חכם ומתריעה על בעיות, סיכונים והזדמנויות.
              </p>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">סוגי התראות:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 border dark:border-gray-700 rounded-lg">
                    <span className="text-lg">🔴</span>
                    <div>
                      <p className="font-semibold text-sm dark:text-white">חריגת תקציב</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">התראה כאשר ההוצאות עולות על ההכנסות</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 border dark:border-gray-700 rounded-lg">
                    <span className="text-lg">🟡</span>
                    <div>
                      <p className="font-semibold text-sm dark:text-white">הוצאה גבוהה</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">זיהוי הוצאות גבוהות מהרגיל בקטגוריות ספציפיות</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 border dark:border-gray-700 rounded-lg">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="font-semibold text-sm dark:text-white">תזכורת חוב</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">תזכורות על חובות לא מוסדרים ותשלומים</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 border dark:border-gray-700 rounded-lg">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="font-semibold text-sm dark:text-white">הזדמנות לחיסכון</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">המלצות קונקרטיות לחיסכון בהתבסס על הנתונים</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">איך להשתמש בהתראות?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
                  <li>לחצו על "רענן התראות" בלשונית הסקירה הכללית</li>
                  <li>המערכת תנתח את הנתונים שלכם בעזרת בינה מלאכותית</li>
                  <li>קיבלתם התראה? קראו את ההמלצה בקפידה</li>
                  <li>סמנו התראות כ"נקרא" או "בוטל" לניהול נוח</li>
                </ol>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>💡 טיפ:</strong> רעננו את ההתראות באופן קבוע (פעם בשבוע או בחודש) 
                  כדי לקבל תובנות עדכניות על המצב הפיננסי שלכם.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ייצוא נתונים */}
          <AccordionItem value="export" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold">ייצוא נתונים</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700 dark:text-gray-300">
                ייצאו את הנתונים שלכם לקובץ CSV (Excel) לצורך גיבוי או עיבוד נוסף.
              </p>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">אפשרויות ייצוא:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mr-4">
                  <li><strong>ייצוא לפי לשונית</strong> - כל לשונית (הכנסות, הוצאות, חובות, נכסים) כוללת כפתור "ייצא ל-CSV"</li>
                  <li><strong>ייצוא מלא</strong> - בראש הדשבורד, כפתור "ייצא הכל ל-CSV" מייצא את כל הנתונים לקובץ אחד</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">למה לייצא נתונים?</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mr-4">
                  <li>גיבוי של המידע שלכם</li>
                  <li>עיבוד נוסף באקסל או Google Sheets</li>
                  <li>שיתוף עם יועץ פיננסי</li>
                  <li>הכנת דוחות ומצגות</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>💡 טיפ:</strong> קובצי ה-CSV שנוצרים תומכים בעברית באקסל. 
                  אם אתם רואים תווים משובשים, פתחו את הקובץ דרך "נתונים" → "מטקסט/CSV" באקסל.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* הטבות וזכויות */}
          <AccordionItem value="benefits" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline dark:text-white">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold">הטבות וזכויות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700 dark:text-gray-300">
                בדקו אילו הטבות וזכויות סוציאליות מגיעות לכם ממשרדי הממשלה השונים.
              </p>

              <div>
                <h4 className="font-semibold mb-2 dark:text-white">איך להשתמש בכלי?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mr-4">
                  <li>עברו לעמוד "הטבות וזכויות" דרך התפריט</li>
                  <li>מלאו את הטופס עם הפרטים האישיים שלכם</li>
                  <li>לחצו על "בדוק זכאות"</li>
                  <li>קבלו רשימה מפורטת של הטבות שעשויות להתאים לכם</li>
                  <li>לכל הטבה יש קישור למידע נוסף ולאופן ההגשה</li>
                </ol>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                  <strong>💡 טיפ:</strong> בדקו זכאות באופן תקופתי - זכויות והטבות משתנות 
                  ועשויות להיות רלוונטיות למצב החדש שלכם.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* עצות כלליות */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              💡 עצות לניהול תקציב מוצלח
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-right">
            <div className="flex items-start gap-2">
              <span className="text-lg">1️⃣</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>עדכנו באופן קבוע</strong> - תעדו הכנסות והוצאות באופן שוטף, לפחות פעם בשבוע
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">2️⃣</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>היו מדויקים</strong> - ככל שהנתונים מדויקים יותר, כך ההתראות וההמלצות יהיו טובות יותר
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">3️⃣</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>השתמשו בשני המצבים</strong> - שקפו את המצב הנוכחי, ובנו תקציב עתידי להשוואה
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">4️⃣</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>הגדירו יעדים</strong> - בנו תקציב עם יעדי חיסכון ברורים והשוו למצב הנוכחי
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">5️⃣</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>עקבו אחר ההתראות</strong> - למדו מההתראות החכמות ושפרו את הרגלי הצריכה שלכם
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}