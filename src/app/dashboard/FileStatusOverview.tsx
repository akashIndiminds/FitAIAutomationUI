'use client';

import React from 'react';

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

interface FileStatusOverviewProps {
  pending: FileStatus[];
  downloaded: FileStatus[];
  imported: FileStatus[];
  onShowDetails: (type: 'pending' | 'downloaded' | 'imported') => void;
  onOpenFolder: (filepath: string) => void;
}

export default function FileStatusOverview({ 
  pending, 
  downloaded, 
  imported, 
  onShowDetails,
  onOpenFolder
}: FileStatusOverviewProps) {
  
  // Get the 3 most recent files from each category based on timestamp
  const getLatestFiles = (files: FileStatus[], timestampField: string) => {
    return [...files]
      .sort((a, b) => {
        const dateA = new Date(a[timestampField as keyof FileStatus] as string || '');
        const dateB = new Date(b[timestampField as keyof FileStatus] as string || '');
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);
  };

  const latestPending = getLatestFiles(pending, 'createdTime');
  const latestDownloaded = getLatestFiles(downloaded, 'dlTime');
  const latestImported = getLatestFiles(imported, 'spTime');

  // Format timestamp to human-readable time
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Get file icon based on filetype or extension
  const getFileIcon = (filename: string, filetype?: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (filetype === 'N' || extension === 'csv' || extension === 'gz') {
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    } else if (filetype === 'E' || extension === 'xlsx' || extension === 'xls') {
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    } else if (filetype === 'C' || extension === 'json') {
      return (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-5">  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Files */}
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-amber-600">Pending</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {pending.length}
            </span>
          </div>
          
          {pending.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-gray-500 text-sm">No pending files</p>
            </div>
          ) : (
            <div className="space-y-2">
              {latestPending.map((file) => (
                <div 
                  key={file.id} 
                  className="bg-gray-50 rounded-lg p-3 flex items-center justify-between group hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.filename, file.filetype)}
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.fileSize || '-'} • Created at {formatTime(file.createdTime)}
                      </p>
                    </div>
                  </div>
                  <div className="hidden group-hover:flex">
                    <button
                      onClick={() => onOpenFolder(file.filepath)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="View containing folder"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {pending.length > 3 && (
                <button 
                  onClick={() => onShowDetails('pending')}
                  className="w-full mt-2 text-xs text-amber-700 hover:text-amber-900 font-medium flex items-center justify-center"
                >
                  <span>View all {pending.length} files</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Downloaded Files */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-indigo-600">Downloaded</h3>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {downloaded.length}
            </span>
          </div>
          
          {downloaded.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-gray-500 text-sm">No downloaded files</p>
            </div>
          ) : (
            <div className="space-y-2">
              {latestDownloaded.map((file) => (
                <div 
                  key={file.id} 
                  className="bg-gray-50 rounded-lg p-3 flex items-center justify-between group hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.filename, file.filetype)}
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.fileSize || '-'} • Downloaded at {formatTime(file.dlTime)}
                      </p>
                    </div>
                  </div>
                  <div className="hidden group-hover:flex">
                    <button
                      onClick={() => onOpenFolder(file.filepath)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="View containing folder"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {downloaded.length > 3 && (
                <button 
                  onClick={() => onShowDetails('downloaded')}
                  className="w-full mt-2 text-xs text-indigo-700 hover:text-indigo-900 font-medium flex items-center justify-center"
                >
                  <span>View all {downloaded.length} files</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Imported Files */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-green-600">Imported</h3>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {imported.length}
            </span>
          </div>
          
          {imported.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-gray-500 text-sm">No imported files</p>
            </div>
          ) : (
            <div className="space-y-2">
              {latestImported.map((file) => (
                <div 
                  key={file.id} 
                  className="bg-gray-50 rounded-lg p-3 flex items-center justify-between group hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.filename, file.filetype)}
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.fileSize || '-'} • Imported at {formatTime(file.spTime)}
                      </p>
                    </div>
                  </div>
                  <div className="hidden group-hover:flex">
                    <button
                      onClick={() => onOpenFolder(file.filepath)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="View containing folder"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {imported.length > 3 && (
                <button 
                  onClick={() => onShowDetails('imported')}
                  className="w-full mt-2 text-xs text-green-700 hover:text-green-900 font-medium flex items-center justify-center"
                >
                  <span>View all {imported.length} files</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}