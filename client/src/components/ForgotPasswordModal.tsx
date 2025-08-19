import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { requestPasswordResetSchema, type RequestPasswordReset } from "@shared/schema";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin?: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const { toast } = useToast();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<RequestPasswordReset>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: RequestPasswordReset) => {
      const response = await apiRequest("POST", "/api/request-password-reset", data);
      return response.json();
    },
    onSuccess: () => {
      setIsEmailSent(true);
      toast({
        title: "Email Gönderildi",
        description: "Şifre sıfırlama bağlantısı email adresinize gönderildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Bir hata oluştu, lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestPasswordReset) => {
    resetMutation.mutate(data);
  };

  const handleClose = () => {
    setIsEmailSent(false);
    form.reset();
    onClose();
  };

  if (isEmailSent) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Gönderildi</DialogTitle>
            <DialogDescription>
              Şifre sıfırlama bağlantısı email adresinize gönderildi. 
              Email'inizi kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 pt-4">
            <Button onClick={handleClose} variant="outline">
              Kapat
            </Button>
            {onBackToLogin && (
              <Button onClick={() => { handleClose(); onBackToLogin(); }}>
                Giriş Yap
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Şifre Sıfırlama</DialogTitle>
          <DialogDescription>
            Lütfen info@aytacmert.com adresine email gönderiniz.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Adresi</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@ornek.com"
                      data-testid="input-forgot-password-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between space-x-4 pt-4">
              {onBackToLogin && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { handleClose(); onBackToLogin(); }}
                  data-testid="button-back-to-login"
                >
                  Geri Dön
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={resetMutation.isPending}
                data-testid="button-send-reset-email"
                className="flex-1"
              >
                {resetMutation.isPending ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}