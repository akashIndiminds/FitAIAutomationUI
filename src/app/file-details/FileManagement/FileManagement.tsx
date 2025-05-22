'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from './components/Header';
import FileGrid from './components/FileGrid';
import FileTable from './components/FileTable';
import Pagination from '@/components/Pagination';
import Loader, { TableLoader, GridLoader} from '@/components/loader'
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
  const [currentPage, setCurrentPage] = useState(1);
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTypeChanging, setIsTypeChanging] = useState(false);
  const [isViewChanging, setIsViewChanging] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const baseURL=process.env.NEXT_PUBLIC_API_URL;

  const activeType = useMemo(() => {
    if (pathname.includes('pending')) return 'pending';
    if (pathname.includes('downloaded')) return 'downloaded';
    if (pathname.includes('imported')) return 'imported';
    return defaultType;
  }, [pathname, defaultType]);
  
  // Fetch files from the API
  const fetchFiles = async (showLoader = false) => {
    try {
      if (showLoader) setIsFetching(true);
      
      const response = await fetch(`${baseURL}/api/automate/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch file statuses');
      }
      const data = await response.json();
      if (data.success) {
        const fetchedFiles: FileStatus[] = data.data.map((file: any, index: number) => ({
          ...file,
          id: `${file.filename}-${index}`,
        }));
        
        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setFiles(fetchedFiles);
        setIsInitialLoading(false);
      } else {
        console.error('API returned success: false');
        setIsInitialLoading(false);
      }
    } catch (error) {
      console.error('Error fetching file statuses:', error);
      setIsInitialLoading(false);
    } finally {
      if (showLoader) setIsFetching(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFiles();
    const interval = setInterval(() => fetchFiles(false), 5000); // Background refresh without loader
    return () => clearInterval(interval);
  }, []);

  // Handle type change with loader
  useEffect(() => {
    if (!isInitialLoading) {
      setIsTypeChanging(true);
      // Simulate loading delay for type change
      const timer = setTimeout(() => {
        setIsTypeChanging(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeType, isInitialLoading]);

  // Handle view mode change with loader
  const handleViewModeChange = useCallback((newViewMode: 'grid' | 'table') => {
    if (newViewMode !== viewMode) {
      setIsViewChanging(true);
      setTimeout(() => {
        setViewMode(newViewMode);
        setTimeout(() => {
          setIsViewChanging(false);
        }, 600);
      }, 200);
    }
  }, [viewMode]);

  // Fixed getFileType function - this was the main issue
  const getFileType = (file: FileStatus): 'pending' | 'downloaded' | 'imported' => {
    // If download status is 404, file is pending
    if (file.dlStatus === 404) {
      return 'pending';
    }
    
    // If download status is 200 (downloaded successfully)
    if (file.dlStatus === 200) {
      // Check if it's also imported (spStatus exists and is not 404)
      if (file.spStatus && file.spStatus !== 404) {
        return 'imported';
      }
      // If downloaded but not imported, it's in downloaded state
      return 'downloaded';
    }
    
    // Default case - if dlStatus is neither 404 nor 200
    // Check if it has spStatus (imported) without being downloaded
    if (file.spStatus && file.spStatus !== 404) {
      return 'imported';
    }
    
    // Default to pending if status is unclear
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
    if (router && activeType !== type) {
      router.push(`/file-details/${type}`);
    }
  }, [router, activeType]);
  
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

  // Show initial loading
  if (isInitialLoading) {
    return (
      <div className="w-full rounded-lg shadow-md bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <Loader 
          size="lg" 
          text="Loading file management system..." 
          className="min-h-96"
        />
      </div>
    );
  }
  
  return (
    <div className="w-full rounded-lg shadow-md">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        activeType={activeType}
        handleTypeChange={handleTypeChange}
        fileCount={sortedFiles.length}
        onBack={handleBackClick}
        getStatusLabel={getStatusLabel}
        getStatusIcon={getStatusIcon}
      />
      
      {/* Show different loaders based on state */}
      {isTypeChanging ? (
        <div className="relative">
          {viewMode === 'grid' ? <GridLoader /> : <TableLoader />}
        </div>
      ) : isViewChanging ? (
        <div className="relative">
          {viewMode === 'grid' ? <GridLoader /> : <TableLoader />}
        </div>
      ) : viewMode === 'grid' ? (
        <FileGrid
          files={currentFiles}
          activeType={activeType}
          onOpenFolder={onOpenFolderHandler}
          getFileIcon={getFileIcon}
          formatDate={formatDate}
        />
      ) : (
        <FileTable
          files={currentFiles}
          activeType={activeType}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          onOpenFolder={onOpenFolderHandler}
          getFileIcon={getFileIcon}
          formatDate={formatDate}
        />
      )}
      
      {/* Only show pagination when not loading */}
      {!isTypeChanging && !isViewChanging && (
        <Pagination
          totalFiles={sortedFiles.length}
          filesPerPage={filesPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
      
      {/* Background loading indicator for data refresh */}
      {isFetching && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Refreshing data...</span>
        </div>
      )}
    </div>
  );
}