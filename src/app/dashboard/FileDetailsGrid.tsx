'use client';

import React, { useState } from 'react';
import { ChevronLeft, Download, Upload, ExternalLink, Clock, FileSpreadsheet, FileText, FileJson } from 'lucide-react';

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

interface FileDetailsGridProps {
  files: FileStatus[];
  type: 'pending' | 'downloaded' | 'imported';
  onBack: () => void;
  onOpenFolder: (filepath: string) => void;
}

export default function FileDetailsGrid({ files, type, onBack, onOpenFolder }: FileDetailsGridProps) {
  const [sortField, setSortField] = useState<keyof FileStatus>('createdTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv' || extension === 'xlsx' || extension === 'xls') {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    } else if (extension === 'json') {
      return <FileJson className="h-5 w-5 text-yellow-600" />;
    } else {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };
  
  const handleSort = (field: keyof FileStatus) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.segment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.dir?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortField === 'createdTime' || sortField === 'dlTime' || sortField === 'spTime') {
      const aValue = a[sortField] ? new Date(a[sortField] as string).getTime() : 0;
      const bValue = b[sortField] ? new Date(b[sortField] as string).getTime() : 0;
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      return sortDirection === 'asc' ? 
        aValue.toString().localeCompare(bValue.toString()) : 
        bValue.toString().localeCompare(aValue.toString());
    }
  });
  
  const getStatusLabel = (type: 'pending' | 'downloaded' | 'imported') => {
    switch (type) {
      case 'pending': return 'Pending Download';
      case 'downloaded': return 'Downloaded (Pending Import)';
      case 'imported': return 'Imported Successfully';
    }
  };
  
  const getStatusIcon = (type: 'pending' | 'downloaded' | 'imported') => {
    switch (type) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'downloaded': return <Download className="h-5 w-5 text-blue-500" />;
      case 'imported': return <Upload className="h-5 w-5 text-green-500" />;
    }
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-blue-600 mr-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Overview</span>
          </button>
          <div className="flex items-center">
            {getStatusIcon(type)}
            <h2 className="text-xl font-semibold ml-2">
              {getStatusLabel(type)} ({files.length})
            </h2>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search files..."
            className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
              <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('filename')}>
                <div className="flex items-center">
                  Filename
                  {sortField === 'filename' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('segment')}>
                <div className="flex items-center">
                  Segment
                  {sortField === 'segment' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('dir')}>
                <div className="flex items-center">
                  Directory
                  {sortField === 'dir' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('fileSize')}>
                <div className="flex items-center">
                  Size
                  {sortField === 'fileSize' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('createdTime')}>
                <div className="flex items-center">
                  Creation Time
                  {sortField === 'createdTime' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              {type !== 'pending' && (
                <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('dlTime')}>
                  <div className="flex items-center">
                    Download Time
                    {sortField === 'dlTime' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              )}
              {type === 'imported' && (
                <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('spTime')}>
                  <div className="flex items-center">
                    Import Time
                    {sortField === 'spTime' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              )}
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {sortedFiles.length > 0 ? (
              sortedFiles.map((file) => (
                <tr key={file.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(file.filename)}
                      <span className="ml-2">{file.filename}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {file.segment || '-'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {file.dir || '-'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {file.fileSize || '-'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {formatDate(file.createdTime)}
                  </td>
                  {type !== 'pending' && (
                    <td className="py-3 px-6 text-left">
                      {formatDate(file.dlTime)}
                    </td>
                  )}
                  {type === 'imported' && (
                    <td className="py-3 px-6 text-left">
                      {formatDate(file.spTime)}
                    </td>
                  )}
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <button
                        onClick={() => onOpenFolder(file.filepath)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                        title="View in folder"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <span>Open</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={type === 'imported' ? 8 : type === 'downloaded' ? 7 : 6} className="py-6 text-center text-gray-500">
                  No files found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}