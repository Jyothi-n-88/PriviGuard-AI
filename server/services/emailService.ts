import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, otp: string): Promise<void> => {
  const mode = process.env.EMAIL_MODE || 'development';
  const from = process.env.EMAIL_FROM || 'PriviGuard AI <no-reply@example.com>';

  const mailOptions = {
    from,
    to: email,
    subject: 'PriviGuard AI - Verify Your Account',
    html: `
      <h2>Welcome to PriviGuard AI</h2>
      <p>Thank you for registering. Your verification code is:</p>
      <h3 style="font-size: 24px; letter-spacing: 4px; padding: 12px; background: #f1f5f9; border-radius: 8px; display: inline-block;">${otp}</h3>
      <p>The code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  if (mode === 'development') {
    // In development mode, we log the email content and token to the console
    // so we can test without a real email provider.
    console.log('=============================================');
    console.log('[DEVELOPMENT MODE] Verification Email Details:');
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('=============================================');

    // Optionally, if you have a dev SMTP like Ethereal or Mailtrap, you can configure it here.
    // We will just return to pretend it was sent.
    return;
  }

  // Production mode
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
