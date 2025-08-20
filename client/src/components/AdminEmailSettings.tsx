import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

export function AdminEmailSettings() {
  const [testEmail, setTestEmail] = useState('');
  const { toast } = useToast();

  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        body: JSON.stringify({ testEmail: email }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Test email failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Test Email Gönderildi',
        description: 'Konsol loglarını kontrol edin.',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Email gönderimi başarısız oldu.',
        variant: 'destructive'
      });
    }
  });

  const handleTestEmail = () => {
    if (!testEmail) {
      toast({
        title: 'Uyarı',
        description: 'Lütfen test email adresi girin.',
        variant: 'destructive'
      });
      return;
    }
    testEmailMutation.mutate(testEmail);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Ayarları</CardTitle>
        <CardDescription>
          Email sistemini test edin ve yapılandırın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Adresi</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            data-testid="input-test-email"
          />
        </div>
        
        <Button 
          onClick={handleTestEmail}
          disabled={testEmailMutation.isPending}
          data-testid="button-test-email"
        >
          {testEmailMutation.isPending ? 'Gönderiliyor...' : 'Test Email Gönder'}
        </Button>

        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Email Teslim Sorunu
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Şu anda email sistemi development modunda çalışıyor. Şifre sıfırlama linkleri
            konsol loglarında görünecek. SMTP sunucunuz blacklist probleminden dolayı
            email'ler teslim edilemiyor olabilir.
          </p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Önerilen Çözümler
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Hosting sağlayıcınızdan IP blacklist kontrolü isteyin</li>
            <li>• SendGrid, Mailgun gibi email servislerini değerlendirin</li>
            <li>• SPF, DKIM, DMARC kayıtlarını kontrol ettirin</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}