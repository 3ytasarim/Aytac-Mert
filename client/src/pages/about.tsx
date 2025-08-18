import { Navigation } from "@/components/ui/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Award, Users, Target, Star } from "lucide-react";

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Hakkımızda
          </h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6 opacity-80"></div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Profesyonel köpek eğitimi alanında uzman kadromuz ile hizmet vermekteyiz
          </p>
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

            {/* Statistics */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
              <h3 className="text-3xl font-bold text-center mb-12">Başarılarımız</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-gray-300">Mutlu Köpek</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">300+</div>
                  <div className="text-gray-300">Memnun Sahip</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">50+</div>
                  <div className="text-gray-300">Sertifikalı Eğitmen</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">5</div>
                  <div className="text-gray-300">Yıllık Tecrübe</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}