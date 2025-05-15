// components/Sidebar.tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Clock, 
  Download, 
  Activity, 
  ChevronLeft,
  ChevronRight,
  FileIcon
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

export default function Sidebar({ isOpen = true, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  // Use provided isOpen prop if available, otherwise use internal state
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Determine which open state to use (prop or internal)
  const sidebarIsOpen = toggleSidebar ? isOpen : internalIsOpen;
  
  // Handle toggle for standalone usage
  const handleToggle = () => {
    if (toggleSidebar) {
      toggleSidebar();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  useEffect(() => {
    // Only apply these effects if no parent is controlling the state
    if (!toggleSidebar) {
      document.documentElement.style.setProperty('--sidebar-width', sidebarIsOpen ? '16rem' : '4rem');
      
      // Add transition class to main content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.classList.add('transition-all', 'duration-300');
        mainContent.style.marginLeft = sidebarIsOpen ? '16rem' : '4rem';
      }
    }
  }, [sidebarIsOpen, toggleSidebar]);

  if (pathname === "/login") return null;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/file-details/pending", label: "Pending Files", icon: <Clock size={20} /> },
    { path: "/file-details/downloaded", label: "Downloaded Files", icon: <Download size={20} /> },
    { path: "/file-details/imported", label: "Imported Files", icon: <FileIcon size={20} /> },
    { path: "/activity-log", label: "Activity Log", icon: <Activity size={20} /> },
  ];

  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 to-indigo-900 shadow-2xl transition-all duration-300 z-30 ${
        sidebarIsOpen ? 'w-64' : 'w-16'
      }`}
      style={{
        transform: 'perspective(1500px) rotateY(0deg)',
        transformOrigin: 'left',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="p-4 flex items-center justify-between border-b border-blue-800/50">
        <div className="flex items-center space-x-3">
          {sidebarIsOpen && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center shadow-lg transform translate-z-2">
                <span className="text-sm font-bold text-white">FIT</span>
              </div>
              <h1 className="text-xl font-bold text-white">FIT-AI</h1>
            </div>
          )}
          {!sidebarIsOpen && (
            <div className="h-8 w-8 mx-auto rounded bg-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">FIT</span>
            </div>
          )}
        </div>
        <button 
          onClick={handleToggle} 
          className="text-white hover:bg-blue-700 p-2 rounded-full transition-all duration-200 hover:scale-105 transform"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {sidebarIsOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-800/60'
                  }`}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    transform: hoveredItem === item.path && !isActive ? 'translateY(-2px)' : 'none',
                    boxShadow: hoveredItem === item.path && !isActive ? '0 4px 12px -2px rgba(0, 0, 0, 0.2)' : 'none',
                  }}
                >
                  <div className={`${isActive ? 'text-white' : 'text-blue-300'} mr-3`}>
                    {item.icon}
                  </div>
                  {(sidebarIsOpen || hoveredItem === item.path) && (
                    <span 
                      className={`whitespace-nowrap ${!sidebarIsOpen ? 'absolute left-14 bg-blue-800 px-2 py-1 rounded text-sm' : ''}`}
                      style={{
                        opacity: sidebarIsOpen ? 1 : hoveredItem === item.path ? 1 : 0,
                        pointerEvents: sidebarIsOpen ? 'auto' : hoveredItem === item.path ? 'auto' : 'none',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        {sidebarIsOpen && (
          <div className="bg-blue-800/40 rounded-lg p-3 text-center text-blue-100 text-xs">
            <p>Data Processing</p>
            <p className="text-blue-300 mt-1">v1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
}