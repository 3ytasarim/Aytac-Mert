import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Layout Container */}
      <div className="lg:flex">
        {/* Sidebar */}
        <div className={`
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:static z-50 transition-transform duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64 h-screen lg:h-auto
        `}>
          <AdminSidebar 
            isCollapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onMobileClose={() => setMobileMenuOpen(false)}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Top Bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-3 lg:px-6 py-3 lg:py-4">
              <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-1 h-8 w-8 flex-shrink-0"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                
                {/* Title and description */}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h1 className="text-base lg:text-2xl font-bold text-gray-900 truncate">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-xs lg:text-sm text-gray-600 mt-1 truncate hidden sm:block">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Date display */}
              <div className="flex items-center space-x-4">
                <div className="text-xs lg:text-sm text-gray-500 hidden md:block">
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="p-3 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}