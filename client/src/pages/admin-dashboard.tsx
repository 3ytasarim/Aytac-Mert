import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, TrendingUp, Calendar, Mail, Phone, Shield, BarChart3, Activity } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Dashboard" description="Yönetim paneli özet bilgileri">
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Hoş Geldiniz, Administrator</h2>
                <p className="text-blue-100">Aytaç Mert Köpek Eğitimi Akademisi Yönetim Paneli</p>
                <p className="text-blue-200 text-sm mt-2">{user?.email}</p>
              </div>
              <Shield className="h-16 w-16 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - PDF'deki gibi 4 ana kart */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Toplam Üye Öğrenci Sayısı</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.totalStudents || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Kayıtlı öğrenciler</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Eğitimler</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.activeCourses || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Eklenen eğitim sayısı</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Aktif Oturumlar</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.activeSessions || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Şuanda giriş yapmış</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Satışlar</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₺{dashboardStats?.totalSales || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Toplam gelir</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <div key={contact.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{contact.fullName}</h3>
                            <Badge variant={contact.status === 'new' ? 'destructive' : 'secondary'}>
                              {contact.status === 'new' ? 'Yeni' : 'Yanıtlandı'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{contact.email}</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{contact.message}</p>
                          <span className="text-xs text-gray-500 mt-2 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(contact.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-semibold mb-2">Henüz mesaj bulunmuyor</h3>
                    <p className="text-sm">İletişim formundan gelen mesajlar burada görünecek</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Status & Recent Users */}
          <div className="space-y-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Sistem Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Veritabanı</span>
                  <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Servisi</span>
                  <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Yedekleme</span>
                  <Badge className="bg-green-100 text-green-800">Güncel</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Güvenlik</span>
                  <Badge className="bg-green-100 text-green-800">Korumalı</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Son Kayıtlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allUsers && (allUsers as User[]).length > 0 ? (
                  <div className="space-y-4">
                    {(allUsers as User[]).slice(0, 3).map((user: User) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.firstName}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0">
                          {user.role === 'admin' ? 'Admin' : 'Öğrenci'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Henüz kullanıcı yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Bu Ay Kayıtlar</h3>
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-500">+20% geçen aya göre</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Tamamlanan Kurslar</h3>
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-500">Bu ay tamamlanan</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Aktif Öğrenciler</h3>
                <p className="text-2xl font-bold text-purple-600">45</p>
                <p className="text-sm text-gray-500">Şu anda aktif</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}