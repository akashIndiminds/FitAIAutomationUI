import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FiltersProps {
  fileStatusFilter: string;
  setFileStatusFilter: (status: string) => void;
  dirFilter: string;
  setDirFilter: (dir: string) => void;
  segmentFilter: string;
  setSegmentFilter: (segment: string) => void;
  uniqueDirs: string[];
  uniqueSegments: string[];
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  setSearchTerm: (term: string) => void;
  onClose: () => void;
}

export function Filters({
  fileStatusFilter,
  setFileStatusFilter,
  dirFilter,
  setDirFilter,
  segmentFilter,
  setSegmentFilter,
  uniqueDirs,
  uniqueSegments,
  itemsPerPage,
  setItemsPerPage,
  setSearchTerm,
  onClose
}: FiltersProps) {
  const fileStatusTypes = ['Completed', 'Downloaded', 'Pending'];
  const itemsPerPageOptions = [5, 10, 25, 50, 100];
  
  // State for search input
  const [searchInput, setSearchInput] = useState("");
  
  // Track active filters count for badge
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  // Debounce search term updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput, setSearchTerm]);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (fileStatusFilter) count++;
    if (dirFilter) count++;
    if (segmentFilter) count++;
    if (itemsPerPage !== 10) count++;
    if (searchInput) count++;
    
    setActiveFiltersCount(count);
  }, [fileStatusFilter, dirFilter, segmentFilter, itemsPerPage, searchInput]);

  const handleReset = () => {
    setFileStatusFilter('');
    setDirFilter('');
    setSegmentFilter('');
    setItemsPerPage(10);
    setSearchInput("");
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 w-full transition-all duration-300 ease-in-out">
      {/* Filters in a single row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter as Pills */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1.5">Status</label>
          <div className="inline-flex items-center p-0.5 bg-gray-50 rounded-lg">
            <button
              onClick={() => setFileStatusFilter('')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                fileStatusFilter === '' 
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {fileStatusTypes.map((status) => (
              <button
                key={status}
                onClick={() => setFileStatusFilter(fileStatusFilter === status ? '' : status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  fileStatusFilter === status 
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Filter - Styled Dropdown */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1.5">Directory</label>
          <div className="relative">
            <select
              value={dirFilter}
              onChange={(e) => setDirFilter(e.target.value)}
              className={`appearance-none pl-3 pr-8 py-2 rounded-md border text-sm ${
                dirFilter ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-gray-200 bg-gray-50 text-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]`}
            >
              <option value="">All Directories</option>
              {uniqueDirs.map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {dirFilter && (
              <button 
                onClick={() => setDirFilter('')}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Segment Filter - Styled Dropdown */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1.5">Segment</label>
          <div className="relative">
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className={`appearance-none pl-3 pr-8 py-2 rounded-md border text-sm ${
                segmentFilter ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-gray-200 bg-gray-50 text-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]`}
            >
              <option value="">All Segments</option>
              {uniqueSegments.map(segment => (
                <option key={segment} value={segment}>{segment}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {segmentFilter && (
              <button 
                onClick={() => setSegmentFilter('')}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Items Per Page as Badge Buttons */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1.5">Items per page</label>
          <div className="inline-flex items-center overflow-hidden rounded-md border border-gray-200">
            {itemsPerPageOptions.map((option) => (
              <button
                key={option}
                onClick={() => setItemsPerPage(option)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  itemsPerPage === option 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-r border-gray-200'
                } last:border-r-0`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        {/* Active Filters Summary */}
        <AnimatePresence>
          {activeFiltersCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="ml-auto flex items-center bg-blue-50 text-blue-800 px-3 py-1.5 rounded-md border border-blue-100"
            >
              <span className="text-xs font-medium mr-1">Active filters:</span>
              <span className="text-xs font-bold">{activeFiltersCount}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
