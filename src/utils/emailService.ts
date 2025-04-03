import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_APP_PASSWORD) {
  console.error('Missing Zoho email credentials in environment variables');
  throw new Error('Zoho email credentials not configured');
}

const transporter = nodemailer.createTransport({
  service:"smtppro.zoho.in",
  host: 'smtppro.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

export const sendWelcomeEmail = async (toEmail: string, firstName: string) => {
  try {
    console.log('Attempting to send email from:', process.env.ZOHO_EMAIL);
    console.log('To:', toEmail);
    
    const mailOptions = {
      from: process.env.ZOHO_EMAIL,
      to: toEmail,
      subject: 'Welcome to CodeMate!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to CodeMate, ${firstName}! 👋</h1>
          <p>Thank you for joining our community of developers. We're excited to have you on board!</p>
          <p>With CodeMate, you can:</p>
          <ul>
            <li>Connect with other developers</li>
            <li>Share your knowledge</li>
            <li>Collaborate on projects</li>
            <li>Learn and grow together</li>
          </ul>
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The CodeMate Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        name: error.name,
        stack: error.stack,
      };
    }
    return { success: false, error: String(error) };
  }
}; 