import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { BookOpen, Upload, Save, ArrowLeft } from "lucide-react";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1, "Eğitim başlığı gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
  price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
  imageUrl: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function AdminAddCourse() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    price: 0,
    imageUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      return await apiRequest("/api/admin/courses", {
        method: "POST",
        body: JSON.stringify(courseData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yeni eğitim başarıyla eklendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      navigate("/admin/courses");
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Eğitim eklenirken bir hata oluştu",
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

  const validateForm = (): boolean => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createCourseMutation.mutate(formData);
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/courses")}
            className="flex items-center"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Eğitim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Course Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Resim URL'si</Label>
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    className={errors.imageUrl ? "border-red-500" : ""}
                    data-testid="input-image-url"
                  />
                </div>
                {errors.imageUrl && (
                  <p className="text-sm text-red-600">{errors.imageUrl}</p>
                )}
                <p className="text-sm text-gray-500">
                  İsteğe bağlı: Eğitim için görsel eklemek istiyorsanız resim URL'sini giriniz
                </p>
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label>Resim Önizleme</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img
                      src={formData.imageUrl}
                      alt="Eğitim resmi önizleme"
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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
                  data-testid="button-save"
                >
                  {createCourseMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Eğitimi Kaydet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}