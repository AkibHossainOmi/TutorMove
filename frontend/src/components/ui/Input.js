import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react';

const Input = ({
  type = 'text',
  label = '',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  error = '',
  helperText = '',
  icon: Icon = null,
  iconPosition = 'left',
  disabled = false,
  required = false,
  maxLength = null,
  showCount = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const isTextarea = type === 'textarea';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Variant styles - Purple Theme
  const variantStyles = {
    default: 'bg-white border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-md',
    filled: 'bg-purple-50/50 border-2 border-purple-100 focus:border-purple-500 focus:bg-white focus:shadow-md',
    outlined: 'bg-transparent border-2 border-gray-300 focus:border-purple-500 focus:bg-white',
  };

  // Base input styles
  const baseInputStyles = `
    w-full px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-400
    transition-all duration-200 focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantStyles[variant]}
    ${error ? 'border-red-500 focus:border-red-500' : ''}
    ${Icon && iconPosition === 'left' ? 'pl-11' : ''}
    ${Icon && iconPosition === 'right' || showCount || isPassword ? 'pr-11' : ''}
    ${className}
  `;

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  const InputElement = isTextarea ? 'textarea' : 'input';

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}

        {/* Input Field */}
        <InputElement
          type={currentType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          className={baseInputStyles}
          rows={isTextarea ? 4 : undefined}
          {...props}
        />

        {/* Right Icons/Actions */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Error Icon */}
          {error && (
            <AlertCircle size={20} className="text-red-500" />
          )}

          {/* Clear Button */}
          {value && !disabled && !isPassword && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}

          {/* Right Icon */}
          {Icon && iconPosition === 'right' && (
            <div className="text-gray-400">
              <Icon size={20} />
            </div>
          )}
        </div>
      </div>

      {/* Character Count */}
      {showCount && maxLength && (
        <div className="mt-1 text-xs text-right text-gray-500">
          {value?.length || 0} / {maxLength}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-slide-in">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'textarea']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  showCount: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'filled', 'outlined']),
  className: PropTypes.string,
};

export default Input;
