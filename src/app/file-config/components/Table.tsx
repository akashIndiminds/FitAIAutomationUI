import { useState } from 'react';
import { CheckSquare, Square, FileJson, ExternalLink } from 'lucide-react';

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
  selectedConfigIds: number[];
  toggleSelection: (id: number) => void;
  toggleSelectAll: () => void;
  isSelectedConfig: (id: number) => boolean;
}

export default function EnhancedTable({
  displayedConfigs,
  selectedConfigIds,
  toggleSelection,
  toggleSelectAll,
  isSelectedConfig,
}: EnhancedTableProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  const getFileIcon = (fileType: string | null, isSelected: boolean, isSelectedConfig: boolean) => {
    if (!fileType) return <FileJson className="h-5 w-5 text-blue-600" />;
    
    if (isSelectedConfig) {
      return <FileJson className="h-5 w-5 text-green-600" />;
    }
    
    if (isSelected) {
      return <FileJson className="h-5 w-5 text-blue-600" />;
    }
    
    return <FileJson className="h-5 w-5 text-gray-500" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <th className="w-12 px-2 sm:px-6 py-4">
                <button 
                  onClick={toggleSelectAll}
                  className="rounded-md hover:bg-blue-100 p-1 transition-colors duration-200"
                >
                  {displayedConfigs.every(config => selectedConfigIds.includes(config.id)) && displayedConfigs.length > 0 ? 
                    <CheckSquare className="h-5 w-5 text-blue-600" /> : 
                    <Square className="h-5 w-5 text-gray-500" />}
                </button>
              </th>
              <th className="px-2 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">File Name</th>
              <th className="px-2 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Directory</th>
              <th className="px-2 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Segment</th>
              <th className="px-2 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Folder</th>
              <th className="px-2 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SP Name</th>
              <th className="px-2 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedConfigs.map((config) => {
              const isSelected = selectedConfigIds.includes(config.id);
              const isActive = isSelectedConfig(config.id);
              const isHovered = hoveredId === config.id;
              
              return (
                <tr 
                  key={config.id}
                  className={`relative transition-all duration-300 
                    ${isSelected || isActive ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'} 
                    ${isActive ? 'border-l-4 border-green-500' : isSelected ? 'border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
                    ${isHovered ? 'shadow-md z-10' : ''}
                  `}
                  onClick={() => toggleSelection(config.id)}
                  onMouseEnter={() => setHoveredId(config.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    boxShadow: isHovered ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
                  }}
                >
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <button 
                      className={`rounded-md p-1 transition-colors duration-200 ${isSelected || isActive ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleSelection(config.id); 
                      }}
                    >
                      {isActive ? 
                        <CheckSquare className="h-5 w-5 text-green-600" /> : 
                        isSelected ? 
                        <CheckSquare className="h-5 w-5 text-blue-600" /> : 
                        <Square className="h-5 w-5 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : isSelected ? 'bg-blue-100' : 'bg-gray-100'} mr-3`}>
                        {getFileIcon(config.file_type, isSelected, isActive)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">
                          {config.file_name || 'Unnamed'}
                        </div>
                        {isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Selected
                          </span>
                        )}
                        {isSelected && !isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            New Selection
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-[100px] sm:max-w-[120px]">
                      {config.dirName}
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{config.segment}</div>
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-[100px] sm:max-w-[120px]">
                      {config.folderName || '--'}
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-[100px] sm:max-w-[120px]">
                      {config.spName || '--'}
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(config.created_at)}</div>
                  </td>
                  {isHovered && (
                    <td className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {displayedConfigs.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50">
          <FileJson className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-600">No files found</h3>
          <p className="text-gray-500">Try adjusting your filters or adding new files</p>
        </div>
      )}
      
      {displayedConfigs.length > 0 && selectedConfigIds.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-end border-t border-gray-200 sm:px-6">
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <ExternalLink className="h-4 w-4 mr-1" />
            Open selected
          </button>
        </div>
      )}
    </div>
  );
}