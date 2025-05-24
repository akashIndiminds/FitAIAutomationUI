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
      
      {isProcessing && (
        <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">{downloadCycleMessage || 'Processing...'}</span>
          </div>
        </div>
      )}
    </div>
  );
}