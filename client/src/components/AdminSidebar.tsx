import { useState } from "react";
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  Home, 
  Menu, 
  X,
  LogOut,
  Shield,
  BarChart3,
  FileText,
  Calendar,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle, onMobileClose }: AdminSidebarProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/logout", {});
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Çıkış yapıldı.",
      });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const menuItems = [
    {
      title: "Ana Sayfa",
      icon: Home,
      path: "/",
      badge: null,
      submenu: []
    },
    {
      title: "Eğitimler",
      icon: BookOpen,
      path: "/admin/courses",
      badge: null,
      submenu: [
        { title: "Yeni Eğitim Ekleme", path: "/admin/courses/add" },
        { title: "Eğitim Düzenle", path: "/admin/courses/edit" },
        { title: "Tüm Eğitimler", path: "/admin/courses" },
        { title: "Kategoriler", path: "/admin/categories" }
      ]
    },
    {
      title: "Öğrenciler",
      icon: Users,
      path: "/admin/students",
      badge: null,
      submenu: [
        { title: "Öğrenci Ekleme", path: "/admin/students/add" },
        { title: "Tüm Öğrenciler", path: "/admin/students" },
        { title: "Aktif Öğrenciler", path: "/admin/students/active" },
        { title: "Toplu Öğrenci Aktarımı", path: "/admin/students/import" }
      ]
    },
    {
      title: "Faturalar",
      icon: FileText,
      path: "/admin/invoices",
      badge: null,
      submenu: []
    },
    {
      title: "İletişim",
      icon: MessageSquare,
      path: "/admin/contacts",
      badge: "Yeni",
      submenu: []
    },
    {
      title: "Raporlar",
      icon: BarChart3,
      path: "/admin/reports",
      badge: null,
      submenu: []
    },
    {
      title: "Ayarlar",
      icon: Settings,
      path: "/admin/settings",
      badge: null,
      submenu: []
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile menu when navigating
    onMobileClose?.();
  };

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={`
      h-full bg-gray-900 text-white transition-all duration-300 ease-in-out z-50
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
          <div className="flex items-center overflow-hidden min-w-0">
            <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-blue-400 flex-shrink-0" />
            {!isCollapsed && (
              <div className="ml-2 lg:ml-3 transition-opacity duration-300 min-w-0 flex-1">
                <h1 className="text-sm lg:text-lg font-bold truncate">Admin Panel</h1>
                <p className="text-xs text-gray-400 truncate hidden lg:block">Aytaç Mert Akademisi</p>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-gray-700 flex-shrink-0 hidden lg:flex p-1"
            onClick={onToggle}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Admin Info */}
        <div className="p-3 lg:p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="ml-2 lg:ml-3 transition-opacity duration-300 overflow-hidden min-w-0 flex-1">
                <p className="font-medium truncate text-sm lg:text-base">Administrator</p>
                <p className="text-xs text-gray-400 truncate">info@aytacmert.com</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 lg:p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus.includes(item.title);
              
              return (
                <div key={item.title}>
                  <button
                    onClick={() => {
                      if (hasSubmenu && !isCollapsed) {
                        toggleSubmenu(item.title);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between p-2 lg:p-3 rounded-lg transition-all duration-300 relative group transform hover:scale-105
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:via-gray-600 hover:to-gray-700 hover:text-white hover:shadow-lg'
                      }
                    `}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <div className="flex items-center overflow-hidden">
                      <Icon className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-xs lg:text-sm font-medium whitespace-nowrap">{item.title}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {hasSubmenu && (
                          isExpanded ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.title}
                        {item.badge && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </button>
                  
                  {/* Submenu - only show when not collapsed */}
                  {hasSubmenu && isExpanded && !isCollapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.path}
                          onClick={() => handleNavigation(subItem.path)}
                          className={`
                            w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                            ${location === subItem.path
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }
                          `}
                        >
                          {subItem.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-3 lg:p-4 border-t border-gray-700">
          <Button 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={`w-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group ${isCollapsed ? 'px-2' : ''}`}
            title={isCollapsed ? 'Çıkış Yap' : undefined}
          >
            <LogOut className="h-4 w-4 mr-2 flex-shrink-0 group-hover:animate-bounce" />
            {!isCollapsed && <span>Çıkış Yap</span>}
          </Button>
        </div>
    </div>
  );
}