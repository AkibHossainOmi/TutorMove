// src/components/ui/Card.js
import React from 'react';
import { motion } from 'framer-motion';

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-slate-100 dark:border-dark-border ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-slate-50/50 dark:bg-dark-bg/50 border-t border-slate-100 dark:border-dark-border ${className}`}>
    {children}
  </div>
);

const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  noPadding = false,
  onClick
}) => {
  const baseStyles = "relative rounded-2xl overflow-hidden transition-all duration-300";

  const bgStyles = glass
    ? "bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-glass dark:shadow-glass-dark"
    : "bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-elevation-1 dark:shadow-elevation-dark-1";

  const hoverStyles = hover
    ? "hover:shadow-elevation-3 dark:hover:shadow-elevation-dark-3 hover:border-primary-100 dark:hover:border-dark-border-hover cursor-pointer"
    : "";

  const paddingStyles = noPadding ? "" : "p-6";

  const Wrapper = hover ? motion.div : 'div';
  const animationProps = hover ? {
    whileHover: { y: -4 },
    transition: { type: "spring", stiffness: 300 }
  } : {};

  return (
    <Wrapper
      className={`${baseStyles} ${bgStyles} ${hoverStyles} ${paddingStyles} ${className}`}
      onClick={onClick}
      {...animationProps}
    >
      {children}
    </Wrapper>
  );
};

export default Card;
