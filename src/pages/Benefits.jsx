import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Home, Banknote, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/components/LocaleContext';

const iconMap = { Home, Banknote };

export default function Benefits() {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const isRTL = lang === 'he';

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const benefitsDataRaw = t('benefits_data', { returnObjects: true });
  const benefitsData = Array.isArray(benefitsDataRaw) ? benefitsDataRaw : [];

  const toggleExpand = (categoryId, itemIndex) => {
    const key = `${categoryId}-${itemIndex}`;
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = benefitsData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.benefits.some(b => b.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200"
  };

  const iconColors = { blue: "text-blue-600", green: "text-green-600" };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('benefits_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('benefits_subtitle')}</p>
        </motion.div>

        <div className="relative mb-8">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} aria-hidden="true" />
          <Input
            placeholder={t('benefits_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white dark:bg-gray-800`}
            aria-label={t('benefits_search_aria')}
          />
        </div>

        <div className="space-y-6">
          {filteredData.map((category) => {
            const Icon = iconMap[category.icon] || Home;
            return (
              <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className={`${colorClasses[category.color]} dark:bg-gray-700 border-b`}>
                    <CardTitle className="flex items-center gap-3 dark:text-white">
                      <Icon className={`w-6 h-6 ${iconColors[category.color]}`} aria-hidden="true" />
                      <span>{category.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y dark:divide-gray-700">
                      {category.items.map((item, index) => {
                        const key = `${category.id}-${index}`;
                        const isExpanded = expandedItems[key];
                        return (
                          <div key={index} className="overflow-hidden">
                            <button
                              onClick={() => toggleExpand(category.id, index)}
                              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              aria-expanded={isExpanded}
                              aria-controls={`benefits-${key}`}
                            >
                              <span className="font-medium text-gray-800 dark:text-gray-200">{item.title}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {t('benefits_count', { count: item.benefits.length })}
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
                                  <ul className="px-4 pb-4 space-y-2">
                                    {item.benefits.map((benefit, bIndex) => (
                                      <li key={bIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${category.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'}`} />
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
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-500 dark:text-gray-400">{t('benefits_no_results')}</p>
          </div>
        )}
      </div>
    </div>
  );
}