'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  Download, 
  Upload, 
  ExternalLink, 
  Clock, 
  FileSpreadsheet, 
  FileText, 
  FileJson,
  Search,
  ArrowUpDown,
  Filter
} from 'lucide-react';

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

interface FileManagementProps {
  initialFiles?: FileStatus[];
  defaultType?: 'pending' | 'downloaded' | 'imported';
  onBack?: () => void;
  onOpenFolder?: (filepath: string) => void;
}

export default function FileManagement({ 
  initialFiles = [], 
  defaultType = 'pending',
  onBack,
  onOpenFolder: propOnOpenFolder
}: FileManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [files, setFiles] = useState<FileStatus[]>(initialFiles);
  const [sortField, setSortField] = useState<keyof FileStatus>('createdTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const mockFiles: FileStatus[] = useMemo(() => [
    {
      id: '1',
      filename: 'sales_data_2025.csv',
      filepath: '/path/to/sales_data_2025.csv',
      segment: 'Sales',
      dir: '/reports/sales',
      fileSize: '2.4 MB',
      dlStatus: 0,
      createdTime: '2025-05-12T14:22:33',
    },
    {
      id: '2',
      filename: 'inventory_q1.xlsx',
      filepath: '/path/to/inventory_q1.xlsx',
      segment: 'Inventory',
      dir: '/reports/inventory',
      fileSize: '3.7 MB',
      dlStatus: 1,
      createdTime: '2025-05-10T09:15:22',
      dlTime: '2025-05-10T09:20:15',
    },
    {
      id: '3',
      filename: 'customer_data.json',
      filepath: '/path/to/customer_data.json',
      segment: 'CRM',
      dir: '/data/customers',
      fileSize: '1.2 MB',
      dlStatus: 2,
      createdTime: '2025-05-08T16:43:10',
      dlTime: '2025-05-08T16:50:22',
      spTime: '2025-05-08T17:05:33',
    },
    {
      id: '4',
      filename: 'marketing_campaign.xlsx',
      filepath: '/path/to/marketing_campaign.xlsx',
      segment: 'Marketing',
      dir: '/reports/marketing',
      fileSize: '5.1 MB',
      dlStatus: 0,
      createdTime: '2025-05-14T11:33:45',
    },
    {
      id: '5',
      filename: 'financial_report_q1.pdf',
      filepath: '/path/to/financial_report_q1.pdf',
      segment: 'Finance',
      dir: '/reports/finance',
      fileSize: '8.3 MB',
      dlStatus: 1,
      createdTime: '2025-05-09T10:20:15',
      dlTime: '2025-05-09T10:30:22',
    },
    {
      id: '6',
      filename: 'employee_data.csv',
      filepath: '/path/to/employee_data.csv',
      segment: 'HR',
      dir: '/data/employees',
      fileSize: '3.2 MB',
      dlStatus: 2,
      createdTime: '2025-05-07T09:12:33',
      dlTime: '2025-05-07T09:20:15',
      spTime: '2025-05-07T09:45:10',
    }
  ], []);
  
  // Memoize activeType to prevent unnecessary recalculations
  const activeType = useMemo(() => {
    if (pathname.includes('pending')) return 'pending';
    if (pathname.includes('downloaded')) return 'downloaded';
    if (pathname.includes('imported')) return 'imported';
    return defaultType;
  }, [pathname, defaultType]);
  
  // Memoize filtered mock files to prevent recreation on each render
  const filteredMockFiles = useMemo(() => {
    return mockFiles.filter(file => {
      if (activeType === 'pending') return file.dlStatus === 0;
      if (activeType === 'downloaded') return file.dlStatus === 1;
      if (activeType === 'imported') return file.dlStatus === 2;
      return true;
    });
  }, [mockFiles, activeType]);
  
  // Only update files when needed
  useEffect(() => {
    if (initialFiles.length === 0) {
      setFiles(filteredMockFiles);
    }
  }, [filteredMockFiles, initialFiles.length]);
  
  const getFileIcon = useCallback((filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv' || extension === 'xlsx' || extension === 'xls') {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    } else if (extension === 'json') {
      return <FileJson className="h-5 w-5 text-yellow-600" />;
    } else {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
  }, []);
  
  const handleSort = useCallback((field: keyof FileStatus) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);
  
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }, []);
  
  const filteredFiles = useMemo(() => files.filter(file => 
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.segment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (file.dir?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ), [files, searchTerm]);
  
  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
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
  }, [filteredFiles, sortField, sortDirection]);
  
  const getStatusLabel = useCallback((type: 'pending' | 'downloaded' | 'imported') => {
    switch (type) {
      case 'pending': return 'Pending Download';
      case 'downloaded': return 'Downloaded (Pending Import)';
      case 'imported': return 'Imported Successfully';
    }
  }, []);
  
  const getStatusIcon = useCallback((type: 'pending' | 'downloaded' | 'imported') => {
    switch (type) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'downloaded': return <Download className="h-5 w-5 text-blue-500" />;
      case 'imported': return <Upload className="h-5 w-5 text-green-500" />;
    }
  }, []);
  
  const handleTypeChange = useCallback((type: 'pending' | 'downloaded' | 'imported') => {
    if (router) {
      router.push(`/file-details/${type}`);
    }
  }, [router]);
  
  const onOpenFolderHandler = useCallback((filepath: string) => {
    if (propOnOpenFolder) {
      propOnOpenFolder(filepath);
    } else {
      console.log(`Opening folder: ${filepath}`);
    }
  }, [propOnOpenFolder]);
  
  const handleBackClick = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (router) {
      router.push('/dashboard');
    }
  }, [onBack, router]);
  
  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <button 
              onClick={handleBackClick}
              className="flex items-center text-gray-600 hover:text-blue-600 mr-4"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-grow md:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search files..."
                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => handleTypeChange('pending')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeType === 'pending' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Clock className="h-4 w-4 mr-2" />
            <span>Pending</span>
          </button>
          
          <button
            onClick={() => handleTypeChange('downloaded')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeType === 'downloaded' 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Downloaded</span>
          </button>
          
          <button
            onClick={() => handleTypeChange('imported')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeType === 'imported' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            <span>Imported</span>
          </button>
          
          <div className="ml-auto flex items-center">
            <div className="flex items-center text-sm text-gray-600">
              {getStatusIcon(activeType)}
              <span className="ml-2 font-medium">
                {getStatusLabel(activeType)} ({sortedFiles.length})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="p-6">
          {sortedFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedFiles.map((file) => (
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
                  
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                    <button
                      onClick={() => onOpenFolderHandler(file.filepath)}
                      className="w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span>Open In Folder</span>
                    </button>
                  </div>
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
      ) : (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase leading-normal">
                  <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('filename')}>
                    <div className="flex items-center">
                      <span>Filename</span>
                      {sortField === 'filename' && (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('segment')}>
                    <div className="flex items-center">
                      <span>Segment</span>
                      {sortField === 'segment' && (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('dir')}>
                    <div className="flex items-center">
                      <span>Directory</span>
                      {sortField === 'dir' && (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('fileSize')}>
                    <div className="flex items-center">
                      <span>Size</span>
                      {sortField === 'fileSize' && (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('createdTime')}>
                    <div className="flex items-center">
                      <span>Creation Time</span>
                      {sortField === 'createdTime' && (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  {activeType !== 'pending' && (
                    <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('dlTime')}>
                      <div className="flex items-center">
                        <span>Download Time</span>
                        {sortField === 'dlTime' && (
                          <ArrowUpDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </th>
                  )}
                  {activeType === 'imported' && (
                    <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('spTime')}>
                      <div className="flex items-center">
                        <span>Import Time</span>
                        {sortField === 'spTime' && (
                          <ArrowUpDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </th>
                  )}
                  <th className="py-3 px-6 text-center">Actions</th>
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
                      <td className="py-3 px-6 text-left truncate max-w-xs" title={file.dir || '-'}>
                        {file.dir || '-'}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {file.fileSize || '-'}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {formatDate(file.createdTime)}
                      </td>
                      {activeType !== 'pending' && (
                        <td className="py-3 px-6 text-left">
                          {formatDate(file.dlTime)}
                        </td>
                      )}
                      {activeType === 'imported' && (
                        <td className="py-3 px-6 text-left">
                          {formatDate(file.spTime)}
                        </td>
                      )}
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => onOpenFolderHandler(file.filepath)}
                          className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-800"
                          title="View in folder"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeType === 'imported' ? 8 : activeType === 'downloaded' ? 7 : 6} className="py-6 text-center text-gray-500">
                      No files found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
