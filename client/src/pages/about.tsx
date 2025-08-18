import { Navigation } from "@/components/ui/navigation";
import { SocialIcons } from "@/components/SocialIcons";
import { useAuth } from "@/hooks/useAuth";
import { Award, Users, Target, Star } from "lucide-react";

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <SocialIcons />
      
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-background">
          <div className="about-hero-overlay"></div>
          <div className="about-hero-particles">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}></div>
            ))}
          </div>
        </div>
        
        <div className="about-hero-content">
          <div className="about-hero-container">
            <h1 className="about-hero-title">
              <span className="hero-title-line">Hakkımızda</span>
            </h1>
            <div className="about-hero-underline">
              <div className="underline-gradient"></div>
            </div>
            <p className="about-hero-description">
              Profesyonel köpek eğitimi alanında uzman kadromuz ile hizmet vermekteyiz
            </p>
            <div className="about-hero-stats">
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">Yıl Tecrübe</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Mutlu Köpek</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Sertifika</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Aytaç Mert Köpek Eğitimi Akademisi
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Köpek eğitimi konusunda uzman kadromuz ile birlikte, evcil hayvan severlere 
                profesyonel eğitim hizmetleri sunmaktayız. Amacımız, köpeklerinizin davranış 
                sorunlarını çözmek ve onlarla daha sağlıklı bir yaşam sürmenizi sağlamaktır.
              </p>
            </div>

            {/* Mission & Values */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-8 h-8 text-gray-800" />
                  <h3 className="text-2xl font-bold text-gray-900">Misyonumuz</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Köpek sahiplerinin evcil hayvanları ile daha mutlu ve uyumlu bir yaşam 
                  sürmelerini sağlamak için profesyonel eğitim hizmetleri sunmak ve 
                  köpek eğitimi alanında uzman eğitmenler yetiştirmektir.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-8 h-8 text-gray-800" />
                  <h3 className="text-2xl font-bold text-gray-900">Vizyonumuz</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Türkiye'de köpek eğitimi alanında öncü akademi olmak ve uluslararası 
                  standartlarda eğitim programları ile sektöre nitelikli eğitmenler 
                  kazandırmaktır.
                </p>
              </div>
            </div>

            {/* Achievements Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
              <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Eğitim & Başarı Hikayemiz
              </h3>
              
              <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                  {[
                    {
                      date: "10.02.2011",
                      title: "AKUT Arama Kurtarma Derneği",
                      description: "AKUT Arama Kurtarma Derneği bünyesinde arama kurtarma eğitimi",
                      type: "Eğitim"
                    },
                    {
                      date: "24-25.02.2011",
                      title: "Deutsche Schaeferhunde Semineri",
                      description: "Alman Çoban Köpeği Irk ve Spor Derneği tarafından düzenlenen Deutsche Schaeferhunde Rasse-und Sportverein Semineri",
                      type: "Seminer"
                    },
                    {
                      date: "26.02.2011",
                      title: "BH Sınavı - SARI",
                      description: "Alman Çoban Köpeği Irk ve Spor Derneği - BH Sınavı / Köpeğimiz SARI ile başarıyla tamamlandı",
                      type: "Sınav"
                    },
                    {
                      date: "5-6.03.2011",
                      title: "Agility Semineri",
                      description: "Köpekli Sporlar Klübü tarafından düzenlenen Agility Semineri - 2001 Dünya Agility Şampiyonu Jenny Damme",
                      type: "Seminer"
                    },
                    {
                      date: "11.08.2012",
                      title: "Gece Gündüz Arazi Arama Tarama",
                      description: "Arama kurtarma köpekleri için gece gündüz arazi arama tarama eğitimi",
                      type: "Eğitim"
                    },
                    {
                      date: "16.02.2014",
                      title: "KIF Arama Kurtarma Semineri",
                      description: "Köpek Irkları ve Kinoloji Federasyonu (KIF) Arama Kurtarma Köpekleri Komisyonu Eğitim Semineri",
                      type: "Seminer"
                    },
                    {
                      date: "06.06.2015",
                      title: "TAYA & KEŞ - SKS ve BH Sınavları",
                      description: "Köpeklerimiz TAYA ve KEŞ ile SKS ve BH sınavlarını başarıyla tamamladık",
                      type: "Sınav"
                    },
                    {
                      date: "04.02.2017",
                      title: "KIF Helfer ve IPO Semineri",
                      description: "Köpek Irkları ve Kinoloji Federasyonu (KIF) Helfer ve IPO Kuralları Semineri",
                      type: "Seminer"
                    },
                    {
                      date: "Mart 2017",
                      title: "JANDARMA - SARA (Uyuşturucu Arama)",
                      description: "Belçika Malinois SARA'yı Jandarma için uyuşturucu arama köpeği olarak yetiştirdik",
                      type: "Eğitim"
                    },
                    {
                      date: "Eylül 2017",
                      title: "JANDARMA - CHROME & ASKO",
                      description: "Belçika Malinois CHROME ve ASKO'yu Jandarma için devriye köpeği olarak yetiştirdik",
                      type: "Eğitim"
                    },
                    {
                      date: "15.01.2018",
                      title: "KIF Eğitim Gösterisi",
                      description: "Köpek Irkları ve Kinoloji Federasyonu (KIF) Eğitim Gösterisi'ne katılım",
                      type: "Gösteri"
                    },
                    {
                      date: "16.01.2018",
                      title: "CAC BOB - RAMİZ",
                      description: "Köpek Irkları ve Kinoloji Federasyonu CAC BOB (Alman Çoban RAMİZ) sertifikası",
                      type: "Sertifika"
                    },
                    {
                      date: "15.01.2018",
                      title: "AFAD Arama Kurtarma - Uzman K9",
                      description: "Afet Acil Durum (AFAD) arama kurtarma köpeği (Belçika Malinois) Uzman K9 eğitimi",
                      type: "Eğitim"
                    },
                    {
                      date: "Eylül 2018",
                      title: "JANDARMA - ŞİMŞEK, MİA, BOBY",
                      description: "Belçika Malinois ŞİMŞEK (bomba arama), MİA (devriye) ve BOBY (bomba arama) köpeklerini Jandarma için yetiştirdik",
                      type: "Eğitim"
                    },
                    {
                      date: "26.09.2018",
                      title: "FCI Uluslararası Sertifika",
                      description: "FCI Uluslararası İsim Hakkı Sertifikası 0803/FCI98/2018",
                      type: "Sertifika"
                    }
                  ].map((item, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-right pr-4">
                          <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="text-sm text-gray-500 mt-2">{item.date}</div>
                        </div>
                        
                        <div className="flex-shrink-0 w-4 h-4 bg-gray-800 rounded-full mt-2 mx-4 relative">
                          {index !== 14 && (
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gray-300"></div>
                          )}
                        </div>
                        
                        <div className="flex-grow bg-gray-50 p-6 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.type === 'Eğitim' ? 'bg-blue-100 text-blue-800' :
                              item.type === 'Seminer' ? 'bg-green-100 text-green-800' :
                              item.type === 'Sınav' ? 'bg-yellow-100 text-yellow-800' :
                              item.type === 'Gösteri' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Aytaç Mert Köpek Eğitimi Akademisi</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Profesyonel köpek eğitimi alanında uzman kadromuz ile hizmet vermekteyiz. 
                Köpeklerinizin davranış sorunlarını çözmek ve onlarla daha sağlıklı bir yaşam sürmenizi sağlamak amacıyla buradayız.
              </p>
              <div className="flex space-x-4">
                <a href="https://api.whatsapp.com/send?phone=905532658445" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-green-400 hover:text-green-300 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/uzmank9kopekegitimi" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-blue-400 hover:text-blue-300 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/uzmank9kopekegitimi" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-pink-400 hover:text-pink-300 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/channel/UCaCxjvc0ROGZJbcwYoMRYng" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-red-400 hover:text-red-300 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Ana Sayfa</a></li>
                <li><a href="/hakkimizda" className="text-gray-300 hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#courses" className="text-gray-300 hover:text-white transition-colors">Kurslar</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  info@aytacmert.com
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  +90 553 265 8445
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Aytaç Mert Köpek Eğitimi Akademisi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}