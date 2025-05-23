'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileStatus } from '@/components/types';

interface FileStatusOverviewProps {
  pending: FileStatus[];
  downloaded: FileStatus[];
  imported: FileStatus[];
  onOpenFolder: (filepath: string) => void;
  navigateToDetails: (type: 'pending' | 'downloaded' | 'imported') => void;
}

export default function FileStatusOverview({
  pending,
  downloaded,
  imported,
  onOpenFolder,
  navigateToDetails,
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
        minute: '2-digit',
      });
    }
  };

  // Get file icon based on filetype or extension
  const getFileIcon = (filename: string, filetype?: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();

    if (filetype === 'N' || extension === 'csv' || extension === 'gz') {
      return (
        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    } else if (filetype === 'E' || extension === 'xlsx' || extension === 'xls') {
      return (
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    } else if (filetype === 'C' || extension === 'json') {
      return (
        <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    }
  };

  // Handle navigation to file details page
  const handleViewAll = (type: 'pending' | 'downloaded' | 'imported') => {
    navigateToDetails(type); // Use navigateToDetails instead of router.push
  };

  // Render individual file item with index and type for unique key
  const renderFileItem = (
    file: FileStatus,
    index: number,
    type: string,
    timestampLabel: string,
    timestampValue?: string,
    showFolderIcon: boolean = false
  ) => (
    <div
      key={`${type}-${file.taskId || index}`} // Unique key using type and file.taskId or index
      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {getFileIcon(file.filename, file.filetype)}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
              {file.filename}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {file.fileSize || 'Unknown size'}
              </span>
              <span className="hidden sm:inline text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {timestampLabel} {formatTime(timestampValue)}
              </span>
            </div>
          </div>
        </div>
        
        {showFolderIcon && (
          <div className="flex-shrink-0">
            <button
              onClick={() => onOpenFolder(file.filepath)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200 opacity-0 group-hover:opacity-100"
              title="View containing folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render section, passing index and type to renderFileItem
  const renderSection = (
    title: string,
    files: FileStatus[],
    latestFiles: FileStatus[],
    bgColor: string,
    textColor: string,
    badgeColor: string,
    type: 'pending' | 'downloaded' | 'imported',
    timestampLabel: string,
    timestampField: string,
    showFolderIcon: boolean = false
  ) => (
    <div className={`${bgColor} p-4 rounded-xl border border-opacity-20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${textColor} text-lg`}>{title}</h3>
        <span className={`${badgeColor} text-xs font-semibold px-3 py-1 rounded-full`}>
          {files.length}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No {title.toLowerCase()} files</p>
        </div>
      ) : (
        <div className="space-y-3">
          {latestFiles.map((file, index) =>
            renderFileItem(
              file,
              index,
              type,
              timestampLabel,
              file[timestampField as keyof FileStatus] as string,
              showFolderIcon
            )
          )}

          {files.length > 3 && (
            <button
              onClick={() => handleViewAll(type)}
              className={`w-full mt-4 py-2 px-4 ${textColor} hover:bg-white hover:bg-opacity-20 font-medium text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 border border-current border-opacity-30`}
            >
              <span>View all {files.length} files</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">   
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Files */}
        {renderSection(
          'Pending',
          pending,
          latestPending,
          'bg-amber-50',
          'text-amber-700',
          'bg-amber-200 text-amber-800',
          'pending',
          'Created',
          'createdTime',
          false
        )}

        {/* Downloaded Files */}
        {renderSection(
          'Downloaded',
          downloaded,
          latestDownloaded,
          'bg-blue-50',
          'text-blue-700',
          'bg-blue-200 text-blue-800',
          'downloaded',
          'Downloaded',
          'dlTime',
          true
        )}

        {/* Imported Files */}
        {renderSection(
          'Imported',
          imported,
          latestImported,
          'bg-green-50',
          'text-green-700',
          'bg-green-200 text-green-800',
          'imported',
          'Imported',
          'spTime',
          true
        )}
      </div>
    </div>
  );
}