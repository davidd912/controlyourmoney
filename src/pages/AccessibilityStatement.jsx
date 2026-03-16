import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/components/LocaleContext';
import '@/components/i18n';

export default function AccessibilityStatement() {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const adaptationsRaw = t('a11y_adaptations', { returnObjects: true });
  const adaptations = Array.isArray(adaptationsRaw) ? adaptationsRaw : [];

  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="border-b pb-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-3xl font-bold text-foreground">{t('a11y_title')}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('a11y_updated')}: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-8 text-foreground">
            <section>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{t('a11y_intro')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('a11y_status_title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('a11y_status_text')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('a11y_adaptations_title')}</h2>
              <ul className="space-y-4">
                {adaptations.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100">{item.title}:</strong>
                      <span className="text-gray-700 dark:text-gray-300"> {item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('a11y_exceptions_title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('a11y_exceptions_text')}</p>
            </section>

            <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('a11y_contact_title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{t('a11y_contact_intro')}</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">{t('a11y_email_label')}:</span>
                <a href="mailto:task2gether@gmail.com" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                  task2gether@gmail.com
                </a>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">{t('a11y_contact_response')}</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}