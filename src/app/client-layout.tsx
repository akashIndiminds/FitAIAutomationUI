"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive design detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };

    // Check on initial load
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle sidebar function that will be passed to TopBar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Set CSS variable for content margin
  useEffect(() => {
    if (!isLoginPage) {
      if (isMobile) {
        // On mobile, don't shift content when sidebar opens
        document.documentElement.style.setProperty('--sidebar-width', '0px');
      } else {
        // On desktop, shift content based on sidebar state
        document.documentElement.style.setProperty(
          '--sidebar-width', 
          isSidebarOpen ? '16rem' : '4rem'
        );
      }
    }
  }, [isSidebarOpen, isMobile, isLoginPage]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - render only if not login page */}
      {!isLoginPage && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          isMobile={isMobile}
        />
      )}

      {/* Content area */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ 
          marginLeft: isLoginPage || isMobile ? '0' : 'var(--sidebar-width)'
        }}
      >
        {/* TopBar - render only if not login page */}
        {!isLoginPage && (
          <TopBar 
            username="User" 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-0">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}