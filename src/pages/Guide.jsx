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
  Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function Guide() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            מדריך למשתמש
          </h1>
          <p className="text-gray-500">
            כל מה שאתם צריכים לדעת על ניהול תקציב משפחתי חכם
          </p>
        </motion.div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              על האפליקציה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-right">
            <p className="text-gray-700 leading-relaxed">
              אפליקציית ניהול התקציב המשפחתי נועדה לעזור לכם לקבל שליטה מלאה על המצב הכלכלי שלכם. 
              המערכת מאפשרת לכם לעקוב אחר הכנסות והוצאות, לנהל חובות ונכסים, ולקבל התראות חכמות 
              שיעזרו לכם לשפר את המצב הפיננסי שלכם.
            </p>
            <p className="text-gray-700 leading-relaxed">
              האפליקציה פועלת בשני מצבים עיקריים:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              <li><strong>שיקוף מצב נוכחי</strong> - תיעוד ההכנסות וההוצאות בפועל</li>
              <li><strong>בניית תקציב</strong> - תכנון תקציב עתידי והגדרת יעדים</li>
            </ul>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">
          {/* משקי בית */}
          <AccordionItem value="households" className="bg-white rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">משקי בית - ניהול משותף</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  מה זה משק בית?
                </h4>
                <p className="text-gray-700 mb-4">
                  משק בית הוא יחידה תקציבית משותפת. כאשר אתם יוצרים משק בית, אתם יכולים להזמין 
                  בן/בת זוג או שותפים אחרים לנהל את התקציב ביחד. כל הנתונים (הכנסות, הוצאות, חובות, נכסים) 
                  שייכים למשק הבית ונגישים לכל החברים.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">איך ליצור משק בית?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mr-4">
                  <li>היכנסו לעמוד "משקי בית" דרך התפריט</li>
                  <li>לחצו על "צור משק בית חדש"</li>
                  <li>הזינו שם למשק הבית (לדוגמה: "משפחת כהן")</li>
                  <li>לחצו "צור משק בית"</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  איך להזמין חברים למשק בית?
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mr-4">
                  <li>בעמוד "משקי בית", בחרו את משק הבית הרצוי</li>
                  <li>בחלק "הזמן חבר חדש", הזינו את כתובת האימייל של השותף</li>
                  <li>לחצו "שלח הזמנה"</li>
                  <li>אם המשתמש עדיין לא רשום למערכת, הוא יקבל הזמנה להרשם</li>
                  <li>לאחר ההרשמה, השותף יראה את משק הבית המשותף בדשבורד שלו</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 טיפ:</strong> אם אתם חברים במספר משקי בית (למשל, תקציב משפחתי ותקציב עסקי), 
                  תוכלו לעבור ביניהם בדשבורד דרך התפריט הנפתח.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* הכנסות */}
          <AccordionItem value="income" className="bg-white rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold">ניהול הכנסות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700">
                עקבו אחר כל מקורות ההכנסה החודשיים שלכם - משכורות, קצבאות, והכנסות נוספות.
              </p>

              <div>
                <h4 className="font-semibold mb-2">קטגוריות הכנסה:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
                  <li><strong>שכר</strong> - משכורת מעבודה</li>
                  <li><strong>קצבאות</strong> - קצבת זקנה, נכות, אבטלה וכד'</li>
                  <li><strong>הכנסות שונות</strong> - השכרת דירה, השקעות, הכנסות נוספות</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">איך להוסיף הכנסה?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mr-4">
                  <li>בדשבורד, עברו ללשונית "הכנסות"</li>
                  <li>לחצו על "הוסף הכנסה"</li>
                  <li>בחרו קטגוריה ותת-קטגוריה</li>
                  <li>הזינו את הסכום החודשי</li>
                  <li>הוסיפו תיאור (אופציונלי)</li>
                  <li>לחצו "שמור"</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>💡 טיפ:</strong> השתמשו בתת-קטגוריות כדי לזהות במדויק את מקור ההכנסה 
                  (למשל: "משכורת - חברה X", "קצבת זקנה - ביטוח לאומי").
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* הוצאות */}
          <AccordionItem value="expenses" className="bg-white rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <span className="font-semibold">ניהול הוצאות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700">
                תעדו את כל ההוצאות החודשיות שלכם בחלוקה לקטגוריות מפורטות.
              </p>

              <div>
                <h4 className="font-semibold mb-2">קטגוריות הוצאות עיקריות:</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 mr-4">
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
                <h4 className="font-semibold mb-2">סולם עדיפויות:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <span className="font-semibold text-green-700">1 - קל לצמצם</span>
                    <span className="text-sm text-gray-600">הוצאות שניתן בקלות לוותר עליהן</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <span className="font-semibold text-yellow-700">2 - קשה אך אפשרי</span>
                    <span className="text-sm text-gray-600">הוצאות שדורשות מאמץ לצמצם</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <span className="font-semibold text-red-700">3 - לא נוגעים</span>
                    <span className="text-sm text-gray-600">הוצאות חיוניות שאי אפשר לצמצם</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>💡 טיפ:</strong> הגדירו עדיפות נכונה לכל הוצאה - זה יעזור למערכת לזהות 
                  הזדמנויות לחיסכון ולהמליץ על אופטימיזציה של התקציב.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* חובות */}
          <AccordionItem value="debts" className="bg-white rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-red-600" />
                <span className="font-semibold">ניהול חובות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700">
                נהלו את כל החובות שלכם במקום אחד - בנקים, כרטיסי אשראי, הלוואות ועוד.
              </p>

              <div>
                <h4 className="font-semibold mb-2">סוגי חובות במערכת:</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 mr-4">
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
                <h4 className="font-semibold mb-2">מידע חשוב לתעד:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
                  <li>שם הנושה (הגוף שלקחתם ממנו הלוואה)</li>
                  <li>סכום החוב המקורי</li>
                  <li>יתרת החוב הנוכחית</li>
                  <li>החזר חודשי</li>
                  <li>אחוז ריבית (אם רלוונטי)</li>
                  <li>האם החוב בהסדר</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>⚠️ חשוב:</strong> סמנו "בהסדר" רק אם החוב מוסדר רשמית עם הנושה. 
                  המערכת תזהה חובות לא מוסדרים ותתריע עליהם.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* נכסים */}
          <AccordionItem value="assets" className="bg-white rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <PiggyBank className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">חסכונות ונכסים</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700">
                תעדו את כל הנכסים והחסכונות שלכם כדי לקבל תמונה מלאה על המצב הפיננסי.
              </p>

              <div>
                <h4 className="font-semibold mb-2">סוגי נכסים:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
                  <li><strong>חיסכון 1 וחיסכון 2</strong> - חשבונות חיסכון, פיקדונות</li>
                  <li><strong>נדל"ן למגורים</strong> - דירה או בית בבעלותכם</li>
                  <li><strong>נדל"ן להשקעה</strong> - נכס שמניב הכנסה</li>
                  <li><strong>רכב</strong> - רכב פרטי או מסחרי</li>
                  <li><strong>פנסיה</strong> - קרן פנסיה או גמל</li>
                  <li><strong>קרן השתלמות</strong> - קרן להשתלמות</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">מה לתעד?</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
                  <li>שם הנכס או החיסכון</li>
                  <li>שווי נוכחי (ערך משוער)</li>
                  <li>הפקדה חודשית (אם רלוונטי)</li>
                  <li>הערות נוספות</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>💡 טיפ:</strong> עדכנו את שווי הנכסים באופן תקופתי (כל 6-12 חודשים) 
                  כדי לקבל תמונה מדויקת של המצב הפיננסי שלכם.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* התראות חכמות */}
          <AccordionItem value="alerts" className="bg-white rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold">התראות חכמות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700">
                המערכת מנתחת את הנתונים שלכם באופן חכם ומתריעה על בעיות, סיכונים והזדמנויות.
              </p>

              <div>
                <h4 className="font-semibold mb-2">סוגי התראות:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 border rounded-lg">
                    <span className="text-lg">🔴</span>
                    <div>
                      <p className="font-semibold text-sm">חריגת תקציב</p>
                      <p className="text-xs text-gray-600">התראה כאשר ההוצאות עולות על ההכנסות</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 border rounded-lg">
                    <span className="text-lg">🟡</span>
                    <div>
                      <p className="font-semibold text-sm">הוצאה גבוהה</p>
                      <p className="text-xs text-gray-600">זיהוי הוצאות גבוהות מהרגיל בקטגוריות ספציפיות</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 border rounded-lg">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="font-semibold text-sm">תזכורת חוב</p>
                      <p className="text-xs text-gray-600">תזכורות על חובות לא מוסדרים ותשלומים</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 border rounded-lg">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="font-semibold text-sm">הזדמנות לחיסכון</p>
                      <p className="text-xs text-gray-600">המלצות קונקרטיות לחיסכון בהתבסס על הנתונים</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">איך להשתמש בהתראות?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mr-4">
                  <li>לחצו על "רענן התראות" בלשונית הסקירה הכללית</li>
                  <li>המערכת תנתח את הנתונים שלכם בעזרת בינה מלאכותית</li>
                  <li>קיבלתם התראה? קראו את ההמלצה בקפידה</li>
                  <li>סמנו התראות כ"נקרא" או "בוטל" לניהול נוח</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>💡 טיפ:</strong> רעננו את ההתראות באופן קבוע (פעם בשבוע או בחודש) 
                  כדי לקבל תובנות עדכניות על המצב הפיננסי שלכם.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ייצוא נתונים */}
          <AccordionItem value="export" className="bg-white rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="font-semibold">ייצוא נתונים</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700">
                ייצאו את הנתונים שלכם לקובץ CSV (Excel) לצורך גיבוי או עיבוד נוסף.
              </p>

              <div>
                <h4 className="font-semibold mb-2">אפשרויות ייצוא:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
                  <li><strong>ייצוא לפי לשונית</strong> - כל לשונית (הכנסות, הוצאות, חובות, נכסים) כוללת כפתור "ייצא ל-CSV"</li>
                  <li><strong>ייצוא מלא</strong> - בראש הדשבורד, כפתור "ייצא הכל ל-CSV" מייצא את כל הנתונים לקובץ אחד</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">למה לייצא נתונים?</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
                  <li>גיבוי של המידע שלכם</li>
                  <li>עיבוד נוסף באקסל או Google Sheets</li>
                  <li>שיתוף עם יועץ פיננסי</li>
                  <li>הכנת דוחות ומצגות</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>💡 טיפ:</strong> קובצי ה-CSV שנוצרים תומכים בעברית באקסל. 
                  אם אתם רואים תווים משובשים, פתחו את הקובץ דרך "נתונים" → "מטקסט/CSV" באקסל.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* הטבות וזכויות */}
          <AccordionItem value="benefits" className="bg-white rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold">הטבות וזכויות</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-right">
              <p className="text-gray-700">
                בדקו אילו הטבות וזכויות סוציאליות מגיעות לכם ממשרדי הממשלה השונים.
              </p>

              <div>
                <h4 className="font-semibold mb-2">איך להשתמש בכלי?</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mr-4">
                  <li>עברו לעמוד "הטבות וזכויות" דרך התפריט</li>
                  <li>מלאו את הטופס עם הפרטים האישיים שלכם</li>
                  <li>לחצו על "בדוק זכאות"</li>
                  <li>קבלו רשימה מפורטת של הטבות שעשויות להתאים לכם</li>
                  <li>לכל הטבה יש קישור למידע נוסף ולאופן ההגשה</li>
                </ol>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-800">
                  <strong>💡 טיפ:</strong> בדקו זכאות באופן תקופתי - זכויות והטבות משתנות 
                  ועשויות להיות רלוונטיות למצב החדש שלכם.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* עצות כלליות */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💡 עצות לניהול תקציב מוצלח
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-right">
            <div className="flex items-start gap-2">
              <span className="text-lg">1️⃣</span>
              <p className="text-sm text-gray-700">
                <strong>עדכנו באופן קבוע</strong> - תעדו הכנסות והוצאות באופן שוטף, לפחות פעם בשבוע
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">2️⃣</span>
              <p className="text-sm text-gray-700">
                <strong>היו מדויקים</strong> - ככל שהנתונים מדויקים יותר, כך ההתראות וההמלצות יהיו טובות יותר
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">3️⃣</span>
              <p className="text-sm text-gray-700">
                <strong>השתמשו בשני המצבים</strong> - שקפו את המצב הנוכחי, ובנו תקציב עתידי להשוואה
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">4️⃣</span>
              <p className="text-sm text-gray-700">
                <strong>הגדירו יעדים</strong> - בנו תקציב עם יעדי חיסכון ברורים והשוו למצב הנוכחי
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">5️⃣</span>
              <p className="text-sm text-gray-700">
                <strong>עקבו אחר ההתראות</strong> - למדו מההתראות החכמות ושפרו את הרגלי הצריכה שלכם
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}