import React from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl mt-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">
            {t('privacy.title', 'Privacy Policy')}
          </h1>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('privacy.dataCollection.title', 'Information We Collect')}
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('privacy.dataCollection.description',
                  'We collect information that you provide directly to us, including:')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  {t('privacy.dataCollection.item1',
                    'Personal information such as name, email address, and phone number')}
                </li>
                <li>
                  {t('privacy.dataCollection.item2',
                    'Profile information including educational background and teaching experience')}
                </li>
                <li>
                  {t('privacy.dataCollection.item3',
                    'Communication data between tutors and students')}
                </li>
                <li>
                  {t('privacy.dataCollection.item4',
                    'Payment and transaction information')}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('privacy.dataUse.title', 'How We Use Your Information')}
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('privacy.dataUse.description',
                  'We use the information we collect to:')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  {t('privacy.dataUse.item1',
                    'Facilitate connections between tutors and students')}
                </li>
                <li>
                  {t('privacy.dataUse.item2',
                    'Process payments and maintain financial records')}
                </li>
                <li>
                  {t('privacy.dataUse.item3',
                    'Send notifications about relevant opportunities')}
                </li>
                <li>
                  {t('privacy.dataUse.item4',
                    'Improve our services and user experience')}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('privacy.dataSecurity.title', 'Data Security')}
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('privacy.dataSecurity.description',
                  'We implement appropriate security measures to protect your personal information. These measures include:')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  {t('privacy.dataSecurity.item1',
                    'Encryption of sensitive data')}
                </li>
                <li>
                  {t('privacy.dataSecurity.item2',
                    'Secure payment processing')}
                </li>
                <li>
                  {t('privacy.dataSecurity.item3',
                    'Regular security assessments')}
                </li>
                <li>
                  {t('privacy.dataSecurity.item4',
                    'Access controls and authentication')}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('privacy.contact.title', 'Contact Us')}
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('privacy.contact.description',
                  'If you have any questions about our Privacy Policy, please contact us at:')}
              </p>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-slate-700 font-medium">Email: <span className="text-blue-600">privacy@tutormove.com</span></p>
                <p className="text-slate-700 font-medium mt-2">Phone: <span className="text-slate-600">+1 (555) 123-4567</span></p>
              </div>
            </section>

            <div className="pt-8 border-t border-slate-100">
              <p className="text-slate-500 text-sm">
                {t('privacy.lastUpdated', 'Last updated:')} {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
