import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowLeft, Mail, Phone, Calendar, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminContacts() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ contactId, status }: { contactId: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/contacts/${contactId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: "Başarılı",
        description: "İletişim durumu güncellendi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Durum güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || contactsLoading) {
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

  const newContacts = contacts ? (contacts as Contact[]).filter(c => c.status === 'new') : [];
  const answeredContacts = contacts ? (contacts as Contact[]).filter(c => c.status === 'answered') : [];

  const handleMarkAsAnswered = (contactId: string) => {
    updateStatusMutation.mutate({ contactId, status: 'answered' });
  };

  const handleMarkAsNew = (contactId: string) => {
    updateStatusMutation.mutate({ contactId, status: 'new' });
  };

  return (
    <AdminLayout title="İletişim Mesajları" description="Müşterilerden gelen mesajları görüntüleyin ve yanıtlayın">
      <div className="space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
                  <p className="text-3xl font-bold text-gray-900">{contacts ? (contacts as Contact[]).length : 0}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Yeni Mesajlar</p>
                  <p className="text-3xl font-bold text-red-600">{newContacts.length}</p>
                </div>
                <Badge className="bg-red-100 text-red-800">Yeni</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Yanıtlanan</p>
                  <p className="text-3xl font-bold text-green-600">{answeredContacts.length}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Messages */}
        {newContacts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <MessageSquare className="h-5 w-5 mr-2" />
                Yeni Mesajlar ({newContacts.length})
              </CardTitle>
              <CardDescription>Henüz yanıtlanmamış mesajlar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newContacts.map((contact) => (
                  <div key={contact.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.fullName}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="mr-4">{contact.email}</span>
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                      <Badge variant="destructive">Yeni</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{contact.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(contact.createdAt).toLocaleDateString('tr-TR')} {new Date(contact.createdAt).toLocaleTimeString('tr-TR')}
                      </span>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedContact(contact)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detay
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Mesaj Detayı</DialogTitle>
                              <DialogDescription>
                                {contact.fullName} tarafından gönderilen mesaj
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold">İletişim Bilgileri</h4>
                                <p><strong>İsim:</strong> {contact.fullName}</p>
                                <p><strong>Email:</strong> {contact.email}</p>
                                <p><strong>Telefon:</strong> {contact.phone}</p>
                                <p><strong>Tarih:</strong> {new Date(contact.createdAt).toLocaleString('tr-TR')}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Mesaj</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="whitespace-pre-wrap">{contact.message}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" onClick={() => handleMarkAsAnswered(contact.id)} disabled={updateStatusMutation.isPending}>
                          Yanıtlandı İşaretle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answered Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <MessageSquare className="h-5 w-5 mr-2" />
              Yanıtlanan Mesajlar ({answeredContacts.length})
            </CardTitle>
            <CardDescription>Daha önce yanıtlanmış mesajlar</CardDescription>
          </CardHeader>
          <CardContent>
            {answeredContacts.length > 0 ? (
              <div className="space-y-4">
                {answeredContacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.fullName}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="mr-4">{contact.email}</span>
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Yanıtlandı</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{contact.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(contact.createdAt).toLocaleDateString('tr-TR')} {new Date(contact.createdAt).toLocaleTimeString('tr-TR')}
                      </span>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedContact(contact)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detay
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Mesaj Detayı</DialogTitle>
                              <DialogDescription>
                                {contact.fullName} tarafından gönderilen mesaj
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold">İletişim Bilgileri</h4>
                                <p><strong>İsim:</strong> {contact.fullName}</p>
                                <p><strong>Email:</strong> {contact.email}</p>
                                <p><strong>Telefon:</strong> {contact.phone}</p>
                                <p><strong>Tarih:</strong> {new Date(contact.createdAt).toLocaleString('tr-TR')}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Mesaj</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="whitespace-pre-wrap">{contact.message}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsNew(contact.id)} disabled={updateStatusMutation.isPending}>
                          Yeni İşaretle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Henüz yanıtlanmış mesaj bulunmuyor</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}