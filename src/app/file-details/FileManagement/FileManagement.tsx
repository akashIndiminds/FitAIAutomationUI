'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from './components/Header';
import FileGrid from './components/FileGrid';
import FileTable from './components/FileTable';
import Pagination from '@/components/Pagination';
import { FileStatus } from '@/components/types';
import { 
  FileSpreadsheet, 
  FileText, 
  FileJson,
  Clock,
  Download,
  Upload,
} from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page
  
  const activeType = useMemo(() => {
    if (pathname.includes('pending')) return 'pending';
    if (pathname.includes('downloaded')) return 'downloaded';
    if (pathname.includes('imported')) return 'imported';
    return defaultType;
  }, [pathname, defaultType]);
  
  // Fetch files from the API
  const fetchFiles = async () => {
    try {
      const response = await fetch('http://192.168.1.119:3000/api/automate/status');
      if (!response.ok) {
        throw new Error('Failed to fetch file statuses');
      }
      const data = await response.json();
      if (data.success) {
        const fetchedFiles: FileStatus[] = data.data.map((file: any, index: number) => ({
          ...file,
          id: `${file.filename}-${index}`,
        }));
        setFiles(fetchedFiles);
      } else {
        console.error('API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching file statuses:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const getFileType = (file: FileStatus): 'pending' | 'downloaded' | 'imported' => {
    if (file.dlStatus === 404) {
      return 'pending';
    } else if (file.dlStatus === 200 && file.spStatus === 404) {
      return 'downloaded';
    } else if (file.spStatus !== undefined && file.spStatus !== 404) {
      return 'imported';
    }
    return 'pending';
  };

  const typeFilteredFiles = useMemo(() => {
    return files.filter(file => getFileType(file) === activeType);
  }, [files, activeType]);

  const searchFilteredFiles = useMemo(() => {
    return typeFilteredFiles.filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.segment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (file.dir?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [typeFilteredFiles, searchTerm]);

  const sortedFiles = useMemo(() => {
    return [...searchFilteredFiles].sort((a, b) => {
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
  }, [searchFilteredFiles, sortField, sortDirection]);
  
  // Pagination logic
  const filesPerPage = 9;
  const currentFiles = useMemo(() => {
    const indexOfFirstFile = (currentPage - 1) * filesPerPage;
    const indexOfLastFile = currentPage * filesPerPage;
    return sortedFiles.slice(indexOfFirstFile, indexOfLastFile);
  }, [sortedFiles, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeType, searchTerm]);

  // Adjust currentPage if it exceeds total pages
  useEffect(() => {
    const totalPages = Math.ceil(sortedFiles.length / filesPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [sortedFiles, filesPerPage, currentPage]);

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
          files={currentFiles} // Use currentFiles instead of sortedFiles
          activeType={activeType}
          onOpenFolder={onOpenFolderHandler}
          getFileIcon={getFileIcon}
          formatDate={formatDate}
        />
      ) : (
        <FileTable
          files={currentFiles} // Use currentFiles instead of sortedFiles
          activeType={activeType}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          onOpenFolder={onOpenFolderHandler}
          getFileIcon={getFileIcon}
          formatDate={formatDate}
        />
      )}
      <Pagination
        totalFiles={sortedFiles.length}
        filesPerPage={filesPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}