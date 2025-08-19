import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile slide-in */}
      <div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:relative z-50 transition-transform duration-300 ease-in-out
      `}>
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>
      
      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out min-h-screen
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} 
        ml-0
      `}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 transition-transform duration-300 rotate-180" />
                ) : (
                  <Menu className="h-5 w-5 transition-transform duration-300 hover:rotate-180" />
                )}
              </Button>
              
              {/* Title and description */}
              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
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
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}