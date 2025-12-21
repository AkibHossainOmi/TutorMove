// src/components/ui/Avatar.js
import React from 'react';

export const AvatarGroup = ({ children, className = '', max }) => {
  const childrenArray = React.Children.toArray(children);
  const showMax = max && childrenArray.length > max;
  const visibleChildren = showMax ? childrenArray.slice(0, max) : childrenArray;
  const remaining = childrenArray.length - max;

  return (
    <div className={`flex -space-x-2 overflow-hidden ${className}`}>
      {visibleChildren}
      {showMax && (
        <div className="relative inline-flex items-center justify-center w-10 h-10 text-xs font-bold text-white bg-slate-400 border-2 border-white rounded-full dark:border-dark-bg">
          +{remaining}
        </div>
      )}
    </div>
  );
};

const Avatar = ({ src, alt, size = 'md', className = '', fallback }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl"
  };

  return (
    <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full rounded-full object-cover border-2 border-white dark:border-dark-bg shadow-sm"
        />
      ) : (
        <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 text-primary-700 dark:text-primary-200 font-bold border-2 border-white dark:border-dark-bg shadow-sm">
          {fallback || (alt ? alt.charAt(0).toUpperCase() : '?')}
        </div>
      )}
      <span className="absolute inset-0 rounded-full ring-1 ring-black/5 dark:ring-white/10" aria-hidden="true" />
    </div>
  );
};

export default Avatar;
