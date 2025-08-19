import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ArrowLeft, Mail, Calendar, Shield, UserPlus, Edit, Trash2, BookOpen, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
  createdAt: string;
  phone?: string;
  tcNumber?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
}

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningCoursesUser, setAssigningCoursesUser] = useState<User | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

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

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: activeCourses } = useQuery({
    queryKey: ["/api/admin/courses"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Öğrenci başarıyla silindi",
        className: "bg-green-50 border-green-200 text-green-900"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata!",
        description: error.message || "Öğrenci silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: string; firstName: string; lastName?: string; email: string; phone?: string }) => {
      return await apiRequest(`/api/admin/users/${userData.id}`, "PATCH", userData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Öğrenci bilgileri güncellendi",
        className: "bg-green-50 border-green-200 text-green-900"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata!",
        description: error.message || "Öğrenci güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const assignCoursesMutation = useMutation({
    mutationFn: async (data: { userId: string; courseIds: string[] }) => {
      return await apiRequest(`/api/admin/users/${data.userId}/courses`, "POST", { courseIds: data.courseIds });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Dersler öğrenciye atandı",
        className: "bg-green-50 border-green-200 text-green-900"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setAssigningCoursesUser(null);
      setSelectedCourses([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata!",
        description: error.message || "Dersler atanırken hata oluştu",
        variant: "destructive",
      });
    },
  });

  if (isLoading || usersLoading) {
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
    <AdminLayout title="Öğrenci Yönetimi" description="Tüm kayıtlı öğrencileri görüntüleyin ve yönetin">
      <div className="space-y-6">
        {/* Header with Add Student Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Öğrenci Listesi</h2>
          </div>
          <Link href="/admin/students/add">
            <Button
              className="transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105"
              data-testid="button-add-student"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Öğrenci Ekle
            </Button>
          </Link>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Tüm Kullanıcılar ({allUsers ? (allUsers as User[]).length : 0})
            </CardTitle>
            <CardDescription>
              Sisteme kayıtlı tüm kullanıcılar ve detayları
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allUsers && (allUsers as User[]).length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İsim</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(allUsers as User[]).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <Users className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{user.firstName} {user.lastName || ''}</div>
                              {user.tcNumber && (
                                <div className="text-sm text-gray-500">TC: {user.tcNumber}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.phone || "Belirtilmemiş"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`
                              transition-all duration-300 transform hover:scale-105 cursor-pointer font-semibold
                              ${user.role === 'admin' 
                                ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white border-0 shadow-md hover:shadow-lg' 
                                : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white border-0 shadow-md hover:shadow-lg'
                              }
                            `}
                          >
                            <Shield className="h-3 w-3 mr-1 animate-pulse" />
                            {user.role === 'admin' ? 'Yönetici' : 'Öğrenci'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                              className="h-8 px-2 text-xs transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Düzenle
                            </Button>
                            {user.role !== 'admin' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setAssigningCoursesUser(user);
                                    setSelectedCourses([]);
                                  }}
                                  className="h-8 px-2 text-xs transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
                                  data-testid={`button-assign-courses-${user.id}`}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Ders Ekle
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    if (window.confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
                                      deleteUserMutation.mutate(user.id);
                                    }
                                  }}
                                  disabled={deleteUserMutation.isPending}
                                  className="h-8 px-2 text-xs transition-all duration-300 hover:bg-red-600"
                                  data-testid={`button-delete-user-${user.id}`}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Sil
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Users className="h-24 w-24 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Henüz kullanıcı bulunmuyor</h3>
                <p>Sistem henüz hiçbir kayıtlı kullanıcı içermiyor.</p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Edit User Modal */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Öğrenci Bilgilerini Düzenle
              </DialogTitle>
            </DialogHeader>
            
            {editingUser && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">İsim</label>
                  <input
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Soyisim</label>
                  <input
                    type="text"
                    value={editingUser.lastName || ''}
                    onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                disabled={updateUserMutation.isPending}
              >
                İptal
              </Button>
              <Button
                onClick={() => {
                  if (editingUser) {
                    updateUserMutation.mutate({
                      id: editingUser.id,
                      firstName: editingUser.firstName,
                      lastName: editingUser.lastName,
                      email: editingUser.email,
                      phone: editingUser.phone
                    });
                  }
                }}
                disabled={updateUserMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateUserMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Courses Modal */}
        <Dialog open={!!assigningCoursesUser} onOpenChange={() => setAssigningCoursesUser(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                {assigningCoursesUser?.firstName} {assigningCoursesUser?.lastName} - Ders Atama
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Öğrenciye hangi dersleri aktif etmek istiyorsunuz?</p>
              
              {activeCourses && (activeCourses as Course[]).filter(course => course.isActive).length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {(activeCourses as Course[])
                    .filter(course => course.isActive)
                    .map((course) => (
                    <div key={course.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={course.id}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCourses([...selectedCourses, course.id]);
                          } else {
                            setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                          }
                        }}
                      />
                      <label htmlFor={course.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-gray-500">{course.description}</div>
                        <div className="text-sm font-semibold text-blue-600">₺{course.price.toLocaleString('tr-TR')}</div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Aktif ders bulunmuyor</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAssigningCoursesUser(null);
                  setSelectedCourses([]);
                }}
                disabled={assignCoursesMutation.isPending}
              >
                İptal
              </Button>
              <Button
                onClick={() => {
                  if (assigningCoursesUser && selectedCourses.length > 0) {
                    assignCoursesMutation.mutate({
                      userId: assigningCoursesUser.id,
                      courseIds: selectedCourses
                    });
                  }
                }}
                disabled={assignCoursesMutation.isPending || selectedCourses.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {assignCoursesMutation.isPending ? "Atanıyor..." : `${selectedCourses.length} Dersi Aktif Et`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}