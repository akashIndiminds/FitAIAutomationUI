'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface StatsCardsProps {
  stats: {
    totalFiles: number;
    pendingFiles: number;
    downloadedFiles: number;
    importedFiles: number;
    processingSpeed: string;
    lastUpdated: string;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const router = useRouter();

  const goToDetails = (type: 'pending' | 'downloaded' | 'imported') => {
    router.push(`/file-details/${type}`);
  };

  const cards = [
    {
      label: 'Total Files Processed',
      value: stats.totalFiles,
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bg: 'bg-blue-50',
      textColor: 'text-blue-700',
      detail: `Last updated on ${stats.lastUpdated}`,
      action: null,
    },
    {
      label: 'Files Awaiting Processing',
      value: stats.pendingFiles,
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-amber-50',
      textColor: 'text-amber-700',
      detail: 'Click below to view pending files',
      action: () => goToDetails('pending'),
    },
    {
      label: 'Successfully Downloaded Files',
      value: stats.downloadedFiles,
      icon: (
        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      bg: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      detail: 'Click below to view downloaded files',
      action: () => goToDetails('downloaded'),
    },
    {
      label: 'Files Imported into System',
      value: stats.importedFiles,
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
      bg: 'bg-green-50',
      textColor: 'text-green-700',
      detail: 'Click below to view imported files',
      action: () => goToDetails('imported'),
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">File Processing Overview</h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 min-h-[180px] flex flex-col justify-between`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 ${card.bg} rounded-full`}>{card.icon}</div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{card.detail}</p>
              {card.action && (
                <button
                  onClick={card.action}
                  className={`mt-2 inline-flex items-center text-sm font-medium ${card.textColor} hover:underline`}
                >
                  View Details
n                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
