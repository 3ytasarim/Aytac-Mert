import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ContactModal } from "@/components/ui/contact-modal";
import { BookOpen, Clock, Award, User, Calendar, Mail, Phone, MapPin, MessageSquare, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
}

interface Enrollment {
  id: string;
  courseId: string;
  status: string;
  progress: number;
  enrolledAt: string;
  course: Course;
}

interface StudentContact {
  id: string;
  subject: string;
  message: string;
  response?: string;
  status: 'pending' | 'responded';
  createdAt: string;
  respondedAt?: string;
}

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: availableCourses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: isAuthenticated,
  });

  const { data: studentContacts } = useQuery({
    queryKey: ["/api/student/contacts"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
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

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hoşgeldiniz, {user?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 text-lg">
            Köpek eğitimi yolculuğunuzda size rehberlik etmeye devam ediyoruz.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Kurslar</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(enrollments as Enrollment[])?.filter((e: Enrollment) => e.status === 'active').length || 0}
                  </p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(enrollments as Enrollment[])?.filter((e: Enrollment) => e.status === 'completed').length || 0}
                  </p>
                </div>
                <Award className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ortalama İlerleme</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {enrollments && (enrollments as Enrollment[]).length > 0
                      ? Math.round((enrollments as Enrollment[]).reduce((acc: number, e: Enrollment) => acc + e.progress, 0) / (enrollments as Enrollment[]).length)
                      : 0}%
                  </p>
                </div>
                <Clock className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Kurslarım</h2>
            
            {enrollmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                      <div className="h-2 bg-gray-300 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : enrollments && (enrollments as Enrollment[]).length > 0 ? (
              <div className="space-y-6">
                {(enrollments as Enrollment[]).map((enrollment: Enrollment) => (
                  <Card key={enrollment.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{enrollment.course.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {enrollment.course.description}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          enrollment.status === 'active' ? 'default' :
                          enrollment.status === 'completed' ? 'secondary' :
                          'outline'
                        }>
                          {enrollment.status === 'active' ? 'Aktif' :
                           enrollment.status === 'completed' ? 'Tamamlandı' :
                           'Beklemede'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>İlerleme</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="w-full" />
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Kayıt: {new Date(enrollment.enrolledAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Kursa Devam Et</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz kayıtlı kursunuz yok
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Köpek eğitimi yolculuğunuza başlamak için bir kursa kayıt olun.
                  </p>
                  <Button>Kursları İncele</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profil Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  Profili Düzenle
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Tüm Kurslar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Sertifikalarım
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  İletişim
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Destek Gerekiyor mu?</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Uzman eğitmenlerimizden yardım alın.
                </p>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsContactModalOpen(true)}
                  data-testid="button-contact-support"
                >
                  İletişime Geç
                </Button>
              </CardContent>
            </Card>

            {/* Student Messages */}
            {studentContacts && (studentContacts as StudentContact[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Mesajlarım
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(studentContacts as StudentContact[]).slice(0, 3).map((contact: StudentContact) => (
                      <div key={contact.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{contact.subject}</h4>
                          <Badge variant={contact.status === 'responded' ? 'default' : 'secondary'}>
                            {contact.status === 'responded' ? 'Cevaplanmış' : 'Beklemede'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{contact.message}</p>
                        {contact.response && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                            <strong>Cevap:</strong> {contact.response}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(contact.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Contact Modal */}
        <ContactModal 
          isOpen={isContactModalOpen} 
          onClose={() => setIsContactModalOpen(false)} 
        />
      </div>
    </div>
  );
}