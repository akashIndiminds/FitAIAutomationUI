import { Filter, XCircle, Check } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface FiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  setSearchTerm: (term: string) => void;
  onClose: () => void;
}

export function Filters({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  itemsPerPage,
  setItemsPerPage,
  setSearchTerm,
  onClose
}: FiltersProps) {
  const fileTypes = ['gz', 'pdf', 'xlsx', 'json', 'xml'];
  const statusTypes = ['Completed', 'Pending', 'Failed'];
  const itemsPerPageOptions = [5, 10, 25, 50, 100];

  const handleReset = () => {
    setStatusFilter('');
    setTypeFilter('');
    setItemsPerPage(10);
    setSearchTerm('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 mb-4 shadow-sm w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <Filter size={18} className="mr-2" />
          Filter Options
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center"
          >
            <XCircle size={14} className="mr-1" />
            Reset All
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close filters"
          >
            <XCircle size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusTypes.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                className={`px-3 py-2 rounded-md text-sm flex items-center transition-colors
                          ${statusFilter === status 
                             ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                             : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}`}
              >
                {statusFilter === status && <Check size={14} className="mr-1" />}
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* File Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">File Type</label>
          <div className="flex flex-wrap gap-2">
            {fileTypes.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                className={`px-3 py-2 rounded-md text-sm flex items-center transition-colors
                          ${typeFilter === type 
                             ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                             : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}`}
              >
                {typeFilter === type && <Check size={14} className="mr-1" />}
                .{type}
              </button>
            ))}
          </div>
        </div>

        {/* Items Per Page */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Items Per Page</label>
          <div className="flex flex-wrap gap-2">
            {itemsPerPageOptions.map((option) => (
              <button
                key={option}
                onClick={() => setItemsPerPage(option)}
                className={`px-3 py-2 rounded-md text-sm flex items-center transition-colors
                          ${itemsPerPage === option 
                             ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                             : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}`}
              >
                {itemsPerPage === option && <Check size={14} className="mr-1" />}
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}