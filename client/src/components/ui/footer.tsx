import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <footer className="relative w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden mobile-footer">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-6 right-16 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 left-20 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-8 right-8 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-40 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div 
            className={`text-center transform transition-all duration-1000 ease-out ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
          >
            {/* Main credit text */}
            <div className="flex items-center justify-center gap-3 group">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse group-hover:animate-spin transition-all duration-300" />
              
              <div className="relative">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                  Tasarlayan :
                </span>
                
                <a 
                  href="https://www.3ytasarim.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-base font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x group-hover:scale-105 hover:scale-110 transition-all duration-300 inline-block cursor-pointer"
                  data-testid="design-company-link"
                >
                  3Y Tasarım Yazılım Hizmetleri
                </a>
              </div>
              
              <Heart className="w-4 h-4 text-red-400 animate-pulse group-hover:animate-bounce transition-all duration-300" />
            </div>

            {/* Animated underline */}
            <div className="mt-2 mx-auto w-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent group-hover:w-64 transition-all duration-700"></div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x"></div>
    </footer>
  );
}