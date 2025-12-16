import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({
  type = 'info',
  message = '',
  duration = 5000,
  onClose,
  action = null,
  position = 'top-right',
  showProgress = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Type configurations
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-900',
      iconColor: 'text-emerald-500',
      progressColor: 'bg-emerald-500',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-900',
      iconColor: 'text-red-500',
      progressColor: 'bg-red-500',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-500',
      progressColor: 'bg-amber-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-500',
      progressColor: 'bg-blue-500',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  // Position styles
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  // Auto-dismiss timer
  useEffect(() => {
    if (duration === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  // Animation variants
  const slideVariants = {
    hidden: {
      opacity: 0,
      x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
      y: position.includes('top') ? -20 : position.includes('bottom') ? 20 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${positionStyles[position]}`}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className={`
              glass-card min-w-[320px] max-w-md rounded-xl
              border-l-4 ${config.borderColor}
              shadow-glass-lg overflow-hidden
            `}
          >
            {/* Main Content */}
            <div className={`flex items-start gap-3 p-4 ${config.bgColor}`}>
              {/* Icon */}
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <Icon size={24} />
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${config.textColor}`}>
                  {message}
                </p>
                {action && (
                  <div className="mt-2">
                    {action}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors ${config.textColor}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            {showProgress && duration > 0 && (
              <div className="h-1 bg-gray-200">
                <motion.div
                  className={`h-full ${config.progressColor}`}
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

Toast.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  action: PropTypes.node,
  position: PropTypes.oneOf(['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center']),
  showProgress: PropTypes.bool,
};

// Toast Container Component (for managing multiple toasts)
export const ToastContainer = ({ toasts = [], onRemove }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          action={toast.action}
          position={toast.position || 'top-right'}
          showProgress={toast.showProgress !== false}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
      message: PropTypes.string.isRequired,
      duration: PropTypes.number,
      action: PropTypes.node,
      position: PropTypes.string,
      showProgress: PropTypes.bool,
    })
  ),
  onRemove: PropTypes.func.isRequired,
};

export default Toast;
