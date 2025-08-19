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
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
  rememberMe: z.boolean().optional(),
});

type LoginData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Refresh page to load dashboard
      window.location.reload();
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
                      onClick={() => {
                        toast({
                          title: "Şifre Sıfırlama",
                          description: "Lütfen info@aytacmert.com adresine email gönderiniz.",
                        });
                      }}
                    >
                      Şifremi Unuttum
                    </button>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password" 
                      placeholder="Şifrenizi giriniz"
                      data-testid="input-login-password"
                      className="h-12"
                    />
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
      </DialogContent>
    </Dialog>
  );
}