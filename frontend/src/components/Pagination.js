import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  maxVisiblePages = 5
}) => {
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const buttonStyle = {
    padding: '8px 12px',
    margin: '0 4px',
    border: '1px solid #dee2e6',
    backgroundColor: 'white',
    color: '#007bff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'all 0.2s'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    cursor: 'not-allowed',
    opacity: 0.65
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '20px 0',
      gap: '4px'
    }}>
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#007bff';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#dee2e6';
          }
        }}
      >
        «
      </button>

      {/* Previous Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#007bff';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#dee2e6';
          }
        }}
      >
        ‹
      </button>

      {/* Page Numbers */}
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          style={number === currentPage ? activeButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (number !== currentPage) {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.borderColor = '#007bff';
            }
          }}
          onMouseLeave={(e) => {
            if (number !== currentPage) {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#dee2e6';
            }
          }}
        >
          {number}
        </button>
      ))}

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#007bff';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages) {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#dee2e6';
          }
        }}
      >
        ›
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#007bff';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages) {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#dee2e6';
          }
        }}
      >
        »
      </button>
    </div>
  );
};

export default Pagination;
