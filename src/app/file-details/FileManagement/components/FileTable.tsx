import React from 'react';
import { ExternalLink, ArrowUpDown, Calendar, Download, Database, Eye } from 'lucide-react';

// Updated to match the FileStatus interface in FileManagement component
interface FileStatus {
  id: string;
  dir?: string;
  segment?: string;
  folderPath?: string;
  filename: string;
  filepath: string;
  fileSize?: string;
  filetype?: string;
  spName?: string;
  spParam?: string;
  spParamValue?: string;
  spPath?: string;
  spStatus?: number;
  dlStatus: number;
  ePath?: string;
  reserved?: string;
  lastModified?: string;
  spTime?: string;
  dlTime?: string;
  createdTime: string;
  downloadedAt?: string;
  importedAt?: string;
}

interface FileTableProps {
  files: FileStatus[];
  activeType: 'pending' | 'downloaded' | 'imported';
  sortField: keyof FileStatus;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof FileStatus) => void;
  onOpenFolder: (filepath: string) => void;
  getFileIcon: (filename: string) => React.ReactNode;
  formatDate: (dateString?: string) => string;
}

// Helper function to get file extension badge color
const getFileBadgeColor = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return 'bg-purple-100 text-purple-700';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) return 'bg-pink-100 text-pink-700';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) return 'bg-blue-100 text-blue-700';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'bg-red-100 text-red-700';
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'bg-green-100 text-green-700';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return 'bg-yellow-100 text-yellow-700';
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'java'].includes(ext || '')) return 'bg-cyan-100 text-cyan-700';
  
  return 'bg-gray-100 text-gray-700';
};

// Helper function to determine status indicator
const getStatusIndicator = (activeType: string) => {
  if (activeType === 'pending') return 'border-yellow-500 bg-yellow-50 text-yellow-700';
  if (activeType === 'downloaded') return 'border-blue-500 bg-blue-50 text-blue-700';
  if (activeType === 'imported') return 'border-green-500 bg-green-50 text-green-700';
  return 'border-gray-500 bg-gray-50 text-gray-700';
};

export default function FileTable({ 
  files, 
  activeType, 
  sortField, 
  sortDirection, 
  handleSort, 
  onOpenFolder, 
  getFileIcon, 
  formatDate 
}: FileTableProps) {
  // Helper to render sort icon
  const renderSortIcon = (field: keyof FileStatus) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />;
    }
    
    return (
      <div className="flex items-center ml-1">
        {sortDirection === 'asc' ? (
          <svg className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    );
  };

  // Helper to render table header
  const renderTableHeader = (title: string, field: keyof FileStatus) => (
    <th 
      className="py-4 px-6 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        <span className={`font-medium text-xs uppercase tracking-wide ${sortField === field ? 'text-blue-600' : 'text-gray-600'}`}>
          {title}
        </span>
        {renderSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full bg-white border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {renderTableHeader('Filename', 'filename')}
              {renderTableHeader('Segment', 'segment')}
              {renderTableHeader('Directory', 'dir')}
              {renderTableHeader('Size', 'fileSize')}
              {renderTableHeader('Created', 'createdTime')}
              
              {activeType !== 'pending' && renderTableHeader('Downloaded', 'dlTime')}
              {activeType === 'imported' && renderTableHeader('Imported', 'spTime')}
              
              <th className="py-4 px-6 text-center">
                <span className="font-medium text-xs uppercase tracking-wide text-gray-600">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {files.length > 0 ? (
              files.map((file, index) => {
                const fileExt = file.filename.split('.').pop() || '';
                const badgeColor = getFileBadgeColor(file.filename);
                const statusColor = getStatusIndicator(activeType);
                
                return (
                  <tr 
                    key={file.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                  >
                    <td className="py-4 px-6 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-md bg-gray-50 border border-gray-100">
                          {getFileIcon(file.filename)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{file.filename}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${badgeColor}`}>
                            {fileExt.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-left">
                      {file.segment ? (
                        <span className={`px-3 py-1 rounded-full text-xs border ${statusColor}`}>
                          {file.segment}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-left truncate max-w-xs" title={file.dir || '-'}>
                      <div className="flex items-center">
                        <Database className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="truncate">{file.dir || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-left">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {file.fileSize || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-left">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-400 mr-2" />
                        <span>{formatDate(file.createdTime)}</span>
                      </div>
                    </td>
                    {activeType !== 'pending' && (
                      <td className="py-4 px-6 text-left">
                        <div className="flex items-center">
                          <Download className="h-3 w-3 text-gray-400 mr-2" />
                          <span>{formatDate(file.dlTime)}</span>
                        </div>
                      </td>
                    )}
                    {activeType === 'imported' && (
                      <td className="py-4 px-6 text-left">
                        <div className="flex items-center">
                          <Database className="h-3 w-3 text-gray-400 mr-2" />
                          <span>{formatDate(file.spTime)}</span>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onOpenFolder(file.filepath)}
                          className="p-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
                          title="Open in folder"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors duration-200"
                          title="Preview file"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={activeType === 'imported' ? 8 : activeType === 'downloaded' ? 7 : 6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-50 rounded-full p-4">
                      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No files found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      No {activeType} files match your search criteria
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}