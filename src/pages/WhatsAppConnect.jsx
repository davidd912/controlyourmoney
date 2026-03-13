import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';

export default function WhatsAppConnect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const activationCode = location.state?.activationCode;
  const householdName = location.state?.householdName;

  const { data: systemConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['systemConfig'],
    queryFn: () => base44.entities.SystemConfig.list(),
  });

  const whatsappBotNumberItem = systemConfig?.find(config => config.key === 'whatsapp_bot_number');
  const dynamicBotNumber = whatsappBotNumberItem?.value || '14155238886';

  useEffect(() => {
    if (!activationCode) navigate(-1);
  }, [activationCode, navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(activationCode);
    setCopied(true);
    toast.success(t('wa_copied_toast'));
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(activationCode);
    window.open(`https://wa.me/${dynamicBotNumber}?text=${message}`, '_blank');
  };

  if (!activationCode) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="border-green-200 dark:border-green-800 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-green-700 dark:text-green-400 mb-2">
                {householdName || t('wa_default_title')}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                {t('wa_send_message_desc')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activation Code */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border-2 border-dashed border-green-300 dark:border-green-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">{t('wa_activation_code_label')}:</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-3xl font-bold text-green-700 dark:text-green-400 tracking-widest">{activationCode}</code>
                <Button variant="ghost" size="icon" onClick={copyCode} className="shrink-0">
                  {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Open WhatsApp Button */}
            <Button onClick={openWhatsApp} disabled={isLoadingConfig} className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-semibold shadow-lg">
              {isLoadingConfig ? (
                <><Loader2 className="w-5 h-5 animate-spin me-2" />{t('wa_loading')}</>
              ) : (
                <><MessageCircle className="w-6 h-6 me-2" />{t('wa_open_app_btn')}<ArrowRight className="w-5 h-5 ms-2" /></>
              )}
            </Button>

            {/* Web WhatsApp */}
            <div className="text-center">
              {isLoadingConfig ? (
                <span className="text-sm text-gray-400">{t('wa_loading')}</span>
              ) : (
                <a href={`https://web.whatsapp.com/send?phone=${dynamicBotNumber}&text=${encodeURIComponent(activationCode)}`}
                  target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-400 hover:underline">
                  {t('wa_web_link')} →
                </a>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300 text-center">
                <span className="inline-block me-2">🔒</span>
                {t('wa_no_app')}{' '}
                <a href="https://www.whatsapp.com/download" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {t('wa_download')}
                </a>
              </p>
            </div>

            {/* Back */}
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">{t('back')}</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}