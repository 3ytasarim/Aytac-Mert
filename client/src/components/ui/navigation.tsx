import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { RegistrationModal } from "@/components/RegistrationModal";
import { LoginModal } from "@/components/LoginModal";

function RegistrationButton({ onModalOpen }: { onModalOpen?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    onModalOpen?.();
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        className="w-full auth-btn font-bold px-8 py-4 rounded-2xl border-0 bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
        data-testid="button-register"
      >
        <span className="flex items-center justify-center gap-2">
          ✨ Üye Ol
        </span>
      </Button>
      <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

function LoginButton({ onModalOpen }: { onModalOpen?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    onModalOpen?.();
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant="outline"
        className="w-full auth-btn font-bold px-8 py-4 rounded-2xl border-3 border-black text-black hover:bg-black hover:text-white hover:border-black shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
        data-testid="button-login"
      >
        <span className="flex items-center justify-center gap-2">
          🔐 Giriş Yap
        </span>
      </Button>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-[150] bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 group cursor-pointer">
            <div className="transform transition-all duration-300 group-hover:scale-105">
              <h1 className="text-3xl font-bold text-black transition-colors duration-300" data-testid="brand-title">
                Aytaç Mert
              </h1>
              <p className="text-sm font-medium -mt-1 text-gray-600 transition-colors duration-300" data-testid="brand-subtitle">
                Köpek Eğitimi Akademisi
              </p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              <a
                href="/"
                className="nav-link relative px-4 py-2 rounded-lg text-base font-medium text-black hover:bg-black/5 transition-all duration-300 transform hover:scale-105"
                data-testid="nav-home"
              >
                Ana Sayfa
                <span className="nav-underline"></span>
              </a>
              <button
                onClick={() => scrollToSection("courses")}
                className="nav-link relative px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-300 transform hover:scale-105"
                data-testid="nav-courses"
              >
                Kurslar
                <span className="nav-underline"></span>
              </button>
              <a
                href="/hakkimizda"
                className="nav-link relative px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-300 transform hover:scale-105"
                data-testid="nav-about"
              >
                Hakkımızda
                <span className="nav-underline"></span>
              </a>
              <a
                href="/iletisim"
                className="nav-link relative px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-300 transform hover:scale-105"
                data-testid="nav-contact"
              >
                İletişim
                <span className="nav-underline"></span>
              </a>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="flex space-x-2">
                <div className="w-24 h-11 bg-gray-300 rounded-xl animate-pulse"></div>
                <div className="w-20 h-11 bg-gray-300 rounded-xl animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => {
                    // Role'e göre dashboard'a yönlendir
                    if (user?.role === 'admin') {
                      window.location.href = '/admin';
                    } else {
                      window.location.href = '/dashboard';
                    }
                  }}
                  className="auth-btn font-semibold px-6 py-3 rounded-xl border-2 bg-black text-white hover:bg-gray-800 border-black hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  data-testid="button-account"
                >
                  Hesabım
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/api/logout"}
                  className="auth-btn font-semibold px-6 py-3 rounded-xl border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  data-testid="button-logout"
                >
                  Çıkış Yap
                </Button>
              </div>
            ) : (
              <>
                <LoginButton />
                <RegistrationButton />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-black hover:bg-black/5 transition-all duration-300"
              data-testid="button-mobile-menu"
            >
              <div className="space-y-1">
                <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}></div>
                <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}></div>
                <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <a
              href="/"
              className="mobile-nav-item block px-4 py-3 text-black font-medium rounded-lg hover:bg-black/5 transition-all duration-300"
              data-testid="mobile-nav-home"
            >
              Ana Sayfa
            </a>
            <button
              onClick={() => scrollToSection("courses")}
              className="mobile-nav-item block w-full text-left px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-black/5 hover:text-black transition-all duration-300"
              data-testid="mobile-nav-courses"
            >
              Kurslar
            </button>
            <a
              href="/hakkimizda"
              className="mobile-nav-item block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-black/5 hover:text-black transition-all duration-300"
              data-testid="mobile-nav-about"
            >
              Hakkımızda
            </a>
            <a
              href="/iletisim"
              className="mobile-nav-item block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-black/5 hover:text-black transition-all duration-300"
              data-testid="mobile-nav-contact"
            >
              İletişim
            </a>
            
            <div className="pt-4 space-y-3 border-t border-gray-200">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-12 bg-gray-300 rounded-xl animate-pulse"></div>
                  <div className="h-12 bg-gray-300 rounded-xl animate-pulse"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-3">
                  <Button
                    className="w-full py-3 font-semibold bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-300"
                    onClick={() => {
                      // Role'e göre dashboard'a yönlendir
                      if (user?.role === 'admin') {
                        window.location.href = '/admin';
                      } else {
                        window.location.href = '/dashboard';
                      }
                    }}
                    data-testid="mobile-button-account"
                  >
                    Hesabım
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full py-3 font-semibold border-black text-black hover:bg-black hover:text-white rounded-xl transition-all duration-300"
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="mobile-button-logout"
                  >
                    Çıkış Yap
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <RegistrationButton onModalOpen={() => setIsMobileMenuOpen(false)} />
                  <LoginButton onModalOpen={() => setIsMobileMenuOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
