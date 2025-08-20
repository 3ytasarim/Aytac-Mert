import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle, CreditCard, Phone, ArrowRight, Sparkles, Banknote, Clock } from "lucide-react";
import { useState } from "react";
import type { Course } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export function EnhancedPaymentModal({ isOpen, onClose, course }: PaymentModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);

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
      title: "IBAN Kopyalandı ✨",
      description: "IBAN numarası panoya kopyalandı.",
    });
  };

  const whatsappMessage = encodeURIComponent(
    `Merhaba, "${course.title}" kursu için ödeme yaptım. Dekont gönderiyorum.`
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 border-0 shadow-2xl overflow-hidden" data-testid="payment-modal">
        <div className="relative">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-gray-100/10 opacity-30"></div>
          
          {/* Header Section */}
          <motion.div 
            className="bg-gradient-to-r from-black via-gray-900 to-black p-8 text-white relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            
            <div className="relative z-20 text-center">
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              
              <DialogTitle className="text-4xl font-bold mb-3 text-white">
                Eğitime Başlayın
              </DialogTitle>
              <p className="text-gray-300 text-lg">Profesyonel köpek eğitimi deneyimi</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-8 relative z-10">
            {/* Course Preview Card */}
            <motion.div 
              className="bg-white rounded-2xl p-6 mb-8 shadow-xl border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <motion.img 
                    src={course.imageUrl || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"} 
                    alt={course.title}
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    data-testid="img-course-preview"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-course-title">
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
                  <motion.div 
                    className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1"
                    data-testid="text-course-price"
                    whileHover={{ scale: 1.05 }}
                  >
                    {formatPrice(course.price)}
                  </motion.div>
                  <div className="text-sm text-gray-500 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Tek Seferlik Ödeme
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Steps */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Step 1: Bank Transfer */}
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Banknote className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Adım 1: Havale Yapın</h3>
                  <p className="text-gray-600">Aşağıdaki hesaba havale yapın</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-32 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold">DenizBank</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IBAN Numarası
                        </label>
                        <div className="flex items-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-colors">
                          <span className="flex-1 font-mono text-lg font-semibold text-gray-800" data-testid="text-iban">
                            TR46 0013 4000 0242 4034 6000 01
                          </span>
                          <motion.button
                            onClick={copyIban}
                            className="ml-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            data-testid="button-copy-iban"
                          >
                            <AnimatePresence mode="wait">
                              {copied ? (
                                <motion.div
                                  key="check"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <Copy className="w-5 h-5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-gray-600 mb-1">Alıcı Adı</label>
                          <p className="font-semibold text-gray-900">AYTAÇ MERT ÖZTÜRK</p>
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">Tutar</label>
                          <p className="font-semibold text-gray-900">{formatPrice(course.price)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2: WhatsApp Confirmation */}
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Adım 2: Dekont Gönderin</h3>
                  <p className="text-gray-600">WhatsApp ile dekont fotoğrafı gönderin</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-700 mb-4">
                      Ödeme dekontunuzu WhatsApp üzerinden gönderin
                    </p>
                    
                    <motion.a
                      href={`https://wa.me/905301234567?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid="button-whatsapp"
                    >
                      <Phone className="w-5 h-5 mr-3" />
                      WhatsApp ile Dekont Gönder
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </motion.a>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">💡 Önemli Bilgi</h4>
                    <p className="text-sm text-yellow-700">
                      Dekont gönderildikten sonra 24 saat içinde kursa erişiminiz açılacaktır.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Features Section */}
            <motion.div 
              className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Bu kursla neler kazanacaksınız?</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Sınırsız erişim</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Uzman desteği</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Tamamlama sertifikası</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}