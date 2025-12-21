/**
 * Email sending utilities for Firebase Functions
 * Supports multiple email providers: SendGrid API and Google Workspace SMTP
 *
 * The service automatically selects the provider based on SERVICE_FUNCTION_EMAIL_SERVICE environment variable:
 * - 'sendgrid' - Uses SendGrid API (requires SERVICE_FUNCTION_SENDGRID_API_KEY)
 * - 'workspace' or 'gmail' - Uses Google Workspace/Gmail SMTP (requires SERVICE_FUNCTION_EMAIL_USER and SERVICE_FUNCTION_EMAIL_PASSWORD)
 *
 * SETUP INSTRUCTIONS:
 *
 * For SendGrid:
 * 1. Sign up at https://sendgrid.com
 * 2. Create API key in SendGrid dashboard
 * 3. Set secrets:
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_SERVICE=sendgrid
 *    firebase functions:secrets:set SERVICE_FUNCTION_SENDGRID_API_KEY=<your-api-key>
 *
 * For Google Workspace:
 * 1. Use an existing Google Workspace account (no need to create new user)
 * 2. Enable 2-factor authentication on that account
 * 3. Generate App Password: https://myaccount.google.com/apppasswords
 * 4. Set secrets:
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_SERVICE=workspace
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_USER=<your-existing-email@joystie.com>
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_PASSWORD=<app-password>
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_FROM=notifications@joystie.com (optional - for display name)
 */

import * as sgMail from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// Email service configuration
const EMAIL_SERVICE = process.env.SERVICE_FUNCTION_EMAIL_SERVICE || 'workspace';
const SENDGRID_API_KEY = process.env.SERVICE_FUNCTION_SENDGRID_API_KEY;
const EMAIL_USER = process.env.SERVICE_FUNCTION_EMAIL_USER;
const EMAIL_PASSWORD = process.env.SERVICE_FUNCTION_EMAIL_PASSWORD;

// Initialize SendGrid if configured
if (EMAIL_SERVICE === 'sendgrid' && SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
  verify?(): Promise<boolean>;
}

/**
 * SendGrid provider implementation
 */
class SendGridProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<void> {
    if (!SENDGRID_API_KEY) {
      throw new Error(
        'SERVICE_FUNCTION_SENDGRID_API_KEY not configured. Set it using: firebase functions:secrets:set SERVICE_FUNCTION_SENDGRID_API_KEY'
      );
    }

    try {
      // Use SERVICE_FUNCTION_EMAIL_FROM if set, otherwise default to notifications@joystie.com
      const fromEmail = process.env.SERVICE_FUNCTION_EMAIL_FROM || 'notifications@joystie.com';
      const msg = {
        to: options.to,
        from: {
          email: fromEmail,
          name: 'Joystie',
        },
        replyTo: 'info@joystie.com',
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      await sgMail.send(msg);
      console.log('[Email] Email sent successfully via SendGrid:', {
        to: options.to,
        subject: options.subject,
      });
    } catch (error: any) {
      console.error('[Email] SendGrid error:', error);
      if (error.response) {
        console.error('[Email] SendGrid error details:', error.response.body);
      }
      throw new Error(`Failed to send email via SendGrid: ${error.message}`);
    }
  }

  async verify(): Promise<boolean> {
    return !!SENDGRID_API_KEY;
  }
}

/**
 * Google Workspace SMTP provider implementation
 */
class WorkspaceSMTPProvider implements EmailProvider {
  private transporter: Transporter | null = null;

  getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      throw new Error(
        'SERVICE_FUNCTION_EMAIL_USER and SERVICE_FUNCTION_EMAIL_PASSWORD not configured. ' +
          'Set them using: firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_USER and SERVICE_FUNCTION_EMAIL_PASSWORD'
      );
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD, // App Password from Google Workspace
      },
    });

    return this.transporter;
  }

  async send(options: EmailOptions): Promise<void> {
    const transporter = this.getTransporter();

    try {
      // Use SERVICE_FUNCTION_EMAIL_FROM if set, otherwise use EMAIL_USER
      const fromEmail = process.env.SERVICE_FUNCTION_EMAIL_FROM || EMAIL_USER;
      const mailOptions = {
        from: `"Joystie" <${fromEmail}>`,
        to: options.to,
        replyTo: 'info@joystie.com',
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[Email] Email sent successfully via Google Workspace SMTP:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
    } catch (error: any) {
      console.error('[Email] Google Workspace SMTP error:', error);
      throw new Error(`Failed to send email via Google Workspace: ${error.message}`);
    }
  }

  async verify(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('[Email] Google Workspace SMTP configuration verified');
      return true;
    } catch (error: any) {
      console.error('[Email] Google Workspace SMTP verification failed:', error);
      return false;
    }
  }
}

/**
 * Get email provider based on configuration
 */
function getEmailProvider(): EmailProvider {
  switch (EMAIL_SERVICE.toLowerCase()) {
    case 'sendgrid':
      return new SendGridProvider();
    case 'workspace':
    case 'gmail':
      return new WorkspaceSMTPProvider();
    default:
      console.warn(
        `[Email] Unknown EMAIL_SERVICE: ${EMAIL_SERVICE}, defaulting to workspace`
      );
      return new WorkspaceSMTPProvider();
  }
}

