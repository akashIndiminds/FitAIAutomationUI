import React, { useState } from 'react';
import { ChevronLeft, Search, X, Clock, Download, Upload, Filter, Grid, List, ChevronDown } from 'lucide-react';

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
  selectedSegments?: string[];
  onSegmentFilter?: (segments: string[]) => void;
  availableSegments?: string[];
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
  selectedSegments = [],
  onSegmentFilter = () => {},
  availableSegments = ['FO', 'CM'],
}: HeaderProps) {
  const [showSegmentFilter, setShowSegmentFilter] = useState(false);

  const handleSegmentToggle = (segment: string) => {
    const newSegments = selectedSegments.includes(segment)
      ? selectedSegments.filter(s => s !== segment)
      : [...selectedSegments, segment];
    onSegmentFilter(newSegments);
  };

  const getTypeConfig = (type: 'pending' | 'downloaded' | 'imported') => {
    switch (type) {
      case 'pending':
        return {
          icon: Clock,
          color: 'from-amber-500 to-orange-500',
          bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
          activeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
          hoverBg: 'hover:from-amber-500/30 hover:to-orange-500/30',
        };
      case 'downloaded':
        return {
          icon: Download,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
          activeBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          hoverBg: 'hover:from-blue-500/30 hover:to-cyan-500/30',
        };
      case 'imported':
        return {
          icon: Upload,
          color: 'from-emerald-500 to-green-500',
          bgColor: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20',
          activeBg: 'bg-gradient-to-r from-emerald-500 to-green-500',
          hoverBg: 'hover:from-emerald-500/30 hover:to-green-500/30',
        };
    }
  };

  return (
    <div className="relative">
      {/* Main Header with Rounded Edges */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden rounded-xl shadow-lg">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-4 right-20 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse"></div>

        <div className="relative px-6 py-6">
          {/* Top Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center text-white/90 hover:text-white transition-all duration-300 group w-fit"
            >
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300 mr-3">
                <ChevronLeft className="h-5 w-5" />
              </div>
              <span className="font-medium">Back to Dashboard</span>
            </button>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 lg:flex-none lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 lg:w-80">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                  <input
                    type="text"
                    placeholder="Search files, segments, directories..."
                    className="w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-2xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter and View Controls */}
              <div className="flex items-center gap-3">
                {/* Segment Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowSegmentFilter(!showSegmentFilter)}
                    className={`flex items-center px-4 py-3 rounded-xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
                      selectedSegments.length > 0
                        ? 'bg-blue-500/20 border-blue-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      {selectedSegments.length > 0 ? `${selectedSegments.length} Segments` : 'Filter'}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 ml-2 transition-transform duration-200 ${showSegmentFilter ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Segment Dropdown with Animation */}
                  {showSegmentFilter && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50 transition-all duration-200 ease-in-out opacity-100">
                      <div className="p-4 ">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Market Segments</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {availableSegments.map((segment) => (
                            <button
                              key={segment}
                              onClick={() => handleSegmentToggle(segment)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                selectedSegments.includes(segment)
                                  ? 'bg-blue-500 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {segment}
                            </button>
                          ))}
                        </div>
                        {selectedSegments.length > 0 && (
                          <button
                            onClick={() => onSegmentFilter([])}
                            className="w-full mt-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2.5 rounded-lg transition-all duration-300 ${
                      viewMode === 'table'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {(['pending', 'downloaded', 'imported'] as const).map((type) => {
                const config = getTypeConfig(type);
                const Icon = config.icon;
                const isActive = activeType === type;

                return (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`group relative flex items-center px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? `${config.activeBg} shadow-xl shadow-black/20`
                        : `${config.bgColor} backdrop-blur-xl border border-white/20 ${config.hoverBg}`
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 ${config.activeBg} rounded-2xl blur-xl opacity-50 -z-10`}></div>
                    )}
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="capitalize">{type}</span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* File Count Badge */}
            <div className="flex items-center bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">
              <div className="flex items-center text-white">
                {getStatusIcon(activeType)}
                <span className="ml-3 font-semibold text-lg">{getStatusLabel(activeType)}</span>
                <div className="ml-4 px-3 py-1 bg-white/20 rounded-full">
                  <span className="text-sm font-bold">{fileCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close filter */}
      {showSegmentFilter && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSegmentFilter(false)}></div>
      )}
    </div>
  );
}