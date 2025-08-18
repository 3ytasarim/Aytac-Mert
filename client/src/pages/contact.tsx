import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SocialIcons } from "@/components/SocialIcons";
import { Navigation } from "@/components/ui/navigation";
import { insertContactSchema } from "@shared/schema";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";

const contactFormSchema = insertContactSchema.extend({
  fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır")
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: ""
    }
  });

  // Generate particles for animation
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("/api/contacts", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Mesajınız Gönderildi",
        description: "En kısa sürede size dönüş yapacağız.",
        variant: "default"
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
      console.error("Contact form error:", error);
    }
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefon",
      value: "+90 553 265 84 45",
      href: "tel:+905532658445",
      color: "from-green-400 to-green-600"
    },
    {
      icon: Mail,
      title: "E-Mail",
      value: "aytacmert35@gmail.com",
      href: "mailto:aytacmert35@gmail.com",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: MapPin,
      title: "Lokasyon",
      value: "İzmir, Türkiye",
      href: "#",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: Clock,
      title: "Çalışma Saatleri",
      value: "09:00 - 18:00",
      href: "#",
      color: "from-orange-400 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <SocialIcons />
      
      {/* Hero Section */}
      <section className="relative min-h-[700px] bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden flex items-center pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/30 to-purple-900/30"></div>
          
          {/* Animated Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Floating Geometric Shapes */}
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 border-2 border-blue-400/30 rounded-full"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-32 right-16 w-16 h-16 border-2 border-purple-400/30 rotate-45"
            animate={{ rotate: [45, 405], y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  İletişim
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Sorularınız için bize ulaşın. Köpek eğitimi konusunda 
                <span className="text-blue-400 font-semibold"> profesyonel destek </span>
                almak için buradayız.
              </p>
            </motion.div>


          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                  Bize Ulaşın
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Köpek eğitimi konusunda sorularınız varsa veya randevu almak istiyorsanız, 
                  aşağıdaki iletişim bilgilerini kullanarak bize ulaşabilirsiniz.
                </p>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <motion.a
                        key={index}
                        href={info.href}
                        className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
                        whileHover={{ scale: 1.02, x: 5 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        data-testid={`contact-${info.title.toLowerCase()}`}
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{info.title}</h3>
                          <p className="text-gray-600">{info.value}</p>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-xl border-0 bg-white">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">İletişim Formu</CardTitle>
                    <p className="text-gray-600">Mesajınızı bırakın, en kısa sürede size dönelim</p>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Ad Soyad *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Adınızı ve soyadınızı giriniz"
                                  data-testid="input-fullname"
                                />
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
                              <FormLabel className="text-gray-700 font-medium">E-posta *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email"
                                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="E-posta adresinizi giriniz"
                                  data-testid="input-email"
                                />
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
                              <FormLabel className="text-gray-700 font-medium">Telefon</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="tel"
                                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Telefon numaranızı giriniz"
                                  data-testid="input-phone"
                                />
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
                              <FormLabel className="text-gray-700 font-medium">Mesajınız *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                  placeholder="Lütfen köpeğinizin yaşı, cinsi ve eğitim ihtiyacınız hakkında bilgi veriniz..."
                                  data-testid="textarea-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]"
                          disabled={contactMutation.isPending}
                          data-testid="button-submit"
                        >
                          {contactMutation.isPending ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Gönderiliyor...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Send className="w-4 h-4 mr-2" />
                              MESAJ GÖNDER
                            </div>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 mobile-footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Aytaç Mert - Köpek Eğitimi Akademisi</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                15 yıldan fazla deneyimimizle köpeğinizin eğitimi konusunda profesyonel destek sunuyoruz. 
                Modern eğitim teknikleri ile köpeğinizin potansiyelini ortaya çıkarıyoruz.
              </p>
              <div className="flex space-x-4">
                <a href="https://wa.me/905532658445" target="_blank" rel="noopener noreferrer" 
                   className="text-green-400 hover:text-green-300 transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="mailto:aytacmert35@gmail.com" 
                   className="text-blue-400 hover:text-blue-300 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Hızlı Erişim</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Ana Sayfa</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +90 553 265 84 45
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  aytacmert35@gmail.com
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  İzmir, Türkiye
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Aytaç Mert Köpek Eğitimi Akademisi. Tüm hakları saklıdır.</p>
            <p className="mt-2 text-sm">Design by <span className="text-white font-semibold">Professional Web Solutions</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}