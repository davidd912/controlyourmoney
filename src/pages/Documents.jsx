import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Building2, 
  CreditCard, 
  Droplets, 
  Zap,
  Flame,
  Home,
  Phone,
  Wifi,
  Tv,
  Receipt,
  Calculator,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

const documents = [
  {
    title: "דפי חשבון עובר ושב בבנק",
    source: "בחשבון המקוון באתר האינטרנט של הבנק או בסניף",
    required: "3-4 חודשים אחרונים של כל חשבונות הבנק שלכם",
    icon: Building2,
    color: "blue"
  },
  {
    title: "דף פירוט הרכישות בכרטיסי האשראי",
    source: "באתר האינטרנט של חברת כרטיסי האשראי או במוקד הטלפוני",
    required: "3-4 חודשים אחרונים של כל כרטיסי האשראי שלכם",
    icon: CreditCard,
    color: "purple"
  },
  {
    title: "מים",
    source: "חברת המים במקום מגוריכם",
    required: "חשבונות 12 החודשים האחרונים (12 חשבונות חודשיים או 6 חשבונות דו-חודשיים)",
    icon: Droplets,
    color: "cyan"
  },
  {
    title: "חשמל",
    source: "מוקד 103",
    required: "חשבונות 12 החודשים האחרונים",
    icon: Zap,
    color: "yellow"
  },
  {
    title: "גז מרכזי",
    source: "חברת הגז שלכם",
    required: "חשבונות 12 החודשים האחרונים",
    icon: Flame,
    color: "orange"
  },
  {
    title: "ארנונה / מיסי יישוב",
    source: "במשרדי הרשות המקומית",
    required: "חשבונות 12 החודשים האחרונים",
    icon: Home,
    color: "green"
  },
  {
    title: "טלפון קווי",
    source: "במוקד החברה",
    required: "חשבונות 12 החודשים האחרונים",
    icon: Phone,
    color: "slate"
  },
  {
    title: "טלפונים ניידים",
    source: "במוקד החברה",
    required: "חשבונות 12 החודשים האחרונים",
    icon: Phone,
    color: "indigo"
  },
  {
    title: "אינטרנט",
    source: "ספק האינטרנט שלכם",
    required: "חשבונות 12 החודשים האחרונים",
    icon: Wifi,
    color: "blue"
  },
  {
    title: "כבלים",
    source: "ספק הכבלים שלכם",
    required: "חשבונות 12 החודשים האחרונים",
    icon: Tv,
    color: "pink"
  },
  {
    title: "תלושי שכר - שכירים",
    source: "אצל המעסיק",
    required: "6 תלושים אחרונים",
    icon: Receipt,
    color: "emerald"
  },
  {
    title: "דו״ח רו״ח - עצמאיים",
    source: "אצל רואה החשבון או יועץ המס",
    required: "שומה של השנה הקודמת וכן מאזן בוחן מתחילת השנה הנוכחית עד לרגע זה",
    icon: Calculator,
    color: "amber"
  }
];

const colorVariants = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  green: "bg-green-100 text-green-700 border-green-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200"
};

const iconBgVariants = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  cyan: "bg-cyan-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  slate: "bg-slate-500",
  indigo: "bg-indigo-500",
  pink: "bg-pink-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500"
};

export default function Documents() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            מסמכים נדרשים
          </h1>
          <p className="text-gray-500">
            רשימת המסמכים הנדרשים לשיקוף תמונת מצב כלכלית מדויקת
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <FileText className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">למה צריך את המסמכים?</h3>
                  <p className="text-blue-100 text-sm">
                    כדי להכין תכנית כלכלית מותאמת עבורכם, עליכם לבדוק את נקודת המוצא הכלכלית שלכם. 
                    כדי שמיפוי המצב הכלכלי יהיה מדויק ככל הניתן, המעיטו בהערכת סכומים והמנעו מניחושים. 
                    התבססות על נתונים ותדפיסים תאפשר לראות את התמונה הכוללת באופן המדויק ביותר.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc, index) => {
            const Icon = doc.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl ${iconBgVariants[doc.color]} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">איך משיגים: </span>
                            <span className="text-gray-700">{doc.source}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">מה צריך: </span>
                            <span className="text-gray-700">{doc.required}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Savings Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="border-2 border-dashed border-green-300 bg-green-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-800 mb-2">📋 אל תשכחו את המסמכים!</h3>
              <p className="text-green-700 text-sm">
                מומלץ להכין את כל המסמכים הנוגעים לחסכונות שלכם: קרנות השתלמות, חסכונות לילדים, קופות גמל וכדומה.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}