import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { ProfessionalSlider } from "@/components/ProfessionalSlider";
import { SocialIcons } from "@/components/SocialIcons";
import { ChevronDown, Star, Users, Award, Clock } from "lucide-react";

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

  // Scroll animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    return () => {
      animateElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <SocialIcons />

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-background">
          <ProfessionalSlider />
          <div 
            className="scroll-down-arrow" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Scroll button clicked!');
              scrollToSection('courses');
            }}
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          >
            <div className="chevron" style={{pointerEvents: 'none'}}></div>
            <div className="chevron" style={{pointerEvents: 'none'}}></div>
            <div className="chevron" style={{pointerEvents: 'none'}}></div>
          </div>
        </div>
      </section>

      {/* Who Are We Section */}
      <section className="who-are-we-section">
        <div className="container">
          <div className="who-are-we-content">
            <div className="who-are-we-header">
              <h2 className="who-are-we-title">Biz Kimiz?</h2>
              <div className="title-underline"></div>
            </div>
            
            <div className="who-are-we-text">
              <div className="text-block animate-on-scroll">
                <div className="text-highlight-bar"></div>
                <p className="text-content">
                  Bu sayfa diğer sayfalarda bulacağınız bilen köpeklere komut verilmesini içermez. Bu sayfada 
                  hiç komutları bilmeyen sıfırdan çalışmaya başlayan köpeklerin eğitimlerinin nasıl yapıldığını, 
                  köpeklerin duruşu, davranışlarına göre ödüllendirme sistemi ile nasıl eğitildiğini açıklamalı 
                  şekilde anlatır.
                </p>
              </div>
              
              <div className="text-block animate-on-scroll">
                <div className="text-highlight-bar"></div>
                <p className="text-content">
                  Bu sayfa'da kendi köpeğiniz yada birkaç farklı köpekle çalışmakla eğitimlerinizi 
                  geliştirebileceğiniz dilediğiniz taktirde iletişime geçmeniz halinde o günkü koşullarla aynı 
                  zamanda sertifikalandırabiliceğiniz bir sayfadır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="courses-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Eğitim Programları</h2>
            <p className="section-subtitle">
              Temel eğitimden profesyonel eğitmenliğe kadar kapsamlı programlar
            </p>
          </div>

          {coursesLoading ? (
            <div className="courses-loading">
              {[1, 2].map((i) => (
                <div key={i} className="course-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-footer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="courses-grid">
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

      {/* Foundation Purpose Section */}
      <section id="foundation" className="foundation-section">
        <div className="container">
          <div className="foundation-content">
            <div className="foundation-header">
              <h2 className="foundation-title">Kuruluş Amacı</h2>
              <div className="foundation-underline"></div>
            </div>
            
            <div className="foundation-cards">
              <div className="foundation-card animate-on-scroll">
                <div className="card-number">01</div>
                <p className="card-text">
                  Kendi köpeğini eğitmek isteyen köpek sahiplerinin sürekli yenileyen farklı farklı 
                  çalışmalarla eğitim videolarını izleyerek kendi köpeklerini çok rahat bir şekilde 
                  eğitebilmelerini sağlar.
                </p>
              </div>
              
              <div className="foundation-card animate-on-scroll">
                <div className="card-number">02</div>
                <p className="card-text">
                  Köpek eğitmenliğini meslek olarak yapmak isteyen arkadaşlarımızın sıfırdan 
                  eğitim çalışmalarını farklı farklı karakterdeki köpekleri görerek ve kendi 
                  köpeğinde uygulayarak <strong>Eğitmenlik Seviyesinde</strong> daha da tecrübe 
                  sahibi olmasını sağlar.
                </p>
              </div>
              
              <div className="foundation-card animate-on-scroll">
                <div className="card-number">03</div>
                <p className="card-text">
                  Gün ve şartlara bağlı olarak Eğitmenlik yapmak isteyen arkadaşlarımıza 18 
                  yaşından büyük olması kaydıyla iletişime geçmeleri halinde <strong>E-DEVLET</strong> 
                  te gözüken sertifika ve <strong>Uluslararası sertifikaya</strong> sahip 
                  olabilme imkanı sağlar.
                </p>
              </div>
              
              <div className="foundation-card animate-on-scroll">
                <div className="card-number">04</div>
                <p className="card-text">
                  Sürekli olarak farklı köpek çalışmaları ve sürekli güncellenen yeni video ve 
                  anlatımlarla tecrübelerinize tecrübe katar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer mobile-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <h3 className="footer-title">Aytaç Mert - Köpek Eğitimi Akademisi</h3>
              <p className="footer-description">
                Profesyonel köpek eğitimi ve eğitmen yetiştirme merkezi
              </p>
              
              <div className="flex justify-center space-x-6">
                <a
                  href="https://api.whatsapp.com/send?phone=905532658445&text=Merhaba%2C+k%C3%B6pek+e%C4%9Fitimi+hakk%C4%B1nda+bilgi+almak+istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl"
                  data-testid="link-whatsapp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/uzmank9kopekegitimi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl"
                  data-testid="link-facebook"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/uzmank9kopekegitimi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl"
                  data-testid="link-instagram"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/channel/UCaCxjvc0ROGZJbcwYoMRYng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl"
                  data-testid="link-youtube"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2024 Aytaç Mert Köpek Eğitimi Akademisi. Tüm hakları saklıdır.</p>
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