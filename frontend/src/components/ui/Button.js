// src/components/ui/Button.js
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 border-transparent hover:shadow-primary-500/40",
  secondary: "bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-bg-secondary hover:border-slate-300 dark:hover:border-dark-border-hover shadow-sm",
  accent: "bg-gradient-to-r from-secondary-500 to-pink-500 text-white shadow-lg shadow-secondary-500/25 border-transparent hover:shadow-secondary-500/40",
  ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg-secondary hover:text-slate-900 dark:hover:text-slate-200 border-transparent shadow-none",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 border-transparent",
  success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 border-transparent",
  outline: "bg-transparent border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg"
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-dark-bg disabled:opacity-60 disabled:cursor-not-allowed border";

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02, y: disabled || isLoading ? 0 : -1 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;
