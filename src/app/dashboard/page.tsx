'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import Controls from './Controls';
import StatsCards from './StatsCards';
import ActivityLog from './ActivityLog';
import FileStatusOverview from './FileStatusOverview';
import FileDetailsGrid from './FileDetailsGrid';
import authService from '@/services/authService';
import * as fileStatusService from '@/services/fileStatusService';
import * as downloadService from '@/services/downloadService';
import * as importService from '@/services/importService';
import * as buildTaskService from '@/services/buildTaskService';

// Define interfaces for data structures
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

interface FileStats {
  totalFiles: number;
  pendingFiles: number;
  downloadedFiles: number;
  importedFiles: number;
  processingSpeed: string;
  lastUpdated: string;
}

interface ActivityLog {
  id: string;
  action: string;
  status: string;
  timestamp: string;
  details: string;
  user: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');
  const [selectedFileType, setSelectedFileType] = useState<'pending' | 'downloaded' | 'imported' | null>(null);
  
  // File status data
  const [pending, setPending] = useState<FileStatus[]>([]);
  const [downloaded, setDownloaded] = useState<FileStatus[]>([]);
  const [imported, setImported] = useState<FileStatus[]>([]);
  const [downloadCycleMessage, setDownloadCycleMessage] = useState<string>('');
  
  // Stats
  const [stats, setStats] = useState<FileStats>({
    totalFiles: 0,
    pendingFiles: 0,
    downloadedFiles: 0,
    importedFiles: 0,
    processingSpeed: '0 files/min',
    lastUpdated: '--:--'
  });
  
