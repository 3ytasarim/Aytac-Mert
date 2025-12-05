import { useState, useEffect, useRef } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { CompactPaymentModal } from "@/components/ui/compact-payment-modal";
import { LoginModal } from "@/components/LoginModal";
import { RegistrationModal } from "@/components/RegistrationModal";
import { CourseCard } from "@/components/ui/course-card";
import { Navigation } from "@/components/ui/navigation";
import type { Course } from "@shared/schema";
import { z } from "zod";
import { ProfessionalSlider } from "@/components/ProfessionalSlider";
import { SocialIcons } from "@/components/SocialIcons";
import { ChevronDown, Star, Users, Award, Clock, Play, Volume2 } from "lucide-react";
import heroVideo from "@assets/Aytac_Mert_Video_1764954711333.mp4";

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
  const [authModal, setAuthModal] = useState<{ type: 'login' | 'register' | null; isOpen: boolean }>({
    type: null,
    isOpen: false,
  });
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

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
      await apiRequest("/api/contact", "POST", values);
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
    if (!isAuthenticated) {
      setAuthModal({ type: 'login', isOpen: true });
      return;
    }
    setPaymentModal({ isOpen: true, course });
  };

  const handlePayment = async (course: Course) => {
    if (!isAuthenticated || !user) return;

    try {
      const invoiceData = {
        courseId: course.id,
        studentName: `${user.firstName} ${user.lastName || ''}`.trim(),
        tcNumber: user.tcNumber || '',
        courseName: course.title,
        amount: course.price,
        status: "paid",
        paymentMethod: "bank_transfer"
      };

      await apiRequest('/api/invoices', "POST", invoiceData);

      toast({
        title: "Ödeme Kaydı Oluşturuldu",
        description: "Ödemeniz admin panelde görüntülenecektir.",
        variant: "default"
      });

      // Close the modal after successful payment
      setPaymentModal({ isOpen: false, course: null });
      
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Hata",
        description: "Ödeme kaydı oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  };

  const handleAuthModalClose = () => {
    setAuthModal({ type: null, isOpen: false });
  };

  const showRegistrationModal = () => {
    setAuthModal({ type: 'register', isOpen: true });
  };

  const showLoginModal = () => {
    setAuthModal({ type: 'login', isOpen: true });
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

      {/* Professional Video Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10"></div>
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-600 rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-600 rounded-full filter blur-[100px] opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-20">
          {/* Section Header */}
          <div className="text-center mb-12 animate-on-scroll">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-500"></div>
              <Play className="w-8 h-8 text-blue-500 animate-pulse" />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-purple-500"></div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Eğitim Dünyamıza Hoş Geldiniz
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Profesyonel köpek eğitimi yolculuğunuza başlamadan önce bu videoyu izleyin
            </p>
          </div>

          {/* Video Container - Vertical/Portrait Format */}
          <div className="relative max-w-sm md:max-w-md mx-auto animate-on-scroll">
            {/* Decorative Frame */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl md:rounded-3xl opacity-75 blur-sm animate-pulse"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl md:rounded-3xl"></div>
            
            {/* Video Wrapper */}
            <div className="relative bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
              <video
                className="w-full h-auto aspect-[9/16] object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
                data-testid="hero-video"
              >
                <source src={heroVideo} type="video/mp4" />
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
            </div>

            {/* Video Info Badge */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">Sesi açmayı unutmayın</span>
            </div>
          </div>

          {/* Stats or Features Below Video */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto animate-on-scroll">
            <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">10+</div>
              <div className="text-sm text-gray-400">Yıllık Deneyim</div>
            </div>
            <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-sm text-gray-400">Mutlu Öğrenci</div>
            </div>
            <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-sm text-gray-400">Video Ders</div>
            </div>
            <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">%100</div>
              <div className="text-sm text-gray-400">Memnuniyet</div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Are We Section - Professional & Animated */}
      <section className="relative py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header with Modern Typography */}
          <div className="text-center mb-20 animate-on-scroll">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-600"></div>
              <svg className="w-8 h-8 text-blue-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-purple-600"></div>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
              Biz Kimiz?
            </h2>
            
            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            
            <p className="text-xl text-gray-600 mt-8 max-w-3xl mx-auto leading-relaxed">
              Profesyonel köpek eğitimi alanında uzman kadromuzla, hem yeni başlayanlar hem de deneyimli eğitmenler için kapsamlı eğitim programları sunuyoruz.
            </p>
          </div>

          {/* Professional Content Cards */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Card 1 - Beginner Training */}
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 animate-on-scroll border border-gray-100 relative overflow-hidden">
              {/* Card Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-50"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sıfırdan Eğitim</h3>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-lg">
                  Hiç komut bilmeyen köpeklerin sıfırdan eğitimi için özel tasarlanmış programlarımız ile 
                  köpeğinizin davranışlarını anlayarak ödüllendirme sistemi ile etkili eğitim metodları öğreneceksiniz.
                </p>
                
                <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  <span>Temel eğitim programları</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2 - Professional Certification */}
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 animate-on-scroll border border-gray-100 relative overflow-hidden">
              {/* Card Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-50"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sertifikalı Eğitim</h3>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-lg">
                  Kendi köpeğiniz veya farklı köpeklerle çalışarak eğitim becerilerinizi geliştirin. 
                  İletişime geçtiğinizde mevcut koşullara uygun sertifikalandırma imkanlarından yararlanabilirsiniz.
                </p>
                
                <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:text-purple-700 transition-colors">
                  <span>Profesyonel sertifikasyon</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="text-center animate-on-scroll">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-20 h-20 border border-white border-opacity-20 rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 border border-white border-opacity-20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white border-opacity-10 rounded-full"></div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-6">Eğitim Yolculuğunuza Başlayın</h3>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Profesyonel köpek eğitimi ve eğitmen yetiştirme programlarımız ile hem köpeğinizi eğitin, hem de bu alanda uzman olun.
                </p>
                <button 
                  onClick={() => scrollToSection('courses')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  data-testid="button-view-courses"
                >
                  Eğitim Programlarını İncele
                </button>
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
            
            {/* Yeni Eğitimler Duyurusu */}
            <div className="announcement-banner animate-on-scroll">
              <div className="announcement-content">
                <div className="announcement-icon">
                  <svg className="announcement-sparkle" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0l3.09 6.26L22 9l-6.91 2.74L12 18l-3.09-6.26L2 9l6.91-2.74L12 0z"/>
                  </svg>
                </div>
                <div className="announcement-text">
                  <span className="announcement-badge">YENİ</span>
                  <p className="announcement-message">
                    Yeni eğitim videoları ve kapsamlı dersler <strong>sırasıyla eklenmektedir</strong>
                  </p>
                  <p className="announcement-sub">
                    Her hafta yeni içeriklerle köpek eğitimi yolculuğunuzu destekliyoruz
                  </p>
                </div>
              </div>
            </div>
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
                  href="https://wa.me/905532658445?text=Merhaba%2C+k%C3%B6pek+e%C4%9Fitimi+hakk%C4%B1nda+bilgi+almak+istiyorum."
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
      <CompactPaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, course: null })}
        course={paymentModal.course}
        onPayment={handlePayment}
      />

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={authModal.isOpen && authModal.type === 'login'} 
        onClose={handleAuthModalClose}
        onSwitchToRegister={showRegistrationModal}
      />
      <RegistrationModal 
        isOpen={authModal.isOpen && authModal.type === 'register'} 
        onClose={handleAuthModalClose}
        onSwitchToLogin={showLoginModal}
      />
    </div>
  );
}