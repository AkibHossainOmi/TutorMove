import React from 'react';
import PropTypes from 'prop-types';
import { User } from 'lucide-react';

const Avatar = ({
  src = null,
  alt = '',
  size = 'md',
  status = null,
  fallback = null,
  bordered = false,
  className = '',
  onClick,
  ...props
}) => {
  // Size styles
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl',
  };

  // Status styles
  const statusStyles = {
    online: 'bg-emerald-500 ring-2 ring-white',
    offline: 'bg-gray-400 ring-2 ring-white',
    busy: 'bg-red-500 ring-2 ring-white',
    away: 'bg-amber-500 ring-2 ring-white',
  };

  // Status indicator sizes
  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
    '3xl': 'w-5 h-5',
  };

  // Icon sizes
  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  };

  // Base styles
  const baseStyles = 'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium';

  // Border style
  const borderStyle = bordered
    ? 'ring-4 ring-white shadow-md'
    : '';

  // Interactive styles
  const interactiveStyles = onClick ? 'cursor-pointer hover:ring-4 hover:ring-primary-100 transition-all duration-200' : '';

  // Combined className
  const avatarClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${borderStyle}
    ${interactiveStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Get initials from fallback text
  const getInitials = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = fallback ? getInitials(fallback) : '';

  return (
    <div className="relative inline-block">
      <div
        className={avatarClasses}
        onClick={onClick}
        {...props}
      >
        {/* Image */}
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : initials ? (
          /* Initials */
          <span className="select-none">{initials}</span>
        ) : (
          /* Default Icon */
          <User size={iconSizes[size]} />
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full
            ${statusStyles[status]}
            ${statusSizes[size]}
          `}
          aria-label={status}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  fallback: PropTypes.string,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

// Avatar Group Component
export const AvatarGroup = ({
  children,
  max = 3,
  size = 'md',
  className = '',
}) => {
  const avatars = React.Children.toArray(children);
  const displayedAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  // Size for the "+n" avatar
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
    '3xl': 'w-24 h-24 text-2xl',
  };

  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {displayedAvatars.map((avatar, index) => (
        <div key={index} className="relative" style={{ zIndex: displayedAvatars.length - index }}>
          {React.cloneElement(avatar, { size })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            relative inline-flex items-center justify-center rounded-full
            bg-gray-200 text-gray-600 font-medium ring-2 ring-white
            ${sizeStyles[size]}
          `}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

AvatarGroup.propTypes = {
  children: PropTypes.node.isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  className: PropTypes.string,
};

export default Avatar;
