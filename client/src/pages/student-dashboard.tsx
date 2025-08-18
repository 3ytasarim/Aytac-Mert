import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SocialIcons } from "@/components/SocialIcons";
import type { Enrollment, Course } from "@shared/schema";

type EnrollmentWithCourse = Enrollment & { course: Course };

export default function StudentDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: enrollments = [], isLoading: enrollmentsLoading, error } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ["/api/enrollments"],
    enabled: isAuthenticated,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Yetkisiz Erişim",
        description: "Giriş yapmanız gerekiyor. Giriş sayfasına yönlendiriliyorsunuz...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Handle API errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Oturum Süresi Doldu",
        description: "Tekrar giriş yapmanız gerekiyor...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

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

  if (!isAuthenticated) {
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
      <SocialIcons />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900" data-testid="title-dashboard">
                Öğrenci Paneli
              </h1>
              <p className="text-sm text-gray-600" data-testid="text-welcome">
                Hoş geldiniz, {user?.firstName || user?.email}
              </p>
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Menü</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-primary bg-blue-50 rounded-lg"
                    data-testid="nav-courses"
                  >
                    <i className="fas fa-play-circle mr-3"></i> Kurslarım
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                    data-testid="nav-certificates"
                  >
                    <i className="fas fa-certificate mr-3"></i> Sertifikalarım
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                    data-testid="nav-profile"
                  >
                    <i className="fas fa-user mr-3"></i> Profil
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Active Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktif Kurslarım</CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollmentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                            <div className="h-2 bg-gray-200 rounded w-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-8" data-testid="empty-courses">
                      <i className="fas fa-book-open text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-600">Henüz kayıtlı olduğunuz bir kurs bulunmuyor.</p>
                      <Button
                        className="mt-4"
                        onClick={() => window.location.href = "/"}
                        data-testid="button-browse-courses"
                      >
                        Kursları İncele
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="border border-gray-200 rounded-lg p-4"
                          data-testid={`course-${enrollment.courseId}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900" data-testid="text-course-title">
                                {enrollment.course.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1" data-testid="text-course-description">
                                {enrollment.course.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {getStatusBadge(enrollment.status)}
                                <span className="text-sm text-gray-600" data-testid="text-course-price">
                                  {formatPrice(enrollment.course.price)}
                                </span>
                              </div>
                              {enrollment.status === "active" && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">İlerleme</span>
                                    <span className="text-primary font-medium" data-testid="text-progress">
                                      {enrollment.progress || 0}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={enrollment.progress || 0}
                                    className="mt-1"
                                    data-testid="progress-course"
                                  />
                                </div>
                              )}
                            </div>
                            {enrollment.status === "active" && (
                              <Button
                                className="ml-4"
                                size="sm"
                                data-testid="button-continue-course"
                              >
                                Devam Et
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Son Aktiviteler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enrollments.length > 0 ? (
                      enrollments.slice(0, 3).map((enrollment, index) => (
                        <div key={enrollment.id} className="flex items-center py-2" data-testid={`activity-${index}`}>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-play text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">
                              "{enrollment.course.title}" kursuna kayıt oldunuz
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(enrollment.enrolledAt!).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4" data-testid="empty-activities">
                        <p className="text-gray-600 text-sm">Henüz aktivite bulunmuyor.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
