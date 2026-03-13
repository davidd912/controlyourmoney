import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useLocale, formatCurrency } from '@/components/LocaleContext';

export default function QuickChat() {
  const { t } = useTranslation();
  const { currency } = useLocale();
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });

  const { data: households } = useQuery({
    queryKey: ['households', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const owned = await base44.entities.Household.filter({ owner_email: user.email });
      const allHouseholds = await base44.entities.Household.list();
      const member = allHouseholds.filter(h => h.members && h.members.includes(user.email));
      return [...owned, ...member];
    },
    enabled: !!user?.email,
  });

  const currentHousehold = households && households.length > 0 ? households[0] : null;

  const { data: allCustomBudgetItems = [] } = useQuery({
    queryKey: ['allCustomBudgetItems', currentHousehold?.id],
    queryFn: async () => {
      if (!currentHousehold?.id) return [];
      return base44.entities.Expense.filter({ household_id: currentHousehold.id, category: 'custom', is_budget: true });
    },
    enabled: !!currentHousehold?.id
  });

  const availableCategories = React.useMemo(() => {
    const expenseCategories = [
      { value: 'food', label: t('exp_cat.food') },
      { value: 'leisure', label: t('exp_cat.leisure') },
      { value: 'clothing', label: t('exp_cat.clothing') },
      { value: 'household_items', label: t('exp_cat.household_items') },
      { value: 'home_maintenance', label: t('exp_cat.home_maintenance') },
      { value: 'grooming', label: t('exp_cat.grooming') },
      { value: 'education', label: t('exp_cat.education') },
      { value: 'events', label: t('exp_cat.events') },
      { value: 'health', label: t('exp_cat.health') },
      { value: 'transportation', label: t('exp_cat.transportation') },
      { value: 'family', label: t('exp_cat.family') },
      { value: 'communication', label: t('exp_cat.communication') },
      { value: 'housing', label: t('exp_cat.housing') },
      { value: 'obligations', label: t('exp_cat.obligations') },
      { value: 'assets', label: t('exp_cat.assets') },
      { value: 'finance', label: t('exp_cat.finance') },
      { value: 'other', label: t('exp_cat.other') }
    ];
    const incomeCategories = [
      { value: 'salary', label: t('income_cat.salary') },
      { value: 'allowance', label: t('income_cat.allowance') },
      { value: 'other', label: t('income_cat.other') }
    ];
    const customCategories = allCustomBudgetItems
      .filter(item => item.custom_category_name)
      .map(item => ({ value: `custom_${item.custom_category_name}`, label: item.custom_category_name }))
      .filter((cat, index, self) => self.findIndex(c => c.value === cat.value) === index);
    return { expense: [...expenseCategories, ...customCategories], income: incomeCategories };
  }, [allCustomBudgetItems, t]);

  const handleParse = async () => {
    if (!inputText.trim() || !currentHousehold) return;
    setIsLoading(true);
    setError(null);
    setParsedData(null);
    setSuccess(false);
    try {
      const response = await base44.functions.invoke('parseTransactionText', { text: inputText, household_id: currentHousehold.id });
      setParsedData(response.data);
      setEditedData({});
    } catch (err) {
      setError(err.message || t('qc_error_parse'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedData || !currentHousehold) return;
    setIsSaving(true);
    setError(null);
    try {
      const now = new Date();
      const finalData = {
        household_id: currentHousehold.id,
        type: editedData.type || parsedData.type,
        amount: editedData.amount || parsedData.amount,
        merchant: editedData.merchant || parsedData.merchant,
        category_id: editedData.category_id || parsedData.category_id,
        description: editedData.merchant || parsedData.merchant || parsedData.raw_text,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      };
      await base44.functions.invoke('confirmAndCreateTransaction', finalData);
      setSuccess(true);
      setParsedData(null);
      setEditedData({});
      setInputText('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || t('qc_error_save'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => setEditedData(prev => ({ ...prev, [field]: value }));
  const getCurrentValue = (field) => editedData[field] !== undefined ? editedData[field] : parsedData[field];
  const isFieldMissing = (field) => parsedData?.missing_fields?.includes(field);
  const isFormValid = () => {
    if (!parsedData) return false;
    const amount = getCurrentValue('amount');
    const merchant = getCurrentValue('merchant');
    const type = getCurrentValue('type');
    const category_id = getCurrentValue('category_id');
    return amount && amount > 0 && merchant && merchant.trim() !== '' && type && type !== 'unknown' && category_id && category_id !== 'null';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('qc_title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('qc_subtitle')}</p>
        </motion.div>

        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-green-800 dark:text-green-300 font-medium">{t('qc_success')}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
              <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-300">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder={t('qc_placeholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleParse()}
                className="text-lg"
                disabled={isLoading || !currentHousehold}
              />
              <Button onClick={handleParse} disabled={!inputText.trim() || isLoading || !currentHousehold}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            {!currentHousehold && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">{t('qc_no_household')}</p>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {parsedData && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="shadow-xl border-2 border-blue-200 dark:border-blue-800 dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <CardTitle className="flex items-center justify-between dark:text-white">
                    <span>{t('qc_transaction_title')}</span>
                    <Badge variant={parsedData.confidence >= 80 ? "default" : "secondary"}
                      className={parsedData.confidence >= 80 ? "bg-green-600" : "bg-amber-600"}>
                      {t('qc_confidence')}: {parsedData.confidence}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Amount */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">{t('qc_amount_label')}:</span>
                      {isFieldMissing('amount') && <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">{t('qc_missing_badge')}</Badge>}
                    </div>
                    {isFieldMissing('amount') ? (
                      <Input type="number" placeholder={t('qc_enter_amount')} value={getCurrentValue('amount') || ''}
                        onChange={(e) => updateField('amount', parseFloat(e.target.value))} className="text-lg font-bold" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {getCurrentValue('amount') ? formatCurrency(getCurrentValue('amount'), currency) : t('qc_not_detected')}
                      </span>
                    )}
                  </div>

                  {/* Merchant */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">{t('qc_merchant_label')}:</span>
                      {isFieldMissing('merchant') && <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">{t('qc_missing_badge')}</Badge>}
                    </div>
                    {isFieldMissing('merchant') || !getCurrentValue('merchant') ? (
                      <Input placeholder={t('qc_enter_merchant')} value={getCurrentValue('merchant') || ''}
                        onChange={(e) => updateField('merchant', e.target.value)} className="font-medium" />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">{getCurrentValue('merchant')}</span>
                    )}
                  </div>

                  {/* Type */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">{t('qc_type_label')}:</span>
                      {isFieldMissing('type') && <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">{t('qc_missing_badge')}</Badge>}
                    </div>
                    {isFieldMissing('type') || getCurrentValue('type') === 'unknown' ? (
                      <div className="flex gap-2">
                        <Button variant={getCurrentValue('type') === 'expense' ? 'default' : 'outline'} size="sm" onClick={() => updateField('type', 'expense')} className="flex-1">
                          {t('expenses')}
                        </Button>
                        <Button variant={getCurrentValue('type') === 'income' ? 'default' : 'outline'} size="sm" onClick={() => updateField('type', 'income')} className="flex-1">
                          {t('income')}
                        </Button>
                      </div>
                    ) : (
                      <Badge variant={getCurrentValue('type') === 'expense' ? 'destructive' : 'default'}>
                        {getCurrentValue('type') === 'expense' ? t('expenses') : t('income')}
                      </Badge>
                    )}
                  </div>

                  {/* Category */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">{t('category')}:</span>
                      {(isFieldMissing('category_id') || !getCurrentValue('category_id')) && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">{t('qc_missing_badge')}</Badge>
                      )}
                    </div>
                    <Select value={getCurrentValue('category_id') || ''} onValueChange={(value) => updateField('category_id', value)}>
                      <SelectTrigger className="font-medium">
                        <SelectValue placeholder={t('qc_select_category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {getCurrentValue('type') === 'income' ? (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{t('qc_income_cats_header')}</div>
                            {availableCategories.income.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                          </>
                        ) : (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{t('qc_expense_cats_header')}</div>
                            {availableCategories.expense.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                            {getCurrentValue('type') !== 'expense' && (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">{t('qc_income_cats_header')}</div>
                                {availableCategories.income.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                              </>
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {parsedData.matched_rule && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        ✨ {t('qc_matched_rule', { key: parsedData.matched_rule.key })}
                      </p>
                    </div>
                  )}

                  {parsedData.questions && parsedData.questions.length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">{t('qc_more_info')}:</p>
                      <ul className="space-y-1">
                        {parsedData.questions.map((q, idx) => <li key={idx} className="text-sm text-amber-800 dark:text-amber-200">• {q}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleConfirm} disabled={isSaving || !isFormValid()}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      {isSaving ? (
                        <><Loader2 className="w-4 h-4 me-2 animate-spin" />{t('qc_saving')}</>
                      ) : (
                        <><CheckCircle className="w-4 h-4 me-2" />{t('qc_confirm_save')}</>
                      )}
                    </Button>
                    <Button onClick={() => { setParsedData(null); setEditedData({}); }} variant="outline" disabled={isSaving}>
                      {t('cancel')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}