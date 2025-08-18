import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export function PaymentModal({ isOpen, onClose, course }: PaymentModalProps) {
  const { toast } = useToast();

  if (!course) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const copyIban = () => {
    navigator.clipboard.writeText('TR46 0013 4000 0242 4034 6000 01');
    toast({
      title: "IBAN Kopyalandı",
      description: "IBAN numarası panoya kopyalandı.",
    });
  };

  const whatsappMessage = encodeURIComponent(
    `Merhaba, "${course.title}" kursu için ödeme yaptım. Dekont gönderiyorum.`
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="payment-modal">
        <DialogHeader>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-university text-2xl text-primary"></i>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Ödeme Bilgileri
            </DialogTitle>
            <p className="text-gray-600 mt-2">Banka havalesi ile ödeme yapın</p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <div className="w-24 h-12 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">DenizBank</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN Bilgisi
                </label>
                <div className="flex items-center bg-white border rounded-lg p-3">
                  <span
                    className="flex-1 font-mono text-sm"
                    data-testid="text-iban"
                  >
                    TR46 0013 4000 0242 4034 6000 01
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyIban}
                    className="ml-2 text-primary hover:text-blue-700"
                    data-testid="button-copy-iban"
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hesap Sahibi
                </label>
                <div className="bg-white border rounded-lg p-3">
                  <span className="text-sm" data-testid="text-account-holder">
                    Aytaç Mert
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tutar
                </label>
                <div className="bg-white border rounded-lg p-3">
                  <span
                    className="text-lg font-bold text-primary"
                    data-testid="text-payment-amount"
                  >
                    {formatPrice(course.price)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kurs
                </label>
                <div className="bg-white border rounded-lg p-3">
                  <span className="text-sm" data-testid="text-course-name">
                    {course.title}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-yellow-600 mt-0.5 mr-3"></i>
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Not:</strong> Ödeme sonrasında dekont görselini WhatsApp üzerinden göndermenizi rica ederiz.
                </p>
              </div>
            </div>
          </div>

          <a
            href={`https://api.whatsapp.com/send?phone=905532658445&text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
            data-testid="button-whatsapp"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            WhatsApp ile Dekont Gönder
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
