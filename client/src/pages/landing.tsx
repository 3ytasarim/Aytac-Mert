import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "@/components/ui/payment-modal";
import { CourseCard } from "@/components/ui/course-card";
import { Navigation } from "@/components/ui/navigation";
import type { Course } from "@shared/schema";
import { z } from "zod";
import resim1 from "@assets/resim1_1755508508622.jpg";
import resim2 from "@assets/resim2_1755508508623.jpg";
import resim3 from "@assets/resim3_1755508508623.jpg";
import resim4 from "@assets/resim4_1755508508623.jpg";
import resim5 from "@assets/resim5_1755508508623.jpg";
import resim6 from "@assets/resim6_1755508508623.jpg";

const contactFormSchema = insertContactSchema.extend({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır"),
});

export default function Landing() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; course: Course | null }>({
    isOpen: false,
    course: null,
  });
  const { toast } = useToast();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onContactSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    try {
      await apiRequest("POST", "/api/contact", values);
      toast({
        title: "Mesaj Gönderildi",
        description: "Mesajınız alınmıştır. En kısa sürede dönüş yapacağız.",
      });
      form.reset();
      setIsContactModalOpen(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseCourse = (course: Course) => {
    setPaymentModal({ isOpen: true, course });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Single Background */}
      <section className="hero-section relative h-screen min-h-[800px] overflow-hidden">
        {/* Single Background Image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${resim1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/70 z-10"></div>
        
        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center text-white">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 animate-fadeInUp" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                Aytaç Mert
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6 animate-fadeInUp animate-delay-200" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                Köpek Eğitimi Akademisi
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-12 text-white max-w-4xl mx-auto animate-fadeInUp animate-delay-300 leading-relaxed" style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.9)' }}>
                Sıfırdan eğitmen seviyesine. Kendi köpeğinizi eğitin veya profesyonel eğitmen olun.
                25 yıllık deneyimimizle en kaliteli eğitimi sunuyoruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center animate-fadeInUp animate-delay-400">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 font-semibold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg hover-lift shadow-xl"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-register"
                >
                  Hemen Başla
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black font-semibold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg hover-lift shadow-xl"
                  onClick={() => scrollToSection("courses")}
                  data-testid="button-view-courses"
                >
                  Kursları İncele
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Photos Slider */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Eğitim Fotoğrafları
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Profesyonel köpek eğitimi sürecimizden kareler
            </p>
          </div>
          
          <div className="training-slider-container relative overflow-hidden rounded-2xl shadow-2xl">
            <div className="training-slider-track">
              <div className="training-slide">
                <img src={resim1} alt="Köpek eğitimi 1" className="training-slide-img" />
              </div>
              <div className="training-slide">
                <img src={resim2} alt="Köpek eğitimi 2" className="training-slide-img" />
              </div>
              <div className="training-slide">
                <img src={resim3} alt="Köpek eğitimi 3" className="training-slide-img" />
              </div>
              <div className="training-slide">
                <img src={resim4} alt="Köpek eğitimi 4" className="training-slide-img" />
              </div>
              <div className="training-slide">
                <img src={resim5} alt="Köpek eğitimi 5" className="training-slide-img" />
              </div>
              <div className="training-slide">
                <img src={resim6} alt="Köpek eğitimi 6" className="training-slide-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fadeInUp">
              Eğitim Programlarımız
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto animate-fadeInUp animate-delay-200">
              Köpeğinizi sıfırdan eğitin veya profesyonel eğitmen olma yolunda ilerleme kaydedin.
              Her seviyeye uygun kapsamlı eğitim programları.
            </p>
          </div>

          {coursesLoading ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onPurchase={handlePurchaseCourse}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fadeInUp">
              Biz Kimiz?
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed animate-fadeInUp animate-delay-200">
              Bu sayfa diğer sayfalarda bulacağınız bilen köpeklere komut verilmesini içermez.
              Bu sayfada hiç komutları bilmeyen sıfırdan çalışmaya başlayan köpeklerin eğitimlerinin nasıl yapıldığını,
              köpeklerin duruşu, davranışlarına göre ödüllendirme sistemi ile nasıl eğitildiğini açıklamalı şekilde anlatır.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                text: "Kendi köpeğini eğitmek isteyen köpek sahiplerinin sürekli yenileyen farklı farklı çalışmalarla eğitim videolarını izleyerek kendi köpeklerini çok rahat bir şekilde eğitebilmelerini sağlar."
              },
              {
                number: "02",
                text: "Köpek eğitmenliğini meslek olarak yapmak isteyen arkadaşlarımızın sıfırdan eğitim çalışmalarını farklı farklı karakterdeki köpekleri görerek ve kendi köpeğinde uygulayarak Eğitmenlik Seviyesinde daha da tecrübe sahibi olmasını sağlar."
              },
              {
                number: "03",
                text: "Gün ve Şartlara bağlı olarak Eğitmenlik yapmak isteyen arkadaşlarımıza 18 yaşından büyük olması kaydıyla iletişime geçmeleri halinde E-DEVLET te gözüken sertifika ve Uluslararası sertifikaya sahip olabilme imkanı sağlar."
              },
              {
                number: "04",
                text: "Sürekli olarak farklı köpek çalışmaları ve sürekli güncellenen yeni video ve anlatımlarla tecrübelerinize tecrübe katar."
              }
            ].map((item, index) => (
              <Card key={index} className="bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">{item.number}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              İletişime Geçin
            </h2>
            <p className="text-xl text-gray-600">Size en kısa sürede dönüş yapacağız</p>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setIsContactModalOpen(true)}
              data-testid="button-contact"
            >
              İletişim Formu
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Aytaç Mert - Köpek Eğitimi Akademisi</h3>
            <p className="text-gray-400 mb-8">Profesyonel köpek eğitimi ve eğitmen yetiştirme merkezi</p>
            
            <div className="flex justify-center space-x-6 mb-8">
              <a
                href="https://api.whatsapp.com/send?phone=905532658445&text=Merhaba%2C+k%C3%B6pek+e%C4%9Fitimi+hakk%C4%B1nda+bilgi+almak+istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
                data-testid="link-whatsapp"
              >
                <i className="fab fa-whatsapp text-2xl"></i>
              </a>
              <a
                href="https://www.facebook.com/uzmank9kopekegitimi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                data-testid="link-facebook"
              >
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a
                href="https://www.instagram.com/uzmank9kopekegitimi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
                data-testid="link-instagram"
              >
                <i className="fab fa-instagram text-2xl"></i>
              </a>
              <a
                href="https://www.youtube.com/channel/UCaCxjvc0ROGZJbcwYoMRYng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-400 transition-colors"
                data-testid="link-youtube"
              >
                <i className="fab fa-youtube text-2xl"></i>
              </a>
            </div>
            
            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-400">&copy; 2024 Aytaç Mert Köpek Eğitimi Akademisi. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>İletişime Geçin</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onContactSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-fullname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon Numarası</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Adresi</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} data-testid="textarea-message" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" data-testid="button-submit-contact">
                Gönder
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, course: null })}
        course={paymentModal.course}
      />
    </div>
  );
}
