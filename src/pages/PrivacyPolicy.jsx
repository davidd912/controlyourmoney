import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-3xl font-bold text-center">{t('privacy_title')}</CardTitle>
            </div>
            <p className="text-center text-gray-500 mt-2">{t('privacy_updated')}: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <p className="text-gray-700 leading-relaxed text-center bg-blue-50 p-4 rounded-lg">{t('privacy_intro')}</p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('privacy_s1_title')}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-2">{t('privacy_s1_intro')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ps-4">
                {(Array.isArray(t('privacy_s1_items', { returnObjects: true })) ? t('privacy_s1_items', { returnObjects: true }) : []).map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('privacy_s2_title')}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-2">{t('privacy_s2_intro')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ps-4">
                {(Array.isArray(t('privacy_s2_items', { returnObjects: true })) ? t('privacy_s2_items', { returnObjects: true }) : []).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('privacy_s3_title')}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-2">{t('privacy_s3_intro')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ps-4">
                {(Array.isArray(t('privacy_s3_items', { returnObjects: true })) ? t('privacy_s3_items', { returnObjects: true }) : []).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <div className="bg-yellow-50 border-s-4 border-yellow-400 p-4 mt-3 rounded">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">{t('privacy_s3_warning')}</p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">{t('privacy_s4_title')}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{t('privacy_s4_text')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ps-4 mt-2">
                {(Array.isArray(t('privacy_s4_items', { returnObjects: true })) ? t('privacy_s4_items', { returnObjects: true }) : []).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy_s5_title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t('privacy_s5_intro')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ps-4">
                {(Array.isArray(t('privacy_s5_items', { returnObjects: true })) ? t('privacy_s5_items', { returnObjects: true }) : []).map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">{t('privacy_s5_contact')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy_s6_title')}</h2>
              <p className="text-gray-700 leading-relaxed">{t('privacy_s6_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy_s7_title')}</h2>
              <p className="text-gray-700 leading-relaxed">{t('privacy_s7_text')}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy_s8_title')}</h2>
              <p className="text-gray-700 leading-relaxed">{t('privacy_s8_text')}</p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy_contact_title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-2">{t('privacy_contact_intro')}</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{t('a11y_email_label')}:</span>
                <a href="mailto:task2gether@gmail.com" className="text-blue-600 hover:text-blue-800 font-semibold">task2gether@gmail.com</a>
              </div>
              <p className="text-sm text-gray-600 mt-3">{t('privacy_contact_response')}</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}