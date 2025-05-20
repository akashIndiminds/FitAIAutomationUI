import React from 'react';
import { ChevronLeft, Search, X, Clock, Download, Upload } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  activeType: 'pending' | 'downloaded' | 'imported';
  handleTypeChange: (type: 'pending' | 'downloaded' | 'imported') => void;
  fileCount: number;
  onBack: () => void;
  getStatusLabel: (type: 'pending' | 'downloaded' | 'imported') => string;
  getStatusIcon: (type: 'pending' | 'downloaded' | 'imported') => React.ReactNode; 
}

export default function Header({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  activeType,
  handleTypeChange,
  fileCount,
  onBack,
  getStatusLabel,
  getStatusIcon,
}: HeaderProps) {
  return (
    <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 rounded-t-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full mx-auto">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center text-white hover:text-gray-200 mr-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
            <input
              type="text"
              placeholder="Search files..."
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
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => handleTypeChange('pending')}
          className={`flex items-center px-4 py-2 rounded-md ${
            activeType === 'pending' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-yellow-500/20 text-white hover:bg-yellow-500/30'
          }`}
        >
          <Clock className="h-4 w-4 mr-2" />
          <span>Pending</span>
        </button>
        
        <button
          onClick={() => handleTypeChange('downloaded')}
          className={`flex items-center px-4 py-2 rounded-md ${
            activeType === 'downloaded' 
              ? 'bg-blue-500 text-white' 
              : 'bg-blue-500/20 text-white hover:bg-blue-500/30'
          }`}
        >
          <Download className="h-4 w-4 mr-2" />
          <span>Downloaded</span>
        </button>
        
        <button
          onClick={() => handleTypeChange('imported')}
          className={`flex items-center px-4 py-2 rounded-md ${
            activeType === 'imported' 
              ? 'bg-green-500 text-white' 
              : 'bg-green-500/20 text-white hover:bg-green-500/30'
          }`}
        >
          <Upload className="h-4 w-4 mr-2" />
          <span>Imported</span>
        </button>
        
        <div className="ml-auto flex items-center text-white">
          {getStatusIcon(activeType)}
          <span className="ml-2 font-medium">
            {getStatusLabel(activeType)} ({fileCount})
          </span>
        </div>
      </div>
    </div>
  );
}