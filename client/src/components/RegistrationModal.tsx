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
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<Registration>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <DialogHeader className="animate-in slide-in-from-top-5 duration-500">
          <div className="text-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
              <span className="text-2xl text-white">🎓</span>
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Kayıt Ol
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            <span className="font-medium">AYTAÇ MERT EĞİTİM KURUMLARI</span> Akademisi'ne üye olmak için formu doldurun
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
                  <FormItem className="animate-in slide-in-from-left-5 duration-300">
                    <FormLabel className="text-gray-700 font-medium">İsim</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Adınızı giriniz" 
                        data-testid="input-firstname"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 hover:border-gray-400" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm animate-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />

              {/* Soyisim */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="animate-in slide-in-from-right-5 duration-300 delay-75">
                    <FormLabel className="text-gray-700 font-medium">Soyisim</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Soyadınızı giriniz" 
                        data-testid="input-lastname"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 hover:border-gray-400" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm animate-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* T.C No */}
              <FormField
                control={form.control}
                name="tcNumber"
                render={({ field }) => (
                  <FormItem className="animate-in slide-in-from-left-5 duration-300 delay-150">
                    <FormLabel className="text-gray-700 font-medium">T.C No</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="12345678901" 
                        maxLength={11} 
                        pattern="\d{11}"
                        inputMode="numeric"
                        data-testid="input-tc"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 hover:border-gray-400" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm animate-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="animate-in slide-in-from-right-5 duration-300 delay-150">
                    <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email" 
                        placeholder="ornek@email.com" 
                        data-testid="input-email"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 hover:border-gray-400" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm animate-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Telefon */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 animate-in slide-in-from-bottom-5 duration-300 delay-200">
                    <FormLabel className="text-gray-700 font-medium">Telefon</FormLabel>
                    <FormControl>
                      <div className="flex transition-all duration-200 hover:shadow-sm">
                        <div className="flex items-center bg-gradient-to-r from-gray-100 to-gray-50 px-3 rounded-l-md border border-r-0 border-gray-300">
                          <span className="text-red-500 text-lg motion-safe:animate-pulse">🇹🇷</span>
                          <span className="ml-2 text-gray-700 font-medium">+90</span>
                        </div>
                        <Input 
                          {...field} 
                          type="tel"
                          inputMode="tel"
                          placeholder="501 234 56 78" 
                          className="rounded-l-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                          data-testid="input-phone"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm animate-in slide-in-from-top-1" />
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
                  <FormItem className="animate-in slide-in-from-left-5 duration-300 delay-300">
                    <FormLabel className="text-gray-700 font-medium">Şifre</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        placeholder="En az 6 karakter" 
                        data-testid="input-password"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 hover:border-gray-400" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm animate-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />

              {/* Şifre Tekrarı */}
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem className="animate-in slide-in-from-right-5 duration-300 delay-300">
                    <FormLabel className="text-gray-700 font-medium">Şifre Tekrarı</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        placeholder="Şifrenizi tekrar giriniz" 
                        data-testid="input-password-confirm"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 hover:border-gray-400" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm animate-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
            </div>

            {/* Doğrulama */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="animate-in slide-in-from-bottom-5 duration-300 delay-400">
                  <FormLabel className="text-gray-700 font-medium">Doğrulama</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-white p-4 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300" style={{
                          fontFamily: 'monospace',
                          fontSize: '22px',
                          fontWeight: 'bold',
                          letterSpacing: '5px',
                          color: '#2d3748',
                          textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <span className="animate-pulse">{captchaCode}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setCaptchaCode(generateCaptcha())}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm font-medium transition-all duration-200 hover:scale-105 hover:underline"
                          data-testid="button-captcha-refresh"
                        >
                          Try another
                        </button>
                      </div>
                      <Input 
                        {...field} 
                        placeholder="Yukarıdaki Kodu Giriniz" 
                        data-testid="input-captcha"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 hover:border-gray-400" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm animate-in slide-in-from-top-1" />
                </FormItem>
              )}
            />

            {/* Gizlilik Sözleşmesi */}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 animate-in slide-in-from-bottom-5 duration-300 delay-500">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-terms"
                      className="transition-all duration-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 hover:border-blue-400"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700 text-sm leading-relaxed">
                      Kabul Ediyorum{" "}
                      <button 
                        type="button"
                        onClick={() => setPrivacyModalOpen(true)}
                        className="text-blue-500 underline hover:text-blue-700 transition-all duration-200 hover:scale-105 font-medium"
                      >
                        Gizlilik Sözleşmesi
                      </button>
                    </FormLabel>
                    <FormMessage className="text-red-500 text-xs animate-in slide-in-from-top-1" />
                  </div>
                </FormItem>
              )}
            />

            {/* Kayıt Ol Butonu */}
            <div className="animate-in slide-in-from-bottom-5 duration-300 delay-600">
              <Button
                type="submit"
                disabled={registrationMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                data-testid="button-register-submit"
              >
                {registrationMutation.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Kayıt Yapılıyor...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>🎆</span>
                    <span>Kayıt Ol</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Giriş Yap Bağlantısı */}
        {onSwitchToLogin && (
          <div className="text-center mt-6 pt-4 border-t border-gray-200 animate-in fade-in duration-500 delay-700">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:scale-105 hover:underline"
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