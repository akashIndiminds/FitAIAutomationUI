"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, Search, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import authService from '@/services/authService';

interface TopBarProps {
  username: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function TopBar({ username, toggleSidebar, isSidebarOpen }: TopBarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
 const notificationsRef = useRef<HTMLDivElement>(null);
const settingsRef = useRef<HTMLDivElement>(null);
  
  const notifications = [
    { id: 1, text: "New file imported", time: "5m ago" },
    { id: 2, text: "Download complete", time: "1h ago" },
    { id: 3, text: "System update available", time: "2h ago" }
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      showNotifications &&
      notificationsRef.current &&
      !notificationsRef.current.contains(event.target as Node)
    ) {
      setShowNotifications(false);
    }
    if (
      showSettings &&
      settingsRef.current &&
      !settingsRef.current.contains(event.target as Node)
    ) {
      setShowSettings(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showNotifications, showSettings]);

  return (
    <header className="bg-white sticky top-0 z-20 w-full">
      <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between shadow-md relative"
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Hamburger Menu for mobile */}
          <button 
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
          
          <div className="h-8 sm:h-10 w-9 sm:w-11 rounded-lg bg-blue-600 flex items-center justify-center transform rotate-6 shadow-lg">
            <span className="text-xs sm:text-sm font-bold text-white transform -rotate-6">FIT-AI</span>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-800" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.8)' }}>
              Data Processing
            </h1>
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-0.5" />
          </div>
        </div>
        
        <div className="flex-1 max-w-lg mx-2 sm:mx-8 hidden sm:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 pl-10 pr-4 py-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-4">
          {/* Search icon for mobile */}
          <button className="sm:hidden p-2 rounded-full hover:bg-gray-100 transition-all">
            <Search size={20} className="text-gray-600" />
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all relative"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-0 right-0 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium transform translate-x-1 -translate-y-1">
                3
              </span>
            </button>
            
            {showNotifications && (
              <div 
                ref={notificationsRef}
                className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-xl z-50 transform transition-all duration-200 origin-top-right"
                style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 sm:p-4 border-b border-gray-100">
                  <h3 className="font-medium text-sm sm:text-base">Notifications</h3>
                </div>
                <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                  {notifications.map(notification => (
                    <div key={notification.id} className="p-2 sm:p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between">
                        <p className="text-xs sm:text-sm">{notification.text}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 sm:p-3 text-center border-t border-gray-100">
                  <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Settings */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
                setShowNotifications(false);
              }}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-12"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
            
            {showSettings && (
              <div 
                ref={settingsRef}
                className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-xl z-50"
                style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <button className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                    Account Settings
                  </button>
                  <button className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                    Preferences
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User */}
          <div className="flex items-center space-x-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-inner transform hover:scale-105 transition-transform duration-200">
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium shadow-md"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-800 text-xs sm:text-sm hidden sm:inline">{username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}