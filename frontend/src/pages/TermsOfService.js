import React from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { ShieldCheck, UserCheck, CreditCard, Scale, FileText } from 'lucide-react';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans text-gray-900 dark:text-gray-300 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl mt-16">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg dark:shadow-glow border border-gray-100 dark:border-dark-border p-8 md:p-12 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-dark-border relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              {t('terms.title', 'Terms of Service')}
            </h1>
          </div>

          <div className="space-y-12 relative z-10">
            <section className="group">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary-500 rounded-full"></span>
                {t('terms.acceptance.title', 'Acceptance of Terms')}
              </h2>
              <div className="pl-4 border-l-2 border-transparent group-hover:border-primary-100 dark:group-hover:border-primary-900/30 transition-colors">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('terms.acceptance.description',
                    'By accessing or using TutorMove, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.')}
                </p>
              </div>
            </section>

            <section className="group">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary-500" />
                {t('terms.userAccounts.title', 'User Accounts')}
              </h2>
              <div className="bg-gray-50 dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-100 dark:border-dark-border">
                <ul className="space-y-3">
                  {[
                    t('terms.userAccounts.item1', 'You must be at least 18 years old to create an account'),
                    t('terms.userAccounts.item2', 'You are responsible for maintaining the security of your account'),
                    t('terms.userAccounts.item3', 'You must provide accurate and complete information when creating an account'),
                    t('terms.userAccounts.item4', 'We reserve the right to suspend or terminate accounts that violate our terms')
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="group">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                {t('terms.tutorServices.title', 'Tutor Services')}
              </h2>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-6 border border-emerald-100/50 dark:border-emerald-800/20">
                <ul className="space-y-3">
                  {[
                    t('terms.tutorServices.item1', 'Tutors must provide accurate information about their qualifications and experience'),
                    t('terms.tutorServices.item2', 'Tutors are responsible for the quality of their services'),
                    t('terms.tutorServices.item3', 'Tutors must maintain professional conduct in all interactions'),
                    t('terms.tutorServices.item4', 'We do not guarantee the availability or quality of tutor services')
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="group">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-secondary-500" />
                {t('terms.payments.title', 'Payments and Points')}
              </h2>
              <div className="pl-4 border-l-2 border-gray-100 dark:border-dark-border group-hover:border-secondary-200 dark:group-hover:border-secondary-800 transition-colors">
                <ul className="space-y-3">
                  {[
                    t('terms.payments.item1', 'All payments are processed in points through our platform'),
                    t('terms.payments.item2', 'Points are non-refundable unless otherwise specified'),
                    t('terms.payments.item3', 'We charge a service fee for facilitating transactions'),
                    t('terms.payments.item4', 'Payment disputes must be reported within 30 days')
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary-400 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {t('terms.intellectual.title', 'Intellectual Property')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('terms.intellectual.description',
                    'All content and materials available on TutorMove are protected by intellectual property rights. Users may not copy, modify, or distribute our content without permission.')}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {t('terms.liability.title', 'Limitation of Liability')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('terms.liability.description',
                    'TutorMove is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.')}
                </p>
              </section>
            </div>

            <section className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-xl border border-amber-100 dark:border-amber-800/30">
              <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                {t('terms.changes.title', 'Changes to Terms')}
              </h2>
              <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed">
                {t('terms.changes.description',
                  'We reserve the right to modify these terms at any time. We will notify users of any material changes.')}
              </p>
            </section>

            <div className="pt-8 border-t border-gray-100 dark:border-dark-border flex items-center gap-2 text-gray-500 dark:text-gray-500 text-sm">
              <FileText className="w-4 h-4" />
              <p>
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
