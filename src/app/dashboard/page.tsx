'use client';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import Controls from './Controls';
import StatsCards from './StatsCards';
import FileStatusOverview from './FileStatusOverview';
import ActivityLog from './ActivityLog';
import FileDetailsGrid from './FileDetailsGrid';
import SystemStatusSection from './SystemStatusSection';
import { useDashboardLogic } from './useDashboardLogic';

export default function Dashboard() {
  const {
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
  } = useDashboardLogic();

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
          success: { iconTheme: { primary: '#10B981', secondary: '#FFFFFF' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' } },
        }}
      />

      <div className="w-full px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            File Operations Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor downloads, imports, and processing status</p>
        </div>

        {viewMode === 'overview' ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-1 transform transition-all duration-300 hover:scale-[1.01] shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)]">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl overflow-hidden">
                <div className="p-4">
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

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] overflow-hidden transform transition-all duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
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

              <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] overflow-hidden transform transition-all duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Activity Log
                  </h2>
                  <ActivityLog logs={activityLogs} />
                </div>
              </div>
            </div>

            <SystemStatusSection stats={stats} onRefresh={refreshStatus} onShowFileDetails={showFileDetails} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transform transition-all duration-300">
            <FileDetailsGrid
              files={selectedFileType === 'pending' ? pending : selectedFileType === 'downloaded' ? downloaded : imported}
              type={selectedFileType || 'pending'}
              onBack={backToOverview}
              onOpenFolder={openContainingFolder}
            />
          </div>
        )}

        <div className="mt-12 mb-4">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 AI Automation Platform • Version 1.2.4 • System Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}