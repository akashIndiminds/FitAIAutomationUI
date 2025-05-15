'use client';

import React from 'react';

interface ActivityLogProps {
  logs: {
    id: string;
    action: string;
    status: string;
    timestamp: string;
    details: string;
    user: string;
  }[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  // Function to format the timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to get status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className=" w-full bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Activity Log</h2>
        {logs.length > 0 && (
          <span className="text-xs text-gray-500">
            {logs.length} activities today
          </span>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
          <p className="mt-1 text-sm text-gray-500">No activity logs available for today.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-blue-800">{log.action}</div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                  {log.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{log.details}</p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{formatTimestamp(log.timestamp)}</span>
                <span>By {log.user}</span>
              </div>
            </div>
          ))}
          
          {logs.length > 5 && (
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center mt-2">
              View all activity
            </button>
          )}
        </div>
      )}
    </div>
  );
}