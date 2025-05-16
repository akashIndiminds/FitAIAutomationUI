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
  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          goToPage(1);
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
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageButtons.map(page => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === page ? 'bg-blue-600 text-white' : 'bg-white'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50"
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