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
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <style>
    /* Force RTL direction for all elements */
    html, body, * {
      direction: rtl !important;
      text-align: right !important;
    }
    @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
    
    /* Force light mode - prevent dark mode from changing colors */
    :root {
      color-scheme: light only !important;
      supported-color-schemes: light only !important;
    }
    
    html {
      color-scheme: light only !important;
      supported-color-schemes: light only !important;
      background-color: #FFFCF8 !important;
    }
    
    * {
      color-scheme: light only !important;
    }
    
    body {
      font-family: 'Varela Round', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.8;
      color: #262135 !important;
      background-color: #FFFCF8 !important;
      margin: 0;
      padding: 0;
      direction: rtl !important;
      text-align: right !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Prevent dark mode media query from affecting styles */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #FFFCF8 !important;
        color: #262135 !important;
      }
      
      .email-container {
        background: linear-gradient(to bottom right, #E6F19A, #BBE9FD) !important;
        background-color: #FFFCF8 !important;
      }
      
      .email-content {
        background-color: #FFFCF8 !important;
      }
      
      .content {
        color: #494358 !important;
      }
      
      .button {
        background-color: #273143 !important;
        color: #FFFFFF !important;
      }
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(to bottom right, #E6F19A, #BBE9FD) !important;
      background-color: #FFFCF8 !important;
      padding: 20px;
      min-height: auto !important;
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
      direction: rtl !important;
      text-align: right !important;
    }
    
    .email-content {
      background-color: #FFFCF8 !important;
      border-radius: 18px;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      padding: 40px 30px;
      margin: 20px 0;
      min-height: auto !important;
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
      position: relative;
      direction: rtl !important;
      text-align: right !important;
    }
    
    .header {
      text-align: center;
      margin-bottom: 15px;
      position: relative;
      display: inline-block;
      width: 100%;
    }
    
    .logo-container {
      position: relative;
      display: inline-block;
      margin: 0 auto;
      width: 100%;
      text-align: center;
    }
    
    .logo-img {
      height: 51px;
      width: auto;
      max-width: 170px;
      /* Force dark blue color - always #273143 regardless of dark/light mode */
      filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      margin: 0 auto;
      /* Prevent any color inversion from dark mode */
      -webkit-filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important;
      -moz-filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important;
      /* Prevent dark mode from inverting the logo */
      image-rendering: -webkit-optimize-contrast !important;
      image-rendering: crisp-edges !important;
      -webkit-appearance: none !important;
      appearance: none !important;
      border: 0;
      outline: none;
      /* Gmail compatibility - maintain aspect ratio */
      height: 51px !important;
      width: auto !important;
      max-width: 170px !important;
      max-height: 51px !important;
      object-fit: contain !important;
      /* Force light mode for logo */
      color-scheme: light only !important;
      /* Prevent Chrome from applying any color transformations */
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
    
    @media (prefers-color-scheme: dark) {
      .logo-img {
        filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important;
        -webkit-filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important;
        -moz-filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important;
      }
    }
    
    /* Chrome-specific fixes for logo filter */
    @supports (-webkit-appearance: none) {
      .logo-img {
        will-change: filter;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
      }
    }
    
    .piggy-img {
      position: absolute;
      left: 50%;
      top: -10%;
      transform: translateX(-50%);
      margin-left: 100px;
      height: 80px;
      width: auto;
      z-index: 0;
      opacity: 0.7;
      border: 0;
      outline: none;
      display: block;
    }
    
    .content {
      font-size: 16px;
      color: #494358 !important;
      line-height: 1.8;
      margin-bottom: 30px;
      overflow: visible !important;
      text-overflow: clip !important;
      white-space: normal !important;
      min-height: auto !important;
      max-height: none !important;
      height: auto !important;
      display: block !important;
      -webkit-line-clamp: none !important;
      line-clamp: none !important;
      -webkit-box-orient: horizontal !important;
      box-orient: horizontal !important;
      font-family: 'Varela Round', sans-serif !important;
      text-align: right !important;
    }
    
    .content p {
      margin-bottom: 15px;
      overflow: visible !important;
      text-overflow: clip !important;
      white-space: normal !important;
      max-height: none !important;
      height: auto !important;
      display: block !important;
      -webkit-line-clamp: none !important;
      line-clamp: none !important;
      -webkit-box-orient: horizontal !important;
      box-orient: horizontal !important;
    }
    
    /* Force desktop to show all content */
    @media screen and (min-width: 601px) {
      .email-container {
        min-height: auto !important;
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
      }
      
      .email-content {
        min-height: auto !important;
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
      }
      
      .content {
        min-height: auto !important;
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        display: block !important;
        -webkit-line-clamp: none !important;
        line-clamp: none !important;
      }
      
      .content p {
        min-height: auto !important;
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        display: block !important;
        -webkit-line-clamp: none !important;
        line-clamp: none !important;
      }
    }
    
    .button-container {
      text-align: center !important;
      margin: 30px 0;
      direction: rtl !important;
    }
    
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #273143 !important;
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 18px;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Varela Round', sans-serif;
      transition: background-color 0.3s;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
      /* Force white text - prevent dark mode from changing to blue */
      -webkit-text-fill-color: #FFFFFF !important;
      text-fill-color: #FFFFFF !important;
    }
    
    .button:hover {
      background-color: #1a2330 !important;
      color: #FFFFFF !important;
      -webkit-text-fill-color: #FFFFFF !important;
      text-fill-color: #FFFFFF !important;
    }
    
    .button:visited {
      color: #FFFFFF !important;
      -webkit-text-fill-color: #FFFFFF !important;
      text-fill-color: #FFFFFF !important;
    }
    
    .button:link {
      color: #FFFFFF !important;
      -webkit-text-fill-color: #FFFFFF !important;
      text-fill-color: #FFFFFF !important;
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
        height: 43px !important;
        width: auto !important;
        max-width: 144px !important;
        object-fit: contain !important;
      }
      
      .piggy-img {
        height: 60px !important;
        width: 60px !important;
        left: 50%;
        top: -8%;
        transform: translateX(-50%);
        margin-left: 85px;
      }
    }
  </style>
