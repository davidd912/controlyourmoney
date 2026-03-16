import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

export default function TermsOfService() {
  const { t } = useTranslation();

  const sectionsRaw = t('tos_sections', { returnObjects: true });
  const sections = Array.isArray(sectionsRaw) ? sectionsRaw : [];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">{t('tos_title')}</CardTitle>
            <p className="text-center text-gray-500 mt-2">{t('tos_updated')}: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{i + 1}. {section.title}</h2>
                {section.intro && <p className="text-gray-700 leading-relaxed mb-2">{section.intro}</p>}
                {section.text && <p className="text-gray-700 leading-relaxed">{section.text}</p>}
                {section.items && (
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ps-4">
                    {section.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}
              </section>
            ))}

            <section className="bg-blue-50 p-4 rounded-lg mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('tos_contact_title')}</h2>
              <p className="text-gray-700 leading-relaxed">{t('tos_contact_intro')}</p>
              <a href="mailto:task2gether@gmail.com" className="text-blue-600 hover:text-blue-800 font-semibold">
                task2gether@gmail.com
              </a>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}