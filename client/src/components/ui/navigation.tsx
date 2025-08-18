import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary" data-testid="brand-title">
              Aytaç Mert
            </h1>
            <p className="text-sm text-gray-600 -mt-1" data-testid="brand-subtitle">
              Köpek Eğitimi Akademisi
            </p>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#"
                className="text-primary font-medium px-3 py-2 rounded-md text-sm"
                data-testid="nav-home"
              >
                Ana Sayfa
              </a>
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm transition-colors"
                data-testid="nav-about"
              >
                Hakkımızda
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm transition-colors"
                data-testid="nav-contact"
              >
                İletişim
              </button>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : isAuthenticated ? (
              <Button
                variant="outline"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Çıkış Yap
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-login"
                >
                  Giriş Yap
                </Button>
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-register"
                >
                  Üye Ol
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-primary"
              data-testid="button-mobile-menu"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t" data-testid="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#"
              className="text-primary block px-3 py-2 text-base font-medium"
              data-testid="mobile-nav-home"
            >
              Ana Sayfa
            </a>
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-600 block px-3 py-2 text-base font-medium w-full text-left"
              data-testid="mobile-nav-about"
            >
              Hakkımızda
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-gray-600 block px-3 py-2 text-base font-medium w-full text-left"
              data-testid="mobile-nav-contact"
            >
              İletişim
            </button>
            <div className="flex space-x-2 px-3 py-2">
              {isLoading ? (
                <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : isAuthenticated ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="mobile-button-logout"
                >
                  Çıkış Yap
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="mobile-button-login"
                  >
                    Giriş Yap
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="mobile-button-register"
                  >
                    Üye Ol
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
