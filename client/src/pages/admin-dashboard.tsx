import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, TrendingUp, Calendar, Mail, Phone, Shield } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface User {
  id: string;
  email: string;
  firstName: string;
  role: string;
  createdAt: string;
}

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Yetkisiz Erişim",
        description: "Admin paneline erişim yetkiniz yok.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: recentContacts } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: allUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <Shield className="h-10 w-10 mr-3 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              AYTAÇ MERT EĞİTİM KURUMLARI yönetim paneli
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Hoşgeldiniz,</p>
            <p className="text-lg font-semibold">{user?.firstName} ({user?.email})</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Öğrenci</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.totalStudents || 0}
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Kurslar</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.activeCourses || 0}
                  </p>
                </div>
                <BookOpen className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Kayıt</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.totalEnrollments || 0}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Yeni Mesajlar</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.recentContacts || 0}
                  </p>
                </div>
                <MessageSquare className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Contacts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Son İletişim Mesajları
                </CardTitle>
                <CardDescription>
                  Müşterilerden gelen son mesajlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentContacts && (recentContacts as Contact[]).length > 0 ? (
                  <div className="space-y-4">
                    {(recentContacts as Contact[]).slice(0, 5).map((contact: Contact) => (
                      <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{contact.fullName}</h3>
                          <Badge variant={contact.status === 'new' ? 'default' : 'secondary'}>
                            {contact.status === 'new' ? 'Yeni' : 'Yanıtlandı'}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="mr-4">{contact.email}</span>
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{contact.phone}</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{contact.message}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                          <Button size="sm" variant="outline">
                            Yanıtla
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Henüz mesaj bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Users */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Yeni Kurs Ekle
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Öğrenci Listesi
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Tüm Mesajlar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  İstatistikler
                </Button>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Son Kayıt Olanlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allUsers && (allUsers as User[]).length > 0 ? (
                  <div className="space-y-4">
                    {(allUsers as User[]).slice(0, 3).map((user: User) => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.firstName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant="outline">
                          {user.role === 'admin' ? 'Admin' : 'Öğrenci'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Henüz kullanıcı yok</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">Sistem Durumu</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Son güncelleme:</span>
                    <span className="text-blue-900 font-medium">
                      {new Date().toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Durum:</span>
                    <Badge className="bg-green-100 text-green-800">
                      Aktif
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}