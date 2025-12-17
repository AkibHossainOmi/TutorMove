import React from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { Shield, Lock, Database, Bell, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans text-gray-900 dark:text-gray-300 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl mt-16">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg dark:shadow-glow border border-gray-100 dark:border-dark-border p-8 md:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary-500/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-dark-border relative z-10">
            <div className="w-12 h-12 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center text-secondary-600 dark:text-secondary-400">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              {t('privacy.title', 'Privacy Policy')}
            </h1>
          </div>

          <div className="space-y-12 relative z-10">
            <section className="group">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-secondary-500" />
                {t('privacy.dataCollection.title', 'Information We Collect')}
              </h2>
              <div className="pl-4 border-l-2 border-transparent group-hover:border-secondary-100 dark:group-hover:border-secondary-900/30 transition-colors">
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {t('privacy.dataCollection.description', 'We collect information that you provide directly to us, including:')}
                </p>
                <div className="bg-gray-50 dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-100 dark:border-dark-border">
                  <ul className="space-y-3">
                    {[
                      t('privacy.dataCollection.item1', 'Personal information such as name, email address, and phone number'),
                      t('privacy.dataCollection.item2', 'Profile information including educational background and teaching experience'),
                      t('privacy.dataCollection.item3', 'Communication data between tutors and students'),
                      t('privacy.dataCollection.item4', 'Payment and transaction information')
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary-400 mt-2 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="group">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-500" />
                {t('privacy.dataUse.title', 'How We Use Your Information')}
              </h2>
              <div className="pl-4 border-l-2 border-transparent group-hover:border-primary-100 dark:group-hover:border-primary-900/30 transition-colors">
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {t('privacy.dataUse.description', 'We use the information we collect to:')}
                </p>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {[
                    t('privacy.dataUse.item1', 'Facilitate connections between tutors and students'),
                    t('privacy.dataUse.item2', 'Process payments and maintain financial records'),
                    t('privacy.dataUse.item3', 'Send notifications about relevant opportunities'),
                    t('privacy.dataUse.item4', 'Improve our services and user experience')
                  ].map((item, i) => (
                    <li key={i} className="bg-primary-50/50 dark:bg-primary-900/10 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-primary-100/50 dark:border-primary-800/20">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="group">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                {t('privacy.dataSecurity.title', 'Data Security')}
              </h2>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-6 border border-emerald-100/50 dark:border-emerald-800/20">
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {t('privacy.dataSecurity.description', 'We implement appropriate security measures to protect your personal information. These measures include:')}
                </p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {[
                    t('privacy.dataSecurity.item1', 'Encryption of sensitive data'),
                    t('privacy.dataSecurity.item2', 'Secure payment processing'),
                    t('privacy.dataSecurity.item3', 'Regular security assessments'),
                    t('privacy.dataSecurity.item4', 'Access controls and authentication')
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="bg-gray-50 dark:bg-dark-bg-secondary p-8 rounded-2xl border border-gray-100 dark:border-dark-border text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('privacy.contact.title', 'Contact Us')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                {t('privacy.contact.description', 'If you have any questions about our Privacy Policy, please contact us at:')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm font-medium">
                <div className="px-6 py-3 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                  <span className="text-gray-500 dark:text-gray-400 mr-2">Email:</span>
                  <span className="text-primary-600 dark:text-primary-400">privacy@tutormove.com</span>
                </div>
                <div className="px-6 py-3 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                  <span className="text-gray-500 dark:text-gray-400 mr-2">Phone:</span>
                  <span className="text-gray-900 dark:text-white">+1 (555) 123-4567</span>
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-gray-100 dark:border-dark-border flex items-center gap-2 text-gray-500 dark:text-gray-500 text-sm">
              <FileText className="w-4 h-4" />
              <p>
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
