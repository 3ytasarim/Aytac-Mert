import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Plus, Trash2, Video, Save, X, Check } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ImageUploader } from "@/components/ImageUploader";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoEmbedCode: string;
  orderIndex: number;
}

export default function AdminCourseEdit() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: "",
    videoEmbedCode: ""
  });
  const [editLessonForm, setEditLessonForm] = useState({
    id: "",
    title: "",
    videoEmbedCode: ""
  });

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

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/admin/courses"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["/api/admin/courses", selectedCourse?.id, "lessons"],
    enabled: !!selectedCourse?.id,
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; description: string; price: number; imageUrl?: string | null }) => {
      const response = await fetch(`/api/admin/courses/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kurs bilgileri güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] }); // Public courses cache
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Tekrar giriş yapılıyor...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Kurs güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const addLessonMutation = useMutation({
    mutationFn: async (lessonData: { courseId: string; title: string; videoEmbedCode: string }) => {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: lessonData.courseId,
          lessons: [{
            title: lessonData.title,
            videoEmbedCode: lessonData.videoEmbedCode
          }]
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yeni bölüm eklendi.",
      });
      setNewLesson({ title: "", videoEmbedCode: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourse?.id, "lessons"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Tekrar giriş yapılıyor...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Bölüm eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async (lessonData: { id: string; title: string; videoEmbedCode: string }) => {
      const response = await fetch(`/api/admin/lessons/${lessonData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonData.title,
          videoEmbedCode: lessonData.videoEmbedCode
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Bölüm güncellendi.",
      });
      setEditingLesson(null);
      setEditLessonForm({ id: "", title: "", videoEmbedCode: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourse?.id, "lessons"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Tekrar giriş yapılıyor...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Bölüm güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Bölüm silindi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses", selectedCourse?.id, "lessons"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Tekrar giriş yapılıyor...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Bölüm silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleCourseUpdate = (course: Course) => {
    // Add timestamp to image URL to bust cache if image exists
    const imageUrlWithTimestamp = course.imageUrl && !course.imageUrl.includes('?t=') 
      ? `${course.imageUrl}${course.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
      : course.imageUrl;
      
    updateCourseMutation.mutate({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      imageUrl: imageUrlWithTimestamp
    });
    
    // Update local state with timestamped URL
    if (selectedCourse?.id === course.id) {
      setSelectedCourse({
        ...course,
        imageUrl: imageUrlWithTimestamp
      });
    }
  };

  const handleAddLesson = () => {
    if (!selectedCourse || !newLesson.title || !newLesson.videoEmbedCode) {
      toast({
        title: "Eksik Bilgi",
        description: "Bölüm başlığı ve video kodu gereklidir.",
        variant: "destructive",
      });
      return;
    }

    addLessonMutation.mutate({
      courseId: selectedCourse.id,
      title: newLesson.title,
      videoEmbedCode: newLesson.videoEmbedCode
    });
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setEditLessonForm({
      id: lesson.id,
      title: lesson.title,
      videoEmbedCode: lesson.videoEmbedCode
    });
  };

  const handleUpdateLesson = () => {
    if (!editLessonForm.title || !editLessonForm.videoEmbedCode) {
      toast({
        title: "Eksik Bilgi",
        description: "Bölüm başlığı ve video kodu gereklidir.",
        variant: "destructive",
      });
      return;
    }

    updateLessonMutation.mutate(editLessonForm);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (window.confirm("Bu bölümü silmek istediğinizden emin misiniz?")) {
      deleteLessonMutation.mutate(lessonId);
    }
  };

  const cancelEdit = () => {
    setEditingLesson(null);
    setEditLessonForm({ id: "", title: "", videoEmbedCode: "" });
  };

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
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-course-edit">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Kurs Düzenle</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Kurslar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Kurslar yükleniyor...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(courses as Course[])?.map((course: Course) => (
                    <div
                      key={course.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCourse?.id === course.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCourse(course)}
                      data-testid={`course-item-${course.id}`}
                    >
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                      <p className="text-sm font-medium text-green-600 mt-2">
                        ₺{course.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Details & Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                {selectedCourse ? `${selectedCourse.title} - Bölümler` : 'Kurs Seçin'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedCourse ? (
                <>
                  {/* Course Edit Form */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold">Kurs Bilgileri</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Kurs Başlığı</Label>
                        <Input
                          value={selectedCourse.title}
                          onChange={(e) => setSelectedCourse({...selectedCourse, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Açıklama</Label>
                        <Textarea
                          value={selectedCourse.description}
                          onChange={(e) => setSelectedCourse({...selectedCourse, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <ImageUploader
                        currentImageUrl={selectedCourse.imageUrl}
                        onImageChange={(imageUrl) => setSelectedCourse({...selectedCourse, imageUrl})}
                        label="Kurs Resmi"
                      />
                      <div>
                        <Label>Fiyat (₺)</Label>
                        <Input
                          type="number"
                          value={selectedCourse.price}
                          onChange={(e) => setSelectedCourse({...selectedCourse, price: Number(e.target.value)})}
                        />
                      </div>
                      <Button 
                        onClick={() => handleCourseUpdate(selectedCourse)}
                        disabled={updateCourseMutation.isPending}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateCourseMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                      </Button>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Bölümler</h3>
                    {lessonsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Bölümler yükleniyor...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(lessons as Lesson[])?.map((lesson: Lesson, index: number) => (
                          <div
                            key={lesson.id}
                            className="p-3 border rounded-lg"
                            data-testid={`lesson-item-${lesson.id}`}
                          >
                            {editingLesson?.id === lesson.id ? (
                              <div className="space-y-3">
                                <div>
                                  <Label>Bölüm Başlığı</Label>
                                  <Input
                                    value={editLessonForm.title}
                                    onChange={(e) => setEditLessonForm({...editLessonForm, title: e.target.value})}
                                    placeholder="Bölüm başlığını girin"
                                  />
                                </div>
                                <div>
                                  <Label>YouTube Video URL'si</Label>
                                  <Input
                                    value={editLessonForm.videoEmbedCode}
                                    onChange={(e) => setEditLessonForm({...editLessonForm, videoEmbedCode: e.target.value})}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm"
                                    onClick={handleUpdateLesson}
                                    disabled={updateLessonMutation.isPending}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    {updateLessonMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                                  </Button>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEdit}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    İptal
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{lesson.title}</h4>
                                  <p className="text-sm text-gray-600">Bölüm {index + 1}</p>
                                  {lesson.videoEmbedCode && (
                                    <p className="text-xs text-blue-600 mt-1 truncate">
                                      {lesson.videoEmbedCode.length > 50 
                                        ? lesson.videoEmbedCode.substring(0, 50) + "..." 
                                        : lesson.videoEmbedCode
                                      }
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditLesson(lesson)}
                                    data-testid={`edit-lesson-${lesson.id}`}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    disabled={deleteLessonMutation.isPending}
                                    className="text-red-600 hover:text-red-700"
                                    data-testid={`delete-lesson-${lesson.id}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Lesson */}
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-3">
                      <h4 className="font-medium">Yeni Bölüm Ekle</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Bölüm Başlığı</Label>
                          <Input
                            value={newLesson.title}
                            onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                            placeholder="Bölüm başlığını girin"
                            data-testid="new-lesson-title"
                          />
                        </div>
                        <div>
                          <Label>YouTube Video URL'si</Label>
                          <Input
                            value={newLesson.videoEmbedCode}
                            onChange={(e) => setNewLesson({...newLesson, videoEmbedCode: e.target.value})}
                            placeholder="https://www.youtube.com/watch?v=..."
                            data-testid="new-lesson-video"
                          />
                        </div>
                        <Button 
                          onClick={handleAddLesson}
                          disabled={addLessonMutation.isPending}
                          className="w-full"
                          data-testid="add-lesson-button"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {addLessonMutation.isPending ? "Ekleniyor..." : "Bölüm Ekle"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Düzenlemek için bir kurs seçin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}