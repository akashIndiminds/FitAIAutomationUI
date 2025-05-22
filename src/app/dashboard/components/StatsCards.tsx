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
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      shadowColor: 'shadow-blue-500/20',
      borderColor: 'border-blue-200',
      detail: `Last updated on ${stats.lastUpdated}`,
      action: null,
      bgColor: 'bg-white',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Files Awaiting Processing',
      value: stats.pendingFiles,
      icon: (
        <div className="relative">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
        </div>
      ),
      gradient: 'from-amber-500 via-amber-600 to-orange-600',
      shadowColor: 'shadow-amber-500/20',
      borderColor: 'border-amber-200',
      detail: 'Click below to view pending files',
      action: () => goToDetails('pending'),
      bgColor: 'bg-white',
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Total Downloaded Files',
      value: stats.downloadedFiles,
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      gradient: 'from-indigo-500 via-indigo-600 to-purple-700',
      shadowColor: 'shadow-indigo-500/20',
      borderColor: 'border-indigo-200',
      detail: 'Click below to view downloaded files',
      action: () => goToDetails('downloaded'),
      bgColor: 'bg-white',
      iconBg: 'bg-indigo-50',
    },
    {
      label: 'Files Imported into System',
      value: stats.importedFiles,
      icon: (
        <div className="relative">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full">
            <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>
      ),
      gradient: 'from-green-500 via-green-600 to-emerald-700',
      shadowColor: 'shadow-green-500/20',
      borderColor: 'border-green-200',
      detail: 'Click below to view imported files',
      action: () => goToDetails('imported'),
      bgColor: 'bg-white',
      iconBg: 'bg-green-50',
    }
  ];

  return (
    <div className="mb-8">
      <div className="relative mb-8">
        <h2 className="text-3xl bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent mb-2">
          Today's File Processing
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.bgColor} rounded-2xl p-6 min-h-[200px] 
                       border ${card.borderColor} 
                       shadow-lg ${card.shadowColor}
                       transition-all duration-200 hover:shadow-xl
                       ${card.action ? 'hover:shadow-2xl' : ''}
                       relative overflow-hidden`}
          >
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Icon and Title Section */}
              <div className="flex items-start space-x-4 mb-6">
                <div className={`p-3 ${card.iconBg} rounded-xl`}>
                  {card.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                    {card.label}
                  </p>
                  <p className="text-2xl text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>

              {/* Details Section */}
              <div className="mt-auto">
                <p className="text-sm text-gray-600 mb-4">{card.detail}</p>
                
                {card.action && (
               <button
  onClick={card.action}
  className={`cursor-pointer inline-flex items-center px-5 py-2.5 bg-gradient-to-r ${card.gradient} 
              text-white font-semibold rounded-xl shadow-md
              hover:shadow-xl hover:brightness-110
              active:scale-95 active:shadow-inner
              transition-all duration-200 ease-in-out`}
>
  <span>View Details</span>
  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
</button>

                )}
              </div>
            </div>

            {/* Subtle corner decoration */}
            <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
              <div className={`w-full h-full bg-gradient-to-bl ${card.gradient} rounded-bl-full`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}