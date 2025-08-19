import nodemailer from 'nodemailer';

// Custom SMTP configuration for aytacmert.com
const transporter = nodemailer.createTransport({
  host: 'mail.aytacmert.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'info@aytacmert.com',
    pass: 'Aytacmert123!'
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  rateLimit: 5, // Limit to 5 emails per second
  dkim: {
    domainName: 'aytacmert.com',
    keySelector: 'default',
    privateKey: false
  }
});

export interface WelcomeEmailData {
  firstName: string;
  email: string;
  password: string;
}

export async function sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
  try {
    const mailOptions = {
      from: '"Aytaç Mert Köpek Eğitimi AKADEMİSİ" <info@aytacmert.com>',
      to: userData.email,
      subject: 'AYTAÇ MERT KÖPEK EĞİTİMİ AKADEMİSİ - Hoşgeldiniz!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">
              AYTAÇ MERT KÖPEK EĞİTİMİ AKADEMİSİ
            </h1>
            <p style="color: #666; font-size: 16px;">Hoşgeldiniz!</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Merhaba ${userData.firstName},
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              AYTAÇ MERT KÖPEK EĞİTİMİ AKADEMİSİ portalında yeni bir hesap oluşturuldu.
              Hesap bilgileriniz aşağıdaki gibidir:
            </p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${userData.email}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Şifre:</strong> ${userData.password}</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hesabınıza giriş yapmak için lütfen buraya tıklayınız: 
              <a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/` : 'http://localhost:5000/'}" 
                 style="color: #007bff; text-decoration: none;">
                Giriş Yap
              </a>
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 20px;">
              Saygılar,<br>
              AYTAÇ MERT KÖPEK EĞİTİMİ AKADEMİSİ
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            <p>© 2024 Aytaç Mert Köpek Eğitimi AKADEMİSİ. Tüm hakları saklıdır.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
  try {
    const baseUrl = process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
      : 'http://localhost:5000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: '"Aytaç Mert Köpek Eğitimi AKADEMİSİ" <info@aytacmert.com>',
      to: userEmail,
      subject: 'Şifre Yenileme Talebi - Aytaç Mert Köpek Eğitimi AKADEMİSİ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">
              AYTAÇ MERT KÖPEK EĞİTİMİ AKADEMİSİ
            </h1>
            <p style="color: #666; font-size: 16px;">Şifre Yenileme Talebi</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Sayın Üyemiz,
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hesabınız için şifre yenileme talebinde bulundunuz. Yeni şifrenizi belirlemek için 
              aşağıdaki butona tıklayarak işlemi tamamlayabilirsiniz:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #28a745; color: white; padding: 15px 40px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block; font-size: 16px;">
                Şifremi Yenile
              </a>
            </div>
            
            <p style="color: #333; font-size: 14px; line-height: 1.6;">
              • Bu bağlantı güvenlik nedeniyle 60 dakika sonra geçerliliğini yitirecektir.
            </p>
            
            <p style="color: #333; font-size: 14px; line-height: 1.6;">
              • Bu talep sizin tarafınızdan yapılmadıysa, bu mesajı görmezden gelebilirsiniz.
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 25px;">
              İyi günler dileriz,<br>
              <strong>AYTAÇ MERT KÖPEK EĞİTİMİ AKADEMİSİ</strong><br>
              <span style="color: #666; font-size: 14px;">Teknik Destek Ekibi</span>
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p><strong>İletişim:</strong> info@aytacmert.com</p>
            <p>© 2024 Aytaç Mert Köpek Eğitimi AKADEMİSİ. Tüm hakları saklıdır.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}