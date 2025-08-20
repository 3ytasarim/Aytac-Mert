import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle, CreditCard, Phone, Banknote, Clock } from "lucide-react";
import { useState } from "react";
import type { Course } from "@shared/schema";

interface CompactPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onPayment?: (course: Course) => void;
}

export function CompactPaymentModal({ isOpen, onClose, course, onPayment }: CompactPaymentModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!course) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const copyIban = () => {
    navigator.clipboard.writeText('TR46 0013 4000 0242 4034 6000 01');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "IBAN Kopyalandı",
      description: "IBAN numarası panoya kopyalandı.",
    });
  };

  const handlePayment = () => {
    if (onPayment) {
      onPayment(course);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Merhaba, "${course.title}" kursu için ödeme yaptım. Dekont gönderiyorum.`
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-gradient-to-br from-slate-50 to-white border-0 shadow-xl" data-testid="payment-modal">
        <div className="relative">
          {/* Header */}
          <motion.div 
            className="bg-gradient-to-r from-black via-gray-900 to-black p-6 text-white relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <DialogTitle className="text-3xl font-bold mb-2 text-white">
                Eğitime Başlayın
              </DialogTitle>
              <p className="text-gray-300">Profesyonel köpek eğitimi deneyimi</p>
            </div>
          </motion.div>

          {/* Content */}
          <div className="p-6">
            {/* Course Preview */}
            <motion.div 
              className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={course.imageUrl || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"} 
                    alt={course.title}
                    className="w-16 h-16 rounded-xl object-cover shadow-md"
                    data-testid="img-course-preview"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1" data-testid="text-course-title">
                      {course.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Sınırsız Erişim</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Sertifika Dahil</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-1" data-testid="text-course-price">
                    {formatPrice(course.price)}
                  </div>
                  <div className="text-sm text-white bg-green-500 px-3 py-1 rounded-full">
                    Tek Seferlik Ödeme
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Steps - Horizontal Layout */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Step 1: Bank Transfer */}
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Banknote className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Adım 1: Havale Yapın</h3>
                  <p className="text-sm text-gray-600">Aşağıdaki hesaba havale yapın</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-24 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">DenizBank</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">IBAN Numarası</label>
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <span className="flex-1 font-mono text-sm font-semibold text-gray-800" data-testid="text-iban">
                          TR46 0013 4000 0242 4034 6000 01
                        </span>
                        <motion.button
                          onClick={copyIban}
                          className="ml-2 p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          data-testid="button-copy-iban"
                        >
                          <AnimatePresence mode="wait">
                            {copied ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Alıcı Adı</span>
                        <p className="font-semibold text-gray-900">AYTAÇ MERT ÖZTÜRK</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tutar</span>
                        <p className="font-semibold text-gray-900">{formatPrice(course.price)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2: WhatsApp */}
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Adım 2: Dekont Gönderin</h3>
                  <p className="text-sm text-gray-600">WhatsApp ile dekont fotoğrafı gönderin</p>
                </div>

                <div className="bg-white rounded-lg p-4 text-center mb-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Ödeme dekontunuzu WhatsApp üzerinden gönderin
                  </p>
                  
                  <a
                    href={`https://wa.me/905301234567?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    data-testid="button-whatsapp"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp ile Dekont Gönder
                  </a>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-800 text-sm mb-1">💡 Önemli Bilgi</h4>
                  <p className="text-xs text-yellow-700">
                    Dekont gönderildikten sonra 24 saat içinde kursa erişiminiz açılacaktır.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              className="flex justify-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button 
                onClick={onClose}
                variant="outline"
                className="px-8 py-2"
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button 
                onClick={handlePayment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-2 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                data-testid="button-payment"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Ödeme Yap
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}