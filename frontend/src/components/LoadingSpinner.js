// src/components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = '40px' }) => {
  return (
    <div className="flex justify-center items-center p-8">
      <div
        className="animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"
        style={{ width: size, height: size }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
