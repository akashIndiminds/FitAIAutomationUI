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
  showNseWarning: boolean;
  isNseFilesPending: boolean;
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
  downloadCycleMessage,
  showNseWarning,
  isNseFilesPending
}: ControlsProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow mb- p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input 
              type="date" 
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 w-full md:w-auto"
              value={startDate}
              readOnly
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input 
              type="date" 
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 w-full md:w-auto"
              value={endDate}
              readOnly
              disabled={isProcessing}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isProcessing ? (
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center space-x-2 transition-colors"
              onClick={onStart}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Start Process</span>
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center space-x-2 transition-colors"
              onClick={onCancel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span>Cancel</span>
            </button>
          )}
          
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium flex items-center space-x-2 transition-colors"
            onClick={onRefresh}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {isProcessing && downloadCycleMessage && !showNseWarning && (
        <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">{downloadCycleMessage}</span>
          </div>
        </div>
      )}
      
      {/* NSE Warning Message - Made more prominent */}
      {showNseWarning && (
        <div className="mt-4 bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">NSE Files Not Available</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The files have not yet been uploaded by NSE. This typically happens during early hours or if there are delays from NSE's side.</p>
                <p className="mt-1"><strong>Please check back in 15-30 minutes.</strong></p>
              </div>
              <div className="mt-3">
                <button 
                  type="button" 
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  onClick={onRefresh}
                >
                  Check Again Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Status message when not processing but NSE files pending */}
      {!isProcessing && isNseFilesPending && !showNseWarning && (
        <div className="mt-4 bg-indigo-50 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-indigo-700">Files from NSE may be delayed. You can try starting the process again later.</span>
          </div>
        </div>
      )}
    </div>
  );
}
