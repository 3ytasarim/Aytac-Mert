import resim1 from "@assets/resim1_1755508508622.jpg";
import resim2 from "@assets/resim2_1755508508623.jpg";
import resim3 from "@assets/resim3_1755508508623.jpg";
import resim4 from "@assets/resim4_1755508508623.jpg";
import resim5 from "@assets/resim5_1755508508623.jpg";
import resim6 from "@assets/resim6_1755508508623.jpg";

const images = [resim1, resim2, resim3, resim4, resim5, resim6];

export function ImageSlider() {
  return (
    <div className="w-full py-16 bg-gradient-to-r from-gray-100 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fadeInUp">
            Profesyonel Köpek Eğitimi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fadeInUp animate-delay-200">
            Uzman eğitmenlerimiz ile köpeklerinizi profesyonel tekniklerle eğitiyoruz
          </p>
        </div>
        
        <div className="slider-container rounded-2xl overflow-hidden shadow-2xl">
          <div className="slider-track">
            {/* Double the images for seamless loop */}
            {[...images, ...images].map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-72 md:w-80 lg:w-96 h-64 md:h-72 lg:h-80 mx-2"
              >
                <img
                  src={image}
                  alt={`Köpek eğitimi ${(index % 6) + 1}`}
                  className="w-full h-full object-cover rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600 animate-fadeInUp animate-delay-400">
            Deneyimli eğitmenlerimizle köpekleriniz için en iyi eğitimi sunuyoruz
          </p>
        </div>
      </div>
    </div>
  );
}