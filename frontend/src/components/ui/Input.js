// src/components/ui/Input.js
import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors ${error ? 'text-rose-400' : ''}`} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            block w-full rounded-xl border bg-white dark:bg-dark-bg-secondary text-slate-900 dark:text-slate-100 placeholder-slate-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-60 disabled:bg-slate-50 dark:disabled:bg-dark-bg-tertiary
            ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3
            ${error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-dark-border focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500/20'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 ml-1 text-sm text-rose-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
