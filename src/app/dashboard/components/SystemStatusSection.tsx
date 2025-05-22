'use client';
import React from 'react';

interface Stats {
  processingSpeed: string;
  lastUpdated: string;
  importedFiles: number;
  totalFiles: number;
}

interface SystemStatusSectionProps {
  stats: Stats;
  onRefresh: () => void;
  onShowFileDetails: (type: string) => void;
}

const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({ stats, onRefresh, onShowFileDetails }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* System Performance */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(30,_64,_175,_0.25)] transform transition-all duration-300 hover:shadow-[0_15px_30px_rgba(30,_64,_175,_0.35)] hover:translate-y-[-5px]">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(8,_112,_184,_0.1)] transform transition-all duration-300 hover:shadow-[0_15px_30px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
        <h3 className="text-lg font-medium mb-2 text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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

      {/* Today's Files */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(8,_112,_184,_0.1)] transform transition-all duration-300 hover:shadow-[0_15px_30px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
        <h3 className="text-lg font-medium mb-2 text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Today's Files
        </h3>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Processing Complete</span>
            <span className="font-bold text-gray-800">
  {Math.round((stats.importedFiles / (stats.totalFiles || 1)) * 100)}%
</span>

          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${Math.round((stats.importedFiles / (stats.totalFiles || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(8,_112,_184,_0.1)] transform transition-all duration-300 hover:shadow-[0_15px_30px_rgba(8,_112,_184,_0.2)] hover:translate-y-[-5px]">
        <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button
            onClick={onRefresh}
            className="w-full py-2 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg flex items-center justify-center transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Status
          </button>
          <button
            onClick={() => onShowFileDetails('pending')}
            className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            View All Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusSection;