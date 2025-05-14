'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Sample data interfaces
interface FileStatus {
  id: string;
  filename: string;
  filepath: string;
  fileSize: string;
  createdTime: string;
  dlStatus: number;
  spStatus: number;
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
  
  // Activity log
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
      // Mock data for demo (replace with actual API calls)
      const mockFiles: FileStatus[] = [
        {
          id: '001',
          filename: 'sales_report_2025.xlsx',
          filepath: '/reports/sales/2025/05/sales_report_2025.xlsx',
          fileSize: '4.2 MB',
          createdTime: new Date().toISOString(),
          dlStatus: 0,
          spStatus: 0
        },
        {
          id: '002',
          filename: 'user_data_may.csv',
          filepath: '/data/users/may_2025.csv',
          fileSize: '2.8 MB',
          createdTime: new Date().toISOString(),
          dlStatus: 200,
          spStatus: 0,
          downloadedAt: new Date().toISOString()
        },
        {
          id: '003',
          filename: 'metrics_q2.json',
          filepath: '/analytics/metrics/q2_2025.json',
          fileSize: '1.5 MB',
          createdTime: new Date().toISOString(),
          dlStatus: 200,
          spStatus: 200,
          downloadedAt: new Date().toISOString(),
          importedAt: new Date().toISOString()
        }
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
          id: 'log2',
          action: 'Build Task',
          status: 'Completed',
          timestamp: new Date(new Date().getTime() - 5*60000).toISOString(),
          details: 'Build task completed successfully',
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
      // API call: GET /api/automate/status?startDate={startDate}&endDate={endDate}
      const resp = { data: [...pending, ...downloaded, ...imported] };
      
      const today = formatDate(new Date());
      const all = resp.data.filter(f => formatDate(new Date(f.createdTime)) === today);
      
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
      console.error('Error getting file status:', error);
      handleError(error);
    }
  };
  
  const startBuildTask = async () => {
    try {
      // API call: GET /api/automate/buildTask?startDate={startDate}&endDate={endDate}
      toast.success('Build task initiated');
      startDownload();
    } catch (error) {
      console.error('Error starting build task:', error);
      handleError(error);
    }
  };
  
  const startDownload = async () => {
    try {
      // API call: POST /api/automate/DownloadFiles
      setDownloadCycleMessage('Download cycle in progress...');
      setTimeout(() => {
        setDownloadCycleMessage('Download cycle ended');
        setIsProcessing(false);
        localStorage.removeItem('isProcessing');
        startImport();
      }, 5000);
    } catch (error) {
      console.error('Error starting download:', error);
      handleError(error);
    }
  };
  
  const startImport = async () => {
    try {
      if (downloaded.length === 0) {
        toast.error('No files to import');
        return;
      }
      
      // API call: POST /api/automate/ImportFiles
      toast.success(`Successfully imported ${downloaded.length} files`);
      const updatedImported = [...imported, ...downloaded];
      localStorage.setItem('importedFiles', JSON.stringify(updatedImported));
      setImported(updatedImported);
      setDownloaded([]);
      
      setStats({
        ...stats,
        downloadedFiles: 0,
        importedFiles: updatedImported.length,
        lastUpdated: new Date().toLocaleTimeString()
      });
      
    } catch (error) {
      console.error('Error importing files:', error);
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
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-r-2 border-transparent animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 perspective-1000 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <motion.div 
              className="h-15 w-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 15px rgba(79, 70, 229, 0.7)" }}
            >
              <span className="text-lg font-bold text-white">FIT-AI</span>
            </motion.div>
            <div>
              <motion.h1 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Data Processing Dashboard
              </motion.h1>
              <motion.div 
                className="h-1 w-0 bg-gradient-to-r from-blue-400 to-purple-500 mt-1"
                animate={{ width: "100%" }}
                transition={{ delay: 0.6, duration: 1.2 }}
              />
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            <motion.div
              className="flex items-center space-x-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-white/90">{username}</span>
            </motion.div>
            
            <motion.button
              className="px-3 py-1.5 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg flex items-center space-x-1 transition-all border border-white/20"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V9.5a1 1 0 10-2 0V15H4V5h10v2.5a1 1 0 102 0V4a1 1 0 00-1-1H3z" clipRule="evenodd" />
                <path d="M16 12l-4-4v3H8v2h4v3l4-4z" />
              </svg>
              <span className="text-sm font-medium text-white">Logout</span>
            </motion.button>
          </div>
        </header>
        
        {/* Dashboard Controls */}
        <motion.div
          className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 mb-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Start Date</label>
                <input 
                  type="date" 
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white w-full md:w-auto"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">End Date</label>
                <input 
                  type="date" 
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white w-full md:w-auto"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isProcessing ? (
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium flex items-center space-x-2"
                  onClick={triggerStart}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Start Process</span>
                </motion.button>
              ) : (
                <motion.button
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-600/80 rounded-lg text-white font-medium flex items-center space-x-2"
                  onClick={cancelProcess}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel</span>
                </motion.button>
              )}
              
              <motion.button
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium flex items-center space-x-2"
                onClick={refreshStatus}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Refresh</span>
              </motion.button>
            </div>
          </div>
          
          {isProcessing && (
            <motion.div 
              className="mt-4 bg-blue-500/20 backdrop-blur-md rounded-lg p-3 border border-blue-500/30"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                <span className="text-blue-200">{downloadCycleMessage || 'Processing...'}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Total Files */}
          <motion.div
            className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-5 hover:shadow-lg transition-all transform perspective-1000 hover:scale-105 hover:rotate-1 hover:translate-z-10"
            whileHover={{
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Files</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalFiles}</h3>
                <p className="text-xs text-white/40 mt-1">Last updated: {stats.lastUpdated}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          {/* Pending Files */}
          <motion.div
            className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-5 hover:shadow-lg transition-all transform perspective-1000 hover

:scale-105 hover:rotate-1 hover:translate-z-10"
            whileHover={{
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">Pending Files</p>
                <h3 className="text-3xl font-bold text-amber-400 mt-1">{stats.pendingFiles}</h3>
                <Link href="/file-details/pending" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">View details →</Link>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          {/* Downloaded Files */}
          <motion.div 
            className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-5 hover:shadow-lg transition-all transform perspective-1000 hover:scale-105 hover:rotate-1 hover:translate-z-10" 
            whileHover={{
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">Downloaded Files</p>
                <h3 className="text-3xl font-bold text-blue-400 mt-1">{stats.downloadedFiles}</h3>
                <Link href="/file-details/downloaded" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">View details →</Link>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          {/* Imported Files */}
          <motion.div 
            className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-5 hover:shadow-lg transition-all transform perspective-1000 hover:scale-105 hover:rotate-1 hover:translate-z-10" 
            whileHover={{
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">Imported Files</p>
                <h3 className="text-3xl font-bold text-green-400 mt-1">{stats.importedFiles}</h3>
                <Link href="/file-details/imported" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">View details →</Link>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          {/* Processing Speed */}
          <motion.div 
            className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-5 hover:shadow-lg transition-all transform perspective-1000 hover:scale-105 hover:rotate-1 hover:translate-z-10" 
            whileHover={{
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">Processing Speed</p>
                <h3 className="text-3xl font-bold text-purple-400 mt-1">{stats.processingSpeed}</h3>
                <p className="text-xs text-white/40 mt-1">Average over last hour</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Activity Log */}
        <motion.div 
          className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Activity Log</h2>
            <Link href="/activity-log" className="text-sm text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="space-y-4">
            {activityLogs.slice(0, 5).map((log, index) => (
              <motion.div
                key={log.id}
                className="bg-white/10 rounded-lg p-3 flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div>
                  <p className="text-white font-medium">{log.action}</p>
                  <p className="text-xs text-white/60">{log.details}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${log.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>{log.status}</p>
                  <p className="text-xs text-white/40">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* File Status Overview */}
        <motion.div 
          className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">File Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Files */}
            <div>
              <h3 className="text-lg font-medium text-amber-400 mb-2">Pending</h3>
              <ul className="space-y-2">
                {pending.slice(0, 3).map((file) => (
                  <li key={file.id} className="bg-white/10 rounded-lg p-2">
                    <p className="text-sm text-white">{file.filename}</p>
                    <p className="text-xs text-white/60">{file.fileSize}</p>
                  </li>
                ))}
              </ul>
              {pending.length > 3 && (
                <Link href="/file-details/pending" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">View all →</Link>
              )}
            </div>
            {/* Downloaded Files */}
            <div>
              <h3 className="text-lg font-medium text-blue-400 mb-2">Downloaded</h3>
              <ul className="space-y-2">
                {downloaded.slice(0, 3).map((file) => (
                  <li key={file.id} className="bg-white/10 rounded-lg p-2">
                    <p className="text-sm text-white">{file.filename}</p>
                    <p className="text-xs text-white/60">{file.fileSize}</p>
                  </li>
                ))}
              </ul>
              {downloaded.length > 3 && (
                <Link href="/file-details/downloaded" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">View all →</Link>
              )}
            </div>
            {/* Imported Files */}
            <div>
              <h3 className="text-lg font-medium text-green-400 mb-2">Imported</h3>
              <ul className="space-y-2">
                {imported.slice(0, 3).map((file) => (
                  <li key={file.id} className="bg-white/10 rounded-lg p-2">
                    <p className="text-sm text-white">{file.filename}</p>
                    <p className="text-xs text-white/60">{file.fileSize}</p>
                  </li>
                ))}
              </ul>
              {imported.length > 3 && (
                <Link href="/file-details/imported" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">View all →</Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}