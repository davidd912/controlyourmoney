import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div dir="rtl" className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-3xl font-bold text-center">מדיניות פרטיות</CardTitle>
            </div>
            <p className="text-center text-gray-500 mt-2">עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <p className="text-gray-700 leading-relaxed text-center bg-blue-50 p-4 rounded-lg">
                פרטיותך חשובה לנו. מדיניות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך 
                בעת השימוש באפליקציית ניהול התקציב המשפחתי.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">1. איזה מידע אנו אוספים</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-2">אנו אוספים את סוגי המידע הבאים:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li><strong>מידע אישי:</strong> שם מלא, כתובת אימייל</li>
                <li><strong>מידע פיננסי:</strong> הכנסות, הוצאות, חובות, נכסים וחסכונות שתזין באפליקציה</li>
                <li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה (לצורכי אבטחה ושיפור השירות)</li>
                <li><strong>עוגיות (Cookies):</strong> לשם שמירת העדפות והתחברות</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">2. כיצד אנו משתמשים במידע</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-2">אנו משתמשים במידע שלך למטרות הבאות:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>לספק ולשפר את שירותי האפליקציה</li>
                <li>לאפשר לך לנהל את התקציב המשפחתי שלך</li>
                <li>ליצור התראות והמלצות חכמות מותאמות אישית</li>
                <li>לספק תמיכה טכנית ולענות על פניות</li>
                <li>לשלוח עדכונים חשובים על השירות (במידת הצורך)</li>
                <li>לשפר את אבטחת המערכת ולמנוע שימוש לרעה</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">3. הגנה על המידע שלך</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-2">אנו נוקטים באמצעי אבטחה מתקדמים להגנה על הנתונים שלך:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>הצפנת נתונים בזמן העברה ובמנוחה (SSL/TLS)</li>
                <li>אימות משתמשים מאובטח</li>
                <li>גישה מוגבלת למידע רק לצוות מורשה</li>
                <li>גיבויים תקופתיים של המידע</li>
                <li>ניטור מתמיד של פעילות חשודה</li>
              </ul>
              <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mt-3 rounded">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    למרות מאמצינו, אף שיטת אבטחה אינה בטוחה ב-100%. אנו ממליצים להשתמש בסיסמה חזקה ולא לשתף אותה עם אחרים.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">4. שיתוף מידע עם צדדים שלישיים</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                <strong>אנו לא נמכור או נשכיר את המידע האישי שלך לצדדים שלישיים.</strong> המידע שלך עשוי להישתף 
                במקרים הבאים בלבד:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4 mt-2">
                <li>עם הסכמתך המפורשת</li>
                <li>לצורכי עמידה בחוק או דרישות רשויות</li>
                <li>עם ספקי שירות חיוניים (כגון אירוח) שחתמו על הסכמי סודיות</li>
                <li>במקרה של מיזוג או מכירה עסקית (לאחר הודעה מוקדמת)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. הזכויות שלך</h2>
              <p className="text-gray-700 leading-relaxed mb-2">יש לך את הזכויות הבאות בנוגע למידע האישי שלך:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li><strong>זכות עיון:</strong> לבקש עותק של המידע שאנו מחזיקים עליך</li>
                <li><strong>זכות תיקון:</strong> לבקש לתקן מידע לא מדויק</li>
                <li><strong>זכות מחיקה:</strong> לבקש למחוק את המידע שלך (בכפוף לדרישות חוקיות)</li>
                <li><strong>זכות להתנגד:</strong> להתנגד לשימושים מסוימים במידע שלך</li>
                <li><strong>זכות להעברה:</strong> לבקש להעביר את הנתונים שלך לספק אחר</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                למימוש זכויותיך, ניתן לפנות אלינו בכתובת האימייל המפורטת בסוף מסמך זה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. שמירת מידע</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו שומרים את המידע שלך כל עוד החשבון שלך פעיל או ככל שנדרש לספק לך את השירות. 
                אם תבקש למחוק את החשבון שלך, נמחק את המידע האישי שלך תוך 30 יום, אלא אם נדרש לשמור אותו לפי חוק.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. קטינים</h2>
              <p className="text-gray-700 leading-relaxed">
                האפליקציה מיועדת למשתמשים מעל גיל 18. אנו לא אוספים במודע מידע מקטינים מתחת לגיל 18. 
                אם התברר לך שקטין מסר מידע, אנא צור איתנו קשר ונמחק את המידע.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. שינויים במדיניות הפרטיות</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. שינויים מהותיים יפורסמו באפליקציה ותישלח אליך הודעה 
                בדוא"ל. מומלץ לעיין במדיניות זו מעת לעת כדי להתעדכן בשינויים.
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">יצירת קשר</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                לשאלות, הבהרות או בקשות בנוגע למדיניות הפרטיות או לזכויותיך, ניתן לפנות אלינו:
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">דוא"ל:</span>
                <a href="mailto:davidd9@gmail.com" className="text-blue-600 hover:text-blue-800 font-semibold">task2gether@gmail.com

                </a>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                נעשה כל שביכולתנו לענות על פנייתך תוך 14 ימי עסקים.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>);

}