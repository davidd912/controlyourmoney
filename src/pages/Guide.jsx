import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Home, TrendingUp, TrendingDown, CreditCard, PiggyBank, Users, Target, AlertCircle, Download, UserPlus, Award, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

export default function Guide() {
  const { t } = useTranslation();
  const ta = (key) => { const v = t(key, { returnObjects: true }); return Array.isArray(v) ? v : []; };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6 pb-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {t('guide_page_title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('guide_page_subtitle')}</p>
        </motion.div>

        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('guide_about_section')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-start space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('guide_about_p1')}</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('guide_about_p2')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
              <li><strong>{t('guide_mode_current')}</strong> - {t('guide_mode_current_desc')}</li>
              <li><strong>{t('guide_mode_budget')}</strong> - {t('guide_mode_budget_desc')}</li>
            </ul>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">

          {/* Households */}
          <AccordionItem value="households" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">{t('guide_households_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white"><Users className="w-4 h-4" />{t('guide_what_is_hh')}</h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{t('guide_what_is_hh_desc')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_how_create_hh')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {ta('guide_how_create_steps').map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white"><UserPlus className="w-4 h-4" />{t('guide_how_invite')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {ta('guide_how_invite_steps').map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">{t('guide_hh_tip')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Income */}
          <AccordionItem value="income" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold">{t('guide_income_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_income_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_income_cats_title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                  <li><strong>{t('guide_income_cat_salary_title')}</strong> - {t('guide_income_cat_salary_desc')}</li>
                  <li><strong>{t('guide_income_cat_allowance_title')}</strong> - {t('guide_income_cat_allowance_desc')}</li>
                  <li><strong>{t('guide_income_cat_other_title')}</strong> - {t('guide_income_cat_other_desc')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_how_add_income')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {ta('guide_how_add_income_steps').map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">{t('guide_income_tip')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Expenses */}
          <AccordionItem value="expenses" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold">{t('guide_expenses_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_expenses_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_expense_cats_title')}</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_expense_cat_list', { returnObjects: true }) || []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_priority_title')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                    <span className="font-semibold text-green-700 dark:text-green-300">{t('guide_priority_1')}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('guide_priority_1_desc')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                    <span className="font-semibold text-yellow-700 dark:text-yellow-300">{t('guide_priority_2')}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('guide_priority_2_desc')}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                    <span className="font-semibold text-red-700 dark:text-red-300">{t('guide_priority_3')}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('guide_priority_3_desc')}</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">{t('guide_expenses_tip')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Debts */}
          <AccordionItem value="debts" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold">{t('guide_debts_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_debts_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_debt_types_title')}</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_debt_type_list', { returnObjects: true }) || []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_debt_info_title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_debt_info_items', { returnObjects: true }) || []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{t('guide_debt_warning')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Assets */}
          <AccordionItem value="assets" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <PiggyBank className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">{t('guide_assets_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_assets_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_asset_types_title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_asset_type_list', { returnObjects: true }) || []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_asset_record_title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_asset_record_items', { returnObjects: true }) || []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">{t('guide_assets_tip')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* AI Planning */}
          <AccordionItem value="ai-planning" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-purple-600 dark:text-purple-400">✨</div>
                <span className="font-semibold">{t('guide_ai_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_ai_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_ai_tools_title')}</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{t('guide_ai_tool1_title')}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('guide_ai_tool1_desc')}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{t('guide_ai_tool2_title')}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('guide_ai_tool2_desc')}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{t('guide_ai_tool3_title')}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('guide_ai_tool3_desc')}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_how_use_recs')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_how_use_recs_steps', { returnObjects: true }) || []).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_how_use_forecast')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_how_use_forecast_steps', { returnObjects: true }) || []).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_how_use_scenarios')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_how_use_scenarios_steps', { returnObjects: true }) || []).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">{t('guide_ai_tip')}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{t('guide_ai_warning')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Alerts */}
          <AccordionItem value="alerts" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold">{t('guide_alerts_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_alerts_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_alert_types_title')}</h4>
                <div className="space-y-2">
                  {(t('guide_alert_type_list', { returnObjects: true }) || []).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 border dark:border-gray-700 rounded-lg">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_how_use_alerts')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_how_use_alerts_steps', { returnObjects: true }) || []).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{t('guide_alerts_tip')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Export */}
          <AccordionItem value="export" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold">{t('guide_export_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_export_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_export_options_title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_export_options', { returnObjects: true }) || []).map((item, i) => (
                    <li key={i}><strong>{item.title}</strong> - {item.desc}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_why_export_title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_why_export_items', { returnObjects: true }) || []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">{t('guide_export_tip')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Benefits */}
          <AccordionItem value="benefits" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold">{t('guide_benefits_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_benefits_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{t('guide_how_use_benefits')}</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_how_use_benefits_steps', { returnObjects: true }) || []).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
                <p className="text-sm text-indigo-800 dark:text-indigo-200">{t('guide_benefits_tip')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* WhatsApp */}
          <AccordionItem value="whatsapp" className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <AccordionTrigger className="px-6 hover:no-underline text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold">{t('guide_whatsapp_section')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-4 text-start">
              <p className="text-gray-700 dark:text-gray-300">{t('guide_whatsapp_desc')}</p>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="text-green-600 dark:text-green-400">🔗</span>{t('guide_how_connect')}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{t('guide_how_connect_desc')}</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                  {(t('guide_how_connect_options', { returnObjects: true }) || []).map((item, i) => (
                    <li key={i}><strong>{item.title}</strong> {item.desc}</li>
                  ))}
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-3">{t('guide_how_connect_note')}</p>
                <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg mt-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{t('guide_code_warning')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="text-blue-600 dark:text-blue-400">💬</span>{t('guide_bot_capabilities')}
                </h4>
                <div className="space-y-3">
                  {(t('guide_bot_cap_list', { returnObjects: true }) || []).map((cap, i) => (
                    <div key={i} className="p-3 border dark:border-gray-700 rounded-lg">
                      <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{cap.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{cap.desc}</p>
                      <ul className="text-xs text-gray-500 dark:text-gray-400 ps-4 space-y-1">
                        {cap.examples.map((ex, j) => <li key={j}>"{ex}"</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="text-purple-600 dark:text-purple-400">⚙️</span>{t('guide_how_it_works')}
                </h4>
                <div className="space-y-3">
                  {(t('guide_how_it_works_items', { returnObjects: true }) || []).map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">{t('guide_whatsapp_tip')}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* General Tips */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              💡 {t('guide_tips_section')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-start">
            {(t('guide_tips', { returnObjects: true }) || []).map((tip, i) => (
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