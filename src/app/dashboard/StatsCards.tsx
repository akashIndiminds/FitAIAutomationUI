'use client';

import React from 'react';

interface StatsCardsProps {
  stats: {
    totalFiles: number;
    pendingFiles: number;
    downloadedFiles: number;
    importedFiles: number;
    processingSpeed: string;
    lastUpdated: string;
  };
  onShowDetails: (type: 'pending' | 'downloaded' | 'imported') => void;
}

export default function StatsCards({ stats, onShowDetails }: StatsCardsProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">File Processing Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Files Card */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Files</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalFiles}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Last updated: {stats.lastUpdated}</div>
        </div>

        {/* Pending Files Card */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Files</p>
              <p className="text-2xl font-bold text-amber-500">{stats.pendingFiles}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <button 
            onClick={() => onShowDetails('pending')}
            className="mt-3 inline-flex items-center text-xs font-medium text-amber-700 hover:text-amber-900"
          >
            View details
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        {/* Downloaded Files Card */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Downloaded Files</p>
              <p className="text-2xl font-bold text-indigo-500">{stats.downloadedFiles}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-full">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
              </svg>
            </div>
          </div>
          <button 
            onClick={() => onShowDetails('downloaded')}
            className="mt-3 inline-flex items-center text-xs font-medium text-indigo-700 hover:text-indigo-900"
          >
            View details
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        {/* Imported Files Card */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Imported Files</p>
              <p className="text-2xl font-bold text-green-500">{stats.importedFiles}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <button 
            onClick={() => onShowDetails('imported')}
            className="mt-3 inline-flex items-center text-xs font-medium text-green-700 hover:text-green-900"
          >
            View details
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Processing Speed Info */}
      <div className="w-full mt-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-full mr-3">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Processing Speed</p>
              <p className="text-lg font-semibold text-gray-900">{stats.processingSpeed}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Updated at {stats.lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );
}