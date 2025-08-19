import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ArrowLeft, Mail, Calendar, Shield, UserPlus, Edit, Trash2, BookOpen, Plus, Phone } from "lucide-react";
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
              className="transition-all duration-500 bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-1 active:scale-95 group font-semibold"
              data-testid="button-add-student"
            >
              <UserPlus className="h-4 w-4 mr-2 group-hover:animate-pulse group-hover:rotate-12 transition-transform duration-300" />
              Öğrenci Ekle
            </Button>
          </Link>
        </div>

        {/* Users Table */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
            <CardTitle className="flex items-center space-x-3">
              <Users className="h-6 w-6 animate-pulse" />
              <span>Tüm Kullanıcılar ({allUsers ? (allUsers as User[]).length : 0})</span>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Sisteme kayıtlı tüm kullanıcılar ve detayları
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {allUsers && (allUsers as User[]).length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-all duration-300">
                        <TableHead className="font-bold text-gray-800 py-4">İsim</TableHead>
                        <TableHead className="font-bold text-gray-800 py-4">Email</TableHead>
                        <TableHead className="font-bold text-gray-800 py-4">Telefon</TableHead>
                        <TableHead className="font-bold text-gray-800 py-4">Rol</TableHead>
                        <TableHead className="font-bold text-gray-800 py-4">Kayıt Tarihi</TableHead>
                        <TableHead className="font-bold text-gray-800 py-4 text-center">İşlemler</TableHead>
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
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                              className="h-8 px-3 text-xs font-medium transition-all duration-500 transform hover:scale-110 hover:shadow-lg bg-white border-2 border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-600 active:scale-95 group"
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Edit className="h-3 w-3 mr-1 group-hover:animate-pulse" />
                              <span className="hidden sm:inline">Düzenle</span>
                              <span className="sm:hidden">✏️</span>
                            </Button>
                            {user.role !== 'admin' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setAssigningCoursesUser(user);
                                    setSelectedCourses([]);
                                  }}
                                  className="h-8 px-3 text-xs font-medium transition-all duration-500 transform hover:scale-110 hover:shadow-xl bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white border-0 active:scale-95 group shadow-md hover:shadow-green-200"
                                  data-testid={`button-assign-courses-${user.id}`}
                                >
                                  <Plus className="h-3 w-3 mr-1 group-hover:rotate-180 transition-transform duration-300" />
                                  <span className="hidden sm:inline">Ders Ekle</span>
                                  <span className="sm:hidden">📚</span>
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
                                  className="h-8 px-3 text-xs font-medium transition-all duration-500 transform hover:scale-110 hover:shadow-xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white border-0 active:scale-95 group shadow-md hover:shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                  data-testid={`button-delete-user-${user.id}`}
                                >
                                  <Trash2 className="h-3 w-3 mr-1 group-hover:animate-bounce" />
                                  <span className="hidden sm:inline">Sil</span>
                                  <span className="sm:hidden">🗑️</span>
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
                
                {/* Mobile Cards */}
                <div className="lg:hidden p-2 space-y-3">
                  {(allUsers as User[]).map((user) => (
                    <div 
                      key={user.id} 
                      className="bg-white rounded-lg shadow-md border border-gray-200 p-3 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{user.firstName} {user.lastName || ''}</h3>
                            <Badge 
                              className={`
                                mt-1 text-xs font-medium
                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}
                              `}
                            >
                              {user.role === 'admin' ? 'Yönetici' : 'Öğrenci'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="h-3 w-3 mr-2 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="h-3 w-3 mr-2 text-green-500 flex-shrink-0" />
                          <span>{user.phone || "Belirtilmemiş"}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="h-3 w-3 mr-2 text-orange-500 flex-shrink-0" />
                          <span>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                          className="flex-1 h-8 text-xs font-medium border border-blue-300 text-blue-700 hover:bg-blue-500 hover:text-white hover:border-blue-600 transition-colors duration-300"
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
                              className="flex-1 h-8 text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
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
                              className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
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