import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  showText?: boolean;
}

export default function Loader({ 
  size = 'md', 
  text = 'Loading...', 
  className = '', 
  showText = true 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Spinning loader */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
        
        {/* Pulse effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-blue-100 rounded-full animate-ping opacity-75`}></div>
      </div>
      
      {/* Loading text */}
      {showText && (
        <div className="mt-4">
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium animate-pulse`}>
            {text}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Table specific loader
export function TableLoader() {
  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
        <div className="bg-white">
          {/* Table header skeleton */}
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-4 bg-gray-300 rounded animate-pulse flex-1"></div>
              ))}
            </div>
          </div>
          
          {/* Table rows skeleton */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="border-b border-gray-100 p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                {[1, 2, 3, 4].map((col) => (
                  <div key={col} className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Centered loader */}
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
        <Loader text="Loading files..." />
      </div>
    </div>
  );
}

// Grid specific loader
export function GridLoader() {
  return (
    <div className="p-6 bg-white relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="ml-3 flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-gray-300 rounded animate-pulse w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Centered loader */}
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
        <Loader text="Loading files..." />
      </div>
    </div>
  );
}