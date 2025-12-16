// src/components/Pagination.js
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

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const Button = ({ children, onClick, active, disabled, className = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${active
          ? 'z-10 bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 focus:ring-2 focus:ring-slate-200'}
        ${disabled
          ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
          : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 py-8">
      <Button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="hidden sm:inline-flex"
      >
        First
      </Button>

      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="sr-only">Previous</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      <div className="flex gap-1">
        {pageNumbers.map(number => (
          <Button
            key={number}
            onClick={() => onPageChange(number)}
            active={number === currentPage}
          >
            {number}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="sr-only">Next</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>

      <Button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="hidden sm:inline-flex"
      >
        Last
      </Button>
    </div>
  );
};

export default Pagination;
