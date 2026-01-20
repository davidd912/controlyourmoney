import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Home, 
  Droplets, 
  Zap, 
  Flame, 
  Heart, 
  GraduationCap,
  Bus,
  Phone,
  Users,
  Banknote,
  Baby,
  Eye,
  Building2,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const benefitsData = [
  {
    id: 1,
    category: "הוצאות חודשיות",
    icon: Home,
    color: "blue",
    items: [
      {
        title: "שכר דירה",
        benefits: [
          "לבדוק זכאות לסיוע בשכ״ד",
          "במידה ואין שכר דירה ומשכנתה - לבדוק האם מדובר בדיור ציבורי"
        ]
      },
      {
        title: "ארנונה",
        benefits: [
          "עשויה להיות זכאות להנחה למקבלי קצבת נכות (ילד/הורה)",
          "חייל בשירות חובה / סטודנטים",
          "אזרחים ותיקים"
        ]
      },
      {
        title: "משכנתה",
        benefits: [
          "לבחון כדאיות מחזור משכנתה",
          "שימוש בה בעת הסדר החובות"
        ]
      },
      {
        title: "ביטוחים",
        benefits: [
          "לבדוק כפל ביטוחים",
          "כיסוי ביטוחי מיטבי"
        ]
      },
      {
        title: "מים וביוב",
        benefits: [
          "לבדוק שמספר הנפשות תואם לרישום בחברת המים",
          "עשויה להיות זכאות להנחה למקבלי ק.נכות (ילד/הורה)"
        ]
      },
      {
        title: "חשמל",
        benefits: [
          "עשויה להיות זכאות להנחה למקבלי קצבת נכות (ילד/הורה)",
          "מקבלי קצבת סיעוד",
          "אזרחים ותיקים (מגיל 80)"
        ]
      },
      {
        title: "גז",
        benefits: [
          "עשויה להיות זכאות להנחה למקבלי קצבת נכות (ילד/הורה)"
        ]
      },
      {
        title: "תרומות בהוראת קבע",
        benefits: [
          "לבדוק זכאות להחזר מס"
        ]
      },
      {
        title: "ביטוח לאומי (למי שלא עובד)",
        benefits: [
          "לבחון זכאות לגמלת אבטלה / הבטחת הכנסה",
          "הכשרות תעסוקתיות",
          "ייעוץ תעסוקתי מפעמונים או גופים מסייעים אחרים"
        ]
      },
      {
        title: "תחבורה ציבורית",
        benefits: [
          "לוודא שהרב קו של הילדים / סטודנטים / בעלי נכות / אזרחים ותיקים מוגדר בהתאם לקבלת ההנחה המתאימה"
        ]
      },
      {
        title: "אופטיקה",
        benefits: [
          "עד גיל 18 בביטוח קופ״ח משלים זכאות לזוג משקפיים אחד חינם בשנה"
        ]
      },
      {
        title: "טיפולי שיניים",
        benefits: [
          "ילדים עד גיל 18 זכאים לטיפולים ללא עלות / עלות מסובסדת"
        ]
      },
      {
        title: "חינוך",
        benefits: [
          "ילדים הלומדים במסגרות חינוך מיוחד (עם ועדת שילוב) זכאים לנקודות זכות במס - ייתכן וזכאים להחזרי מס",
          "להורים יחידניים - לבדוק זכאות מענק לימודים באוגוסט מביטוח לאומי",
          "לבקש הנחה בשכ״ל ממוסד הלימודים",
          "בקשת השתתפות בשכ״ל במעונות יום מהתמ״ת"
        ]
      },
      {
        title: "מזון",
        benefits: [
          "עלות מזון גבוהה עשויה להעיד על מוצרים מותאמים לבעלי אלרגיה / רגישות (כגון צליאק, חלב וכד׳)",
          "לעיתים יש זכאות לסייעת לילד בבית ספר / קצבת נכות"
        ]
      }
    ]
  },
  {
    id: 2,
    category: "הכנסות חודשיות",
    icon: Banknote,
    color: "green",
    items: [
      {
        title: "שכר עבודה",
        benefits: [
          "שכר עבודה נמוך עשוי להעיד על זכאות להשלמת / הבטחת הכנסה",
          "אדם העובד ביותר ממקום עבודה אחד נדרש לתיאום מס"
        ]
      },
      {
        title: "קצבת ילדים",
        benefits: [
          "חשוב לשים לב כי הקצבה משולמת במלואה בגין כלל הילדים הרשומים בת.ז. שמתחת לגיל 18",
          "קצבה מופחתת או חסרה עשויה להעיד על חוב מקוזז בביטוח לאומי"
        ]
      },
      {
        title: "מזונות",
        benefits: [
          "קבלת מזונות עשויה להעיד על זכויות הורה יחידני",
          "גרושה שלא מקבלת בפועל תשלומי מזונות - יכולה לבדוק זכאות למזונות מביטוח לאומי",
          "תשלום מזונות על ידי האב מזכה בנקודות זיכוי למס"
        ]
      },
      {
        title: "הכנסה מנכס",
        benefits: [
          "יש לוודא כי ההכנסה אינה עולה על הפטור מדיווח למס הכנסה"
        ]
      }
    ]
  }
];

export default function Benefits() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (categoryId, itemIndex) => {
    const key = `${categoryId}-${itemIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredData = benefitsData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.title.includes(searchTerm) ||
      item.benefits.some(b => b.includes(searchTerm))
    )
  })).filter(category => category.items.length > 0);

  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200"
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600"
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" lang="he">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            הטבות וזכויות
          </h1>
          <p className="text-gray-500">
            רשימת הטבות וזכויות שכדאי לבדוק בהתאם למצב הכלכלי שלכם
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
          <Input
            placeholder="חיפוש הטבות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 bg-white text-right"
            dir="rtl"
            aria-label="חיפוש הטבות וזכויות"
          />
        </div>

        {/* Benefits List */}
        <div className="space-y-6">
          {filteredData.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className={`${colorClasses[category.color]} border-b`}>
                    <CardTitle className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${iconColors[category.color]}`} aria-hidden="true" />
                      <span>{category.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {category.items.map((item, index) => {
                        const key = `${category.id}-${index}`;
                        const isExpanded = expandedItems[key];
                        
                        return (
                          <div key={index} className="overflow-hidden">
                            <button
                              onClick={() => toggleExpand(category.id, index)}
                              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-right"
                              dir="rtl"
                              aria-expanded={isExpanded}
                              aria-controls={`benefits-${key}`}
                            >
                              <span className="font-medium text-gray-800">{item.title}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.benefits.length} הטבות
                                </Badge>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                )}
                              </div>
                            </button>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                  id={`benefits-${key}`}
                                >
                                  <ul className="px-4 pb-4 space-y-2" dir="rtl">
                                    {item.benefits.map((benefit, bIndex) => (
                                      <li
                                        key={bIndex}
                                        className="flex items-start gap-2 text-sm text-gray-600 text-right"
                                      >
                                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                          category.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'
                                        }`} />
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12" role="status">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-500">לא נמצאו תוצאות</p>
          </div>
        )}
      </div>
    </div>
  );
}