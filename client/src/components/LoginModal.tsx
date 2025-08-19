import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
import { z } from "zod";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
  rememberMe: z.boolean().optional(),
});

type LoginData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Giriş Başarılı",
        description: "Hoşgeldiniz!",
      });
      form.reset();
      onClose();
      // Invalidate auth query to trigger re-fetch and route change
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Small delay to ensure query invalidation processes
      setTimeout(() => {
        // Force refetch to ensure immediate route change
        queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Giriş Başarısız",
        description: error.message || "Email veya şifre hatalı.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            Giriş Yap
          </DialogTitle>
          <DialogDescription>
            Email ve şifrenizi girerek hesabınıza giriş yapın
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      placeholder="ornek@email.com" 
                      data-testid="input-login-email"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Şifre */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center">
                    <span>Şifre</span>
                    <button
                      type="button"
                      className="text-sm text-blue-500 hover:text-blue-700"
                      onClick={() => setShowForgotPassword(true)}
                      data-testid="button-forgot-password"
                    >
                      Şifremi Unuttum
                    </button>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        type={showPassword ? "text" : "password"}
                        placeholder="Şifrenizi giriniz"
                        data-testid="input-login-password"
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Beni Hatırla */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-remember-me"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Beni Hatırla
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Giriş Yap Butonu */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-all duration-300"
              data-testid="button-login-submit"
            >
              {loginMutation.isPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </Form>

        {/* Kayıt Ol Bağlantısı */}
        {onSwitchToRegister && (
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Hesabınız yok mu?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                data-testid="button-switch-to-register"
              >
                Kayıt Ol
              </button>
            </p>
          </div>
        )}
      </DialogContent>
      
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    </Dialog>
  );
}