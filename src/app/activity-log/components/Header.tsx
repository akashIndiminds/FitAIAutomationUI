import React, { Dispatch, SetStateAction } from 'react';
import { Search, X, Filter, RefreshCw } from 'lucide-react';

interface ActivityLogHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isFilterVisible: boolean;
  setIsFilterVisible: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
}

export default function Header({
  searchTerm,
  setSearchTerm,
  isFilterVisible,
  setIsFilterVisible,
  isLoading,
}: ActivityLogHeaderProps) {
  return (
    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 rounded-t-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full mx-auto">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">
            Activity Log Dashboard
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-10 pr-10 py-2 w-full text-white border border-white/20 rounded-md 
                         bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-white/70"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Filters Toggle */}
          <button
            onClick={() => setIsFilterVisible(prev => !prev)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 w-full sm:w-auto transition-colors
                      ${isFilterVisible 
                        ? 'bg-white text-indigo-900 hover:bg-gray-100' 
                        : 'bg-blue-700 text-white hover:bg-indigo-600'}`}
          >
            <Filter size={18} />
            <span>{isFilterVisible ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}