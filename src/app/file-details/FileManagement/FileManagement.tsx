'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from './components/Header';
import FileGrid from './components/FileGrid';
import FileTable from './components/FileTable';
import { 
  FileSpreadsheet, 
  FileText, 
  FileJson,
  Clock,
  Download,
  Upload,
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
  
  const activeType = useMemo(() => {
    if (pathname.includes('pending')) return 'pending';
    if (pathname.includes('downloaded')) return 'downloaded';
    if (pathname.includes('imported')) return 'imported';
    return defaultType;
  }, [pathname, defaultType]);
  
  const filteredMockFiles = useMemo(() => {
    return mockFiles.filter(file => {
      if (activeType === 'pending') return file.dlStatus === 0;
      if (activeType === 'downloaded') return file.dlStatus === 1;
      if (activeType === 'imported') return file.dlStatus === 2;
      return true;
    });
  }, [mockFiles, activeType]);
  
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
    <div className="w-full rounded-lg shadow-md">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeType={activeType}
        handleTypeChange={handleTypeChange}
        fileCount={sortedFiles.length}
        onBack={handleBackClick}
        getStatusLabel={getStatusLabel}
        getStatusIcon={getStatusIcon}
      />
      {viewMode === 'grid' ? (
        <FileGrid
          files={sortedFiles}
          activeType={activeType}
          onOpenFolder={onOpenFolderHandler}
          getFileIcon={getFileIcon}
          formatDate={formatDate}
        />
      ) : (
       <FileTable
      files={sortedFiles}
      activeType={activeType}
      sortField={sortField}
      sortDirection={sortDirection}
      handleSort={handleSort}
      onOpenFolder={onOpenFolderHandler}
      getFileIcon={getFileIcon}
      formatDate={formatDate}
    />
      )}
    </div>
  );
}