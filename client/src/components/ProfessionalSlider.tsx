import { useState, useEffect } from 'react';
import resim1 from '@assets/resim1_1755508508622.jpg';
import resim2 from '@assets/resim2_1755508508623.jpg';
import resim3 from '@assets/resim3_1755508508623.jpg';
import resim4 from '@assets/resim4_1755508508623.jpg';
import resim5 from '@assets/resim5_1755508508623.jpg';
import resim6 from '@assets/resim6_1755508508623.jpg';

interface SlideData {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  alt: string;
}

const slides: SlideData[] = [
  {
    image: resim1,
    title: "Temel Eğitim",
    subtitle: "Aytaç Mert Akademisi",
    description: "Profesyonel köpek eğitimi",
    alt: "Köpek eğitimi 1"
  },
  {
    image: resim2,
    title: "İleri Seviye",
    subtitle: "Uzmanlık Eğitimi",
    description: "İleri teknikler ve uzmanlaşma",
    alt: "Köpek eğitimi 2"
  },
  {
    image: resim3,
    title: "Davranış Analizi",
    subtitle: "Köpek Psikolojisi",
    description: "Davranışsal sorunların çözümü",
    alt: "Köpek eğitimi 3"
  },
  {
    image: resim4,
    title: "Grup Eğitimi",
    subtitle: "Sosyalleşme",
    description: "Diğer köpeklerle uyum",
    alt: "Köpek eğitimi 4"
  },
  {
    image: resim5,
    title: "Özel Eğitim",
    subtitle: "Birebir Çalışma",
    description: "Kişiye özel eğitim programı",
    alt: "Köpek eğitimi 5"
  },
  {
    image: resim6,
    title: "Sertifikasyon",
    subtitle: "Diploma Programı",
    description: "Uluslararası geçerli sertifika",
    alt: "Köpek eğitimi 6"
  }
];

export function ProfessionalSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getSlideState = (index: number) => {
    const current = currentSlide;
    const next = (currentSlide + 1) % totalSlides;
    const prev = (currentSlide - 1 + totalSlides) % totalSlides;

    if (index === current) return 'current';
    if (index === next) return 'next';
    if (index === prev) return 'previous';
    return '';
  };

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="professional-slider" id="trainingSlider">
      <button 
        className="slider-btn slider-btn-prev" 
        onClick={prevSlide}
        data-testid="slider-prev-btn"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div className="slides-wrapper">
        <div className="slides">
          {slides.map((slide, index) => {
            const state = getSlideState(index);
            return (
              <div key={index}>
                <div 
                  className="slide" 
                  data-current={state === 'current' ? 'true' : undefined}
                  data-next={state === 'next' ? 'true' : undefined}
                  data-previous={state === 'previous' ? 'true' : undefined}
                >
                  <div className="slide-inner">
                    <div className="slide-image-wrapper">
                      <img 
                        className="slide-image" 
                        src={slide.image} 
                        alt={slide.alt}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>


      </div>

      <button 
        className="slider-btn slider-btn-next" 
        onClick={nextSlide}
        data-testid="slider-next-btn"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Slide indicators */}
      <div className="slide-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            data-testid={`slide-indicator-${index}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}