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
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
    onClose();
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
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-400">Aytaç Mert Akademisi</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden text-white hover:bg-gray-700"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium">Administrator</p>
              <p className="text-xs text-gray-400">info@aytacmert.com</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
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
                      if (hasSubmenu) {
                        toggleSubmenu(item.title);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
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
                  </button>
                  
                  {/* Submenu */}
                  {hasSubmenu && isExpanded && (
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
        <div className="p-4 border-t border-gray-700">
          <Button 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </>
  );
}