import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Select = ({
  options = [],
  value = null,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  multiple = false,
  disabled = false,
  error = '',
  label = '',
  required = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Handle option selection
  const handleSelect = (option) => {
    if (multiple) {
      const currentValue = value || [];
      const isSelected = currentValue.some((v) => v.value === option.value);
      const newValue = isSelected
        ? currentValue.filter((v) => v.value !== option.value)
        : [...currentValue, option];
      onChange(newValue);
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Remove selected option (for multiple)
  const handleRemove = (optionToRemove, e) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v.value !== optionToRemove.value);
    onChange(newValue);
  };

  // Check if option is selected
  const isSelected = (option) => {
    if (multiple) {
      return value && value.some((v) => v.value === option.value);
    }
    return value && value.value === option.value;
  };

  // Get display value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    if (multiple) {
      return value.length > 0 ? `${value.length} selected` : placeholder;
    }
    return value.label;
  };

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
      },
    },
  };

  return (
    <div className={`w-full ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full glass-card border-2 border-transparent
          px-4 py-2.5 rounded-lg text-left
          flex items-center justify-between gap-2
          transition-all duration-200
          ${isOpen ? 'border-primary-500 shadow-glass-lg' : ''}
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300 cursor-pointer'}
        `}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {/* Multiple Selected Values */}
          {multiple && value && value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-sm rounded-md"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(option, e)}
                    className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className={value ? 'text-gray-900' : 'text-gray-400'}>
              {getDisplayValue()}
            </span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="relative z-50"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="absolute top-2 left-0 right-0 glass-card rounded-lg shadow-glass-xl max-h-60 overflow-hidden">
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-white/20">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="overflow-y-auto max-h-48 p-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`
                        w-full px-3 py-2 rounded-md text-left
                        flex items-center justify-between gap-2
                        transition-colors duration-150
                        ${
                          isSelected(option)
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="flex-1">{option.label}</span>
                      {isSelected(option) && (
                        <Check size={18} className="text-primary-600" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No options found
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
  ]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  searchable: PropTypes.bool,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Select;
