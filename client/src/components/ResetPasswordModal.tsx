import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { resetPasswordSchema, type ResetPassword } from "@shared/schema";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export function ResetPasswordModal({ isOpen, onClose, token }: ResetPasswordModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token,
      password: "",
      confirmPassword: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPassword) => {
      const response = await apiRequest("POST", "/api/reset-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Şifre Değiştirildi",
        description: "Şifreniz başarıyla değiştirildi. Şimdi yeni şifrenizle giriş yapabilirsiniz.",
      });
      form.reset();
      onClose();
      // Redirect to login or home page
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Şifre sıfırlama başarısız. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetPassword) => {
    resetMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Şifre Oluştur</DialogTitle>
          <DialogDescription>
            Lütfen yeni şifrenizi girin ve tekrar onaylayın.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yeni Şifre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="En az 6 karakter"
                        data-testid="input-new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre Tekrar</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Şifrenizi tekrar girin"
                        data-testid="input-confirm-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel-reset"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={resetMutation.isPending}
                data-testid="button-confirm-reset"
              >
                {resetMutation.isPending ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}