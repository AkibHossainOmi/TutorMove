import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  variant = 'white',
  hoverable = false,
  padding = 'default',
  className = '',
  onClick,
  ...props
}) => {
  // Variant styles - Purple Theme
  const variantStyles = {
    white: 'bg-white shadow-flat border border-purple-100/50',
    primary: 'bg-purple-50 shadow-flat border border-purple-100',
    secondary: 'bg-purple-100/50 shadow-flat border border-purple-200/50',
    gray: 'bg-gray-50 shadow-flat border border-gray-100',
    gradient: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  // Hover styles
  const hoverStyles = hoverable ? 'hover-lift cursor-pointer' : '';

  // Combined className
  const cardClasses = `
    rounded-xl
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${hoverStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['white', 'primary', 'secondary', 'gray', 'gradient']),
  hoverable: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

// Card Header Component
export const CardHeader = ({
  children,
  title,
  icon: Icon = null,
  actions = null,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700">
            <Icon size={20} className="text-white" />
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        )}
        {!title && children}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  icon: PropTypes.elementType,
  actions: PropTypes.node,
  className: PropTypes.string,
};

// Card Body Component
export const CardBody = ({
  children,
  className = '',
}) => {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  );
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Card Footer Component
export const CardFooter = ({
  children,
  className = '',
  divided = false,
}) => {
  return (
    <div className={`mt-4 pt-4 ${divided ? 'border-t border-gray-200' : ''} ${className}`}>
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  divided: PropTypes.bool,
};

export default Card;
