import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      const response = await fetch("/api/student/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mesaj Gönderildi",
        description: "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapılacaktır.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/contacts"] });
      setSubject("");
      setMessage("");
      onClose();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen konu ve mesaj alanlarını doldurun.",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate({ subject, message });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            İletişime Geç
          </DialogTitle>
          <DialogDescription>
            Uzman eğitmenlerimizden yardım alın. Sorularınızı ve mesajlarınızı buradan iletebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Konu</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Mesajınızın konusunu yazın..."
              data-testid="input-contact-subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">İçerik</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesajınızı buraya yazın..."
              rows={4}
              data-testid="textarea-contact-message"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-contact"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={sendMessageMutation.isPending}
              data-testid="button-send-contact"
            >
              {sendMessageMutation.isPending ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}