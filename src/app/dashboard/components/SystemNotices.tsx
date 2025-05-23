'use client';

import React from 'react';

interface SystemNoticesProps {
  isNseFilesPending: boolean;
  onRefresh: () => void;
}

export default function SystemNotices({
  isNseFilesPending,
  onRefresh
}: SystemNoticesProps) {
  if (!isNseFilesPending) return null;
  
  return (
    <div className="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">National Stock Exchange Notice</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              <strong>Note:</strong> If files are not downloading, they may not have been uploaded by NSE yet. 
              NSE typically uploads files between 8:00 AM and 9:30 AM. 
              Please check back later or click refresh to check current status.
            </p>
            <div className="mt-3">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                onClick={onRefresh}
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
