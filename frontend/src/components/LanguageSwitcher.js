import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'bn', label: 'বাংলা' }, // Bengali (Bangladesh, India)
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ur', label: 'اردو' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  // --- Inline Styles ---
  const selectStyle = {
    padding: '10px 25px', // More padding for a larger touch area
    borderRadius: '8px', // Softer, more modern rounded corners
    border: '1px solid #ced4da', // Light grey border
    backgroundColor: '#ffffff', // White background
    fontSize: '16px', // Readable font size
    color: '#495057', // Darker text color
    appearance: 'none', // Remove default browser select arrow for custom styling
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`, // Custom SVG arrow
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center', // Position custom arrow
    backgroundSize: '12px',
    cursor: 'pointer', // Indicate clickable
    outline: 'none', // Remove outline on focus
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)', // Subtle shadow
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease', // Smooth transitions
    fontFamily: '"Segoe UI", Arial, sans-serif', // Modern font stack
    minWidth: '120px', // Ensure a minimum width
  };

  const selectFocusHoverStyle = {
    borderColor: '#007bff', // Blue border on focus/hover
    boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)', // Glow effect on focus/hover
  };

  return (
    <select
      value={i18n.language}
      onChange={e => i18n.changeLanguage(e.target.value)}
      style={selectStyle}
      // Add hover and focus styles
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, selectFocusHoverStyle)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, selectStyle)} // Reset on mouse leave
      onFocus={(e) => Object.assign(e.currentTarget.style, selectFocusHoverStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, selectStyle)} // Reset on blur
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;