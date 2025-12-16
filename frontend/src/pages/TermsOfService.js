import React from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl mt-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">
            {t('terms.title', 'Terms of Service')}
          </h1>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('terms.acceptance.title', 'Acceptance of Terms')}
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('terms.acceptance.description',
                  'By accessing or using TutorMove, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('terms.userAccounts.title', 'User Accounts')}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  {t('terms.userAccounts.item1',
                    'You must be at least 18 years old to create an account')}
                </li>
                <li>
                  {t('terms.userAccounts.item2',
                    'You are responsible for maintaining the security of your account')}
                </li>
                <li>
                  {t('terms.userAccounts.item3',
                    'You must provide accurate and complete information when creating an account')}
                </li>
                <li>
                  {t('terms.userAccounts.item4',
                    'We reserve the right to suspend or terminate accounts that violate our terms')}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('terms.tutorServices.title', 'Tutor Services')}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  {t('terms.tutorServices.item1',
                    'Tutors must provide accurate information about their qualifications and experience')}
                </li>
                <li>
                  {t('terms.tutorServices.item2',
                    'Tutors are responsible for the quality of their services')}
                </li>
                <li>
                  {t('terms.tutorServices.item3',
                    'Tutors must maintain professional conduct in all interactions')}
                </li>
                <li>
                  {t('terms.tutorServices.item4',
                    'We do not guarantee the availability or quality of tutor services')}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('terms.payments.title', 'Payments and Points')}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  {t('terms.payments.item1',
                    'All payments are processed in points through our platform')}
                </li>
                <li>
                  {t('terms.payments.item2',
                    'Points are non-refundable unless otherwise specified')}
                </li>
                <li>
                  {t('terms.payments.item3',
                    'We charge a service fee for facilitating transactions')}
                </li>
                <li>
                  {t('terms.payments.item4',
                    'Payment disputes must be reported within 30 days')}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('terms.intellectual.title', 'Intellectual Property')}
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('terms.intellectual.description',
                  'All content and materials available on TutorMove are protected by intellectual property rights. Users may not copy, modify, or distribute our content without permission.')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('terms.liability.title', 'Limitation of Liability')}
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('terms.liability.description',
                  'TutorMove is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {t('terms.changes.title', 'Changes to Terms')}
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('terms.changes.description',
                  'We reserve the right to modify these terms at any time. We will notify users of any material changes.')}
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100">
              <p className="text-slate-500 text-sm">
                {t('terms.lastUpdated', 'Last updated:')} {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
