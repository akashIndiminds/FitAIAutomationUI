'use client';

import React from 'react';

interface ControlsProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  isProcessing: boolean;
  onStart: () => void;
  onCancel: () => void;
  onRefresh: () => void;
  downloadCycleMessage: string;
}

export default function Controls({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isProcessing,
  onStart,
  onCancel,
  onRefresh,
  downloadCycleMessage
}: ControlsProps) {
  // Split message to remove timestamp and extract main content
  const processMessage = (message: string) => {
    if (!message) return { mainMessage: '', hasNote: false };

    // Remove timestamp pattern (like "at 10:30:45 AM")
    const withoutTime = message.replace(/\s+at\s+\d{1,2}:\d{2}:\d{2}\s+(AM|PM)/gi, '');

    // Check if it's a note/warning message
    const hasNote = withoutTime.includes("Note:") || withoutTime.toLowerCase().includes("cycle completed");

    return {
      mainMessage: withoutTime.trim(),
      hasNote
    };
  };

  const { mainMessage, hasNote } = processMessage(downloadCycleMessage);

  return (
    <div className="w-full bg-white rounded-lg shadow mb-4 p-4">
      {/* Automation Status Banner - Always visible when processing */}
      {isProcessing && (
        <div className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div>
                <p className="font-semibold text-lg">🤖 Automation is Running</p>
                <p className="text-blue-100 text-sm">System is actively processing your request</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input 
              type="date" 
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 w-full md:w-auto focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input 
              type="date" 
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 w-full md:w-auto focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isProcessing ? (
            <button
              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white font-medium flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
              onClick={onStart}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Start Process</span>
            </button>
          ) : (
            <button
              className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg text-white font-medium flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
              onClick={onCancel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span>Stop Process</span>
            </button>
          )}

          <button
            className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg text-gray-700 font-medium flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
            onClick={onRefresh}
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Processing Status Message */}
      {isProcessing && mainMessage && !hasNote && (
        <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-blue-800 font-medium">Processing Status</p>
              <p className="text-blue-700 text-sm">{mainMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Completion/Warning Message - Yellow Highlight */}
      {mainMessage && hasNote && (
        <div className="mt-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {mainMessage.toLowerCase().includes("cycle completed") ? (
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213..." />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-yellow-800 font-medium">Status</p>
              <p className="text-yellow-700 text-sm">{mainMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}