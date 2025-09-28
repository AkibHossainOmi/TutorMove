import React from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <>
      <Navbar/>
    <div style={{ height: '50px' }}></div>
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', color: '#212529' }}>
        {t('terms.title', 'Terms of Service')}
      </h1>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('terms.acceptance.title', 'Acceptance of Terms')}
        </h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#495057' }}>
          {t('terms.acceptance.description', 
            'By accessing or using TutorMove, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('terms.userAccounts.title', 'User Accounts')}
        </h2>
        <ul style={{ paddingLeft: '20px', color: '#495057' }}>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.userAccounts.item1', 
              'You must be at least 18 years old to create an account')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.userAccounts.item2', 
              'You are responsible for maintaining the security of your account')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.userAccounts.item3', 
              'You must provide accurate and complete information when creating an account')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.userAccounts.item4', 
              'We reserve the right to suspend or terminate accounts that violate our terms')}
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('terms.tutorServices.title', 'Tutor Services')}
        </h2>
        <ul style={{ paddingLeft: '20px', color: '#495057' }}>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.tutorServices.item1', 
              'Tutors must provide accurate information about their qualifications and experience')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.tutorServices.item2', 
              'Tutors are responsible for the quality of their services')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.tutorServices.item3', 
              'Tutors must maintain professional conduct in all interactions')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.tutorServices.item4', 
              'We do not guarantee the availability or quality of tutor services')}
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('terms.payments.title', 'Payments and Points')}
        </h2>
        <ul style={{ paddingLeft: '20px', color: '#495057' }}>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.payments.item1', 
              'All payments are processed in points through our platform')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.payments.item2', 
              'Points are non-refundable unless otherwise specified')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.payments.item3', 
              'We charge a service fee for facilitating transactions')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('terms.payments.item4', 
              'Payment disputes must be reported within 30 days')}
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('terms.intellectual.title', 'Intellectual Property')}
        </h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#495057' }}>
          {t('terms.intellectual.description', 
            'All content and materials available on TutorMove are protected by intellectual property rights. Users may not copy, modify, or distribute our content without permission.')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('terms.liability.title', 'Limitation of Liability')}
        </h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#495057' }}>
          {t('terms.liability.description', 
            'TutorMove is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('terms.changes.title', 'Changes to Terms')}
        </h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#495057' }}>
          {t('terms.changes.description', 
            'We reserve the right to modify these terms at any time. We will notify users of any material changes.')}
        </p>
      </section>

      <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '40px' }}>
        {t('terms.lastUpdated', 'Last updated:')} {new Date().toLocaleDateString()}
      </p>
    </div>
    <div style={{ height: '100px' }}></div>
    <Footer/>
    </>
  );
};

export default TermsOfService;
