import { useState } from 'react';
import { CheckSquare, Square, FileJson, Info, Filter, X, ChevronDown } from 'lucide-react';

interface FileConfig {
  id: number;
  childPath: string | null;
  file_name: string | null;
  file_type: string | null;
  format: string | null;
  spName: string | null;
  spParam: string | null;
  spParamValue: string | null;
  dirName: string;
  segment: string;
  folderName: string | null;
  created_at: string | null;
}

interface EnhancedTableProps {
  displayedConfigs: FileConfig[];
  currentSelection: number[];
  toggleSelection: (id: number) => void;
  toggleSelectAll: () => void;
  previouslySelected: number[];
}

export default function EnhancedTable({
  displayedConfigs,
  currentSelection,
  toggleSelection,
  toggleSelectAll,
  previouslySelected,
}: EnhancedTableProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getFileIcon = (fileType: string | null, isSelected: boolean, isPreviouslySelected: boolean) => {
    if (isSelected && isPreviouslySelected) {
      return <FileJson className="h-4 w-4 text-green-600" />;
    }
    if (isSelected) {
      return <FileJson className="h-4 w-4 text-blue-600" />;
    }
    return <FileJson className="h-4 w-4 text-gray-400" />;
  };

  const allSelected = displayedConfigs.length > 0 && 
    displayedConfigs.every(config => currentSelection.includes(config.id));

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="w-12 px-3 py-2">
                <button 
                  onClick={toggleSelectAll}
                  className="rounded-md hover:bg-white p-1 transition-colors duration-150"
                  title={allSelected ? "Deselect all" : "Select all"}
                >
                  {allSelected ? 
                    <CheckSquare className="h-4 w-4 text-blue-600" /> : 
                    <Square className="h-4 w-4 text-gray-500" />}
                </button>
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">File Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Directory</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Segment</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Folder</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {displayedConfigs.map((config) => {
              const isSelected = currentSelection.includes(config.id);
              const isPreviouslySelected = previouslySelected.includes(config.id);
              const isHovered = hoveredId === config.id;

              return (
                <tr 
                  key={config.id}
                  className={`${isHovered ? 'bg-gray-50' : 'bg-white'} 
                    ${isSelected ? (isPreviouslySelected ? 'bg-green-50' : 'bg-blue-50') : ''}
                    transition-colors duration-150 border-l-4
                    ${isSelected ? (isPreviouslySelected ? 'border-green-500' : 'border-blue-500') : 'border-transparent'}
                  `}
                  onClick={() => toggleSelection(config.id)}
                  onMouseEnter={() => setHoveredId(config.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button 
                      className="rounded-md p-1 transition-colors duration-150"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleSelection(config.id); 
                      }}
                    >
                      {isSelected ? 
                        <CheckSquare className={`h-4 w-4 ${isPreviouslySelected ? 'text-green-600' : 'text-blue-600'}`} /> : 
                        <Square className="h-4 w-4 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="group relative flex items-center">
                      <div className={`flex-shrink-0 p-1 rounded-md ${
                        isSelected ? (isPreviouslySelected ? 'bg-green-100' : 'bg-blue-100') : 'bg-gray-100'
                      } mr-2`}>
                        {getFileIcon(config.file_type, isSelected, isPreviouslySelected)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {config.file_name || 'Unnamed'}
                          </span>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <Info className="h-4 w-4 text-gray-400 hover:text-gray-700" />
                          </button>
                        </div>
                        {isPreviouslySelected && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Previously Selected
                          </span>
                        )}
                        {isSelected && !isPreviouslySelected && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            New Selection
                          </span>
                        )}
                        {config.file_name && (
                          <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 -top-8 max-w-xs whitespace-normal">
                            {config.file_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-700 max-w-xs truncate" title={config.dirName}>
                      {config.dirName}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {config.segment}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-700 max-w-xs truncate" title={config.folderName || '--'}>
                      {config.folderName || '--'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {displayedConfigs.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50">
          <div className="bg-white rounded-full p-3 shadow-md mb-4">
            <FileJson className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No files found</h3>
          <p className="text-gray-500 text-center max-w-sm">
            Try adjusting your filters or adding new files to your collection
          </p>
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Upload Files
          </button>
        </div>
      )}
    </div>
  );
}