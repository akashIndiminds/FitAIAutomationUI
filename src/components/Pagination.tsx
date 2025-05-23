import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalFiles: number;
  filesPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  totalFiles,
  filesPerPage,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const [jumpToPage, setJumpToPage] = useState('');
  const totalPages = Math.ceil(totalFiles / filesPerPage);

  // Guard against invalid currentPage values
  if (currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages || 1;
  }

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7; // Increased for better navigation

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      // Adjust if range is lopsided
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 5);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 4);
      }

      // Add ellipsis if needed before the range
      if (startPage > 2) {
        pages.push('...');
      } else if (startPage === 2) {
        pages.push(2);
      }

      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages && i !== startPage - 1) {
          pages.push(i);
        }
      }

      // Add ellipsis if needed after the range
      if (endPage < totalPages - 1) {
        pages.push('...');
      } else if (endPage === totalPages - 1) {
        pages.push(totalPages - 1);
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
    setJumpToPage('');
  };

  const handleKeyDown = (e: { key: string; preventDefault: () => void; }) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleJumpToPage();
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="w-full flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-1 md:space-x-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden md:flex items-center px-2 py-2 text-sm font-medium rounded-md border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="First page"
        >
          <ChevronLeft size={14} className="mr-1" />
          <ChevronLeft size={14} />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-2 py-2 text-sm font-medium rounded-md border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center">
          {getPageNumbers().map((page, index) =>
            typeof page === 'string' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500 text-sm font-medium"
              >
                {page}
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300'
                  }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-2 py-2 text-sm font-medium rounded-md border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden md:flex items-center px-2 py-2 text-sm font-medium rounded-md border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Last page"
        >
          <ChevronRight size={14} />
          <ChevronRight size={14} className="ml-1" />
        </button>
      </div>
      
      {totalPages > 7 && (
        <div className="flex items-center text-sm">
          <span className="text-gray-600 mr-2">Go to page:</span>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-16 h-8 rounded-md border border-gray-300 px-2 text-center"
              aria-label="Jump to page"
            />
            <button
              onClick={handleJumpToPage}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Go
            </button>
          </div>
          <span className="ml-2 text-gray-600">of {totalPages}</span>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        Showing page {currentPage} of {totalPages}
      </div>
    </div>
  );
}