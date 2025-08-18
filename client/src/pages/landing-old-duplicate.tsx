import { useState, useEffect } from "react";
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
import { ProfessionalSlider } from "@/components/ProfessionalSlider";
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
  const [scrollY, setScrollY] = useState(0);
  const { toast } = useToast();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="landing-page">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-background">
          <ProfessionalSlider />
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-main">Profesyonel Köpek Eğitimi</span>
              <span className="title-sub">Aytaç Mert Akademisi</span>
            </h1>
            <p className="hero-description">
              Köpeğinizle mükemmel bir bağ kurun ve profesyonel eğitmenlik becerilerinizi geliştirin. 
              Uzman eğitmenlerimiz size rehberlik ediyor.
            </p>
            <div className="hero-buttons">
              <Button 
                size="lg" 
                className="hero-btn-primary"
                onClick={() => scrollToSection('courses')}
              >
                Eğitimleri İncele
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="hero-btn-secondary"
                onClick={() => setIsContactModalOpen(true)}
              >
                İletişime Geç
              </Button>
            </div>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Mutlu Köpek Sahibi</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Sertifikalı Eğitmen</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10+</div>
              <div className="stat-label">Yıllık Tecrübe</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator" onClick={() => scrollToSection('courses')}>
          <ChevronDown className="scroll-arrow" />
          <span>Keşfet</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Neden Aytaç Mert Akademisi?</h2>
            <p className="section-subtitle">
              Profesyonel köpek eğitiminde lider akademi olarak size en iyi hizmeti sunuyoruz
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Star />
              </div>
              <h3 className="feature-title">Uzman Eğitmenler</h3>
              <p className="feature-description">
                10+ yıl tecrübeli, sertifikalı eğitmenlerden öğrenin
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3 className="feature-title">Bireysel Yaklaşım</h3>
              <p className="feature-description">
                Her köpeğin özelliklerine göre kişiselleştirilmiş eğitim
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Award />
              </div>
              <h3 className="feature-title">Sertifikalı Eğitim</h3>
              <p className="feature-description">
                Uluslararası geçerli sertifikalarla kariyerinizi ilerletin
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Clock />
              </div>
              <h3 className="feature-title">Esnek Program</h3>
              <p className="feature-description">
                Size uygun saatlerde, istediğiniz hızda öğrenin
              </p>
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

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Hakkımızda</h2>
              <p className="about-description">
                Bu sayfa diğer sayfalarda bulacağınız bilen köpeklere komut verilmesini içermez.
                Bu sayfada hiç komutları bilmeyen sıfırdan çalışmaya başlayan köpeklerin eğitimlerinin nasıl yapıldığını,
                köpeklerin duruşu, davranışlarına göre ödüllendirme sistemi ile nasıl eğitildiğini açıklamalı şekilde anlatır.
              </p>
              
              <div className="approach-grid">
                {[
                  {
                    number: "01",
                    title: "Kişisel Eğitim",
                    text: "Kendi köpeğini eğitmek isteyen köpek sahiplerinin sürekli yenileyen farklı çalışmalarla eğitim videolarını izleyerek kendi köpeklerini eğitebilmelerini sağlar."
                  },
                  {
                    number: "02",
                    title: "Profesyonel Gelişim",
                    text: "Köpek eğitmenliğini meslek olarak yapmak isteyen arkadaşlarımızın farklı karakterdeki köpeklerle çalışarak tecrübe kazanmasını sağlar."
                  },
                  {
                    number: "03",
                    title: "Sertifikasyon",
                    text: "18 yaş üzeri eğitmen adaylarına E-DEVLET'te geçerli ve uluslararası sertifika alma imkanı sunuyoruz."
                  },
                  {
                    number: "04",
                    title: "Sürekli Gelişim",
                    text: "Sürekli güncellenen video içerikleri ve yeni eğitim metodları ile tecrübelerinize tecrübe katıyoruz."
                  }
                ].map((item, index) => (
                  <div key={index} className="approach-card">
                    <div className="approach-number">{item.number}</div>
                    <div className="approach-content">
                      <h3 className="approach-title">{item.title}</h3>
                      <p className="approach-text">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Bugün Başlayın!</h2>
            <p className="cta-description">
              Köpeğinizle olan ilişkinizi güçlendirin ve profesyonel eğitmenlik yolculuğunuza başlayın
            </p>
            <div className="cta-buttons">
              <Button 
                size="lg" 
                className="cta-btn-primary"
                onClick={() => scrollToSection('courses')}
              >
                Eğitimlere Başla
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="cta-btn-secondary"
                onClick={() => setIsContactModalOpen(true)}
              >
                Ücretsiz Danışmanlık
              </Button>
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