import nodemailer from 'nodemailer';

// Aytacmert.com SMTP configuration (optimized for deliverability)
const transporter = nodemailer.createTransport({
  host: 'mail.aytacmert.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@aytacmert.com',
    pass: 'Aytacmert123!'
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  socketTimeout: 45000,
  logger: false,
  debug: false
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
      subject: 'Kullanici Sifre Yenileme Talebi',
      replyTo: 'info@aytacmert.com',
      headers: {
        'X-Mailer': 'Aytac Mert Education System',
        'X-Priority': '3',
        'List-Unsubscribe': '<mailto:info@aytacmert.com>',
        'Message-ID': `<${Date.now()}@aytacmert.com>`
      },
      text: `
        Sayin uyemiz,
        
        Hesabiniz icin sifre yenileme talebinde bulundunuz.
        
        Sifrenizi yenilemek icin asagidaki baglantiya tiklayin:
        ${resetUrl}
        
        Bu baglanti 60 dakika sonra gecerliligi kaybolacaktir.
        
        Bu talep sizin tarafinizdan yapilmadiysa, bu mesaji gormezden gelebilirsiniz.
        
        Saygılar,
        AYTAC MERT KOPEK EGITIMI AKADEMISI
        info@aytacmert.com
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h2 style="color: #2c3e50; font-size: 22px; margin: 0;">
              AYTAC MERT KOPEK EGITIMI AKADEMISI
            </h2>
            <p style="color: #6c757d; font-size: 14px; margin: 5px 0 0 0;">Kullanici Sifre Yenileme</p>
          </div>
          
          <div style="padding: 25px; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              Sayin uyemiz,
            </p>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Hesabiniz icin sifre yenileme talebinde bulundunuz. Yeni sifrenizi belirlemek icin 
              asagidaki dugmeye tiklayiniz:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: #ffffff; padding: 14px 28px; 
                        text-decoration: none; border-radius: 6px; font-weight: 600; 
                        display: inline-block; font-size: 15px; border: none;">
                Sifremi Yenile
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 13px; line-height: 1.5; margin: 20px 0 5px 0;">
              Bu baglanti guvenlik nedeniyle 60 dakika sonra gecerliligi yitirecektir.
            </p>
            
            <p style="color: #6c757d; font-size: 13px; line-height: 1.5; margin: 5px 0 20px 0;">
              Bu talep sizin tarafinizdan yapilmadiysa, bu mesaji gormezden gelebilirsiniz.
            </p>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #495057; font-size: 15px; line-height: 1.4; margin: 0;">
                Saygılar,<br>
                <strong>AYTAC MERT KOPEK EGITIMI AKADEMISI</strong>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="color: #6c757d; font-size: 12px; margin: 5px 0;">
              İletişim: info@aytacmert.com
            </p>
            <p style="color: #6c757d; font-size: 12px; margin: 5px 0;">
              © 2024 Aytac Mert Kopek Egitimi Akademisi
            </p>
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