import React from 'react';

const LoadingSpinner = ({ size = '40px', color = '#007bff' }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `4px solid ${color}`,
          borderRadius: '50%',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