</head>
<body style="background-color: #FFFCF8 !important; color: #262135 !important; color-scheme: light only !important; margin: 0; padding: 0; direction: rtl !important; text-align: right !important;">
  <!--[if mso]>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFCF8;">
    <tr>
      <td align="center" style="padding: 20px; background-color: #FFFCF8;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background: linear-gradient(to bottom right, #E6F19A, #BBE9FD); border-radius: 18px; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);">
          <tr>
            <td style="padding: 40px 30px; background-color: #FFFCF8;">
  <![endif]-->
  <div class="email-container" style="background: linear-gradient(to bottom right, #E6F19A, #BBE9FD) !important; background-color: #FFFCF8 !important; color-scheme: light only !important; min-height: auto !important; max-height: none !important; height: auto !important; overflow: visible !important; direction: rtl !important; text-align: right !important;">
    <div class="email-content" style="background-color: #FFFCF8 !important; color: #262135 !important; min-height: auto !important; max-height: none !important; height: auto !important; overflow: visible !important; direction: rtl !important; text-align: right !important;">
      <div class="header">
        <div class="logo-container">
          <!--[if mso]>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center">
                <img src="${logoUrl}" alt="Joystie Logo" height="51" style="display: block; border: 0; outline: none; margin: 0 auto; width: auto; max-width: 170px; object-fit: contain;" />
              </td>
            </tr>
          </table>
          <![endif]-->
          <!--[if !mso]><!-->
          <img src="${logoUrl}" alt="Joystie" height="51" class="logo-img" role="presentation" referrerpolicy="no-referrer" style="position: relative; z-index: 1; filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important; -webkit-filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important; -moz-filter: brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%) !important; border: 0; outline: none; display: block !important; visibility: visible !important; opacity: 1 !important; height: 51px !important; width: auto !important; max-width: 170px !important; max-height: 51px !important; margin: 0 auto; object-fit: contain !important; color-scheme: light only !important; image-rendering: -webkit-optimize-contrast !important; image-rendering: crisp-edges !important; -webkit-appearance: none !important; appearance: none !important;" />
          <!--<![endif]-->
          <!--[if mso]>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="position: relative;">
            <tr>
              <td align="center" style="position: relative;">
                <img src="${piggyUrl}" alt="Piggy Bank" width="80" height="80" style="display: block; border: 0; outline: none; opacity: 0.7; position: absolute; left: 50%; top: -10%; margin-left: 100px;" />
              </td>
            </tr>
          </table>
          <![endif]-->
          <!--[if !mso]><!-->
          <img src="${piggyUrl}" alt="" width="80" height="80" class="piggy-img" role="presentation" referrerpolicy="no-referrer" style="border: 0; outline: none; display: block; position: absolute; left: 50%; top: -10%; transform: translateX(-50%); margin-left: 100px; height: 80px; width: 80px; z-index: 0; opacity: 0.7;" />
          <!--<![endif]-->
        </div>
      </div>
      
      <div class="content" style="color: #494358 !important; overflow: visible !important; text-overflow: clip !important; white-space: normal !important; min-height: auto !important; max-height: none !important; height: auto !important; display: block !important; -webkit-line-clamp: none !important; line-clamp: none !important;">
        ${content}
      </div>
      
      ${buttonText && buttonUrl ? `
      <div class="button-container">
        <a href="${buttonUrl}" class="button" style="background-color: #273143 !important; color: #FFFFFF !important; -webkit-text-fill-color: #FFFFFF !important; text-fill-color: #FFFFFF !important;">${buttonText}</a>
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
  <!--[if mso]>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <![endif]-->
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

