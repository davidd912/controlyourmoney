import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QuickChat() {
    const [inputText, setInputText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me(),
    });

    const { data: households } = useQuery({
        queryKey: ['households', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const owned = await base44.entities.Household.filter({ owner_email: user.email });
            const allHouseholds = await base44.entities.Household.list();
            const member = allHouseholds.filter(h => 
                h.members && h.members.includes(user.email)
            );
            return [...owned, ...member];
        },
        enabled: !!user?.email,
    });

    const currentHousehold = households && households.length > 0 ? households[0] : null;

    const handleParse = async () => {
        if (!inputText.trim() || !currentHousehold) return;

        setIsLoading(true);
        setError(null);
        setParsedData(null);
        setSuccess(false);

        try {
            const response = await base44.functions.invoke('parseTransactionText', {
                text: inputText,
                household_id: currentHousehold.id
            });

            setParsedData(response.data);
            setEditedData({}); // Reset edited data
        } catch (err) {
            setError(err.message || 'שגיאה בניתוח הטקסט');
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

            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message || 'שגיאה ביצירת הטרנזקציה');
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field, value) => {
        setEditedData(prev => ({ ...prev, [field]: value }));
    };

    const getCurrentValue = (field) => {
        return editedData[field] !== undefined ? editedData[field] : parsedData[field];
    };

    const isFieldMissing = (field) => {
        return parsedData?.missing_fields?.includes(field);
    };

    const isFormValid = () => {
        if (!parsedData) return false;
        
        const amount = getCurrentValue('amount');
        const merchant = getCurrentValue('merchant');
        const type = getCurrentValue('type');
        const category_id = getCurrentValue('category_id');

        return amount && amount > 0 && 
               merchant && merchant.trim() !== '' && 
               type && type !== 'unknown' &&
               category_id && category_id !== 'null';
    };

    const getCategoryLabel = (categoryId) => {
        const categories = {
            food: 'מזון',
            leisure: 'פנאי ובילויים',
            clothing: 'ביגוד והנעלה',
            household_items: 'ציוד לבית',
            home_maintenance: 'תחזוקת בית',
            grooming: 'טיפוח',
            education: 'חינוך',
            events: 'אירועים',
            health: 'בריאות',
            transportation: 'תחבורה',
            family: 'משפחה',
            communication: 'תקשורת',
            housing: 'דיור',
            obligations: 'התחייבויות',
            assets: 'נכסים',
            finance: 'פיננסים',
            custom: 'מותאם אישית',
            salary: 'משכורת',
            allowance: 'קצבה',
            other: 'אחר'
        };
        return categories[categoryId] || categoryId;
    };

    return (
        <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="max-w-2xl mx-auto py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">צ'אט חכם</h1>
                    <p className="text-gray-600">הוסף טרנזקציה במהירות באמצעי טקסט חופשי</p>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4"
                        >
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <p className="text-green-800 font-medium">הטרנזקציה נוספה בהצלחה!</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4"
                        >
                            <Card className="bg-red-50 border-red-200">
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <p className="text-red-800">{error}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Section */}
                <Card className="mb-6 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Input
                                placeholder='לדוגמה: "קניתי בסופר 350 שקל" או "300₪ ברמי לוי"'
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleParse()}
                                className="text-lg"
                                disabled={isLoading || !currentHousehold}
                            />
                            <Button
                                onClick={handleParse}
                                disabled={!inputText.trim() || isLoading || !currentHousehold}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                        {!currentHousehold && (
                            <p className="text-sm text-amber-600 mt-2">אנא צור משק בית תחילה כדי להשתמש בצ'אט החכם</p>
                        )}
                    </CardContent>
                </Card>

                {/* Parsed Data Card */}
                <AnimatePresence>
                    {parsedData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="shadow-xl border-2 border-blue-200">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <CardTitle className="flex items-center justify-between">
                                        <span>פרטי הטרנזקציה</span>
                                        <Badge 
                                            variant={parsedData.confidence >= 80 ? "default" : "secondary"}
                                            className={parsedData.confidence >= 80 ? "bg-green-600" : "bg-amber-600"}
                                        >
                                            ביטחון: {parsedData.confidence}%
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {/* Amount */}
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">סכום:</span>
                                            {isFieldMissing('amount') && (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">חסר</Badge>
                                            )}
                                        </div>
                                        {isFieldMissing('amount') ? (
                                            <Input
                                                type="number"
                                                placeholder="הזן סכום..."
                                                value={getCurrentValue('amount') || ''}
                                                onChange={(e) => updateField('amount', parseFloat(e.target.value))}
                                                className="text-lg font-bold"
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-900">
                                                {getCurrentValue('amount') ? `₪${getCurrentValue('amount').toLocaleString('he-IL')}` : 'לא זוהה'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Merchant */}
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">עסק:</span>
                                            {isFieldMissing('merchant') && (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">חסר</Badge>
                                            )}
                                        </div>
                                        {isFieldMissing('merchant') || !getCurrentValue('merchant') ? (
                                            <Input
                                                placeholder="הזן שם עסק..."
                                                value={getCurrentValue('merchant') || ''}
                                                onChange={(e) => updateField('merchant', e.target.value)}
                                                className="font-medium"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-900">{getCurrentValue('merchant')}</span>
                                        )}
                                    </div>

                                    {/* Type */}
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">סוג:</span>
                                            {isFieldMissing('type') && (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">חסר</Badge>
                                            )}
                                        </div>
                                        {isFieldMissing('type') || getCurrentValue('type') === 'unknown' ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={getCurrentValue('type') === 'expense' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => updateField('type', 'expense')}
                                                    className="flex-1"
                                                >
                                                    הוצאה
                                                </Button>
                                                <Button
                                                    variant={getCurrentValue('type') === 'income' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => updateField('type', 'income')}
                                                    className="flex-1"
                                                >
                                                    הכנסה
                                                </Button>
                                            </div>
                                        ) : (
                                            <Badge variant={getCurrentValue('type') === 'expense' ? 'destructive' : 'default'}>
                                                {getCurrentValue('type') === 'expense' ? 'הוצאה' : 'הכנסה'}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">קטגוריה:</span>
                                            {isFieldMissing('category_id') && (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">חסר</Badge>
                                            )}
                                        </div>
                                        {isFieldMissing('category_id') || !getCurrentValue('category_id') ? (
                                            <Input
                                                placeholder="לדוגמה: food, leisure, salary..."
                                                value={getCurrentValue('category_id') || ''}
                                                onChange={(e) => updateField('category_id', e.target.value)}
                                                className="font-medium"
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-900">
                                                {getCategoryLabel(getCurrentValue('category_id'))}
                                            </span>
                                        )}
                                    </div>

                                    {/* Matched Rule */}
                                    {parsedData.matched_rule && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-800">
                                                ✨ נמצא חוק קיים עבור "{parsedData.matched_rule.key}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Questions */}
                                    {parsedData.questions && parsedData.questions.length > 0 && (
                                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                            <p className="font-medium text-amber-900 mb-2">נדרש מידע נוסף:</p>
                                            <ul className="space-y-1">
                                                {parsedData.questions.map((q, idx) => (
                                                    <li key={idx} className="text-sm text-amber-800">• {q}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleConfirm}
                                            disabled={isSaving || !isFormValid()}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                    שומר...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4 ml-2" />
                                                    אישור ושמירה
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setParsedData(null);
                                                setEditedData({});
                                            }}
                                            variant="outline"
                                            disabled={isSaving}
                                        >
                                            ביטול
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