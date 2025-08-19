import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  onPurchase: (course: Course) => void;
}

export function CourseCard({ course, onPurchase }: CourseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover-lift animate-scaleIn border border-gray-100" data-testid={`course-card-${course.id}`}>
      <img
        src={course.imageUrl || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"}
        alt={course.title}
        className="w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-500"
        data-testid="img-course"
      />
      
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-course-title">
          {course.title}
        </h3>
        <p className="text-gray-600 mb-6 text-lg leading-relaxed" data-testid="text-course-description">
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-black" data-testid="text-course-price">
            {formatPrice(course.price)}
          </div>
          <Button
            onClick={() => onPurchase(course)}
            className="bg-black text-white hover:bg-gray-800 transition-colors font-semibold px-6 py-3 hover-lift"
            data-testid={`button-purchase-${course.id}`}
          >
            Satın Al
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
