import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, Lock, Phone, Mail, X } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

export function ProfileEditModal({ isOpen, onClose, user }: ProfileEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/profile/update", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Profil güncellenemedi",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Password validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      toast({
        title: "Hata",
        description: "Şifre değiştirmek için mevcut şifrenizi girin",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      ...(formData.newPassword && {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
    };

    updateProfileMutation.mutate(updateData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-xl font-bold">
              <User className="h-5 w-5 mr-2" />
              Profili Düzenle
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Kişisel Bilgiler</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-sm">Ad</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Adınız"
                  required
                  data-testid="input-firstName"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm">Soyad</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Soyadınız"
                  data-testid="input-lastName"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                Telefon
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="5XXXXXXXXX"
                data-testid="input-phone"
              />
            </div>

            <div>
              <Label className="text-sm flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                E-posta (değiştirilemez)
              </Label>
              <Input
                value={user.email || ''}
                disabled
                className="bg-gray-50"
                data-testid="input-email-disabled"
              />
            </div>
          </div>

          {/* Password Change */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Şifre Değiştir (İsteğe Bağlı)
            </h3>
            
            <div>
              <Label htmlFor="currentPassword" className="text-sm">Mevcut Şifre</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Mevcut şifreniz"
                data-testid="input-currentPassword"
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-sm">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Yeni şifreniz"
                data-testid="input-newPassword"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Yeni şifrenizi tekrar girin"
                data-testid="input-confirmPassword"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex-1"
              data-testid="button-save"
            >
              {updateProfileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}