import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ArrowLeft, Mail, Calendar, Shield } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Düzenle
                            </Button>
                            {user.role !== 'admin' && (
                              <Button size="sm" variant="destructive" disabled>
                                Sil
                              </Button>
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
      </div>
    </AdminLayout>
  );
}