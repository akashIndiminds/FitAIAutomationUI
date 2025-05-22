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
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-xl blur-md opacity-50 animate-pulse"></div>
          <svg className="relative w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      ),
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      shadowColor: 'shadow-blue-500/30',
      borderColor: 'border-blue-200',
      detail: `Last updated on ${stats.lastUpdated}`,
      action: null,
      bgPattern: 'bg-gradient-to-br from-blue-50 via-white to-blue-100',
      particleColor: 'bg-blue-300',
    },
    {
      label: 'Files Awaiting Processing',
      value: stats.pendingFiles,
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400 rounded-xl blur-md opacity-50 animate-pulse"></div>
          <svg className="relative w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
        </div>
      ),
      gradient: 'from-amber-500 via-amber-600 to-orange-600',
      shadowColor: 'shadow-amber-500/30',
      borderColor: 'border-amber-200',
      detail: 'Click below to view pending files',
      action: () => goToDetails('pending'),
      bgPattern: 'bg-gradient-to-br from-amber-50 via-white to-orange-100',
      particleColor: 'bg-amber-300',
    },
    {
      label: 'Total Downloaded Files',
      value: stats.downloadedFiles,
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-md opacity-50 animate-pulse"></div>
          <svg className="relative w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-2 left-2 w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
            <div className="absolute top-4 right-2 w-1 h-1 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      ),
      gradient: 'from-indigo-500 via-indigo-600 to-purple-700',
      shadowColor: 'shadow-indigo-500/30',
      borderColor: 'border-indigo-200',
      detail: 'Click below to view downloaded files',
      action: () => goToDetails('downloaded'),
      bgPattern: 'bg-gradient-to-br from-indigo-50 via-white to-purple-100',
      particleColor: 'bg-indigo-300',
    },
    {
      label: 'Files Imported into System',
      value: stats.importedFiles,
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-green-400 rounded-xl blur-md opacity-50 animate-pulse"></div>
          <svg className="relative w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      ),
      gradient: 'from-green-500 via-green-600 to-emerald-700',
      shadowColor: 'shadow-green-500/30',
      borderColor: 'border-green-200',
      detail: 'Click below to view imported files',
      action: () => goToDetails('imported'),
      bgPattern: 'bg-gradient-to-br from-green-50 via-white to-emerald-100',
      particleColor: 'bg-green-300',
    }
  ];

  return (
    <div className="mb-8">
      <div className="relative mb-8">
        <h2 className="text-3xl bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent mb-2">
          Today's File Processing
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        <div className="absolute -top-2 -left-2 w-32 h-8 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`group relative ${card.bgPattern} rounded-3xl p-8 min-h-[220px] 
                       border-2 ${card.borderColor} backdrop-blur-sm
                       transform transition-all duration-300 ease-out hover:scale-102 hover:-translate-y-1
                       shadow-2xl ${card.shadowColor} hover:shadow-xl hover:${card.shadowColor.replace('/30', '/40')}
                       cursor-pointer overflow-hidden`}
            style={{
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.1), 
                         0 0 0 1px rgba(255, 255, 255, 0.05),
                         inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            }}
          >
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={`absolute top-4 left-4 w-2 h-2 ${card.particleColor} rounded-full opacity-40 animate-float`}></div>
              <div className={`absolute top-8 right-6 w-1 h-1 ${card.particleColor} rounded-full opacity-30 animate-float-delayed`}></div>
              <div className={`absolute bottom-6 left-8 w-1.5 h-1.5 ${card.particleColor} rounded-full opacity-20 animate-float-slow`}></div>
            </div>

            {/* Gradient Overlay on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-3 
                           transition-opacity duration-300 rounded-3xl`}></div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Icon and Title Section */}
              <div className="flex items-start space-x-5 mb-6">
                <div className="relative p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg 
                               transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                    {card.label}
                  </p>
                  <div className="relative">
                    <p className="text-2xl font-semibold text-gray-900 group-hover:text-gray-800 
                                 transform group-hover:scale-102 transition-all duration-300">
                      {card.value}
                    </p>
                    <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r ${card.gradient} 
                                   transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 rounded-full`}></div>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="mt-auto">
                <p className="text-sm text-gray-600 mb-4 font-normal">{card.detail}</p>
                
                {card.action && (
                  <button
                    onClick={card.action}
                    className={`inline-flex items-center px-4 py-2.5 bg-gradient-to-r ${card.gradient} 
                               text-white font-medium rounded-xl shadow-lg hover:shadow-lg
                               transform hover:scale-102 transition-all duration-300
                               hover:from-opacity-90 hover:to-opacity-90`}
                  >
                    <span>View Details</span>
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Corner Decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className={`w-full h-full bg-gradient-to-bl ${card.gradient} rounded-bl-full`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
          }
          
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(-180deg); }
          }
          
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(90deg); }
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          
          .animate-float-delayed {
            animation: float-delayed 5s ease-in-out infinite;
            animation-delay: 1s;
          }
          
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
            animation-delay: 2s;
          }
          
          .scale-102 {
            transform: scale(1.02);
          }
        `
      }} />
    </div>
  );
}