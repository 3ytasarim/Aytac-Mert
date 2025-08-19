import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { BookOpen, Plus, Edit, Eye, Archive, Users, Trash2, PlusCircle, Save, X } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCourses() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    isActive: true
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

  // Type assertion helper
  const courseList = courses as Course[] | undefined;

  const toggleCourseStatusMutation = useMutation({
    mutationFn: async ({ courseId, isActive }: { courseId: string; isActive: boolean }) => {
      return await apiRequest(`/api/admin/courses/${courseId}`, "PATCH", { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Eğitim durumu güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Eğitim durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (courseId: string, currentStatus: boolean) => {
    toggleCourseStatusMutation.mutate({
      courseId,
      isActive: !currentStatus,
    });
  };

  const deleteCourseMapping = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiRequest(`/api/admin/courses/${courseId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Başarılı", 
        description: "Eğitim başarıyla silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Eğitim silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    if (window.confirm(`"${courseTitle}" eğitimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      deleteCourseMapping.mutate(courseId);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      price: course.price,
      isActive: course.isActive
    });
    setEditDialogOpen(true);
  };

  const updateCourseMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; description: string; price: number; isActive: boolean }) => {
      return await apiRequest(`/api/admin/courses/${data.id}`, "PATCH", {
        title: data.title,
        description: data.description,
        price: data.price,
        isActive: data.isActive
      });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Eğitim güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditDialogOpen(false);
      setEditingCourse(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Eğitim güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSaveEdit = () => {
    if (!editingCourse) return;
    
    updateCourseMutation.mutate({
      id: editingCourse.id,
      title: editForm.title,
      description: editForm.description,
      price: editForm.price,
      isActive: editForm.isActive
    });
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
    <AdminLayout title="Eğitim Yönetimi" description="Tüm eğitimleri görüntüleyin ve yönetin">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Tüm Eğitimler</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/admin/courses/edit")}
              className="w-full sm:w-auto transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105"
              data-testid="button-edit-courses"
            >
              <Edit className="h-4 w-4 mr-2" />
              Eğitim Düzenle
            </Button>
            <Button
              onClick={() => navigate("/admin/courses/add")}
              className="w-full sm:w-auto transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105"
              data-testid="button-add-course"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Eğitim Ekle
            </Button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="courses-grid">
          {coursesLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : courseList && courseList.length > 0 ? (
            courseList.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <Badge
                      variant={course.isActive ? "default" : "secondary"}
                      className={course.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {course.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Course Image */}
                  {course.imageUrl && (
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Course Description */}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Price */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">
                      ₺{course.price.toLocaleString('tr-TR')}
                    </span>
                    <div className="text-sm text-gray-500">
                      {new Date(course.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                        data-testid={`button-edit-${course.id}`}
                        className="h-8 px-2 text-xs font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        <span>Düzenle</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        disabled={deleteCourseMapping.isPending}
                        data-testid={`button-delete-${course.id}`}
                        className="h-8 px-2 text-xs font-semibold transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        <span>Sil</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                        data-testid={`button-lessons-${course.id}`}
                        className="h-8 px-2 text-xs font-semibold transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        <span>Ders+</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <BookOpen className="h-24 w-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Henüz eğitim bulunmuyor</h3>
              <p className="text-gray-600 mb-6">
                Sisteme ilk eğitiminizi eklemek için aşağıdaki butona tıklayın.
              </p>
              <Button
                onClick={() => navigate("/admin/courses/add")}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-add-first-course"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Eğitimi Ekle
              </Button>
            </div>
          )}
        </div>

        {/* Summary Card */}
        {courseList && courseList.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Eğitim İstatistikleri</h3>
                    <p className="text-blue-700">
                      Toplam {courseList.length} eğitim • 
                      {courseList.filter(c => c.isActive).length} aktif •
                      {courseList.filter(c => !c.isActive).length} pasif
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Ortalama Fiyat</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ₺{Math.round(courseList.reduce((sum, course) => sum + course.price, 0) / courseList.length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Course Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Eğitimi Düzenle
              </DialogTitle>
            </DialogHeader>
            
            {editingCourse && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Eğitim Başlığı</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Eğitim başlığını girin"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Açıklama</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Eğitim açıklamasını girin"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-price">Fiyat (₺)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="edit-active">Eğitim aktif</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updateCourseMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateCourseMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateCourseMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}