/**
 * Send email using configured provider (abstraction layer)
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const provider = getEmailProvider();
  await provider.send(options);
}

/**
 * Generate HTML email template with app styling
 */
export function generateEmailHTML(
  title: string,
  content: string,
  buttonText?: string,
  buttonUrl?: string,
  baseUrl?: string
): string {
  const logoUrl = baseUrl ? `${baseUrl}/logo-joystie.png` : 'https://joystie.com/logo-joystie.png';
  const piggyUrl = baseUrl ? `${baseUrl}/piggy-bank.png` : 'https://joystie.com/piggy-bank.png';
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
    
    /* Force light mode - prevent dark mode from changing colors */
    :root {
      color-scheme: light;
    }
    
    html {
      color-scheme: light !important;
    }
    
    body {
      font-family: 'Varela Round', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.8;
      color: #262135 !important;
      background: 
        radial-gradient(at 0% 0%, rgba(45, 50, 60, 0.3) 0%, transparent 50%),
        radial-gradient(at 100% 0%, rgba(135, 206, 250, 0.4) 0%, transparent 50%),
        radial-gradient(at 0% 100%, rgba(154, 205, 50, 0.3) 0%, transparent 50%),
        radial-gradient(at 100% 100%, rgba(64, 224, 208, 0.3) 0%, transparent 50%),
        linear-gradient(135deg, rgba(250, 245, 240, 0.8) 0%, rgba(240, 248, 255, 0.9) 100%),
        #FFFCF8 !important;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: 
        radial-gradient(at 0% 0%, rgba(45, 50, 60, 0.3) 0%, transparent 50%),
        radial-gradient(at 100% 0%, rgba(135, 206, 250, 0.4) 0%, transparent 50%),
        radial-gradient(at 0% 100%, rgba(154, 205, 50, 0.3) 0%, transparent 50%),
        radial-gradient(at 100% 100%, rgba(64, 224, 208, 0.3) 0%, transparent 50%),
        linear-gradient(135deg, rgba(250, 245, 240, 0.8) 0%, rgba(240, 248, 255, 0.9) 100%),
        #FFFCF8 !important;
      padding: 20px;
    }
    
    .email-content {
      background-color: #FFFCF8 !important;
      border-radius: 18px;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      padding: 40px 30px;
      margin: 20px 0;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
      display: inline-block;
      width: 100%;
    }
    
    .logo-container {
      position: relative;
      display: inline-block;
      margin: 0 auto;
    }
    
    .logo-img {
      height: 60px;
      width: auto;
      max-width: 200px;
      /* Force dark blue color - always #273143 regardless of dark/light mode */
      filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important;
      display: block;
      /* Prevent any color inversion from dark mode */
      -webkit-filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important;
    }
    
    .piggy-img {
      position: absolute;
      right: -20%;
      bottom: -20%;
      height: 50px;
      width: auto;
      z-index: 0;
      opacity: 0.6;
    }
    
    .content {
      font-size: 16px;
      color: #494358;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    
    .content p {
      margin-bottom: 15px;
    }
    
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #273143;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 18px;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Varela Round', sans-serif;
      transition: background-color 0.3s;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
    }
    
    .button:hover {
      background-color: #1a2330;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E0E0E0;
      font-size: 12px;
      color: #948DA9;
    }
    
    .highlight {
      background-color: #E6F19A;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    
    @media only screen and (max-width: 600px) {
      .email-container {
        padding: 10px;
      }
      
      .email-content {
        padding: 30px 20px;
        border-radius: 12px;
      }
      
      .content {
        font-size: 14px;
      }
      
      .button {
        padding: 12px 24px;
        font-size: 14px;
        display: block;
        margin: 10px 0;
      }
      
      .logo-img {
        height: 50px;
      }
      
      .piggy-img {
        height: 40px;
        right: -15%;
        bottom: -15%;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-content">
      <div class="header">
        <div class="logo-container">
          <img src="${logoUrl}" alt="Joystie" class="logo-img" style="position: relative; z-index: 1;" />
          <img src="${piggyUrl}" alt="Piggy Bank" class="piggy-img" />
        </div>
      </div>
      
      <div class="content">
        ${content}
      </div>
      
      ${buttonText && buttonUrl ? `
      <div class="button-container">
        <a href="${buttonUrl}" class="button">${buttonText}</a>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>זוהי הודעה אוטומטית מ-Joystie</p>
        <p>אם יש לך שאלות, תוכל/י לענות למייל הזה ונחזור אליך בהקדם</p>
        <p style="margin-top: 15px; font-size: 11px; color: #948DA9;">
          © ${new Date().getFullYear()} Joystie. כל הזכויות שמורות.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send notification email to parent
 */
export async function sendNotificationEmail(
  parentEmail: string,
  title: string,
  content: string,
  buttonText?: string,
  buttonUrl?: string,
  baseUrl?: string
): Promise<void> {
  const html = generateEmailHTML(title, content, buttonText, buttonUrl, baseUrl);
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML for text version

  await sendEmail({
    to: parentEmail,
    subject: title,
    html,
    text,
  });
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const provider = getEmailProvider();
    if (provider.verify) {
      return await provider.verify();
    }
    return true;
  } catch (error: any) {
    console.error('[Email] Email configuration verification failed:', error);
    return false;
  }
}

