'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import authService from '@/services/authService';
import { FileStatus, FileStats } from '@/components/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL+'/api/automate/';

interface Stats {
  totalFiles: number;
  pendingFiles: number;
  downloadedFiles: number;
  importedFiles: number;
  processingSpeed: string;
  lastUpdated: string;
}

export interface ActivityLog {
  id: number;
  dir: string;
  segment: string;
  filename: string;
  filetype: string;
  spName: string;
  spStatus: number;
  dlStatus: number;
  lastModified: string;
}

export const useDashboardLogic = () => {
  const router = useRouter();

  // State
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  const [pending, setPending] = useState<FileStatus[]>([]);
  const [downloaded, setDownloaded] = useState<FileStatus[]>([]);
  const [imported, setImported] = useState<FileStatus[]>([]);
  const [downloadCycleMessage, setDownloadCycleMessage] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    pendingFiles: 0,
    downloadedFiles: 0,
    importedFiles: 0,
    processingSpeed: '0 files/min',
    lastUpdated: '--:--',
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [lastImportTime, setLastImportTime] = useState<number>(0);

  // Refs
  const downloadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoTriggerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const importTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  // Helper function to handle incremental file naming
  const processIncrementalFiles = (fileStatuses: FileStatus[]): FileStatus[] => {
    return fileStatuses.map(file => {
      // Check if file has incremental filetype (starts with "I-")
      if (file.filetype && file.filetype.startsWith('I-')) {
        const incrementalNumber = file.filetype.split('-')[1] || '7';
        
        // Remove the ^ character from filename if present and add incremental suffix
        let newFilename = file.filename;
        if (newFilename.endsWith('^')) {
          newFilename = newFilename.slice(0, -1); // Remove the ^ character
        }
        newFilename = `${newFilename}-${incrementalNumber}`;
        
        // Update filepath and spPath accordingly
        let newFilepath = file.filepath;
        let newSpPath = file.spPath;
        
        if (file.filepath) {
          const originalFilename = file.filename;
          newFilepath = file.filepath.replace(originalFilename, newFilename);
        }
        
        if (file.spPath) {
          const originalFilename = file.filename;
          newSpPath = file.spPath.replace(originalFilename, newFilename);
        }
        
        return {
          ...file,
          filename: newFilename,
          filepath: newFilepath,
          spPath: newSpPath
        };
      }
      
      return file;
    });
  };

  // API Services
  const fileStatusService = {
    getFileStatus: async (): Promise<FileStatus[]> => {
      const response = await fetch(`${API_BASE}/status`);
      if (!response.ok) throw new Error('Failed to fetch file status');
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        // Process incremental files before returning
        return processIncrementalFiles(json.data);
      }
      throw new Error('Invalid response format');
    },
    getActivityLogs: async (): Promise<ActivityLog[]> => {
      return []; // Placeholder
    },
  };

  const buildTaskService = {
    startBuildTask: async (date: string) => {
      const response = await fetch(`${API_BASE}/buildTask?startDate=${date}&endDate=${date}`);
      if (!response.ok) throw new Error('Build task failed');
    },
  };

  const downloadService = {
    startDownload: async () => {
      const response = await fetch(`${API_BASE}/DownloadFiles`, { method: 'GET' });
      if (!response.ok) throw new Error('Download failed');
    },
  };

  const importService = {
    importFiles: async (files: FileStatus[]): Promise<FileStatus[]> => {
      if (files.length === 0) {
        throw new Error('No files provided for import');
      }
      const response = await fetch(`${API_BASE}/ImportFiles`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Import failed');
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        // Process incremental files in the response
        return processIncrementalFiles(json.data);
      }
      throw new Error('Invalid import response');
    },
  };

  // Initialization
  useEffect(() => {
    const initialize = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      setUsername(authService.getToken()?.substring(0, 8) || 'User');
      const today = formatDate(new Date());
      setStartDate(today);
      setEndDate(today);

      const processing = localStorage.getItem('isProcessing') === 'true';
      setIsProcessing(processing);

      if (processing) {
        setStartDate(localStorage.getItem('fs_startDate') || today);
        setEndDate(localStorage.getItem('fs_endDate') || today);
        triggerGetFileStatus();
      }

      let importedFiles: FileStatus[] = JSON.parse(localStorage.getItem('importedFiles') || '[]');
      importedFiles = importedFiles.filter((f) => formatDate(new Date(f.createdTime)) === today);
      localStorage.setItem('importedFiles', JSON.stringify(importedFiles));
      setImported(importedFiles);

      await fetchInitialData();

      // Status check timer
      statusTimerRef.current = setInterval(() => {
        if (isProcessing) refreshStatus();
      }, 20000);

      // Auto-trigger timer
      autoTriggerTimerRef.current = setInterval(async () => {
        if (isProcessing) return;
        try {
          const fileStatuses = await fileStatusService.getFileStatus();
          const todayFiles = fileStatuses.filter((f) => formatDate(new Date(f.createdTime)) === today);
          const hasIncompleteFiles = todayFiles.some(
            (f) => f.dlStatus !== 200 || (f.dlStatus === 200 && f.spStatus === 404)
          );
          if (hasIncompleteFiles || todayFiles.length === 0) triggerStart();
        } catch (error) {
          console.error('Error checking status for auto-trigger:', error);
        }
      }, 180000);

      setLoading(false);
    };

    initialize();

    return () => {
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
      if (autoTriggerTimerRef.current) clearInterval(autoTriggerTimerRef.current);
      if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
      if (importTimerRef.current) clearInterval(importTimerRef.current);
    };
  }, [router]);

  // Functions
  const fetchInitialData = async () => {
    try {
      const fileStatuses = await fileStatusService.getFileStatus();
      updateFileStates(fileStatuses);
      updateStats(fileStatuses);
      const logs = await fileStatusService.getActivityLogs();
      setActivityLogs(logs);
    } catch (error) {
      handleError(error);
    }
  };

  const refreshStatus = () => triggerGetFileStatus();

  const triggerGetFileStatus = async () => {
    try {
      const fileStatuses = await fileStatusService.getFileStatus();
      const today = formatDate(new Date());
      const todayFiles = fileStatuses.filter((f) => formatDate(new Date(f.createdTime)) === today);

      updateFileStates(todayFiles);
      updateStats(todayFiles);

      if (todayFiles.length === 0) {
        await startBuildTask(today);
      } else {
        const hasFilesToDownload = todayFiles.some((f) => f.dlStatus !== 200);
        const hasFilesToImport = todayFiles.some((f) => f.dlStatus === 200 && f.spStatus === 404);

        if (hasFilesToDownload) {
          startDownload();
          
          if (hasFilesToImport && Date.now() - lastImportTime > 15000) {
            startImportCycle();
          }
        } else if (hasFilesToImport) {
          setDownloadCycleMessage('Ready to import');
          startImport();
        } else {
          setIsProcessing(false);
          localStorage.removeItem('isProcessing');
          toast.success('All files have been processed');
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const updateFileStates = (fileStatuses: FileStatus[]) => {
    const today = formatDate(new Date());
    const all = fileStatuses.filter((f) => formatDate(new Date(f.createdTime)) === today);
    
    setPending(all.filter((f) => f.dlStatus !== 200));
    setDownloaded(all.filter((f) => f.dlStatus === 200));
    setImported(all.filter((f) => f.dlStatus === 200 && f.spStatus !== 404));
  };

  const updateStats = (fileStatuses: FileStatus[]) => {
    const today = formatDate(new Date());
    const todayFiles = fileStatuses.filter((f) => formatDate(new Date(f.createdTime)) === today);
    
    const totalFiles = todayFiles.length;
    const pendingFiles = todayFiles.filter((f) => f.dlStatus !== 200).length;
    const downloadedFiles = todayFiles.filter((f) => f.dlStatus === 200).length;
    const importedFiles = todayFiles.filter((f) => f.dlStatus === 200 && f.spStatus !== 404).length;

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentImported = todayFiles.filter(
      (f) => f.spStatus !== 404 && new Date(f.lastModified || f.createdTime) > hourAgo
    );
    const processingSpeed =
      recentImported.length > 0 ? `${(recentImported.length / 60).toFixed(1)} files/min` : '0 files/min';

    setStats({
      totalFiles,
      pendingFiles,
      downloadedFiles,
      importedFiles,
      processingSpeed,
      lastUpdated: now.toLocaleTimeString(),
    });
  };

  const startBuildTask = async (date: string) => {
    try {
      setDownloadCycleMessage('Building task...');
      await buildTaskService.startBuildTask(date);
      toast.success('Build task initiated');
      setTimeout(() => triggerGetFileStatus(), 3000);
    } catch (error) {
      handleError(error);
    }
  };

  const startImportCycle = () => {
    if (importTimerRef.current) clearInterval(importTimerRef.current);
    
    importTimerRef.current = setInterval(async () => {
      try {
        const fileStatuses = await fileStatusService.getFileStatus();
        const today = formatDate(new Date());
        const filesToImport = fileStatuses.filter(
          (f) => 
            formatDate(new Date(f.createdTime)) === today && 
            f.dlStatus === 200 && 
            f.spStatus === 404
        );
        
        if (filesToImport.length > 0) {
          await processImport(filesToImport);
          setLastImportTime(Date.now());
        }
        
        const allProcessed = !fileStatuses.some(
          (f) => 
            formatDate(new Date(f.createdTime)) === today &&
            (f.dlStatus !== 200 || (f.dlStatus === 200 && f.spStatus === 404))
        );
        
        if (allProcessed) {
          if (importTimerRef.current) clearInterval(importTimerRef.current);
          setIsProcessing(false);
          localStorage.removeItem('isProcessing');
          toast.success('All files have been processed');
        }
      } catch (error) {
        console.error('Import cycle error:', error);
      }
    }, 30000);
  };

  const startDownload = async () => {
    try {
      setDownloadCycleMessage('Hang tight! Automation is running...');
      await downloadService.startDownload();

      if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
      downloadTimerRef.current = setInterval(async () => {
        const fileStatuses = await fileStatusService.getFileStatus();
        const today = formatDate(new Date());
        const todayFiles = fileStatuses.filter((f) => formatDate(new Date(f.createdTime)) === today);

        updateFileStates(todayFiles);
        updateStats(todayFiles);

        const readyToImport = todayFiles.filter(f => f.dlStatus === 200 && f.spStatus === 404);
        if (readyToImport.length > 0 && Date.now() - lastImportTime > 15000) {
          processImport(readyToImport);
          setLastImportTime(Date.now());
        }

        const stillPending = todayFiles.some((f) => f.dlStatus !== 200);
        if (!stillPending) {
          if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
          
          const hasFilesToImport = todayFiles.some((f) => f.dlStatus === 200 && f.spStatus === 404);
          if (hasFilesToImport) {
            setDownloadCycleMessage('Ready to import');
            startImport();
          } else {
            setIsProcessing(false);
            localStorage.removeItem('isProcessing');
            toast.success('All files processed successfully');
          }
        }
      }, 5000);
    } catch (error) {
      handleError(error);
    }
  };

  const processImport = async (filesToImport: FileStatus[]) => {
    try {
      setDownloadCycleMessage('Hang tight! Automation is running....');
      const importedResults = await importService.importFiles(filesToImport);
      
      const existingImported: FileStatus[] = JSON.parse(localStorage.getItem('importedFiles') || '[]');
      const today = formatDate(new Date());
      const newlyImported = importedResults.filter((f) => f.spStatus !== 404);
      const updatedImported = [
        ...existingImported.filter((f) => formatDate(new Date(f.createdTime)) === today),
        ...newlyImported,
      ];
      localStorage.setItem('importedFiles', JSON.stringify(updatedImported));
      
      toast.success(`Successfully imported ${newlyImported.length} files`);
      return newlyImported;
    } catch (error) {
      console.error('Import processing error:', error);
      throw error;
    }
  };

  const startImport = async () => {
    try {
      if (downloaded.length === 0) {
        toast.error('No files to import');
        return;
      }
      
      setDownloadCycleMessage('Hang tight! Automation is running....');
      const filesToImport = downloaded.map((file) => ({ ...file }));
      await processImport(filesToImport);

      await triggerGetFileStatus();
      setDownloadCycleMessage('Import complete');

      const fileStatuses = await fileStatusService.getFileStatus();
      const todayFiles = fileStatuses.filter((f) => formatDate(new Date(f.createdTime)) === today);
      const allImported = !todayFiles.some((f) => f.dlStatus === 200 && f.spStatus === 404);

      if (allImported) {
        setIsProcessing(false);
        localStorage.removeItem('isProcessing');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Authentication')) {
      toast.error('Authentication failed. Please login again.');
      router.push('/login');
    } else {
      toast.error(`Error: ${message}`);
    }
    setIsProcessing(false);
    localStorage.removeItem('isProcessing');
    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    if (importTimerRef.current) clearInterval(importTimerRef.current);
  };

  const triggerStart = () => {
    if (isProcessing) {
      toast.error('Process already running');
      return;
    }
    localStorage.setItem('isProcessing', 'true');
    localStorage.setItem('fs_startDate', startDate);
    localStorage.setItem('fs_endDate', endDate);
    setIsProcessing(true);
    toast.success('Process started');
    triggerGetFileStatus();
  };

  const cancelProcess = () => {
    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    if (importTimerRef.current) clearInterval(importTimerRef.current);
    setIsProcessing(false);
    setDownloadCycleMessage('');
    localStorage.removeItem('isProcessing');
    localStorage.removeItem('fs_startDate');
    localStorage.removeItem('fs_endDate');
    toast.success('Process canceled');
  };

  const showFileDetails = (type: string) => {
    setViewMode('details');
    setSelectedFileType(type);
  };

  const backToOverview = () => {
    setViewMode('overview');
    setSelectedFileType(null);
  };

  const openContainingFolder = (filepath: string) => {
    toast.success(`Opening folder: ${filepath}`);
  };

  const navigateToDetails = (type: 'pending' | 'downloaded' | 'imported') => {
    const allFiles = [...pending, ...downloaded];
    localStorage.setItem('fileDetailsAllFiles', JSON.stringify(allFiles));
    router.push(`/file-details/${type}`);
  };

  return {
    username,
    loading,
    isProcessing,
    startDate,
    endDate,
    viewMode,
    selectedFileType,
    pending,
    downloaded,
    imported,
    downloadCycleMessage,
    stats,
    activityLogs,
    setStartDate,
    setEndDate,
    refreshStatus,
    triggerStart,
    cancelProcess,
    showFileDetails,
    backToOverview,
    openContainingFolder,
    navigateToDetails
  };
};