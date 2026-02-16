import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AccessibilityStatement() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="border-b pb-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-3xl font-bold text-foreground">הצהרת נגישות</CardTitle>
            </div>
            <CardDescription className="text-base">
              תאריך עדכון: פברואר 2026
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-8 text-foreground">
            {/* מבוא */}
            <section>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                ב-<strong>controlyourmoney</strong>, אנו מאמינים בשוויון הזדמנויות ובמתן גישה מלאה לשירותינו לכלל האוכלוסייה, 
                לרבות אנשים עם מוגבלות. אנו פועלים בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ולתקנות שהותקנו מכוחו, 
                כדי לאפשר חוויית שימוש נוחה ונגישה ככל האפשר.
              </p>
            </section>

            {/* סטטוס נגישות */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">סטטוס נגישות האתר</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                אתר זה עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013. 
                התאמות הנגישות בוצעו על פי המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA 
                ובהתאם למסמך WCAG 2.0 הבינלאומי.
              </p>
            </section>

            {/* התאמות שבוצעו */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">התאמות שבוצעו באתר</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">•</span>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">ניווט מקלדת:</strong>
                    <span className="text-gray-700 dark:text-gray-300"> האתר תומך באופן מלא בניווט באמצעות המקלדת (מקש Tab, חיצים ו-Enter).</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">•</span>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">קוראי מסך:</strong>
                    <span className="text-gray-700 dark:text-gray-300"> בוצעו התאמות טכניות (כמו תגיות Alt ותיאורי Aria) עבור משתמשים בתוכנות קוראות מסך.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">•</span>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">חזותיות:</strong>
                    <span className="text-gray-700 dark:text-gray-300"> נשמרה ניגודיות צבעים תקינה בין הטקסט לרקע, וניתן להגדיל את התצוגה בדפדפן מבלי לפגוע במבנה האתר.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">•</span>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">תצוגה רספונסיבית:</strong>
                    <span className="text-gray-700 dark:text-gray-300"> האתר מותאם לצפייה בכל סוגי המכשירים (מובייל, טאבלט ומחשב).</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">•</span>
                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">וואטסאפ נגיש:</strong>
                    <span className="text-gray-700 dark:text-gray-300"> הממשק של הבוט בוואטסאפ מתבסס על טקסט נגיש המאפשר שימוש קל גם לבעלי מוגבלויות ראייה המשתמשים בטכנולוגיות מסייעות בטלפון הנייד.</span>
                  </div>
                </li>
              </ul>
            </section>

            {/* סייגים */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">סייגים לנגישות</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                למרות מאמצינו להנגיש את כלל דפי האתר והשירותים, ייתכן ויתגלו חלקים שטרם הונגשו במלואם או שאינם נגישים 
                מסיבות טכנולוגיות. אנו ממשיכים במאמצים לשפר את נגישות השירות כחלק מהמחויבות שלנו לכלל הלקוחות.
              </p>
            </section>

            {/* פרטי רכז נגישות */}
            <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold mb-4 text-foreground">פרטי רכז נגישות</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                אם נתקלתם בקושי בנגישות האתר או השירות, או אם יש לכם הצעה לשיפור, נשמח לעמוד לרשותכם:
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">דוא"ל:</span>
                <a href="mailto:task2gether@gmail.com" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                  task2gether@gmail.com
                </a>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                אנו מתחייבים לטפל בכל פנייה בנושא נגישות תוך זמן סביר ולמצוא את הפתרון המיטבי עבורכם.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}