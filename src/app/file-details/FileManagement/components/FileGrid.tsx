import React from 'react';
import { ExternalLink, Clock, Download, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { FileStatus } from '@/components/types';

interface FileGridProps {
  files: FileStatus[];
  activeType: 'pending' | 'downloaded' | 'imported';
  onOpenFolder: (filepath: string) => void;
  getFileIcon: (filename: string) => React.ReactNode;
  formatDate: (dateString?: string) => string;
}

// Helper function to get status info based on activeType
const getStatusInfo = (activeType: string) => {
  switch (activeType) {
    case 'pending':
      return {
        text: 'Pending',
        color: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200',
        dotColor: 'bg-amber-400',
        icon: <Clock className="h-3.5 w-3.5" />
      };
    case 'downloaded':
      return {
        text: 'Downloaded',
        color: 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-200',
        dotColor: 'bg-blue-400',
        icon: <Download className="h-3.5 w-3.5" />
      };
    case 'imported':
      return {
        text: 'Imported',
        color: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200',
        dotColor: 'bg-emerald-400',
        icon: <Upload className="h-3.5 w-3.5" />
      };
    default:
      return {
        text: activeType,
        color: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200',
        dotColor: 'bg-gray-400',
        icon: <Clock className="h-3.5 w-3.5" />
      };
  }
};

// Helper function to check import status
const getImportStatus = (file: FileStatus) => {
  const isDownloaded = file.dlStatus === 200;
  const isImported = file.spStatus && file.spStatus !== 404;
  
  if (!isDownloaded) {
    return {
      status: 'not_downloaded',
      text: 'Not Downloaded',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: <XCircle className="h-3.5 w-3.5" />
    };
  }
  
  if (isImported) {
    return {
      status: 'imported',
      text: 'Import Complete',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
      icon: <CheckCircle className="h-3.5 w-3.5" />
    };
  }
  
  return {
    status: 'pending_import',
    text: 'Import Pending',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: <AlertCircle className="h-3.5 w-3.5" />
  };
};

export default function FileGrid({ files, activeType, onOpenFolder, getFileIcon, formatDate }: FileGridProps) {
  const statusInfo = getStatusInfo(activeType);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file) => {
            const importStatus = getImportStatus(file);
            
            return (
              <div
                key={file.taskId}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1 overflow-hidden"
              >
                {/* Header with icon, filename and status */}
                <div className="p-5 pb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300">
                      {getFileIcon(file.filename)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-sm font-semibold text-gray-900 mb-1 break-words leading-tight" 
                        title={file.filename}
                      >
                        {file.filename}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="truncate">{file.segment || 'N/A'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex-shrink-0">{file.fileSize || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex flex-col gap-2">
                    {/* Primary status badge */}
                    <div className="flex justify-end">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor} animate-pulse`}></div>
                        {statusInfo.icon}
                        <span className="whitespace-nowrap">{statusInfo.text}</span>
                      </span>
                    </div>
                    
                    {/* Import status badge for downloaded files */}
                    {activeType === 'downloaded' && (
                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${importStatus.bgColor} ${importStatus.color}`}>
                          {importStatus.icon}
                          <span className="whitespace-nowrap">{importStatus.text}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* File details */}
                <div className="px-5 pb-4">
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Directory</span>
                      <p className="text-sm text-gray-800 truncate font-mono bg-gray-50 px-2 py-1 rounded-md" title={file.dir || 'Not specified'}>
                        {file.dir || 'Not specified'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</span>
                        <span className="text-sm text-gray-800 font-medium">
                          {formatDate(file.createdTime).split(' ')[0]}
                        </span>
                      </div>

                      {activeType !== 'pending' && file.dlTime && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Downloaded</span>
                          <span className="text-sm text-gray-800 font-medium">
                            {formatDate(file.dlTime).split(' ')[0]}
                          </span>
                        </div>
                      )}

                      {(activeType === 'imported' || (activeType === 'downloaded' && importStatus.status === 'imported')) && file.spTime && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Imported</span>
                          <span className="text-sm text-gray-800 font-medium">
                            {formatDate(file.spTime).split(' ')[0]}
                          </span>
                        </div>
                      )}
                      
                      {/* Import status indicator for downloaded section */}
                      {activeType === 'downloaded' && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Import Status</span>
                          <div className="flex items-center gap-1">
                            {importStatus.status === 'imported' ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className={`text-sm font-medium ${importStatus.color}`}>
                              {importStatus.status === 'imported' ? 'Done' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                {activeType !== 'pending' && (
                  <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300">
                    <button
                      onClick={() => onOpenFolder(file.filepath)}
                      className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 group-hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>Open in Folder</span>
                    </button>
                  </div>
                )}

                {/* Import warning for downloaded files that are not imported */}
                {activeType === 'downloaded' && importStatus.status === 'pending_import' && (
                  <div className="border-t border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-orange-700">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>This file is downloaded but not yet imported to the system</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 mb-6">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500 text-center max-w-md">
            No {activeType} files match your current search criteria. Try adjusting your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}