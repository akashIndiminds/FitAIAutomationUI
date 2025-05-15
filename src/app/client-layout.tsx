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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      sidebarOpen ? '16rem' : '4rem'
    );
    document.documentElement.style.setProperty('--background-color', '#f8fafc');
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - render only if not login page */}
      {!isLoginPage && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}

      {/* Content area */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: isLoginPage ? '0' : 'var(--sidebar-width)' }}
      >
        {/* TopBar - render only if not login page */}
        {!isLoginPage && <TopBar username="User" sidebarOpen={sidebarOpen} />}

        {/* Main content */}
        <main className="flex-1"> {/* Reduced padding from p-6 to p-2 */}
          <div className="w-full h-full"> {/* Removed max-w-7xl and mx-auto */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}