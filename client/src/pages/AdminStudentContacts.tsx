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
import { MessageSquare, Reply, User, Calendar, CheckCircle, Clock, Eye, Send } from "lucide-react";
import type { StudentContact } from "@shared/schema";

interface StudentContactWithUser extends StudentContact {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminStudentContacts() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for response dialog
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<StudentContactWithUser | null>(null);
  const [responseText, setResponseText] = useState("");

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

  const { data: studentContacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/admin/student-contacts"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const respondMutation = useMutation({
    mutationFn: async ({ contactId, response }: { contactId: string; response: string }) => {
      return await apiRequest(`/api/admin/student-contacts/${contactId}/respond`, "PATCH", { response });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yanıt gönderildi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/student-contacts"] });
      setResponseDialogOpen(false);
      setResponseText("");
      setSelectedContact(null);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt gönderilirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleResponse = (contact: StudentContactWithUser) => {
    setSelectedContact(contact);
    setResponseText(contact.response || "");
    setResponseDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!selectedContact || !responseText.trim()) {
      toast({
        title: "Hata",
        description: "Yanıt boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    respondMutation.mutate({
      contactId: selectedContact.id,
      response: responseText,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Bekliyor</Badge>;
      case 'responded':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Yanıtlandı</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading || contactsLoading) {
    return (
      <AdminLayout title="Öğrenci Mesajları" description="Öğrencilerden gelen mesajları görüntüleyin ve yanıtlayın">
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

  const contactList = studentContacts as StudentContactWithUser[] | undefined;

  return (
    <AdminLayout title="Öğrenci Mesajları" description="Öğrencilerden gelen mesajları görüntüleyin ve yanıtlayın">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
                  <p className="text-2xl font-bold">{contactList?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                  <p className="text-2xl font-bold">
                    {contactList?.filter(c => c.status === 'pending').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Yanıtlanan</p>
                  <p className="text-2xl font-bold">
                    {contactList?.filter(c => c.status === 'responded').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Öğrenci Mesajları
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!contactList || contactList.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz mesaj yok</h3>
                <p className="text-gray-500">Öğrenciler mesaj gönderdiğinde burada görünecektir.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactList.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">
                            {contact.user?.firstName} {contact.user?.lastName}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({contact.user?.email})
                          </span>
                          <div className="ml-auto">
                            {getStatusBadge(contact.status)}
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-2">{contact.subject}</h4>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {contact.message}
                        </p>
                        
                        {contact.response && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <p className="text-sm font-medium text-blue-900 mb-1">Yanıt:</p>
                            <p className="text-blue-800 text-sm">{contact.response}</p>
                            {contact.respondedAt && (
                              <p className="text-xs text-blue-600 mt-2">
                                Yanıtlandı: {formatDate(contact.respondedAt.toString())}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(contact.createdAt.toString())}
                          </div>
                          
                          <Button
                            size="sm"
                            variant={contact.status === 'responded' ? 'outline' : 'default'}
                            onClick={() => handleResponse(contact)}
                            className="ml-4"
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            {contact.status === 'responded' ? 'Yanıtı Düzenle' : 'Yanıtla'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Dialog */}
        <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Reply className="h-5 w-5 mr-2" />
                Mesaja Yanıt Ver
              </DialogTitle>
            </DialogHeader>
            
            {selectedContact && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">
                      {selectedContact.user?.firstName} {selectedContact.user?.lastName}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({selectedContact.user?.email})
                    </span>
                  </div>
                  <h4 className="font-medium mb-2">{selectedContact.subject}</h4>
                  <p className="text-gray-600 text-sm">{selectedContact.message}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="response">Yanıtınız</Label>
                  <Textarea
                    id="response"
                    placeholder="Yanıtınızı buraya yazın..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResponseDialogOpen(false);
                  setResponseText("");
                  setSelectedContact(null);
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={respondMutation.isPending || !responseText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {respondMutation.isPending ? "Gönderiliyor..." : "Yanıtı Gönder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}