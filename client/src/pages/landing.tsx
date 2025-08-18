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
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <h3 className="footer-title">Aytaç Mert - Köpek Eğitimi Akademisi</h3>
              <p className="footer-description">
                Profesyonel köpek eğitimi ve eğitmen yetiştirme merkezi
              </p>
              
              <div className="social-links">
                <a
                  href="https://api.whatsapp.com/send?phone=905532658445&text=Merhaba%2C+k%C3%B6pek+e%C4%9Fitimi+hakk%C4%B1nda+bilgi+almak+istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link whatsapp"
                  data-testid="link-whatsapp"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a
                  href="https://www.facebook.com/uzmank9kopekegitimi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link facebook"
                  data-testid="link-facebook"
                >
                  <i className="fab fa-facebook"></i>
                </a>
                <a
                  href="https://www.instagram.com/uzmank9kopekegitimi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link instagram"
                  data-testid="link-instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://www.youtube.com/channel/UCaCxjvc0ROGZJbcwYoMRYng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link youtube"
                  data-testid="link-youtube"
                >
                  <i className="fab fa-youtube"></i>
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