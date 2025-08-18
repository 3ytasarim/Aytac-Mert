import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Enrollment, Course, User, Contact } from "@shared/schema";

type EnrollmentWithUserAndCourse = Enrollment & { user: User; course: Course };

interface AdminStats {
  totalStudents: number;
  activeCourses: number;
  totalEnrollments: number;
  recentContacts: number;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading, error: enrollmentsError } = useQuery<EnrollmentWithUserAndCourse[]>({
    queryKey: ["/api/admin/enrollments"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: contacts = [], isLoading: contactsLoading, error: contactsError } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== "admin"))) {
      toast({
        title: "Yetkisiz Erişim",
        description: "Admin yetkisi gerekiyor. Ana sayfaya yönlendiriliyorsunuz...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, user, authLoading, toast]);

  // Handle API errors
  useEffect(() => {
    const errors = [statsError, enrollmentsError, contactsError];
    const unauthorizedError = errors.find(error => error && isUnauthorizedError(error as Error));
    
    if (unauthorizedError) {
      toast({
        title: "Oturum Süresi Doldu",
        description: "Tekrar giriş yapmanız gerekiyor...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [statsError, enrollmentsError, contactsError, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Tamamlandı</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Beklemede</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900" data-testid="title-admin-dashboard">
                Admin Paneli
              </h1>
              <p className="text-sm text-gray-600">Sistem yönetimi ve içerik düzenleme</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Çıkış
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-users text-primary text-xl"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Toplam Öğrenci</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-students">
                        {stats?.totalStudents || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-book text-green-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktif Kurslar</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-active-courses">
                        {stats?.activeCourses || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-chart-line text-yellow-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Toplam Kayıt</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-enrollments">
                        {stats?.totalEnrollments || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-envelope text-purple-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Yeni Mesaj</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-recent-contacts">
                        {stats?.recentContacts || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Yönetim</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-primary bg-blue-50 rounded-lg"
                    data-testid="nav-dashboard"
                  >
                    <i className="fas fa-tachometer-alt mr-3"></i> Dashboard
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                    data-testid="nav-students"
                  >
                    <i className="fas fa-users mr-3"></i> Öğrenciler
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                    data-testid="nav-courses"
                  >
                    <i className="fas fa-book mr-3"></i> Kurslar
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                    data-testid="nav-videos"
                  >
                    <i className="fas fa-video mr-3"></i> Videolar
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                    data-testid="nav-payments"
                  >
                    <i className="fas fa-credit-card mr-3"></i> Ödemeler
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                    data-testid="nav-settings"
                  >
                    <i className="fas fa-cog mr-3"></i> Ayarlar
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Recent Enrollments */}
              <Card>
                <CardHeader>
                  <CardTitle>Son Kayıtlar</CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollmentsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                            <div>
                              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-8" data-testid="empty-enrollments">
                      <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-600">Henüz kayıt bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.slice(0, 5).map((enrollment, index) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                          data-testid={`enrollment-${index}`}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <i className="fas fa-user text-gray-600"></i>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900" data-testid="text-user-name">
                                {enrollment.user.firstName || enrollment.user.email}
                              </p>
                              <p className="text-sm text-gray-600" data-testid="text-user-email">
                                {enrollment.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900" data-testid="text-enrollment-course">
                              {enrollment.course.title}
                            </p>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(enrollment.status)}
                              <p className="text-xs text-gray-500" data-testid="text-enrollment-date">
                                {new Date(enrollment.enrolledAt!).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle>Son Mesajlar</CardTitle>
                </CardHeader>
                <CardContent>
                  {contactsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border-b border-gray-100 pb-3">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-8" data-testid="empty-contacts">
                      <i className="fas fa-envelope text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-600">Henüz mesaj bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contacts.slice(0, 5).map((contact, index) => (
                        <div
                          key={contact.id}
                          className="border-b border-gray-100 pb-3 last:border-b-0"
                          data-testid={`contact-${index}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900" data-testid="text-contact-name">
                              {contact.fullName}
                            </p>
                            <Badge variant={contact.status === "new" ? "default" : "secondary"}>
                              {contact.status === "new" ? "Yeni" : "Yanıtlandı"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2" data-testid="text-contact-message">
                            {contact.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1" data-testid="text-contact-date">
                            {new Date(contact.createdAt!).toLocaleDateString('tr-TR')} - {contact.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
