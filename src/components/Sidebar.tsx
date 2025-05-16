"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Activity, 
  FileIcon, 
  X,
  FileCogIcon,
  FileStack
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isMobile: boolean;
}

export default function Sidebar({ isOpen, setIsOpen, isMobile }: SidebarProps) {
  const pathname = usePathname();
  
  // Early return to prevent any processing if on login page
  if (pathname === "/login") return null;

  // Memoize navigation items to prevent recreation on each render
  const navItems = useMemo(() => [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/file-details/imported", label: "Files Status", icon: <FileStack size={20} /> },
    { path: "/activity-log", label: "Activity Log", icon: <Activity size={20} /> },
    { path: "/file-config", label: "File Configuration", icon: <FileCogIcon size={20} /> },
  ], []);

  // Memoize the closeSidebar function to prevent recreation on each render
  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  // Create backdrop overlay for mobile - only when needed
  const MobileBackdrop = () => {
    if (!isMobile || !isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-gray-900/50 z-20"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
    );
  };

  // Check if current path is any file detail path
  const isFileDetailPath = pathname.includes('/file-details/');

  return (
    <>
      <MobileBackdrop />
      
      <div 
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 to-indigo-900 shadow-2xl transition-all duration-300 z-30
          ${isOpen ? (isMobile ? 'w-64 translate-x-0' : 'w-64') : (isMobile ? '-translate-x-full w-64' : 'w-16')}
        `}
        style={{
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-800/50">
          <div className="flex items-center space-x-3">
            {isOpen && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center shadow-lg transform translate-z-2">
                  <span className="text-sm font-bold text-white">FIT</span>
                </div>
                <h1 className="text-xl font-bold text-white">AI</h1>
              </div>
            )}
            {!isOpen && !isMobile && (
              <div className="h-8 w-8 mx-auto rounded bg-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">FIT</span>
              </div>
            )}
          </div>
          
          {/* Close button - mobile only */}
          {isMobile && isOpen && (
            <button 
              onClick={() => setIsOpen(false)}
              className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800/50 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="mt-6">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = item.path === '/file-details/imported' 
                ? isFileDetailPath
                : pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-blue-700 text-white shadow-md' 
                        : 'text-blue-100 hover:bg-blue-800/60'
                    }`}
                    onClick={closeSidebar}
                  >
                    <div className={`${isActive ? 'text-white' : 'text-blue-300'} mr-3`}>
                      {item.icon}
                    </div>
                    {isOpen && <span className="text-sm">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          {isOpen && (
            <div className="bg-blue-800/40 rounded-lg p-3 text-center text-blue-100 text-xs">
              <p>Data Processing</p>
              <p className="text-blue-300 mt-1">v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
