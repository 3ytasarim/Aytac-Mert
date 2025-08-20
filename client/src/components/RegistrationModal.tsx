import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { registrationSchema, type Registration } from "@shared/schema";
import { PrivacyModal } from "./PrivacyModal";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export function RegistrationModal({ isOpen, onClose, onSwitchToLogin }: RegistrationModalProps) {
  const [captchaCode] = useState(() => generateCaptcha());
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<Registration>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      tcNumber: "",
      email: "",
      phone: "",
      password: "",
      passwordConfirm: "",
      birthDate: "",
      termsAccepted: false,
    },
  });

  function generateCaptcha(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const registrationMutation = useMutation({
    mutationFn: async (data: Registration) => {
      if (data.birthDate.toUpperCase() !== captchaCode) {
        throw new Error("Doğrulama kodu yanlış");
      }
      const response = await apiRequest("/api/register", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
      });
      form.reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Kayıt Başarısız",
        description: error.message || "Kayıt işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Registration) => {
    registrationMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            Kayıt Ol
          </DialogTitle>
          <DialogDescription>
            AYTAÇ MERT EĞİTİM KURUMLARI Akademisi'ne üye olmak için formu doldurun
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* İsim */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İsim</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Adınızı giriniz" data-testid="input-firstname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* T.C No */}
              <FormField
                control={form.control}
                name="tcNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>T.C No</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12345678901" maxLength={11} data-testid="input-tc" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="ornek@email.com" data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefon */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <div className="flex items-center bg-gray-100 px-3 rounded-l-md border border-r-0">
                          <span className="text-red-500 text-lg">🇹🇷</span>
                          <span className="ml-2 text-gray-700">+90</span>
                        </div>
                        <Input 
                          {...field} 
                          placeholder="501 234 56 78" 
                          className="rounded-l-none"
                          data-testid="input-phone"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Şifre */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="En az 6 karakter" data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Şifre Tekrarı */}
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre Tekrarı</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Şifrenizi tekrar giriniz" data-testid="input-password-confirm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Doğrulama */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doğrulama</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gray-100 p-3 rounded border" style={{
                          fontFamily: 'monospace',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          letterSpacing: '4px',
                          color: '#333',
                          background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                        }}>
                          {captchaCode}
                        </div>
                        <span className="text-blue-500 cursor-pointer text-sm">Try another</span>
                      </div>
                      <Input 
                        {...field} 
                        placeholder="Yukarıdaki Kodu Giriniz" 
                        data-testid="input-captcha"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gizlilik Sözleşmesi */}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-terms"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Kabul Ediyorum{" "}
                      <button 
                        type="button"
                        onClick={() => setPrivacyModalOpen(true)}
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        Gizlilik Sözleşmesi
                      </button>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Kayıt Ol Butonu */}
            <Button
              type="submit"
              disabled={registrationMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-all duration-300"
              data-testid="button-register-submit"
            >
              {registrationMutation.isPending ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
            </Button>
          </form>
        </Form>

        {/* Giriş Yap Bağlantısı */}
        {onSwitchToLogin && (
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                data-testid="button-switch-to-login"
              >
                Giriş Yap
              </button>
            </p>
          </div>
        )}
      </DialogContent>
      
      <PrivacyModal 
        isOpen={privacyModalOpen} 
        onClose={() => setPrivacyModalOpen(false)} 
      />
    </Dialog>
  );
}