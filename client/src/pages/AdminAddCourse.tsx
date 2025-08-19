import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { BookOpen, Upload, Save, ArrowLeft, ArrowRight, Plus, X, Video, GripVertical } from "lucide-react";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1, "Eğitim başlığı gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
  price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
  imageUrl: z.string().optional().or(z.literal("")),
});

const lessonSchema = z.object({
  title: z.string().min(1, "Bölüm başlığı gereklidir"),
  videoEmbedCode: z.string().min(1, "Video embed kodu gereklidir"),
  orderIndex: z.number().min(0, "Sıra numarası 0'dan küçük olamaz"),
});

type CourseFormData = z.infer<typeof courseSchema>;
type LessonFormData = z.infer<typeof lessonSchema>;

export default function AdminAddCourse() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    price: 0,
    imageUrl: "",
  });
  const [lessons, setLessons] = useState<LessonFormData[]>([]);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lessonErrors, setLessonErrors] = useState<Record<number, Record<string, string>>>({});

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

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: CourseFormData) => {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Eğitim oluşturulamadı");
      }
      
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Başarılı",
        description: "Eğitim temel bilgileri kaydedildi, şimdi bölümleri ekleyin",
      });
      setCreatedCourseId(data.id);
      setCurrentStep(2);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Eğitim eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const addLessonsMutation = useMutation({
    mutationFn: async (lessonsData: { courseId: string; lessons: LessonFormData[] }) => {
      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonsData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Bölümler oluşturulamadı");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Eğitim ve bölümler başarıyla eklendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      navigate("/admin/courses");
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Bölümler eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleLessonChange = (index: number, field: keyof LessonFormData, value: string | number) => {
    setLessons(prev => prev.map((lesson, i) => 
      i === index ? { ...lesson, [field]: value } : lesson
    ));
    if (lessonErrors[index]?.[field]) {
      setLessonErrors(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: "" }
      }));
    }
  };

  const addLesson = () => {
    setLessons(prev => [...prev, {
      title: "",
      videoEmbedCode: "",
      orderIndex: prev.length
    }]);
  };

  const removeLesson = (index: number) => {
    setLessons(prev => prev.filter((_, i) => i !== index).map((lesson, i) => ({
      ...lesson,
      orderIndex: i
    })));
    setLessonErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      setLessons(prev => {
        const newLessons = [...prev];
        [newLessons[index], newLessons[index - 1]] = [newLessons[index - 1], newLessons[index]];
        return newLessons.map((lesson, i) => ({ ...lesson, orderIndex: i }));
      });
    } else if (direction === 'down' && index < lessons.length - 1) {
      setLessons(prev => {
        const newLessons = [...prev];
        [newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]];
        return newLessons.map((lesson, i) => ({ ...lesson, orderIndex: i }));
      });
    }
  };

  const validateCourseForm = (): boolean => {
    try {
      courseSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateLessons = (): boolean => {
    let isValid = true;
    const newErrors: Record<number, Record<string, string>> = {};
    
    lessons.forEach((lesson, index) => {
      try {
        lessonSchema.parse(lesson);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const lessonErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              lessonErrors[err.path[0] as string] = err.message;
              isValid = false;
            }
          });
          newErrors[index] = lessonErrors;
        }
      }
    });
    
    setLessonErrors(newErrors);
    return isValid;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCourseForm()) {
      createCourseMutation.mutate(formData);
    }
  };

  const handleStep2Submit = () => {
    if (lessons.length === 0) {
      toast({
        title: "Uyarı",
        description: "En az bir bölüm eklemelisiniz",
        variant: "destructive",
      });
      return;
    }
    
    if (validateLessons() && createdCourseId) {
      addLessonsMutation.mutate({
        courseId: createdCourseId,
        lessons: lessons
      });
    }
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
    <AdminLayout title="Yeni Eğitim Ekle" description="Sisteme yeni bir eğitim kursu ekleyin">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Temel Bilgiler</span>
            </div>
            <div className={`w-20 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Bölümler</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => currentStep === 1 ? navigate("/admin/courses") : setCurrentStep(1)}
            className="flex items-center"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? 'Geri Dön' : 'Önceki Adım'}
          </Button>
        </div>

        {currentStep === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Eğitim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Course Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Eğitim Başlığı *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Örn: Temel İtaat Eğitimi"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                  data-testid="input-title"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Course Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama *</Label>
                <Textarea
                  id="description"
                  placeholder="Eğitim içeriği ve hedefleri hakkında detaylı bilgi..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={5}
                  className={errors.description ? "border-red-500" : ""}
                  data-testid="textarea-description"
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Course Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Fiyat (₺) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                  className={errors.price ? "border-red-500" : ""}
                  data-testid="input-price"
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Course Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="imageFile">Resim Ekleme</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Resim dosyası seçin</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF formatları desteklenir (Maks: 5MB)</p>
                    <input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Convert file to base64 or handle upload
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleInputChange("imageUrl", reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      data-testid="input-image-file"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('imageFile')?.click()}
                      className="mt-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Dosya Seç
                    </Button>
                  </div>
                </div>
                {errors.imageUrl && (
                  <p className="text-sm text-red-600">{errors.imageUrl}</p>
                )}
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label>Resim Önizleme</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 relative">
                    <img
                      src={formData.imageUrl}
                      alt="Eğitim resmi önizleme"
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange("imageUrl", "")}
                      className="absolute top-2 right-2 bg-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/courses")}
                    data-testid="button-cancel"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCourseMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-next"
                  >
                    {createCourseMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        İleri - Bölümler
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Eğitim Bölümleri
              </CardTitle>
              <div className="text-sm text-gray-600 mt-2">
                Eğitim: <strong>{formData.title}</strong>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Lesson Button */}
              <Button
                type="button"
                variant="outline"
                onClick={addLesson}
                className="w-full border-dashed"
                data-testid="button-add-lesson"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Bölüm Ekle
              </Button>

              {/* Lessons List */}
              {lessons.length > 0 && (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Bölüm {index + 1}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveLesson(index, 'up')}
                              disabled={index === 0}
                              data-testid={`button-move-up-${index}`}
                            >
                              ↑
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveLesson(index, 'down')}
                              disabled={index === lessons.length - 1}
                              data-testid={`button-move-down-${index}`}
                            >
                              ↓
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLesson(index)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-remove-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {/* Lesson Title */}
                          <div className="space-y-2">
                            <Label htmlFor={`lesson-title-${index}`}>Bölüm Başlığı</Label>
                            <Input
                              id={`lesson-title-${index}`}
                              type="text"
                              placeholder="Örn: Temel Komutlar"
                              value={lesson.title}
                              onChange={(e) => handleLessonChange(index, "title", e.target.value)}
                              className={lessonErrors[index]?.title ? "border-red-500" : ""}
                              data-testid={`input-lesson-title-${index}`}
                            />
                            {lessonErrors[index]?.title && (
                              <p className="text-sm text-red-600">{lessonErrors[index].title}</p>
                            )}
                          </div>

                          {/* Video Embed Code */}
                          <div className="space-y-2">
                            <Label htmlFor={`lesson-video-${index}`}>Video Embed Kodu</Label>
                            <Textarea
                              id={`lesson-video-${index}`}
                              placeholder="YouTube iframe embed kodunu buraya yapıştırın..."
                              value={lesson.videoEmbedCode}
                              onChange={(e) => handleLessonChange(index, "videoEmbedCode", e.target.value)}
                              rows={3}
                              className={lessonErrors[index]?.videoEmbedCode ? "border-red-500" : ""}
                              data-testid={`textarea-lesson-video-${index}`}
                            />
                            {lessonErrors[index]?.videoEmbedCode && (
                              <p className="text-sm text-red-600">{lessonErrors[index].videoEmbedCode}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Video paylaşım hizmetinizden HTML kodunu yapıştırın.
                            </p>
                          </div>

                          {/* Order Index */}
                          <div className="space-y-2">
                            <Label htmlFor={`lesson-order-${index}`}>Sırala (İsteğe Bağlı)</Label>
                            <Input
                              id={`lesson-order-${index}`}
                              type="number"
                              min="0"
                              placeholder="Sadece Rakam"
                              value={lesson.orderIndex}
                              onChange={(e) => handleLessonChange(index, "orderIndex", parseInt(e.target.value) || 0)}
                              className={lessonErrors[index]?.orderIndex ? "border-red-500" : ""}
                              data-testid={`input-lesson-order-${index}`}
                            />
                            {lessonErrors[index]?.orderIndex && (
                              <p className="text-sm text-red-600">{lessonErrors[index].orderIndex}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {lessons.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz bölüm eklenmedi</h3>
                  <p className="text-gray-600 mb-4">
                    Eğitiminize video bölümleri eklemek için yukarıdaki butonu kullanın.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  data-testid="button-back-to-step1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri - Temel Bilgiler
                </Button>
                <Button
                  type="button"
                  onClick={handleStep2Submit}
                  disabled={addLessonsMutation.isPending || lessons.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-finish"
                >
                  {addLessonsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Tamamlanıyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Eğitimi Tamamla
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}