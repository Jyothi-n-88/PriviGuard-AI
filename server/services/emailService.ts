import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, verificationToken: string): Promise<void> => {
  const mode = process.env.EMAIL_MODE || 'development';
  const from = process.env.EMAIL_FROM || 'PriviGuard AI <no-reply@example.com>';

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from,
    to: email,
    subject: 'PriviGuard AI - Verify Your Account',
    html: `
      <h2>Welcome to PriviGuard AI</h2>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  if (mode === 'development') {
    // In development mode, we log the email content and token to the console
    // so we can test without a real email provider.
    console.log('=============================================');
    console.log('[DEVELOPMENT MODE] Verification Email Details:');
    console.log(`To: ${email}`);
    console.log(`Token: ${verificationToken}`);
    console.log(`Verification URL: ${verificationUrl}`);
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
