// src/components/ui/Badge.js
import React from 'react';

const variants = {
  primary: "bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800",
  secondary: "bg-secondary-50 text-secondary-700 border-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-800",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  warning: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  error: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  neutral: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  outline: "bg-transparent text-slate-600 border-slate-300 dark:text-slate-400 dark:border-slate-700"
};

const Badge = ({ children, variant = 'primary', className = '', icon: Icon, onClick }) => {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
        ${variants[variant]}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </Component>
  );
};

export default Badge;
