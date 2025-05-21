'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// Import sub-components (assumed to be implemented separately)
import Controls from './Controls';
import StatsCards from './StatsCards';
import FileStatusOverview from './FileStatusOverview';
import ActivityLog from './ActivityLog';
import FileDetailsGrid from './FileDetailsGrid';
import authService from '@/services/authService'; // Authentication service
import { FileStatus, FileStats } from '@/components/types'; // Type definitions

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

// API base URL
const API_BASE = 'http://192.168.1.119:3000/api/automate';

export default function Dashboard() {
  const router = useRouter();

  // State definitions
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState('overview');
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [pending, setPending] = useState([]);
  const [downloaded, setDownloaded] = useState([]);
  const [imported, setImported] = useState([]);
  const [downloadCycleMessage, setDownloadCycleMessage] = useState('');
  const [stats, setStats] = useState({
    totalFiles: 0,
    pendingFiles: 0,
    downloadedFiles: 0,
    importedFiles: 0,
    processingSpeed: '0 files/min',
    lastUpdated: '--:--',
  });
  const [activityLogs, setActivityLogs] = useState([]);

  // Timer references
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTriggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Utility function to format date as 'YYYY-MM-DD'
  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  // API service functions
  const fileStatusService = {
    async getFileStatus() {
      const response = await fetch(`${API_BASE}/status`);
      if (!response.ok) throw new Error('Failed to fetch file status');
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      } else {
        throw new Error('Invalid response format');
      }
    },
    async getActivityLogs() {
      // Placeholder; implement if an endpoint exists
      return [];
    },
  };

  const buildTaskService = {
    async startBuildTask(date: any) {
      const response = await fetch(`${API_BASE}/buildTask?startDate=${date}&endDate=${date}`);
      if (!response.ok) throw new Error('Build task failed');
    },
  };

  const downloadService = {
    async startDownload() {
      const response = await fetch(`${API_BASE}/DownloadFiles`, { method: 'GET' });
      if (!response.ok) throw new Error('Download failed');
    },
  };

  const importService = {
    async importFiles(files: any[]) {
      const response = await fetch(`${API_BASE}/ImportFiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(files),
      });
      if (!response.ok) throw new Error('Import failed');
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      } else {
        throw new Error('Invalid import response');
      }
    },
  };

  // Initialization useEffect

useEffect(() => {
  const initialize = async () => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    setUsername(authService.getToken()?.substring(0, 8) || 'User');
    const today = formatDate(new Date());
    setStartDate(today);
    setEndDate(today);

    // Load processing state from localStorage
    const processing = localStorage.getItem('isProcessing') === 'true';
    setIsProcessing(processing);

    if (processing) {
      const savedStartDate = localStorage.getItem('fs_startDate') || today;
      const savedEndDate = localStorage.getItem('fs_endDate') || today;
      setStartDate(savedStartDate);
      setEndDate(savedEndDate);
      triggerGetFileStatus();
    }

    // Clean and load imported files for today only
    let importedFiles = JSON.parse(localStorage.getItem('importedFiles') || '[]');
    importedFiles = importedFiles.filter((f: { createdTime: string | number | Date; }) => formatDate(new Date(f.createdTime)) === today);
    localStorage.setItem('importedFiles', JSON.stringify(importedFiles));
    setImported(importedFiles);

    // Fetch initial data
    await fetchInitialData();

    // Set up timers
    statusTimerRef.current = setInterval(() => {
      if (isProcessing) refreshStatus();
    }, 30000); // Refresh status every 30 seconds

    // Modified: Fix the auto-trigger timer to properly check conditions and start process
    autoTriggerTimerRef.current = setInterval(async () => {
      if (isProcessing) return; // Don't start if already processing
      
      // Get current status to make accurate decisions
      try {
        const fileStatuses = await fileStatusService.getFileStatus();
        const today = formatDate(new Date());
        const todayFiles = fileStatuses.filter((f: { createdTime: string | number | Date; }) => 
          formatDate(new Date(f.createdTime)) === today);
        
        // Check if there's any pending work to be done
        const hasIncompleteFiles = todayFiles.some((f: any) => 
          f.dlStatus !== 200 || (f.dlStatus === 200 && f.spStatus === 404));
        
        // Start the process if there's pending work or no files at all
        if (hasIncompleteFiles || todayFiles.length === 0) {
          triggerStart();
        }
      } catch (error) {
        console.error("Error checking status for auto-trigger:", error);
      }
    }, 180000); // Auto-start check every 3 minutes

    setLoading(false);
  };

  initialize();

  // Cleanup timers on unmount
  return () => {
    if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    if (autoTriggerTimerRef.current) clearInterval(autoTriggerTimerRef.current);
    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
  };
}, [router]);

  // Fetch initial data
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

  // Refresh status
  const refreshStatus = () => triggerGetFileStatus();

  // Core process logic
const triggerGetFileStatus = async () => {
  try {
    const fileStatuses = await fileStatusService.getFileStatus();
    const today = formatDate(new Date());
    const todayFiles = fileStatuses.filter((f: { createdTime: string | number | Date; }) => formatDate(new Date(f.createdTime)) === today);

    updateFileStates(todayFiles);
    updateStats(todayFiles);

    if (todayFiles.length === 0) {
      await startBuildTask(today);
    } else if (todayFiles.some((f: { dlStatus: number; }) => f.dlStatus !== 200)) {
      startDownload();
    } else if (todayFiles.some((f: { dlStatus: number; spStatus: number; }) => f.dlStatus === 200 && f.spStatus === 404)) {
      // Changed: Instead of just setting a message, actually start the import process
      setDownloadCycleMessage('Ready to import');
      startImport(); // <-- Add this line to automatically trigger import
    } else {
      setIsProcessing(false);
      localStorage.removeItem('isProcessing');
      toast.success('All files have been processed');
    }
  } catch (error) {
    handleError(error);
  }
};
  // Update file states based on status
  const updateFileStates = (fileStatuses: any[]) => {
    const today = formatDate(new Date());
    const all = fileStatuses.filter((f) => formatDate(new Date(f.createdTime)) === today);
    
    // Fixed: Using correct status conditions with number comparison
    const newPending = all.filter((f) => f.dlStatus !== 200);
    const newDownloaded = all.filter((f) => f.dlStatus === 200 && f.spStatus === 404);
    const newImported = all.filter((f) => f.dlStatus === 200 && f.spStatus !== 404);

    setPending(newPending);
    setDownloaded(newDownloaded);
    setImported(newImported);
  };

  // Update statistics
  const updateStats = (fileStatuses: any[]) => {
    const today = formatDate(new Date());
    const todayFiles = fileStatuses.filter((f) => formatDate(new Date(f.createdTime)) === today);
    const totalFiles = todayFiles.length;
    
    // Fixed: Using correct status conditions with number comparison
    const pendingFiles = todayFiles.filter((f) => f.dlStatus !== 200).length;
    const downloadedFiles = todayFiles.filter((f) => f.dlStatus === 200 && f.spStatus === 404).length;
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

  // Build task for today
  const startBuildTask = async (date: string) => {
    try {
      setDownloadCycleMessage('Building task...');
      await buildTaskService.startBuildTask(date);
      toast.success('Build task initiated');
      setTimeout(() => triggerGetFileStatus(), 3000); // Wait 3 seconds then check status
    } catch (error) {
      handleError(error);
    }
  };

  // Start download process with polling
  const startDownload = async () => {
    try {
      setDownloadCycleMessage('Download cycle in progress...');
      await downloadService.startDownload();

      if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
      downloadTimerRef.current = setInterval(async () => {
        const fileStatuses = await fileStatusService.getFileStatus();
        const today = formatDate(new Date());
        const todayFiles = fileStatuses.filter((f: { createdTime: string | number | Date; }) => formatDate(new Date(f.createdTime)) === today);

        updateFileStates(todayFiles);
        updateStats(todayFiles);

        const stillPending = todayFiles.some((f: { dlStatus: number; }) => f.dlStatus !== 200);
        if (!stillPending) {
          clearInterval(downloadTimerRef.current);
          setDownloadCycleMessage('Download cycle ended');
          
          // Fixed: Using number comparison (404) instead of string ('404')
          if (todayFiles.some((f: { dlStatus: number; spStatus: number; }) => f.dlStatus === 200 && f.spStatus === 404)) {
            setDownloadCycleMessage('Ready to import');
          } else {
            setIsProcessing(false);
            localStorage.removeItem('isProcessing');
            toast.success('All files processed successfully');
          }
        }
      }, 5000); // Poll every 5 seconds
    } catch (error) {
      handleError(error);
    }
  };

  // Start import process
  const startImport = async () => {
    try {
      if (downloaded.length === 0) {
        toast.error('No files to import');
        return;
      }
      
      setDownloadCycleMessage('Importing files...');
      const filesToImport = downloaded.map((file) => ({ ...file }));
      const importedResults = await importService.importFiles(filesToImport);

      // After import, trigger a status refresh to see if spStatus has been updated
      await triggerGetFileStatus();
      
      // Update localStorage with newly imported files
      const existingImported = JSON.parse(localStorage.getItem('importedFiles') || '[]');
      const today = formatDate(new Date());
      
      // Only include files where spStatus is no longer 404 (successfully imported)
      const newlyImported = importedResults.filter(f => f.spStatus !== 404);
      
      const updatedImported = [
        ...existingImported.filter((f) => formatDate(new Date(f.createdTime)) === today),
        ...newlyImported,
      ];
      
      localStorage.setItem('importedFiles', JSON.stringify(updatedImported));

      setDownloadCycleMessage('Import complete');
      
      // Only set processing to false if all files have been imported
      const fileStatuses = await fileStatusService.getFileStatus();
      const todayFiles = fileStatuses.filter((f: { createdTime: string | number | Date; }) => formatDate(new Date(f.createdTime)) === today);
      const allImported = !todayFiles.some((f: { dlStatus: number; spStatus: number; }) => f.dlStatus === 200 && f.spStatus === 404);
      
      if (allImported) {
        setIsProcessing(false);
        localStorage.removeItem('isProcessing');
      }
      
      toast.success(`Successfully imported ${newlyImported.length} files`);
    } catch (error) {
      handleError(error);
    }
  };

  // Error handler
  const handleError = (error) => {
    if (error.status === 401 || (error.message && error.message.includes('Authentication'))) {
      toast.error('Authentication failed. Please login again.');
      router.push('/login');
    } else {
      toast.error(`Error: ${error.message || 'Unknown error'}`);
    }
    setIsProcessing(false);
    localStorage.removeItem('isProcessing');
    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
  };

  // Trigger start process
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

  // Cancel process
  const cancelProcess = () => {
    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    setIsProcessing(false);
    setDownloadCycleMessage('');
    localStorage.removeItem('isProcessing');
    localStorage.removeItem('fs_startDate');
    localStorage.removeItem('fs_endDate');
    toast.success('Process canceled');
  };

  // View mode handlers
  const showFileDetails = (type) => {
    setViewMode('details');
    setSelectedFileType(type);
  };

  const backToOverview = () => {
    setViewMode('overview');
    setSelectedFileType(null);
  };

  const openContainingFolder = (filepath: any) => {
    toast.success(`Opening folder: ${filepath}`);
  };











  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-indigo-700 font-medium">Loading dashboard...</p>
          <p className="text-gray-500">Please wait while we prepare your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-auto bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-300 ease-in-out">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#334155',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      <div className="w-full px-6 py-6 transition-all duration-300 ease-in-out">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            File Operations Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor downloads, imports, and processing status
          </p>
        </div>

        {viewMode === 'overview' ? (
          <div className="space-y-8">
            {/* Controls Section */}
            <div className="bg-white rounded-2xl p-1 transform transition-all duration-300 hover:scale-[1.01] shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)]">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl overflow-hidden">
                <div className="p-6">
                  <Controls
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    isProcessing={isProcessing}
                    onStart={triggerStart}
                    onCancel={cancelProcess}
                    onRefresh={refreshStatus}
                    downloadCycleMessage={downloadCycleMessage}
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="transform transition-all duration-300">
              <StatsCards stats={stats} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* File Status Overview */}
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] overflow-hidden transform transition-all duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    File Status Overview
                  </h2>
                  <FileStatusOverview
                    pending={pending}
                    downloaded={downloaded}
                    imported={imported}
                    onOpenFolder={openContainingFolder}
                  />
                </div>
              </div>

              {/* Activity Log */}
              <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] overflow-hidden transform transition-all duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Activity Log
                  </h2>
                  <ActivityLog logs={activityLogs} />
                </div>
              </div>
            </div>

            {/* System Status & Performance Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Performance Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(30,_64,_175,_0.25)] transform transition-all duration-300 hover:shadow-[0_15px_30px_rgba(30,_64,_175,_0.35)] hover:translate-y-[-5px]">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  System Performance
                </h3>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-blue-100">Processing Speed</p>
                    <p className="text-2xl font-bold">{stats.processingSpeed}</p>
                  </div>
                  <div className="rounded-full p-3 bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* System Status Card */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(8,_112,_184,_0.1)] transform transition-all duration-300 hover:shadow-[0_15px_30px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
                <h3 className="text-lg font-medium mb-2 text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  System Status
                </h3>
                <div className="flex items-center mt-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <p className="text-gray-600">All systems operational</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">Last updated: {stats.lastUpdated}</p>
              </div>

              {/* Today's Files Card */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(8,_112,_184,_0.1)] transform transition-all duration-300 hover:shadow-[0_15px_30px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
                <h3 className="text-lg font-medium mb-2 text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Today's Files
                </h3>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Processing Complete</span>
                   <span className="font-bold text-gray-800">
  {((stats.importedFiles / (stats.totalFiles || 1)) * 100).toFixed(2)}%
</span>

                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.round((stats.importedFiles / (stats.totalFiles || 1)) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(8,_112,_184,_0.1)] transform transition-all duration-300 hover:shadow-[0_15px_30px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
                <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={refreshStatus}
                    className="w-full py-2 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg flex items-center justify-center transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Status
                  </button>
                  <button
                    onClick={() => showFileDetails('pending')}
                    className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    View All Files
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transform transition-all duration-300">
            <FileDetailsGrid
              files={
                selectedFileType === 'pending' ? pending :
                selectedFileType === 'downloaded' ? downloaded :
                imported
              }
              type={selectedFileType || 'pending'}
              onBack={backToOverview}
              onOpenFolder={openContainingFolder}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 mb-4">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 AI Automation Platform • Version 1.2.4 • System Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}