  // Activity logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Format date YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const checkAuth = async () => {
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
        const savedStartDate = localStorage.getItem('fs_startDate') || today;
        const savedEndDate = localStorage.getItem('fs_endDate') || today;
        setStartDate(savedStartDate);
        setEndDate(savedEndDate);
        triggerGetFileStatus(savedStartDate, savedEndDate);
      }
      
      let imported = JSON.parse(localStorage.getItem('importedFiles') || '[]');
      imported = imported.filter((f: any) => formatDate(new Date(f.createdTime)) === today);
      setImported(imported);
      
      const statusTimer = setInterval(() => {
        if (isProcessing) {
          refreshStatus();
        }
      }, 30000);
      
      const autoTriggerTimer = setTimeout(() => {
        if (!isProcessing && !pending.length && !downloaded.length) {
          // Auto start processing (commented for now)
          // triggerStart();
        }
      }, 300000);
      
      fetchInitialData();
      setLoading(false);
      
      return () => {
        clearInterval(statusTimer);
        clearTimeout(autoTriggerTimer);
      };
    };
    
    checkAuth();
  }, [router]);

  // Fetch initial dashboard data
  const fetchInitialData = async () => {
    try {
      // Mock data for demo
      const mockFiles: FileStatus[] = [
        {
          id: '001',
          dir: "common",
          segment: "FO",
          folderPath: "/MarketReports/",
          filename: "F_CN01_NSE_15052025.CSV.gz",
          filepath: "//FITMINDS/Work/Application_Release/CommonFolderInfluxCRM/AutoDocs",
          fileSize: '4.2 MB',
          filetype: "N",
          spName: "InsertFODataForSelectLOT",
          spParam: "Module-ModifyUser-ExchangeSegmentID",
          spParamValue: " -9999-2",
          spPath: "",
          spStatus: 404,
          dlStatus: 404,
          ePath: "",
          reserved: "",
          lastModified: "",
          spTime: "",
          dlTime: "",
          createdTime: new Date().toISOString()
        },
        {
          id: '002',
          dir: "common",
          segment: "EQ",
          folderPath: "/DailyReports/",
          filename: "EQ_Market_15052025.xlsx",
          filepath: "//FITMINDS/Work/Application_Release/CommonFolderInfluxCRM/AutoDocs/EQ",
          fileSize: '2.8 MB',
          filetype: "E",
          spName: "ProcessEQMarketData",
          spParam: "Module-ExchangeID",
          spParamValue: " -1",
          spPath: "",
          spStatus: 0,
          dlStatus: 200,
          ePath: "",
          reserved: "",
          lastModified: "",
          spTime: "",
          dlTime: new Date().toISOString(),
          createdTime: new Date().toISOString(),
          downloadedAt: new Date().toISOString()
        },
        {
          id: '003',
          dir: "reports",
          segment: "CD",
          folderPath: "/Analytics/",
          filename: "CD_TRADING_15052025.csv",
          filepath: "//FITMINDS/Work/Application_Release/CommonFolderInfluxCRM/AutoDocs/CD",
          fileSize: '1.5 MB',
          filetype: "C",
          spName: "ImportCDTradingData",
          spParam: "Module-ReportDate",
          spParamValue: " -20250515",
          spPath: "",
          spStatus: 200,
          dlStatus: 200,
          ePath: "",
          reserved: "",
          lastModified: "",
          spTime: new Date(new Date().getTime() - 5*60000).toISOString(),
          dlTime: new Date(new Date().getTime() - 15*60000).toISOString(),
          createdTime: new Date().toISOString(),
          downloadedAt: new Date().toISOString(),
          importedAt: new Date().toISOString()
        },
      ];
      
      const pending = mockFiles.filter(f => f.dlStatus !== 200);
      const downloaded = mockFiles.filter(f => f.dlStatus === 200 && f.spStatus !== 200);
      const imported = mockFiles.filter(f => f.spStatus === 200);
      
      setPending(pending);
      setDownloaded(downloaded);
      setImported(imported);
      
      setStats({
        totalFiles: mockFiles.length,
        pendingFiles: pending.length,
        downloadedFiles: downloaded.length,
        importedFiles: imported.length,
        processingSpeed: '6.7 files/min',
        lastUpdated: new Date().toLocaleTimeString()
      });
      
      const mockLogs: ActivityLog[] = [
        {
          id: 'log1',
          action: 'Download Started',
          status: 'Completed',
          timestamp: new Date().toISOString(),
          details: 'Started downloading 12 files',
          user: username
        },
        {
          id: 'log3',
          action: 'Import Files',
          status: 'In Progress',
          timestamp: new Date(new Date().getTime() - 10*60000).toISOString(),
          details: 'Importing 8 files to the system',
          user: username
        }
      ];
      
      setActivityLogs(mockLogs);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load dashboard data');
    }
  };
  
  const refreshStatus = () => {
    triggerGetFileStatus(startDate, endDate);
  };
  
  const triggerGetFileStatus = async (start: string, end: string) => {
    try {
      const allFiles = await fileStatusService.getFileStatus(start, end);
      const today = formatDate(new Date());
      const all = allFiles.filter(f => formatDate(new Date(f.createdTime)) === today);
      
      const newPending = all.filter(f => f.dlStatus !== 200);
      const newDownloaded = all.filter(f => f.dlStatus === 200 && f.spStatus !== 200);
      const newImported = all.filter(f => f.spStatus === 200);
      
      setPending(newPending);
      setDownloaded(newDownloaded);
      setImported(newImported);
      
      setStats({
        ...stats,
        pendingFiles: newPending.length,
        downloadedFiles: newDownloaded.length,
        importedFiles: newImported.length,
        lastUpdated: new Date().toLocaleTimeString()
      });
      
      if (newPending.length > 0) {
        startDownload();
      } else {
        startBuildTask();
      }
      
    } catch (error) {
      handleError(error);
    }
  };
  
  const startBuildTask = async () => {
    try {
      await buildTaskService.startBuildTask(startDate, endDate);
      toast.success('Build task initiated');
      startDownload();
    } catch (error) {
      handleError(error);
    }
  };
  
  const startDownload = async () => {
    try {
      await downloadService.startDownload();
      setDownloadCycleMessage('Download cycle in progress...');
      setTimeout(() => {
        setDownloadCycleMessage('Download cycle ended');
        setIsProcessing(false);
        localStorage.removeItem('isProcessing');
        startImport();
      }, 5000);
    } catch (error) {
      handleError(error);
    }
  };
  
  const startImport = async () => {
    try {
      if (downloaded.length === 0) {
        toast.error('No files to import');
        return;
      }
      
      const updatedImported = await importService.importFiles(downloaded);
      localStorage.setItem('importedFiles', JSON.stringify(updatedImported));
      setImported(updatedImported);
      setDownloaded([]);
      
      setStats({
        ...stats,
        downloadedFiles: 0,
        importedFiles: updatedImported.length,
        lastUpdated: new Date().toLocaleTimeString()
      });
      
      toast.success(`Successfully imported ${downloaded.length} files`);
      
    } catch (error) {
      handleError(error);
    }
  };
  
  const handleError = (error: any) => {
    if (error.status === 401) {
      toast.error('Authentication failed. Please login again.');
      router.push('/login');
      return;
    }
    toast.error(`Error: ${error.message || 'Unknown error'}`);
    setIsProcessing(false);
    localStorage.removeItem('isProcessing');
  };
  
  const triggerStart = () => {
    if (!startDate || !endDate) {
      toast.error('Please select valid dates');
      return;
    }
    
    if (isProcessing) {
      toast.error('Process already running');
      return;
    }
    
    localStorage.setItem('isProcessing', 'true');
    localStorage.setItem('fs_startDate', startDate);
    localStorage.setItem('fs_endDate', endDate);
    
    setIsProcessing(true);
    toast.success('Process started');
    triggerGetFileStatus(startDate, endDate);
  };
  
  const cancelProcess = () => {
    setIsProcessing(false);
    localStorage.removeItem('isProcessing');
    localStorage.removeItem('fs_startDate');
    localStorage.removeItem('fs_endDate');
    toast.success('Process canceled');
  };
  
  const showFileDetails = (type: 'pending' | 'downloaded' | 'imported') => {
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
            {/* Controls Section with 3D Effect */}
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
            
            {/* Stats Cards with Enhanced 3D look */}
            <div className="transform transition-all duration-300">
              <StatsCards 
                stats={stats} 
                onShowDetails={showFileDetails}
              />
            </div>
            
            {/* Main Content Grid with 3D Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* File Status Overview - Spans 2 columns on large screens */}
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
                    onShowDetails={showFileDetails}
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
                    <span className="font-bold text-gray-800">{Math.round((stats.importedFiles / (stats.totalFiles || 1)) * 100)}%</span>
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
        
        {/* Footer with system info */}
        <div className="mt-12 mb-4">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 AI Automation Platform • Version 1.2.4 • System Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}