import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Gizlilik ve Kullanım Sözleşmesi
          </DialogTitle>
          <DialogDescription>
            AYTAÇ MERT EĞİTİM KURUMLARI Akademisi gizlilik ve kullanım koşulları
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. GİZLİLİK POLİTİKASI</h3>
              <p className="mb-4">
                AYTAÇ MERT EĞİTİM KURUMLARI olarak, kullanıcılarımızın gizliliğini korumak ve 
                kişisel verilerini güvenli bir şekilde işlemek önceliklerimizdir. Bu gizlilik 
                politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve 
                korunduğunu açıklamaktadır.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. TOPLANAN BİLGİLER</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Ad, soyad ve iletişim bilgileriniz</li>
                <li>E-posta adresiniz ve telefon numaranız</li>
                <li>T.C. Kimlik numaranız (gerekli durumlarda)</li>
                <li>Kurs kayıt ve ilerleme bilgileriniz</li>
                <li>Website kullanım verileri ve tercihleri</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. BİLGİLERİN KULLANIMI</h3>
              <p className="mb-4">Toplanan kişisel veriler aşağıdaki amaçlarla kullanılır:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Eğitim hizmetlerinin sağlanması ve yönetimi</li>
                <li>Kullanıcı hesaplarının oluşturulması ve güncellenmesi</li>
                <li>İletişim ve bilgilendirme faaliyetleri</li>
                <li>Hizmet kalitesinin artırılması ve geliştirilmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. BİLGİ GÜVENLİĞİ</h3>
              <p className="mb-4">
                Kişisel verileriniz, endüstri standartlarında güvenlik önlemleriyle korunmaktadır. 
                Verilerinize yetkisiz erişimi, kullanımı veya ifşasını önlemek için gerekli 
                teknik ve idari tedbirler alınmıştır.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. ÜÇÜNCÜ TARAFLARLA PAYLAŞIM</h3>
              <p className="mb-4">
                Kişisel verileriniz, yasal zorunluluklar haricinde üçüncü taraflarla paylaşılmaz. 
                Hizmet sağlayıcıları ile paylaşım durumunda, aynı gizlilik standartlarının 
                uygulanması sağlanır.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. KULLANICI HAKLARI</h3>
              <p className="mb-4">KVKK kapsamında sahip olduğunuz haklar:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                <li>Verilerinizin düzeltilmesini veya silinmesini isteme</li>
                <li>Verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Otomatik sistemlerle analiz sonucu aleyhte sonuçlara itiraz etme</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. KULLANIM KOŞULLARI</h3>
              <p className="mb-4">
                Bu platform, köpek eğitimi hizmetlerinin sunulması amacıyla oluşturulmuştur. 
                Kullanıcılar, platformu yalnızca yasal ve etik amaçlarla kullanmayı kabul ederler.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. ÇEREZLER (COOKIES)</h3>
              <p className="mb-4">
                Website'imizda kullanıcı deneyimini iyileştirmek için çerezler kullanılmaktadır. 
                Çerez kullanımı hakkında detaylı bilgiyi çerez politikamızda bulabilirsiniz.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">9. DEĞİŞİKLİKLER</h3>
              <p className="mb-4">
                Bu gizlilik politikası gerekli durumlarda güncellenebilir. Önemli değişiklikler 
                kullanıcılara bildirilir ve onayları alınır.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">10. İLETİŞİM</h3>
              <p className="mb-4">
                Gizlilik politikası ile ilgili sorularınız için:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>E-posta: info@aytacmert.com</li>
                <li>Telefon: +90 532 771 35 61</li>
                <li>Adres: Türkiye</li>
              </ul>
            </section>

            <section className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium">
                Bu sözleşmeyi kabul ederek, yukarıda belirtilen koşulları okuduğunuzu, 
                anladığınızı ve kabul ettiğinizi beyan edersiniz.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="px-8">
            Anladım
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}