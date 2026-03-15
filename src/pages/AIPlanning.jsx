import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { HouseholdContext } from '../Layout';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, TrendingUp, AlertTriangle, Lightbulb, 
  BarChart3, Target, Info, Loader2, Wand2, Plus // <-- הוספנו את Plus כאן
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import '@/components/i18n';

export default function AIPlanning() {
  const { t } = useTranslation();
  const { direction } = useLocale();
  const { selectedHouseholdId } = useContext(HouseholdContext);
  const [activeTab, setActiveTab] = useState("recommendations");
  const queryClient = useQueryClient();

  if (!selectedHouseholdId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center" dir={direction}>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-4">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('ai_household_required')}</h2>
        <p className="text-slate-500 max-w-md">{t('ai_household_required_msg')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6" dir={direction}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            {t('ai_title')}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{t('ai_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <Info className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{t('ai_data_secure')}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-slate-100/50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl">
          <TabsTrigger value="recommendations" className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Lightbulb className="w-4 h-4 me-2 hidden md:inline" />
            {t('ai_tab_recommendations_short')}
          </TabsTrigger>
          <TabsTrigger value="forecast" className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4 me-2 hidden md:inline" />
            {t('ai_tab_forecast_short')}
          </TabsTrigger>
          <TabsTrigger value="whatif" className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Wand2 className="w-4 h-4 me-2 hidden md:inline" />
            {t('ai_tab_whatif_short')}
          </TabsTrigger>
          <TabsTrigger value="goals" className="rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            <Target className="w-4 h-4 me-2 hidden md:inline" />
            {t('ai_tab_goals_short')}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="recommendations" className="m-0 outline-none">
              <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 dark:border-gray-800 p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold">{t('ai_rec_title')}</CardTitle>
                      <CardDescription className="text-base">{t('ai_rec_desc')}</CardDescription>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105">
                      <Sparkles className="w-4 h-4 me-2" />
                      {t('ai_rec_btn')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Lightbulb className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="max-w-xs">{t('no_data')}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* שאר ה-Tabs Content נשארו אותו דבר - אבל עכשיו זה לא יקרוס */}
            <TabsContent value="goals" className="m-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-sm bg-white dark:bg-gray-900 rounded-3xl">
                  <CardHeader className="p-8">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold">{t('ai_goals_title')}</CardTitle>
                      <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50">
                        <Plus className="w-4 h-4 me-1" />
                        {t('ai_add_goal')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <p className="text-slate-400 text-center py-12">{t('ai_no_goals')}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}