import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div dir="rtl" className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">תנאי שימוש</CardTitle>
            <p className="text-center text-gray-500 mt-2">עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. קבלת התנאים</h2>
              <p className="text-gray-700 leading-relaxed">
                ברוכים הבאים לאפליקציית ניהול תקציב משפחתי. השימוש באפליקציה זו מהווה הסכמה מלאה לתנאי השימוש המפורטים להלן. 
                אם אינך מסכים לתנאים אלה, אנא הימנע משימוש באפליקציה.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. שירותי האפליקציה</h2>
              <p className="text-gray-700 leading-relaxed">
                האפליקציה מספקת כלים לניהול תקציב משפחתי, מעקב אחר הכנסות והוצאות, ניהול חובות ונכסים, 
                והתראות חכמות. השירות ניתן "כפי שהוא" (AS IS) ללא אחריות מפורשת או משתמעת.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. אחריות המשתמש</h2>
              <p className="text-gray-700 leading-relaxed mb-2">המשתמש מתחייב:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>לספק מידע מדויק ומעודכן</li>
                <li>לשמור על סודיות פרטי ההתחברות שלו</li>
                <li>לא לשתף מידע פיננסי רגיש עם צדדים שלישיים</li>
                <li>להשתמש באפליקציה למטרות חוקיות בלבד</li>
                <li>לא לנסות לפגוע במערכת או לגשת למידע של משתמשים אחרים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. מדיניות נתונים</h2>
              <p className="text-gray-700 leading-relaxed">
                כל המידע הפיננסי שאתה מזין נשמר באופן מאובטח. אנו לא נשתף את הנתונים שלך עם צדדים שלישיים 
                ללא הסכמתך המפורשת. לפרטים נוספים, עיין במדיניות הפרטיות שלנו.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. הגבלת אחריות</h2>
              <p className="text-gray-700 leading-relaxed">
                האפליקציה מספקת כלי עזר לניהול תקציב אך אינה מהווה ייעוץ פיננסי מקצועי. אנו לא נישא באחריות 
                להחלטות פיננסיות שתקבל על סמך המידע או ההמלצות באפליקציה. מומלץ להיוועץ ביועץ פיננסי מוסמך 
                לפני קבלת החלטות פיננסיות משמעותיות.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. שינויים בתנאי השימוש</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו שומרים לעצמנו את הזכות לעדכן את תנאי השימוש מעת לעת. שינויים מהותיים יפורסמו באפליקציה 
                והמשך השימוש לאחר פרסום השינויים מהווה הסכמה לתנאים המעודכנים.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. סיום שימוש</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו שומרים לעצמנו את הזכות להשעות או לסיים את גישתך לאפליקציה במקרה של הפרת תנאי השימוש, 
                ללא הודעה מוקדמת.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. דין החל וסמכות שיפוט</h2>
              <p className="text-gray-700 leading-relaxed">
                תנאי שימוש אלה יפורשו על פי חוקי מדינת ישראל. כל סכסוך הנובע מהשימוש באפליקציה יהיה בסמכות 
                השיפוט הבלעדית של בתי המשפט במחוז תל אביב - יפו.
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">יצירת קשר</h2>
              <p className="text-gray-700 leading-relaxed">
                לשאלות או הבהרות בנוגע לתנאי השימוש, ניתן לפנות אלינו בכתובת:
              </p>
              <a href="mailto:davidd9@gmail.com" className="text-blue-600 hover:text-blue-800 font-semibold">
                davidd9@gmail.com
              </a>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}