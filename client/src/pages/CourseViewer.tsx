import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, PlayCircle, CheckCircle, BookOpen, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  videoEmbedCode: string | null;
  videoUrl: string | null;
  videoType: string;
  orderIndex: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
}

export default function CourseViewer() {
  const [, params] = useRoute("/course/:id");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  const courseId = params?.id;

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId && !isLoading && isAuthenticated,
  });

  // Fetch course lessons
  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/courses", courseId, "lessons"],
    enabled: !!courseId && !isLoading && isAuthenticated,
  });

  // Check enrollment
  const { data: enrollment } = useQuery({
    queryKey: ["/api/student/enrollments", courseId],
    enabled: !!courseId && !isLoading && isAuthenticated,
  });

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erişim Yok</h2>
            <p className="text-gray-600 mb-4">
              Bu kursa erişim için önce kayıt olmanız gerekiyor.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedLesson = lessons?.[selectedLessonIndex];
  const completedLessons = Math.floor((lessons?.length || 0) * (enrollment?.progress || 0) / 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900" data-testid="text-course-title">
                  {course?.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {lessons?.length || 0} bölüm • İlerleme: {enrollment?.progress || 0}%
                </p>
              </div>
            </div>
            <Badge variant={enrollment?.status === 'active' ? 'default' : 'secondary'}>
              {enrollment?.status === 'active' ? 'Aktif' : 'Beklemede'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent className="p-6">
                {selectedLesson ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid={`text-lesson-title-${selectedLessonIndex}`}>
                      {selectedLesson.title}
                    </h2>
                    <VideoPlayer
                      videoUrl={selectedLesson.videoType === "upload" ? selectedLesson.videoUrl || "" : selectedLesson.videoEmbedCode || ""}
                      videoType={selectedLesson.videoType as "embed" | "upload"}
                      title={selectedLesson.title}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bölüm Seç</h3>
                    <p className="text-gray-600">İzlemek için sol menüden bir bölüm seçin</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Kurs İlerlemesi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tamamlanan Bölümler</span>
                      <span>{completedLessons} / {lessons?.length || 0}</span>
                    </div>
                    <Progress value={enrollment?.progress || 0} className="h-2" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Kayıt Tarihi:</strong> {enrollment?.enrolledAt 
                        ? new Date(enrollment.enrolledAt).toLocaleDateString('tr-TR') 
                        : 'Bilinmiyor'}
                    </p>
                    {enrollment?.completedAt && (
                      <p>
                        <strong>Tamamlanma Tarihi:</strong> {new Date(enrollment.completedAt).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Bölümler
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {lessonsLoading ? (
                  <div className="p-4">
                    <div className="animate-pulse space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {lessons?.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonIndex(index)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                          selectedLessonIndex === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-transparent'
                        }`}
                        data-testid={`button-lesson-${index}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {index < completedLessons ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lesson.title}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Bölüm {index + 1}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}