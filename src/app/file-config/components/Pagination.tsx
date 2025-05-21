import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  setPageSize,
  goToPage,
}: PaginationProps) {
  // Determine which page buttons to show (handle case with many pages)
  const getPageButtons = () => {
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // When there are many pages, use ellipses
    if (currentPage <= 3) {
      // Near the start: show 1 2 3 4 5 ... n
      return [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      // Near the end: show 1 ... n-4 n-3 n-2 n-1 n
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      // In the middle: show 1 ... p-1 p p+1 ... n
      return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  };

  const pageButtons = getPageButtons();

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          goToPage(1); // Reset to page 1 only when changing page size
        }}
        className="px-3 py-2 rounded-md border border-gray-300"
      >
        {[10, 20, 50].map(size => (
          <option key={size} value={size}>{size} per page</option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
          aria-label="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-1">
          {pageButtons.map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => goToPage(page)}
                className={`min-w-8 h-8 flex items-center justify-center px-3 py-1 rounded-md border ${
                  currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-1">...</span>
            )
          ))}
        </div>
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
          aria-label="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}