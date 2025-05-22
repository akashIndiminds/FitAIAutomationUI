import React from 'react';
import { ExternalLink } from 'lucide-react';

interface FileStatus {
  id: string;
  dir?: string;
  segment?: string;
  filename: string;
  filepath: string;
  fileSize?: string;
  createdTime: string;
  dlTime?: string;
  spTime?: string;
}

interface FileGridProps {
  files: FileStatus[];
  activeType: 'pending' | 'downloaded' | 'imported';
  onOpenFolder: (filepath: string) => void;
  getFileIcon: (filename: string) => React.ReactNode;
  formatDate: (dateString?: string) => string;
}

export default function FileGrid({ files, activeType, onOpenFolder, getFileIcon, formatDate }: FileGridProps) {
  return (
    <div className="p-6 bg-white">
      {files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-gray-50">
                    {getFileIcon(file.filename)}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
                      {file.filename}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {file.segment || '-'} • {file.fileSize || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Directory:</span>
                    <p className="text-gray-700 truncate" title={file.dir || '-'}>
                      {file.dir || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="text-gray-700">
                      {formatDate(file.createdTime).split(' ')[0]}
                    </p>
                  </div>

                  {activeType !== 'pending' && (
                    <div>
                      <span className="text-gray-500">Downloaded:</span>
                      <p className="text-gray-700">
                        {formatDate(file.dlTime).split(' ')[0]}
                      </p>
                    </div>
                  )}

                  {activeType === 'imported' && (
                    <div>
                      <span className="text-gray-500">Imported:</span>
                      <p className="text-gray-700">
                        {formatDate(file.spTime).split(' ')[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Conditionally render the "Open in Folder" button */}
              {activeType !== 'pending' && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                  <button
                    onClick={() => onOpenFolder(file.filepath)}
                    className="w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>Open In Folder</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-gray-100 rounded-full p-3">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No files found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No {activeType} files match your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}