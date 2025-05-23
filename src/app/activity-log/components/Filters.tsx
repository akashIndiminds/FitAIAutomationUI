import { Check, Filter, XCircle } from "lucide-react";

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

  const handleReset = () => {
    setFileStatusFilter('');
    setDirFilter('');
    setSegmentFilter('');
    setItemsPerPage(10);
    setSearchTerm('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 mb-4 shadow-sm w-full mx-auto">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Status Filter */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-600">Status Filter</h4>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">File Status</label>
            <div className="flex flex-wrap gap-2">
              {fileStatusTypes.map((status) => (
                <button
                  key={status}
                  onClick={() => setFileStatusFilter(fileStatusFilter === status ? '' : status)}
                  className={`px-3 py-2 rounded-md text-sm flex items-center transition-colors
                            ${fileStatusFilter === status 
                               ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                               : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}`}
                >
                  {fileStatusFilter === status && <Check size={14} className="mr-1" />}
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory and Segment Filters */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-600">Location Filters</h4>
          <div className="space-y-4">
            {/* Directory Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Directory</label>
              <select
                value={dirFilter}
                onChange={(e) => setDirFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">All Directories</option>
                {uniqueDirs.map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>

            {/* Segment Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Segment</label>
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">All Segments</option>
                {uniqueSegments.map(segment => (
                  <option key={segment} value={segment}>{segment}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items Per Page */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-600">Display Options</h4>
          <div className="bg-gray-50 p-3 rounded-md space-y-2">
            <label className="block text-sm font-medium text-gray-700">Items Per Page</label>
            <div className="flex flex-wrap gap-2">
              {itemsPerPageOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setItemsPerPage(option)}
                  className={`px-3 py-2 rounded-md text-sm flex items-center transition-colors
                            ${itemsPerPage === option 
                               ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                               : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'}`}
                >
                  {itemsPerPage === option && <Check size={14} className="mr-1" />}
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
