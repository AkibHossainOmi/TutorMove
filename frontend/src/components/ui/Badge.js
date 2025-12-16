import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({
  children,
  variant = 'default',
  color = 'primary',
  size = 'md',
  dot = false,
  icon: Icon = null,
  className = '',
  onClick,
  removable = false,
  onRemove,
  ...props
}) => {
  // Color styles for default variant - Purple Theme
  const defaultColors = {
    primary: 'bg-purple-100 text-purple-700 border-purple-200',
    secondary: 'bg-violet-100 text-violet-700 border-violet-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  // Color styles for outline variant - Purple Theme
  const outlineColors = {
    primary: 'border-2 border-purple-500 text-purple-600 bg-transparent',
    secondary: 'border-2 border-violet-500 text-violet-600 bg-transparent',
    success: 'border-2 border-emerald-500 text-emerald-600 bg-transparent',
    warning: 'border-2 border-amber-500 text-amber-600 bg-transparent',
    error: 'border-2 border-red-500 text-red-600 bg-transparent',
    info: 'border-2 border-blue-500 text-blue-600 bg-transparent',
    neutral: 'border-2 border-gray-500 text-gray-600 bg-transparent',
  };

  // Color styles for soft variant - Purple Theme
  const softColors = {
    primary: 'bg-purple-100 text-purple-700 border border-purple-200',
    secondary: 'bg-violet-100 text-violet-700 border border-violet-200',
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  // Dot colors - Purple Theme
  const dotColors = {
    primary: 'bg-purple-500',
    secondary: 'bg-violet-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
  };

  // Size styles
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  // Icon sizes
  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
  };

  // Variant styles
  const variantStyleMap = {
    default: defaultColors[color],
    outline: outlineColors[color],
    soft: softColors[color],
  };

  // Base styles
  const baseStyles = 'inline-flex items-center rounded-full font-medium transition-all duration-200';

  // Interactive styles
  const interactiveStyles = onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : '';

  // Combined className
  const badgeClasses = `
    ${baseStyles}
    ${variantStyleMap[variant]}
    ${sizeStyles[size]}
    ${interactiveStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span
      className={badgeClasses}
      onClick={onClick}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[color]} animate-pulse`} />
      )}

      {/* Icon */}
      {Icon && (
        <Icon size={iconSizes[size]} />
      )}

      {/* Content */}
      <span>{children}</span>

      {/* Remove button */}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outline', 'soft']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  dot: PropTypes.bool,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  onClick: PropTypes.func,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
};

export default Badge;
