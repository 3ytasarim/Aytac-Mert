import nodemailer from 'nodemailer';

// Custom SMTP configuration for aytacmert.com
const transporter = nodemailer.createTransport({
  host: 'mail.aytacmert.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'info@aytacmert.com',
    pass: 'Aytacmert123!'
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
      from: '"Aytaç Mert Köpek Eğitimi Akademisi" <info@aytacmert.com>',
      to: userData.email,
      subject: 'AYTAÇ MERT EĞİTİM KURUMLARI Akademisi - Hoşgeldiniz!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">
              AYTAÇ MERT EĞİTİM KURUMLARI Akademisi
            </h1>
            <p style="color: #666; font-size: 16px;">Hoşgeldiniz!</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Merhaba ${userData.firstName},
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              AYTAÇ MERT EĞİTİM KURUMLARI Akademisi portalında yeni bir hesap oluşturuldu.
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
              AYTAÇ MERT EĞİTİM KURUMLARI Akademisi
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            <p>© 2024 Aytaç Mert Köpek Eğitimi Akademisi. Tüm hakları saklıdır.</p>
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
      from: '"Aytaç Mert Köpek Eğitimi Akademisi" <info@aytacmert.com>',
      to: userEmail,
      subject: 'Şifre Sıfırlama - Aytaç Mert Köpek Eğitimi Akademisi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">
              AYTAÇ MERT EĞİTİM KURUMLARI Akademisi
            </h1>
            <p style="color: #666; font-size: 16px;">Şifre Sıfırlama</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Merhaba,
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için 
              aşağıdaki bağlantıya tıklayınız:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; 
                        display: inline-block;">
                Şifremi Sıfırla
              </a>
            </div>
            
            <p style="color: #333; font-size: 14px; line-height: 1.6;">
              Bu bağlantı güvenlik nedeniyle 1 saat içinde geçerliliğini yitirecektir.
            </p>
            
            <p style="color: #333; font-size: 14px; line-height: 1.6;">
              Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 20px;">
              Saygılar,<br>
              AYTAÇ MERT EĞİTİM KURUMLARI Akademisi
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            <p>© 2024 Aytaç Mert Köpek Eğitimi Akademisi. Tüm hakları saklıdır.</p>
            <p>Bu link sadece sizin için özeldir. Lütfen kimseyle paylaşmayınız.</p>
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