import nodemailer from 'nodemailer';

// Proper SMTP configuration using mail.aytacmert.com
const transporter = nodemailer.createTransport({
  host: 'mail.aytacmert.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'info@aytacmert.com',
    pass: 'Aytacmert123!'
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000,
  socketTimeout: 60000,
  logger: true,
  debug: true
} as any);

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
      from: 'info@aytacmert.com',
      to: userEmail,
      subject: 'Account Update',
      headers: {
        'X-Originating-IP': '[127.0.0.1]',
        'X-Mailer': 'PHP/8.1.0',
        'X-Priority': '3 (Normal)',
        'Return-Path': 'info@aytacmert.com'
      },
      text: `Hello,

Please use the following link to update your account information:
${resetUrl}

Best regards,
Aytac Mert Academy Team
info@aytacmert.com`,

    };

    console.log('Attempting to send email to:', userEmail);
    console.log('Reset URL:', resetUrl);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    console.log('Email result details:', {
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response
    });
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}