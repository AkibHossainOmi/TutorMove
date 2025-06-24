import React from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <>
    <Navbar/>
    <div style={{ height: '50px' }}></div>
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', color: '#212529' }}>
        {t('privacy.title', 'Privacy Policy')}
      </h1>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('privacy.dataCollection.title', 'Information We Collect')}
        </h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#495057' }}>
          {t('privacy.dataCollection.description', 
            'We collect information that you provide directly to us, including:')}
        </p>
        <ul style={{ paddingLeft: '20px', color: '#495057' }}>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataCollection.item1', 
              'Personal information such as name, email address, and phone number')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataCollection.item2', 
              'Profile information including educational background and teaching experience')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataCollection.item3', 
              'Communication data between tutors and students')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataCollection.item4', 
              'Payment and transaction information')}
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('privacy.dataUse.title', 'How We Use Your Information')}
        </h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#495057' }}>
          {t('privacy.dataUse.description', 
            'We use the information we collect to:')}
        </p>
        <ul style={{ paddingLeft: '20px', color: '#495057' }}>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataUse.item1', 
              'Facilitate connections between tutors and students')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataUse.item2', 
              'Process payments and maintain financial records')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataUse.item3', 
              'Send notifications about relevant opportunities')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataUse.item4', 
              'Improve our services and user experience')}
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('privacy.dataSecurity.title', 'Data Security')}
        </h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#495057' }}>
          {t('privacy.dataSecurity.description', 
            'We implement appropriate security measures to protect your personal information. These measures include:')}
        </p>
        <ul style={{ paddingLeft: '20px', color: '#495057' }}>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataSecurity.item1', 
              'Encryption of sensitive data')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataSecurity.item2', 
              'Secure payment processing')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataSecurity.item3', 
              'Regular security assessments')}
          </li>
          <li style={{ marginBottom: '10px' }}>
            {t('privacy.dataSecurity.item4', 
              'Access controls and authentication')}
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>
          {t('privacy.contact.title', 'Contact Us')}
        </h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#495057' }}>
          {t('privacy.contact.description', 
            'If you have any questions about our Privacy Policy, please contact us at:')}
        </p>
        <p style={{ color: '#495057' }}>
          Email: privacy@tutormove.com<br />
          Phone: +1 (555) 123-4567
        </p>
      </section>

      <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '40px' }}>
        {t('privacy.lastUpdated', 'Last updated:')} {new Date().toLocaleDateString()}
      </p>
    </div>
    <div style={{ height: '100px' }}></div>
    <Footer/>
    </>
  );
};

export default PrivacyPolicy;
